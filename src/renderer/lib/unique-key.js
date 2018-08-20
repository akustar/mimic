import { ipcRenderer } from 'electron'

// From: https://stackoverflow.com/a/38872723
function revisedRandId () {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10)
}

function uniqueKey () {
  const randomKey = revisedRandId()
  const torrentSummary = ipcRenderer.sendSync('get', 'torrents')

  if (torrentSummary[randomKey]) {
    return uniqueKey()
  }
  else {
    return randomKey
  }
}

export default uniqueKey