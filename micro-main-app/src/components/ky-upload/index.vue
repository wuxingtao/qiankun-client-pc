<template>
  <div class="ky-upload--container">
    <ul>
      <li v-for="(file,index) in fileList" :key="index">
        <!-- <img :src="file.url"> -->
        <el-image ref="elImage" :src="file.url" :preview-src-list="[file.url]">
        </el-image>
        <span class="item-actions">
          <span class="zoom-in" @click="handlePictureCardPreview(index)">
            <i class="el-icon-zoom-in"></i>
          </span>
          <span @click="handleRemove(file,index)">
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </li>
    </ul>
    <el-upload v-if="!limit || fileList.length<limit " class="img-uploader" action="#" list-type="picture-card" :auto-upload="false" :on-change="changeFile" :show-file-list="false" v-bind="$attrs" v-on="$listeners" :accept="accept">
      <i class="el-icon-plus img-uploader-icon"></i>
    </el-upload>
  </div>
</template>

<script>
import { readFileToBase64 } from '@utils/clientUtil'
export default {
  props: {
    accept: {
      type: String,
      default: ".jpg,.jpge,.png"
    },
    limit: { type: Number },
    //单个文件最大大小，单位为kb
    maxSize: {
      type: Number,
      default: 512,
    },
    //文件超出最大大小的提示语
    exceedMaxSizeMsg: {
      type: String,
    },
    //上传文件的方法，(file:{name,base64},cb:{({url})=>{}})=>{},file包含文件名及文件base64,回调函数必须含有url的参数
    httpRequest: {
      type: Function
    }
  },
  data () {
    return {
      fileList: []
    }
  },
  methods: {
    handlePictureCardPreview (index) {
      this.$refs.elImage[index].showViewer = true
    },
    handleRemove (file, index) {
      this.fileList.splice(index, 1)
    },
    async changeFile (file, fileList) {
      const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      if (this.accept && !this.accept.split(",").includes(type)) {
        this.$message.error(`只支持${this.accept}的文件格式`)
        return
      }
      const exceedMaxSizeMessage = this.exceedMaxSizeMsg || `文件大小不能超过${this.maxSize}kb`
      let hasSize = file.size && file.size > 0
      if (this.maxSize) {
        if (this.isClientMode && this.$native.existsNativeFunc('getFileSize')) {
          file.size = this.$native.getFileSize(file.name)
          hasSize = true
        }
        if (hasSize && this.maxSize < file.size / 1024) {
          this.$message.error(exceedMaxSizeMessage)
          return
        }
      }
      let base64 = await readFileToBase64(file, false)
      if (this.isClientMode) {
        base64 = `data:image/${type.substring(1)};base64,` + base64
      }
      if (this.maxSize && !hasSize) { //兼容旧版的壳
        const arr = base64.split(',')
        const strLength = (arr.length > 1 ? arr[1] : arr[0]).length
        const fileLength = parseInt(strLength - (strLength / 8) * 2)
        const size = (fileLength / 1024).toFixed(2) // 由字节转换为KB
        if (this.maxSize < size) {
          this.$message.error(exceedMaxSizeMessage)
          return
        }
      }
      if (this.httpRequest) {
        this.httpRequest({ name: file.name, base64 }, value => { this.fileList.push(value) })
        return
      }
      this.fileList.push({ name: file.name, url: base64 })
    },
  }
}
</script>

<style lang="scss" scoped>
  .ky-upload--container {
    .img-uploader {
      display: inline-block;
      vertical-align: top;
    }
    ul {
      display: inline;
      vertical-align: top;
      li {
        position: relative;
        width: 148px;
        height: 148px;
        margin: 0 8px 8px 0;
        display: inline-block;
        .el-image {
          width: 100%;
          height: 100%;
        }
        .item-actions {
          // pointer-events: none;
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          cursor: default;
          text-align: center;
          color: #fff;
          opacity: 0;
          font-size: 20px;
          background-color: rgba(0, 0, 0, 0.5);
          transition: opacity 0.3s;
          &::after {
            display: inline-block;
            content: "";
            height: 100%;
            vertical-align: middle;
          }
          &:hover {
            opacity: 1;
          }
          // .zoom-in{
          //    pointer-events: none;
          // }
          & > span {
            cursor: pointer;
          }
          & > span + span {
            margin-left: 15px;
          }
        }
      }
    }
  }
</style>