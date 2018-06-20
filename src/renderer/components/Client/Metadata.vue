<template>
  <div class="metadata">
    <div class="name ellipsis">{{ name }}</div>
    <div class="status ellipsis">
      <span>{{ status }}</span>
      <span>{{ length }}</span>
      <span>{{ numPeers }} Peers</span>
      <span><i class="material-icons md-14" style="color: #00b0f4;">arrow_downward</i>&nbsp;{{ downloadSpeed }}</span>
      <span><i class="material-icons md-14" style="color: #f04747;">arrow_upward</i>&nbsp;{{ uploadSpeed }}</span>
      <span>{{ progress }}%</span>
    </div>
    <div><span class="progress"><span class="base" :style="{ width: progress + '%' }"></span></span></div>    
  </div>
</template>

<script>
  export default {
    name: 'metadata',
    props: ['torrent'],
    methods: {
      prettyBytes(num = 0) {
        let exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        if (neg) num = -num
        if (!num || num < 1) return (neg ? '-' : '') + num + 'B'
        exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
        num = Number((num / Math.pow(1000, exponent)).toFixed(2))
        unit = units[exponent]
        return (neg ? '-' : '') + num + unit
      }
    },
    computed: {
      name() {
        return this.torrent.name
      },
      progress() {
        const persent = (100 * this.torrent.progress)
        return (persent || 0).toFixed(1)
      },
      status() {
        return this.torrent.progress === 1 ? '업로드 중' : '다운로드 중'
      },
      numPeers() {
        return this.torrent.numPeers || 0
      },
      downloadSpeed() {
        return this.prettyBytes(this.torrent.downloadSpeed)
      },
      uploadSpeed() {
        return this.prettyBytes(this.torrent.uploadSpeed)
      },
      downloaded() {
        return this.prettyBytes(this.torrent.downloaded)
      },
      length() {
        return this.prettyBytes(this.torrent.length || 0)
      }
    }    
  }
</script>

<style>
  .metadata {
    padding: 20px 15px 0;
  }
  .metadata > div {
    width: 100%;
    line-height: 24px;
    color: rgba(255,255,255,0.7); 
  }
  .metadata .name {
    font-size: 15px;
    margin-bottom: 4px;
  }
  .metadata .status span {
    margin-right: 14px;
  }
  .metadata .status span:last-child {
    margin-right: 0;
  }
  .metadata .progress {
    display: block;
    width: 100%;
    height: 4px;
    margin: 6px 0;
    background-color: rgba(0,0,0,.35);
    overflow: hidden;
  }
  .metadata .progress .base {
    display: block;
    width: 0%;
    height: 100%;
    background-color: #6fcf97;
  }
</style>