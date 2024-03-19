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
            <div :class="`detail-item`">
              <div class="detail-item-icon">
                <div class="detail-item-icon-unit">
                  <ky-icon type="iconexpress-route-icon" />
                  <!-- <ky-icon :type="statusIcon[item.icon]" /> -->
                </div>
              </div>
              <div class="detail-item-content">
                <div class="detail-item-date">
                  {{ item.date }}
                </div>
                <div class="detail-item-desc">
                  {{ item.desc }}
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
        1: ''
      },
      routeNodeVos: [
        {
          nodeName: '待揽件',
          nodeStatus: 1,
          icon: 'node-end',
          desc: '快件已由王二柱签收，感谢使用跨越速运，期盼再次为您服务！',
        },
        {
          nodeName: '待揽件',
          nodeStatus: 1,
          icon: 'node-process',
          desc: '快件已由王二柱签收，感谢使用跨越速运，期盼再次为您服务！',
        },
        {
          nodeName: '待揽件',
          nodeStatus: 1,
          icon: 'node-end',
          desc: '快件已由王二柱签收，感谢使用跨越速运，期盼再次为您服务！',
        },
        {
          nodeName: '待揽件',
          nodeStatus: 1,
          icon: 'node-end',
          desc: '快件已由王二柱签收，感谢使用跨越速运，期盼再次为您服务！',
        },
      ],
      // routeNodeVos: [],
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
