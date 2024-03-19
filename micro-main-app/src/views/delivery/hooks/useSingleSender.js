import Regular from '@utils/regular'
import deliveryApi from '@api/delivery'
import { reactive,nextTick } from '@vue/composition-api'

export default function() {
  const checkEmojiOfSenderCompany = async (rule, value, callback) => {
    if (Regular.emoji.test(value)) {
      return callback('寄件公司不支持特殊字符')
    }
    callback()
  }

  const formRules = reactive({
    jjCompany: [
      { required: true, message: '请输入寄件公司', trigger: 'change' },
      { min: 2, message: '寄件公司不能少于2个字', trigger: 'change' },
      { max: 32, message: '寄件公司不得超过32个字', trigger: 'change' },
      { validator: checkEmojiOfSenderCompany, trigger: 'change' },
      {
        pattern: Regular.text1,
        message: '请输入正确的寄件公司名称',
        trigger: 'change'
      }
    ],
    jjContactPerson: [
      { required: true, message: '请输入寄件人', trigger: 'change' },
      { min: 2, message: '姓名不能少于2个字', trigger: 'change' },
      { max: 20, message: '姓名不得超过20个字', trigger: 'change' },
      {
        pattern: Regular.text2,
        message: '姓名不支持空格和特殊字符',
        trigger: 'change'
      },
      {
        pattern: /^((?!先生).)*$/,
        message: '请输入真实寄件人姓名',
        trigger: 'change'
      },
      {
        pattern: /^((?!女士).)*$/,
        message: '请输入真实寄件人姓名',
        trigger: 'change'
      },
      {
        pattern: /^((?!小姐).)*$/,
        message: '请输入真实寄件人姓名',
        trigger: 'change'
      },
      {
        pattern: Regular.text3,
        message: '请输入真实姓名',
        trigger: 'change'
      }
    ],
    sms: [
      {
        required: true,
        len: 11,
        message: '请输入11位手机号',
        trigger: 'change'
      },
      {
        pattern: Regular.mobileNumber,
        message: '请输入正确的手机号',
        trigger: 'blur'
      }
    ],
    jjTelePhone: [
      {
        required: false,
        pattern: Regular.landlinePhone3,
        message: '请输入正确的固定电话',
        trigger: 'blur'
      }
    ],
    qhContactPerson: [
      { min: 2, message: '姓名不能少于2个字', trigger: 'change' },
      { max: 20, message: '姓名不得超过20个字', trigger: 'change' },
      // {
      //   pattern: Regular.text2,
      //   message: '姓名不支持空格和特殊字符',
      //   trigger: 'change'
      // },
      // {
      //   pattern: /^((?!先生).)*$/,
      //   message: '请输入真实取货人姓名',
      //   trigger: 'change'
      // },
      // {
      //   pattern: /^((?!女士").)*$/,
      //   message: '请输入真实取货人姓名',
      //   trigger: 'change'
      // },
      // {
      //   pattern: /^((?!小姐").)*$/,
      //   message: '请输入真实取货人姓名',
      //   trigger: 'change'
      // },
      // {
      //   pattern: Regular.text3,
      //   message: '请输入真实姓名',
      //   trigger: 'change'
      // }
    ],
    qhContactWay: [
      { len: 11, message: '请输入11位手机号', trigger: 'blur' },
      {
        pattern: Regular.mobileNumber,
        message: '请输入正确的手机号',
        trigger: 'blur'
      }
    ],
    qhTelePhone: [
      {
        required: false,
        pattern: Regular.landlinePhone3,
        message: '请输入正确的固定电话',
        trigger: 'blur'
      }
    ],
  })

  const validateSenderAddressRestrict = async (senderInfoRef,formData) =>{
    // senderInfoRef.value.errorMsgs.qhAddress = ''
    // senderInfoRef.value.errorMsgs.qhAddressRestrict = ''
    // senderInfoRef.value.warningMsgs.qhAddress = ''
    // senderInfoRef.value.warningMsgs.qhAddressRestrict = ''
    // if (!await senderInfoRef.value.qhAddressRef.validateForm()) {
    //   return
    // }
    // const res = await deliveryApi.dispatchAddressRestrict(formData,true)
    // const errorItem = res.data.errorResult?.find(f => f.field === 'qhAddress')
    // const warnItem = res.data.warnResult?.find(f => f.field === 'qhAddress')
    // nextTick(() => {
    //   senderInfoRef.value.errorMsgs.qhAddressRestrict = errorItem?.msg
    //   senderInfoRef.value.warningMsgs.qhAddressRestrict = warnItem?.msg
    // })
  }

  return {
    formRules,
    validateSenderAddressRestrict
  }
}
