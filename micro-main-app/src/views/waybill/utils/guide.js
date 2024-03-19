import { getUserPreference, setUserPreference } from '@/utils/storage'

const SHOW_GUIDE_OVERLAY_KEY = 'isShowGuideOverlay'
const SHOW_TAB_POPOVER_KEY = 'isShowTabPopover'
const SHOW_DELIVERY_MARK_POPOVER_KEY = 'isShowDeliveryMarkPopover'
const SHOW_DELIVERY_MODIFY_POPOVER_KEY = 'isShowDeliveryModifyPopover'

class Guide {
  constructor() {}

  async showOverlay() {
    const flag = await getUserPreference(SHOW_GUIDE_OVERLAY_KEY)
    return !!flag
  }

  closeOverlay() {
    setUserPreference(SHOW_GUIDE_OVERLAY_KEY, true)
  }

  async showPopover(key) {
    const flag = await getUserPreference(key)
    return !!flag
  }

  closePopover(key) {
    setUserPreference(key, true)
  }
}

export default new Guide()
