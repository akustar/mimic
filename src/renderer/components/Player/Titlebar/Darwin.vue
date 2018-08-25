<template>
  <div class="win32">
		<div class="titlebar-edge"></div>
    <div class="titlebar-buttons" @mousedown.stop>
      <div class="titlebar-close" @click="winClose">
        <svg width="12" height="12" viewBox="0 0 12 12"><path stroke="#4c0000" fill="none" d="M8.5,3.5 L6,6 L3.5,3.5 L6,6 L3.5,8.5 L6,6 L8.5,8.5 L6,6 L8.5,3.5 Z"></path></svg>
      </div>
      <div class="titlebar-minimize" @click="winMinimize">
        <svg width="12" height="12" viewBox="0 0 12 12"><rect fill="#975500" width="8" height="2" x="2" y="5" fill-rule="evenodd"></rect></svg>
      </div>
      <div class="titlebar-maximize" @click="winFullScreen">
        <svg width="12" height="12" viewBox="0 0 12 12"><g fill="#006500" fill-rule="evenodd"><path d="M5,3 C5,3 5,6.1325704 5,6.48601043 C5,6.83945045 5.18485201,7 5.49021559,7 L9,7 L9,6 L8,6 L8,5 L7,5 L7,4 L6,4 L6,3 L5,3 Z" transform="rotate(180 7 5)"></path><path d="M3,5 C3,5 3,8.1325704 3,8.48601043 C3,8.83945045 3.18485201,9 3.49021559,9 L7,9 L7,8 L6,8 L6,7 L5,7 L5,6 L4,6 L4,5 L3,5 Z"></path></g></svg>
      </div>
    </div>
  </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'

  export default {
    data () {
      return {
        win: remote.getCurrentWindow()
      }
    },
    methods: {
      winMinimize () {
        this.win.minimize()
      },
      winClose () {
        this.win.close()
      },
      winFullScreen () {
        const isFullScreen = this.win.isFullScreen()
        this.win.setFullScreen(!isFullScreen)

        this.$emit('fullScreen', isFullScreen)
      }
    }
  }
</script>

<style scoped>
  .titlebar-name {
    padding: 0 8px;
    font-size: 13px;
    cursor: default;
  }

  .titlebar-edge {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 4px;
    cursor: ns-resize;
    -webkit-app-region: no-drag;
  }

  .titlebar-buttons {
    display: flex;
    justify-content: space-between;
    width: 68px;
    padding: 0 8px;
    pointer-events: auto;
    -webkit-app-region: no-drag;
  }
  
  .titlebar-buttons svg {
    display: block;
    visibility: hidden;
  }

  .titlebar-buttons:hover svg {
    visibility: visible;
  }

  .titlebar-buttons > div {
    height: 12px;
    width: 12px;
    border-radius: 50%;
  }

  .titlebar-buttons > div.titlebar-close {
    background-color: #fc615d;
  }

  .titlebar-buttons > div.titlebar-minimize {
    background-color: #fdbc40;
  }

  .titlebar-buttons > div.titlebar-maximize {
    background-color: #34c749;
  }

  .unfocused .client .titlebar-buttons > div {
    background-color: #dcdcdc;
    opacity: .3;
  }
</style>