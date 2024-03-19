import useSingleFee from './useSingleFee'

export default function({ formData, shareData, serviceWayOptions }) {
  const { setFeeByField } = useSingleFee({ formData, shareData })
  const suggestions = shareData.suggestions
  // const suggestions = reactive({
  //   declaredValue: { value: '', tip: '' },
  //   serviceWay: { value: '', tip: '' },
  //   hdCount: { value: '', tip: '' },
  //   mjWay: { value: '', tip: '' },
  //   dsMoney: { value: '', tip: '' },
  //   jjRemark: { value: '', tip: '' }
  // })

  const initSuggestionData = () => {
    Object.keys(suggestions).forEach(k => {
      suggestions[k].value = ''
      suggestions[k].tip = ''
    })
  }
  const setSuggestionInfoByHistory = historyData => {
    if (!historyData) {
      return
    }
    const { insuranceValue:saveValue, collectAmount:dsAmount, receiptCount } = historyData
    if (saveValue > 0 && saveValue != formData.declaredValue) {
      suggestions.declaredValue.value = saveValue
      suggestions.declaredValue.tip = `推荐：保价声明${saveValue}元`
    }
    if (dsAmount > 0 && dsAmount != formData.dsMoney) {
      suggestions.dsMoney.value = dsAmount
      suggestions.dsMoney.tip = `推荐：代收货款${dsAmount}元`
    }
    if (receiptCount > 0 && receiptCount != formData.hdCount) {
      // receiptFlag
      suggestions.hdCount.value = receiptCount
      suggestions.hdCount.tip = `推荐：签回单${receiptCount}单`
    }
    const { woodenFrameFlagCode:mjCode,woodenFrameFlagText:mjText } = historyData
    if (mjCode && formData.mjWay !== mjCode) {
      suggestions.mjWay.value = mjCode
      suggestions.mjWay.tip = `推荐：${mjText}`
    }
  }

  const setSuggestionInfoByGoodsType = goodsTypeList => {
    if (!goodsTypeList || goodsTypeList.length < 1) {
      return
    }
    const goodsType = goodsTypeList[goodsTypeList.length - 1]
    // const goodsType ='生鲜'
    let remarksTip = null
    let serveiceWays = '次日达、当天达、省内件、同城件'.split('、')
    let tempServiceWayOption = null
    switch (goodsType) {
      case '玻璃制品':
        remarksTip = { value: '“易碎品”', tip: '您的货物为玻璃制品，建议备注“易碎品”' }
        if (formData.mjWay !== '20') {
          suggestions.mjWay.value = '20'
          suggestions.mjWay.tip = '推荐：货物易碎，建议选择：打木架'
        }
        break
      case '易碎品':
        if (!formData.mjWay && !suggestions.mjWay.tip) {
          suggestions.mjWay.value = ''
          suggestions.mjWay.tip = '您的货物为易碎物品，建议您选择特殊包装服务'
        }
        break
      case '塑料制品':
        remarksTip = { value: '“防挤压”', tip: '您的货物为塑料制品，建议备注“防挤压”' }
        break
      case '纸质品':
        remarksTip = { value: '“防水”', tip: '您的货物为纸质品，建议备注“防水”' }
        break
      case '电子产品':
        remarksTip = {
          value: '“产品可能含电池”',
          tip: '您的货物为电子产品，建议备注“产品可能含电池”'
        }
        tempServiceWayOption = serviceWayOptions.value?.find(f=>f.label === '陆运件')
        if (tempServiceWayOption) {
          suggestions.serviceWay.value = tempServiceWayOption.value
          suggestions.serviceWay.tip = '您的货物为电子产品，建议选择以下服务方式：陆运件'
        }
        break
      case '电子元器件':
        remarksTip = { value: '“防静电”', tip: '您的货物为电子元器件，建议备注“防静电”' }
        break
      case '显示屏':
        remarksTip = {
          value: '“易碎品，不可倒置”',
          tip: '您的货物为显示屏，建议备注“易碎品，不可倒置”'
        }
        break
      case '生鲜':
        remarksTip = {
          value: '“低温运输，防挤压”',
          tip: '您的货物为生鲜品，建议备注“低温运输，防挤压”'
        }
        suggestions.declaredValue.value = ''
        suggestions.declaredValue.tip = '您的货物为生鲜品，建议填写货物保价声明'
        tempServiceWayOption = serviceWayOptions.value.filter(f=>serveiceWays.includes(f.lable)&& f.value !== formData.serviceWay)
        if (tempServiceWayOption.length > 0 ) {
          const text = tempServiceWayOption.map(f=>f.label).join('、')
          suggestions.serviceWay.value = tempServiceWayOption[0].value
          suggestions.serviceWay.tip = `您的货物为生鲜品，建议选择以下服务方式：${text}`
        }
        break
    }
    if (remarksTip && !formData.jjRemark.includes(remarksTip.value)) {
      suggestions.jjRemark.value = remarksTip.value
      suggestions.jjRemark.tip = remarksTip.tip
    }
    if (
      !suggestions.declaredValue.value &&
      !formData.declaredValue &&
      !suggestions.declaredValue.tip &&
      (goodsType === '显示屏' || goodsTypeList.includes('贵重物品'))
    ) {
      suggestions.declaredValue.value = ''
      suggestions.declaredValue.tip = '您的货物为贵重物品，建议填写货物保价声明'
    }
  }

  const setSuggestionInfo = (goodsTypeList, historyData) => {
    setSuggestionInfoByHistory(historyData)
    setSuggestionInfoByGoodsType(goodsTypeList)
  }

  const setSuggestionItemValue = fieldName => {
    suggestions[fieldName].tip = ''
    if (fieldName === 'hdCount' && !formData.receiptFlag) {
      formData.receiptFlag = '10'
    }
    switch (fieldName) {
      case 'jjRemark':
        formData.jjRemark += ` ${suggestions.jjRemark.value}`
        break
      default:
        formData[fieldName] = suggestions[fieldName].value
        break
    }
    setFeeByField(fieldName)
  }

  return {
    initSuggestionData,
    setSuggestionInfo,
    setSuggestionItemValue
  }
}
