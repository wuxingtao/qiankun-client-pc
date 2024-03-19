<template>
  <el-dialog :visible.sync="dialogVisible" v-bind="$attrs" custom-class="k-dialog preview-dialog"
             :close-on-click-modal="false" width="860px">
    <div class="preview-option mb_20">
      <div class="preview__btn cursor theme-color mr_26" @click="handlePlus"><i class="iconfont fs_12 icon-enlarge mr_4"></i>放大</div>
      <div class="preview__btn cursor theme-color" @click="handleReduce"><i class="iconfont fs_12 icon-reduce mr_4"></i>缩小</div>
    </div>
    <div class="preview__img">
      <img :style="imgStyle"
           :src="url"
           ref="imgRef">
    </div>

  </el-dialog>
</template>

<script>
export default {
  name: 'preview-dialog' ,
  props: {
    visible: {
      type: Boolean ,
      default: false
    } ,
    url: {
      type: String ,
      default: () => ''
    }
  } ,
  data() {
    return {
      dialogVisible: false ,
      zoom: '0.8'
    }
  } ,
  watch: {
    visible(val) {
      this.dialogVisible = val
    } ,
    dialogVisible(val) {
      if (!val) {
        this.$emit('close')
        this.zoom = '0.8'
      }
    } ,
  } ,
  computed: {
    imgStyle() {
      return {
        zoom: this.zoom
      }
    }
  } ,
  methods: {
    // 放大
    handlePlus() {
      if (this.zoom >= 1.5) {
        return
      }
      this.zoom = parseFloat(this.zoom) + 0.2
    } ,
    // 缩小
    handleReduce() {
      if (this.zoom <= 0.3) {
        return
      }
      this.zoom = parseFloat(this.zoom) - 0.2
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .preview-dialog {
  .preview__img {
    text-align: center;
    background: #f6f6f6;
    img{
      max-width:100%;
    }
  }
}

.preview__btn {
  display: inline-block;
}

</style>
