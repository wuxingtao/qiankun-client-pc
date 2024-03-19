<template>
  <ky-dialog class="dialog-clipboard-native" title="粘贴板" :visible.sync="visible" :close-on-click-modal="false" width="500px" append-to-body>
    <div class="dialog-body">
      <p class="dialog-body-title">是否使用剪贴板中地址作为收件信息？</p>
      <p class="dialog-body-row">
        <label class="font-gray lable-singular">收&nbsp;件&nbsp;人：</label>
        <span v-if="form.contact" class="mg-l5">{{ form.contact }}</span>
        <span v-else class="mg-l5 font-red">未识别到姓名</span>
      </p>
      <p class="dialog-body-row">
        <label class="font-gray">收件号码：</label>
        <span v-if="form.contactPhone" class="mg-l5">{{ formatPhone }}</span>
        <span v-else class="mg-l5 font-red">未识别到收件号码</span>
      </p>
      <p class="dialog-body-row">
        <label class="font-gray">收件地址：</label>
        <span class="mg-l5">
          {{ form.address || '' }}
        </span>
      </p>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">暂不使用</el-button>
      <el-button type="primary" @click="saveData" :loading="loading">设为收方地址</el-button>
    </span>
  </ky-dialog>
</template>
<script>
import * as addressApi from '@api/address'
import useClipboard from '../hooks/useClipboard'

export default {
  props: {
    callbackFunc: { type: Function },
  },
  data () {
    return {
      loading: false,
      visible: false,
      form: {
        contact: '',
        contactPhone: '',
        telephone: '',
        address: '',
        province: '',
        city: '',
        district: '',
        detailAddress: ''
      },
      content: ''
    }
  },
  computed: {
    formatPhone () {
      return this.format(this.form.contactPhone)
    },
  },
  methods: {
    saveData () {
      this.visible = false
      const districtList = [this.form.province,this.form.city,this.form.district].filter(f=>f)
      this.callbackFunc && this.callbackFunc({...this.form,districtList})
    },
    async readClipboardContent(){
      // const content = '成都高新区九兴大道6号高发大厦B幢，洪静岩23，15234234234'
      const { getValidtClipboardContent } = useClipboard({root:this})
      const {existInCache,content} = await getValidtClipboardContent(true)
      if(existInCache || !content){
        return
      }
      this.parseAddress(content)
    },
    async parseAddress (content) {
      try {
        this.content = content
        const { code, data } = await addressApi.aiAddrAnalysis(content)
        // console.log(data, '解析结果')
        /** 省份和城市同时为空不展示弹窗 */
        if (code !== 0 || !data || (!data.province && !data.city)) {
          return
        }
        this.form = { ...this.form, ...data }
        this.visible = true
      } catch (err) {
        console.warn(err)
      }
    },
    format (value) {
      return value.replace(/\s/g, '').replace(/(\d{3})(\d{0,4})(\d{0,4})/, '$1 $2 $3')
    }
  }
}
</script>
<style lang="scss" scoped>
  .dialog-clipboard-native {
    .dialog-body {
      font-size: 14px;
      &-title {
        color: #000;
        margin: 5px 0 20px;
        font-weight: bold;
      }
      &-row {
        margin-top: 16px;
      }
    }
    .lable-singular {
      letter-spacing: 1px;
    }
    .mg-l5 {
      margin-left: 5px;
    }
    .font {
      &-gray {
        color: #666;
      }
      &-red {
        color: #ff706d;
      }
    }

    /deep/ {
      .el-dialog .el-dialog__body {
        margin-bottom: 20px;
      }
    }
  }
</style>
