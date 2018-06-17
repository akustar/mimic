// 파일 확장자 확인

import path from 'path'

// 파일 이름의 확장자를 가져 옵니다.
function getFileExtension(file) {
  const name = typeof file === 'string' ? file : file.name
  return path.extname(name).toLowerCase()
}

// 미디어 파일인지 확인합니다.
function isPlayable(file) {
  return isVideo(file) || isAudio(file)
}

// 확장자가 비디오 파일인지 확인합니다.
function isVideo(file) {
  return [
    '.avi', '.m4v', '.mkv', '.mov', '.mp4', '.mpg', '.ogv', '.webm', '.wmv'
  ].includes(getFileExtension(file))
}

// 확장자가 오디오 파일인지 확인합니다.
function isAudio(file) {
  return [
    '.aac', '.aiff', '.ape', '.ac3', '.flac', '.m4a', '.mp2', '.mp3', '.oga', '.ogg', '.opus', '.wav', '.wma'
  ].includes(getFileExtension(file))
}

// 확장자가 이미지 파일인지 확인합니다.
function isImage(file) {
  return [
    '.gif','.png','.jpg','.jpeg','.bmp','.tiff', '.raw'
  ].includes(getFileExtension(file))
}

// 확장자가 자막 파일인지 확인합니다.
function isSubtitle(file) {
  return [
    '.vtt', '.lrc', '.smi', '.ssa', '.ass', '.sub', '.srt', '.sbv', '.json'
  ].includes(getFileExtension(file))
}

// 토렌트 파일인지 확인합니다.
function isTorrent(file) {
  const isTorrentFile = getFileExtension(file) === '.torrent'
  const isMagnet = typeof file === 'string' && /^(stream-)?magnet:/.test(file)
  return isTorrentFile || isMagnet
}

export default {
  isPlayable,
  isSubtitle,
  isVideo,
  isAudio,
  isImage,
  isTorrent
}