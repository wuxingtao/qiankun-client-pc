import Vue from 'vue'
import ActivityPopup from './activity-popup.vue'
import TextImagePopup from './text-image-popup.vue'

const ComponentActivity = Vue.extend(ActivityPopup)
const ComponentText = Vue.extend(TextImagePopup)

let activity_instance = null

function activityMessageBox(options) {
  if (!activity_instance) {
    activity_instance = new ComponentActivity({
      el: document.createElement('div'),
      data() {
        return options
      }
    })
    document.body.appendChild(activity_instance.$el)

    Vue.nextTick(() => {
      activity_instance.showDialog(options)
    })
  } else {
    activity_instance.showDialog(options)
    Object.assign(activity_instance, options)
  }
}

let instance = null

function textImageMessageBox(options) {
  if (!instance) {
    instance = new ComponentText({
      el: document.createElement('div'),
      data() {
        return options
      }
    })
    document.body.appendChild(instance.$el)

    Vue.nextTick(() => {
      instance.showDialog(options)
    })
  } else {
    instance.showDialog(options)
    Object.assign(instance, options)
  }
}

export default {
  install() {
    Vue.prototype.$activityPopup = activityMessageBox
    Vue.prototype.$textImagePopup = textImageMessageBox
  }
}
