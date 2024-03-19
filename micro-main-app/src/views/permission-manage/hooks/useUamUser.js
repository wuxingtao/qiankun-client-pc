/**
 * @Desc: userUamUser 设置副<管理员/授权号>
 * @Author: wu xingtao
 * @Date: 2022/2/18
 */

import useUam from '@views/permission-manage/hooks/useUam'
import { onActivated, onMounted, computed, toRefs, ref } from '@vue/composition-api'
import useUamUtil from '@views/permission-manage/hooks/useUamUtil'
import { uam_getAdminVicesNumber } from '@api/permission'
import { paymentManagerNum } from '@views/permission-manage/permissionUtil'

export default function (root) {
  const admin_add_available = ref(true) // 允许设置副管理员
  const payment_add_available = ref(true) // 允许设置副授权号

  onActivated(() => {
    uam_checkManager()
  })

  onMounted(() => {
    uam_checkManager()
  })

  const { uam_current_owner } = useUam()
  const { uam_admin_can_add, uam_payment_can_add, UamAdminLimitTip, UamPaymentLimitTip } =
    useUamUtil()

  const uam_checkManager = () => {
    admin_add_available.value = uam_admin_can_add()
    payment_add_available.value = uam_payment_can_add()
  }

  const permission_tab_active = computed(() => {
    return root.$store.state.permission.permission_tab_active
  })

  const isSuper = computed(() => {
    return uam_current_owner()
  })
  const isSuperPayment = computed(() => {
    return root.$store.getters['permission/paymentIsSuper']
  })

  // 更新副管理/副授权号个数
  const uam_updateAdminVicesNumber = async () => {
    let res = await uam_getAdminVicesNumber()
    if (res.code === 0 && res.data) {
      paymentManagerNum.uam_admin_update_num(res.data.adminNumber)
      paymentManagerNum.uam_payment_update_num(res.data.vicesNumber)
      uam_checkManager()
    }
  }

  return {
    admin_add_available,
    payment_add_available,
    permission_tab_active,
    isSuper,
    isSuperPayment,
    UamAdminLimitTip,
    UamPaymentLimitTip,
    uam_checkManager,
    uam_updateAdminVicesNumber
  }
}
