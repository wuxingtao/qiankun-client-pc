import _ from 'lodash'
import * as API from '@api/coupon'
import store from '../../../../store'
import commonUtil from '../../utils/commonUtil'
import useBatchFreight from './useBatchFreight'

/** 必填字段 */
const VALIDATE_KEYS = [
  {
    label: '服务方式',
    key: 'serviceMode',
  },
  {
    label: '寄件地址',
    key: 'sendingRegion',
  },
  {
    label: '收件地址',
    key: 'receivingRegion',
  },
  {
    label: '付款方式',
    key: 'payMode',
  },
  {
    label: '总重量',
    key: 'weight',
  },
]



export default function({ vm, tableEditableRef, totalEstimateFreight }) {  
  const { calculateTotalEstimateFreight } = useBatchFreight({ vm, tableEditableRef, totalEstimateFreight })
  /** 验证必填字段是否为空 */
  const validateEmpty = form => VALIDATE_KEYS.every(item => {
    /** 总重量非必填，也需要触发接口调用 */
    if (item.key === 'weight') {
      return true
    }
    return form[item.key]
  })

  /** 验证是否为对象 */
  const validateObject = value => Object.prototype.toString.call(value) === '[object Object]'

  /** 获取已选优惠券，可排除指定行 */
  const getSelectedCoupons = async (data, row) => {
    let result = await data.reduce((arr, item) => {
      const coupon = item.coupon.value
      if (coupon.prizeCode) {
        const estimateFreight = item.estimateFreight.value
        arr.push({
          /** 优惠券编码 */
          prizeCode: coupon.prizeCode,
          /** 预估运费 */
          amount: estimateFreight.waybillAmount || 0,
          /** 增值服务费 */
          serviceAmount: estimateFreight.addedValueAmount || 0
        })
      }
      return arr
    }, [])
    /** 忽略指定券 */
    if (row) {
      result = _.pullAllBy(result, [row.coupon.value], 'prizeCode')
    }
    // console.log(result, '需要过滤的优惠券列表')
    return result
  }

  /** 重新加载表格数据 */
  const changeTableData = async (vData, allData) => {   
    const coupons = await getSelectedCoupons(allData)
    for(let i =0; i < vData.length; i++ ){
      const item = vData[i]
      const coupon = item.coupon.value
      if (!coupon.prizeCode) {
        await getListTicketsByOrder(item, coupons)
      }
    }
    // await vData.forEach(item => {
    //   const coupon = item.coupon.value
    //   if (!coupon.prizeCode) {
    //     getListTicketsByOrder(item, coupons)
    //   }
    // })
  }

  const findCurrentCoupon = (datalist, coupon) => {
    const result = datalist.filter(item => {
      if (item.prizeCode === coupon.prizeCode) {
        return { ...item, ...coupon }
      }
    })
    return result[0]
  }

  /** 获取优惠券列表 */
  const getListTicketsByOrder = async (row, coupons = [], mode = null, callback = null) => {
    row.loading = true
    try {
      const params = {
        /** 来源，字典：eam_marketing_operation_ticket_from */
        from: 4,
        /** 服务方式 */
        serviceMode: row.serviceWay.value,
        /** 预估运费 */
        amount: row.estimateFreight.value.waybillAmount || 0,
        /** 增值服务费 */
        serviceAmount: row.estimateFreight.value.addedValueAmount || 0,  
        /** 寄件地址 */
        sendingRegion: row.qhAddress.value,
        /** 收件地址 */
        receivingRegion: row.sjAddress.value,
        /** 货物重量 */
        weight: row.weight.value,
        /** 付款方式 */
        payMode: row.payWay.value,
        /** 已选优惠券列表 */
        selectedTickets: coupons,
        /** 是否有预估运费权限 */
        estimateCostAuth: store.getters.hasFrightFeeAuth ? 1 : 0,
      }
      /** 付款方式=寄方付，才能使用优惠券，其他付款方式都不可用 */
      if (row.payWay.value !== '10') {
        row.coupon.value = ''
        // row.coupon.errorInfo = '寄方付才能使用优惠券'
        return 
      }
      const coupon = row.coupon.value

      // console.log(mode, '修改模式')
      // console.log(coupon, '选中的优惠券')
      /** 验证必填参数是否为空 */
      const isEmpty = validateEmpty(params)
      if (!isEmpty) { 
        /** 编辑当前行，必填参数不全删除优惠券，恢复到暂无优惠券状态, 刷新列表其他券 */
        if (mode == 'edit' && coupon.prizeCode) {
          row.coupon.value = ''
          callback && callback()
        }
        return
      } 
      
      const { data } = await API.getListTicketsByOrder(params)
      if (!data) {
        return
      }

      /** 编辑当前行，删除已选优惠券，恢复到有几张优惠券可用状态， 刷新列表其他券*/
      if (mode == 'edit') {
        if (coupon.prizeCode) {
          const oldCoupon = findCurrentCoupon(data.externalTicketVOList, coupon)
          /**
           * 1. 选中的券已不存在
           * 2. 选中的券在本次查询中变为不可用
           */
          const option = {
            usableCount: data.usableCount,
            disabledCount: data.disabledCount
          }
          // console.log(oldCoupon, '上次选中的券')
          if (!oldCoupon || oldCoupon.status === 0) {
            row.coupon.value = option

            if (row.estimateFreight.value) {
              /** 无优惠券，使用接口返回预估运费 */
              row.estimateFreight.value.afterDiscountAmount = row.estimateFreight.value.totalAmount
              /** 无优惠券，优惠金额=0 */
              row.estimateFreight.value.reduceAmount = 0
            }
            console.log(option, '奖券张数配置')
            if (option.usableCount > 0) {
              row.coupon.warningInfo = '运单信息已变更，请重新选择优惠券'
            } else {
              row.coupon.warningInfo = '运单信息已变更，暂无可用优惠券'
            }
            await callback && callback()
          } else {
            row.coupon.value = {
              ...oldCoupon,
              ...option,
              estimateFreight: true
            }
            if (row.estimateFreight.value) {
              const result = commonUtil.getEstimateTotalFreight(coupon, row.estimateFreight.value)
              /** 减去优惠金额后的预估运费 */
              row.estimateFreight.value.afterDiscountAmount = result
              /** 优惠金额 */
              row.estimateFreight.value.reduceAmount = row.coupon.value.reduceAmount
            }
            row.coupon.warningInfo = ''
          }
          calculateTotalEstimateFreight()
        } else {
          const option = {
            usableCount: data.usableCount,
            disabledCount: data.disabledCount
          }
          row.coupon.value = option
          row.coupon.warningInfo = ''
        }
      } else {
        const option = {
          usableCount: data.usableCount,
          disabledCount: data.disabledCount
        }
        if (validateObject(row.coupon.value)) {
          // eslint-disable-next-line vue/no-mutating-props
          row.coupon.value = {
            ...row.coupon.value,
            ...option,
          }
        } else {
          // eslint-disable-next-line vue/no-mutating-props
          row.coupon.value = option
        } 
      }
    } catch(err) {
      console.warn(err)
    } finally {
      row.loading = false
    }
  }

  return { 
    changeTableData,
    getSelectedCoupons,
    getListTicketsByOrder
  }
}