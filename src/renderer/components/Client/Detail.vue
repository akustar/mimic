<template>
  <div class="detail" @click.stop>
    <div class="table">
      <table>
        <colgroup>
          <col style="width: 42px">
          <col style="">
          <col style="width: 38px">
          <col style="width: 70px">
          <col style="width: 65px">
        </colgroup>
        <tbody v-if="summary">
          <tr v-for="(file, fileIndex) in summary.files" :key="fileIndex">
            <td>
              <button type="button" title="열기" v-tippy="{placement: 'bottom', distance: 5}" @click="openFile(file, fileIndex)"><i class="material-icons md-24">{{ fileType(file) }}</i></button>
            </td>
            <td>{{ file.name }}</td>
            <td class="text-right">{{ progress(fileIndex) }}</td>
            <td class="text-right">{{ prettyBytes(file.length) }}</td>
            <td class="text-right">
              <div class="checkbox-slider">
                <input type="checkbox" :id="'checkbox-slider-' + fileIndex" @change="selectFiles(fileIndex)" :checked="summary.selections[fileIndex]">
                <label :for="'checkbox-slider-' + fileIndex"></label>
              </div>
            </td>
          </tr>          
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import { ipcRenderer,shell } from 'electron'
  import path from 'path'
  import fileExtension from '../../lib/file-extension'

  export default {
    name: 'Detail',
    props: ['torrentKey', 'fileProg'],
    data() {
      return {
        torrentSummary: null,
        summary: null
      }
    },
    mounted() {
      this.torrentSummary = ipcRenderer.sendSync('get', 'torrents')
      this.summary = this.torrentSummary[this.torrentKey]
    },
    methods: {
      fileType(file) {
        if (fileExtension.isVideo(file)) return 'videocam'
        else if (fileExtension.isAudio(file)) return 'music_note'
        else if (fileExtension.isImage(file)) return 'insert_photo'
        else return 'description'
      },
      progress(fileIndex) {
        const { numPiecesPresent, numPieces } = this.fileProg[fileIndex]
        if (numPiecesPresent && numPieces) {
          return Math.round(100 * numPiecesPresent / numPieces) + '%'
        }
      },
      selectFiles(fileIndex) {
        this.summary.selections[fileIndex] = !this.summary.selections[fileIndex]

        ipcRenderer.send('set', 'torrents', this.torrentSummary)
        ipcRenderer.send('wt-select-files', this.torrentKey, this.summary.infoHash, this.summary.selections)
      },
      openFile(file, fileIndex) {
        const openExternalPlayer  = ipcRenderer.sendSync('get', 'openExternalPlayer')
        // 재생할 수 있는 파일인지 확인합니다.
        if (fileExtension.isPlayable(file) && !openExternalPlayer) {
          ipcRenderer.send('wt-start-streaming', this.torrentKey, this.summary.infoHash, file.name, fileIndex)
        }
        // 재생 파일이 아닌 경우
        else {
          shell.openExternal(path.join(this.summary.downloadPath, file.path))
        }
      },
      prettyBytes(num = 0) {
        let exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        if (neg) num = -num
        if (num < 1) return (neg ? '-' : '') + num + 'B'
        exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
        num = Number((num / Math.pow(1000, exponent)).toFixed(2))
        unit = units[exponent]
        return (neg ? '-' : '') + num + unit
      }
    }
  }
</script>

<style>
  .detail .checkbox-slider{
    display: block;
    margin-left: auto;
  }
  .detail button {
    color: #fff;
  }
  .detail .table table {
    table-layout: fixed
  }
  .detail .table table td {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;    
  }
  .detail .table table th:first-child,
  .detail .table table td:first-child {
    padding-left: 15px;
  }
  .detail .table table th:nth-child(2),
  .detail .table table td:nth-child(2) {
    padding-left: 3px;
  }  
  .detail .table table th:last-child,
  .detail .table table td:last-child {
    padding-right: 15px;
  }  
  .detail .table table thead th {
    padding: 4px 0;
  }
  .detail .table table tbody tr:hover {
    background-color: rgba(0,0,0,.3);
  }
  .poster .detail .table table tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
</style>