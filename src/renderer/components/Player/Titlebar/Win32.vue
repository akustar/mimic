<template>
  <div class="win32">
		<div class="titlebar-edge"></div>
		<div class="titlebar-name ellipsis">{{ mediaName }}</div>
    <div class="titlebar-buttons" @mousedown.stop>
      <div class="titlebar-minimize" @click="winMinimize">
        <svg width="12" height="12" viewBox="0 0 12 12"><rect fill="#ffffff" width="10" height="1" x="1" y="6"></rect></svg>
      </div>
      <div class="titlebar-maximize" @click="winMaximize">
        <svg width="12" height="12" viewBox="0 0 12 12"><rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="#ffffff"></rect></svg>
      </div>
      <div class="titlebar-close" @click="winClose">
        <svg width="12" height="12" viewBox="0 0 12 12"><polygon fill="#ffffff" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon></svg>
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
      winMaximize () {
        if(!this.win.isMaximized()) {
          this.win.maximize()
        }
        else {
          this.win.unmaximize()
        }
      },
      winMinimize () {
        this.win.minimize()
      },
      winClose () {
        this.win.close()
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
  }

  .titlebar-buttons {
    display: flex;
  }

  .titlebar-buttons > div {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 22px;
    opacity: .6;
    pointer-events: auto;
    -webkit-app-region: no-drag;
    cursor: pointer;
  }

  .titlebar-buttons > div:hover {
    opacity: 1;
  }

  .titlebar-buttons > div.titlebar-minimize:hover,
  .titlebar-buttons > div.titlebar-maximize:hover {
    background-color: rgba(255,255,255,0.1);
  }
  
  .titlebar-buttons > div.titlebar-close:hover {
    background-color: #ec254f;
  }
</style>