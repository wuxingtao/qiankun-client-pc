// 消费明细数据表头
export const consumptionTableHead = [{
  prop: 'waybillNumber',
  label: '运单号',
  text: "运单号",
  width: 170,
}, {
  prop: 'shippingCompany',
  label: '寄件公司',
  text: "寄件公司",
}, {
  prop: 'collectCompany',
  label: '收件公司',
  text: "收件公司",
}, {
  prop: 'paymentCustomerName',
  label: '付款公司',
  text: "付款公司",
}, {
  prop: 'shippingDate',
  label: '寄件时间',
  text: "寄件时间",
  sortable: true,
  width: 140,
}, {
  width: 150,
  prop: 'flexDecimal',
  label: '消费金额(元)',
  text: "消费金额(元)",
  sortable: true,
}]

export const ConsumptionTableData = [{
  waybillNumber: 'KY001',
  shippingCompany: '2017-10-31 09:23',
  collectCompany: '1000',
  paymentCustomerName: '微信',
  shippingDate: '充值',
  flexDecimal: '1000',
}]

// 充值明细数据表头
export const rechargeTableHead = [{
  prop: 'index',
  text: "序号",
  label: '序号'
}, {
  prop: 'tradeDate',
  text: "充值时间",
  label: '充值时间',
  sortable: true,
}, {
  prop: 'depositType',
  text: "充值类型",
  label: '充值类型',
  width: 300,
}, {
  prop: 'discountRate',
  text: "寄件时间",
  label: '折扣',
}, {
  prop: 'actualAmount',
  text: "充值金额(¥)",
  label: '充值金额(¥)',
  sortable: true,
}]

export const listTabelData = [{
  id: '2017-10-31 09:23',
  tradeDate: '充值',
  depositType: '+1000',
  discountRate: '1000',
  actualAmount: '1000'
}]
