<template>
  <div>
    <question-naire ref='questionNaire' @close='getTimerRunData'></question-naire>
    <time-run-money :visible.sync='visibleTime' :tableData='timeRunData'></time-run-money>
    <ky-text-image-popup ref='kyTextImagePopupRef' />
    <ky-activity-popup ref='kyActivityPopupRef' />
  </div>
</template>

<script>
import QuestionNaire from '@/views/question-naire/dialogs/question-naire.vue'
import TimeRunMoney from '@/components/time-run-money.vue'
import messagePopup from '@/components/ky-message-popup/message-popup.js'
import * as storageUtil from '@/utils/storage'
import { getQuestionInfo } from '@/services/api/common'
import { getAgingOptimizeNotice } from '@/services/api/admin'

const UPGRADE_KEY = 'isShowGuideOverlay'

export default {
  name: 'DialogModule',
  mixins: [messagePopup],
  components: {
    QuestionNaire,
    TimeRunMoney,
  },
  data() {
    return {
      visibleTime: false,
      timeRunData: []
    }
  },
  methods: {
    async getQuestionData() {
      /*
      * 触发升级指引之前不展示问卷和时效
      * */
      const result = await storageUtil.getUserPreference(UPGRADE_KEY)
      if (result) {
        let popupResult = await this.handlePopup('pcSearch')
        if (!popupResult) {
          let res = await getQuestionInfo()
          if (res.code === 0 && res.data) {
            /** 触发问卷调查弹窗 */
            let str = false
            this.$store.state.openTabs.filter(item => {
              if (['/admin/survey', '/admin/survey-result', '/admin/survey-status'].includes(item.path)) {
                str = true
              } else {
                str = false
              }
            })
            if (str) return
            this.$refs.questionNaire.showDialog(res.data.title, res.data.description, res.data.questionUrl, res.data.uuid)
          } else {
            this.getTimerRunData()
          }
        }
      }
    },
    async getTimerRunData() {
      let param = {
        channel: '13001'
      }
      let res = await getAgingOptimizeNotice(param)
      if (res.code === 0) {
        if (res.data && res.data.isNotice === 1) {
          this.timeRunData = res.data.noticeDetails || []
          if (res.data.noticeDetails.length > 0) {
            this.visibleTime = true
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>