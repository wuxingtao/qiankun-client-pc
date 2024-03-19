import Regular from '@utils/regular'
import { reactive } from '@vue/composition-api'

export default function({ formData, receiverFormRef }) {
  const checkEmojiOfReceiverCompany = async (rule, value, callback) => {
    if (Regular.emoji.test(value) ) {
      return callback('收件公司不支持特殊字符')
    }
    callback()
  }
  const checkReceiverContactWay = async (rule, value, callback) => {
    if (!formData.sjMobile && !formData.sjTelephone) {
      callback(new Error('手机号码或固定电话至少填写一项'))
      receiverFormRef.value.clearValidate(['sjTelephone'])
      return
    }
    if (rule.field === 'sjTelephone') {
      receiverFormRef.value.validateField(['sjMobile'])
    }
    callback()
  }
  const formRules = reactive({
    sjCompany: [
      { min: 2, message: '收件公司不能少于2个字', trigger: 'change' },
      { max: 32, message: '收件公司不得超过32个字', trigger: 'change' },
      { validator: checkEmojiOfReceiverCompany, trigger: 'change' },
      {
        pattern: Regular.text1,
        message: '请输入正确的收件公司名称',
        trigger: 'change'
      }
    ],
    sjContactPerson: [
      { required: true, message: '请输入收件人', trigger: 'change' },
      { min: 2, message: '姓名不能少于2个字', trigger: 'change' },
      { max: 20, message: '姓名不得超过20个字', trigger: 'change' },
      // {
      //   pattern: Regular.text2,
      //   message: '姓名不支持空格和特殊字符',
      //   trigger: 'change'
      // }
    ],
    sjMobile: [
      { required: false, len: 11, message: '请输入11位手机号', trigger: 'blur' },
      { pattern: Regular.mobileNumber, message: '请输入正确的手机号', trigger: 'blur' },
      { validator: checkReceiverContactWay, trigger: 'change' }
    ],
    sjTelephone: [
      {
        required: false,
        pattern: Regular.landlinePhone3,
        message: '请输入正确的固定电话',
        trigger: 'blur'
      },
      { validator: checkReceiverContactWay, trigger: 'change' }
    ]
  })

  return {
    formRules
  }
}
