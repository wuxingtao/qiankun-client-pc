import {
  addEventTrackingApi,
} from '@/services/api/bill'

export const eventTracting= {
  bind(el, binding) {
    el.addEventListener('click', () => {
      const isPage = typeof binding.value !== 'string'
      const bizType = isPage ? 10 : 20
      const bizCode = isPage ? binding.value.bizCode : binding.value
      // console.log(bizType, bizCode) 
      addEventTrackingApi(bizType, bizCode)
      let newBizCode
      switch (bizCode.toLowerCase()) {
        case 'e006':
          newBizCode = 'P005'
          break
        case 'e022':
          newBizCode = 'P004'
          break
        case 'e018':
          newBizCode = 'P006'
          break
        case 'e019':
          newBizCode = 'P008'
          break
        case 'e020':
          newBizCode = 'P009'
          break
      }
      if (newBizCode) {
        addEventTrackingApi(10, newBizCode)
      }
    })
  }
}

