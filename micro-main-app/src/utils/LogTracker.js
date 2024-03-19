
import httpRequest from '@/services/request2'
import { getPhone ,getCustomerCode} from './storage'


const menuList=[
  // { path: '/eawb/order' ,   menuId:'1294231344182792198' } ,   //下单寄件
  // { path: '/eawb/list' ,  menuId:'1294231344182792199'  } ,//运单管理
  // { path: '/admin/waybill' ,  menuId:'1294231344182792199'  } ,//运单管理
  // { path: '/admin/delivery' ,   menuId:'1294231344182792198' } ,   //下单寄件
  // { path: '/admin/serviceGoodsLoc' ,  menuId:'1294231344182792200'  } ,//取货定位
  // { path: '/admin/serviceOrderLoc' ,  menuId:'1294231344182792201' }  ,//运单跟踪
  // { path: '/admin/serviceStore' ,  menuId:'1294231344182792202'  } ,//网点查询
  // { path:'/admin/servicePrice'  ,  menuId:'1294231344182792203' }  ,//时效查询
  // { path:'/billmanage/prestored/list'  ,  menuId:'1294231344182792204'  } ,//客户预存
  // { path: '/billmanage/checkbill/list' ,  menuId:'1294231344182792205'  } ,//客户对账
  // { path: '/billmanage/invoice/list' ,  menuId:'1294231344182792206'  } ,//电子发票
  // { path: '/billmanage/clientquote' ,  menuId:'1294231344182792207'  } ,//客户报价
  // { path:'/addressList'  ,   menuId:'1294231344182792208' } , //地址薄
  // { path: '/perInfo' ,  menuId:'1294231344182792209' }  ,//个人信息
  // { path: '/print' ,  menuId:'1294231344182792210'   },//打印配置
  // { path: '/cusCode' ,  menuId:'1294231344182792211'  } ,//客户编码
  // { path: '/pasSet' ,  menuId:'1294231344182792212'  } ,//密码设置

  /*统计分析*/
  { path: '/dashboard' ,  menuId:'1294453793306513425'  } ,//数据看板
  { path: '/admin/total-totals' , menuId:'1294453793306513426'  } ,//汇总报表
  { path: '/admin/total-list' , menuId:'1294453793306513427'  } ,//明细报表
]

const reportApiList=[
  'web.report.navigate.queryRealTime','web.report.quality.areaList','web.report.anomalous.analysis','web.report.anomalous.unAgingAchieved',
  'web.report.anomalous.collectTimeout','web.report.quality.agingFlow','web.report.overview.leftPanel','web.report.quality.agingAchieved',
  'web.report.quality.delivered','web.report.quality.agingTop5','web.report.logistics.realData', 'web.report.overview.summary',
  'web.report.overview.actualWeights','web.report.overview.weights','web.report.overview.votesTrendList','web.report.overview.costRation',
  'web.report.overview.costTrendList','web.report.report.search','web.report.overview.serviceType','web.report.waybillsummary.search',
  "web.report.report.reportAuthor","web.report.waybillsummary.export",'web.report.report.export',"web.report.navigate.export",
]

//取得接口请求头部信息
export function getApiHeaders(api){
  if(!reportApiList.includes(api)){
    return
  }
  const menuInfo=menuList.find(f=>f.path==window.location.pathname)
  if(!menuInfo){
    return
  }
  const menuId=menuInfo.menuId
  const time=new Date().getTime()
  const randomNum = Math.floor(1000 + 1000 * Math.random())
  const webTraceId = `${ getPhone()}-${menuId}-${time}-${time}-${randomNum}`
  return {
    'x-menu-id':menuId,
    'x-webtrace-id':webTraceId
  }
}


function   uploadLog(route) {
  const menuInfo=menuList.find(f=>f.path==route.path)
  if(!menuInfo){
    return
  }
  const param=generateLogParam(menuInfo)
  httpRequest({
    baseURL: '/json/collector',
    data:[param] ,
    headerUrl: 'cts.net.uploadWebActionLog',
    method: 'POST',
    headers:{
      'x-menu-id':param.menuId,
      'x-webtrace-id':param.webTraceId
    }
  })
}
/**
     * 进入页面上报日志
     */
function   generateLogParam(log) {
  const userId = getPhone()
  const userName = getCustomerCode()
  // 起始时间、结束时间 - 默认取当前时间
  const startTime = new Date().getTime()
  const endTime = new Date().getTime()
  const page = window.location.href
  const ua = window.navigator.userAgent
  // 4位随机数，用于生成webTraceId
  const randomNum = Math.floor(1000 + 1000 * Math.random())
  const webTraceId = `${userId}-${log.menuId}-${startTime}-${endTime}-${randomNum}`
  const param = {
    action: log.action,
    menuId: log.menuId,
    userId,
    userName: userName || '',
    startTime,
    endTime,
    url: page,
    location: page,
    httpStatus:  '200',
    resCode:  0,
    navigator: ua,
    webTraceId,
  }
  return param
}


export default uploadLog
