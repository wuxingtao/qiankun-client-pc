/**
 * @Desc: app
 * @Author: wu xingtao
 * @Date: 2022/5/5
 */
const apps = [
  {
    name: 'VueMicroApp',
    entry: '//localhost:10200',
    container: '#frame',
    activeRule: '/admin/Vue', // 激活的路径
    // 通过 props 将 shared 传递给子应用
    // props: { shared }
  },
]

export default apps
