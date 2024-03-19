<template>
  <div class="print-remark">
    <div class="print-remark__title mb_16 f_w_500">备注字体</div>
    <div class="print-remark__content">
      <el-radio-group v-model.number="fontRadio">
        <el-radio :label="item.value" v-for="item in fontLists" :key="item.value">{{ item.desc }}</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
const fontLists = [
  { desc: '4号字体', value: 4 },
  { desc: '8号字体', value: 8 },
  { desc: '12号字体', value: 12 }
]
export default {
  name: 'print-remark',
  props: {
    fontSize: {
      type: [Number, String],
      default: () => ''
    }
  },
  data () {
    return {
      fontLists,
      fontRadio: ''
    }
  },
  watch: {
    fontSize: {
      handler (val) {
        if(val){
          this.fontRadio = Number(val)
        }
      }
    }
  },
  methods: {
    getFontSize () {
      return this.fontRadio
    }
  }
}
</script>

<style lang="scss" scoped>
.print-remark {
  margin: 20px 0;
}
</style>
