import dayjs from 'dayjs'
import { getAdvertisementDetails } from '@/services/api/common'
import KyActivityPopup from './activity-popup.vue'
import KyTextImagePopup from './text-image-popup.vue'

export default {
  name: 'message-popup',
  components: { KyActivityPopup, KyTextImagePopup },
  methods: {
    async handlePopup(pageCode) {
      let params = {
        channelCode: 'pc',
        pageCode: pageCode,
        adTypeList: ['20'],
        latestUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      let result = await getAdvertisementDetails(params)
      let flagResult = false
      if (result.code === 0 && result.data) {
        let model = result.data[0]
        if (model && model.advertisementType === '20') {
          switch (model.areaStyleCode) {
            case 'PC_POPUP_004':
              //this.$activityPopup(model.detailsList[0])
              this.$refs.kyActivityPopupRef.showDialog(model.detailsList[0])
              flagResult = true
              break
            case 'PC_POPUP_005':
            case 'PC_POPUP_006':
            case 'PC_POPUP_MODIFY_PRICE_006':
              //this.$textImagePopup(model.detailsList[0])
              this.$refs.kyTextImagePopupRef.showDialog(model.detailsList[0])
              flagResult = true
              break
          }
        }
      }

      return flagResult
    }
  }
}
