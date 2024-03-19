<template>
  <div>
    <el-input size="medium" :placeholder="placeholder" v-model="encryptValue" v-bind="$attrs" v-on="$listeners" @focus="viewValue">
      <i @click="viewValue" style="cursor: pointer;" slot="suffix" class="el-input__icon el-icon-view"></i>
    </el-input>
    <encrypt-field-view :visible.sync="dialogVisible" :content="encryptField.content" :menuText="encryptField.menuText" ref="encryptFieldView" @on-confirm="encryptField.visible = false"/>
  </div>
</template>

<script>
import EncryptFieldView from './encrypt-field-view.vue'

export default {
  components: { EncryptFieldView },
  props: {
    placeholder: {
      type: String,
      default: '请输入内容'
    },
    encryptField: {
      type: Object,
      validator: function (field) {
        if (!field.hasOwnProperty('value') || !field.hasOwnProperty('visible') ) {
          console.log('encryptField必须都包含value和visible属性')
          return false
        }
        return true
      },
      required:true
    },
  },
  data () {
    return {
      dialogVisible:false,
      encryptValue: ''
    }
  },
  methods: {
    viewValue () {
      this.dialogVisible = true
    }
  },
  watch:{
    'encryptField.value':{
      handler(val){
        if(this.encryptField.replace){
          this.encryptValue= this.encryptField.replace(val)
          return
        }
        this.encryptValue=val
      },
      immediate:true
    }
  }
}
</script>

<style>
</style>