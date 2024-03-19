export const tableConfigs = [
  {
    prop: 'waybillNumber',
    text: '运单号',
    width: '320',
    visible: true,
    defaultSlot: 'column_waybillNumber',
    prohibitHide: true
  },
  {
    prop: 'goodsTime',
    text: '货好时间',
    width: '150',
    visible: false,
    isSort: true,
    timeStampFormatter: true
  },
  {
    prop: 'count',
    text: '件数',
    width: '90',
    visible: true
  },
  {
    prop: 'actualWeight',
    text: '实际重量',
    width: '90',
    visible: true
  },
  {
    prop: 'goodsType',
    text: '托寄物',
    width: '100',
    visible: true,
    isSort: true
  },
  {
    prop: 'pickupPerson',
    text: '收件人',
    width: '100',
    visible: true
  },
  {
    prop: 'pickupCustomerName',
    text: '收件公司',
    width: '150',
    visible: true,
    isSort: true
  },
  {
    prop: 'pickupAddress',
    text: '收件地址',
    width: '300',
    visible: true
  },
  {
    prop: 'waybillStatusDesc',
    text: '运单状态',
    width: '170',
    defaultSlot: 'column_waybillStatus',
    visible: false
  },
  {
    prop: 'pickupMobile',
    text: '收件手机',
    width: '120',
    visible: false
  },
  {
    prop: 'pickupPhone',
    text: '收件电话',
    width: '140',
    visible: false
  },
  {
    prop: 'payModeDesc',
    text: '付款方式',
    width: '100',
    visible: false
  },
  {
    prop: 'paymentCustomer',
    text: '付款公司',
    width: '100',
    visible: false
  },
  // {
  //   prop: 'companyReceivable',
  //   text: '费用合计',
  //   width: '90',
  //   visible: false,
  // },
  {
    prop: 'selfSufficiencyBranchAddress',
    text: '自提地址',
    width: '90',
    visible: false
  },
  {
    prop: 'waybillRemark',
    text: '运单备注',
    width: '100',
    visible: false
  },
  {
    prop: 'freightWeight',
    text: '计费重量',
    width: '120',
    visible: false,
    isSort: true
  },
  {
    prop: 'deliveryCustomerName',
    text: '寄件公司',
    width: '300',
    visible: false,
    isSort: true
  },
  {
    prop: 'deliveryPerson',
    text: '寄件人',
    width: '100',
    visible: false,
    isSort: true
  },
  {
    prop: 'deliveryTime',
    text: '寄件时间',
    width: '160',
    visible: false,
    isSort: true,
    timeStampFormatter: true
  },
  {
    prop: 'deliveryMobile',
    text: '寄件手机',
    width: '150',
    visible: false
  },
  {
    prop: 'deliveryPhone',
    text: '寄件电话',
    width: '300',
    visible: false
  },
  {
    prop: 'pickupContactPerson',
    text: '取货联系人',
    width: '150',
    visible: false
  },
  {
    prop: 'pickupContactPhone',
    text: '取货联系手机',
    width: '150',
    visible: false
  },
  {
    prop: 'deliveryAddress',
    text: '寄件地址',
    width: '120',
    visible: false
  },
  {
    prop: 'receiver',
    text: '签收人',
    width: '80',
    visible: false
  },
  {
    prop: 'receiveTime',
    text: '签收时间',
    width: '160',
    visible: false,
    isSort: true,
    timeStampFormatter: true
  },
  {
    prop: 'productCode',
    text: '入库号',
    width: '100',
    visible: false
  },
  {
    prop: 'receiptFlagDesc',
    text: '回单服务',
    width: '100',
    visible: false
  },
  //TODO:检查字段名称,自定义列
  {
    prop: 'receiptCount',
    text: '回单份数',
    width: '100',
    visible: false
  },
  {
    prop: 'insuranceValue',
    text: '保价声明',
    width: '100',
    visible: false
  },
  {
    prop: 'collectAmount',
    text: '代收货款',
    width: '100',
    visible: false
  },
  {
    prop: 'woodenFrameFlagDesc',
    text: '包装服务',
    width: '100',
    visible: false
  },
  {
    prop: 'outWareHouseName',
    text: '寄方仓库',
    width: '100',
    visible: false
  },
  // { prop: 'inWareHouseName', text: '收方仓库', width: '100', visible: false },
  // { prop: 'inWareHouseTypeDesc', text: '仓库类型', width: '100', visible: false },
  {
    prop: 'receiptPic',
    text: '回单资料链接',
    width: '100',
    defaultSlot: 'column_downloadReceipt',
    visible: false
  },
  {
    prop: 'SizeText',
    text: '货物尺寸',
    width: '100',
    defaultSlot: 'column_sizeText',
    visible: false
  },
  // {
  //   prop: 'increamAmount',
  //   text: '增值费用',
  //   width: '100',
  //   visible: false,
  // },
  // { prop: 'freight', text: '运费', width: '100', visible: false },
  {
    prop: 'creationDate',
    text: '创建时间',
    width: '100',
    visible: false,
    timeStampFormatter: true
  },
  {
    prop: 'storageFeeStatusDesc',
    text: '货物保管状态',
    width: '140',
    minWidth: '140',
    visible: false,
    isSort: true
  },
  {
    prop: 'size',
    text: '体积',
    width: '150',
    minWidth: '140',
    visible: false
  }
]

export const chargeColumns = [
  {
    prop: 'totalAmount',
    text: '费用合计',
    width: '100',
    visible: false
  },
  {
    prop: 'freightAmount',
    text: '运费金额',
    width: '100',
    visible: false
  },
  {
    prop: 'extraAmount',
    text: '附加费用',
    width: '100',
    visible: false
  }
]

export const routeDescription = [
  {
    prop: 'routeDescription',
    text: '最新路由信息',
    width: '350',
    minWidth: '340',
    visible: false
  }
]

export const updationDate = [
  {
    prop: 'updationDate',
    text: '取消时间',
    width: '160',
    isSort: true,
    visible: false,
    timeStampFormatter: true
  }
]
