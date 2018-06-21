<template>
  <div id="app" :class="[platform, { 'unfocused': unfocused }]">    
    <client></client>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import Client from '@/components/Client'
  
  export default {
    name: 'mimic',
    data() {
      return {        
        unfocused: false,
        platform: 'is-' + process.platform
      }
    },
    mounted() {
      ipcRenderer.on('focus', () => this.unfocused = false)
      ipcRenderer.on('blur', () => {
        this.unfocused = true
        document.body.click()
      })

      document.addEventListener('click', event => {
        if (event.target.dataset.tippyClose) {
          document.body.click()
        }
      })
    },
    components: {
      Client
    }
  }
</script>

<style lang='scss'>
@import '~@/assets/stylesheets/main.scss';
</style>

