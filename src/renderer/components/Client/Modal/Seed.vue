<template>
  <transition name="scale">
    <div class="modal">
      <transition name="opacity" tag="div">
        <div class="modal-container">
          <div class="modal-inner">
            <div class="modal-header">
              <h3>새 토렌트 만들기</h3>
              <button type="button" @click="close"><i class="material-icons md-20">close</i></button>
            </div>
            <div class="modal-body">
              <div>
                <dl>
                  <dt>업로드</dt>
                  <dd>
                    <div class="settings-box">
                      <div>
                        <strong>위치</strong>
                        <span>{{ options.path || '&nbsp;' }}</span>
                      </div>
                      <button type="button" class="button-filled-black" style="min-width: 90px;" v-tippy="{
                        html: '#dialog',
                        trigger: 'click',
                        placement: 'bottom-end',
                        reactive: true,
                        interactive: true,
                        distance: 5
                      }">업로드</button>
                      <div id="dialog">
                        <div class="dropdown">
                          <button type="button" data-tippy-close="true" @click="openFileDialog">파일 업로드</button>
                          <button type="button" data-tippy-close="true" @click="openFolderDialog">폴더 업로드</button>
                        </div>
                      </div>
                    </div>
                    <div class="settings-box">
                      <div>
                        <strong>비공개</strong>
                        <span>토렌트를 비공개로 설정합니다</span>
                      </div>
                      <div class="checkbox-slider">
                        <input type="checkbox" id="checkbox-slider" v-model="options.isPrivate">
                        <label for="checkbox-slider"></label>
                      </div>
                    </div>
                  </dd>
                </dl>
                <dl>
                  <dt>메타데이타</dt>
                  <dd>
                    <div class="settings-box">
                      <div style="flex: 1;margin-right: 0">
                        <strong>트래커</strong>
                        <textarea style="height: 180px;" v-model="options.trackers"></textarea>
                      </div>
                    </div>
                    <div class="settings-box">
                      <div style="flex: 1;margin-right: 0">
                        <strong>설명</strong>
                        <textarea style="height: 24px;" v-model="options.comment"></textarea>
                      </div>
                    </div>                    
                  </dd>
                </dl>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" @click="close">취소</button>
              <button type="button" @click="confirm">확인</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'
  import createTorrent from 'create-torrent'
  import path from 'path'
  import fs from 'fs'
  import countFiles from 'count-files'
  import uniqueKey from '@/lib/unique-key'

  export default {
    name: 'Seed',
    props: ['seedPath'],
    data() {
      return {
        win: remote.getCurrentWindow(),
        options: {
          name: '',
          path: '',
          trackers: createTorrent.announceList.concat(['udp://tracker.openbittorrent.com:80/announce']).join('\n'),
          isPrivate: false,
          comment: '',
          selections: []
        }
      }
    },
    mounted () {
      // 드래그 앤 드롭으로 업로드 된 경우
      if (this.seedPath) {
        const stats = fs.lstatSync(this.seedPath)

        if (stats.isDirectory()) {
          this.updateFolderOptions(this.seedPath)
        }
        else {
          this.updateFileOptions(this.seedPath)
        }
      }   
    },
    methods: {
      openFileDialog () {
        const options = {
          title: '파일 선택',
          properties: ['openFile']
        }
        remote.dialog.showOpenDialog(this.win, options, (paths) => {
          if (!Array.isArray(paths)) return

          this.updateFileOptions(paths[0])
        })
      },

      openFolderDialog () {
        const options = {
          title: '폴더 선택',
          properties: ['openDirectory']
        }
        remote.dialog.showOpenDialog(this.win, options, (paths) => {
          if (!Array.isArray(paths)) return
     
          this.updateFolderOptions(paths[0])
        })
      },

      updateFileOptions (filePath) {
        this.options.name = path.basename(filePath)
        this.options.path = filePath
        this.options.selections.push(true)
      },

      updateFolderOptions (folderPath) {
        this.options.name = path.basename(folderPath)
        this.options.path = folderPath
        countFiles(folderPath, (error, {files}) => {
          while (files--) this.options.selections.push(true)
        })
      },

      confirm () {
        // 파일이 지정되지 않은 경우 모달을 닫습니다
        if (!this.options.path) return this.close()

        const announceList = this.options.trackers
          .split('\n')
          .map(s => s.trim())
          .filter(s => s !== '')
        const torrentKey = uniqueKey()
        const options = {
          torrentKey,
          name: this.options.name,
          announce: announceList,
          private: this.options.isPrivate,
          comment: this.options.comment.trim(),
          selections: this.options.selections
        }

        // 토렌트 다운로드 시작
        ipcRenderer.send('wt-create-torrent', torrentKey, this.options.path, options)

        // 토렌트가 연결되기 까지 시간이 걸리므로 연결되지않은 토렌트 정보를 먼저 보여줍니다
        this.tempTorrent({
          name: this.options.name,
          key: torrentKey,
          status: '연결 대기 중'
        })

        // 모달을 닫습니다
        this.close()
      },

      close () {
        this.$emit('close')
      },

      tempTorrent (torrent) {
        this.$emit('tempTorrent', torrent)
      }
    }
  }
</script>

<style>

</style>