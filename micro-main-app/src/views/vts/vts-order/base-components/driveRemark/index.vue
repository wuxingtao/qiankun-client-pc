<template>
  <section class="driveRemark page-style1">
    <el-form class="driveRemarkInfo"
             :model="driveRemarkInfo"
             label-position="top"
             label-width="88px"
             ref="driveRemarkInfo">
      <div class="title">
        <img src="../../../../../assets/image/vts/fee.png"
             class="title-icon" />司机备注
      </div>
      <!-- <el-row>
        <el-col> -->
      <div class="remark-main">
        <div class="remark-input">
          <el-form-item prop="remark"
                        :rules="remark">
            <el-input placeholder="请输入司机备注"
                      v-model="driveRemarkInfo.remark"
                      clearable
                      class="diyInput"
                      maxlength="100"
                      show-word-limit
                      @focus="focus">
            </el-input>
          </el-form-item>
        </div>

        <div class="tags">
          <div :class="['tags-item',item.isclick?'active':'notactive']"
               @click="selectTag(item,index)"
               v-for="(item,index) in epidemicType"
               :key="index">{{item.label}}</div>
        </div>
      </div>

      <!-- </el-col>
      </el-row> -->
    </el-form>

  </section>
</template>

<script>
  import { fetchCheckRemark } from '@/services/api/vts'
  export default {
    data () {
      return {
        driveRemarkInfo: {
          remark: '',
          epidemicType: ''
        },
        // 防疫枚举数组
        epidemicType: [
          { value: '10', label: '48小时核酸证明', isclick: false },
          { value: '20', label: '疫苗接种记录', isclick: false },
          { value: '30', label: '行程卡不带*', isclick: false },
          { value: '40', label: '健康绿码', isclick: false },
          { value: '50', label: '防疫通行证', isclick: false },
        ],
      }
    },
    activated () {
      if (sessionStorage.getItem('AgainOrderDetailInfo')) {
        let { customerRemark, epidemicType } = JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo'))
        this.driveRemarkInfo.remark = customerRemark
        this.driveRemarkInfo.epidemicType = epidemicType
        if (epidemicType) {
          this.epidemicType.forEach((item, index) => {
            let epiList = epidemicType.split(',')
            epiList.forEach(item1 => {
              let _value = item1.split(':')[0]
              if (item.value == _value) {
                item.isclick = true
              }
            })
          })
        }
      }
    },
    methods: {
      // 选择防疫标签
      selectTag (item) {
        item.isclick = !item.isclick
      },
      // 防疫数据处理
      tackepidemicType () {
        let str = ''
        this.epidemicType.filter(ele => {
          return ele.isclick
        }).forEach(item => {
          str += `${item.value}:20,`
        })
        if (str.length > 1) {
          str = str.substring(0, str.length - 1)
        }
        return str
      },
      validForm () {
        return new Promise((resolve, reject) => {
          this.$refs.driveRemarkInfo.validate(valid => {
            if (valid) {
              const data = { ...this.driveRemarkInfo }
              resolve({ ...data })
            } else {
              reject(Error('校验失败'))
              this.$rule.error(this, this.$refs.driveRemarkInfo)
            }
          })
        })
      },
      // 重置
      reset () {
        this.driveRemarkInfo = {
          remark: '',
          epidemicType: ''
        }
        this.epidemicType.forEach(item => {
          item.isclick = false
        })
      },
      async validRemark (rule, val, cb) {
        if (!val) {
          cb()
          return
        }
        const { data } = await fetchCheckRemark({ param1: val })
        if (data.containContactWay) {
          cb(new Error('为保护您的隐私，请勿填写联系方式'))
        } else if (data.containIllegalCharacter) {
          cb(new Error(`为保护您的隐私，请勿填写关键词：${data.illegalCharacter}`))
        } else {
          cb()
        }
      },
      focus () {
        this.$parent.$refs.main.scroll(200, 200)
      }
    },
    computed: {
      remark () {
        return {
          required: false,
          validator: this.validRemark,
          trigger: 'blur'
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../common.scss';
  @import 'index.scss';
</style>
