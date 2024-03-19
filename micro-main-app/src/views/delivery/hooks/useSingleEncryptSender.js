import { computed, reactive, watch } from '@vue/composition-api'
import dataMask from '@/utils/dataMask'

export default function({formData}){
  const encryptField = reactive({
    qhAddress:{
      visible: false,
      value:''
    },
    jjContactPerson:{
      visible: false,
      value:'',
      replace:val=>dataMask.maskName(val)
    },
    sms:{
      visible: false,
      value:'',
      replace:val=>dataMask.maskMobile(val)
    },
    jjTelePhone:{
      visible: false,
      value:'',
      replace:val=>dataMask.maskTelephone(val)
    },
    qhContactPerson:{
      visible: false,
      value:'',
      replace:val=>dataMask.maskName(val)
    },
    qhContactWay:{
      visible: false,
      value:'',
      replace:val=>dataMask.maskMobile(val)
    }
  })

  const sendEncryptFields =computed(()=>{
    const {jjContactPerson,sms,jjTelePhone,qhContactPerson,qhContactWay,qhAddress} =  formData
    return {jjContactPerson,sms,jjTelePhone,qhContactPerson,qhContactWay,qhAddress} 
  })

  watch(sendEncryptFields,data=>{
    const fields = [{prop:'jjContactPerson',text:'寄件人'},{prop:'sms',text:'寄件手机号码'},{prop:'jjTelePhone',text:'寄件固定电话'}
      ,{prop:'qhContactPerson',text:'取货联系人'},{prop:'qhContactWay',text:'取货人手机'},{prop:'qhAddress',text:'寄件地址'}]
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