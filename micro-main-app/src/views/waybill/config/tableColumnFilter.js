import { statusEnum } from '../enum/queryEnum'

/**
 * 用于配置特殊展示条件的语句
 * waybillStatus用来界定展示的订单转态
 * getter用来界定权限相关
 * */

export default [
  {
    field: 'storageFeeStatusDesc',
    waybillStatus: [statusEnum.UNSIGNED, statusEnum.SIGNED, statusEnum.ALL],
  },
  {
    field: 'goodsTime',
    waybillStatus: [statusEnum.PICKUP, statusEnum.ALL],
  },
  {
    field: 'deliveryTime',
    waybillStatus: [statusEnum.UNSIGNED, statusEnum.SIGNED, statusEnum.ALL],
  },
  {
    field: 'freightWeight',
    waybillStatus: [statusEnum.UNSIGNED, statusEnum.SIGNED, statusEnum.ALL],
  },
  {
    field: 'companyReceivable',
    waybillStatus: [statusEnum.UNSIGNED, statusEnum.SIGNED, statusEnum.ALL],
  },
  {
    field: 'increamAmount',
    waybillStatus: [statusEnum.UNSIGNED, statusEnum.SIGNED, statusEnum.ALL],
  },
  {
    field: 'receiver',
    waybillStatus: [statusEnum.SIGNED, statusEnum.ALL],
  },
  {
    field: 'receiveTime',
    waybillStatus: [statusEnum.SIGNED, statusEnum.ALL],
  },
  {
    field: 'productCode',
    getters: 'isVipshopUser',
  },
  {
    field: 'receiptPic',
    waybillStatus: [statusEnum.SIGNED],
  },
]
