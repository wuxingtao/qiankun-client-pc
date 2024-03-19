/**
 * @Desc: total
 * @Author: panboren
 * @Date: 2021/6/28
 */

export default  {
  path: '/dashboard' ,
  name: 'dashboard' ,
  component: () => import(/* webpackChunkName: 'dashboard' */ '../views/total/total-show/index')
}
