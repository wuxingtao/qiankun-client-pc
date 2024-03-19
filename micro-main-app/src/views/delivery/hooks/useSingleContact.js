import { onMounted, ref } from '@vue/composition-api'
import store from '@/store'
import * as addressApi from '@/services/api/address'
import deliveryApi from '@/services/api/delivery'
import formatUtil from '@/utils/format'
import { getCustomerCode, getPhone } from '@/utils/storage'

export default function({ vm, isReceriver, isSender }) {
  // const senderList = ref([])
  // const receriverList = ref([])

  // onMounted(async () => {
  //   if (isSender) {
  //     senderList.value = await queryContactList('10', '', 10000)
  //   }
  //   if (isReceriver) {
  //     receriverList.value = await queryContactList('20', '', 10000)
  //   }
  // })


  /**
   * 查询地址薄数据
   * @param {*} addressType 寄方：10，收方：20
   * @param {*} queryString
   * @param {*} pageSize
   */
  const queryContactList = async (addressType, queryString, pageSize = 50) => {
    const params = {
      phone: getPhone(),
      customerCode: vm.$store.getters.authorityIds.includes('031') ? getCustomerCode() : '',
      addressType: addressType,
      page: 1,
      pageSize: pageSize,
      keyword: queryString
    }
    const res = await addressApi.queryAddressBook(params)
    if (res.code === 0) {
      return res.data.rows.map(r =>
        Object.assign(r, {
          address: [r.province , r.city , r.area , r.address].filter(f=>f).join(''),
          detailAddress: r.address
        })
      )
    }
    return []
  }

  const  queryAddressHistory = async isSender=>{
    const key = isSender?'senderHistoryContactList':'receiverHistoryContactList'
    const list =  store.state.delivery[key] 
    if(list){
      return list
    }
    const action = isSender?'setSenderHistoryContactListAction':'setReceiverHistoryContactListAction'
    await store.dispatch(`delivery/${action}`)
    return list || []
  }

  const querySenderContactList = async (queryString, cb) => {
    if(!queryString){
      const results = await queryAddressHistory(true)
      cb(results)
    }else{
      return await queryFormatedContactList(true, queryString, cb)
    }
  }

  const queryReceiverContactList = async (queryString, cb) => {
    if(!queryString){
      const results = await queryAddressHistory(false)
      cb(results)
    }else{
      return await queryFormatedContactList(false, queryString, cb)
    }
  }


  const queryFormatedContactList = async (isSender, queryString, cb) => {
    // let list = isSender ? senderList?.value : receriverList?.value
    // let results = []
    // if (list && list.length > 0) {
    //   if (queryString) {
    //     const fields = ['address', 'company', 'contactPhone', 'contact']
    //     list = list.filter(f => fields.find(c => f[c]?.includes(queryString)))
    //   }
    //   results = list.slice(0, 50)
    // } else {
    //   results = await queryContactList(isSender ? '10' : '20', queryString, 50)
    // }
    const results = await queryContactList(isSender ? '10' : '20', queryString, 50)
      results?.forEach(item => {
        const regExp = new RegExp(`(${queryString})`, 'ig')
        const replacement = '<span style=\'color:#8365f6;font-weight:bold;\'>$1</span>'
        item.contactRaw = item.contact?.replace(regExp, replacement)

        const mobile = formatUtil.formatMobliePhone(item.contactPhone)
        const phone = item.contactPhone ? mobile : item.telephone
        item.contactPhoneRaw = phone?.replace(regExp, replacement)
        item.companyRaw = item.company?.replace(regExp, replacement)
      })
    cb(results)
  }

  const handlePhoneOnPaste = (e,formData,field)=>{
    const text = e.clipboardData?.getData('Text')
    if(!text){
      return
    }
    const isMobile = !['jjTelePhone','sjTelephone','qhTelePhone'].includes(field)
    const reg = isMobile ? /[^\d]/g : /[^\d\-]/g
    const maxLength = isMobile ? 11 : 21
    formData[field] = text.replace(reg,'').substr(0,maxLength)
  }

  return {
    queryContactList,
    queryReceiverContactList,
    querySenderContactList,
    handlePhoneOnPaste
  }
}
