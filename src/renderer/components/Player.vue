<template>
  <div class="player" :class="[isMouseOver ? 'transition-in' : 'transition-out', {'no-cursor': noCursor}]">
    <titlebar :mediaName="mediaName" :isFullScreen.sync="isFullScreen" @mouseover.native="isMouseOver = true"></titlebar>
    <div class="mediabox">
      <video
        v-if="localURL"  
        webkit-playsinline
        playsinline
        ref="media"
        :src="localURL"
        :muted="isMuted"
        @canplay="canPlay"
        @loadedmetadata="loadedmetadata"
        @timeupdate="timeupdate"
        @pause="pause"
        @ended="ended"
        @stalled="stalled"
        @error="error"
      ></video>
    </div>
    <div class="media-controls" @mouseover="isMouseOver = true">
      <div class="status">
        <span>{{ message }}</span>
      </div>
      <div class="control">
        <div class="time">
          <span class="current">{{ currentTime }}</span><span class="total">{{ totalTime }}</span>
        </div>
        <div class="playback-bar" ref="playbackBar" :class="{'is-dragging': isDragging}" @mousedown.stop="handleTimeupdate($event)">
          <div class="progress-bar">
            <div class="progress-filled" :style="{transform: progressFilled}"></div>
            <div class="progress-part" v-for="(part, index) in loadingParts" :key="index" :style="part"></div>
            <div class="progress-cursor" :style="{left: progressCursor}"></div>
          </div>
        </div>
        <div class="control-left">
          <button type="button" class="control-button" @click="togglePlay">
            <svg v-if="isPaused" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M10,7l12,8l-12,8V7z"></path></svg>
            <svg v-else viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M9,22h4V8H9V22z M17,8v14h4V8H17z"></path></svg>
          </button>
          <button type="button" class="control-button" @click="toggleMute">
            <svg v-if="!isMuted" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M22,21.5v-13L23,8v14L22,21.5z M18,10.5l1-0.5v10l-1-0.5V10.5z M7,18v-6l3,0l5-4v14l-5-4L7,18z"></path></svg>
            <svg v-else viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M23,18L23,18h-0.7L20,15.7L17.7,18H17l0,0v-0.7l2.3-2.3L17,12.7V12l0,0h0.7l2.3,2.3l2.3-2.3H23l0,0v0.7L20.7,15l2.3,2.3V18z M7,18v-6l3,0l5-4v14l-5-4L7,18z"></path></svg>
          </button>
          <input type="range" class="volumebar" min="0" max="100" step="1" v-model="volume" :style="{backgroundSize: progressVolume}" @mousedown.stop>
        </div>
        <div class="control-right">
          <button type="button" class="control-button">
            <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M13.3589744,7 L16.6410256,7 L18.0769231,9.8 L21.3589744,9.8 L23,12.2 L21.3589744,15 L23,17.8 L21.3589744,20.2 L18.0769231,20.2 L16.6410256,23 L13.3589744,23 L11.9230769,20.2 L8.64102564,20.2 L7,17.8 L8.64102564,15 L7,12.2 L8.64102564,9.8 L11.9230769,9.8 L13.3589744,7 Z M15,17.8 C16.5860485,17.8 17.8717949,16.5463973 17.8717949,15 C17.8717949,13.4536027 16.5860485,12.2 15,12.2 C13.4139515,12.2 12.1282051,13.4536027 12.1282051,15 C12.1282051,16.5463973 13.4139515,17.8 15,17.8 Z"></path></svg>
          </button>
          <button type="button" class="control-button" @click="openSubtitles">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="margin: 0 auto"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/></svg>
          </button>
          <button type="button" class="control-button" style="transform: rotate(270deg);" @click="fullScreen">
            <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M7,7 L15.2,7 L12.8,9.4 L15.8,12.4 L12.4,15.8 L9.4,12.8 L7,15.2 L7,7 Z M23,23 L14.8,23 L17.2,20.6 L14.2,17.6 L17.6,14.2 L20.6,17.2 L23,14.8 L23,23 Z"></path></svg>
          </button>
        </div>        
      </div>
    </div>
    <div class="overlay" v-if="isStalled">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'
  import fs from 'fs'
  import path from 'path'  
  import fileExtension from '../lib/file-extension'
  import subtitles from '../lib/subtitles'
  import Bitfield from 'bitfield'
  import dragDrop from 'drag-drop'
  import stringSimilarity from 'string-similarity';
  // components
  import Titlebar from './Player/Titlebar'

  export default {
    components: {
      Titlebar
    },
    data() {
      return {
        win: remote.getCurrentWindow(),
        winIndex: -1,

        torrentKey: '',
        mediaName: '',
        mediaIndex: 0,
        mediaType: '',
        
        localURL: '',
        time: 0,
        duration: 0,
        volume: 50,
        loadingParts: [],
        progress: null,
        message: '',
        mouseTimer: 0,
        noCursor: false,

        isDragging: false,
        isPaused: true,
        isMuted: false,
        isStalled: true,
        isFullScreen: false,
        isMouseOver: false,
      }
    },
    mounted() {
      this.ipc()

      this.initEvents()
    },
    methods: {
      ipc() {
        ipcRenderer.on('did-finish-load', (event, winIndex, infoHash, mediaName, mediaIndex, torrentKey) => {
          this.mediaName = mediaName
          this.mediaIndex = mediaIndex
          this.mediaType = fileExtension.isVideo(mediaName) ? 'video' : 'audio'
          this.torrentKey = torrentKey
          
          // 스트리밍을 위한 서버 실행 요청
          ipcRenderer.send('wt-start-server', infoHash, winIndex, mediaIndex)
        })

        // 요청한 서버가 실행되면 미디어를 재생합니다.
        ipcRenderer.on('wt-server-running', (event, localURL) => this.localURL = localURL)

        // 다운로드 중인 토렌트 정보를 받습니다(1초마다)
        ipcRenderer.on('wt-loading-parts', (event, progress) => {
          this.renderLoadingParts(progress)
        })
      },
      initEvents() {
        // 자막 드래그 업로드
        dragDrop('body', this.dragDropSubtitles)

        document.addEventListener('mouseenter', () => this.isMouseOver = true)
        document.addEventListener('mouseleave', () => this.isMouseOver = false)
        document.addEventListener('mousemove', event => {
          if(this.isDragging) {
            this.handleTimeupdate(event)
          }

          this.mouseObserver(event)
        })
        document.addEventListener('mouseup', event => {
          if (this.isDragging) {
            this.isDragging = false
            this.$refs.media.currentTime = this.time
          }
        })
        document.addEventListener('keydown', event => {
          if (!event.altKey && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
            switch(event.keyCode) {
              // space
              case 32:
                this.togglePlay()
                event.preventDefault()
              break
              // left
              case 37:
                this.skipPrev()
                event.preventDefault()
              break
              // up
              case 38:
                this.volumeUp()
                event.preventDefault()
              break
              // right
              case 39:
                this.skipNext()
                event.preventDefault()
              break
              // down
              case 40:
                this.volumeDown()
                event.preventDefault()
              break
              // M
              case 77:
                this.toggleMute()
                event.preventDefault()
              break
              // tab
              case 9:
                event.preventDefault()
              break
              // enter
              case 13:
                this.fullScreen()
                event.preventDefault()
              break
              // ESC
              case 27:
                if (this.isFullScreen) this.fullScreen()
                event.preventDefault()
              break;
              // f11
              case 122:
                event.preventDefault()
              break            
            }
          }
        })
        document.addEventListener('mousewheel', event => {
          if (event.wheelDelta > 0) {
            this.volumeUp()
          }
          else {
            this.volumeDown()
          }
        })                
      },
      load() {
        
      },
      canPlay() {
        if (this.type === 'video' && this.$refs.media.webkitVideoDecodedByteCount === 0) {
          console.log('지원되지 않는 비디오 형식')
        } else if (this.$refs.media.webkitAudioDecodedByteCount === 0) {
          console.log('지원되지 않는 오디오 형식')
        }
      },
      loadedmetadata() {
        this.duration = this.$refs.media.duration
        this.isStalled = false
        
        this.play()
      },
      stalled() {
        this.isStalled = true
      },
      error(error) {
        console.log('죄송합니다. 해당 파일을 재생할 수 없습니다.', error)
      },
      // 미디어 재생 위치 업데이트
      timeupdate() {
        if(this.isDragging) {
          return
        }
        if(this.time) {
          this.isStalled = false
        }
        this.time = this.$refs.media.currentTime
      },
      // 미디어를 재생합니다.
      play() {
        this.sendMessage('재생')
        this.isPaused = false
        this.$refs.media.play()
      },
      // 미디어를 일시정지 합니다.
      pause() {
        this.sendMessage('일시정지')
        this.isPaused = true
        this.$refs.media.pause()
      },
      // 재생/일시정지 토글
      togglePlay() {
        if(this.isPaused) {
          this.play()
        }
        else {
          this.pause()
        }        
      },
      // 미디어가 끝까지 재생됐을 경우 미디어를 일시정지 시킵니다.
      ended() {
        this.pause()
      },
      handleTimeupdate(event) {
        this.isDragging = true
        const rect = this.$refs.playbackBar.getBoundingClientRect()
        this.time = Math.min(Math.max((event.clientX - rect.left) / rect.width * this.duration, 0), this.duration)
      },
      // 음소거/음소거 해제
      toggleMute() {
        if(this.isMuted) {
          this.isMuted = false
          this.sendMessage('음소거 해제')
        }
        else {
          this.isMuted = true
          this.sendMessage('음소거')
        }
      },
      // 앞으로 가기
      skipNext() {
        this.sendMessage(`5초 앞으로 / ${this.currentTime}`)
        this.$refs.media.currentTime += 5
      },
      // 뒤로가기
      skipPrev() {
        this.sendMessage(`5초 뒤로 / ${this.currentTime}`)
        this.$refs.media.currentTime -= 5
      },
      // 볼륨 키우기
      volumeUp() {
        this.volume = Math.min(Number(this.volume) + 5, 100)
        this.sendMessage(`볼륨: ${this.volume}%`)
      },
      // 볼륨 줄이기
      volumeDown() {
        this.volume = Math.max(Number(this.volume) - 5, 0)
        this.sendMessage(`볼륨: ${this.volume}%`)
      },
      sendMessage(message) {
        this.message = message
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.message = ''
        }, 3 * 1000)
      },
      mouseObserver() {
        this.noCursor = false
        clearTimeout(this.mouseTimer)
        if (event.target.closest('.titlebar, .status, .control') === null) {  
          this.mouseTimer = setTimeout(() => {
            this.isMouseOver = false
            if (this.isFullScreen) {
              this.noCursor = true
            }
          }, 2 * 1000)
        }
      },
      fullScreen() {
				this.isFullScreen = !this.win.isFullScreen()
				this.win.setFullScreen(this.isFullScreen)
      },
      // 자막 파일을 업로드 합니다.
      openSubtitles() {
        remote.dialog.showOpenDialog({
          title: '자막 파일을 선택하세요.',
          filters: [{ name: 'Subtitles', extensions: ['vtt', 'lrc', 'smi', 'ssa', 'ass', 'sub', 'srt', 'sbv', 'json'] }],
          properties: ['openFile']
        }, (paths) => {
          if (!Array.isArray(paths)) return

          this.appendMediaTrack(paths[0])
        })
      },
      // 자막 파일을 드래그 앤 드롭 동작으로 추가합니다.
      dragDropSubtitles(files) {
        // 첫번째 파일만 받겠습니다.
        const file = files[0]
        // 자막 파일인지 확인합니다.
        if (fileExtension.isSubtitle(file)) {
          this.appendMediaTrack(file.path)
        }
      },
      // 자막을 추가합니다.
      appendMediaTrack(path) {
        const track = document.createElement('track')

        if (this.$refs.media.firstChild) {
          this.$refs.media.removeChild(this.$refs.media.firstChild)
        }

        track.label = 'Subtitles'
        track.type = 'subtitles'
        track.kind='captions'
        track.mode = 'showing'
        track.default = true
        track.src = subtitles.buffer(path)

        this.$refs.media.appendChild(track)

        this.sendMessage('자막 추가 됨')
      },
      renderLoadingParts(progress) {
        if (!progress) return

        let lastPiecePresent = false
        const loadingParts = []
        const torrent = progress.torrents[this.torrentKey]

        if (!torrent) return

        const fileProg = torrent.fileProg[this.mediaIndex]

        while (this.loadingParts.length > 0) this.loadingParts.pop()

        for (let i = fileProg.startPiece; i <= fileProg.endPiece; i++) {
          const partPresent = Bitfield.prototype.get.call(torrent.bitfield, i)
          if(partPresent && !lastPiecePresent) {
            loadingParts.push({start: i - fileProg.startPiece, count: 1})
          } else if (partPresent) {
            loadingParts[loadingParts.length - 1].count++
          }
          lastPiecePresent = partPresent
        }

        loadingParts.forEach((part, index) => {
          this.loadingParts.push({
            left: (100 * part.start / fileProg.numPieces) + '%',
            width: (100 * part.count / fileProg.numPieces) + '%'
          })
        })
      },
      zeroFill(n) {
        return ('0' + n).slice(-2)
      }     
    },
    watch: {
      volume() {
        this.$refs.media.volume = this.volume / 100
      },
      isFullScreen() {
        if (this.isFullScreen) {
          setTimeout(() => {
            this.transition = false
          }, 2 * 1000)
        }
      }
    },
    computed: {
      progressFilled() {
        return `scaleX(${this.time / this.duration})`
      },
      progressCursor() {
        return `calc(${this.time / this.duration * 100}% - 7px)`
      },
      progressVolume() {
        return `${(this.volume * 100) / 100}% 100%`
      },
      currentTime() {
        const hours = this.zeroFill(Math.floor(this.time / 3600))
        const minutes = this.zeroFill(Math.floor(this.time % 3600 / 60))
        const second = this.zeroFill(Math.floor(this.time % 3600 % 60))

        return `${hours}:${minutes}:${second}`
      },
      totalTime() {
        const totalHours = this.zeroFill(Math.floor(this.duration / 3600))
        const totalMinutes = this.zeroFill(Math.floor(this.duration % 3600 / 60))
        const totalSecond = this.zeroFill(Math.floor(this.duration % 3600 % 60))

        return `${totalHours}:${totalMinutes}:${totalSecond}`
      }
    }    
  }
</script>

<style>
  .player {
    position: relative;
    overflow: hidden;
    height: 100vh;
    background-color: #000;
  }
  .player video {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .player video::cue {
    font-size: 1.2em;
    background: none;
    color: #FFF;
    text-shadow: #000 -1px 0 1px, #000 1px 0 1px, #000 0 -1px 1px, #000 0 1px 1px, rgba(50, 50, 50, 0.5) 2px 2px 0;
  }
  .player.transition-in video::-webkit-media-text-track-container {
    bottom: 50px;
    transition: bottom 0.15s ease-out;
  }
  .player.transition-out video::-webkit-media-text-track-container {
    bottom: 20px;
  }
  .player.transition-in .control,
  .player.transition-in .titlebar {
    opacity: 1;
  }
  .player.transition-out .control,
  .player.transition-out .titlebar {
    opacity: 0;
  }
  .status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 22px;
    left: 0;
    right: 0;
    padding: 15px;
    font-size: 13px;
    text-shadow: rgba(0, 0, 0, 0.5) 0 0 4px;
    color: #fff;
  }
  .status h2 {
    font-size: 14px;
    font-weight: 400;
  }
  .control {
    position: absolute;
    left: 0; 
    right: 0;
    bottom: 0;
    display: flex;
    flex-flow: row wrap;
    padding-top: 40px;
    transition: opacity .25s ease-out;
    will-change: opacity;    
    background: linear-gradient(0deg,rgba(0,0,0,.8) 0,rgba(0,0,0,.35) 60%,transparent);
  }
  .time {
    flex: 1 100%;
    overflow: hidden;
    margin: 0 15px;
    padding-top: 18px;
  }
  .time > span {
    font-size: 13px;
    color: #fff;
  }
  .time .current {
    float: left;
  }
  .time .total{
    float: right
  }    
  .playback-bar {
    position: relative;
    flex: 1 100%;
    height: 24px;
    margin: 0 15px;
    cursor: pointer;
  }
  .progress-bar {
    position: absolute;
    left: 0;
    top: 10px;
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, .2);
  }
  .playback-bar:hover .progress-bar .progress-cursor,
  .playback-bar.is-dragging .progress-bar .progress-cursor {
    transform: none;
    transition: transform .1s cubic-bezier(0.0,0.0,0.2,1);
  }
  .progress-bar .progress-filled {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    background-color: #6fcf97;
    transform: scaleX(0);
    transform-origin: 0 0 0;
  }
  .progress-bar .progress-cursor {
    position: absolute;
    left: -7px;
    top: -5px;
    z-index: 11;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    transform: scale(0);
    transition: transform .1s cubic-bezier(0.4,0.0,1,1);
    background-color: #ccc;
  }
  .progress-bar .progress-part {
    position: absolute;
    background-color: rgba(255, 255, 255, .35);
    top: 0;
    height: 100%;
  }
  .control-left {
    display: flex;
    align-items: center;
    padding: 0 0 10px 10px;
  }
  .control-right {
    display: flex;
    align-items: center;    
    margin-left: auto;
    padding: 0 10px 10px 0;
  }
  .control-button {
    width: 30px;
    height: 30px;
    min-width: auto;
    background-color: transparent;
    border: 0;
    outline: none;
    cursor: pointer;
    padding: 0;
  }
  .control-button svg {
    fill: #fff;
  }
  .control-button:hover svg {
    fill: #6fcf97;
  }
  .volumebar {
    width: 100px;
    height: 4px;
    background-color: rgba(255, 255, 255, .4);
    background-image: linear-gradient(#6fcf97, #6fcf97);
    background-size: 50% 100%;
    background-repeat: no-repeat;    
    -webkit-appearance: none;
    cursor: pointer;
    outline: none;
    margin: 0 5px;
  }
  .volumebar::-webkit-slider-runnable-track {
    box-shadow: none;
    border: none;
    background: transparent;
    -webkit-appearance: none;    
  }
  .volumebar::-webkit-slider-thumb {
    width: 4px;
    height: 12px;
    margin-top: 1px;
    border: 0;
    background: #fff;
    box-shadow: 0 0 1px 0px rgba(0,0,0,0.1);
    -webkit-appearance: none;
  }
  .message {
    position: absolute;
    right: 15px;
    top: 38px;
    font-size: 13px;
    text-shadow: rgba(0, 0, 0, 0.5) 0 0 4px;
    color: #fff;
    z-index: 2147483647;
  }   
</style>