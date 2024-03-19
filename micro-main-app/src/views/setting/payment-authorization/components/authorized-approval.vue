<template>
  <div class="auth">
    <div class="auth-approval">
      <el-radio-group size='small' v-model="authorizedStatus" style="margin-bottom: 10px;" @change="change">
      <el-radio-button label="waitApproval">待审批</el-radio-button>
      <el-radio-button label="alreadyApproval">已审批</el-radio-button>
    </el-radio-group>
     <el-button type='text'  @click='authorizedByOthers'>
      <svg-icon icon-class="authorized-by-others"/>
      <span class="mg-8" >给他人授权</span>
    </el-button>
    
    </div>
   
    <div>
      <authorized-table ref="waitApproval" :listType="10" v-show="authorizedStatus==='waitApproval'"></authorized-table>
      <authorized-table ref="alreadyApproval" :listType="40" v-show="authorizedStatus==='alreadyApproval'"></authorized-table>
    </div>
    <authorized-others-apply ref="authorizedRef" @success="change('alreadyApproval')"></authorized-others-apply>
  </div>
</template>

<script>
import AuthorizedTable from './authorized-table'
import AuthorizedOthersApply from './authorized-others-apply.vue'

export default {
  name: 'authorized-approval',
  components: {
    AuthorizedTable,
    AuthorizedOthersApply
  },
  data () {
    return {
      authorizedStatus: 'waitApproval'
    }
  },
  methods:{
    authorizedByOthers(){
      this.$refs.authorizedRef.showDrawer()
    },
    change(val){
      this.$refs[val].search()
    }
  }
}
</script>

<style lang="scss" scoped>
  .auth {
    height: 100%;
    .mg-8{
      margin-left: 8px;
    }
    .auth-approval{
      display: flex;
      justify-content: space-between;
    }
  }
</style>