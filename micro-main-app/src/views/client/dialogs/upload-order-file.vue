<template>
  <div class="clientdialog">
    <el-dialog :title="'上传'+title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="440px">
      <div class="dialog-body">
        <div v-show="fileList.length>0" class="file-wrap">
          <div v-for="(item,index) in fileList" :key="index" class="file-item">
            <svg-icon icon-class="link" /> <span style="flex:1;margin-left:9px">{{item.name}}</span>
            <svg-icon icon-class="delete" style="cursor:pointer" @click="handleRemoveFile(item)" />
          </div>
        </div>

        <el-upload multiple drag action="" v-if="fileList.length<10" :file-list="fileList" :class="{hideUpload:fileList.length>0}" :auto-upload="false" :show-file-list="false" accept=".jpg,.png,.doc,.docx,.pdf,.txt,.xls,.xlsx" :on-change="handleFileChange">
          <div v-if="fileList.length<1">
            <svg-icon icon-class="upload" class-name="icon-upload" />
            <div class="el-upload__text">
              <div class="text-line1">点击{{isClientMode?'':'或将文件拖拽到'}}这里上传</div>
              <div class="text-line2">支持扩展名：.jpg .png .doc .docx .pdf .txt .xls .xlsx</div>
            </div>
          </div>
          <div v-else class="btn-add">
            <svg-icon icon-class="add" /><span class="text">添加</span>
          </div>
        </el-upload>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData" :loading="loading"> 保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  uploadOrderFiles,
  queryOrderFile,
  deleteOrderFile
} from '@/services/api/waybillOld'
import { readFileToBase64 } from '@utils/clientUtil'
export default {
  name: 'UploadOrderFile',
  props: {
    freshTableData: { type: Function }
  },
  data() {
    return {
      loading: false,
      isAppointmentFile:false,//是否是上传预约单
      ydNo: '',
      isOrder: false, //是否是订单
      dialogVisible: false,
      fileList: [],
      removedIds: []
    }
  },
  computed:{
    title(){
      return this.isAppointmentFile?'预约单':'委托书'
    }
  },
  methods: {
    async showDialog(isAppointmentFile,ydNo, isOrder) {
      this.isAppointmentFile=isAppointmentFile
      this.ydNo = ydNo
      this.isOrder = isOrder
      this.fileList = []
      this.removedIds=[]
          
      let res = await queryOrderFile(isAppointmentFile, ydNo, isOrder)
      if (res.code == 0) {
        this.dialogVisible = true
        this.fileList = res.data.map(m => ({ name: m.fileName, id: m.id }))
      }
    },
    async  handleFileChange(file, fileList) {
      if (this.fileList.some(f => f.name == file.name)) {
        this.$message.warning('请勿上传相同文件名的文件')
        return
      }
      const base64=  await readFileToBase64(file, true) 
      this.fileList.push({name:file.name,size:file.size,base64})
    },
    handleRemoveFile(file) {
      this.$confirm('确定要删除该委托书？', '委托书').then(() => {
        if (file.id) {
          this.removedIds.push(file.id)
        }
        const index = this.fileList.indexOf(file)
        this.fileList.splice(index, 1)
      })
    },
    async saveData() {
      try {
        this.loading = true
        if (this.fileList.length < 1) {
          this.$message.warning(`您还没有上传${this.title}`)
          return
        }
        const totalSize = this.fileList.reduce(
          (total, cur) => (total += cur.size),
          0
        )
        if (totalSize / 1024 / 1024 > 3) {
          this.$message.warning('上传文件不能超过3M')
          return
        } 
        const uploadFiles = this.fileList.filter(f => f.base64)
          .map(f => ({base64:f.base64,fileName:f.name})) 
        const deleteResult=await this.deleteFiles(uploadFiles.length<1) 
        if(this.removedIds.length>0&&deleteResult&&uploadFiles.length<1){ 
          this.dialogVisible = false
          return
        }
        if(!deleteResult){
          return
        } 
        if(uploadFiles.length<1){
          this.$message.warning(`您还没有上传${this.title}`)
          return
        }
        const res =await uploadOrderFiles(this.isAppointmentFile, uploadFiles, this.ydNo, this.isOrder)
        if (res.code === 0) {
          this.$message.success(`${this.title}上传成功`)
          this.dialogVisible = false
        }
      }  finally {
        this.loading = false
      }
    },
    async  deleteFiles(noneUploadFile) {
      if (this.removedIds.length < 1) {
        return true
      }
      await this.$confirm(
        `您移除了部分已上传的${this.title}，是否确认删除这些${this.title}？`,
        `删除${this.title}`,
        {
          type: 'warning'
        }
      ) 
      let promiseList = this.removedIds.map(m => deleteOrderFile(this.isAppointmentFile, m))
      let resultes =await Promise.all(promiseList)
      if (resultes.every(r => r.code == 0)) {
        noneUploadFile&&this.$message.success(`${this.title}删除成功`)
        return true
      }
      this.$message.error(`删除${this.title}失败`) 
      return false
          
    }
  }
}
</script>

<style lang="scss" scoped>
  .dialog-body {
    /deep/ {
      .hideUpload .el-upload-dragger {
        height: 34px;
        .btn-add {
          line-height: 34px;
          .text {
            margin-left: 8px;
          }
        }
      }
      .el-upload-dragger {
        width: 400px;
        height: 195px;
        background-color: rgba(251, 252, 255, 1);
        &:hover {
          background-color: rgb(242, 243, 255);
        }
      }
    }
    .file-wrap {
      margin-bottom: 16px;
      .file-item {
        display: flex;
        margin: 16px 0;
      }
    }
    .icon-upload {
      margin: 40px 0 19px;
      width: 71px;
      height: 58px;
    }
    .el-upload__text {
      color: rgba(0, 0, 0, 0.75);
      .text-line2 {
        margin-top: 10px;
        color: #999999;
      }
    }
  }
</style>
