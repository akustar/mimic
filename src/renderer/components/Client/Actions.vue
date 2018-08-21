<template>
  <div class="actions">
    <div>
      <button type="button" title="열기" v-tippy="{placement: 'bottom', distance: 5}" style="top: -1px;" @click.stop="openDirectory">
        <i class="material-icons md-24">folder_open</i>
      </button>
      <button type="button" title="공유" v-tippy="{placement: 'bottom', distance: 5}" @click.stop="shareTorrent">
        <i class="material-icons md-24">link</i>
      </button>
      <!-- <div class="separator"></div>
      <button title="발급 번호"  @click.stop v-tippy="{placement: 'bottom', distance: 5}" class="torrentKey-number">
        <i># </i><span>367 057</span>
      </button> -->
    </div>
    <div>
      <button type="button" @click.stop="dropDown" v-tippy="{
          html: '#wt-dropdown-'+torrentKey,
          trigger: 'click',
          placement: 'bottom-end',
          reactive: true,
          interactive: true,
          distance: 0
        }"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"></path><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
      </button>
      <div :id="'wt-dropdown-'+torrentKey">
        <div class="dropdown">
          <button type="button" data-tippy-close="true" @click="stopTorrent">토렌트 삭제</button>
          <button type="button" data-tippy-close="true" @click="removeTorrent">데이터와 토렌트 둘다 삭제</button>  
          <button type="button" data-tippy-close="true" v-if="!isPause" @click="pauseTorrent">배포 안함</button>
          <button type="button" data-tippy-close="true" v-else @click="resumeTorrent">배포 시작</button>
          <button type="button" data-tippy-close="true" @click="openDirectory">저장된 폴더 열기</button>
          <button type="button" data-tippy-close="true" @click="shareTorrent">공유 링크 클립보드 복사</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ipcRenderer, shell, clipboard } from 'electron'
  import fs from 'fs'
  import path from 'path'

  export default {
    name: 'Actions',
    props: ['torrentKey'],
    data() {
      return {
        isPause: false
      }
    },
    methods: {
      dropDown () {
        const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
        const summary = torrentSummary[this.torrentKey]
        if (!summary) return

        this.isPause = summary.isPause
      },
      pauseTorrent () {
        this.isPause = true
        ipcRenderer.send('wt-pause-torrent', this.torrentKey)
      },
      resumeTorrent () {
        this.isPause = false
        ipcRenderer.send('wt-resume-torrent', this.torrentKey)
      },
      openDirectory() {
        const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
        const summary = torrentSummary[this.torrentKey]
        if (!summary) return
        
        setTimeout(() => {
          // 파일일때
          const fullPath = path.join(summary.downloadPath, summary.name)
          const stats = fs.lstatSync(fullPath)

          if (stats.isDirectory()) {
            shell.openExternal(fullPath)
          }
          else {
            shell.showItemInFolder(fullPath)
          }
        }, 10)
      },
      shareTorrent() {
        const torrentSummary = ipcRenderer.sendSync('get', 'torrents')
        const summary = torrentSummary[this.torrentKey]
        if (!summary) return

        // 배포중이 아니라면 배포 시작
        if (summary.isPause) ipcRenderer.send('wt-resume-torrent', this.torrentKey)

        // 클립보드에 공유 링크 복사
        clipboard.writeText(`https://akustar.github.io/stream/?infohash=${summary.infoHash}`)
        // 메시지 알림
        this.$toasted.show('클립보드에 링크가 복사 되었습니다')
      },
      stopTorrent() {
        // 토렌트가 삭제되기까지 약간의 시간이 걸리므로 뷰에서 미리 삭제된 모습을 보여줍니다
        this.$emit('stopTorrent', this.torrentKey)
        // 실제 삭제 요청
        ipcRenderer.send('wt-stop-torrent', this.torrentKey)
      },
      removeTorrent() {
        // 토렌트가 삭제되기까지 약간의 시간이 걸리므로 뷰에서 미리 삭제된 모습을 보여줍니다
        this.$emit('stopTorrent', this.torrentKey)
        // 실제 삭제 요청 
        ipcRenderer.send('wt-stop-torrent', this.torrentKey, 'all')
      }
    }
  }
</script>

<style>
  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 15px 6px;
  }
  .poster .actions button {
    color: #fff;
  }
  .actions > div {
    display: flex;
    align-items: center;
  }
  .actions > div > button + button {
    margin-left: 5px;
  }
  .actions > div .separator {
    margin-right: 8px;
  }
  .actions > div > button.key-number {
    position: relative;
    top: -1px;
  }
  .actions .separator {
    position: relative;
    width: 1px;
    height: 14px;
    margin: 0 6px;
    background-color: hsla(0,0%,100%,.2);    
  }
</style>