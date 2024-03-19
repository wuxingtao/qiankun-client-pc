/**
 * 单票展示逻辑：
 * 最低批次费用|最低费用大于预估运费，展示最大的一个(最低批次费用|最低费用)
 * 预估运费最大且其他值与之不相等时，不展示
 *
 * 批量展示逻辑：
 * 总最低批次费用大于总预估运费时，展示总最低批次费用提示
 * 否则，存在单票最低运费小于单票预估运费时，展示最低运费提示
 * 预估运费最大时，不展示
 * */
// todo 逻辑优化，因场景复杂而且调整次数多先使用易于调试的版本
export const getLowestContent = (
  freightLowestAmount,
  lowestBatchCharge,
  waybillAmount,
  isBatch,
  lessThanLowest
) => {
  console.log('预估运费：', waybillAmount, '最低运费：', freightLowestAmount, '最低批次费用', lowestBatchCharge, '是否批量:', isBatch, '是否低价:', lessThanLowest)
  // freightLowestAmount = 2100
  // lowestBatchCharge = 2300
  // waybillAmount = 2300
  // 费用相等时
  if (freightLowestAmount === lowestBatchCharge && lowestBatchCharge === waybillAmount) {
    return {
      noticeType: 'batch',
      popperContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`,
      detailContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
    }
  } else {
    const max = Math.max(freightLowestAmount, lowestBatchCharge, waybillAmount)
    const min = Math.min(freightLowestAmount, lowestBatchCharge, waybillAmount)
    // 运单运费最大时，不展示提示
    if (
      waybillAmount === max &&
      (waybillAmount !== freightLowestAmount && waybillAmount !== lowestBatchCharge)
    ) {
      if(!isBatch) {
        return {
          noticeType: '',
          popperContent: '',
          detailContent: ''
        }
      } else {
        if(lessThanLowest) {
          // 批量下单且存在单票值低于最低运费
          return {
            noticeType: 'amount',
            popperContent: '部分运单运费不足最低运费，按最低运费收取',
            detailContent: ''
          }
        } else {
          return {
            noticeType: '',
            popperContent: '',
            detailContent: ''
          }
        }
      }
    }
    // 运单费最小时
    else if (waybillAmount === min) {
      if(isBatch) {
        // 最低批次费用为最大值
        if(max === lowestBatchCharge) {
          return {
            noticeType: 'batch',
            popperContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`,
            detailContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
          }
        } else {
          if(lessThanLowest) {
            // 最低批次费用不大于预估运费且存在某单预估运费小于最低运费
            return {
              noticeType: 'amount',
              popperContent: '部分运单运费不足最低运费，按最低运费收取',
              detailContent: ''
            }
          } else {
            return {
              noticeType: '',
              popperContent: '',
              detailContent: ''
            }
          }
        }
      } else {
        // 最低费用=最低批次费 || 最低费用<最低批次费
        if (freightLowestAmount === lowestBatchCharge || freightLowestAmount < lowestBatchCharge) {
          return {
            noticeType: 'batch',
            popperContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`,
            detailContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
          }
        } else {
          // 最低费用>最低批次费
          return {
            noticeType: 'amount',
            popperContent: `运费不足最低运费，按最低运费${freightLowestAmount}元收取`,
            detailContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
          }
        }
      }
    }
    // 运费为中间值
    else {
      if(isBatch) {
        // 最低批次费用优先展示
        if(max === lowestBatchCharge) {
          return {
            noticeType: 'batch',
            popperContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`,
            detailContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
          }
        } else {
          if(lessThanLowest) {
            return {
              noticeType: 'amount',
              popperContent: '部分运单运费不足最低运费，按最低运费收取',
              detailContent: ''
            }
          } else {
            return {
              noticeType: '',
              popperContent: '',
              detailContent: ''
            }
          }
        }
      } else {
        // 最低运费是最大值
        if (freightLowestAmount >= waybillAmount) {
          return {
            noticeType: 'amount',
            popperContent: `运费不足最低运费，按最低运费${freightLowestAmount}元收取`,
            detailContent: ''
          }
        } else {
          // 最低批次费用是最大值
          return {
            noticeType: 'batch',
            popperContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`,
            detailContent: `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
          }
        }
      }
    }
  }
}

//   // 最低批次费大于最低收费
//   if (lowestBatchCharge > freightLowestAmount) {
//     // 运费≤最低收费<最低批次费
//     if (waybillAmount <= freightLowestAmount) {
//       return `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
//     }
//
//     // 最低收费＜运费≤最低批次费
//     if (freightLowestAmount < waybillAmount && waybillAmount <= lowestBatchCharge) {
//       return `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
//     }
//
//     // 最低收费＜最低批次费＜运费
//     if (lowestBatchCharge < waybillAmount) {
//       return ''
//     }
//   }
//   // 最低批次费小于最低收费
//   else if (lowestBatchCharge < freightLowestAmount) {
//     // 运费≤最低批次费 <最低收费
//     if (waybillAmount <= lowestBatchCharge) {
//       return `运费不足最低运费，按最低运费${freightLowestAmount}元收取`
//     }
//
//     // 最低批次费≤运费＜最低收费
//     if (lowestBatchCharge <= waybillAmount && waybillAmount < freightLowestAmount) {
//       return `运费不足最低运费，按最低运费${freightLowestAmount}元收取`
//     }
//
//     // 最低批次费≤最低收费＜运费
//     if (freightLowestAmount < waybillAmount) {
//       return ''
//     }
//   } else {
//     // 最低批次费=最低收费
//     if (waybillAmount <= lowestBatchCharge) {
//       return `若本次司机取货运费总额未超过最低批次费${lowestBatchCharge}元， 将按照${lowestBatchCharge}元进行收取`
//     }
//
//     // 最低批次费＜运费
//     if (lowestBatchCharge < waybillAmount) {
//       return ''
//     }
//   }
