import {cloneDeep} from 'lodash'
import store from '@/store'

//组件内共享数据
const shareData= {
  loadingFlags:{
    loadData:false,//新增或修改时加载数据
    saveData:false,//保存数据
    collectionFee:false, //代收费用
    insuredFee:false, //保费
    validating:false,//校验
    loadServiceWay:false,
    estimateFreight: false,//预估运费
  },
  returnWarehouseDisabled: false,
  // receiverWarehouseDisabled: false,
  estimateFreight:{},//预估运费
  coupon:{}, //优惠券
  allWareHouseList:[],//所有仓库
  visibleOfOpenBoxTip:false,
  waybillModifyStatus:'', //为空：其它，10:状态1（一般运单），20：状态2（内部件/特惠）,30:状态3（一票一议）
  disabledCollectionPrice: false, //是否禁用代收货款
  planeListInfo:{},//飞机超载信息

  suggestions:{
    declaredValue: { value: '', tip: '' },
    serviceWay: { value: '', tip: '' },
    hdCount: { value: '', tip: '' },
    mjWay: { value: '', tip: '' },
    dsMoney: { value: '', tip: '' },
    jjRemark: { value: '', tip: '' }
  }
}

//表单数据
const formData= {
  //辅助字段
  allocationId:'',//配货信息Id
  noPayCustomerFlag:'', //收方付时，10无付款公司，不走付款授权
  delayTime: null, //延迟取货时长（小时）
  volumetricWeightRatio: 0, //抛重系数
  estimateArriveTime:'', //预计到达时间
  no:'',
  ydNo: '',
  NeedUnbox: 0, //开箱标识
  insuranceFeeType:0,//保费类型(10-默认保费 20-强制保费 )
  //寄方信息
  jjCompany: '',
  jjContactPerson: '',
  sms: '', //寄件手机号,
  jjTelePhone: '',
  houseType:'',//仓库类型
  sendHouseName: '', //寄方退货仓
  qhAddressData:{
    districtList:[],
    detailAddress:'',
  },
  qhAddress: '',
  qhContactPerson: '',
  qhContactWay: '',
  qhTelePhone: '',
  //收方信息
  sjAddressData:{
    districtList:[],
    detailAddress:'',
  },
  sjAddress: '',
  sjCompany: '',
  sjContactPerson: '',
  sjMobile: '',
  sjTelephone: '',
  isSignSelf: false,
  // receiptHouseName: '',//入库仓
  //货物信息
  goodsTime:'',
  goods: '',
  weight: '',
  count: '',
  //服务信息
  payWay: '',
  payAccount: '',
  vipshopCode: '',
  serviceWay: '',
  declaredValue: '', //保价声明
  premium: '', //保费
  insuranceValueSource:'',  //10：强制保费，20：人工录入
  receiptFlag: '',
  hdCount: '',
  mjWay: '',
  dsMoney: '', //代收货款
  dsCommission: '', //代收手续费
  jjRemark: '',
  cube:'',
  sizeList: [],//{sku,length,width,height,count}
  // goodsInfo: '',
  isSaveSenderInfo:true, //是否保存到寄方地址薄
  isSaveReceiverInfo:true, //是否保存到收方地址薄
  coupon: {} , //	奖券信息
  oldCouponCode:'', //奖券编码
  // collectPointId:'',
  paymentCustomerName:'',//付款公司名称
  paymentCustomerCode:'', //付款公司编码
  checkedCustomsCharge: '' , //是否勾选报关入仓，'10'为勾选，'20'为不勾选，空为没命中报关入仓条件
}

export function getFormData(){
  const tempFormData = cloneDeep(formData)
  const customFields = store.getters.customFields || {}
  customFields.forEach(item => {
    tempFormData[item.prop] = ''
  })
  return tempFormData
}

export function getShareData(){
  return cloneDeep(shareData)
}