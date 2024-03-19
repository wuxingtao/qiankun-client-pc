<template>
  <div class='menu' :class="{'menu-collapse' :isCollapse}">
    <avatar :is-collapse='isCollapse' />

    <div class='menu-btn-fold' @click="$emit('update:isCollapse',!isCollapse)">
      <svg-icon :icon-class="`icon-menu-${isCollapse?'unfold':'fold'}`" />
    </div>
    <div class='scrollbar'>
      <el-menu :collapse='isCollapse'
               :default-active='menuIndex'
               :default-openeds='menuDefaultOpeneds'
               activeTextColor='#8365F6'
               @select='onMenuSelect'
               :collapse-transition='false'>
        <template v-for="menu in displayList.filter(f=>customerCode||(f.title!=='我的账单'))">
          <!-- 有子菜单 -->
          <el-submenu v-if='menu.child' :key='menu.index' :index='menu.index' popper-class='menu-submenu--main'>
            <template slot='title'>
              <i :class='menu.icon'></i>
              <span>{{ menu.title }}</span>
            </template>
            <template v-for="submenu in menu.child.filter(f=>customerCode||(f.title!=='我的优惠券'))">
              <el-submenu v-if='submenu.child' :key='submenu.index' :index='submenu.index' class="menu-submenu--third" popper-class='menu-submenu--third'>
                <template slot='title'>
                  <span>{{ submenu.title }}</span>
                </template>
                <el-menu-item v-for="thirdmenu in submenu.child" :key='thirdmenu.index' :index='thirdmenu.index'>
                  {{ thirdmenu.title }}
                </el-menu-item>
              </el-submenu>
              <el-menu-item v-else :key='submenu.index' :index='submenu.index'>
                {{ submenu.title }}
              </el-menu-item>
            </template>

          </el-submenu>
          <!-- 无子菜单 -->
          <el-menu-item v-else :key='menu.index' :index='menu.index'>
            <i :class='menu.icon'></i>
            <span slot='title'>{{ menu.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getCustomerCode } from '@/utils/storage'
import Avatar from './avatar.vue'

const MENU_ICON_PREFIX = 'iconfont icon-menu'

/**
     * 全量菜单(实际展示请修改displayList)
     */
const MENU_LIST = [
  { index: '29', title: '运单查询', icon: `${MENU_ICON_PREFIX}-bill`, path: '/admin/waybill-v3' },
  { index: '28', title: '下单寄件', icon: `${MENU_ICON_PREFIX}-location`, path: '/admin/delivery' },
  {
    index: '3',
    title: '时效运费查询',
    icon: `${MENU_ICON_PREFIX}-search`,
    path: '/admin/query'
  },
  {
    index: '4',
    title: '我的账单',
    icon: `${MENU_ICON_PREFIX}-account`,
    path: '/admin/bill'
  },
  // {
  //   index: "5",
  //   title: "统计报表",
  //   icon: `${MENU_ICON_PREFIX}-report`,
  //   path: "/admin/report",
  // },
  { index: '6', title: '地址簿', path: '/admin/address' },
  { index: '7', title: '打印设置', path: '/admin/print' },
  { index: '8', title: '个人中心', path: '/admin/user' },
  { index: '9', title: '默认设置', path: '/admin/setting' },
  { index: '10', title: '个性化模板设置', path: '/admin/batch-template' },
  { index: '13', title: '我的优惠券', icon: `${MENU_ICON_PREFIX}-coupon`, path: '/admin/coupon' },
  // { index: '12', title: '我的预存', icon: `${MENU_ICON_PREFIX}-prestore`, path: '/admin/prestore' },
  // { index: '14', title: '我的报价', icon: `${MENU_ICON_PREFIX}-quotation`, path: '/admin/quotation' },
  { index: '15', title: '电子发票', icon: `${MENU_ICON_PREFIX}-account`, path: '/admin/electronic-invoice' },
  { index: '16', title: '国际会展', icon: `${MENU_ICON_PREFIX}-exhibition`, path: '/admin/exhibition-waybills' },
  { index: '17', title: '供应商信息', path: '/supplier/index' },
  { index: '18', title: 'SKU库', path: '/supplier/sku' },
  { index: '19', title: '供应商下单', path: '/supplier/allocation' },

  /*  { index: '20', title: '数据看板', path: '/dashboard' },*/
  { index: '20', title: '数据看板', path: '/admin/total-show' },
  { index: '21', title: '汇总报表', path: '/admin/total-totals' },
  { index: '22', title: '明细报表', path: '/admin/total-list' },
  { index: '27', title: '操作日志', path: '/admin/encrypt-records' },
  { index: '33', title: '权限管理', path: '/admin/permission-manage' },
  { index: '34', title: '本人签收', path: '/admin/self-sign' },
  { index: '99', title: '整车寄件', path: '/admin/vtsOrder' },
  { index: '100', title: '整车运单', path: '/admin/vtsWaybill' },
  { index: '33', title: '权限管理', path: '/admin/permission-manage' },
  // { index: '35', title: '付款授权', path: '/admin/payment-authorization' },
  { index: '34', title: '本人签收', path: '/admin/self-sign' },
  { index: '41', title: '派送偏好', path: '/admin/preference-delivery' },
  { index: '1000', title: 'vue-micro', path: '/admin/vue' },
  { index: '1001', title: 'vue-micro-list', path: '/admin/vue/slot' },
]

export default {
  components: {
    Avatar
  },
  props: {
    isCollapse: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      menuIndex: '',
      menuDefaultOpeneds: ['supplier'],
      // 展示菜单配置
      displayList: [
        // this.getMenuItem('运单查询'),
        // this.getMenuItem('下单寄件'),
        this.getMenuItem('时效运费查询'),
        this.getMenuItem('我的账单'),
        {
          index: 'setting',
          title: '设置中心',
          icon: `${MENU_ICON_PREFIX}-user`,
          child: [
            this.getMenuItem('地址簿'),
            this.getMenuItem('打印设置'),
            this.getMenuItem('个人中心'),
            this.getMenuItem('默认设置'),
            this.getMenuItem('个性化模板设置'),
            this.getMenuItem('权限管理'),
            // this.getMenuItem('付款授权'),
            //this.getMenuItem('本人签收')
            {
              index: 'preference',
              title: '偏好设置',
              icon: `${MENU_ICON_PREFIX}-user`,
              child: [
                this.getMenuItem('派送偏好'),
              ]
            },
            // this.getMenuItem('本人签收')  //本人签收-发生产注释
          ]
        },
        this.getMenuItem('我的优惠券'),
        {
          index: 'vue',
          title: 'vue-micro',
          child:[
            this.getMenuItem('vue-micro'),
            this.getMenuItem('vue-micro-list'),
          ]
        }

      ]
    }
  },
  created () {

  },
  mounted () {
    // let items = [
    //   this.getMenuItem('运单查询'),
    //   this.getMenuItem('下单寄件')
    // ]
    // if(!this.isClientMode){
    let items = []
    items = [{
      index: '1',
      title: '查件',
      icon: `${MENU_ICON_PREFIX}-bill`,
      child: [
        this.getMenuItem('运单查询'),
        this.getMenuItem('整车运单')
      ]
    },
    {
      index: '2',
      title: '寄件',
      icon: `${MENU_ICON_PREFIX}-location`,
      child: [
        this.getMenuItem('下单寄件'),
        this.getMenuItem('整车寄件')
      ]
    }]
    // }
    this.displayList.unshift(...items)
    this.setMenuIndex(this.$route.path)
  },
  computed: {
    customerCode () {
      return getCustomerCode()
    },
    ...mapState('auth',['authCodeList']),
    ...mapGetters(['authorityIds', 'customerizedPermission', 'isCustomerIsMonthly']),
    ...mapGetters('permission', ['permissionMenuAble'])
  },
  watch: {
    $route (to) {
      this.setMenuIndex(to.path)
    },
    authCodeList (codes) {
      if (codes.includes('internationalEx')) {
        const item = this.getMenuItem('国际会展')
        this.displayList.splice(this.displayList.length - 1, 0, item)
      }
    },
    authorityIds (ids) {
      if (!ids) {
        return
      }
      if (ids.includes('127')) {
        const item = this.getMenuItem('操作日志')
        const settingItem = this.displayList.find(f => f.title === '设置中心')
        if (settingItem) {
          settingItem.child.splice(settingItem.child.length - 1, 0, item)
        }
      }
      if (ids.includes('119')) {
        this.displayList.splice(this.displayList.length - 1, 0, {
          index: 'supplier',
          title: '供应商管理',
          icon: `${MENU_ICON_PREFIX}-supplier`,
          child: [
            this.getMenuItem('供应商信息'),
            this.getMenuItem('SKU库'),
            this.getMenuItem('供应商下单')
          ]
        })
      }
      //统计分析
      if (ids.includes('123') || ids.includes('124') || ids.includes('125')) {
        let totalList = {
          index: 'total',
          title: '统计分析',
          icon: 'iconfont icona-bianzu122',
          child: []
        }
        if (ids.includes('123')) {
          totalList.child.push(this.getMenuItem('数据看板'))
        }
        if (ids.includes('124')) {
          totalList.child.push(this.getMenuItem('汇总报表'))
        }
        if (ids.includes('125')) {
          totalList.child.push(this.getMenuItem('明细报表'))
        }
        if (this.displayList.length > 2) {
          this.displayList.splice(this.displayList.length - 2, 0, totalList)
        } else {
          this.displayList.unshift(totalList)
        }
      }
    },
    customerizedPermission (params) {
      if (!params) {
        return
      }
      if (params['onlyReport'] === '10') {
        this.showReportUserMenu()
      }
      const flags = [
        'freeGroup',
        'expressGroup',
        'wholeDeliveredFlag',
        'timeDeliveredFlag',
        'flowToFlag',
        'weightFlag',
        'expressRealTimeState'
      ]
      if (this.authorityIds.indexOf('118') >= 0) {
        flags.push('timeReport')
      }
      if (flags.some(f => params[f] === '10')) {
        //统计报表
        this.displayList.splice(
          this.displayList.length - 1,
          0,
          this.getMenuItem('统计报表')
        )
      }

      if (params['onlyReport'] === '10') {
        // if (this.displayList.find(m => m.title === '统计报表')) {
        //   if (this.$route.path !== '/admin/report') {
        //     this.$router.push({ name: 'report', params: { closeTab: '1' } })
        //   }
        // } else
        {
          if (this.$route.path !== '/admin/user') {
            this.$router.push({ name: 'user', params: { closeTab: '1' } })
          }
        }
      }
    },
    isCustomerIsMonthly (val) {
      if (!val) {
        const item = this.getMenuItem('我的账单')
        if (item) {
          item.path = '/admin/bill-unmonthly'
        }
      }
    },
    permissionMenuAble: {
      handler(val) {
        const menuIndex = this.displayList.findIndex(
            f => f.title === '设置中心' || f.index === 'setting'
        )
        const permissionMenuIndex = this.displayList[menuIndex].child?.findIndex(
            f => f.title === '权限管理'
        )

        if (!val) {
          this.displayList[menuIndex]?.child?.splice(permissionMenuIndex, 1)
        } else {
          if (permissionMenuIndex === -1) {
            this.displayList[menuIndex]?.child?.splice(5, 0, this.getMenuItem('权限管理'))
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    getMenuItem (title) {
      return MENU_LIST.find(f => f.title === title)
    },
    // 根据路由设置当前选中菜单
    setMenuIndex (path) {
      this.menuIndex = ''
      for (let menu of MENU_LIST) {
        if (path.startsWith(menu.path)) {
          this.menuIndex = menu.index
        }
      }
    },

    // 点击菜单
    onMenuSelect (index) {
      if (index != this.menuIndex) {
        let path = this.getMenuPath(index)
        if (path && path != this.$route.path) {
          this.$router.push({ path })
        }
        if (path === this.$route.path) {
          this.menuIndex = index
        } else { //处理路由被拦截，但当前激活菜单变更的问题
          const temp = this.menuIndex
          this.menuIndex = ''
          this.$nextTick(() => this.menuIndex = temp)
        }
      }
    },

    // 获取菜单path
    getMenuPath (index) {
      let path = ''
      for (let menu of MENU_LIST) {
        if (menu.index === index) {
          path = menu.path
          break
        }
      }
      return path
    },
    //显示报表统计用户的菜单
    showReportUserMenu () {
      const menu = this.displayList.filter(f => ['统计报表', '设置中心', '统计分析'].includes(f.title))
      menu.forEach(f => {
        if (f.title === '设置中心') {
          f.child = menu.find(f => f.title === '设置中心').child.filter(f => f.title === '个人中心')
        }
      })
      this.displayList = menu
    }
  }
}
</script>

<style lang='scss'>
.menu-submenu--main {
  .el-menu {
    min-width: 150px;

    .el-menu-item {
      // color: #333333;
      height: 44px;
      line-height: 44px;
    }
  }
}
</style>
<style lang='scss' scoped>
.menu {
  z-index: 10;
  position: relative;
  background-color: #FFFFFF;
  border: 0;
  border-radius: 0px 4px 0px 0px;
  box-shadow: 3px 0px 4px 0px rgba(0, 0, 0, 0.05);
  padding-top: 10px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  background-image: url('~@/assets/image/admin/menu_bg.png');
  background-size: 100%;
  background-position: top center;
  background-repeat: no-repeat;
  min-width: 73px;

  .scrollbar {
    height: calc(100% - 76.8px);
    padding-top: 33px;
    //flex: 1;
    overflow-y: hidden;

    &:hover {
      overflow-y: scroll;
      transition: overflow .1s;
      // 宽度抖动
    }

    &::-webkit-scrollbar {
      opacity: 0;

      &:hover {
        opacity: 1;
        transition: opacity .1s;
      }
    }

    &::-webkit-scrollbar-thumb {
      background-color: hsla(0, 0%, 60%, .3);
      border-radius: 4px;
      border: 1px solid transparent;
      background-clip: padding-box;

      &:hover {
        background-color: hsla(0, 0%, 60%, .5);
      }
    }
  }

  .menu-btn-fold {
    position: absolute;
    top: 50%;
    right: -11px;
    width: 12px;
    height: 62px;
    transform: translateY(-50%);
    cursor: pointer;

    & > .svg-icon {
      width: 100%;
      height: 100%;
    }
  }

  /deep/ .el-menu {
    border-right: 0 !important;
    overflow: hidden;
    max-width: 158px;

    &,
    .el-submenu {
      .el-menu-item,
      .el-submenu__title {
        // color: #333333;
        height: 44px;
        line-height: 44px;

        .iconfont {
          font-size: 16px;
        }
      }
    }

    .el-submenu .el-menu-item {
      padding-left: 55px !important;
      min-width: auto;
    }

    // .el-submenu .el-menu{
    //   background: #f4f5fb;
    // }
    .el-menu-item,
    .el-submenu__title {
      &:hover {
        background: #e8e9ed;
      }
    }

    .el-menu-item {
      &.is-active {
        background: linear-gradient(270deg, #f9f7ff, #e3deff);
        font-weight: bold;

        &::before {
          content: '';
          background: #7556ed;
          position: absolute;
          left: 0;
          width: 2px;
          height: 100%;
        }
      }
    }

    .menu-submenu--third {
      .el-submenu__title {
        padding-left: 55px !important;
      }

      .el-menu-item {
        padding-left: 67px !important;
      }
    }
  }

  .iconfont {
    margin-right: 18px;
  }

  // .el-icon-s-claim {
  //   margin-right: 18px;
  //   font-size: 16px;
  //   width: 16px;
  // }
}
</style>
