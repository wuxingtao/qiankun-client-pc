import { affectEnum } from '@/views/waybill/enum/affectEnum'

// 图片和类型映射关系
export const affect = new Map([
  [affectEnum.PANDEMIC, 'pandemic'], // 疫情
  [affectEnum.STORM, 'typhoon'], // 台风天气
  [affectEnum.SNOW, 'rain_snow'], // 雨雪天气
  [affectEnum.RAIN, 'flood_season'], // 汛期影响
  [affectEnum.HOLIDAY, 'holiday'], // 假期影响
  [affectEnum.SPRING_TRAVEL, 'spring_festival'], // 春运期间
  [affectEnum.MEETING, 'meeting'], // 国际大型会议
  [affectEnum.OTHER, 'other'], // 其他
  [affectEnum.CUSTOM, 'customs_warehousing'] // 其他
])
