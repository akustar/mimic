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
                        <span>C:\Users\장준혁\Downloads</span>
                      </div>
                      <button type="button" class="button-filled-black">위치 지정하기</button>
                    </div>                  
                  </dd>
                </dl>
                <dl>
                  <dt>재생</dt>
                  <dd>
                    <div class="settings-box">
                      <div>
                        <strong>내장 플레이어 사용</strong>
                        <span>스트리밍에 필요한 플레이어를 사용합니다</span>
                      </div>
                      <div class="checkbox-slider">
                        <input type="checkbox" id="checkbox-slider-1" checked>
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
  export default {
    name: 'Preferences',
    methods: {
      close() {
        this.$emit('close')
      }
    }
  }
</script>

<style>

</style>