<template>
  <div class="client">
    <titlebar></titlebar>
    <div class="header">
      <button type="button" title="설정" v-tippy="{placement: 'bottom'}"><svg name="Gear" width="22" height="22" viewBox="0 0 18 18"><path fill="currentColor" d="M7.15546853,6.47630098e-17 L5.84453147,6.47630098e-17 C5.36185778,-6.47630098e-17 4.97057344,0.391750844 4.97057344,0.875 L4.97057344,1.9775 C4.20662236,2.21136254 3.50613953,2.61688993 2.92259845,3.163125 L1.96707099,2.61041667 C1.76621819,2.49425295 1.52747992,2.46279536 1.30344655,2.52297353 C1.07941319,2.58315171 0.88846383,2.73002878 0.77266168,2.93125 L0.117193154,4.06875 C0.00116776262,4.26984227 -0.0302523619,4.50886517 0.0298541504,4.73316564 C0.0899606628,4.9574661 0.236662834,5.14864312 0.437644433,5.26458333 L1.39171529,5.81583333 C1.21064614,6.59536289 1.21064614,7.40609544 1.39171529,8.185625 L0.437644433,8.736875 C0.236662834,8.85281521 0.0899606628,9.04399223 0.0298541504,9.2682927 C-0.0302523619,9.49259316 0.00116776262,9.73161606 0.117193154,9.93270833 L0.77266168,11.06875 C0.88846383,11.2699712 1.07941319,11.4168483 1.30344655,11.4770265 C1.52747992,11.5372046 1.76621819,11.5057471 1.96707099,11.3895833 L2.92259845,10.836875 C3.50613953,11.3831101 4.20662236,11.7886375 4.97057344,12.0225 L4.97057344,13.125 C4.97057344,13.6082492 5.36185778,14 5.84453147,14 L7.15546853,14 C7.63814222,14 8.02942656,13.6082492 8.02942656,13.125 L8.02942656,12.0225 C8.79337764,11.7886375 9.49386047,11.3831101 10.0774016,10.836875 L11.032929,11.3895833 C11.2337818,11.5057471 11.4725201,11.5372046 11.6965534,11.4770265 C11.9205868,11.4168483 12.1115362,11.2699712 12.2273383,11.06875 L12.8828068,9.93270833 C12.9988322,9.73161606 13.0302524,9.49259316 12.9701458,9.2682927 C12.9100393,9.04399223 12.7633372,8.85281521 12.5623556,8.736875 L11.6082847,8.185625 C11.7893539,7.40609544 11.7893539,6.59536289 11.6082847,5.81583333 L12.5623556,5.26458333 C12.7633372,5.14864312 12.9100393,4.9574661 12.9701458,4.73316564 C13.0302524,4.50886517 12.9988322,4.26984227 12.8828068,4.06875 L12.2273383,2.93270833 C12.1115362,2.73148712 11.9205868,2.58461004 11.6965534,2.52443187 C11.4725201,2.46425369 11.2337818,2.49571128 11.032929,2.611875 L10.0774016,3.16458333 C9.49400565,2.61782234 8.79351153,2.2117896 8.02942656,1.9775 L8.02942656,0.875 C8.02942656,0.391750844 7.63814222,6.47630098e-17 7.15546853,6.47630098e-17 Z M8.5,7 C8.5,8.1045695 7.6045695,9 6.5,9 C5.3954305,9 4.5,8.1045695 4.5,7 C4.5,5.8954305 5.3954305,5 6.5,5 C7.03043298,5 7.53914081,5.21071368 7.91421356,5.58578644 C8.28928632,5.96085919 8.5,6.46956702 8.5,7 Z" transform="translate(2.5 2)"></path></svg></button>
      <div>
        <button type="button" class="flex-center" v-tippy="{ html: '#addTorrent', trigger: 'click', placement: 'bottom-end', reactive: true, interactive: true, distance: 5 }">새로 만들기<i class="material-icons md-24">arrow_drop_down</i></button>
        <div id="addTorrent">
          <div class="dropdown">
            <button type="button" data-tippy-close="true" @click="addTorrentFile">토렌트 파일 추가</button>
            <button type="button" data-tippy-close="true" @click="magnetIsShow = true">토렌트 주소 추가</button>
            <button type="button" data-tippy-close="true" @click="seedIsShow = true">새 토렌트 만들기</button>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div
          class="torrent"
          v-for="(torrent, key) in progress.torrents" :key="key"
          :class="{active: currentKey === key, poster: torrent.posterFilePath}"
          :style="poster(torrent.posterFilePath)"
          @click="currentKey === key ? currentKey = '' : currentKey = key"
        >
        <!-- 메타데이타 -->
        <metadata :torrent="torrent"></metadata>
        <!-- 액션 -->
        <actions :torrentKey="key"></actions>
        <!-- 디테일 -->
        <detail v-if="currentKey === key" :torrentKey="key" :fileProg="torrent.fileProg"></detail>        
      </div>
  
      <!-- 모달: 토렌트 파일 추가 -->
      <md-file v-if="parseResults.length > 0" :parseResults="parseResults"></md-file>
      <!-- 모달: 마그넷 추가 -->
      <md-magnet v-if="magnetIsShow" @close="magnetIsShow = false" @loader="loader = true"></md-magnet>
      <!-- 모달: 시드 추가 -->
      <md-seed v-if="seedIsShow" :seedPath="seedPath" @close="seedIsShow = false"></md-seed>
    </div>
    <div class="footer">

    </div>
    <transition name="opacity">
      <div class="overlay" v-if="loader">
        <span class="spinner"></span>
      </div>
    </transition>
  </div>
</template>

<script>
  import { ipcRenderer, remote, clipboard } from 'electron'
  import fs from 'fs'
  import path from 'path'
  import dragDrop from 'drag-drop'
  import fileExtension from '../lib/file-extension'
  import config from '../../config'

  // components
  import Titlebar from './Client/Titlebar'
  import Metadata from './Client/Metadata'
  import Actions from './Client/Actions'
  import Detail from './Client/Detail'
  import MdFile from './Client/Modal/File'
  import MdMagnet from './Client/Modal/Magnet'
  import MdSeed from './Client/Modal/Seed'

  export default {
    data () {
      return {
        progress: {
          torrents: null,
          progress: 0,
          hasActiveTorrents: false
        },
        parseResults: [],
        currentKey: '',

        loader: false,
        seedPath: '',
        seedIsShow: false,
        magnetIsShow: false
      }
    },
    mounted () {
      // 프로그램 재시작시 연결되어있던 토렌트에 다시 연결합니다.
      this.reconnect()
      // 메인 프로세스에서 메세지가 오길 기다립니다.
      this.ipc()
      // 마그넷 링크 붙여넣기 이벤트
      document.addEventListener('paste', this.pasteTorrent)      
      // 토렌트 파일 또는 시드 파일을 드래그 앤 드롭 합니다.
      dragDrop('body', this.dragDropTorrent) 
    },
    methods: {
      // 프로그램 재시작시 연결되어있던 토렌트에 다시 연결합니다.
      reconnect () {
        const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
        // 토렌트가 연결되기까지 약간의 시간이 걸리므로 사용자에게 먼저 저장된 정보를 보여줍니다.
        this.progress.torrents = torrentSummary

        for (const key in torrentSummary) {
          const { torrentFileName, posterFileName, selections, infoHash, path:downloadPath, } = torrentSummary[key]

          const torrentFilePath = torrentFileName ? path.join(config.TORRENT_PATH, torrentFileName) : ''
          const posterFilePath = posterFileName ? path.join(config.POSTER_PATH, posterFileName) : ''

          fs.stat(torrentFilePath, (error, stat) => {
            const torrentId = !error ? torrentFilePath : infoHash
            ipcRenderer.send('wt-start-torrent', torrentId, downloadPath, key, selections, posterFilePath)
          })
        }
      },
      ipc () {
        // 분석된 토렌트 정보를 받아 다운로드를 받기 위한 모달을 띄웁니다.
        ipcRenderer.on('wt-parse-result', (event, parseResults) => {
          for (const parse of parseResults) {
            this.parseResults.push(parse)
          }
          this.loader = false
        })

        // 토렌트 요약 정보를 받습니다.
        ipcRenderer.on('wt-progress', (event, progress) => {
          this.$set(this.progress, 'torrents', progress.torrents)

          // 재생중인 미디어에 토렌트 정보를 보냅니다.
          ipcRenderer.send('wt-loading-parts', progress)
        })

        // 에러
        ipcRenderer.on('wt-error', (event, message) => {
          if (message.indexOf('duplicate') > -1) {
            this.toasted('같은 이름의 토렌트가 이미 존재합니다')
          }
          else {
            switch (message) {
              case 'Invalid torrent identifier':
                this.toasted('파일을 찾을 수 없습니다')
              break
              case 'Identifier expected':
                this.toasted('잘못된 마그넷 주소 입니다')
              break
              case 'Timeout':
                this.toasted('시간초과: 잘못된 마그넷 주소 입니다')
              break
              default:
                this.toasted('에러')
            }
          }
          this.loader = false
        })
      },
      // 토렌트 분석을 시작합니다.
      parseTorrentFile (paths) {
        ipcRenderer.send('wt-parse-torrent', paths)

        this.loader = true
      },
      pasteTorrent (event) {
        const editableHtmlTags = new Set(['input', 'textarea'])
        const tagName = event.target.tagName.toLowerCase()
        const torrentId = clipboard.readText().trim()
        
        if (this.isModalShow || editableHtmlTags.has(tagName) || !torrentId) return

        this.identifierTorrent(torrentId)
      },
      // 마그넷 링크 분석을 위해 웹토렌트 페이지로 파일의 경로를 전송합니다
      identifierTorrent (torrentId) {
        this.loader = true 
        
        ipcRenderer.send('wt-identifier-torrent', torrentId)
      },
      // 토렌트 파일을 추가 합니다.
      addTorrentFile () {
        const currentWin = remote.getCurrentWindow()
        const options = {  
          properties: ['openFile', 'multiSelections'],
          filters: [
            {name: '토렌트', extensions: ['torrent']}
          ]
        }
        remote.dialog.showOpenDialog(currentWin, options, paths => {
          if (!Array.isArray(paths)) return
          
          this.parseTorrentFile(paths)
        })
      },
      // 토렌트 파일 또는 시드 파일을 드래그 앤 드롭 합니다.
      dragDropTorrent (files, pos, fileList, directories) {
        const tPaths = []
        const sPaths = []
        
        for (const file of fileList) {
          if (fileExtension.isTorrent(file)) {
            tPaths.push(file.path)
          }
          else {
            sPaths.push(file.path)
          }
        }

        if (tPaths.length > 0) {
          this.parseTorrentFile(tPaths)
        }

        if (sPaths.length > 0) {
          this.seedPath = sPaths[0]
          this.seedIsShow = true
        }
      },
      poster (posterFilePath) {
        if (posterFilePath) {
          return `backgroundImage: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%), url('file://${posterFilePath.replace(/\\/g, '/')}')`
        }
      },
      toasted (message) {
        this.$toasted.show(message, {
          type : 'error',
          action: {
            text: '확인',
            onClick: (event, toastObject) => toastObject.goAway(0)
          }
        })
      }
    },
    computed: {
      isModalShow () {
        return this.seedIsShow || this.magnetIsShow || this.parseResults.length > 0
      }
    },
    components: {
      Titlebar,
      Metadata,
      Actions,
      Detail,
      MdFile,
      MdMagnet,
      MdSeed
    }
  }
</script>

<style>
.client {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.client .header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 8px 0 12px;    
  border-bottom: 1px solid #25262a;
}
.client .main {
  flex: 1 1 0%;
  overflow-y: auto;
  overflow-x: hidden;
}
.client .torrent {
  position: relative;
  cursor: pointer;
  min-height: 100px;
  border-bottom: 1px solid rgba(114, 118, 126, 0.2);
}
.client .torrent:hover,
.client .torrent.isActive {
  background-color: #36393f;
}
.client .torrent.poster {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-bottom: none;
  color: #fff;
  text-shadow: rgba(0, 0, 0, 0.5) 0 0 4px;
}
.client .torrent.poster .progress {
  background: rgba(255,255,255,0.35);
}
</style>