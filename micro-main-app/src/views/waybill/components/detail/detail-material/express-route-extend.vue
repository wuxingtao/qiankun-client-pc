<template>
  <div class="express-route">
    <template v-if="routeData">
      <section class="express-route-map">
        <netc-route-map :routeData="routeData" />
      </section>
      <section class="express-route-three">
        <div v-for="(item, i) in routeData.routeNodeVos" :key="i" :class="`route-three-item ${i === 0 ? 'first': ''}`">
          <section :class="`route-three-item-label ${styles[item.nodeStatus]}`">
            {{ item.nodeName }}
          </section>
          <section class="route-three-item-detail">
            <div v-for="(child, k) in item.nodeList" :key="k" :class="`detail-item`">
              <div class="detail-item-icon">
                <div class="detail-item-icon-unit">
                  <ky-icon type="iconexpress-route-icon" />
                  <!-- <ky-icon :type="statusIcon[child.icon]" /> -->
                </div>
              </div>
              <div class="detail-item-content">
                <div class="detail-item-date">
                  <span>{{ child.date }}</span>
                </div>
                <div class="detail-item-desc">
                  {{ child.desc }}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </template>
    <template v-else>
      <exress-nodate text="回单路由"/>
    </template>
  </div>
</template>

<script>
import { KyIcon } from '@comps'
import NetcRouteMap from '../../netc-route-map'
import ExressNodate from './express-nodata'
export default {
  props: {
    /** 运单号 */
    routeData: Object
  },
  components: { KyIcon, NetcRouteMap, ExressNodate },
  data() {
    return {
      styles: {
        0: 'warn',
      },
      // routeNodeVos: [
      //   {
      //     nodeName: '待揽件',
      //     nodeStatus: 1,
      //     nodeList: [
      //       {
      //         date: '2021-09-29 11:28:34',
      //         desc: '快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1',
      //         icon: 'node-start'
      //       }
      //     ]
      //   },
      //   {
      //     nodeName: '派送签收',
      //     nodeStatus: 1,
      //     nodeList: [
      //       {
      //         date: '2021-09-29 11:28:34',
      //         desc: '快件已由销售管理部揽件完毕1',
      //         icon: 'node-process'
      //       },
      //     ]
      //   },
      //   {
      //     nodeName: '派送异常',
      //     nodeStatus: 0,
      //     nodeList: [
      //       {
      //         date: '2021-09-29 11:28:34',
      //         desc: '由于【疫情道路限制】导致快件未及时派送，请您耐心等待',
      //         icon: 'node-process'
      //       },
      //       {
      //         date: '2021-09-29 11:28:34',
      //         desc: '已安装前往客户片区，调度人【欧阳明月】',
      //         icon: 'node-process'
      //       },
      //       {
      //         date: '2021-09-29 11:28:34',
      //         desc: '已安装前往客户片区，调度人【欧阳明月】',
      //         icon: 'node-process'
      //       }
      //     ]
      //   },
      //   {
      //     nodeName: '运输中',
      //     nodeStatus: 1,
      //     nodeList: [
      //       {
      //         date: '2021-09-29 11:28:34',
      //         desc: '快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1',
      //         icon: 'icon-parse-address'
      //       }
      //     ]
      //   },
      //   {
      //     nodeName: '运输中',
      //     nodeStatus: 1,
      //     nodeList: [
      //       {
      //         date: '2021-09-29 11:28:34',
      //         desc: '快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1快件已由销售管理部揽件完毕1',
      //         icon: 'node-plane-end'
      //       }
      //     ]
      //   }
      // ],
      routeNodeVos: [],
      statusIcon: {
        /** 起飞图标 */
        'node-plane-start': 'iconexpress-route-icon',
        /** 飞机降落 */
        'node-plane-end': 'icon-parse-address',
        /** 第一个节点 */
        'node-start': 'iconexpress-route-icon',
        /** 最后一个节点 */
        'node-end': 'iconfind-material',
        /** 其余节点 */
        'node-process': 'iconpaijianzhong'
      }
    }
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
