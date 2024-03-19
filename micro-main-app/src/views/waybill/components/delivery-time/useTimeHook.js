/**
 * @Desc: timeHook
 * @Author: wu xingtao
 * @Date: 2021/11/26
 */

const fullHourArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const fullMinuteArray = [0, 15, 30, 45]

export default function () {
  const hourFilter = (min) => {
    return fullHourArray.filter(item => item >= min)
  }

  const minuteFilter = (min) => {
    return fullMinuteArray.filter(item => item >= min)
  }

  return {
    hourFilter,
    minuteFilter,
    fullMinuteArray,
    fullHourArray
  }
}
