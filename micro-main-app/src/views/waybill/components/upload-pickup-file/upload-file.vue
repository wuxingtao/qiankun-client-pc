<template>
  <div class='upload-file--pickup'>
  <div class='upload-file--pickup__title' v-if="uploadType !== 'order'">
    <div class='title'>上传资料</div>
    <div class='desc'>({{ desc }})</div>
  </div>
  <div class='upload-file--pickup__upload' :class="{ 'show-file-list': showFileList }">
  <transition-group
    class='upload-file--pickup__box'
    name='progressTran'
    tag='div'
    @after-leave='afterLeave'
    @before-enter='beforeEnter'
  >
    <el-upload
      multiple
      drag
      action=''
      class='upload-box'
      v-if='fileList.length < uploadOptions.maxCount'
      key='upload'
      :file-list='fileList'
      :auto-upload='false'
      :show-file-list='false'
      :accept="`.${uploadOptions.fileType.join(',.')}`"
      :on-change='handleFileChange'
    >
      <template v-if='!showFileList'>
        <svg-icon icon-class='upload' class-name='icon-upload' />
        <div class='el-upload__text'>
          <div class='text-line1'>点击{{ isClientMode ? '' : '或将文件拖拽到' }}这里上传</div>
          <div class='text-line2'>支持扩展名：.{{ uploadOptions.fileType.join(' .') }}</div>
        </div>
      </template>
      <div class='add-btn' v-else>
        <img src='@/assets/image/waybill/add-icon.png' alt='' />
      </div>
    </el-upload>
    <div v-for='(v, i) in fileList' :key='v.id' class='file-item' :class='className(v)'>
      <div class='file-item-icon'>
        <img
          class='file-item-del'
          src='@/assets/image/waybill/close.png'
          alt=''
          @click='handleRemoveFile(v, i)'
        />
        <el-image
          class='file-item-img'
          :src='getIcon(v)'
          fit='contain'
          :z-index='9000'
          :class="{ 'is-icon': v.type !== 'img' }"
          v-bind="{
                        ...(v.type === 'img' && {
                          previewSrcList: srcList,
                        }),
                      }"
          @click='handleFilePreview(v)'
        />
        <div class='mask' v-if='+v.status === STATUS.FAIL || v.uploading || v.deleting'>
          <!-- 删除中 -->
          <i v-if='v.deleting' class='el-icon-loading'></i>
          <!-- 上传中 -->
          <el-progress
            v-else-if='v.uploading'
            :percentage='v.complete'
            :stroke-width='2'
            :show-text='false'
            :status="+v.status === STATUS.FAIL ? 'exception' : 'success'"
          ></el-progress>
          <!-- 上传失败 -->
          <div v-else-if='+v.status === STATUS.FAIL' class='upload-fail'>
            <div class='upload-fail-text'>
              <img src='@/assets/image/waybill/close2.png' alt='' />上传失败
            </div>
            <div class='upload-fail-img' @click='upload(v)'>
              <img src='@/assets/image/waybill/upload-fail.png' alt='' />
            </div>
          </div>
        </div>
      </div>
      <div class='file-item-text' v-if='v.formatName'>
        <span class='file-name'>{{ v.formatName[0] }}</span>
        <span>{{ v.formatName[1] }}</span>
      </div>
    </div>
  </transition-group>
  </div>
  </div>
</template>

<script>
import waybillApi from '@/services/api/waybill'
import { options, ICONS, STATUS } from './constant'
import { toUnitSize, getFileSuffix, isOversize, formatFileName, dataURLtoFile } from './utils'
import { Message } from 'element-ui'
import native from '@utils/native'

export default {
  name: 'UploadFile',
  props: {
    waybillNo: String,
    uploadType: String,
    canDownload: Boolean
  },
  data() {
    return {
      fileList: [],
      index: 0,
      STATUS: STATUS,
      listLen: 0,
      showFileList: false,
      uploadOptions: options
    }
  },
  computed: {
    srcList() {
      return this.fileList.filter(v => v.type === 'img').map(v => v.url)
    },
    count() {
      return this.fileList.filter(v => +v.status === STATUS.SUCCESS).length || 0
    },
    desc() {
      if (this.fileList.length <= 0) {
        return `未添加文件，最多可上传${options.maxCount}份`
      }
      return `已添加${this.fileList.length}份文件，最多可上传${options.maxCount}份`
    }
  },
  methods: {
    // 清除
    clear() {
      this.index = 0
      this.listLen = 0
      this.fileList = []
    },
    // 查询
    async search() {
      if (!this.waybillNo) return
      try {
        let fn = this.uploadType === 'order' ? waybillApi.queryOrderFile(this.waybillNo) : waybillApi.queryPickupFile(this.waybillNo)
        let res = await fn
        if (res.code != 0) return
        this.fileList = (res?.data?.rows || []).map(v => ({
          ...v,
          suffix: getFileSuffix(v.originalName),
          formatName: formatFileName(v.originalName),
          status: STATUS.SUCCESS,
          size: v.size / 1024,
          // 兼容前期上传取货资料未带有文件类型问题
          type: ['jpg', 'png', 'jpeg'].includes(getFileSuffix(v.originalName)?.toLowerCase()) ? 'img' : 'file'
        }))
        this.showFileList = this.fileList.length > 0
        this.index = this.fileList.length
        this.listLen = this.fileList.length
        
        // eslint-disable-next-line no-empty
      } catch (error) {
      }
    },
    calculationFileSize(val) {
      let eqTagIndex = val.indexOf('=')
      val = eqTagIndex != -1 ? val.substring(0, eqTagIndex) : val
      let strLen = val.length
      let fileSize = strLen - (strLen / 8) * 2
      return fileSize
    },
    // 点击下载兼容
    async handleFilePreview(file) {
      console.log(file, 444)
      const { url, type, name } = file
      if (!this.canDownload || type === 'img' || !url) return
      if (this.isClientMode) {
        const res = await native.downLoadFile(url, type, name)
        const result = res && JSON.parse(res)
        if (result) {
          if (result.code == 0 && result.msg) {
            Message.success(result.msg)
          } else if (result.code != 0 && result.msg) {
            Message.error(result.msg)
          }
        }
      } else {
        window.location.href = url
      }
    },
    // 选中之后
    async handleFileChange(v) {
      this.index++
      if (this.index > options.maxCount) {
        this.index = options.maxCount
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$message.error(`最多可上传${options.maxCount}份文件`)
        }, 200)
        return
      }
      if (this.isClientMode) {
        const file = await this.$native.fileToBase64(v?.raw?.path, false)
        v.size = this.calculationFileSize(file)
        const name = v.raw?.path || v.name
        v.name = name?.substring(name?.lastIndexOf('\\') + 1, name?.length)
        v.raw = dataURLtoFile(`data:application/${getFileSuffix(v.name)};base64,${file}`, v.name)
      }
      const fileType = [].concat(options.fileType || [], ['jpeg'])
      const suffix = getFileSuffix(v.name)
      if (!fileType.includes(suffix?.toLowerCase())) {
        return this.$message.error(`文件仅支持${options.fileType.join('，')}格式`)
      }
      if (isOversize(v, this.maxSize)) {
        return this.$message.error(`文件大小限制为${toUnitSize(this.maxSize)}`)
      }
      this.fileList.push({
        ...v,
        id: v.uid,
        suffix,
        formatName: formatFileName(v.name),
        status: STATUS.WAIT,
        url: URL.createObjectURL(v.raw),
        type: ['jpg', 'png', 'jpeg'].includes(suffix?.toLowerCase()) ? 'img' : 'file',
        file: v.raw
      })
      this.$emit('updateFileList', this.fileList)
    },
    // 动画开始之前
    beforeEnter() {
      if (this.fileList.length > 0) {
        this.showFileList = true
      }
    },
    // 动画结束之后
    afterLeave() {
      if (this.fileList.length < 1) {
        this.showFileList = false
      }
    },
    // 获取图标
    getIcon(v) {
      if (v.type === 'img') {
        return v.url
      }
      return ICONS[v.suffix] || ICONS.default
    },
    // 不同状态的样式
    className(v) {
      if (v.deleting) return 'is-deleting'
      if (v.uploading) return 'is-uploading'
      switch (+v.status) {
        case STATUS.FAIL:
          return 'is-fail'
        case STATUS.WAIT:
          return 'is-wait'
        case STATUS.DELETING:
        default:
          return 'is-success'
      }
    },
    async upload(v) {
      // 如果没有运单号或不是等待中或者已经失败的文件，直接忽略
      if (!this.waybillNo || ![STATUS.WAIT, STATUS.FAIL].includes(+v.status)) return
      this.$set(v, 'uploading', true)
      const params = {
        bizCode: this.uploadType === 'order' ? 'pickup_proxy' : options.bizCode,
        bizId: this.waybillNo,
        type: v.type,
        file: v.file
      }
      let res = null
      try {
        res = await waybillApi.uploadFileToFileCenter(params, complete => {
          this.$set(v, 'complete', complete)
        })
        if (res.data?.url) this.$set(v, 'url', res.data?.url)
        this.$set(v, 'status', STATUS.SUCCESS)
      } catch (error) {
        this.$set(v, 'status', STATUS.FAIL)
        error.error = true
        res = error
      }
      this.$set(v, 'uploading', false)
      return res
    },
    // 上传
    batchUpload() {
      const promiseAll = []
      if (this.waybillNo) {
        this.fileList.forEach(v => {
          // 如果不是等待中或者已经失败的文件，直接忽略
          if (![STATUS.WAIT, STATUS.FAIL].includes(+v.status)) return
          promiseAll.push(this.upload(v))
        })
      }
      return Promise.all(promiseAll)
    },
    resetFileList() {
      this.fileList = []
    },
    // 点击删除
    async handleRemoveFile(v, i) {
      try {
        await this.$confirm('确定要删除该文件？', {
          customClass: 'upload-message',
          showCancelButton: true,
          showClose: false,
          confirmButtonText: '是',
          cancelButtonText: '否'
        })
        this.$set(v, 'deleting', true)
        // 如果是等待中或者已经失败的文件，直接删除
        if ([STATUS.WAIT, STATUS.FAIL].includes(+v.status)) {
          this.fileList.splice(i, 1)
          this.$message.success('删除成功')
          this.index--
          /**
           * 上传文件添加后直接上传，而移除的时候不会走到下饭的逻辑
           * 因此在这里先emit一次事件
           * */
          this.$emit('updateFileList', this.fileList)
          return
        }
        try {
          await waybillApi.deleteOrderFile([v.id])
          this.fileList.splice(i, 1)
          this.$message.success('删除成功')
          this.index--
          this.$emit('updateFileList', this.fileList)
        } catch (error) {
          this.$message.error('删除失败')
        }
        this.$set(v, 'deleting', false)
        // eslint-disable-next-line no-empty
      } catch (error) {
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.upload-file--pickup {
  &__title {
    height: 28px;
    background: linear-gradient(270deg, #fafafa, #f6f6f6);
    border-radius: 2px;
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 14px;
    
    .title {
      font-weight: 600;
      color: #333333;
    }
    
    .desc {
      font-weight: 400;
      color: #999999;
      margin-left: 10px;
    }
    
    &::before {
      content: '';
      width: 4px;
      height: 16px;
      background: #666666;
      border-radius: 2px;
      margin-right: 10px;
    }
  }
  
  &__upload {
    margin-top: 12px;
    
    .upload-file--pickup__box {
      overflow: hidden;
      margin-right: -40px;
    }
    
    .icon-upload {
      margin-top: 40px;
      width: 71px;
      height: 58px;
      transition: none !important;
    }
    
    .upload-box {
      margin-right: 40px;
    }
    
    .el-upload__text {
      margin-top: 20px;
      
      .text-line1 {
        font-weight: 400;
        color: $--color-text-primary;
        line-height: 14px;
      }
      
      .text-line2 {
        margin-top: 12px;
        font-weight: 400;
        color: #999999;
      }
    }
    
    /deep/ {
      .el-upload {
        display: block;
      }
      
      .el-upload-dragger {
        width: 100%;
        height: 190px;
        background-color: #f8f8f8;
        border-color: #e3e3e3;
        
        &:hover {
          background-color: #f0f0f0;
          border-color: #8365f6;
        }
      }
    }
    
    &.show-file-list {
      padding: 8px 24px;
      border: 1px dashed #e3e3e3;
      
      .upload-box {
        width: 120px;
        height: 120px;
        padding: 10px 0 16px;
        margin-right: 40px;
        box-sizing: border-box;
        float: left;
        margin-bottom: 16px;
        transition: none !important;
        transform: none !important;
      }
      
      /deep/ .el-upload {
        .el-upload-dragger {
          width: 98px;
          height: 70px;
          border-radius: 2px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f8fa;
          border-color: #dcdae2;
          
          &:hover {
            background-color: #f6f7f8;
            border-color: #8365f6;
          }
          
          img {
            width: 22px;
            height: 22px;
          }
        }
      }
      
      .file-item {
        float: left;
        width: 120px;
        height: 120px;
        padding: 10px 0 16px;
        box-sizing: border-box;
        margin-right: 40px;
        margin-bottom: 16px;
        
        .file-item-icon {
          width: 98px;
          height: 70px;
          background: #f6f7f8;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-sizing: border-box;
          position: relative;
          border: 1px solid #f6f7f8;
          cursor: pointer;
          position: relative;
          
          .file-item-del {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            position: absolute;
            top: 0;
            right: 0;
            cursor: pointer;
            margin-top: -7px;
            margin-right: -7px;
            z-index: 100;
          }
          
          .file-item-img {
            width: 100%;
            height: 100%;
            
            &.is-icon {
              width: 42px;
              height: 42px;
            }
          }
          
          &:hover {
            border: 1px solid #8365f6;
          }
          
          .mask {
            position: absolute;
            z-index: 10;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid #f5f5f5;
            border-radius: 2px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            left: -1px;
            top: -1px;
            right: -1px;
            bottom: -1px;
            color: #fff;
            font-size: 16px;
            
            .upload-fail {
              text-align: center;
              
              .upload-fail-text {
                font-size: 12px;
                font-weight: 400;
                color: #ffffff;
                line-height: 12px;
                display: flex;
                align-items: center;
                
                img {
                  margin-right: 4px;
                  width: 12px;
                  height: 12px;
                }
              }
              
              .upload-fail-img {
                width: 22px;
                height: 22px;
                margin: 6px auto 0;
                
                img {
                  max-width: 100%;
                  max-height: 100%;
                }
              }
            }
            
            .el-progress {
              width: 76px;
              
              /deep/ {
                .el-progress-bar__outer {
                  background-color: rgba($color: #d8d8d8, $alpha: 0.45);
                }
                
                .el-progress-bar__inner {
                  background-color: #ffffff;
                }
              }
            }
          }
        }
        
        .file-item-text {
          line-height: 1.4;
          font-weight: 400;
          color: #333333;
          margin-top: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .file-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: right;
          }
          
          span {
            flex: 1 1 auto;
          }
        }
        
        &.is-success {
          .file-item-icon {
            .file-item-del {
              display: none;
            }
            
            &:hover {
              .file-item-del {
                display: block;
              }
            }
          }
        }
        
        &.is-uploading,
        &.is-deleting {
          .file-item-icon {
            .file-item-del {
              display: none;
            }
          }
        }
      }
    }
  }
}

.progressTran-enter,
.progressTran-leave-to {
  transform: translate3d(0, -30px, 0);
  opacity: 0;
}

.progressTran-enter-active,
.progressTran-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}
</style>

<style lang='scss'>
.el-message-box.upload-message {
  .el-message-box__header {
    min-height: 38px;
    box-sizing: border-box;
    background: url('~@/assets/image/global/dialog-header-bg.png') no-repeat;
    background-position-x: right;
  }
  
  .el-message-box__content {
    padding: 0 20px 20px;
    min-height: 80px;
  }
  
  .el-message-box__message {
    p {
      font-size: 18px;
      font-weight: 500;
      color: #03050d;
      line-height: 25px;
    }
  }
  
  .el-message-box__btns {
    padding: 0 20px 10px;
    
    .el-button {
      width: 72px;
      height: 32px;
      background: rgba(220, 218, 226, 0);
      border: 1px solid #dfdfdf;
      border-radius: 4px;
    }
    
    .el-button--primary {
      background: #8365f6;
      border: 1px solid #8365f6;
    }
  }
}
</style>
