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
                        <span>asd</span>
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
                          <button type="button" data-tippy-close="true">파일 업로드</button>
                          <button type="button" data-tippy-close="true">폴더 업로드</button>
                        </div>
                      </div>
                    </div>
                    <div class="settings-box">
                      <div>
                        <strong>비공개</strong>
                        <span>토렌트를 비공개로 설정합니다</span>
                      </div>
                      <div class="checkbox-slider">
                        <input type="checkbox" id="checkbox-slider">
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
                        <textarea style="height: 180px;"></textarea>
                      </div>
                    </div>
                    <div class="settings-box">
                      <div style="flex: 1;margin-right: 0">
                        <strong>설명</strong>
                        <textarea style="height: 24px;"></textarea>
                      </div>
                    </div>                    
                  </dd>
                </dl>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" @click="close">취소</button>
              <button type="button">확인</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'Seed',
    data() {
      return {
        
      }
    },
    methods: {
      close() {
        this.$emit('close')
      }
    }
  }
</script>

<style>

</style>