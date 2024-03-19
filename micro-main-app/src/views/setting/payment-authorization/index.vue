<template>
  <div class="pay-content">
    <div class='payment'>
      <el-tabs v-model='tabName'  class='payment-tabs'>
        <!--  -->
        <el-tab-pane label='授权审批' name='first' v-if="rolePermission!=='30'">
          <authorized-approval></authorized-approval>
        </el-tab-pane>
        <el-tab-pane label='我的申请' name='second'>
          <authorized-table :listType='50'></authorized-table>
        </el-tab-pane>
      </el-tabs>

      <el-button v-if="tabName === 'second'" class='button' type='text' @click='authorizedApply'>
        <i class='iconfont icon-authorized-to-others'></i>
        <span class='ml_8 text'>申请付款授权</span>
      </el-button>

    </div>
    <authorized-apply ref='applyRef'></authorized-apply>
  </div>
</template>

<script>
import AuthorizedApproval from './components/authorized-approval'
import paymentApi from '@/services/api/payment-authorization'
import AuthorizedTable from './components/authorized-table'
import AuthorizedApply from './components/authorized-apply'

export default {
  name: 'payment-authorization',
  components: {
    AuthorizedApproval,
    AuthorizedTable,
    AuthorizedApply
  },
  data () {
    return {
      rolePermission: '30',
      //tabName:this.rolePermission!='30'? 'first':'second'
      tabName: 'second'
    }
  },
  created () {
    this.getAuthorIdentityCode()
  },
  methods: {
    authorizedApply () {
      this.$refs.applyRef.showDrawer()
    },
    async getAuthorIdentityCode () {
      let res = await paymentApi.getAuthorIdentityCode()
      if (res.code === 0 && res.data) {
        this.rolePermission = res.data
        this.tabName = this.rolePermission !== '30' ? 'first' : 'second'
      }
    },
    handleClick(tab, event) {
      console.log(tab, event, 111)
    }
  }
}
</script>

<style lang='scss' scoped>
  .pay-content {
    padding: 0;
    .payment {
      padding: 0 20px 0 20px;
      display: flex;
      align-items: stretch;
      height: 100%;

      &-tabs {
        flex: 1;
      }

      .button {
        position: absolute;
        top: 27px;
        right: 28px;
        height: 16px;
        line-height: 16px;

        .icon {
          font-size: 12px;
        }

        .text {
          font-size: 12px;
        }
      }

      /deep/ .el-radio-button__orig-radio:checked + .el-radio-button__inner{
        background-color: white;
        color: #8365f6;
      }
    }
  }
</style>