import { queryVerifyStatusInfo } from '@api/realNameVerify'

/**
 * @Desc: verifyMixin 用户认证信息
 * @Author: wu xingtao
 * @Date: 2021/3/8
 */
export default {
  data() {
    return {
      // 是否个人认证
      verifiedOfPersonal: false ,
      // 是否企业认证
      verifiedOfEnterprise: false ,
      // 个人认证信息
      personInfo: {
        id: '' ,
        idCardName: '' ,
        idCardNo: ''
      } ,
      // 企业认证信息
      enterpriseInfo: {
        id: '' ,
        certificationName: '' ,
        certificationCode: ''
      } ,
      verifyLoading: false
    }
  } ,
  activated() {
    this.handleInfo()
  } ,
  methods: {
    // 获取验证信息
    async handleInfo() {
      this.verifyLoading = true
      try {
        let res = await queryVerifyStatusInfo()
        this.loading = false
        if (res.code !== 0 || !res.data) {
          return
        }
        this.verifiedOfPersonal = !!res.data.personCertification
        this.verifiedOfEnterprise = !!res.data.enterpriseCertification
        if (this.verifiedOfPersonal) {
          let data = res.data.personCertification
          const {id , idCardName , idCardNo} = data
          this.personInfo = {
            id , idCardName , idCardNo
          }
        }
        if (this.verifiedOfEnterprise) {
          let data = res.data.enterpriseCertification
          const {id , certificationName , certificationCode} = data
          this.enterpriseInfo = {
            id , certificationName , certificationCode
          }
        }
      } catch (e) {
        this.loading = false
      }

    } ,
    // 获取并更新本地信息
    updateVerify() {
      this.$store.dispatch('updateRealNameInfo')
    }
  }
}
