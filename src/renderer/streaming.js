import Vue from 'vue'
import Toasted from 'vue-toasted'
import Streaming from './Streaming.vue'
import 'material-design-icons/iconfont/material-icons.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.use(Toasted, { 
  theme: 'primary', 
  position: 'bottom-right', 
  duration: 3 * 1000
})

new Vue({
  components: { Streaming },
  template: '<Streaming/>'
}).$mount('#streaming')