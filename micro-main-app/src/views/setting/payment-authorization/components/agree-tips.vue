<template>
  <ky-dialog title="温馨提示" :visible.sync="visible" :append-to-body="true" width="500px">
    <div class="content">
      <p>{{tips}}</p>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button class="btn-i-know" size="medium" @click="visible=false">取消</el-button>
      <el-button class="btn-i-know" size="medium" type="primary" @click="confirm">同意</el-button>
    </div>
  </ky-dialog>
</template>
<script>
export default {
  name: 'agree-tips',
  data () {
    return {
      tips: '',
      visible: false,

    }
  },
  methods: {
    showDialog (tips) {
      this.tips = tips
      this.visible = true
    },
    confirm () {
      this.$emit('success')
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .content {
    max-height: 500px;
    line-height: 18px;
  }
</style>