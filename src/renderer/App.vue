<template>
  <div id="app" :class="{ 'unfocused': unfocused }">
    <client></client>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import Client from '@/components/Client'
  
  export default {
    name: 'mimic',
    data () {
      return {
        unfocused: false
      }
    },    
    mounted () {
      this.setupIpc()
      this.initEvents()
    },
    methods: {
      initEvents () {
        document.addEventListener('click', event => {
          if (event.target.dataset.tippyClose) {
            document.body.click()
          }
        })
      },
      setupIpc () {
        ipcRenderer.on('focus', () => this.unfocused = false)
        ipcRenderer.on('blur', () => {
          this.unfocused = true

          document.body.click()
        })
      }
    },
    components: {
      Client
    }
  }
</script>

<style>
  @import './assets/stylesheets/base.css';
</style>

