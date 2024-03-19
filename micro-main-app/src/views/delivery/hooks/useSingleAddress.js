import deliveryApi from '@api/delivery'

export default function() {
  const validateAddressRestrict = async (singleState, { qhAddress, sjAddress }) => {
    const result =
      (await deliveryApi.getAddressRestrictMessage({ qhAddress, sjAddress })) || {}
    setValidateAddressRestrictResult(singleState,result)
  }

  const setValidateAddressRestrictResult = async (singleState, restrictResult) => {
    const state = {
      _addressRestrictWarningInfo: {},
      _addressRestrictErrorInfo: {}
    }
    if (restrictResult?.msg) {
      if (restrictResult.limitType === 10) {
        Object.assign(state._addressRestrictErrorInfo,restrictResult)
      } else if (restrictResult.limitType === 20) {
        Object.assign(state._addressRestrictWarningInfo,restrictResult)
      }
    }
    singleState._addressRestrictWarningInfo = state._addressRestrictWarningInfo
    singleState._addressRestrictErrorInfo = state._addressRestrictErrorInfo
  }


  return {
    validateAddressRestrict,
    setValidateAddressRestrictResult
  }


}
