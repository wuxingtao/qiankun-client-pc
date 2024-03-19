import { getPhone } from "@/utils/storage"
import { getOrderRemarkHistory } from '@api/waybillOld'

const OrderHistoryRemarkKey = `${getPhone()}Order-History-Remark`


// 默认运单备注
const defaultOrderHistoryRemark = [
  '需要称重', '带上称重器', '加急', '提前联系'
]

export async function getOrderHistoryRemarkList () {
  try {
    // const storageHistory = JSON.parse(localStorage.getItem(OrderHistoryRemarkKey))||[]
    const res = await getOrderRemarkHistory()
    return  (res.code === 0 && res.data) || []
  } catch {
    return defaultOrderHistoryRemark
  }
}

export function setOrderHistoryRemarkList(value) {
  if(!value)
  {
    return
  }
  let list= JSON.parse(localStorage.getItem(OrderHistoryRemarkKey))||[]
  const index=list.indexOf(value)
  if(index<0)
  {
    if(list.length>=3)
    {
      list.splice(2,1)
    }
    list.unshift(value)
  }
  if(index>0)
  {
    list.splice(index,1)
    list.unshift(value)
  }
  return localStorage.setItem(OrderHistoryRemarkKey, JSON.stringify(list))
}
