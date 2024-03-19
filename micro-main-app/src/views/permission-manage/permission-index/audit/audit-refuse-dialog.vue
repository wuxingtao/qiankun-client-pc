<template>
  <ky-dialog class='audit-refuse-dialog__container' title='拒绝开通' :visible.sync='dialogVisible' width='360px' @confirm="confirm">
    <div class="tip">确定拒绝 <span>{{userInfoText}}</span> 的开通权限申请吗？</div>
    <el-input type="textarea" placeholder="请填写拒绝原因(选填)" v-model="refuseReason" maxlength="40" show-word-limit resize="none">
    </el-input>
  </ky-dialog>
</template>

<script>
import { reactive, toRefs, watch } from '@vue/composition-api'
import * as permissionApi from '@api/permission'

export default {
  setup (props,{root}) {
    const state = reactive({
      resolveResult:null,
      dialogVisible: false,
      id: '',
      userInfoText: '',
      refuseReason:''
    })
    watch(()=>state.dialogVisible,flag=>{
      if (!flag) {
        state.resolveResult && (state.resolveResult(false))
      }
    })
    const showDialog = (id,userInfoText) => {
      state.dialogVisible = true
      state.id = id
      state.userInfoText = userInfoText
      state.refuseReason = ''
      return new Promise(resolve => {
        state.resolveResult = resolve
      })
    }
    const confirm = async ()=>{
      const params = {
        id: state.id,
        status:'20',
        type: '20',
        approvalOpinion:state.refuseReason
      }
      const res = await permissionApi.uam_setAuditStatus(params)
      if(res.code === 0){
        state.resolveResult && (state.resolveResult(true))
        state.dialogVisible = false
        root.$message.success(res.msg)
      }else if(res.code === 500030){
        state.resolveResult && (state.resolveResult(true))
        state.dialogVisible = false
        root.$message(res.msg)
      }else{
        root.$message(res.msg)
      }
    }

    return {
      ...toRefs(state),
      showDialog,
      confirm
    }
  }
}
</script>

<style lang='scss' scoped>
.audit-refuse-dialog__container{
  .tip{
    margin-bottom: 12px;
    line-height: 20px;
    &>span{
      color: #ff8038;
      font-weight: bold;
    }
  }
}
</style>
