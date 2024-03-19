<template>
  <div class="verify-status">
    <div class="verify-item">
      <div class="page-box">
        <div class="page-box__name flex flex_ai_c flex_jc_b" style="width:442px">
          <h4>您已完成{{ currentInfo.label }}</h4>
          <span class="theme-color fl_right fs_14 cursor" @click="changeVerify">更换实名信息<i
              class="el-icon-arrow-right fs_12"></i></span>
        </div>
        <div class="page-box__content">
          <div class="page-card">
            <div class="card-status">
              <img src="@assets/image/setting/verify-success.png" style="width:42px;">
            </div>
            <div class="card-content">
              <p class="mb_16">
                <i class="iconfont fs_36--strict theme-color" :class="currentInfo.firstIcon"></i>
              </p>
              <div class="item">
                <span class="label" :class="[{'label-space-2':type === '0'}]">{{ currentInfo.firstLabel }}</span>
                <div>{{ statusInfo.name }}</div>
              </div>
              <div class="item">
                <span class="label" :class="[{'label-space-half': type === '0'}]">{{ currentInfo.firstLabel2 }}</span>
                <div>{{ statusInfo.code }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="page-box">
        <div class="page-box__name"><h4>您还可以进行</h4></div>
        <div class="page-box__content">
          <div class="page-card-empty" @click="toVerify">
            <i class="iconfont theme-color fs_36--strict mb_20 block" :class="currentInfo.secondIcon"></i>
            <h4 class="mb_16">
              <span class="fs_18 c_333">{{ type === '0' ? '企业认证' : '个人认证' }}</span>
              <i class="el-icon-arrow-right fl_right cursor c_999"></i>
            </h4>
            <p class="c_999">
              {{ currentInfo.secondDesc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'verify-status' ,
  props: {
    personInfo: {
      type: Object ,
      default: () => {
      }
    } ,
    // 企业认证信息
    enterpriseInfo: {
      type: Object ,
      default: () => {
      }
    } ,
    // [0个人 1企业]
    type: {
      type: String ,
      default: () => '0'
    }
  } ,
  data() {
    return {
      labelList: [
        {
          label: '个人认证' ,
          firstLabel: '姓名' ,
          firstLabel2: '身份证' ,
          firstIcon: 'icon-person-verify' ,
          secondIcon: 'icon-enterPrise-verify' ,
          secondDesc: '用于企业组织认证，完成认证后企业员工寄件时，可不用再单独认证'
        } ,
        {
          label: '企业认证' ,
          firstLabel: '公司名称' ,
          firstLabel2: '组织机构代码' ,
          firstIcon: 'icon-enterPrise-verify' ,
          secondIcon: 'icon-person-verify' ,
          secondDesc: '用于个人实名认证，上传您的身份证信息即可完成实名认证。'
        }
      ] ,
    }
  } ,
  computed: {
    statusInfo() {
      let result = this.type === '0' ? {
        name: this.personInfo.idCardName ,
        code: this.personInfo.idCardNo ,
      } : {
        name: this.enterpriseInfo.certificationName ,
        code: this.enterpriseInfo.certificationCode
      }
      return result
    } ,
    currentInfo() {
      return this.labelList[this.type]
    }
  } ,
  methods: {
    // 更换认证 [0个人 ,1企业]
    changeVerify() {
      if (this.type === '0') {
        this.$emit('update:verifiedOfPersonal' , false)
      } else if (this.type === '1') {
        this.$emit('update:verifiedOfEnterprise' , false)
      }
    } ,
    toVerify() {
      let params = {}
      if (this.type === '0') {
        params = this.enterpriseInfo.id ? {id: this.enterpriseInfo.id , verified: true} : {}
        this.$router.push({name: 'enterpriseVerify' , params})
      } else {
        params = this.personInfo.id ? {id: this.personInfo.id , verified: true} : {}
        this.$router.push({name: 'personalVerify' , params})
      }

    }
  }
}
</script>

<style lang="scss" scoped>
.page-box {
  .page-box__name {
    padding: 26px 20px 20px 0;
    font-size: 16px;

    h4 {
      font-weight: 500;
    }
  }
}

.page-box__title {
  border-bottom: 0;
}

.page-card {
  width: 442px;
  height: 184px;
  padding: 23px 32px;
  border: 1px solid #e4e5f3;
  border-radius: 14px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.03);
  position: relative;
  color: #333333;
  background: url('../../../assets/image/setting/card_bg.png') no-repeat top left;
  background-size: cover;
  box-sizing: border-box;

  .card-status {
    position: absolute;
    right: 20px;
    top: 20px;
  }

  .label {
    color: #999999;
    margin-right: 36px;
    width: 60px;
    display: inline-block;
    white-space: nowrap;

    & + div {
      display: inline-block;
    }
  }

  .edit-icon {
    margin-left: 8px;
  }

  .label-space-2 {
    letter-spacing: 2em;
  }

  .label-space-half {
    letter-spacing: .5em;
  }

  .item {
    margin-bottom: 18px;
  }

  .c-red {
    color: #F13E3E;
  }

  .c-green {
    color: #41C381;
  }

  .input-border-none {
    //height: 24px;

    /deep/ .el-input__inner, /deep/ .el-input {
      padding-left: 0 !important;
      height: 24px !important;
      border: none;
      background-color: initial;
      color: #333333 !important;
    }

    /deep/ .el-input__icon {
      line-height: 24px;
    }
  }

  .birthday-item {
    /deep/ .el-input__prefix {
      display: none;
    }
  }

  .btn-bind {
    width: 72px;
    opacity: 1;
    border: 1px solid #8365f6;
    border-radius: 11px;
    padding: 2px 6px;
    cursor: pointer;
    margin-left: 24px;
  }
}

.page-card-empty {
  width: 442px;
  height: 184px;
  padding: 26px 32px;
  box-sizing: border-box;
  opacity: 1;
  background: #ffffff;
  border: 1px solid #f3f3f3;
  border-radius: 13px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.03);

  p {
    line-height: 1.4;
  }
}
</style>
