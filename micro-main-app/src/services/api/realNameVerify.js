import request from './request'

//查询实名认证状态
export function queryVerifyStatusNotice() {
  let params = {}
  return request({
    headerUrl: 'web.v2.userRealName.checkAuth',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
} 

//查询实名认证状态
export function queryVerifyStatusInfo() {
  let params = {}
  return request({
    headerUrl: 'web.v2.userRealName.getAuthDetail',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}
/**
 * 图片识别
 * @param {String} imageBase64
 * @param {String} type 10.营业执照；20.组织机构代码照片；30.税务登记证
 */
export function ocrImgRecognition(imageBase64, type) {
  let params = {
    image_data: imageBase64,
    type,
  }
  return request({
    headerUrl: 'web.v2.userRealName.ocrImgRecognition',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}
//身份证图片识别
export function ocrImgByIdentityCard(imageBase64, isNationalEmblemSide = false) {
  let params = {
    imageBase64: imageBase64,
    cardSide: isNationalEmblemSide ? 'BACK' : 'FRONT',
  }
  return request({
    headerUrl: 'web.v2.userRealName.ocrImgByIdentityCard',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//个人实名认证
export function applyPersonalVerify({ id, idName, idNo, gender, address, idFrontImageBizId, idBackImageBizId }) {
  let params = {
    id, //数据Id,修改时必填
    from: 3,
    idType: 1,
    idCardName: idName,
    idCardNo: idNo,
    gender,
    collectMethod: 30,
    addressType: 1,
    address,
    idCardFrontPic: idFrontImageBizId, //国徽面
    idCardFrontReversePic: idBackImageBizId,
    userTypeStatus: 10,
    userType: 2,
  }
  return request({
    headerUrl: 'web.v2.userRealName.applyPersonAuth',
    method: 'post',
    data: params,
  })
}

//企业实名认证
export function applyEnterpriseVerify({
  id,
  idName,
  idNo,
  gender,
  address,
  idFrontImageBizId,
  idBackImageBizId,
  certificateType,
  certificateNo,
  certificateImageBizId,
  orgNames,
  companyRegAddress,
  agentPhone,
  agentIdCardNo,
}) {
  let params = {
    id, //数据Id,修改时必填
    from: 3,
    idType: 1,
    idCardName: idName,
    idCardNo: idNo,
    gender,
    collectMethod: 30,
    addressType: 1,
    address,
    idCardFrontPic: idFrontImageBizId, //国徽面
    idCardFrontReversePic: idBackImageBizId,
    userTypeStatus: 10,
    userType: 2,
    // linkMobile,
    orgNames,
    orgNo: certificateType === '20' ? certificateNo : '',
    orgNoPic: certificateType === '20' ? certificateImageBizId : '',
    creditCode: certificateType === '10' ? certificateNo : '',
    creditCodePic: certificateType === '10' ? certificateImageBizId : '',
    taxRegNo: certificateType === '30' ? certificateNo : '',
    taxRegNoPic: certificateType === '30' ? certificateImageBizId : '',
    // orgPhone,
    companyRegAddress,
    agentPhone,
    agentIdCardNo,
  }
  return request({
    headerUrl: 'web.v2.userRealName.applyEnterpriseAuth',
    method: 'post',
    data: params,
  })
}
