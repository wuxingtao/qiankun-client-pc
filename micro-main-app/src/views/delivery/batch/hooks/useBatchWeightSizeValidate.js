import useWeightSizeValidate from '../../hooks/useWeightSizeValidate'
import deliveryApi from '@api/delivery'
import useAddress from '@/hooks/useAddress'

export default function(){
  const { getOverWeightMessage } = useWeightSizeValidate()
  const { parseAddress } = useAddress()

  const parseSendAndReceiverAddress = async row=>{
    const addressFields = ['sjAddress', 'qhAddress']
    const promiseList =  addressFields.map(f=>new Promise( async resolve=>{
      if(!row[f].data?.districtList){
        row[f].data = await parseAddress(row[f].value) 
      }
      resolve()
    }))
    await Promise.all(promiseList)
  }
  const setPlaneOverloadInfo = async row =>{
    const addressFields = ['sjAddress', 'qhAddress']
    await parseSendAndReceiverAddress(row)
    const hasCity = addressFields.every(f=>row[f].data?.districtList?.length>1)
    const serviceWay = row['serviceWay'].value
    row['planeListInfo'] = {value:null}
    if(serviceWay && hasCity){
      const sendCity = row['qhAddress'].data.districtList[1]
      const receiveCity = row['sjAddress'].data.districtList[1]
      const res = await deliveryApi.getPlaneOverloadInfo(sendCity,receiveCity,serviceWay)
      if(res.code === 0 && res.data?.length>0){
        row['planeListInfo'] = {value : res.data[0]}
      }
    }
  }

  return{
    parseSendAndReceiverAddress,
    setPlaneOverloadInfo,
    getOverWeightMessage
  }
}