<template>
  <transition name="scale">
    <div class="modal">
      <transition name="opacity" tag="div">
        <div class="modal-container">
          <div class="modal-inner">
            <div class="modal-header">
              <h3>토렌트 주소 추가</h3>
              <button type="button" @click="close"><i class="material-icons md-20">close</i></button>
            </div>
            <div class="modal-body">
              <div>
                <dl>
                  <dd><input
                    type="text"
                    class="form-element"
                    placeholder="키 또는 주소 입력"
                    autofocus

                    v-model="torrentId"
                    @input="error = false"
                    @blur="error = false"
                    @keydown.enter="confirm"
                    :class="{ error: error }"
                    >
                    <div v-if="error" class="error-message" style="margin-left: 1px;">잘못된 주소입니다!</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="button-cancel" @click="close">취소</button>
              <button type="button" class="button-filled-black" @click="confirm">확인</button>              
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import parseTorrent from 'parse-torrent'

  export default {
    data() {
      return {
        torrentId: '',
        error: false
      }
    },
    methods: {
      confirm() {
        try {
          const torrentId = this.torrentId.trim()
          const parse = parseTorrent(torrentId)
          ipcRenderer.send('wt-identifier-torrent', this.torrentId.trim())

          this.$emit('close')
          this.$emit('loader')
        }
        catch (error) {
          this.error = true
        }
      },
      // 모달컴포넌트를 닫습니다
      close() {
        this.$emit('close')
      }
    }
  }
</script>

<style>
  .modal-inner {
    height: auto;
  }
  .modal-header {
    padding: 15px;
  }
  .modal-body {
    padding: 0 15px;
  }
  .modal-footer {
    padding: 15px 15px 10px;
  }
  .modal-body dl {
    margin-bottom: 0;
  }
  .modal-body > div {
    padding-right: 0;
  }
</style>