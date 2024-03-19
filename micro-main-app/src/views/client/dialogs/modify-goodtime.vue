<template>
  <div class="clientdialog">
    <el-dialog title="修改货好时间" :visible.sync="dialogVisible" :close-on-click-modal="false" width="400px">
      <div class="dialog-body">
        <el-form ref='form' :inline="true" :model="formData" :rules="formRules" label-width="88px">
          <div v-if="goodsBatchTimes.length>0">
          <el-form-item label="货好时间" prop="hhDate">
            <el-date-picker v-model="formData.hhDate" type="date" placeholder="选择日期" class="hhDate">
            </el-date-picker>
          </el-form-item>
        <el-form-item>
            <el-select size="medium" v-model="formData.goodsTime" >
              <el-option
                  v-for="item in goodsBatchTimes"
                  :key="item"
                  :label="item"
                  :value="item">
             </el-option>
             </el-select>
        </el-form-item>
        </div>
        <div v-else>
          <el-form-item label="货好时间" prop="hhDateTime">
            <el-date-picker v-model="formData.hhDateTime" type="datetime" placeholder="选择日期时间" format="yyyy/MM/dd HH:mm">
            </el-date-picker>
          </el-form-item>
        </div>
        <div class="tip">温馨提示：修改货好时间可能会收取一定的空跑费</div>
        </el-form>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData" :loading="loading"> 保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { modifyGoodtime } from '@/services/api/waybillOld'
import { mapGetters } from 'vuex'

export default {
  name: 'ModifyGoodtime',
  data () {
    var validateHhDateTime = (rule, value, callback) => {
      if (dayjs().isAfter(dayjs(this.formData.hhDateTime), 'minute')) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      if (
        dayjs(this.formData.hhDateTime).isAfter(
          dayjs().add(1, 'month'),
          'month'
        )
      ) {
        return callback(
          new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
      }
      callback()
    }
    var validateHhDate = (rule, value, callback) => {
      let hhDateTime = dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime
      if (
        dayjs().isAfter(
          dayjs(hhDateTime),
          'minute'
        )
      ) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      if (
        dayjs(this.formData.hhDate).isAfter(
          dayjs().add(1, 'month'),
          'month'
        )
      ) {
        return callback(
          new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
      }
      callback()
    }
    return {
      loading: false,
      ydNo: '',
      callback: null,
      dialogVisible: false,
      // goodsBatchTimes:["11:11","12:08"],
      formData: {
        hhDateTime: '',
        hhDate: '',
        goodsTime: ''
      },
      formRules: {
        hhDateTime: [
          { required: true, message: '请选择货好时间', trigger: 'blur' },
          { validator: validateHhDateTime, trigger: 'blur' }
        ],
        hhDate: [
          { required: true, message: '请选择货好时间', trigger: 'blur' },
          { validator: validateHhDate, trigger: 'blur' }
        ]
      },
    }
  },
  created () {
    if (this.goodsBatchTimes.length > 0) {
      this.formData.goodsTime = this.goodsBatchTimes[0]
    }

  },
  methods: {
    showDialog (ydNo, hhDateTime, callback) {
      this.ydNo = ydNo
      this.callback = callback
      this.dialogVisible = true


      this.$nextTick(() => {
        this.$refs.form.resetFields()
        this.formData.hhDateTime = hhDateTime
        this.formData.hhDate = hhDateTime
      })
    },
    saveData () {
      try {
        this.loading = true
        if (this.goodsBatchTimes.length > 0) {
          this.formData.hhDateTime = dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime
        }
        this.$refs.form.validate(async valid => {
          if (valid) {
            let res = await modifyGoodtime(this.ydNo, this.formData.hhDateTime)
            this.loading = false
            if (res.code == 0) {
              this.$message.success('货好时间修改成功')
              this.dialogVisible = false
              this.callback && this.callback()
            }
          }else{
            this.loading=false
          }
        })
      } catch (ex) {
        this.loading = false
        console.log('ex :>> ', ex)
      }
    }
  },
  computed: {
    ...mapGetters([
      'goodsBatchTimes'
    ])
  }
}
</script>

<style lang="scss" scoped>
  .dialog-body {
    .tip {
      font-size: 12px;
      color: #999999;
      padding-left: 20px;
    }
    /deep/ .el-input--medium .el-input__inner {
      height: 40px;
      width: 100px;
    }
    .hhDate {
      width: 140px;
    }
    // /deep/ {
    //   .el-form-item {
    //     .el-form-item__label,
    //     .el-form-item__content {
    //       line-height: 20px;
    //       padding-bottom: 4px;
    //     }
    //   }
    // }
    /deep/.el-form-item__error {
          white-space: nowrap
        }
  }
</style>
