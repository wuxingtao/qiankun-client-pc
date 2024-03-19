import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
import { getUserPreference, setUserPreference } from '@/utils/storage'

const STORAGE_KEY = 'isShowWaybillNoInSingle'

class Guide {
  constructor() {
    this.driver = new Driver({
      className: 'waybill-single-guide',
      onReset: () => {
        setUserPreference(STORAGE_KEY, true)
      },
    })
  }

  async start() {
    const flag = await getUserPreference(STORAGE_KEY)
    if (flag) {
      return
    }

    this.driver.highlight({
      element: '#single-yd-no',
      popover: {
        title: ' ',
        closeBtnText: '知道了',
        description: '主人，运单号移动到这里了~',
        position: 'bottom-left',
        padding: 25,
        offset: -10,
      },
    })
  }
}

export default new Guide()
