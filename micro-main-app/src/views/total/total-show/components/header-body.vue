<template>
<div class="header-body">
   <header-list :asideWidth="asideWidth" :data="asideList" :formData="formData"></header-list>
   <header-form :formData="formData" @search="search"></header-form>
</div>
</template>

<script>
import HeaderList from './header-list'
import HeaderForm from './header-form'
export default {
  name: "header-body",
  props:{
    asideWidth: {
      type: String,
      default: '522px'
    },
    asideList:{
      type:Object,
      default:()=>({})
    },
    formData:{
      type:Object,
      default:()=>({})
    }
  },
  components:{
    HeaderList,
    HeaderForm
  },
  methods:{
    search(){
      this.$emit('search')
    }
  }
}
</script>

<style scoped lang="scss">
  .header-body{
      width: 100%;
     background: #fff;
  }
</style>
