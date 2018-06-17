import Vue from 'vue'
import Streaming from './Streaming.vue'
import 'material-design-icons/iconfont/material-icons.css'

var EventBus = new Vue()
Object.defineProperties(Vue.prototype, {
  $eventBus: {
    get() {
      return EventBus
    }
  }
})

new Vue({
  components: { Streaming },
  template: '<Streaming/>'
}).$mount('#streaming')