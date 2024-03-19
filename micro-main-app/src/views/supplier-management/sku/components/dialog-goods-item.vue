<template>
  <el-form ref='form' class="goods-size-item-container" :model="formData" :rules="formRules" label-position="top" label-width="88px">
    <div class="flex-wrap">
      <div class="row-index">{{rowIndex+1}}</div>
      <el-form-item label="货物名称" prop="itemName">
        <!-- <el-input v-model="formData.itemName" size="medium" maxlength=60 placeholder="货物名称"/> -->
        <el-autocomplete v-model="formData.itemName" size="medium" :maxlength="30" clearable :fetch-suggestions="querySku" placeholder="请输入货物名称" @select="handleSku">
          <template slot-scope="{ item }">
            {{item.itemName}}
          </template>
        </el-autocomplete>

      </el-form-item>
      <el-form-item prop="nums" label="件数">
        <el-input v-model="formData.nums" size="medium" v-kyerestrict.positive maxlength=6 placeholder="件数">
          <template slot="append">({{formData.itemUnit || '件'}})</template>
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
import { getPhone } from '@/utils/storage'
import { getItemInfoList } from '@/services/api/supplier'
import Regular from '@utils/regular'

export default {
  props: {
    isLastRow: { type: Boolean },
    rowIndex: { type: Number },
    formData: { type: Object, required: true },
  },
  data () {
    const checkItemName = async (rule, value, callback) => {
      if(!value&&this.formData.nums){
        return callback(new Error('货物名称不能为空'))
      } 
      if(!value&&!this.formData.itemName){
        this.$refs.form.clearValidate()
      }
      callback()
    }
    const checkCount = async (rule, value, callback) => {
      if(!value&&this.formData.itemName){
        return callback(new Error('件数不能为空'))
      }
      if (value == '0' && Number(value) <= 0) {
        return callback(new Error('件数必须大于0'))
      }
      if(!value&&!this.formData.itemName){
        this.$refs.form.clearValidate()
      }
      callback()
    }
    return {
      // formData: { itemName: '', nums: '',itemUnit:'' },
      formRules: {
        itemName: [
          // { required: true, message: "请输入托寄物", trigger: 'change' },
          { min: 2, message: '托寄物不能少于2个字', trigger: 'change' },
          { max: 30, message: '托寄物填写不得超过30个字', trigger: 'change' },
          { pattern: /^[\u4E00-\u9FA5A-Za-z0-9]{2,30}$/, message: '托寄物不可含有特殊字符', trigger: 'change' },
          { pattern: Regular.text4, message: '托寄物名称不可为纯数字或纯符号', trigger: 'change' },
          { validator: checkItemName, trigger: 'change' }
        ],
        nums: [{ validator: checkCount, trigger: 'blur' },],
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
    },
    async querySku (queryString, cb) {
      const params = {
        supplierPhone: getPhone(),
        supplierName: '',
        itemKey: queryString,
        mode: 0,
        page: 1,
        pageSize: 20,
      }
      const res = await getItemInfoList(params)
      let results = []
      if (res.code === 0) {
        results = res.data.rows
      }
      cb(results)
    },
    handleSku (item) {
      this.formData.itemName = item.itemName
      this.formData.itemUnit = item.itemUnit
      console.log('item :>> ', item)
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
      & > div:not(.row-index) {
        min-width: 0;
        min-height: 0;
        // flex:1 1 auto;
      }
      .row-index {
        @include middleCenter;
        height: 20px;
        flex: 0 0 20px;
        box-sizing: border-box;
        background: #999999;
        border-radius: 50%;
        margin: 23px 16px 0 0;
        font-size: 12px;
        color: #ffffff;
      }
    }

    /deep/ {
      .el-form-item {
        margin-bottom: 0;
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

    .btns-wrapper {
      padding-top: 22px;
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