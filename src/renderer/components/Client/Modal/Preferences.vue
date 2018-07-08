<template>
  <transition name="scale">
    <div class="modal">
      <transition name="opacity" tag="div">
        <div class="modal-container">
          <div class="modal-inner">
            <div class="modal-header">
              <h3>사용자 설정</h3>
              <button type="button" @click="close"><i class="material-icons md-20">close</i></button>
            </div>
            <div class="modal-body">
              <div>
                <dl>
                  <dt>일반</dt>
                  <dd>
                    <div class="settings-box">
                      <div>
                        <strong>윈도우 시작시 MIMIC 실행</strong>
                        <span></span>
                      </div>
                      <div class="checkbox-slider">
                        <input type="checkbox" id="checkbox-slider-2">
                        <label for="checkbox-slider-2"></label>
                      </div>
                    </div>
                  </dd>
                </dl>
                <dl>
                  <dt>폴더</dt>
                  <dd>
                    <div class="settings-box">
                      <div>
                        <strong>저장 위치</strong>
                        <span>{{ downloads }}</span>
                      </div>
                      <button type="button" class="button-filled-black" @click="setDownloads">위치 지정하기</button>
                    </div>
                  </dd>
                </dl>
                <dl>
                  <dt>재생</dt>
                  <dd>
                    <div class="settings-box">
                      <div>
                        <strong>외부 플레이어 사용</strong>
                        <span>기본 앱으로 미디어를 재생합니다</span>
                      </div>
                      <div class="checkbox-slider">
                        <input type="checkbox" id="checkbox-slider-1" v-model="openExternalPlayer" @change="setOpenExternalPlayer">
                        <label for="checkbox-slider-1"></label>
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" @click="close">확인</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'

  export default {
    name: 'Preferences',
    data() {
      return {
        downloads: ipcRenderer.sendSync('get', 'downloads'),
        openExternalPlayer: ipcRenderer.sendSync('get', 'openExternalPlayer')
      }
    },
    methods: {
      // 다운로드 위치를 설정합니다
      setDownloads (fileName) {
        const win = remote.getCurrentWindow()
        const options = {
          title: '다운로드할 위치를 지정하세요',
          defaultPath: this.downloads,
          properties: ['openFile', 'openDirectory']
        }
        remote.dialog.showOpenDialog(win, options, paths => {
          if (!Array.isArray(paths)) return

          this.downloads = paths[0]
          
          ipcRenderer.send('set', 'downloads', this.downloads)
        })
      },
      setOpenExternalPlayer (event) {
        this.openExternalPlayer = event.target.checked
        ipcRenderer.send('set', 'openExternalPlayer', this.openExternalPlayer)
      },
      close() {
        this.$emit('close')
      }
    }
  }
</script>

<style>

</style>