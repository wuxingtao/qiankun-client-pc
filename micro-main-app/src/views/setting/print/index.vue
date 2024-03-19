<template>
  <div class='print-setting page--default page__container'>
  <div class='page__content page-style1'>
  <div class='page-box'>
    <div class='page-box__header'>
      <span class='page-box__title'>打印机设置</span>
    </div>
    <div class='page-box__content'>
      <!--  打印机列表   -->
      <ul class='printer-list'>
        <li class='printer--add' @click='handleAddPrinter'>
          <div class='printer__cont'>
            <i class='add-btn el-icon-plus fs_26'></i>
          </div>
          <div class='printer__name'>
            添加打印机
          </div>
        </li>
        <!--    云打印机        -->
        <li v-for='(item,index) in printers_cloud' :key='item.printerId'
            :class="['printer__item mr_16',{'is_default':item.printerId===printModel}]"
            @click='handleDefault(index,item.printerId)'>
          <div class='printer__cont'>
            <img src='../../../assets/image/setting/print-image.png'>
            <div :class='[`printer--status printer--${item.printerStatus}`]'>
              {{ item.printerStatus ? "在线" : "离线" }}
            </div>
            <div class='printer--close fs_14 cursor' @click.stop='handleUnBindDevice(item)'><i
              class='el-icon-error'></i></div>
          </div>
          <div class='printer__name'>{{ printerName(item) }}</div>
        </li>
        <!--    本地打印机、打印组件        -->
        <li v-for='(item,index) in printers_local' :key='index'
            :class="['printer__item mr_16',{'is_default':item.printerName===printModel}]"
            @click='handleDefault(index,item.printerName)'>
          <div class='printer__cont'>
            <img src='../../../assets/image/setting/print-image.png'>
            <template v-if='item.isPrintApp'>
              <!-- <div :class="[`printer--status printer--${item.printerStatus?1:0}`]">
              {{ item.printerStatus ? '在线' : '离线' }}
            </div> -->
              <div class='printer--close fs_14 cursor' @click.stop='handleRemovePrintApp(item.printerName)'><i
                class='el-icon-error'></i></div>
            </template>
          </div>
          <div class='printer__name'>{{ item.printerName }}</div>
        </li>
      </ul>
    </div>
  </div>
  <div class='page-box'>
  <div class='page-box__header'>
    <span class='page-box__title'>面单设置</span>
  </div>
  <div class='page-box__content flex'>
  <div class='preview__wrapper mr_30'>
    <div class='preview__title mb_12 f_w_500'>预览面单</div>
    <div class='preview__content'>
      <img :src='previewSrc' class='preview__img'>
      <div class='preview__btn flex flex_ai_c flex_jc_c' @click='previewShow'>
        <!--                <i class="iconfont icon-search mr_4 fs_14&#45;&#45;strict"></i>-->
        <img class='preview-icon' src='../../../assets/image/setting/icon-search-preview.png' alt=''>
        <span>放大查看</span>
      </div>
    </div>
  </div>
  <div class='printer-config'>
    <div class='header-title mb_12 f_w_500'>面单设置</div>
    <div class='printer__form'>
      <el-form :model='formData' ref='formRef'>
        <el-form-item label='选择面单类型:' class='waybill-list'>
          <el-radio-group v-model='formData.sheetType'>
            <el-radio v-for='(item,index) in waybillTypeList' :key='index' :label='item.sheetType'>
              <div class='waybill__item'>
                <div class='waybill__label ellipsis'>
                  <p>{{ item.label }}</p>
                </div>
                <div class='waybill__desc c_999'>{{ item.desc }}</div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <div class='title-tip'>
          选择加密信息:
          <span class='tip'><i class='el-icon-warning-outline' />修改加密信息请联系市场员</span>
        </div>
        <el-form-item label='' class='list-item encryption-item' :disabled='true'>
          <div class='sj__box mr_16'>
            <div class='form-item__title'>收方存根</div>
            <div class='form-item__content'>
              <el-radio-group v-for='(item,index) in sf_cg_List' :key='index' v-model='item.encryptType'
                              :disabled='true'>
                <div class='item__label disabled'>{{ item.fieldName }}：</div>
                <el-radio v-for="(checkItem,checkIndex) in checkboxGroup.filter(m=>m.key !== '30'|| item.noEncryption)"
                          :label='checkItem.key' :key='checkItem.key + checkIndex'>{{ checkItem.label }}
                </el-radio>
              </el-radio-group>
            </div>
          </div>
          <div class='jj__box'>
            <div class='form-item__title'>寄方存根</div>
            <div class='form-item__content'>
              <el-radio-group v-for='(item,index) in jf_cg_List' :key='index' v-model='item.encryptType'
                              :disabled='true'>
                <div class='item__label disabled'>{{ item.fieldName }}：</div>
                <el-radio v-for="(checkItem,checkIndex) in checkboxGroup.filter(m=>m.key !== '30'|| item.noEncryption)"
                          :label='checkItem.key' :key='checkIndex'>{{ checkItem.label }}
                </el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-form-item>
        <el-form-item label='设置备注字体:' class='list-item'>
          <div class='font-item--size inline-block mr_16'>
            <div class='form-item__title c_666'>字体大小</div>
            <div class='form-item__content'>
              <el-select v-model='formData.fontType' placeholder='请选择'>
                <el-option label='8' value='8'></el-option>
                <el-option label='11' value='11'></el-option>
                <el-option label='12' value='12'></el-option>
                <el-option label='13' value='13'></el-option>
              </el-select>
            </div>
          </div>
          <div class='font-item--weight inline-block'>
            <div class='form-item__title c_666'>字体粗细</div>
            <div class='form-item__content'>
              <el-select v-model='formData.fontBold' placeholder='请选择'>
                <el-option label='正常' value='0'></el-option>
                <el-option label='加粗' value='1'></el-option>
              </el-select>
            </div>
          </div>
        </el-form-item> -->
        <div v-if='printFlagType' class='setting-flag'>
          设置公司标识:
          <span @click='viewPrintFlag'>
                    <template v-if="printFlagType==='address'">添加收件地址</template>
                    <template v-else-if="printFlagType==='company'">添加公司名称</template>
                    <template v-else>添加公司与标记</template>
                  </span>
        </div>
      </el-form>
    </div>
<!-- 备注字体 -->
<!--    <print-remark :fontSize="printerSetting.remarkFontSize" ref="printRemarkRef"></print-remark>-->
  </div>
  </div>
  </div>
  <!--  自定义字段    -->
  <div class='page-box custom_filed' style='display: none;'>
    <div class='page-box__header'>
      <div class='page-box__title'>
        <span class='mr_12'>设置自定义字段</span>
        <el-tooltip popper-class='tooltip--custom' effect='dark' content='增加的自定义字段，将显示在“下单寄件-增值服务”区域，您可根据字段名称填写对应的信息。'
                    placement='right'>
          <!-- <i class="iconfont icon-help"></i> -->
          <svg-icon icon-class='custom-question'></svg-icon>
          <!-- <div class="custom_question">?</div> -->
        </el-tooltip>
      </div>
    </div>
    <div class='page-box__content'>
      <div class='custom-options'>
        <div class='custom__title mb_20'>
          <span class='f_w_500 fs_14'>字段名称</span> <span class='c_999'>（最多增加3个）</span>
        </div>
        <el-form :model='customForm' :rules='customFormRule' ref='customRef'>
          <div class='custom__list'>
            <div class='custom__item' v-for='(item,index) in customList' :key='index'>
              <div class='flex flex_ai_c'>
                <div class='mr_8'>
                  <el-form-item :prop='`customColumn_0${index+1}`'>
                    <el-input placeholder='请输入字段名称' v-model='item.value' clearable :maxlength="`${index===0?'':'20'}`"
                              @clear='customClear(index)' @input='customInputChange($event,index)' />
                  </el-form-item>
                </div>
                <div class='custom__group'>
                  <!-- <i class="theme-color cursor el-icon-circle-plus" @click="customAdd" v-if="(customList.length ===2&&index===1)||customList.length===1"></i> -->
                  <svg-icon icon-class='custom_field_add' @click='customAdd'
                            v-if='(customList.length ===2&&index===1)||customList.length===1'></svg-icon>
                  <svg-icon icon-class='custom_field_delete' @click='customDelete(index)'
                            v-if='!(index ===0 && customList.length === 1)'></svg-icon>
                  <!-- <i class="theme-color cursor el-icon-remove" @click="customDelete(index)" v-if="!(index ===0 && customList.length === 1)"></i> -->
                </div>

              </div>
              <!-- <el-checkbox v-model="item.checked" :disabled="!item.value">需打印在面单</el-checkbox> -->
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
  </div>
  <div class='page__footer admin-footer'>
    <div class='button-group'>
      <el-button type='primary' size='large' round :loading='loading' @click='updatePrintSet' v-btnThrottle>保存
      </el-button>
    </div>

  </div>
  <bind-printer :visible='dialogList.add' @close='dialogList.add=false' @refresh='refreshPrinters'></bind-printer>
  <preview-dialog title='图片预览' :url='previewSrc' :visible='previewVisible' @close='previewHide'></preview-dialog>
  <flag-list :visible.sync='flagListVisible' :printFlagType='printFlagType' />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getPhone, getCustomerCode, setPrintAppData, getPrintAppData } from '@utils/storage'
import {
  GetPrintSet,
  UpdatePrintSet,
  UnBindDevice,
  GetPrintTemplateImage
} from '@api/setting'
import printerUtil from '@utils/printerUtil'
import PreviewDialog from './components/preview-dialog'
import BindPrinter from './components/bind-printer'
import store from '@/store'
import constant from '@views/setting/print/constant'
import Regular from '@utils/regular'
import FlagList from './components/flag-list'
import printRemark from './components/print-remark'
// import printerWebsocket from "@utils/printerWebsocket"

export default {
  name: 'print-set',
  components: { PreviewDialog, BindPrinter, FlagList, printRemark },
  data() {
    return {
      loading: false,
      // 页面整体loading
      pageLoading: false,
      dialogList: {
        add: false
      },
      // 打印机列表
      printers_cloud: [],
      // 本地打印机
      printers_local: [],
      previewVisible: false,
      // 当前默认打印机key
      printIndex: '',
      // 当前默认打印机
      printModel: '',

      // 面单配置
      formData: {
        // 面单类型
        sheetType: '1',
        fontType: '',
        fontBold: ''
      },
      // 自定义字段配置
      customList: [{ checked: false, value: '' }],
      customForm: {
        customColumn_01: '',
        customColumn_02: '',
        customColumn_03: ''
      },
      customFormRule: {
        customColumn_01: [
          {
            pattern: Regular.textAndNumber,
            message: '请正确填写字段名称',
            trigger: 'change'
          }
        ],
        customColumn_02: [
          {
            pattern: Regular.textAndNumber,
            message: '请正确填写字段名称',
            trigger: 'change'
          }
        ],
        customColumn_03: [
          {
            pattern: Regular.textAndNumber,
            message: '请正确填写字段名称',
            trigger: 'change'
          }
        ]
      },
      // 后台打印机配置信息
      printerSetting: {},
      // 动态获取面单类型 key 运单类型 sheetType 纸张类型
      waybillTypeList: [
        {
          label: '三联电子运单',
          desc: '100*210mm',
          key: '30',
          sheetType: '1',
          url: require('../image/bills1.jpg'),
          urlS: require('../image/bills1_sel.svg')
        },
        {
          label: '二联电子运单',
          desc: '100*136mm',
          key: '20',
          sheetType: '2',
          url: require('../image/bills.png'),
          urlS: require('../image/bills_sel.png')
        },
        {
          label: '存根运单',
          desc: '100*136mm',
          key: '10',
          sheetType: '136Stub'
        },
        {
          label: 'A4打印(存根×4)',
          desc: '210*297mm',
          key: 'A4Stub',
          sheetType: 'A4Stub',
          defaultImage: require('../image/a4stub.png')
        },
        {
          label: '一联电子运单',
          desc: '76*130mm',
          key: 'oneCopy',
          sheetType: 'oneCopy',
          defaultImage: require('../image/oneCopy.png'),
        },
        {
          label: '一联存根',
          desc: '76*130mm',
          key: 'oneCopySub',
          sheetType: 'oneCopySub',
          defaultImage: require('../image/oneCopySub.png'),
        },
        {
          label: 'A6打印(存根×6)',
          desc: '210*297mm',
          key: 'A6Stub',
          sheetType: 'A6Stub',
          defaultImage: require('../image/a4stub.png')
        },
      ],
      // 面单预览图片
      templateImageList: [],
      checkboxGroup: constant.checkboxGroup,
      // 加密信息 value 加密类型， noEncryption 是否显示不加密
      sf_cg_List: constant.sf_cg_List,
      jf_cg_List: constant.jf_cg_List,
      flagListVisible: false
    }
  },
  computed: {
    ...mapState('setModule', ['sheetType']),
    ...mapState(['userInfo']),
    ...mapGetters(['customerShortName', 'authorityIds']),
    previewSrc() {
      let img = ''
      const sheetTypeItem = this.waybillTypeList.find(m => m.sheetType === this.formData.sheetType)
      if (this.templateImageList.length > 0) {
        const name = sheetTypeItem ? sheetTypeItem.label : '三联电子运单'
        const imageItem = this.templateImageList.find(item => item.name === name)
        img = imageItem && imageItem.imageUrl
      }
      if (!img) {
        if (sheetTypeItem && sheetTypeItem.defaultImage) {
          img = sheetTypeItem.defaultImage
        }
      }
      return img
    },
    printFlagType() {
      if (this.authorityIds.includes('120')) {
        return 'address'
      } else if (this.authorityIds.includes('121')) {
        return 'companyGoods'
      } else if (this.authorityIds.includes('122')) {
        return 'company'
      }
      return ''
    }
  },
  watch: {},
  mounted() {
    this.getPrintSet()
    this.getPrinters()
    this.handleTemplateImage()
  },
  methods: {
    viewPrintFlag() {
      this.flagListVisible = true
    },
    async refreshPrinters(param) {
      await this.getPrinters()
      if (param && param.printerName) {
        this.printModel = param.printerName
      }
    },
    //获取打印机列表
    async getPrinters() {
      this.getCloudPrinters()
      if (this.isClientMode) {
        this.printers_local = await printerUtil.getLocalPrinters()
      } else {
        this.printers_local = await printerUtil.getPrintApps()
      }
    },
    async getCloudPrinters() {
      const printers = await printerUtil.getCloudPrinters()
      if (printers && printers.length > 0) {
        // 设置默认打印机
        printers.forEach((item, index) => {
          if (item.isDefault) {
            this.printIndex = index
            this.printModel = item.printerId
          }
        })
      }
      this.printers_cloud = printers
    },
    //查询设置信息
    async getPrintSet() {
      try {
        this.pageLoading = true
        let res = await GetPrintSet()
        if (res.code === 0 && res.data) {
          let dataInfo = res.data
          // const { customColumn_01, customColumn_02, customColumn_03 } =
          //   dataInfo
          // // 自定义字段配置
          // this.customForm = {
          //   customColumn_01,
          //   customColumn_02,
          //   customColumn_03
          // }
          // Object.keys(this.customForm).forEach((item, index) => {
          //   if (this.customForm[item]) {
          //     this.$set(this.customList, index, {
          //       value: this.customForm[item],
          //       checked: dataInfo[`isPrint_0${index + 1}`]
          //     })
          //   }
          // })
          this.formData.sheetType = dataInfo.paperType
          this.printModel = dataInfo.printCode
          // 加密配置
          this.printerSetting = dataInfo
          // await this.getEncryOption(dataInfo)
          this.pageLoading = false
          store.commit('client/setPrintConfig', dataInfo)
        } else {
          this.pageLoading = false
        }
      } catch (e) {
        this.pageLoading = false
      }
    },
    // 从纸张类型获取运单类型
    getWaybillType(sheetType) {
      const item = this.waybillTypeList.filter(
        item => +item.sheetType === +sheetType
      )
      return item[0].key
    },

    /**
     * 获取加密配置
     * @param data 后台打印配置
     * @param sheetCurrent 指定的面单类型 [1,2,3]
     * @returns {*[]}
     */
    async getEncryOption(data) {
      return new Promise(async (resolve, reject) => {
        try {
          if (!data) {
            this.$message('未返回加密信息')
            reject('未返回加密信息')
          }
          let { fieldEncryption } = data
          // 只取3联加密配置，无论面单类型选择情况
          const waybillType = 30
          // let waybillType = this.getWaybillType(type)
          const encryOptions = fieldEncryption.filter(
            item => +item.waybillType === +waybillType
          )
          await this.initEncyList(encryOptions[0])
          resolve('')
        } catch (e) {
          reject(e)
        }
      })
    },
    // 初始化加密选项展示
    initEncyList(options = {}) {
      return new Promise((resolve, reject) => {
        try {
          const fieldsList = options.fieldsList
          if (typeof fieldsList !== 'object') {
            this.$message('未返回加密信息')
            reject('未返回加密信息')
          }
          fieldsList.forEach(item => {
            const yieldList =
              item.titleType === '20'
                ? this.sf_cg_List
                : item.titleType === '30'
                  ? this.jf_cg_List
                  : []
            if (
              [
                'sender',
                'receiver',
                'monthly_account',
                'declared_value'
              ].indexOf(item.fieldColumn) > -1
            ) {
              yieldList.forEach(yieldItem => {
                if (yieldItem.fieldColumn === item.fieldColumn) {
                  yieldItem = Object.assign(yieldItem, item)
                }
              })
            }
          })
          resolve('')
        } catch (e) {
          reject(e)
        }
      })
    },
    //保存设置信息
    async updatePrintSet() {
      this.$refs.customRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请修改提示处错误内容')
          return
        }
        let params = {
          // 纸张类型
          paperType: this.formData.sheetType,
          printCode: this.printModel,
          // remarkFontSize: this.$refs.printRemarkRef?.getFontSize()
        }
        /**
         * 2022/03/09 打印接口调整，参数只需要三个
         * */
        // params = Object.assign(params, this.customForm)
        // for (let i in this.formData) {
        //   if (this.formData[i]) {
        //     params[i] = this.formData[i]
        //   }
        // }
        // // 自定义字段
        // this.customList.forEach((item, index) => {
        //   params[`isPrint_0${index + 1}`] = item.checked ? 1 : 0
        // })
        // // 加密字段
        // const updateContents = [...this.sf_cg_List, ...this.jf_cg_List]
        //
        // params.fieldEncryption = {
        //   customerShortName: this.customerShortName,
        //   customerId: this.userInfo.customerInfo.id,
        //   customerCode: getCustomerCode(),
        //   // 修改类型 只针对3联处理
        //   // updateType: Number(this.getWaybillType(this.formData.sheetType)) ,
        //   updateType: 30,
        //   configType: 20,
        //   updateContents
        // }

        let res = await UpdatePrintSet(params)
        if (res.code === 0) {
          this.$message({
            message: '保存成功',
            type: 'success'
          })
          await this.$store.commit('setModule/UPDATE_PRINT_INFO', params)
          await this.getPrintSet()
        }
      })
    },
    // 显示添加打印机
    handleAddPrinter() {
      //this.getPrinters()
      this.dialogList.add = true
    },
    // 设置默认打印机
    handleDefault(index, val) {
      this.printIndex = index
      this.printModel = val
    },
    // 云打印机解绑
    handleUnBindDevice(item) {
      this.$confirm(`是否确认删除云打印机${item.printerName}？`, '删除打印机')
        .then(() => {
          UnBindDevice({
            // 客户编码
            UserID: getCustomerCode(),
            // 打印机编码
            PrinterNo: item.printerId
          }).then(res => {
            if (res.Status === 0) {
              this.getPrinters()
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    async handleRemovePrintApp(appId) {
      await this.$confirm('是否确认删除该打印组件？', '删除打印组件')
      const apps = getPrintAppData()
      setPrintAppData(apps.filter(f => f.appId !== appId))
      this.getPrinters()
    },
    handleTemplateImage() {
      GetPrintTemplateImage({}).then(res => {
        if (res.code === 0 && res.data) {
          this.templateImageList = res.data
        }
      })
    },
    // 显示图片预览
    previewShow() {
      this.previewVisible = true
    },
    previewHide() {
      this.previewVisible = false
    },
    // 自定义字段新增
    customAdd() {
      if (this.customList.length >= 3) {
        return
      }
      this.customList.push({ value: '', checked: false })
    },
    // 自定义字段删除
    customDelete(index) {
      if (this.customList.length <= 1) {
        return
      }
      this.customList.splice(index, 1)

      // 自定义字段重新赋值
      for (let item in this.customForm) {
        if (this.customForm.hasOwnProperty(item)) {
          this.customForm[item] = ''
        }
      }
      this.customList.forEach((item, index) => {
        this.customForm[`customColumn_0${index + 1}`] = item.value
      })
    },
    // 监听自定义字段
    customInputChange(val, index) {
      this.customForm[`customColumn_0${index + 1}`] = val
      if (!val) {
        this.customClear(index)
        return
      }
    },
    // 自定义字段清空,并取消打印
    customClear(index) {
      if (this.customList[index]) {
        this.customList[index].checked = false
      }
    },
    // 打印机名称拼接
    printerName(item) {
      return `跨越${item.modelType === 0 ? '云' : '标签'}打印机(${
        item.printerId
      })`
    }
  }
}
</script>

<style lang='scss' scoped>
@import "./index.scss";

.printer__form {
  .setting-flag {
    color: #666666;

    & > span {
      padding-left: 8px;
      color: #8365f6;
      cursor: pointer;
    }
  }
}
</style>
<style lang='scss'>
.tooltip--custom {
  width: 351px;
  height: 40px;
  background: #868686 !important;
  border-radius: 4px;
  box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  line-height: 20px;
  font-size: 14px;
  padding: 8px 12px;
}
</style>
