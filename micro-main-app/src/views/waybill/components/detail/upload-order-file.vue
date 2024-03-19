<template>
  <div>
    <ky-dialog class='page-style1 update-order-file' :title="'上传'+title" :visible.sync='dialogVisible'
               :close-on-click-modal='false' width='700px' :modal-append-to-body='false'>
      <div class='dialog-body'>
        <upload-file :waybillNo='ydNo' upload-type='order' ref='upload' :canDownload='true'></upload-file>
      </div>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='dialogVisible = false'>取消</el-button>
        <el-button type='primary' @click='saveData' :loading='loading'>保存</el-button>
      </span>
    </ky-dialog>
  </div>
</template>

<script>
import UploadFile from '@/views/waybill/components/upload-pickup-file/upload-file'

/*
* 维护图片格式
* */
const imgExtendName = ['jpg', 'png']
export default {
  name: 'UploadOrderFile',
  components: { UploadFile },
  props: {
    freshTableData: { type: Function },
    canPreview: { type: Boolean, default: false },
    canDownload: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      ydNo: '',
      isOrder: false, //是否是订单
      dialogVisible: false,
      freshData: null,
      visible: false,
      imgUrl: ''
    }
  },
  computed: {
    title() {
      return '取货资料'
    }
  },
  mounted() {
    this.$watch('dialogVisible', (newVal) => {
      if (!newVal) {
        this.$refs.upload?.resetFileList()
      }
    })
  },
  methods: {
    async showDialog(ydNo, freshData) {
      this.dialogVisible = true
      this.ydNo = ydNo
      this.freshData = freshData
      this.$nextTick(() => {
        this.$refs.upload?.search()
      })
    },
    async saveData() {
      try {
        this.loading = true
        const fileList = this.$refs.upload.fileList
        // if (fileList.length < 1) {
        //   this.$message.warning(`您还没有上传${this.title}`)
        //   return
        // }
        const totalSize = fileList.reduce(
          (total, cur) => (total += cur.size),
          0
        )
        if (totalSize / 1024 / 1024 > 10) {
          this.$message.warning('上传文件不能超过10M')
          return
        }
        // const uploadFiles = fileList.filter(f => f.file)
        // if (uploadFiles.length < 1) {
        //   this.$message.warning(`您还没有上传${this.title}`)
        //   return
        // }
        
        await this.$refs.upload.batchUpload()
        
        this.$message.success(`${this.title}上传成功`)
        if (this.freshData) {
          this.freshData()
        }
        this.dialogVisible = false
      } catch {
        this.$message.success(`${this.title}上传失败`)
      } finally {
        this.loading = false
      }
    },
    fileExceed(files, fileList) {
      this.$message.warning('文件超出限制,最多支持10份文件,请重新选择')
    }
  }
}
</script>

<style lang='scss' scoped>
.update-order-file {
}
</style>
