<template>
  <div class="titlebar">
    <component :is="platform" />
  </div>
</template>

<script>
  import Darwin from './Titlebar/Darwin'
  import Win32 from './Titlebar/Win32'

  export default {
    data() {
      return {
        platform: process.platform
      }
    },
    components: {
      Darwin,
      Win32
    }    
  }
</script>

<style scoped>
  .titlebar > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 22px;
    z-index: 9999;
    background-color: #202225;
    -webkit-app-region: drag;
    pointer-events: none;
  }
</style>