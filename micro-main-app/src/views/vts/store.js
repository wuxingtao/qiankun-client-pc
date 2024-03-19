import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    // State:一个全局的数据仓，里面存放着数据源 ------页面获取数据 this.$store.state.test
    state: {
        _carInfo: {}, // 车型信息
        _transportInfo: {}, // 里程时效信息
        _featureInfo: {}, // 地址解析信息
        _againOrderDetailInfo: {}, // 再来一单信息
    },
    // Getter:用来在获取数据源的时候，对数据源进行一定的加工后再返回。----页面获取数据 {{this.$store.getTest}}
    getters: {
        getCarInfo (state) {
            return state._carInfo;
        },
        getTransportInfo (state) {
            return state._transportInfo;
        },
        getFeatureInfo (state) {
            return state._featureInfo;
        },
        getAgainOrderDetailInfo (state) {
            return state._againOrderDetailInfo;
        }
    },
    // Mutation:对数据仓中的数据，进行修改。Mutation只支持[同步方法]！！！-----this.$store.commit("changeTest")
    mutations: {
        changeCarInfo (state, payload) {
            state._carInfo = payload
        },
        changeTransportInfo (state, payload) {
            state._transportInfo = payload
        },
        changeFeatureInfo (state, payload) {
            state._featureInfo = payload
        },
        changeAgainOrderDetailInfo (state, payload) {
            state._againOrderDetailInfo = payload
        }
    },
    // Action：和Mutation类似，区别在于：1、Action提交的是mutation，而不是直接变更状态。2、Action可以包含任意异步操作。
    actions: {
    }
})

export default store;