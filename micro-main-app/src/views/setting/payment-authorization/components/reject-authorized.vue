<template>
  <ky-dialog title="拒绝授权" width="500px" :visible.sync="visible"  :append-to-body="true">
    <div>
      <div class="tips" v-if="model.applicationType===20">
        <svg-icon icon-class='self-warning' /> 进行“拒绝”操作，会将{{number}}票运单的付款方式改为“寄方付”
      </div>
      <div class="reject-reason">
        <p class="reject-content">拒绝的原因</p>
        <el-input type='textarea' :rows='5' v-model='content' resize='none' clearable placeholder='请填写拒绝授权的原因（选填）' maxlength='100'></el-input>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button class="btn-i-know" size="medium" @click="visible=false">取消</el-button>
      <el-button class="btn-i-know" :loading="loading" size="medium" type="primary" @click="confirm">提交</el-button>
    </div>
  </ky-dialog>
</template>

<script>
import paymentApi from '@/services/api/payment-authorization'

export default {
  name: 'reject-authorized',
  data () {
    return {
      visible: false,
      content: '',
      model: {},
      loading: false
    }
  },
  methods: {
    showDialog (row) {
      this.model = row
      this.visible = true
    },
    async confirm () {
      try {
        this.loading=true
        let params = {
          authId: this.model.id,
          pass: false,
          refuseReason: this.content,
          fromType:'40'
        }
        let requests = {
          requests: [params]
        }
        let res = await paymentApi.examineAuth(requests)
        if (res.code === 0) {
          if (res.data && res.data.length > 0) {
            this.$message.warning(res.data[0].resultMsg)
          } else {
            this.$message.success(res.msg)
            this.visible = false
            this.content=''
            this.$emit('success')
          }
        }
      }finally{
        this.loading=false
      }
    }

  },
  computed: {
    number: function () {
      return this.model.waybillCount
    }
  }
}
</script>

<style lang="scss" scoped>
  .tips {
    width: 460px;
    height: 28px;
    background: #fff9e6;
    border-radius: 2px;
    color: #ff8038;
    line-height: 28px;
    padding-left: 8px;
    margin-bottom: 20px;
  }
  .reject {
    &-content {
      padding-bottom: 8px;
    }
    &-input {
      height: 120px;
      background: rgba(220, 218, 226, 0);
      border: 1px solid #e9e9e9;
      border-radius: 8px;
    }
  }
</style>

<style lang="scss">
  .reject-authorization {
    z-index: 2103;
  }
</style>