import Vue from 'vue'
import VueTippy from 'vue-tippy'
import Toasted from 'vue-toasted'
import App from './App'
import state from './lib/state'
import 'material-design-icons/iconfont/material-icons.css'

Vue.use(VueTippy, {
  duration: 0,
  size: 'small',
  popperOptions: {
    modifiers: {
      preventOverflow: {
        enabled: false
      },
      hide: {
        enabled: false
      }
    }
  }
})

Vue.use(Toasted, { 
  theme: 'primary', 
  position: 'bottom-right', 
  duration: 3 * 1000
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
