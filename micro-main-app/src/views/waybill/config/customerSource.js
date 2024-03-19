import { customerSourceEnum } from '../enum/queryEnum'

export default [
  {
    label: '我寄的',
    value: customerSourceEnum.SENDED,
  },
  {
    label: '我收的',
    value: customerSourceEnum.RECEIVED,
  },
  {
    label: '我付款的',
    value: customerSourceEnum.PAIED,
  },
]
