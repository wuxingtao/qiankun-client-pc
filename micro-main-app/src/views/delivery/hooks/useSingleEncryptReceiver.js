import { computed, reactive, watch } from '@vue/composition-api'
import dataMask from '@/utils/dataMask'

export default function({formData}){
  const encryptField = reactive({
    sjAddress:{
      visible: false,
      value:''
    },
    sjContactPerson:{
      visible: false,
      value:'',
      replace:val=>dataMask.maskName(val)
    },
    sjMobile:{
      visible: false,
      value:'',
      replace:val=>dataMask.maskMobile(val)
    },
    sjTelephone:{
      visible: false,
      value:'',
      replace:val=>dataMask.maskTelephone(val)
    },
  })

  const receiverEncryptFields =computed(()=>{
    const {sjContactPerson,sjMobile,sjTelephone,sjAddress} = formData
    return {sjContactPerson,sjMobile,sjTelephone,sjAddress} 
  })

  watch(receiverEncryptFields,data=>{
    const fields = [{prop:'sjContactPerson',text:'收件人'},{prop:'sjMobile',text:'收件手机号码'},
      {prop:'sjTelephone',text:'收件固定电话'},{prop:'sjAddress',text:'收件地址'}]
    fields.forEach(item => {
      if(!data[item.prop]){
        encryptField[item.prop].visible = false
      }
      encryptField[item.prop].value = data[item.prop]
      encryptField[item.prop].content = data[item.prop]? `${item.text}：${data[item.prop]}` : ''
    })
  },{
    immediate:true,
    deep:true
  })

  return{
    encryptField
  }
}