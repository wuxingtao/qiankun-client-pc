import { http } from './request'

// NOTE: 50243 是直接使用的地图的appkey
const appkey = 50243

/**
 * 获取车辆实时位置
 */
export const getCarLocation = params => {
  return http('map.bustrack.carbq.realtime.location.search', params, { appkey, toast: false })
}

/**
 * 获取车辆实时纠偏轨迹
 */
export const fetchTrackWithNav = params => {
  return http('map.tracloud.track.vehicle.realtime.correct.fetchTrackWithNav', params, { appkey, toast: false })
}

/**
 * 路径规划
 */
export const getNavigation = (startLngLat, endLngLat) => {
  return http(
    'map.apiservice.autowpts.navigation',
    {
      waypoints: [
        { coords: startLngLat, sort: 0 },
        { coords: endLngLat, sort: 1 },
      ],
    },
    { appkey, toast: false }
  )
}
