import dayjs from 'dayjs'
import { hasReceiptEnum, printStatusEnum, storageFeeStatusEnum } from '../enum/queryEnum'

export default [
  {
    span: 6,
    type: 'datePicker',
    title: '寄件日期',
    field: 'dateRange',
    rangeSeparator: '至',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    getPickerOptions() {
      const _this = this
      _this.tempSelectedDate = ''
      return {
        onPick: function ({ maxDate, minDate }) {
          _this.tempSelectedDate = minDate.getTime()
          if (maxDate) {
            this.tempSelectedDate = ''
          }
        },
        disabledDate: function (time) {
          if (time < dayjs().add(-6, 'month') || time > dayjs()) {
            return true
          }
          if (_this.tempSelectedDate) {
            const minDate = dayjs(_this.tempSelectedDate).add(-60, 'day')
            const maxDate = dayjs(_this.tempSelectedDate).add(60, 'day')
            return time.getTime() < minDate || time.getTime() > maxDate
          }
        },
        shortcuts: [
          {
            text: '近7天',
            onClick(picker) {
              const end = dayjs().format('YYYY-MM-DD 23:59:59')
              const start = dayjs().add(-6, 'd').format('YYYY-MM-DD 00:00:00')
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '上周',
            onClick(picker) {
              const start = dayjs()
                .subtract(1, 'week')
                .startOf('week')
                .add(1, 'day')
                .format('YYYY-MM-DD 23:59:59')
              const end = dayjs()
                .subtract(1, 'week')
                .endOf('week')
                .add(1, 'day')
                .format('YYYY-MM-DD 00:00:00')
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近30天',
            onClick(picker) {
              const end = dayjs().format('YYYY-MM-DD 23:59:59')
              const start = dayjs().add(-29, 'd').format('YYYY-MM-DD 00:00:00')
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近60天',
            onClick(picker) {
              const end = dayjs().format('YYYY-MM-DD 23:59:59')
              const start = dayjs().add(-59, 'd').format('YYYY-MM-DD 00:00:00')
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '当月',
            onClick(picker) {
              const end = dayjs().format('YYYY-MM-DD 23:59:59')
              const start = dayjs().startOf('month').format('YYYY-MM-DD 00:00:00')
              console.log(start)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '上月',
            onClick(picker) {
              const end = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD 23:59:59')
              const start = dayjs()
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD 00:00:00')
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    },
    format: 'yyyy/MM/dd',
    output: [
      {
        field: 'creationStartDate',
        formatter: data => {
          return dayjs(data).format('YYYY-MM-DD 00:00:00')
        }
      },
      {
        field: 'creationEndDate',
        formatter: data => {
          return dayjs(data).format('YYYY-MM-DD 23:59:59')
        }
      }
    ],
    clearable: true,
    options: {
      value() {
        const now = dayjs()
        return {
          dateType: '0',
          dateRange: [now.add(-59, 'd'), now]
        }
      }
    }
  },
  {
    span: 5,
    type: 'input',
    titleOptions: [
      {
        label: '收件人',
        value: 'pickupPerson',
        placeholder: '请输入收件人姓名'
      },
      {
        label: '收件地址',
        value: 'pickupAddress',
        placeholder: '请输入收件地址'
      },
      {
        label: '收件公司',
        value: 'pickupCustomerName',
        placeholder: '请输入收件公司'
      }
    ],
    titleField: 'pickup',
    field: 'pickupInfo',
    output: [
      {
        field: 'pickupPerson',
        formatter: data => {
          return data
        }
      },
      {
        field: 'pickupAddress',
        formatter: data => {
          return data
        }
      },
      {
        field: 'pickupCustomerName',
        formatter: data => {
          return data
        }
      }
    ],
    clearable: true,
    options: {
      value: {
        pickup: 'pickupPerson'
      },
      maxlength: {
        pickupPerson: 20,
        pickupAddress: 100,
        pickupCustomerName: 32
      }
    }
  },
  {
    span: 5,
    type: 'select',
    title: '是否打印',
    field: 'printStatus',
    selectOptions: [
      {
        label: '全部',
        value: printStatusEnum.ALL
      },
      {
        label: '未打印',
        value: printStatusEnum.NEVER_PRINT
      },
      {
        label: '已打印',
        value: printStatusEnum.PRINTED
      }
    ],
    options: {
      value: {
        printStatus: printStatusEnum.ALL
      }
    }
  },
  {
    span: 5,
    type: 'select',
    title: '货物保管费',
    className: 'custody-style',
    field: 'storageFeeStatus',
    selectOptions: [
      {
        label: '全部',
        value: storageFeeStatusEnum.ALL
      },
      {
        label: '即将产生',
        value: storageFeeStatusEnum.COMING
      },
      {
        label: '已产生',
        value: storageFeeStatusEnum.ATTRACTED
      },
      {
        label: '无',
        value: storageFeeStatusEnum.NONE
      }
    ],
    options: {
      value: {
        storageFeeStatus: storageFeeStatusEnum.ALL
      }
    }
  },
  {
    span: 5,
    type: 'select',
    title: '是否有回单',
    field: 'hasReceipt',
    selectOptions: [
      {
        label: '全部',
        value: hasReceiptEnum.ALL
      },
      {
        label: '是',
        value: hasReceiptEnum.HAS_RECEIPT
      },
      {
        label: '否',
        value: hasReceiptEnum.HAS_NOT_RECEIPT
      }
    ],
    options: {
      value: {
        hasReceipt: hasReceiptEnum.ALL
      }
    }
  },
  {
    span: 6,
    type: 'select',
    title: '服务方式',
    field: 'serviceMode',
    clearable: true,
    selectOptions: [],
    options: {}
  },
  {
    span: 5,
    type: 'input',
    titleOptions: [
      {
        label: '寄件人',
        value: 'deliveryPerson',
        placeholder: '请输入寄件人姓名'
      },
      {
        label: '寄件地址',
        value: 'deliveryAddress',
        placeholder: '请输入寄件地址'
      }
    ],
    titleField: 'delivery',
    field: 'deliveryInfo',
    output: [
      {
        field: 'deliveryPerson',
        formatter: data => {
          return data
        }
      },
      {
        field: 'deliveryAddress',
        formatter: data => {
          return data
        }
      }
    ],
    clearable: true,
    options: {
      value: {
        delivery: 'deliveryPerson'
      },
      maxlength: {
        deliveryPerson: 20,
        deliveryAddress: 100
      }
    }
  },
  {
    span: 5,
    type: 'select',
    title: '付款公司',
    field: 'customerCodes',
    clearable: true,
    multiple: true,
    collapseTags: true,
    selectOptions: [],
    options: {}
  }
]
