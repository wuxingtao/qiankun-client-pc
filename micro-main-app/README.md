## 项目简介

web 电子运单

## 运行

安装
1 npm(cnpm) install

开发
2 npm run serve

发布测试环境
3 npm run test

发布正式环境
4 npm run build

## 分支说明

dev 发布 uat 环境分支，包含线上功能、未上线功能

test 线上版本分支，所有新功能应在此分支基础上开发

## 技术栈：Vue + Vuex + Vue-router + Element-UI

> - Vue : (https: //cn.vuejs.org/v2/guide/)
> - Vue-Cli: (https: //cli.vuejs.org/zh/guide/)
> - UI: (https://element.eleme.cn/2.0/#/zh-CN)

## 项目规范

> 放置图片文件夹统一名命 image
> views 下面的 vue 文件代表着页面的名字, 放置在业务模块文件夹 (order:模块 -> orderList.vue)
> 模块文件夹必须是名词 (order)
> 只有一个文件的情况下不会出现文件夹，而是直接放在 views 目录下面，如 Login Home
> 开头的单词就是所属模块名字（orderDetail、orderEdit、orderList）
> 代表着页面的名字至少两个单词（good: orderDetail）（bad: order）
> 常用结尾单词有（Detail、Edit、List、Info、Report）

## vue 方法放置顺序

1.  components
2.  props
3.  data
4.  created
5.  mounted
6.  activited
7.  update
8.  beforeRouteUpdate
9.  metods
10. filter
11. computed
12. watch

## 项目结构

```
  ├── public
  │   └── favicon.ico          # Favicon
  │   └── index.html           # 项目模板
  ├── src
  │   ├── assets               # 本地静态资源
  │   │   ├── js               # js
  │   │   ├── image            # image
  │   │   ├── scss             # scss
  │   ├── components           # 通用组件 (和业务无关,单一功能 例如: 按钮, 步骤, 输入框)
  │   ├── common               # 应用公用配置，如导航信息, 认证, 货物跟踪地图
  │   ├── routes               # 业务页面入口
  │   ├── utils                # 工具库
  │   │   ├──permission.js     # 页面拦截器
  │   ├── views                # 业务组件, 根据导航栏划分
  │   ├── services             # 后台接口服务
  │   │   ├──api               # 接口 (根据接口分类区分,避免不同模块复用接口多据点)
  │   │   │  ├── address.js    # 地址
  │   │   │  └── eawb.js       # 运单
  │   │   └── request.js       # 请求拦截
  │   └── main.js              # 应用入口
  ├── README.md                # 项目说明文件
  ├── vue.config.js            # vue配置文件
  └── package.json
```

## 团队

### 开发

> - 开发团队：互联网部-前端组
> - 开发人员：黄顺兰、徐业奇

### 产品

> - 产品团队：互联网部-官网
> - 产品人员：陆西、徐剑锋
> - 联系方式：18929380156(tel) 1053829472(QQ)

### UI

> - 交互设计：高玉姣
> - 视觉设计：童希
> - 联系方式：18929380156(tel) 3198965305(QQ)
