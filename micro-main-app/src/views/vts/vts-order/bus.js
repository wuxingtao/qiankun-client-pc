import Vue from 'vue'
//定义一个bus总线，事件总线 ，。 在兄弟组件共享数据的时候用
var bus = new Vue()
//导出
export default bus;