<template>
  <el-form ref='form' class="goods-size-item-container" :model="formData" :rules="formRules" label-position="top" label-width="88px">
    <div class="flex-wrap">
      <div class="row-index">{{rowIndex+1}}</div>
      <el-form-item label="货物品名" prop="name"  v-if="!isHideNameAndWeight">
        <el-input v-model="formData.name" size="medium" maxlength=12 placeholder="货物品名"/>
      </el-form-item>
      <el-form-item label="单件重量" prop="weight" v-if="!isHideNameAndWeight">
        <el-input v-model="formData.weight" size="medium" v-kyerestrict.positive maxlength=12 placeholder="重量">
          <template slot="append">(kg)</template>
        </el-input>
      </el-form-item>
      <el-form-item label="长宽高" prop="size">
        <div class="flex-wrap size-wrapper">
          <el-input v-model="formData.length" size="medium" v-kyerestrict.positive maxlength=3 placeholder="长">
            <template slot="append">(cm)</template>
          </el-input>

          <el-input v-model="formData.width" size="medium" v-kyerestrict.positive maxlength=3 placeholder="宽">
            <template slot="append">(cm)</template>
          </el-input>

          <el-input v-model="formData.height" size="medium" v-kyerestrict.positive maxlength=3 placeholder="高">
            <template slot="append">(cm)</template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item prop="count" label="件数">
        <el-input v-model="formData.count" size="medium" v-kyerestrict.positiveNotZero maxlength=12 placeholder="件数">
          <template slot="append">(件)</template>
        </el-input>
      </el-form-item>
      <div class="btns-wrapper">
        <el-link type="primary" :underline="false" @click="clearData">清空</el-link>
        <i :class="iconClassName" :style="{color:'#8365f6'}" @click="handleAddOrDelRow" />
      </div>
    </div>
  </el-form>
</template>

<script>
export default {
  props: {
    isLastRow: { type: Boolean },
    rowIndex: { type: Number },
    formData: { type: Object, required: true },
    isHideNameAndWeight:{type:Boolean}
  },
  data () {
    const checkSize = (rule, value, callback) => {
      let { length, width, height } = this.formData
      let arr = [length, width, height]
      if (arr.some(a => Number(a) >= 700)) {
        return callback(new Error('您的货物单边超过7米，如需下单请联系您的商务'))
      }
      if (arr.some(a => a && arr.some(a => Number(a) < 1))) {
        return callback(new Error('请正确填写长、宽、高尺寸信息'))
      }
      if (arr.some(a => Number(a) > 0 && arr.some(a => Number(a) < 1))) {
        return callback(new Error('请完整填写长、宽、高尺寸信息'))
      }
      callback()
    }
    const checkCount = async (rule, value, callback) => {
      if (value == '0' && Number(value) <= 0) {
        return callback(new Error('值必须大于0'))
      }
      callback()
    }
    return {
      // formData: { name: '', weight: '', length: '', width: '', height: '', count: '' },
      formRules: {
        size: [{ validator: checkSize, trigger: 'blur' },],
        count: [{ validator: checkCount, trigger: 'blur' },],
        weight: [{ validator: checkCount, trigger: 'blur' },]
      }

    }
  },
  methods: {
    clearData () {
      Object.keys(this.formData).forEach(k => {
        this.formData[k] = ''
      })
      this.$refs.form.clearValidate()
    },
    handleAddOrDelRow () {
      this.$emit('changeOfRowCount', this.isLastRow ? '-1' : this.rowIndex)
    }
  },
  computed: {
    iconClassName () {
      return this.isLastRow ? 'el-icon-circle-plus-outline' : 'el-icon-remove-outline'
    }
  }
}
</script>

<style lang="scss" scoped>
  .goods-size-item-container {
    .flex-wrap {
      display: flex; 
      justify-content: space-between;
      & > div:not(:last-child) {
        margin-right: 20px;
      }
      &>div:not(.row-index){
        min-width: 0;
        min-height: 0;
        // flex:1 1 auto;
      }
      .row-index {
        @include middleCenter; 
        height: 24px;
        flex: 0 0 24px;
        box-sizing: border-box;
        background: #999999;
        border-radius: 50%;
        margin: 30px 16px 0 0;
        font-size: 12px;
        color: #ffffff;
      } 
    }

    /deep/ {
      .el-form-item {
        .el-form-item__label {
          line-height: 20px;
          padding-bottom: 0;
        }
        .el-form-item__content {
          line-height: 20px;
          margin-bottom: 26px;
        }
      }
    }
    .size-wrapper{
     /deep/ .el-input-group{
        display: flex;
        align-items: center;
        &>.el-input-group__append{
          position: relative;
          left: -28px;
        }
      }
    }
    .btns-wrapper {
      margin-top: -2px;
      flex: 0 0 57px;
      display: flex;
      align-items: center;
      a {
        padding-right: 15px;
      }
      i {
        cursor: pointer;
      }
    }
  }
</style>