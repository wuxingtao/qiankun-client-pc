/**
 * 组装时效分析图表的配置项
 */

// Y轴分割区个数
const YAXIS_SPLIT_NUMBER = 4

const BASE_OPTION = {
  // 提示
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#9378FA' }, 
            { offset: 1, color: '#FFFFFF' }
          ]
        },
        opacity: 0.2
      }
    },
    textStyle: {
      color: '#666666',
      lineHeight: 30
    },
    padding: [10, 20, 10, 20],
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    // formatter: '{b0}<br/>{a0}: {c0}<br/>{a1}: {c1}%<br/>{a2}: {c2}%<br/>{a3}: {c3}%<br/>{a4}: {c4}%{d}{e}'
    
  },
  // 图例
  legend: {
    itemWidth: 15,
    itemHeight: 10,
    right: 20,
    data: ['总票数', '取超时率', '超时率', '内部履约率', '外因超时率']
  },
  // X轴
  xAxis: {
    type: 'category',
    data: [],
    axisLabel: {
      rotate: 45,
      color: '#666666'
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    }
  },
  // Y轴
  yAxis: [
    {
      name: '单位：票',
      nameTextStyle: {
        fontSize: 11,
        align: 'right',
        color: '#999999'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#999999'
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#eff4fe'
        }
      }
    },
    {
      name: '单位：%',
      nameTextStyle: {
        fontSize: 11,
        align: 'left',
        color: '#999999'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#999999'
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#eff4fe'
        }
      },
      min: 0,
      max: 100,
      splitNumber: YAXIS_SPLIT_NUMBER,
      interval: 100 / YAXIS_SPLIT_NUMBER
    }
  ],
  series: [
    {
      name: '总票数',
      type: 'bar',
      itemStyle: {
        color: '#9378FA'
      },
      barMaxWidth: 15,
      data: []
    },
    {
      name: '取超时率',
      type: 'line',
      yAxisIndex: 1,
      itemStyle: {
        color: '#6ED0F8'
      },
      data: []
    },
    {
      name: '超时率',
      type: 'line',
      yAxisIndex: 1,
      itemStyle: {
        color: '#FAD34B'
      },
      data: []
    },
    {
      name: '内部履约率',
      type: 'line',
      yAxisIndex: 1,
      itemStyle: {
        color: '#FFAE79'
      },
      data: []
    },
    {
      name: '外因超时率',
      type: 'line',
      yAxisIndex: 1,
      itemStyle: {
        color: '#FF6262'
      },
      data: []
    }
  ]
}

/**
 * 省TOP10
 */
const setUpProvinceTrendOption = (provinceList) => {
  return __setUpTrendOption('province', provinceList)
}

/**
 * 市TOP10
 */
const setUpCityTrendOption = (cityList) => {
  return __setUpTrendOption('city', cityList)
}

const formatter = params => {
  var res = params[0].name
  for (var i = 0; i < params.length; i++) {
    res +=
      "<br>" +
      params[i].marker +
      params[i].seriesName +
      "：" +
      params[i].data + 
      (i > 0 ? '%' : '')
  }
  return res
}

const __setUpTrendOption = (type, dataList) => {
  const count = dataList.length
  // 无数据返回
  if (count === 0) return null

  let option = JSON.parse(JSON.stringify(BASE_OPTION))
  option.tooltip.formatter = formatter

  // TOP10数据
  let maxTotal = 0
  for (let i = 0; i < (count > 10 ? 10 : count); i++) {
    const item = dataList[i]
    // 组装X轴
    option.xAxis.data.push(item[type])
    // 总票数
    if (Number(item.totalPollA) > maxTotal) {
      maxTotal = item.totalPollA
    }
    option.series[0].data.push(item.totalPollA)
    // 取超时率
    option.series[1].data.push(item.pickupTimeoutRatio)
    // 超时率
    option.series[2].data.push(item.timeoutRatio)
    // 内部履约率
    option.series[3].data.push(item.externalCauseRatio)
    // 外因超时率
    option.series[4].data.push(item.innerEfficacyRatio)
  }
  // Y轴间隔
  if (maxTotal < 100) {
    maxTotal = Math.ceil(maxTotal / 20) * 20
  } else {
    let n = maxTotal.toString().length - 1
    maxTotal = Math.ceil(maxTotal / Math.pow(10, n)) * Math.pow(10, n)
  }
  option.yAxis[0].min = 0
  option.yAxis[0].max = maxTotal
  option.yAxis[0].splitNumber = YAXIS_SPLIT_NUMBER
  option.yAxis[0].interval = maxTotal / YAXIS_SPLIT_NUMBER
  return option
}

/**
 * 月趋势图
 */
const setUpMonthTrendOption = (dataList) => {
  const count = dataList.length
  // 无数据返回
  if (count === 0) return null

  let option = JSON.parse(JSON.stringify(BASE_OPTION))
  option.tooltip.formatter = formatter
  let maxTotal = 0
  for (let i = 0; i < count; i++) {
    const item = dataList[i]
    // 组装X轴
    option.xAxis.data.push(item.month)
    // 总票数
    if (Number(item.totalPollA) > maxTotal) {
      maxTotal = item.totalPollA
    }
    option.series[0].data.push(item.totalPollA)
    // 取超时率
    option.series[1].data.push(item.pickupTimeoutRatio)
    // 超时率
    option.series[2].data.push(item.timeoutRatio)
    // 内部履约率
    option.series[3].data.push(item.externalCauseRatio)
    // 外因超时率
    option.series[4].data.push(item.innerEfficacyRatio)
  }
  // Y轴间隔
  if (maxTotal < 100) {
    maxTotal = Math.ceil(maxTotal / 20) * 20
  } else {
    let n = maxTotal.toString().length - 1
    maxTotal = Math.ceil(maxTotal / Math.pow(10, n)) * Math.pow(10, n)
  }
  option.yAxis[0].min = 0
  option.yAxis[0].max = maxTotal
  option.yAxis[0].splitNumber = YAXIS_SPLIT_NUMBER
  option.yAxis[0].interval = maxTotal / YAXIS_SPLIT_NUMBER
  return option
}

export {
  setUpProvinceTrendOption,
  setUpCityTrendOption,
  setUpMonthTrendOption
}