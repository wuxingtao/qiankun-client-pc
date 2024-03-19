function getCommonRoutes(type) {
  let prefix = type ? "Client" : ""
  let clientPath=type ?"mybill/":""
  let clientPath2=type ?"":"/"
  const commonRoutes = [
    {
      path:clientPath2+ "invoice/index",
      meta: {
        name: "我的发票"
      },
      component: resolve => require(["@/views/invoice/index"], resolve)
    },
    {
      path: clientPath+"index",
      name: prefix + "MyBill",
      meta: {
        name: "我的账单"
      },
      component: resolve => require(["@/views/mybill/index"], resolve)
    },
    {
      path: clientPath+"billListDetail",
      name: prefix + "BillListDetail",
      meta: {
        name: "查看账单明细"
      },
      component: resolve => require(["@/views/mybill/billListDetail"], resolve)
    },
    {
      path: clientPath+"eventTracking",
      meta: {
        name: "埋点统计"
      },
      component: () => import("@/views/mybill/eventTrackingChart")
    },
    {
      path: clientPath+"eventTrackingData",
      name: "eventTrackingData",
      meta: {
        name: "统计详情"
      },
      component: () => import("@/views/mybill/eventTrackingData")
    },
    {
      path: clientPath+"advertising",
      name: "advertising",
      meta: {
        name: "新闻通知"
      },
      component: () => import("@/views/mybill/advertising")
    }
  ]
  return commonRoutes
}

export const clientBillRoutes = {
  path: "/client",
  meta: {
    name: "首页",
    meta: { isMyBillMoudle: true },
  },
  component: () => import("@views/client/layout/mainLayout"),
  redirect: "/client/mybill/index",
  children: getCommonRoutes("client")
}

export const billRoutes = {
  path: "/mybill",
  meta: { isMyBillMoudle: true },
  component: () => import("@/views/mybill/admin"),
  children: [
    ...getCommonRoutes(),
    {
      path: "/bill/print",
      meta: {
        name: '打印配置'
      },
      component: resolve => require(["@/views/setting/print"], resolve)
    },
    {
      path: "/bill/cusCode",
      meta: {
        name: "客户编码"
      },
      component: resolve => require(["@/views/setting/cusCode"], resolve)
    },
    {
      path: "/bill/pasSet",
      meta: {
        name: "密码设置"
      },
      component: resolve => require(["@/views/setting/pasSet"], resolve)
    },
    {
      path: "/bill/perInfo",
      meta: {
        name: "个人信息"
      },
      component: resolve => require(["@/views/setting/perInfo"], resolve)
    }
  ]
}

export const billLoginRoutes = {
  path: "/billlogin",
  meta: { isMyBillMoudle: true },
  component: () => import("@/views/mybilllogin/index"),
  redirect: "/billlogin/password",
  children: [
    {
      path: "password",
      meta: {
        name: "密码登录"
      },
      component: resolve =>
        require(["@/views/mybilllogin/loginPassword"], resolve)
    },
    {
      path: "messge",
      meta: {
        name: "短信登录"
      },
      component: resolve =>
        require(["@/views/mybilllogin/loginMessage"], resolve)
    },
    {
      path: "forget",
      meta: {
        name: "忘记密码"
      },
      component: resolve =>
        require(["@/views/mybilllogin/loginForget"], resolve)
    },
    {
      path: "customer",
      meta: {
        name: "绑定客户编码"
      },
      component: resolve =>
        require(["@/views/mybilllogin/loginCustomer"], resolve)
    }
  ]
}
