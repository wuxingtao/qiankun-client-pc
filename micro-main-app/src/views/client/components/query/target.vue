<template>
  <div class="target-search_r">
    <!--搜索-->
    <div class="search-form">
      <el-form class="search-form_r" label-width="80px" style="padding: 12px 24px 0 24px;border-radius: 0 0 5px 5px;" :model="form" :rules="rules" ref="form">
        <!-- 新地址选择 -->
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="始发地" required prop="startPoint">
              <div class="address-warp">
                <div class="line-layer">
                  <div class="right">
                    <address-item ref="sendAddress" :fullAddress.sync="form.startPoint" :showInput="false" tabCascaderPlaceholder="选择或粘贴始发地，例如：深圳" />
                  </div>
                  <div class="left">
                    <i class="unit" style="color: #c0c4cc;padding-left: 0;">|</i>
                    <el-popover placement="bottom-end" width="525" v-model="sendVisible">
                      <div v-loading="loading" element-loading-text="拼命识别中...">
                        <el-row class="target_input_title">
                          <el-col :span="18"><span class="target_input_label">智能识别</span></el-col>
                          <el-col :span="6" style="text-align: right">
                            <i @click="sendVisible = false" class="el-icon-close target_input_close"></i>
                          </el-col>
                        </el-row>
                        <div>
                          <el-input type="textarea" class="target_input_r" :rows="6" resize="none" maxlength="1000" clearable show-word-limit placeholder="粘贴完整地址,系统自动解析地址，例如“广东省深圳市宝安区福园二路XX工业网员”" v-model="form.send">
                          </el-input>
                        </div>
                        <div class="target_input_but">
                          <el-button style="width: 60px;" size="mini" round plain @click="analysisCell(1)">取消
                          </el-button>
                          <el-button size="mini" style="width: 60px;" round type="primary" @click="analysis(1)">识别
                          </el-button>
                        </div>
                      </div>
                      <el-button type="text" slot="reference">智能识别
                      </el-button>
                    </el-popover>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目的地" required>
              <div class="address-warp">
                <div class="line-layer">
                  <div class="right">
                    <address-item ref="receiptAddress" :fullAddress.sync="form.endPoint" :showInput="false" tabCascaderPlaceholder="选择或粘贴始发地，例如：深圳" />
                  </div>
                  <div class="left">
                    <i class="unit" style="color: #c0c4cc;padding-left: 0;">|</i>
                    <el-popover placement="bottom-end" width="525" v-model="goalVisible">
                      <div v-loading="loading" element-loading-text="拼命识别中...">
                        <el-row class="target_input_title">
                          <el-col :span="18"><span class="target_input_label">智能识别</span></el-col>
                          <el-col :span="6" style="text-align: right">
                            <i @click="goalVisible = false" class="el-icon-close target_input_close"></i>
                          </el-col>
                        </el-row>
                        <div>
                          <el-input type="textarea" class="target_input_r" :rows="6" clearable resize="none" maxlength="1000" show-word-limit placeholder="粘贴完整地址,系统自动解析地址，例如“广东省深圳市宝安区福园二路XX工业网员”" v-model="form.goal">
                          </el-input>
                        </div>
                        <div class="target_input_but">
                          <el-button style="width: 60px;" size="mini" round plain type="primary" @click="analysisCell">取消
                          </el-button>
                          <el-button style="width: 60px;" size="mini" round type="primary" @click="analysis">识别
                          </el-button>
                        </div>
                      </div>
                      <el-button type="text" slot="reference">智能识别
                      </el-button>
                    </el-popover>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="寄件时间" required>
              <div class="address-warp">
                <!-- <div class="line-layer">
                  <div > -->
                <el-date-picker v-model="form.sendTime" type="date" clearable style="width: 100%;" value-format="yyyy-MM-dd HH:mm:ss" :picker-options="pickerOptions" placeholder="选择日期时间">
                </el-date-picker>
                <!-- </div>
                  <div class="left">
                    <i class="el-icon-date" style="color: #7556ed;padding: 0 5px"></i>
                  </div>
                </div> -->
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label-width="2" label="" required>
              <div class="weight_value">
                <el-select v-model="itemFlag" size="medium" style="width:80px" class="no_border">
                  <el-option label="重量" value="0" />
                  <el-option label="体积" value="1" />
                </el-select>
                <div class="address-warp" v-if="itemFlag === '0'" style="width:calc(100% - 80px)">
                  <div class="line-layer input_type">
                    <div class="right">
                      <el-input placeholder="请输入重量" oninput="value=value.replace(/^\.+|[^\d.]/g,'')" @blur="inputChange($event,'weight')" v-model="form.weight" clearable maxlength="6">
                      </el-input>
                    </div>
                    <div class="left button-iconfont">
                      <i class="unit">kg</i>
                    </div>
                  </div>
                </div>
                <div class="address-warp_input" v-else style="width:calc(100% - 80px)">
                  <el-row :gutter="10">
                    <el-col :span="8" style="padding: 0">
                      <div class="line-layer input_type address-warp">
                        <el-input placeholder="长" clearable oninput="value=value.replace(/^\.+|[^\d.]/g,'')" @blur="inputChange($event,'length')" v-model="form.length" maxlength="3">
                        </el-input>
                        <div class="left">
                          <i class="unit">cm</i>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="line-layer input_type address-warp">
                        <div class="right">
                          <el-input placeholder="宽" clearable oninput="value=value.replace(/^\.+|[^\d.]/g,'')" @blur="inputChange($event,'width')" v-model="form.width" maxlength="3">
                          </el-input>
                        </div>
                        <div class="left">
                          <i class="unit">cm</i>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="line-layer input_type address-warp">
                        <div class="right">
                          <el-input placeholder="高" clearable oninput="value=value.replace(/^\.+|[^\d.]/g,'')" @blur="inputChange($event,'height')" v-model="form.height" maxlength="3">
                          </el-input>
                        </div>
                        <div class="left">
                          <i class="unit">cm</i>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>

              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <div>
              <el-button type="primary" size="medium" round @click="searchData">查询</el-button>
              <el-button size="medium" round @click="reset">清空</el-button>
            </div>
          </el-col>
        </el-row>

      </el-form>
    </div>
    <!--tabel-->
    <div class="main_body">
      <div class="table-content">
        <h3 class="table-title">
          时效详情
        </h3>
        <ky-table ref="kyTable" v-loading="loading" :data="tableData" style="width: 100%" height="calc(100vh - 434px)">
          <el-table-column prop="serviceMode" label="服务方式">
          </el-table-column>
          <el-table-column sortable prop="expressTime" label="预估时效">
            <template slot-scope="{row}">
              <div v-if="row.expressTime">
                {{row.expressTime}} 前送达
              </div>
              <div v-else>
                -
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="$store.getters.hasFrightFeeAuth" prop="beforeDiscountAmount" label="预估运费">
            <template slot="header" slot-scope="scope">
              <span>预估运费</span><span style="padding: 0 4px;color: #909399">(预估运费仅作参考,以实际收费运费为准)</span>
            </template>

            <template slot-scope="scope">
              <el-button type="text" size="small" style="color:#7352bf;" v-if="scope.row.money || scope.row.money===0">{{ scope.row.money }} 元
              </el-button>
              <el-button @click="searchClick(scope.row, scope.$index)" type="text" size="small" style="color:#7352bf;" v-else>查询运费
              </el-button>
            </template>
          </el-table-column>
        </ky-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getCustomerCode, getPhone } from '@/utils/storage'
import { getUserData } from '@/utils/storage'
import * as time from '@/utils/formatDate'

let { formatDate } = time.default
import {
  getMultiLevelSubList,
  getMultiLevelSubListNew,
  getTimelinessNew,
  GetFreightCalculat
} from '@/services/api/address'
export default {
  data () {
    let that = this
    //数字或者带有小数点的数字
    function validateNum (val) {
      const reg = /^\d+(\.\d+)?$/
      return reg.test(val)
    }
    // const checkSenderAddress = async (rule, value, callback) => {
    //   const result = await this.$refs.sendAddress.validateForm()
    //   if (!result && !this.formData.startPoint) {
    //     return callback(new Error("省市区不能为空"))
    //   }
    //   callback()
    // }
    var validWeight = (rule, value, callback) => {
      if (value) {
        if (!validateNum(value)) {
          callback(new Error('只能输入正数，可带小数点'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    var validVolume = (rule, value, callback) => {
      if (this.form.length) {
        if (!validateNum(this.form.length) || this.form.length.length > 9) {
          callback(new Error('输入有误,且不能超过9个字符'))
        }
      }
      if (this.form.width) {
        if (!validateNum(this.form.width) || this.form.length.width > 9) {
          callback(new Error('输入有误,且不能超过9个字符'))
        }
      }
      if (this.form.height) {
        if (!validateNum(this.form.height) || this.form.length.height > 9) {
          callback(new Error('输入有误,且不能超过9个字符'))
        }
      }
      callback()
    }
    return {
      sendAddressKey: '',
      goalAddressKey: '',
      token: null,
      phone: getPhone(), // 手机号
      custNo: getCustomerCode(), // 客户编码
      itemList: [
        { value: 1, name: '体积' },
        { value: 2, name: '重量' }
      ],
      itemFlag: '0',
      tableData: [],
      options: [],
      form: {
        sendAddress: [],
        send: '',
        goalAddress: [],
        goal: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        sendTime: new Date(),
        startPoint: '',
        endPoint: ''
      },
      sendVisible: false,
      goalVisible: false,
      loading: false,
      pickerOptions: {
        // 设定时间范围 今天之后
        disabledDate: time => {
          return time.getTime() < Date.now()
        }
      },
      rules: {
        weight: [
          { validator: validWeight, trigger: 'blur' },
          { min: 0, max: 9, message: '长度最多9个字符', trigger: 'blur' }
        ],
        volume: [{ validator: validVolume, trigger: 'blur' }],
        // startPoint:[{ required: true, message: "省市区不能为空", trigger: 'change' }]
      },
      addressProps: {
        lazy: true,
        lazyLoad (node, resolve) {
          const { value, level } = node
          getMultiLevelSubList(value).then(res => {
            if (res.data.data && res.data.data.districtList) {
              const nodes = res.data.data.districtList.map(item => ({
                value: item.districtID,
                label: item.districtName,
                leaf: level >= 2
              }))
              resolve(nodes)
            }
          })
        }
      },
      addOptions: {
        lazy: true,
        async lazyLoad (node, resolve) {
          const { value, level } = node
          let trueLevel = level
          if (node.data && node.data.parentOption) {
            trueLevel += 1
          }
          const resultNodes = await that.getAddressChildNodes(value, level, trueLevel) || []
          let nodes = resultNodes.filter(n => n.label)
          for (let node of resultNodes.filter(n => !n.label)) {
            let tempNodes = await that.getAddressChildNodes(node.value, level, level + 1)
            tempNodes = tempNodes.map(m => Object.assign({ parentOption: node }, m))
            nodes.push(...tempNodes)
          }
          resolve(nodes)
        }
      },
    }
  },
  activated () {
    this.$refs.kyTable.doLayout()
  },
  async mounted () {
    let resourceId = this.$store.getters.authorityIds
    this.setAddress()
  },
  methods: {
    async setAddress () {
      let userData = getUserData() || {}
      if (userData.customerInfo && userData.customerInfo.address) {
        await this.$refs.sendAddress.fillTheAddress(userData.customerInfo.address, () =>
          this.$refs.form.validateField('startPoint')
        )
      }
    },

    async getAddressChildNodes (addressId, level, truelevel) {
      const res = await getMultiLevelSubListNew(addressId, truelevel)
      if (res.data && res.data.districtList) {
        const nodes = res.data.districtList.map(item => ({
          value: item.districtID,
          label: item.districtName,
          leaf: level >= 2
        }))
        return nodes
      }
    },
    // 取消智能识别
    analysisCell (type) {
      if (type === 1) {
        this.form.send = ''
        this.form.sendAddress = []
        this.sendVisible = false
      } else {
        this.form.goal = ''
        this.form.goalAddress = []
        this.goalVisible = false
      }
    },
    // 解析地址
    async analysis (val) {
      let address = ''
      if (val === 1) {
        address = this.form.send
      } else {
        address = this.form.goal
      }
      if (address === '') {
        this.$message({
          type: 'error',
          message: '详细地址不能为空'
        })
        return
      }
      if (
        address.match(/[\u4e00-\u9fa5]/g) === null ||
          address.match(/[\u4e00-\u9fa5]/g).length < 12
      ) {
        this.$message({
          type: 'error',
          message: '详细地址的中文长度不能小于12位'
        })
        return
      }
      this.loading = true
      if (val === 1) {
        await this.$refs.sendAddress.fillTheAddress(address, () =>
          this.$refs.form.validateField('startPoint')
        )
      } else {
        await this.$refs.receiptAddress.fillTheAddress(address, () =>
          this.$refs.form.validateField('endPoint')
        )
      }
      this.loading = false
    },

    inputChange ($event, key) {
      this.form[key] = $event.target.value
    },
    keyup (e) {
      let keyCode = e.keyCode
      if (!this.isNumberKeyCode(keyCode)) {
        e.preventDefault()
        return
      }
    },
    isNumberKeyCode (keyCode) {
      // 数字
      if (keyCode >= 48 && keyCode <= 57) return true
      // 小数字键盘
      if (keyCode >= 96 && keyCode <= 105) return true
      // Backspace, del, 左右方向键
      if (keyCode == 8 || keyCode == 46 || keyCode == 37 || keyCode == 39) return true
      //小数点
      if (keyCode == 110 || keyCode == 190) return true
      return false
    },
    handleFilter () {
      return false
    },
    //省市区截取
    getArea: function (str) {
      let area = {}
      let index11 = 0
      let index1 = str.indexOf('省')
      if (index1 == -1) {
        index11 = str.indexOf('自治区')
        if (index11 != -1) {
          area.Province = str.substring(0, index11 + 3)
        } else {
          area.Province = str.substring(0, 0)
        }
      } else {
        area.Province = str.substring(0, index1 + 1)
      }

      let index2 = str.indexOf('市')
      if (index11 == -1) {
        area.City = str.substring(index11 + 1, index2 + 1)
      } else {
        if (index11 == 0) {
          area.City = str.substring(index1 + 1, index2 + 1)
        } else {
          area.City = str.substring(index11 + 3, index2 + 1)
        }
      }

      let index3 = str.lastIndexOf('区')
      if (index3 == -1) {
        index3 = str.indexOf('县')
        area.Country = str.substring(index2 + 1, index3 + 1)
      } else {
        area.Country = str.substring(index2 + 1, index3 + 1)
      }
      return area
    },
    // 查询数据
    searchData () {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true
          console.log(this.form.startPoint)
          const sendAddressRef = this.$refs.sendAddress
          const receiptAddressRef = this.$refs.receiptAddress
          if (sendAddressRef.formData.districtList.length > 0 && receiptAddressRef.formData.districtList.length > 0 && this.form.sendTime) {
            const sendAddressInfo = sendAddressRef.getAddressInfo(true)
            const receiptAddressInfo = receiptAddressRef.getAddressInfo(true)

            let sendRegion = sendAddressInfo.map(m => m.label)
            let sendAddress = sendAddressInfo.map(m => m.id)
            let receiptRegion = receiptAddressInfo.map(m => m.label)
            let receiptAddress = receiptAddressInfo.map(m => m.id)

            let sendDate = formatDate(this.form.sendTime, 'yyyy-MM-dd hh:mm')
            let res = await getTimelinessNew(sendRegion, receiptRegion, sendAddress, receiptAddress, sendDate) || {}
            if (res.code === 0 || res.code === '0') {
              let data = res.data.dataList || []
              if (data.length > 0) {
                data.forEach(item => {
                  item.money = ''
                })
              }
              this.tableData = data
            } else {
              this.tableData = []
              this.$message({
                message: res.msg || '输入的地址我司暂不支持派送',
                type: 'warning'
              })
            }
          } else {
            this.$message({
              message: '寄件收件地址和寄件时间不能为空',
              type: 'warning'
            })
          }
          this.loading = false
        }
      })
    },
    // 重置
    reset () {
      this.form.weight = ''
      this.form.length = ''
      this.form.width = ''
      this.form.height = ''
      this.form.send = ''
      this.form.goal = ''
      // this.form.startPoint = ""
      // this.form.endPoint = ""
      this.form.sendTime = new Date()
      this.tableData = []
    },
    // 查询运费
    async searchClick (val, index) {
      let serviceMode = null
      if (val.serviceMode === '当天达') {
        serviceMode = 0
      } else if (val.serviceMode === '次日达') {
        serviceMode = 1
      } else if (val.serviceMode === '隔日达') {
        serviceMode = 2
      } else if (val.serviceMode === '陆运件') {
        serviceMode = 3
      } else if (val.serviceMode === '同城次日') {
        serviceMode = 4
      } else if (val.serviceMode === '同城即日') {
        serviceMode = 5
      } else if (val.serviceMode === '早班件') {
        serviceMode = 6
      } else if (val.serviceMode === '中班件') {
        serviceMode = 7
      } else if (val.serviceMode === '晚班件') {
        serviceMode = 8
      } else if (val.serviceMode === '航空件') {
        serviceMode = 9
      } else if (val.serviceMode === '冷运件') {
        serviceMode = 10
      } else if (val.serviceMode === '省内次日') {
        serviceMode = 11
      } else if (val.serviceMode === '省内即日') {
        serviceMode = 12
      } else if (val.serviceMode === '空运') {
        serviceMode = 13
      } else if (val.serviceMode === '专运') {
        serviceMode = 14
      }
      let param = {
        mobile: this.phone,
        companyNo: this.custNo,
        sendAreaCode: val.sendArea,
        receiptAreaCode: val.receiptArea,
        billingWeight: this.itemFlag === '0' ? this.form.weight : '',
        number: '',
        cubicNumber:
            this.itemFlag === '1'
              ? this.form.length * this.form.width * this.form.height
              : '',
        goodTime: formatDate(this.form.sendTime, 'yyyy-MM-dd hh:mm'),
        serviceMode: serviceMode
      }
      if (!param.billingWeight && !param.cubicNumber) {
        this.$message({
          message: '重量或者体积不能为空',
          type: 'warning'
        })
        return
      }
      this.loading = true
      let res = await GetFreightCalculat(param)
      if (res.code === 0 || res.code === '0') {
        let money = res.data[0].money
        val.money = money
        // this.$set(this.tableData[index], "money", money)
      } else {
        this.$message({
          type: 'error',
          message: res.msg || '没有查到相关信息，请联系客服咨询'
        })
      }
      this.loading = false
    },
    //去填单
    handleClick () {
    },
  }
}
</script>


<style lang="scss">
  .target-search_r {
    width: 100%;
    height: 100%;
    background: #fff;
    /* 搜索*/
    .search-form .search-form_r {
      //  .el-range-separator {
      //     font-size: 0;
      //     width: 12px;
      //     height: 13px;
      //     background: url("../../../../assets/image/date-arrow.png") no-repeat top
      //       left;
      //     background-size: contain;
      //   }
      .el-range-input {
        border: 0 !important;
        background-color: transparent;
      }
      .el-icon-date {
        color: #7556ed;
      }
      .right {
        .el-form-item {
          margin-bottom: 0 !important;
        }
      }
      .el-form-item {
        margin-bottom: 10px !important;
      }
      .el-input__inner {
        height: 30px;
        line-height: 30px;
      }
      .el-form-item__content {
        line-height: 30px !important;
      }
      .el-form-item__label {
        padding: 0 8px 0 0;
        color: #333;
        line-height: 32px;
        font-size: 14px;
        height: 32px;
      }
      .el-form-item__error {
        z-index: 9;
        padding: 3px 8px !important;
        color: #2c1e58 !important;
        font-size: 14px;
        line-height: 20px;
        background: #eae6ff;
        border-radius: 4px;
        top: 115%;
      }
      .el-button--medium.is-round {
        padding: 8px 20px;
      }
      .el-button {
        padding: 6px 14px;
      }
      .el-input__icon {
        line-height: 32px;
      }
      .address-warning-tip {
        padding-top: 3px;
        font-size: 12px;
        line-height: 12px;
        position: absolute;
        color: #ffaa00;
      }

      .weight_value {
        display: flex;
      }

      .address-warp {
        position: relative;
        padding: 0 10px;
        background: rgba(154, 95, 255, 0);
        border: 1px solid #dcdae2;
        border-radius: 18px;
      }

      .address-warp_input {
        position: relative;
        padding: 0 5px;
        .el-input__inner {
          padding: 0;
        }
      }

      .el-input__inner {
        // background: #eef3fc;
        border-radius: 18px;
        border: 0 !important;
      }

      .date_picker {
        .el-input__prefix {
          display: none !important;
        }
      }

      /* 左边固定，右边自适应 */
      .line-layer {
        position: relative;
        display: flex;

        .right {
          flex: 1;
        }

        .left {
          text-align: right;

          .unit {
            font-style: normal;
            color: #909399;
          }
          .icon {
            font-style: normal;
            padding: 0 5px;
            color: #7556ed;
          }

          .icon-but {
            cursor: pointer;
          }
        }
        .button-iconfont {
          .iconfont {
            padding: 0 5px;
          }
        }
      }
      .input_type {
        border-radius: 18px;
      }
    }

    .main_body {
      background: #f4f4f4;
      padding-top: 20px;
    }

    /*tabel*/
    .table-content {
      border-radius: 5px;
      padding: 0 20px 10px 20px;
      background: #fff;
      .el-table__header-wrapper thead tr > th {
        padding: 0;
      }
    }

    .table-title {
      height: 50px;
      line-height: 50px;
      color: #333333;
      font-weight: 600;
      margin-bottom: 20px;
      border-bottom: 1px solid #f1f1f5;
      font-size: 16px;
    }

    /*服务区域详情*/
    .server-info {
      padding: 0 20px 10px 20px;
      background: #fff;
      border-radius: 5px;

      .server-type {
        height: 25px;
        line-height: 25px;
        padding: 5px 0;

        .title {
          padding: 0 5px;
        }
      }

      .server-type-icon {
        display: inline-block;
        width: 25px;
        height: 25px;
        color: #fff;
        font-size: 15px;
        border-radius: 50%;
        text-align: center;
        font-style: normal;
      }

      .server_green {
        background-color: #52c41a;
      }

      .server_yellow {
        background-color: #fb3;
      }

      .server-info_text {
        padding: 10px 30px;
        font-size: 14px;
        color: #606266;

        h2 {
          font-style: normal;
          font-size: 14px;
          color: #606266;

          .bold-tel {
            padding: 0 2px;
            font-weight: bold;
          }
        }
      }
    }
  }
  /*智能识别*/
  .target_input_r {
    .el-textarea__inner {
      background-color: #f7f7f7 !important;
    }

    .el-input__count {
      background-color: #f7f7f7 !important;
    }
  }
  .target_input_title {
    padding: 5px 0;
    .target_input_label {
      font-weight: 600;
      font-size: 16px;
      color: #606266;
    }
    .target_input_close {
      padding: 0 5px;
      font-size: 20px;
      cursor: pointer;
      color: #909399;
      &:hover {
        color: #409eff;
      }
    }
  }
  .target_input_but {
    text-align: right;
    padding: 12px 5px 0 5px;
  }
</style>
