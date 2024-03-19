<template>
  <el-drawer v-bind="$attrs" class="ky-drawer" :visible.sync="dialogVisible" @before-close="handleClose">
    <slot></slot>
  </el-drawer>
</template>

<script>
export default {
  name: 'ky-drawer',
  props: {
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  watch: {
    visible (val) {
      this.dialogVisible = val
    },
    dialogVisible (val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    handleClose (done) {
      this.$emit('update:visible', false)
      done()
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ {
  .el-drawer {
    min-width: 460px;
  }

  .el-drawer__header {
    padding: 18px;
    font-size: 14px;
    border-bottom: 1px solid #f1f1f5;
    background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0.00));
    box-shadow: 0px 1px 0px 0px #ffffff inset;

    & > :first-child {
      padding-left: 34px;
      font-weight: bold;
      color: #03050d;
    }

    .el-drawer__close-btn {
      position: absolute;
      left: 10px;

      .el-icon {
        color: #999999;
      }
    }
  }
}

</style>
