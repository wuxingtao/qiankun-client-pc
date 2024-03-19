<template>
  <ky-dialog title="托寄物" class="page-style1" :visible.sync="dialogVisible" @confirm="handleConfirm" append-to-body width="540px">
    <el-link type="primary" style="margin-bottom:22px" :underline="false" @click="visibleOfSku=true" v-if="authorityIds.includes('119')">从SKU库添加</el-link>

    <el-form ref='form' class="goods-size-item-container" :model="model" label-position="top" label-width="88px">
      <div class="flex-wrap" v-for="(formData,rowIndex) in model.list" :key="rowIndex">
        <div class="row-index">{{rowIndex+1}}</div>
        <el-form-item label="货物名称" :prop="'list.'+rowIndex+'.itemName'" :rules="formRules.itemName">
          <!-- <el-input v-model="formData.itemName" size="medium" maxlength=60 placeholder="货物名称" /> -->
          <el-autocomplete v-model="formData.itemName" size="small" :maxlength="30" clearable :fetch-suggestions="querySku " placeholder="请输入货物名称" @select="item=>{handleSku(item,rowIndex)}" @change="validateItem(formData)">
            <template slot-scope="{ item }">
              {{item.itemName}}
            </template>
          </el-autocomplete>

        </el-form-item>
        <el-form-item :prop="'list.'+rowIndex+'.nums'" label="件数" :rules="formRules.nums">
          <el-input v-model="formData.nums" size="medium" v-kyerestrict.positive maxlength=6 placeholder="件数" @change="validateItem(formData)">
            <template slot="append">({{formData.itemUnit || '件'}})</template>
          </el-input>
        </el-form-item>
        <div class="btns-wrapper">
          <el-link type="primary" :underline="false" @click="clearRowData(formData)">清空</el-link>
          <i class="el-icon-remove-outline" v-show="rowIndex>0||model.list.length>1" :style="{color:'#8365f6'}" @click="addOrRemoveRow(rowIndex)" />
          <i class="el-icon-circle-plus-outline" v-show="rowIndex===model.list.length-1&&rowIndex<maxRowsCount-1" :style="{color:'#8365f6'}" @click="addOrRemoveRow(-1)" />
        </div>
      </div>
    </el-form>
    <dialog-sku :visible.sync="visibleOfSku" :goodsNameList="model.list.map(m=>m.itemName)" @confirm="handleSelectedSku" />
  </ky-dialog>
</template>

<script>
import GoodsItem from './dialog-goods-item'
import DialogSku from './dialog-sku'
import { getPhone } from '@/utils/storage'
import { getItemInfoList } from '@/services/api/supplier'
import { mapGetters } from 'vuex'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    goods: {
      type: String,
    },
  },
  components: {
    GoodsItem,
    DialogSku,
  },
  data () {
    const checkItemName = async (rule, value, callback, source) => {
      const rowIndex = Object.keys(source)[0].split('.')[1]
      const item = this.model.list[rowIndex]
      if (!value && item.nums) {
        return callback(new Error('货物名称不能为空'))
      }
      callback()
    }
    const checkCount = async (rule, value, callback, source) => {
      if (value == '0' && Number(value) <= 0) {
        return callback(new Error('件数必须大于0'))
      }
      const rowIndex = Object.keys(source)[0].split('.')[1]
      const item = this.model.list[rowIndex]
      if (!value && item.itemName) {
        return callback(new Error('件数不能为空'))
      }
      callback()
    }
    return {
      row: null,//批量填写时的数据行
      maxRowsCount: 20,//最多可添加的行数
      dialogVisible: false,
      visibleOfSku: false,
      rawItem: { itemName: '', nums: '', itemUnit: '' },
      model: {
        list: [Object.assign({}, this.rawItem)]
      },
      formRules: {
        itemName: [
          // { required: true, message: "请输入托寄物", trigger: 'change' },
          { min: 2, message: '托寄物不能少于2个字', trigger: 'blur' },
          { max: 30, message: '托寄物填写不得超过30个字', trigger: 'blur' },
          { pattern: /^[\u4E00-\u9FA5A-Za-z0-9]{2,30}$/, message: '托寄物不可含有特殊字符', trigger: 'blur' },
          { pattern: /^(?=.*[\u4E00-\u9FA5A-Za-z])/, message: '托寄物名称不可为纯数字或纯符号', trigger: 'blur' },
          { validator: checkItemName, trigger: 'change' }

        ],
        nums: [
          { validator: checkCount, trigger: 'change' },
        ],
      }
    }
  },
  methods: {
    showDialog (row) {
      this.row = row
      this.dialogVisible = true
    },
    validateItem (item) {
      if (!item.itemName && !item.nums) {
        this.$refs.form.validate()
      }
    },
    async querySku (queryString, cb) {
      if (!this.authorityIds.includes('119')) {
        return cb([])
      }
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
    handleSku (item, index) {
      this.model.list[index].itemName = item.itemName
      this.model.list[index].itemUnit = item.itemUnit
    },
    async handleConfirm () {
      try {
        this.loading = true
        this.$refs.form.validate(valid => {
          if (valid) {
            const goodsInfoList = this.model.list.filter(f => f.itemName)
            if (goodsInfoList.length < 1) {
              return this.$message.warning('托寄物不能为空')
            }
            let goods = goodsInfoList.map(m => `${m.itemName}(${m.nums}${m.itemUnit})`).join('];[')
            goods = goodsInfoList.length > 0 ? `[${goods}]` : ''
            this.row && (this.row.goods.value = goods)
            this.$emit('update:goods', goods)
            this.$emit('on-comfirm', goods)
            this.dialogVisible = false
          } else {
            return this.$message.warning('请输入正确的货物信息')
          }
        })
      }catch(ex){
        console.log('ex :>> ', ex)
      } finally {
        this.loading = false
      }
    },
    clearRowData (row) {
      Object.keys(row).forEach(k => {
        row[k] = ''
      })
    },
    addOrRemoveRow (rowIndex) {
      if (rowIndex < 0) {
        this.model.list.push(Object.assign({}, this.rawItem))
      } else {
        this.model.list.splice(rowIndex, 1)
      }
    },
    handleSelectedSku (rows) {
      rows.forEach(r => {
        const currentRow = this.model.list.find(t => t.itemName === r.itemName)
        r.nums = currentRow ? currentRow.nums : 1
      })
      this.model.list = rows.map(r => Object.assign({ ...this.rawItem }, r))
      this.model.list.push(Object.assign({}, this.rawItem))
    },
  },
  watch: {
    visible (val) {
      if (!val) {
        return
      }
      this.dialogVisible = val
      const goods = this.goods || this.row?.goods?.value || ''
      let strArr = this.$trim(goods, ';').split(')];[').filter(f => f)
      strArr = strArr.map((m, index) => {
        if (index === 0) {
          if (strArr.length === 1) {
            return m.substr(1, m.length - 2)
          }
          return m.substr(1) + ')'
        } else if (index === strArr.length - 1) {
          return m.substr(0, m.length - 1)
        } else {
          return m + ')'
        }
      })
      const regResutArr = strArr.map(s => s.match(/(?<itemName>.*)\((?<nums>\d*)(?<itemUnit>.*)\)/)).filter(f => f)
      this.model.list = regResutArr.filter(f => f.groups).map(r => ({ itemName: r.groups.itemName, nums: r.groups.nums, itemUnit: r.groups.itemUnit })) || []
      if (this.model.list.length < 1) {
        this.model.list.push(Object.assign({}, this.rawItem))
      }
      this.$nextTick(() => {
        this.$refs.form.validate()
      })
    },
    dialogVisible (val) {
      this.$emit('update:visible', val)
    }
  },
  computed: {
    ...mapGetters(['authorityIds'])
  },
}
</script>

<style lang="scss" scoped>
  /deep/ .el-dialog__body {
    max-height: 586px;
    overflow-y: auto;
    @include scroll-bar;
    .el-form:last-of-type {
      .el-form-item__content {
        margin-bottom: 0;
      }
    }

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
        margin: 28px 16px 0 0;
        font-size: 12px;
        color: #ffffff;
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
          .el-autocomplete {
            line-height: 36px;
          }
        }
      }

      .btns-wrapper {
        // padding-top: 22px;
        // margin-top: -2px;
        flex: 0 0 80px;
        display: flex;
        align-items: center;
        a,
        .el-icon-remove-outline {
          padding-right: 12px;
        }

        i {
          cursor: pointer;
        }
      }
    }
  }
</style>