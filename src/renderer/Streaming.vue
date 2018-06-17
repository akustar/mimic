<template>
  <div id="streaming" class="streaming" :class="[platform, { 'unfocused': unfocused}]">
    <player></player>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import Player from '@/components/Player'

  export default {
    name: 'Streaming',
    data() {
      return {
        platform: 'is-'+ process.platform,
        unfocused: false
      }
    },
    mounted() {
      ipcRenderer.on('focus', () => this.unfocused = false)
      ipcRenderer.on('blur', () => this.unfocused = true)
    },
    components: {
      Player
    }
  }
</script>
<style>
  @import '/src/renderer/assets/css/reset.css';
  @import '/src/renderer/assets/css/common.css';
</style>
