<template>
  <div class="page__container">
    <header class="page__header">
      <div> 个人中心</div>
    </header>
    <div class="page__content pt_20 pl_20 pr_20" v-loading="loading">
      <el-row :gutter="24" type="flex">
        <el-col :span="12">
          <div class="page-box page-box__userinfo">
            <div class="page-box__title">个人信息</div>
            <div class="page-card page-card__user">
              <div class="card-status" @click="routerPush('realVerify')">
                {{ personAuth ? '更换实名认证' : '去实名认证' }}
              </div>
              <div class="row row__title">
                <img src="../../../assets/image/setting/user/user.png">
                <span class="name" v-show="!personInfoCanEdit.userName">{{ personInfo.userName || '未填写姓名'}}</span>
                <el-input class="input-border-none input_bomtom_border" v-model="personInfo.userName" :maxlength="20" :style="personInfoCanEdit.userName ? {visibility:'initial',width:'auto'}:{visibility:'hidden',width:0}" min="1" @blur="handleInputBlur('userName')" ref="userNameRef" />
                <i class="el-icon-edit-outline edit-icon fs_14 ml10 cursor theme-color" v-show="!personInfoCanEdit.userName" @click="switchEditAble('userName')"></i>
              </div>
              <div class="row">
                <div class="col">
                  <span class="label">性别</span>
                  <div class="value">
                    <span v-show="!personInfoCanEdit.sex">{{ sex || '--'}}</span>
                  <el-select class="input-border-none input_bomtom_border" v-model="personInfo.sex" v-show="personInfoCanEdit.sex" :disabled="!personInfoCanEdit.sex" @change="handleInputBlur('sex')" ref="sexRef">
                    <el-option label="男" :value="2" />
                    <el-option label="女" :value="1" />
                  </el-select>
                  <i class="el-icon-edit-outline edit-icon fs_14 ml10 cursor theme-color" v-show="!personInfoCanEdit.sex" @click="switchEditAble('sex')"></i>
                  </div>
                </div>
                <div class="col">
                  <span class="label">手机号码</span>
                  <span>{{formatedPhone}}</span>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <span class="label">生日</span>
                  <div class="value">
                    <span v-show="!personInfoCanEdit.birthday">{{ personInfo.birthday || '--' }}</span>
                    <el-date-picker class="input-border-none birthday__picker" v-model="personInfo.birthday" type="date" placeholder="选择日期" :picker-options="pickerOptions" :style="personInfoCanEdit.birthday ? {visibility:'initial',width: 'auto'}:{visibility:'hidden',width:0}" @change="handleInputBlur('birthday')" value-format="yyyy-MM-dd" :editable="false" :clearable="false" ref="birthdayRef">
                  </el-date-picker>
                  <i class="el-icon-date edit-icon fs_14 ml10 cursor theme-color" v-show="!personInfo.birthday && !personInfoCanEdit.birthday" @click="switchEditAble('birthday')"></i>
                  </div>
                </div>
                <div class="col">
                  <span class="label">实名认证</span>
                  <span :style="{color:this.personAuth?'#41c381':'#ff8038'}">{{this.personAuth?'已实名':'未实名'}}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="page-box page-box__customercode">
            <div class="page-box__title">客户编码信息</div>
            <div class="page-card page-card__customer">
              <div v-if="customInfo.customCode" class="card-status" @click="routerPush('cusCode')">
               更换客户编码
                <!-- {{customInfo.customCode?'更换客户编码':'去绑定客户编码'}} -->
              </div>
              <div class="row row__title">
                <img src="../../../assets/image/setting/user/customer.png">
                <span>{{ customInfo.customCode ? (customInfo.customerShortName || '--') : '客户编码'}}</span>
              </div>
              <template v-if="customInfo.customCode">
                <div class="row">
                <div class="col">
                  <span class="label">绑定编码</span>
                  <span v-if="customInfo.customCode">{{ customInfo.customCode || '--'}}
                  </span>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <span class="label">账号状态</span>
                  <span :style="{color:this.customInfo.customCode?'#41c381':'#ff8038'}">
                    {{this.customInfo.customCode?'已绑定':'未绑定'}}
                  </span>
                  <el-button v-if="this.customInfo.customCode" type="text"  class="btn-bind" :loading="loadingUnbind" @click="unbindCode">解除绑定</el-button>
                </div>
              </div>
              </template>
              <div v-else>
                <el-link type="primary" icon="iconfont icon-code" :underline="false" style="margin-right:32px;"  @click="routerPush('cusCode')">绑定客户编码</el-link>
                <el-link type="primary" icon="iconfont icon-edit2" :underline="false"  @click="routerPush('customerCodeApply')">申请客户编码</el-link>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24"  type="flex">
        <el-col :span="12">
          <div class="page-box page-box__auth">
            <div class="page-box__title">
              付款授权
            </div>
             <div class="page-card page-card__auth cursor"  @click="routerPush('payment-authorization')">
              <div class="row row__title">
                  <img src="../../../assets/image/setting/user/auth.png">
                  <span>付款授权管理</span>
              </div>
 
                <div class="row" >
                   <span class="label">查看历史记录，保障您的付款权益</span>
                  <span class="icon-arrow el-icon-arrow-right"></span>
                  <!-- <div class="value" @click="routerPush('payment-authorization')">
                    <div>
                      <i class="iconfont icon-record-auth"/>
                      <span class="link">付款授权</span>
                    </div>
                  </div> -->
                </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="page-box page-box__password">
            <div class="page-box__title">系统安全</div>
            <div class="page-card page-card__password cursor"  @click="routerPush('pasSet')">
              <div class="row row__title">
                <img src="../../../assets/image/setting/user/password.png">
                <span>密码管理</span>
              </div>
              <div class="row">
                <span class="label">设置登录密码，保护系统安全</span>
                <span class="icon-arrow el-icon-arrow-right"></span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { queryVerifyStatusInfo } from '@api/realNameVerify'
import { modifyUserInfo } from '@api/setting'
import { getAuthInfo } from '@/services/api/pyAuth'
import formatUtil from '@utils/format'
import useCustomerCode from './hooks/useCustomerCode'

export default {
  name: 'user',
  data () {
    return {
      personInfo: {
        birthday: '',
        userName: '',
        sex: ''
      },
      customInfo: {
        customCode: '',
        customShortName: '',
        phone:''
      },
      // 个人信息是否可修改
      personInfoCanEdit: {
        birthday: false,
        userName: false,
        sex: false
      },
      // 是否实名认证
      personAuth: false,
      loading: false,
      loadingUnbind:false,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
      },
      authManagement: {}
    }
  },
  computed: {
    sex () {
      const sex = Number(this.personInfo.sex)
      if(sex === 1){
        return '女'
      }else if(sex === 2){
        return '男'
      }
      return ''
    },
    formatedPhone(){
      return formatUtil.formatMobliePhone(this.customInfo.phone)
    },
    ...mapState(['userInfo'])
  },
  watch: {
    'userInfo': {
      handler (val) {
        if (!val) {
          return
        }
        const { birthday, userName, sex, customCode ,phone} = val
        this.personInfo = {
          birthday, userName, sex
        }
        this.customInfo.customerShortName = val.customerInfo && val.customerInfo.customerShortName
        this.customInfo.customCode = customCode
        this.customInfo.phone = phone
      },
      immediate: true
    }
  },
  activated () {
    this.getAuthDetail()
    this.getAuthInfoDetail()
  },
  methods: {
    getRole () {
      switch (this.authManagement.role) {
        case 2:
          return '主授权人'
        case 1:
          return '协作人员'
      }
    },
    // 获取我的授权信息
    async getAuthInfoDetail () {
      if(!this.customInfo?.customCode){
        return
      }
      let res = await getAuthInfo()
      this.authManagement = res?.data || {}
    },
    // 实名认证-查询用户认证信息
    async getAuthDetail () {
      let res = await queryVerifyStatusInfo({})
      if (res.code === 0 && res.data) {
        this.personAuth = (res.data.personCertification && res.data.personCertification.id) || (res.data.enterpriseCertification && res.data.enterpriseCertification.id)
      }
    },
    // 切换是否可修改
    switchEditAble (key) {
      if (this.personInfoCanEdit.hasOwnProperty(key)) {
        this.personInfoCanEdit[key] = true
        this.$nextTick(() => {
          this.$refs[`${key}Ref`].blur()
          this.$refs[`${key}Ref`].focus()
        })

      }
    },
    handleInputBlur (key) {
      if (this.personInfoCanEdit.hasOwnProperty(key)) {
        this.personInfoCanEdit[key] = false
        this.handleSave()
      }
    },
    // 保存用户信息
    async handleSave () {
      const { userName: name, birthday, sex } = this.personInfo
      if (!name) {
        this.personInfo.userName = this.userInfo.userName
        this.$message.warning('用户姓名不能为空')
        return
      }
      const params = {
        name, sex, birthday
      }

      let res = await modifyUserInfo(params)
      if (res.code === 0) {
        this.$message.success('保存成功')
      }
      this.$store.dispatch('updateUserInfo')
    },
    // 解除绑定
    async unbindCode () {
      this.loadingUnbind = true
      const { unbindCustomerCode } = useCustomerCode(this) 
      await unbindCustomerCode(this.customInfo.customCode)
      this.loadingUnbind = false
    },
    // 路由跳转
    routerPush (name, source) {
      if (!name) {
        return
      }
      this.$router.push({ name: name, query: { source } })
    }
  }
}
</script>

<style lang="scss" scoped>
  .page__container {
    // background-color: #f7f9fa;
    padding-bottom: 1px;
    overflow-x: hidden;
    font-size: 12px;
    height: 100%;
    box-sizing: border-box;
    .page__header {
      font-size: 14px;
      color: #03050d;
      background-color: #f7f9fa;
      padding-bottom: 8px;
      & > div {
        height: 40px;
        line-height: 40px;
        box-sizing: border-box;
        padding-left: 20px;
        font-weight: bold;
        border-radius: 0px 0px 4px 4px;
        background-color: #fff;
      }
    }
    .header__span {
      height: 8px;
    }
  }
  .page-box {
    box-shadow: unset;
    background: linear-gradient(150deg, #ffffff 26%, #f9f8ff);
    border: 1px solid #e1e3ea;
    border-radius: 4px;
    padding: unset;
    margin-bottom: 21px;
    &.page-box__userinfo,&.page-box__customercode,&.page-box__auth,&.page-box__password{
      height: calc(100% - 22px);
    }
    .page-box__title {
      background: #f7faff;
      border-radius: 3px 3px 0px 0px;
      height: 33px;
      line-height: 33px;
      font-size: 12px;
      color: #03050d;
      font-weight: bold;
      padding-left: 20px;
    }
    .page-card {
      position: relative;
      color: #03050d;
      padding: 22px 0 24px 50px;
      &__user{
        background: url('~@/assets/image/setting/user/user-bg.png') no-repeat top right;
        .row{  
           .value,.el-input{
              width: 68px;
              font-size: 12px;
            }
        }
      }
      &__customer{
        background: url('~@/assets/image/setting/user/customer-bg.png') no-repeat top right;
      }
      &__password,&__auth{
        background: #ffffff;
        .row__title{
          margin-bottom: -5px !important;
        }
        .label{
          flex: 1;
        }
        .icon-arrow{
          width: 24px;
          text-align: center;
          margin-right: 12px;
        }
      }
      &__auth{
        .iconfont{
          margin-right: 4px;
          font-size: 13px;
          color: #8365f6;
        }
        .link{
          font-size: 13px;
          color: #8365f6;
          cursor: pointer;
        }
        .label{
          width:78px;
        }
        .value{
          display: flex;
          &>div:first-of-type{
            margin-right: 51px;
          }
        }
      }
      &__password{
        box-sizing: border-box;
      }
      .card-status {
        z-index: 2;
        position: absolute;
        right: -2px;
        top: 18px;
        width: 108px;
        height: 35px;
        background: url('~@/assets/image/setting/user/status-bg.png') no-repeat top left;
        font-size: 12px;
        background-size: cover;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ffffff;
        cursor: pointer;
        box-sizing: border-box;
        padding-bottom: 3px;
        // padding: 0 12px 3px;
      }
      .row{
        display: flex;
        font-size: 12px;
        height: 24px;
        line-height: 24px;
        align-items: center;
        // border: 1px solid;
        &.row__title{
          position: relative; 
          margin-bottom: 10px;
          img{
            width: 18px;
            height: 18px;
            position: absolute;
            top: 2px;
            left: -30px;
          }
          span{
             font-weight: bold;
             &.name{
               max-width: 240px;
               text-overflow: ellipsis;
               overflow: hidden;
               white-space: nowrap;
             }
          }
        }
        .col{
          display: flex;
          align-items: center;
        }
        .col+.col{
          margin-left: 75px;
        }
          @media (max-width: 1300px) {
          .col+.col{
                margin-left: 60px;
              }
        }
        
        .label{ 
          color: #8f8fa8;
          padding-right: 24px;
        }
     
      } 

      .edit-icon {
        margin-left: 8px;
        font-size: 13px;
      }

      .input-border-none {
        //  &.birthday__picker{
        //    border: 1px solid;
        //     /deep/.el-input{
        //       padding-right: unset !important;
        //     }
        //   }
        /deep/ {
          .el-input__inner,
          .el-input {
          padding-left: 0 !important;
          height: 24px !important;
          border-top: none !important;
          border-right: none !important;
          border-left: none !important;
          border-radius: 0 !important;
          background-color: initial;
          color: #333333 !important;
          padding-right: 0;
        }
         .el-input__icon {
          line-height: 24px;
          position: relative;
          right: -8px;
          &.el-icon-date{
            right: -40px;
          }
        }
        }
      }

      .btn-bind {
        cursor: pointer;
        margin-left: 24px;
      }
    }
  }

  // .page_scroll {
  //   @include scroll-bar;
  //   width: 355px;
  //   overflow-x: auto;
  //   padding-bottom: 20px;

  //   .page-text {
  //     min-width: 84px;
  //     margin-right: 32px;
  //     font-weight: 600;
  //     font-size: 14px;
  //     color: #03050d;
  //     white-space: nowrap;
  //   }

  //   .page-content {
  //     white-space: nowrap;
  //     .page-content-text {
  //       font-size: 14px;
  //       font-weight: 400;
  //       color: #8365f6;
  //     }
  //     .text-img {
  //       width: 16px;
  //       height: 16px;
  //       margin-right: 8px;
  //     }
  //     .line {
  //       width: 1px;
  //       height: 14px;
  //       background: #e9e9e9;
  //       margin: 0 10px;
  //     }
  //   }
  // }
</style>