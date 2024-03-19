import { affect } from '@/views/waybill/config/affect'
import { affectTypeEnum } from '@/views/waybill/enum/affectEnum'

export const getAffectStyle = status => {
  if (!status) return
  return affect.has(status) && affect.get(status)
}

export const getAffectUrl = status => {
  if(!status) return
  if(affect.has(status)) {
    return require("@/assets/image/delivery/affect-reason/"+affect.get(status)+".png")
  }
  return ''
}

export const getMark = (status, affectType) => {
  if(affectType === affectTypeEnum.WARNING || !status) return ''
  if(affectType === affectTypeEnum.UNFREEZE) return require("@/assets/image/waybill/affect_mark_unfreeze.png")
  if(affect.has(status)) {
    return require("@/assets/image/waybill/affect_mark_"+affect.get(status)+".png")
  }
}