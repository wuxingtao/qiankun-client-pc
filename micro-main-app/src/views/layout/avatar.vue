<template>
  <div class='avatar-container'>
    <!-- 用户信息 -->
    <div class='user-info' :class="{'user-info--collapse' :isCollapse}">
      <div class='avatar'>
        <img :onerror='defaultAvatar'
             :src="userInfo.headUrl ? userInfo.headUrl : require('@assets/image/admin/avatar.png')" />
      </div>
      <template v-if='!isCollapse'>
        <div class='info' @click='switchUserDialog'>
          <span class='name'>{{ userInfo.userName || formatPhone(true) }}</span>
          <img v-if='isRealName' src='@/assets/image/admin/icon_verified.png' />
          <img v-else src='@/assets/image/admin/icon_unverified.png' />
          <i :style="{transform: isUserDialogVisible? 'rotateX(180deg)':''}" class='el-icon-arrow-down'></i>
        </div>
        <div class='company' @click='bindCustomerCode'>
          <span>{{ customerShortName }}</span>
        </div>
      </template>
    </div>
    
    <!-- 用户对话框 -->
    <el-dialog :visible.sync='isUserDialogVisible' ref='userDialog' class='user-dialog'
               :style="{top:isCollapse?'100px':'138px'}" width='175px' :show-close='false' :modal='false'>
      <div class='content' @click='jumpUserCenter()' title='个人中心'>
        <p class='name'>{{ userInfo.userName || '未填写姓名' }}</p>
        <p class='phone'>{{ formatPhone() }}</p>
        <!-- <img v-if='isRealName' src='@/assets/image/admin/icon_verified.png' />
        <img v-else src='@/assets/image/admin/icon_unverified.png' /> -->
        <i class='el-icon-arrow-right'></i>
      </div>
      <div class='menu'>
        <el-menu>
          <el-menu-item @click='logout()'>
            <i class='iconfont icon-logout'></i>
            <span slot='title'>退出登录</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getUserData } from '@/utils/storage'
import { userLogout } from '@utils/commonUtil'
import { loginOut } from '@api/login'
import formatUtil from '@/utils/format'

export default {
  props: {
    isCollapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      defaultAvatar: 'this.src="' + require('@assets/image/admin/avatar.png') + '"',
      isUserDialogVisible: false
    }
  },
  methods: {
    switchUserDialog() {
      this.isUserDialogVisible = !this.isUserDialogVisible
    },
    // 用户信息
    jumpUserCenter() {
      this.isUserDialogVisible = false
      this.$router.push('/admin/user')
    },
    // 绑定用户编码
    bindCustomerCode() {
      if (this.userInfo.customCode) {
        this.isUserDialogVisible = !this.isUserDialogVisible
      } else {
        this.$router.push('/admin/user/cusCode')
      }
    },
    logout() {
      this.$confirm('是否确认退出账号?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        loginOut().then(res => {
          if (res.code === 0) {
            userLogout()
          } else {
            res.msg && this.$message.error(res.msg)
          }
        })
      }).finally(() => {
        this.isUserDialogVisible = false
      })
    },
    formatPhone(isEncrypt) {
      const phone = this.userInfo.phone
      if (isEncrypt) {
        return formatUtil.encrptMobile(phone)
      }
      return formatUtil.formatMobliePhone(phone)
    }
  },
  computed: {
    customerShortName() {
      return this.userInfo.customCode ? this.userInfo.customerInfo.customerShortName : '未绑定客户编码'
    },
    isRealName() {
      return this.$store.state.realNameInfo ? this.$store.state.realNameInfo.isRealName : false
    },
    ...mapState({
      userInfo: state => {
        return state.userInfo || getUserData() || {}
      }
    })
  }
}
</script>

<style lang='scss' scoped>
.avatar-container {
  display: flex;
  justify-content: center;
  
  .user-info {
    &:not(.user-info--collapse) {
      width: 140px;
    }
    
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #8f8fa8;
    cursor: pointer;
    
    .avatar img {
      width: 35px;
      height: 35px;
    }
    
    .info {
      font-size: 14px;
      line-height: 30px;
      display: flex;
      align-items: center;
      
      .name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 80px;
        font-weight: bold;
        color: #333333;
      }
      
      > i {
        font-size: 12px;
      }
      
      > img {
        width: 50px;
        height: 14px;
        padding: 0 4px;
      }
    }
    
    .company {
      font-size: 12px;
      opacity: 0.7;
    }
  }
  
  .user-dialog {
    /deep/ .el-dialog {
      position: absolute;
      margin-top: 0 !important;
      // top: 138px;
      left: 8px;
      border-radius: 10px;
      overflow: hidden;
      
      &__header {
        display: none;
      }
      
      &__body {
        padding: 0;
        
        .content {
          cursor: pointer;
          padding: 15px;
          
          .name {
            color: #333333;
            font-size: 14px;
            font-weight: bold;
            padding-right: 15px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1;
          }
          
          .phone {
            color: #8f8fa8;
            font-size: 12px;
            line-height: 1;
            margin-top: 8px;
          }
          
          // > img {
          //   margin-top: 5px;
          //   width: 50px;
          //   height: 15px;
          // }
          
          > i {
            position: absolute;
            right: 10px;
            top: 25px;
          }
        }
        
        .menu {
          height: 45px;
          background: #f4f6f7;
          
          .el-menu {
            border-right: none;
            border-top: 1px solid #f4f6f7;
          }
          
          .el-menu-item:hover,
          .el-menu-item:focus {
            background-color: #f4f6f7;
            color: rgb(131, 101, 246);
            
            > i {
              color: rgb(131, 101, 246);
            }
          }
          
          .el-menu-item {
            height: 45px;
            line-height: 45px;
            display: flex;
            
            > i {
              color: #333333;
              margin-right: 8px;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
</style>
