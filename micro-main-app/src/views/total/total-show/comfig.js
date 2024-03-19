import dayjs from 'dayjs'
import { toZero } from '@/utils/total'
import { fontSize } from '@/utils/fontSize'

// 初始化默认7天
export const dtType = [
  dayjs().add(-7, 'd').format('YYYY-MM-DD'),
  dayjs().add(-1, 'd').format('YYYY-MM-DD'),
]

// 请求参数
export const initParm = {
  topSize: 20,
  shipingCity: '', // 地图上的寄件区号
  startDate: dtType, //开始时间
  endDate: '', //结束时间
  customerId: '', //客户ID
  customerFlag: '1', //客户类型
  serviceType: [], //服务方式
  payMode: [], // 付款方式
  dtType: '1', // 时间类型 0默认 1近7天 2近30天 3近90天 4近180天 5近365天 6昨天 7当月 8上月
  dtTime: '1', // 时间类型 0默认 1近7天 2近30天 3近90天 4近180天 5近365天 6昨天 7当月 8上月
  dateType: 'shipingTime',
}
export const customerLookUp = [
  {
    label: '作为寄方',
    value: '1',
    auth: '',
  },
  {
    label: '作为收方',
    value: '2',
    auth: 'switchRoleReceiving',
  },
  {
    label: '作为付款方',
    value: '3',
    auth: '',
  },
]
/*时间对应数据字典*/
export const dtTypeLookUp = {
  7: '1',
  30: '2',
  90: '3',
  180: '4',
  365: '5',
  1: '6', // 昨天
  2: '7', // 当月
  3: '8', // 上月
}
/*服务方式数据字典*/
export const serviceLookUp = [
  {
    label: '全部',
    value: '1',
  },
  { value: '10', label: '当天达' },
  { value: '20', label: '次日达' },
  { value: '30', label: '隔日达' },
  { value: '40', label: '陆运件' },
  { value: '50', label: '同城次日' },
  { value: '60', label: '次晨达' },
  { value: '70', label: '同城即日' },
  { value: '80', label: '航空件' },
  { value: '90', label: '早班件' },
  { value: '100', label: '中班件' },
  { value: '110', label: '晚班件' },
  { value: '160', label: '省内次日' },
  { value: '170', label: '省内即日' },
  { value: '190', label: '内部次日' },
  { value: '200', label: '内部件' },
  { value: '210', label: '空运' },
  { value: '220', label: '专运' },
  { value: '240', label: '整车运输' },
  { value: '250', label: '企业整车' },
  { value: '260', label: '同城配送' },
  { value: '280', label: '次晚达' },
  { value: '290', label: '内部急件' },
  { value: '300', label: '冷链零担' },
  { value: '340', label: '次中达' },
  { value: '350', label: '隔晨达' },
  { value: '360', label: '隔中达' },
  { value: '370', label: '陆晨达' },
  { value: '380', label: '同城次晨' },
  { value: '390', label: '同城次中' },
  { value: '400', label: '省内次晨' },
  { value: '410', label: '省内次中' },
  { value: '1100', label: '特惠快运' },
  { value: '1200', label: '特惠普运' },
  { value: '1300', label: '特惠航空' },
  { value: '1400', label: '特惠同城' },
  { value: '1500', label: '特惠省内' },
]

/*付款方式*/
export const payLookUp = [
  {
    label: '全部',
    value: '1',
  },
  {
    label: '寄方付',
    value: '10',
  },
  {
    label: '收方付',
    value: '20',
  },
  {
    label: '第三方付',
    value: '30',
  },
]
export const moneyLookUp = {
  11111111: '优惠金额',
  99999999: '运费',
  1: '批次收费',
  9: '货物保管费',
  10: '回单费',
  20: '保费',
  40: '代收手续费',
  50: '木架费',
  60: '包材费',
  70: '派货专车费',
  80: '修改服务费',
  90: '其他',
  100: '入仓费',
  110: '超重费',
  120: '爬楼费',
  130: '超长费',
  140: '回单附加费',
  150: '压车费',
  160: '装货费',
  170: '超里程费',
  180: '空驶费',
  190: '代垫款项',
  200: '拆木架费',
  210: '卸货费',
  220: '派送费',
  230: '封箱拉膜费',
  240: '贴标签费',
  250: '清货费',
  260: '清点细数费',
  270: '换箱拆箱费',
  280: '上架费',
  290: '多次派送费',
  300: '夜间取货费',
  310: '取货专车费',
  320: '冷链取货费',
  330: '冷链派货费',
  340: '超区费',
  350: '拓展费',
  360: '修改地址费',
  370: '退仓费',
  380: '高速费',
  390: '停车费',
  450: '安装费',
  460: '安装其他费',
}

/*echart 颜色*/
export const color = [
  '#8B85FF',
  '#75A8FF',
  '#66D8FF',
  '#FF7888',
  '#FFB148',
  '#5DD376',
  '#c6d451',
  '#39bf7f',
  '#bfa638',
]
/*echart 折线图初始值*/
export const lineData = {
  color: color,
  grid: {
    left: 60,
    top: 30,
    right: 30,
    bottom: 40,
  },
  xAxis: {
    boundaryGap: false,
    type: 'category',
    data: [],
    axisLine: {
      lineStyle: {
        color: '#bfbfbf',
      },
    },
    axisTick: {
      inside: true,
      lineStyle: {
        color: ['#cdcbcb'],
      },
    },
    axisLabel: {
      textStyle: {
        color: '#0c092b',
      },
      formatter: name => {
        if (name) {
          let month = dayjs(name).month() + 1
          let date = dayjs(name).date()
          return toZero(month) + '-' + toZero(date)
        }
        return name
      },
    },
  },
  yAxis: {
    type: 'value',
    scale: true,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        color: ['#f0f0f2'],
      },
    },
    axisLabel: {
      textStyle: {
        color: '#888795',
      },
    },
  },
  // dataZoom: [{
  //   type: 'inside',
  //   start: 0,
  //   end: 100
  /*{
    show: true,
    realtime: true,
    height: 15,
    bottom: 6,
    start: 0,
    end: 100,
    backgroundColor: "#e8f2ff",
    dataBackground:{
      lineStyle: {
        color: '#c414fd',
      }
    },
    textStyle: {
      color: '#931dfa'
    },
    moveHandleStyle: {
      color: 'blue'
    },
    emphasis: {
      handleStyle: {
        color: 'red',
      },
      moveHandleStyle: {
        color: '#9557fa' ,
      },
    },
    borderColor: '#efcaff' ,
  }*/
  tooltip: {
    trigger: 'axis',
    backgroundColor: null,
    extraCssText: 'border: none;',
  },
  series: [
    {
      data: [],
      type: 'line',
      smooth: true,
      showSymbol: false,
      itemStyle: {
        color: '#61A2FF',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: '#e8f2ff', // 0% 处的颜色
            },
            {
              offset: 1,
              color: '#fff', // 100% 处的颜色
            },
          ],
          global: false, // 缺省为 false
        },
      },
    },
  ],
}
/*echart 环形图初始值*/
export const pieData = {
  color: color,
  tooltip: {
    trigger: 'item',
    backgroundColor: '#fff',
    textStyle: {
      color: '#000',
      textShadowBlur: 2,
      textShadowOffsetX: 2,
      textShadowOffsetY: 2,
    },
    extraCssText: 'box-shadow: 0 0 5px rgba(0,0,0,0.3)',
  },
  graphic: [
    {
      //环形图中间添加文字
      type: 'text', //通过不同top值可以设置上下显示
      left: 'center',
      top: '45%',
      zlevel: 10,
      style: {
        text: '',
        textAlign: 'center',
        fill: '#666666', //文字的颜色
        width: 30,
        height: 30,
        fontSize: fontSize(0.12),
        fontFamily: 'PingFangSC, PingFangSC-Regular',
      },
    },
    {
      //环形图中间添加文字
      type: 'text', //通过不同top值可以设置上下显示
      left: 'center',
      top: '55%',
      zlevel: 10,
      style: {
        text: '',
        textAlign: 'center',
        fill: '#0C092B ', //文字的颜色
        width: 30,
        height: 30,
        fontSize: fontSize(0.14),
        fontWeight: 600,
        fontFamily: 'PingFangSC, PingFangSC-Semibold',
      },
    },
  ],
  /*  legend: {
    right: 20,
    top: 10,
    itemWidth: 10 ,
    itemHeight: 10,
    itemGap: 15,
    icon: "circle",
    orient: 'vertical',
    /!*formatter: function (name) {
      console.log(8889,name)
      return name + '        1~10'
    }*!/
  },*/
  series: [
    {
      name: '',
      type: 'pie',
      radius: ['50%', '80%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center',
      },
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      emphasis: {
        label: {
          show: false,
          fontSize: '40',
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        /*  {
            value: 1048,
            name: '搜索引擎',
            tooltip:{
              show:false
            }},
          {value: 735, name: '直接访问'},
          {value: 580, name: '邮件营销'},
          {value: 484, name: '联盟广告'},
          {value: 300, name: '视频广告'}*/
      ],
    },
  ],
}
/*echart 折现和柱状图初始值*/
export const barLineData = {
  color,
  grid: {
    left: 60,
    top: 50,
    right: 60,
    bottom: 40,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: null,
    extraCssText: 'border: none;',
  },
  legend: {
    right: 20,
    top: 10,
    itemGap: 20,
    data: [],
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisTick: {
        inside: true,
        lineStyle: {
          color: ['#e3e2e2'],
        },
      },
      axisLine: {
        lineStyle: {
          color: '#bfbfbf',
        },
      },
      axisLabel: {
        textStyle: {
          color: '#0c092b',
        },
        formatter: name => {
          if (name) {
            return dayjs(name).format('MM-DD')
          }
          return name
        },
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: '',
      axisLabel: {
        textStyle: {
          color: '#888795',
        },
        formatter: '{value}',
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: ['#f0f0f2'],
        },
      },
    },
    {
      type: 'value',
      name: '',
      axisLabel: {
        textStyle: {
          color: '#888795',
        },
        formatter: '{value}%',
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: ['#f0f0f2'],
        },
      },
    },
  ],
  /*{
    show: false,
    realtime: true,
    height: 15,
    bottom: 6,
    start: 0,
    end: 100,
    backgroundColor: "#e8f2ff",
    dataBackground:{
      lineStyle: {
        color: '#c414fd',
      }
    },
    textStyle: {
      color: '#931dfa'
    },
    moveHandleStyle: {
      color: 'blue'
    },
    emphasis: {
      handleStyle: {
        color: 'red',
      },
      moveHandleStyle: {
        color: '#9557fa' ,
      },
    },
    borderColor: '#efcaff' ,
  }*/
  series: [],
}
// 定位icon
export const mapPic1 =
  'data:image/png;base64,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'
/*
export const mapPic='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAcCAYAAABh2p9gAAAEq0lEQVRIS32WXWwUVRTH/+fOnZmd3S2l5SO0YEJiTaQVY0RF4oOVaAwaHwzCkxCJH8UYjdGYaEG2S9AKQRMlKYagMRhNpEF88cFAYgmJQR+ML9vE2EjRSivQpXTZ2Z2Ze+8xs23pbnfryTzNOfO7/3PuOfcOoYExM53oR6vlYhOApxm4kwg+DC4YxjctS/DnUz3kN/qWGr384hA/ZBHvYcaWhX5m9kEYCCNx+MU99O9Cfx3wxIHwPpbyK4a5AwBVngXGQADGd+FFsaPnGEXV7progf6pFs+kzgJ0byPldWqI3n2u1zqwKPCz/Wo7EX/OjNScsGQT0NRM0BqYnmSEQbVmGiEdPbYr643OQWsUHs+En4LQM+dc0krYtEVgWRtBR8DFYcYvZ3SVIPKJaOfzGXmqMXBfeMEwb6ysQoQnd0m0rZ1fM1Z55muFsT8MGIAAMYj2vLDf7m8IPLY3GAFwexztJoGdvU5dKX//VePc6VmVDDD4o93vJd5sCDz6dnmYCOtip+0AO3od2E7tLv92TuHnH6rSJu7f/b7Xuxjwe2Z+opIPgA2bLTzwuH1LpV9gnB4IUbjOlRBi0iC8+vLBxNGGwIG3SvuYOVud54bNEvc8IuFPM86fjjA2Ym65GZwnIZ555ZD3Y2PgG/6DzPiWgbba4s1KrnlJINBZrfytrx1ZNl0HZDAde2nci1LN7xjDe+Pw2GaSqzcCrggptl5Jez9ls3EQVQJnK86UAahrG+if1VNN0rhHjDHPLjothAIBPZMTqVPDgB4chFkIFJkM0D4Oywlh3UyX2zSr42BsbgBVBHHQOMnDq5vhrwDMEGCyWaoUt6IwAxaxuolVkIEL6ZUKCc10Nxt8zIz1ceIVIwpA+NJOpg/YElMtIcLrRajLbdBzac8AMyzixt+YhzXuwSkESEpZTnBgOqNAf8jgdcTQTDhpJfUHrkhM6lCVS15T2Q1G1KqJDrVtEIbiRqoUPsOiDxDN07BTDhwEflJDeNoVKXUjuF9H5jARXSTPeV06ajKELDqO8i0nXdJ5RKsmoHKD4CzI1ADbx+GgBbZkP1WOVDJkK53QwgkC9bBwrWHXssfLMgiNkjeJp0vtS1cWi5dG1ejoqMJQt6kDzikM2U9ZoUho0imAXDJkxZkYwyFggtBRRcdZ6lsO/l/h2kuQZiXsQlBMchB5SEjPlY5tSElLg6FkpGOFkfSb06p0JWoq/xWMqE9aOyKqzNdsyvGmdHWBJs7P73JkW05aioQOSWoRSWM5LEqs0tINfQflskLINBakimvqdxlgOrkN4vqjEM5lWIU8HJEu2HbJcm4Kki4FcRfAMq6SxqjIUyG7YaTzN6L1rR26rg9jYNxpgychcoOw2rsgpX/N4sixpwQJJhJukGZhCia1XGuruDTSqVE9irWqaxi8vX5SKjNLfRlQN4bEELpF8/SYtdxaI6L8NVFMLa90g6WvGrlyhbltEvrvu2BaWmByOXCDWZ4ZhDloXM9cDtQFiIn8/D062Qpubwe3nI1nF8h11sKqDofqiWXKZGYgXcOg3NXqi3kIwyu6ubMT3NcHppnLp+Y4avjnMI+fmaRam5mFxU6i/wAEckg763kkhQAAAABJRU5ErkJggg=='
*/
export const mapPic =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAApCAYAAAArpDnNAAAAAXNSR0IArs4c6QAACERJREFUWEeVV2tsXEcV/s7M3Mfueu3Yjp04jZoSKgg2SARThZS2BFHRCigggYNEJWgaQSCVKiRoSIpa2yiPH0ShBKUtSYtSoVJkI4GoKAgFWomHVKkWTaU1IQQpJandeBM/1t7d+5o56N7dta83dqPOD+vu3Lnzncd3vnNMuMH62RBnXRdrpY0tzLgdwK0AcgBKRPiv0fibcHA+vIaru4bJW+06eiec54/yXRrYCeZ7iWgzgxfPNx4YMMw4T8x/ECxG7t+HV4mIm+9dEej4cXbaPDwO8AMArwcgah/Gx2t3EAi8/NmA6C0BOlEp46d7hqiSBrsO6Jlj3GGFOAaYrycHG7bVT3L9N6VcireIFoEDYnHU83AoDbYM6KXj7BQr5jAz9gJwVw9rE/r1FgUMHAk6xKE9eyhsxGLxvtOH+GsM/WSS7KUorYxXf5940xyjmh2eEfj27gPq9DKgU4d4nWB9gYCWVFRSsbtRetP5r91AoAKk+NyuA3Qx2RkcZLFJmiOA2ZekZTlSYnKck5Y2QttawLKB0AdmrzIWZusGNH1Tz2GVIb6ff0M8mbw+NcgbicIXAfpwkv1kN+ZVbcXsev9WgS39Avl2grKAMADmZxjnxgwunOWE441UpYgBMP8u8KoPJHf9fDi8RzOeA/O6RoASi7hGuvdtFbjrC3LFXOkI+MdLGuf/abDIyNRJJp6M2NyeAD3zeLCHmX8CImc5nxmtnYTP71Zwc6vX9tRlxsu/jhIPm6iRhIMN3UFxfjZGwX4QDjaCljb9A7cJbP+sglzZoeRoGDDOvBDh8oUlQqQLgAn308gIy5nXvUGAHlvi6VJ1fvRuia2fUKC6NqxWW38ZCXHhrKmLR6o24hwQf4uYmU79INjPzIcafqeJ+sHtEts/oyDewaM4T396PsT//m0W7UgHWgj6avL7qQPBN4jNcWZOqUGNdZ09hPu+acHJrJ6jqxOMP/8qxMxUDSitgyAybMTHk69PPOJ9moifAxALaP3w0sPWT0psu8daMWpGA6/+McQbf9UwDR1cfvKyZbl3JEDP7itvCJheZKaPLLIujm2DryD0f0piy20S2VaCVAQdAuV5xrnXIrz+coQYsGZhk64wfhNE/oPJbtxnnvqud5CZH00LV7ou4hx19Ah03USwXYJXYRTfMrg2wY36rtnY4FH8yKiAxCNTLc7Ti4E/foC7RLXyLxA6l2qhuX+tprSr7BOdJeC+h45lLy3L8InvVL5swLHaxq36Xa3roajKwO6Hn8i+UCNIao0Msn1lpjoM8MMMzjZr6xJRam8aHXaZRXHVE1WYcGT9xO+P7BzdmWTvOs4efqjUmSPxIyLsalyQztVixae5UudA/ZwvQEevBdnDQyeX2nkTEFMsEe/9HjIz1XLs8r0Ap3gdV3nsSs2XJX2v+QdAg8Sz1SC7b/9JlOo0TF4sA4pVYnQnxEz7mKhk+3MiLD/BBl8BpQt55dQxUyDAp+1cy2NbcpgujoMHRmAaE9EiUEzx0QGIQi+ocxpyjQNVqvo3RZF/kIm+VJuEUr1jmZkUgnBSSXHYc+fnHH9d9KEO6B2AwXDcR2lpThscHBRDfUM0OgrpbYKlI1hBtpIJqmqtrgZPG8MfWxq7lnmlhaDf2mT/0HdKRce1POm2+f09CPvbYTBQ82rRo7hdbJgck3ZPv7wyOeO0tVpO5KmccqMcR2q9VwkfZeY7AVKpzmuIcEa6zo8zGbpU9itlV6mKLVqqInMxvAW3RDuGoNNAcV+iDRsgMTZpyVzODWFlDOtWTSYvIddEmm7Wnn7QaN4We0YEI6Q847j4RUTybRCXlInmSKgFtzVTDiYnA/T3hBMT0MNJ+OrUGBlgUegtyO5it13NuK4KVVZK06ZYtBrFHTriVmLRHZSjvcaYzUKK1+yM+qWUphhJmpOs59g4M5at50MRlathxduUWxeOjkOPjsI0lIlGEiIUZDf6bD2NDPFcS6RUmyTZJsAdhk0bQeRhuDPyzZ3KEX83whQJNE+gWUlmRsKeNmzmhQwXJqqe19fVFawOVOy2tcxkhFFZX+g1lpKtAqLDmLBNEOcNkysAZYCIBFWJxTyzmdMws8T2tBGVhayUCyXKVzfl0OwRKA7dzN0Qpf9csTNW1jU6n7F10GoC3aoltxOZPEPliCOXWEom1kzsEbjMhuakEXPSjmZ9mV9QAuUpFz4zovHloasNkTEZyuegiOHYFlxEfgs4atGa20haWQiThTaOIUjB0EwiBqoy6QXJYp4gS2y5lXkxU7WD9iC3BVGNDNTIUawqTENDkHGxSl20HMexK5aVtVlkAq1bONIZpSxHs7aItWRyNDEHFLKvHFPxpa7oyKp4QeRZmbwXhw190APNdRQPwgMDEO3tY2J7T7+cqsJao+edslFOTgnX98iRMrRNFCm2SBDYCFYRYPlaV4NI2Z4dRF45lw8qGcT/QcRh45hxcQtMaR3T4CCorw9UKBRkqdQn3xNNW5HqUI4q2ygLy2QDZfsQkXZJSbCRrEObI+NnwhZRCn2/Nch2IbqIggGKBthh4hpqAkoUuAY2DjrTDvFFB+KSD+k700pFUhohhOXmyQoWaAFAVrXoeZ41raU1OroZ2r92QTv+rab9bpjCTvAwaHH+WnGGinVvfLyP9vYO0CuA2DYNWngb4k33iljIr6PuLmCqWERL1rB8MzRq/UZzrQO8A6+Y4niRC70FHh4eXhryVmp8NaGohTT2bnx8lHp7B2gHgPOTtbbS3gPaPAkei/8B6AHHLQEYRaF3gBuham4mq0+FdWmqN7S4IQLJn6Y1DAzXrUvmnlXWjYBW++5d7/8fWjMDoqkKTCsAAAAASUVORK5CYII='
export const mapPic100 =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTRweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgMTQgMTgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYzLjEgKDkyNDUyKSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT7nu7/oibI8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0i57u/6ImyIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiBmaWxsPSIjNTdDRDdDIiB4PSIyIiB5PSI0IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHJ4PSIxLjM3MTQyODU3Ij48L3JlY3Q+CiAgICA8L2c+Cjwvc3ZnPg=='
export const mapPic90 =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTRweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgMTQgMTgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYzLjEgKDkyNDUyKSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT7pu4ToibI8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0i6buE6ImyIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiBmaWxsPSIjRkZCMTQ4IiB4PSIyIiB5PSI0IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHJ4PSIxLjM3MTQyODU3Ij48L3JlY3Q+CiAgICA8L2c+Cjwvc3ZnPg=='
export const mapPic60 =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTRweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgMTQgMTgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYzLjEgKDkyNDUyKSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT7nuqLoibI8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0i57qi6ImyIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiBmaWxsPSIjRkY2MjYyIiB4PSIyIiB5PSI0IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHJ4PSIxLjM3MTQyODU3Ij48L3JlY3Q+CiAgICA8L2c+Cjwvc3ZnPg=='
export const cityPositon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTRweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgMTQgMTgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYzLjEgKDkyNDUyKSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT7lrprkvY08L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz4KICAgICAgICA8ZmlsdGVyIHg9Ii0xNDAuOCUiIHk9Ii0xOTcuMSUiIHdpZHRoPSIzODEuNiUiIGhlaWdodD0iNDk0LjMlIiBmaWx0ZXJVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIGlkPSJmaWx0ZXItMSI+CiAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIiIGluPSJTb3VyY2VHcmFwaGljIj48L2ZlR2F1c3NpYW5CbHVyPgogICAgICAgIDwvZmlsdGVyPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iNTAlIiB5MT0iMCUiIHgyPSI1MCUiIHkyPSIxMDAlIiBpZD0ibGluZWFyR3JhZGllbnQtMiI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNBNDhFRkYiIG9mZnNldD0iMCUiPjwvc3RvcD4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzhCNjBGMCIgb2Zmc2V0PSIxMDAlIj48L3N0b3A+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSLlrprkvY0iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIuMDAwMDAwLCAyLjAwMDAwMCkiPgogICAgICAgICAgICA8cGF0aCBkPSJNNC44NzM3NTc0NCwxMy40MTQ4NTg2IEM2LjA1MDM2NDA4LDEzLjQxNDg1ODYgNy4wMDQxOTIyMiwxMi43MzM1NTI4IDcuMDA0MTkyMjIsMTEuODkzMTE5NSBDNy4wMDQxOTIyMiwxMS4wNTI2ODYyIDYuMDUwMzY0MDgsMTAuMzcxMzgwMyA0Ljg3Mzc1NzQ0LDEwLjM3MTM4MDMgQzMuNjk3MTUwOCwxMC4zNzEzODAzIDIuNzQzMzIyNjYsMTEuMDUyNjg2MiAyLjc0MzMyMjY2LDExLjg5MzExOTUgQzIuNzQzMzIyNjYsMTIuNzMzNTUyOCAzLjY5NzE1MDgsMTMuNDE0ODU4NiA0Ljg3Mzc1NzQ0LDEzLjQxNDg1ODYgWiIgaWQ9IuakreWchuW9oiIgZmlsbD0iIzkzNzBGNSIgb3BhY2l0eT0iMC43NDYyMzMyNTkiIGZpbHRlcj0idXJsKCNmaWx0ZXItMSkiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTguMjUyNDY4NTksMS41NDE4NzYzMyBMOC4yNTI0Njg0NywxLjU0MTg3NjIgQzYuNDQ3MDg5NjEsLTAuMzI1Nzk0NDUxIDMuNDY5NTAyNTQsLTAuMzc2MjgyNjgxIDEuNjAxODMxODksMS40MjkwODc2OSBDMS41NjM2MDA3OCwxLjQ2NjA0MzY3IDEuNTI1OTk5MTEsMS41MDM2NDUzNCAxLjQ4OTA0MzEzLDEuNTQxODc2NDUgTDEuNDg5MDQzMiwxLjU0MTg3NjM4IEMtMC4zNzYxMTY1ODMsMy40NzA5MTU3MSAtMC4zNzYxMTY1ODMsNi41MzEzMjQ2NCAxLjQ4OTA0MzA2LDguNDYwMzUxNjYgTDQuODcwNzU3NTIsMTEuOTIzMjg3OSBMOC4yNTI0NzE5Nyw4LjQ2MDM1MTY2IEw4LjI1MjQ3MjAxLDguNDYwMzUxNjEgQzEwLjExNzYzMTgsNi41MzEzMTIyOSAxMC4xMTc2MzE4LDMuNDcwOTAzMzUgOC4yNTI0NzE5MywxLjU0MTg3NjMzIEw4LjI1MjQ2ODU5LDEuNTQxODc2MzMgWiIgaWQ9IuW9oueKtue7k+WQiCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudC0yKSIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik00Ljg3MDc2NjQ0LDMuMDYyODgxMzggTDQuODcwNzY2NTUsMy4wNjI4ODEzOCBDMy43ODE5NzQ2OSwzLjA2NDU1MzU3IDIuOTAwNjY3MDcsMy45NDg1MzI4IDIuOTAyMzI2MzMsNS4wMzczMjIxOSBDMi45MDM5Nzk3MSw2LjEyNjExNDA1IDMuNzg3OTU4OTQsNy4wMDc0MjE2NyA0Ljg3Njc0ODMzLDcuMDA1NzYyNDEgQzUuOTY1NTQwMTgsNy4wMDQxMDkwMyA2Ljg0Njg0NzgxLDYuMTIwMTI5OCA2Ljg0NTE4ODU1LDUuMDMxMzQwNDEgQzYuODQ0MzkzODEsNC41MDg3ODg0NiA2LjYzNjE3MDg0LDQuMDA3OTI3MjUgNi4yNjYyNzM3OCwzLjYzODgyNzc2IEw2LjI2NjI3Mzc3LDMuNjM4ODI3NzUgQzUuODk2ODczOTYsMy4yNjc5MDQxOSA1LjM5NDI0NjUzLDMuMDYwNDcwNDMgNC44NzA3NTc5MiwzLjA2Mjg4MTM4IEw0Ljg3MDc2NjQ0LDMuMDYyODgxMzggWiIgaWQ9IuW9oueKtiIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4='

/*echart 地图初始值*/
export const mapData = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
  },
  bmap: {
    center: [104.114129, 37.550339],
    zoom: 5,
    roam: true,
    mapStyle: {
      styleJson: [
        {
          featureType: 'water',
          elementType: 'all',
          stylers: {
            color: '#044161',
          },
        },
        {
          featureType: 'land',
          elementType: 'all',
          stylers: {
            color: '#004981',
          },
        },
        {
          featureType: 'boundary',
          elementType: 'geometry',
          stylers: {
            color: '#064f85',
          },
        },
        {
          featureType: 'railway',
          elementType: 'all',
          stylers: {
            visibility: 'off',
          },
        },
        {
          featureType: 'highway',
          elementType: 'geometry',
          stylers: {
            color: '#004981',
          },
        },
        {
          featureType: 'highway',
          elementType: 'geometry.fill',
          stylers: {
            color: '#005b96',
            lightness: 1,
          },
        },
        {
          featureType: 'highway',
          elementType: 'labels',
          stylers: {
            visibility: 'off',
          },
        },
        {
          featureType: 'arterial',
          elementType: 'geometry',
          stylers: {
            color: '#004981',
          },
        },
        {
          featureType: 'arterial',
          elementType: 'geometry.fill',
          stylers: {
            color: '#00508b',
          },
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: {
            visibility: 'off',
          },
        },
        {
          featureType: 'green',
          elementType: 'all',
          stylers: {
            color: '#056197',
            visibility: 'off',
          },
        },
        {
          featureType: 'subway',
          elementType: 'all',
          stylers: {
            visibility: 'off',
          },
        },
        {
          featureType: 'manmade',
          elementType: 'all',
          stylers: {
            visibility: 'off',
          },
        },
        {
          featureType: 'local',
          elementType: 'all',
          stylers: {
            visibility: 'off',
          },
        },
        {
          featureType: 'arterial',
          elementType: 'labels',
          stylers: {
            visibility: 'off',
          },
        },
        {
          featureType: 'boundary',
          elementType: 'geometry.fill',
          stylers: {
            color: '#029fd4',
          },
        },
        {
          featureType: 'building',
          elementType: 'all',
          stylers: {
            color: '#1a5787',
          },
        },
        {
          featureType: 'label',
          elementType: 'all',
          stylers: {
            visibility: 'off',
          },
        },
      ],
    },
  },
  legend: {
    right: 20,
    bottom: 10,
    itemGap: 10,
    orient: 'vertical',
    itemWidth: 14,
    itemHeight: 14,
    data: [
      {
        name: '时效达成率90~100%',
        icon: 'image://' + mapPic100,
      },
      {
        name: '时效达成率60~90%',
        icon: 'image://' + mapPic90,
      },
      {
        name: '时效达成率10~60%',
        icon: 'image://' + mapPic60,
      },
      {
        name: '始发城市',
        icon: 'image://' + cityPositon,
      },
    ],
  },
  series: [
    {
      name: '时效达成率10~60%',
      type: 'scatter',
      coordinateSystem: 'bmap',
      data: [],
      encode: {
        value: 2,
      },
      symbolSize: function (val) {
        /*return val[2] / 10*/
        let num = val[2] * 10
        if (num > 30) {
          num = 30
        }
        if (num < 10) {
          num = 10
        }
        return num
      },
      label: {
        formatter: '{b}',
        position: 'right',
      },
      itemStyle: {
        color: '#FF6262',
      },
      emphasis: {
        label: {
          show: true,
        },
      },
    },
    {
      name: '时效达成率60~90%',
      type: 'scatter',
      coordinateSystem: 'bmap',
      data: [],
      encode: {
        value: 3,
      },
      symbolSize: function (val) {
        /*return val[2] / 10*/
        let num = val[2] * 10
        if (num > 30) {
          num = 30
        }
        if (num < 10) {
          num = 10
        }
        return num
      },
      label: {
        formatter: '{b}',
        position: 'right',
      },
      itemStyle: {
        color: '#FFB148',
      },
      emphasis: {
        label: {
          show: true,
        },
      },
    },
    {
      name: '时效达成率90~100%',
      type: 'effectScatter',
      coordinateSystem: 'bmap',
      data: [],
      encode: {
        value: 4,
      },
      symbolSize: function (val) {
        let num = val[2] * 10
        if (num > 30) {
          num = 30
        }
        if (num < 10) {
          num = 10
        }
        return num
      },
      showEffectOn: 'render',
      rippleEffect: {
        color: '#57CD7C',
        brushType: 'stroke',
      },
      hoverAnimation: true,
      label: {
        color: '#0C092B',
        formatter: '{b}',
        position: 'right',
        show: true,
      },
      itemStyle: {
        color: '#57CD7C',
        shadowBlur: 10,
        shadowColor: '#57CD7C',
      },
      zlevel: 1,
    },
    {
      name: '始发城市',
      type: 'scatter',
      coordinateSystem: 'bmap',
      tooltip: {
        formatter(data) {
          return data.name
        },
      },
      data: [
        {
          name: '始发城市',
          symbolSize: [25, 28],
          symbol: 'image://' + mapPic,
        },
      ],
      encode: {
        value: 5,
      },
    },
  ],
}

const mapCircleSize = num => {
  if (num > 1000000) {
    num = 57
  } else if (num > 500000 && num <= 1000000) {
    num = 52
  } else if (num > 100000 && num <= 500000) {
    num = 47
  } else if (num > 50000 && num <= 100000) {
    num = 42
  } else if (num > 10000 && num <= 50000) {
    num = 37
  } else if (num > 5000 && num <= 10000) {
    num = 32
  } else if (num > 1000 && num <= 5000) {
    num = 27
  } else if (num > 500 && num <= 1000) {
    num = 22
  } else if (num > 101 && num <= 500) {
    num = 17
  } else if (num > 51 && num <= 101) {
    num = 12
  } else if (num > 11 && num <= 51) {
    num = 10
  } else {
    num = 5
  }
  return num
}

export const chinaMapData = {
  backgroundColor: '#b2cefe',
  geo: {
    map: 'china',
    zoom: 4,
    top: 100,
    show: true,
    roam: true,
    scaleLimit: {
      //滚轮缩放的极限控制
      min: 1.5,
      // max: 2
    },
    label: {
      normal: { show: false },
      emphasis: { show: false },
    },
    itemStyle: {
      normal: {
        areaColor: '#EEF0F3',
        borderColor: '#7F7F7F', //行政区分界线
        // shadowColor: '#092f8f',//外发光
        // shadowBlur: 20
      },
      emphasis: {
        areaColor: '#EEF0F3', //悬浮区背景
      },
    },
  },
  legend: {
    left: 20,
    bottom: 10,
    itemGap: 10,
    itemWidth: 14,
    itemHeight: 18,
    orient: 'vertical',
    data: [
      {
        name: '时效达成率80~100%',
        icon: 'image://' + mapPic100,
      },
      {
        name: '时效达成率60~80%',
        icon: 'image://' + mapPic90,
      },
      {
        name: '时效达成率0~60%',
        icon: 'image://' + mapPic60,
      },
      /* {
        itemWidth: 14 ,
        itemHeight: 22 ,
        name:'始发城市',
        icon: 'image://'+cityPositon,
      }*/
    ],
  },
  series: [
    {
      type: 'scatter',
      coordinateSystem: 'geo',
      name: '时效达成率0~60%',
      data: [],
      itemStyle: {
        color: '#ff6262',
      },
      encode: {
        value: 3,
      },
      symbolSize: function (val) {
        return 12
        /* let num= ((val[2] || '').split(',') || [])[0]
        return mapCircleSize(num)*/
      },
      label: {
        color: '#0C092B',
        formatter: '{b}',
        position: 'right',
        show: true,
      },
    },
    {
      name: '时效达成率60~80%',
      type: 'scatter',
      coordinateSystem: 'geo',
      data: [],
      encode: {
        value: 3,
      },
      symbolSize: function (val) {
        return 12
        /*  let num= ((val[2] || '').split(',') || [])[0]
          return mapCircleSize(num)*/
      },
      label: {
        color: '#0C092B',
        formatter: '{b}',
        position: 'right',
        show: true,
      },
      itemStyle: {
        color: '#FFB148',
      },
      emphasis: {
        label: {
          show: true,
        },
      },
    },
    {
      name: '时效达成率80~100%',
      type: 'scatter',
      coordinateSystem: 'geo',
      data: [],
      encode: {
        value: 3,
      },
      symbolSize: function (val) {
        return 12
        /* let num= ((val[2] || '').split(',') || [])[0]
        return mapCircleSize(num)*/
      },
      label: {
        color: '#0C092B',
        formatter: '{b}',
        position: 'right',
        show: true,
      },
      itemStyle: {
        color: '#57CD7C',
        shadowBlur: 10,
        shadowColor: '#57CD7C',
      },
      zlevel: 1,
    },
    {
      name: '始发城市',
      type: 'scatter',
      coordinateSystem: 'geo',
      label: {
        formatter: '{b}',
        color: '#0C092B',
        position: 'bottom',
        show: true,
      },
      data: [
        {
          name: '始发城市',
          symbolSize: [17, 27],
          symbol: 'image://' + mapPic,
        },
      ],
      encode: {
        value: 5,
      },
      zlevel: 10,
    },
    /*  {
      name: 'Top10',
      type: 'map',
      mapType: 'china',
      zoom: 4,
      top: 100,
      show: true,
      roam: true,
      geoIndex: 0,
      scaleLimit: {
        min: 1.5,
      },
      label: {
        normal: { show: false },
        emphasis: { show: false, }
      },
      itemStyle: {
        normal: {
          areaColor: '#EEF0F3',
          borderColor: '#7F7F7F'
        },
        emphasis: {
          areaColor: '#EEF0F3',
        }
      },
      markLine : {
        smooth:true,
        effect : {
          show: true,
          scaleSize: 1,
          period: 30,
          color: '#fff',
          shadowBlur: 10
        },
        itemStyle : {
          normal: {
            label:{show:false},
            borderWidth:1,
            lineStyle: {
              type: 'solid',
              color: 'red',
              shadowBlur: 10
            }
          }
        },
        data : [
          [{x:'102.874434',y:'25.3842893'}, {x:'113.542493',y:'23.3262273'}],
         /!* [{name:'中山市',value:95},{name:'始发城市',value:95}],*!/
        ]
      },
    }*/
  ],
}
export const kgLegendColor = [
  '#8B85FF',
  '#8B85FF',
  '#6690FF',
  '#50BCFA',
  '#6ED4FF',
  '#5DD3A2',
  '#FF7899',
  '#FFAB39',
]
/*echart legend*/
export const kgLegend = [
  {
    weightLevel: 1,
    label: '0~5',
    value: '0%',
    color: kgLegendColor[1],
  },
  {
    weightLevel: 2,
    label: '5~30',
    value: '0%',
    color: kgLegendColor[2],
  },
  {
    weightLevel: 3,
    label: '30~50',
    value: '0%',
    color: kgLegendColor[3],
  },
  {
    weightLevel: 4,
    label: '50~100',
    value: '0%',
    color: kgLegendColor[4],
  },
  {
    weightLevel: 5,
    label: '100~300',
    value: '0%',
    color: kgLegendColor[5],
  },
  {
    weightLevel: 6,
    label: '300~1000',
    value: '0%',
    color: kgLegendColor[6],
  },
  {
    weightLevel: 7,
    label: '1000以上',
    value: '0%',
    color: kgLegendColor[7],
  },
]

/*echart legend*/
export const moneyLegend = [
  {
    label: '运费',
    value: '',
    color: '#8B85FF',
  },
  {
    label: '增值费',
    value: '',
    color: '#75A8FF',
  },
]
