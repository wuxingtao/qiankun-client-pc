import deliveryApi from '@api/delivery'

export default function ({formData,shareData}) {

  const validateFields = async({fields,errorMsgs})=>{
    if (!Array.isArray(fields)) {
      fields = [fields]
    }
    errorMsgs && fields?.filter(f=>errorMsgs.hasOwnProperty(f))?.forEach(f=>{
      errorMsgs[f] = ''
    })
    const res = await deliveryApi.validateWaybillField(formData,fields)
    res.data?.errorResult?.filter(e=>errorMsgs.hasOwnProperty(e.field))?.forEach(e=>{
      errorMsgs[e.field] = e.msg
    })
  }
  return{
    validateFields
  }
}