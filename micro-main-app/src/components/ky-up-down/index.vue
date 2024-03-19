<template>
    <div>
        <el-button v-show="value" type="text" @click="handleselect(false)">
            收起<img src="@/assets/image/pack_up.png" style="padding-left:4px;" />
        </el-button>
        <el-button v-show="!value" type="text" @click="handleselect(true)">
            展开<img src="@/assets/image/open.png" style="padding-left:4px;" />
        </el-button>
    </div>
</template>
<script>
export default {
  name: "ky-up-down",
  props:{
    value:{
      type:Boolean,
      default: true
    }
  },
  methods:{
    handleselect(value){
      this.$emit('input',value)
      this.$emit('select',value)
    }
  }
}
</script>

<style scoped>

</style>
