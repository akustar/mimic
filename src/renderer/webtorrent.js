import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import config from '../config'
import path from 'path'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import parseTorrent from 'parse-torrent'
import WebTorrent from 'webtorrent'
import deepEqual from 'deep-equal'
import poster from './lib/poster'

const server = []
const currentWindow = remote.getCurrentWindow()

let prevProgress = null

// 모든 토렌트에 웹토렌트 트래커 강제사용
global.WEBTORRENT_ANNOUNCE = require('create-torrent').announceList
  .map((arr) => arr[0])
  .filter((url) => url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0)

// https://webtorrent.io/faq
const client = new WebTorrent()

function init () {
  ipcRenderer.on('wt-start-torrent', (event, ...args) => startTorrent(...args))
  ipcRenderer.on('wt-create-torrent', (event, ...args) => createTorrent(...args))
  ipcRenderer.on('wt-identifier-torrent', (event, ...args) => identifierTorrent(...args))
  ipcRenderer.on('wt-parse-torrent', (event, ...args) => parseTorrentFile(...args))
  ipcRenderer.on('wt-duplicate-torrent', (event, ...args) => duplicateTorrent(...args))
  ipcRenderer.on('wt-stop-torrent', (event, ...args) => stopTorrent(...args))
  ipcRenderer.on('wt-select-files', (event, ...args) => selectFiles(...args))
  ipcRenderer.on('wt-start-server', (event, ...args) => startServer(...args))
  ipcRenderer.on('wt-stop-server', (event, ...args) => stopServer(...args))
  
  setInterval(updateTorrentProgress, 1000)
}

function startTorrent (torrentKey, torrentId, downloadPath, selections, posterFilePath) {
  const torrent = client.add(torrentId, {
    path: downloadPath
  })
  torrent.key = torrentKey
  torrent.selections = selections
  fs.stat(posterFilePath || '', (error) => {
    if (!error) torrent.posterFilePath = posterFilePath
  })

  addTorrentEvents(torrent)
}

function createTorrent (torrentKey, downloadPath, options) {
  const torrent = client.seed(downloadPath, options)
  torrent.key = torrentKey
  torrent.selections = options.selections

  addTorrentEvents(torrent)
}

function addTorrentEvents (torrent) {
  torrent.on('metadata', metadata)
  torrent.on('ready', ready)
  torrent.on('done', done)
  torrent.on('warning', ({message}) => warning(message))
  torrent.on('error', ({message}) => error(message))

  function metadata () {
    const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
    const summary = getTorrentInfo(torrent)

    if (torrentSummary[torrent.key]) return

    // 다음 재시작을 위해 요약 정보를 파일에 저장합니다.
    torrentSummary[torrent.key] = summary
    ipcRenderer.send('set', 'torrents', torrentSummary)
  }

  function ready () {
    const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
    const summary = torrentSummary[torrent.key]

    // 다음 재시작을 위해 토렌트, 포스터파일을 따로 저장합니다.
    if (!summary.torrentFilePath) saveTorrentFile(torrent)
    if (!summary.posterFilePath) generateTorrentPoster(torrent)
  }

  function done () {
    const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
    // 상태 변경
    torrentSummary[torrent.key].status = 'Seeding'

    // 다음 재시작을 위해 요약 정보를 파일에 저장합니다.
    ipcRenderer.send('set', 'torrents', torrentSummary)
  }

  function error (message) {
    if (message) {
      ipcRenderer.send('wt-error', message)
    }

    console.log('wt-error: ', message)
  }

  function warning(message) {
    console.log('wt-warning: ', message)
  }
}

function parseTorrentFile (paths) {
  const parsed = paths.reduce((parsed, path) => {
    try {
      let parse = parseTorrent(fs.readFileSync(path))
      parse.selections = new Array(parse.files.length).fill(true)
      parse.torrentId = parse.infoHash

      parsed.push(parse)
    } catch (err) {
      ipcRenderer.send('wt-error', err.message)
    }

    return parsed
  }, [])

  if (parsed.length > 0) ipcRenderer.send('wt-parsed', parsed)
}

// 마그넷 주소 또는 발급번호(미정)를 전달받으면 다운로드를 시작합니다
function identifierTorrent(torrentId) {
  /*
    마그넷주소에는 일반적으로 메타데이터 정보가 포함되어있지 않기 때문에
    다운받기 전 파일을 선택하거나 토렌트 데이타 등을 보여 줄 수 없습니다
    따라서 약간의 편법을 이용해 새로운 웹토렌트를 만들고 메타데이타 이벤트에서 필요한 정보만 얻은 후 토렌트를 삭제합니다.
    ※ 이 작업은 파일로 다운받는 방법보다 1 ~ 2초 정도의 시간이 더 필요할 수 있습니다.
  */
  let _client = new WebTorrent()
  try {
    const summary = parseTorrent(torrentId)
    if (!isDuplicate(summary.infoHash)) {
      let timeout = false
      const downloads = ipcRenderer.sendSync('get', 'downloads')
      const torrent = _client.add(torrentId, {path: downloads})
      torrent.on('metadata', () => {
        timeout = true
        saveTorrentFile(torrent, (torrentFilePath) => {
          const downloadFilePath = path.join(downloads, torrent.name)
          
          // 토렌트를 분석합니다.
          parseTorrentFile([torrentFilePath])
          // 토렌트 분석이 완료되었고 client페이지로 정보를 보냈다면 임시로 저장한 토렌트를 삭제합니다.
          deleteFile([torrentFilePath, downloadFilePath])

          // 토렌트 삭제
          torrent.destroy()
          _client = null
        })
      })
      // 10초동안 연결이 안돼면 강제로 끊습니다.
      // 마그넷 정보가 잘못되었는지 아닌지 제대로 판단이 안돼는 경우가 있음
      // 예를들어 9485740A 라는 마그넷 주소에서 94740A 와 같이 중간에 몇글자를 빼버리는 경우 인식을 제대로 못함
      setTimeout(() => {
        if (!timeout) {
          torrent.destroy()
          _client = null

          ipcRenderer.send('wt-error', 'Timeout')
        }
      }, 10 * 1000)
    }
    else {
      ipcRenderer.send('wt-error', 'Cannot add duplicate torrent')
    }
  } catch (error) {
    ipcRenderer.send('wt-error', 'Identifier expected')
  }
}

function isDuplicate (infoHash) {
  const torrents = ipcRenderer.sendSync('get', 'torrents')
  for (const key in torrents) {
    if (torrents[key].infoHash === infoHash) {
      return true
    }
  }
  return false
}

function updateTorrentProgress () {
  const progress = getTorrentProgress()
  
  if (prevProgress && deepEqual(progress, prevProgress, {strict: true})) {
    return
  }
  
  ipcRenderer.send('wt-progress', progress)
  server.forEach((s, index) => ipcRenderer.send('wt-loading-parts', index, progress))

  prevProgress = progress
}

function getTorrentProgress () {
  const torrent = client.torrents[0]
  if (!torrent || !torrent.name) return
  return {
    fileProg: torrent.files && torrent.files.map((file, index) => {
      const numPieces = file._endPiece - file._startPiece + 1
      let numPiecesPresent = 0
      for (let piece = file._startPiece; piece <= file._endPiece; piece++) {
        if (torrent.bitfield.get(piece)) numPiecesPresent++
      }
      return {
        startPiece: file._startPiece,
        endPiece: file._endPiece,
        numPieces,
        numPiecesPresent
      }
    }),
    key: torrent.key,
    name: torrent.name,
    ready: torrent.ready,
    progress: torrent.progress,
    downloaded: torrent.downloaded,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    numPeers: torrent.numPeers,
    posterFilePath: torrent.posterFilePath,
    length: torrent.length,
    bitfield: torrent.bitfield
  }
}

function getTorrentInfo (torrent) {
  return {
    status: torrent.progress === 1 ? '업로드 중' : '다운로드 중',
    infoHash: torrent.infoHash,
    magnetURI: torrent.magnetURI,
    name: torrent.name,
    downloadPath: torrent.path,
    selections: torrent.selections,
    files: torrent.files.map(getTorrentFileInfo),
    torrentFilePath: torrent.torrentFilePath,
    posterFilePath: torrent.posterFilePath
  }
}

function getTorrentFileInfo (file) {
  return {
    name: file.name,
    length: file.length,
    path: file.path
  }
}

// 토렌트를 삭제합니다.
function stopTorrent (torrentKey, isAll = '') {
  const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
  const summary = torrentSummary[torrentKey]
  const {infoHash, downloadPath, name, torrentFilePath, posterFilePath} = summary
  const torrent = client.get(infoHash)
  const downloadFilePath = path.join(downloadPath, name)
  const deleteFiles = [posterFilePath, torrentFilePath]
  if (isAll.toUpperCase() === 'ALL') deleteFiles.push(downloadFilePath)
  
  if (torrent) {
    // 토렌트 제거
    torrent.destroy()
    // 다음 재시작을 위해 저장해두었던 토렌트 정보 제거
    delete torrentSummary[torrentKey]
    ipcRenderer.send('set', 'torrents', torrentSummary)
    // 토렌트 파일, 포스터 제거
    deleteFile(deleteFiles, () => {
      // 토렌트 정보를 모두 제거 했다면 현재 윈도우를 닫습니다.
      currentWindow.close()
    })
  }
}

// 스트리밍을 위한 서버를 엽니다.
function startServer (infoHash, ...args) {
  const torrent = client.get(infoHash)
  if (torrent.ready) startServerFromReadyTorrent(torrent, ...args)
  else torrent.once('ready', () => startServerFromReadyTorrent(torrent, ...args))
}

function startServerFromReadyTorrent (torrent, index, mediaIndex) {
  server[index] = torrent.createServer()
  server[index].listen(0, () => {
    const port = server[index].address().port
    const urlSuffix = ':' + port
    const localURL = `http://localhost${urlSuffix}/${mediaIndex}`

    ipcRenderer.send('wt-server-running', index, localURL)
  })
}

// 스트리밍 중인 서버를 닫습니다.
function stopServer (index) {
  if (!server[index]) return
  server[index].destroy()
  server.splice(index, 1)
}

function saveTorrentFile (torrent, identifierCallback) {
  const torrentFileName = torrent.infoHash + '.torrent'
  const torrentFilePath = path.join(config.TORRENT_PATH, torrentFileName)
  
  fs.access(torrentFilePath, fs.constants.R_OK, error => {
    if (!error) return console.error(error)
    mkdirp(config.TORRENT_PATH, _ => {
      fs.writeFile(torrentFilePath, torrent.torrentFile, error => {
        if (error) return console.error('토렌트 파일 저장 실패 %s: %o', torrentFilePath, error)
        console.log('토렌트 파일을 저장하였습니다. %s', torrentFilePath)

        // 이 구문이 중간에 낀다는건 약간 논리적이지 않는듯 함 나중에 좀 더 생각해서 바꿀것
        if (typeof identifierCallback === 'function') return identifierCallback(torrentFilePath)

        // 다음 재시작을 위해 요약 정보를 파일에 저장합니다.
        const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
        torrentSummary[torrent.key].torrentFilePath = torrentFilePath
        ipcRenderer.send('set', 'torrents', torrentSummary)

        torrent.torrentFilePath = torrentFilePath
      })
    })
  })
}

function generateTorrentPoster (torrent) {
  poster(torrent, (error, buf, extension) => {
    if (error) return console.error('포스터를 만들 수 있는 토렌트 파일이 없습니다: %o', error)
    
    mkdirp(config.POSTER_PATH, (error) => {
      if (error) return console.error('포스터 폴더를 만드는중 오류가 발생되었습니다: %o', error)
      const posterFileName = torrent.infoHash + extension
      const posterFilePath = path.join(config.POSTER_PATH, posterFileName)
      
      fs.writeFile(posterFilePath, buf, (error) => {
        if (error) return console.error('포스터 파일 저장 실패: %o', error)
        console.log('포스터 파일을 저장하였습니다. %s', posterFilePath)

        // 다음 재시작을 위해 요약 정보를 파일에 저장합니다.
        const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
        torrentSummary[torrent.key].posterFilePath = posterFilePath
        ipcRenderer.send('set', 'torrents', torrentSummary)

        torrent.posterFilePath = posterFilePath
      })
    })
  })
}

function selectFiles (torrentOrInfoHash, selections) {
  let torrent
  if (typeof torrentOrInfoHash === 'string') {
    torrent = client.get(torrentOrInfoHash)
  } else {
    torrent = torrentOrInfoHash
  }

  if (!torrent) {
    throw new Error('selectFiles: missing torrent ' + torrentOrInfoHash)
  }

  if (!selections) {
    selections = torrent.files.map((x) => true)
  }
  
  if (selections.length !== torrent.files.length) {
    throw new Error('got ' + selections.length + ' file selections, ' +
      'but the torrent contains ' + torrent.files.length + ' files')
  }

  torrent.deselect(0, torrent.pieces.length - 1, false)
  
  for (let i = 0; i < selections.length; i++) {
    const file = torrent.files[i]
    if (selections[i]) {
      file.select()
    } else {
      file.deselect()
    }
  }
}

function deleteFile (paths, callback) {
  for (const path of paths) {
    if (path) {
      rimraf(path, (error) => {
        if (error) console.log('파일 삭제 실패 %o', error)
        if (typeof callback === 'function') callback()
      })
    }
  }
}

init()