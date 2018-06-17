import subsrt from './subsrt'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'
import fs from 'fs'

function buffer(path) {
  // 자막 파일을 가져옵니다.
  const content = fs.readFileSync(path)
  // 자막 파일의 인코딩 종류를 체크합니다.
  const encoding = jschardet.detect(content).encoding
  // UTF-8로 변환 합니다.
  const subtitle = iconv.decode(content, encoding);
  // webVTT 형식으로 변환 합니다.
  const vtt = subsrt.convert(subtitle, {format: 'vtt'})
  
  return 'data:text/vtt;base64,' + Buffer.from(vtt).toString('base64')
}

export default {
  buffer
}