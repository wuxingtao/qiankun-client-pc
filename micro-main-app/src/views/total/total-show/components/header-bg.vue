<template>
  <div class='header-bg'>
    <div class='header-bg__title'>
      <svg-icon class='back' icon-class='back' @click='back'></svg-icon>
      <i class='iconfont icon-logo logo'></i>
      <span class='line'></span>
      <span class='title'>{{ company }}</span>
    </div>
    <div class='header-bg__role'>
      <span class='label'>切换角色</span>
      <el-select v-model='formData.customerFlag' size='medium'>
        <el-option v-for='(item, index) in filCustomerLookUp' :key='`0-${index}`' :label='item.label'
                   :value='item.value'>
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import { getLoginCompanyName } from '@/utils/clientUtil'
import { customerLookUp } from '../comfig'
import { getAuth } from '@/utils/total'

export default {
  name: 'header-bg',
  props: {
    formData: {
      type: Object,
      default: () => ({})
    },
    path: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      company: ''
    }
  },
  computed: {
    filCustomerLookUp() {
      let ary = customerLookUp.filter((item) => {
        if (item.auth) {
          if (getAuth(this, item.auth)) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      })
      return ary
    }
  },
  methods: {
    back() {
      this.$router.push({ path: this.path || '/admin/waybill' })
      this.$emit('close')
    }
  },
  mounted() {
    this.company = getLoginCompanyName()
    if (this.company) {
      this.company += ' - 物流数据看板'
    }
  }
}
</script>

<style scoped lang='scss'>
.header-bg {
  height: 5.4rem;
  line-height: 5.4rem;
  background: linear-gradient(to right, #7c6ff9, #5c4ee8);
  display: flex;
  justify-content: space-between;
  
  &__title {
    display: flex;
    align-items: center;
    
    .back {
      width: 2.4rem;
      height: 2.2rem;
      cursor: pointer;
      margin: 0 1.2rem 0 3.2rem;
    }
    
    .logo {
      width: 8rem;
      //height: 2rem;
      font-size: 2rem;
      color: #fff;
      cursor: pointer;
    }
    
    .line {
      margin: 0 1rem;
      width: 1px;
      height: 1.6rem;
      background: rgba(255, 255, 255, 0.4);
    }
    
    .title {
      font-size: 1.6rem;
      font-weight: 500;
      color: #FFFFFF;
    }
  }
  
  &__role {
    width: 61rem;
    background: url('../../../../assets/image/total/plane.png') no-repeat;
    background-size: 100% 100%;
    text-align: right;
    
    .label {
      font-size: 1.6rem;
      color: #FFFFFF;
    }
    
    .el-select {
      margin: 0 1.8rem 0 1rem;
    }
    
    ::v-deep .el-input__inner {
      border-radius: 1.8rem;
      color: #0c092b;
      font-size: 1.6rem;
      width: 16rem;
      height: 3.2rem;
      line-height: 3.2rem;
    }
  }
}
</style>
