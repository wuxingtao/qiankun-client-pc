<template>
    <div class="legend-list">
        <ul class="legend-list-content">
            <li class="legend-list-item" v-if="Object.keys(title).length>0">
                                       <span class="legend-list-item-left">
                                           <span class="legend-list-text" style="padding: 0;">{{title.label}}</span>
                                       </span>
                <span class="legend-list-item-right">{{title.value}}</span>
            </li>
            <li class="legend-list-item legend-list-item1" :class="{'is-active': active===item.label}" v-for="(item,index) in data" :key="index" @click="$emit('change',{item,index})">
                                       <span class="legend-list-item-left">
                                           <img :src="item.url" class="url" v-if="item.url" />
                                            <i class="legend-list-icon" :style="{'background':item.color}" v-else></i>
                                           <span class="legend-list-text">{{item.label}}</span>
                                       </span>
                                       <el-popover
                                        v-if="tooltip"
                                        placement="top"
                                        trigger="hover"
                                        :content="item.valueOld"
                                       >
                                           <span slot="reference" class="legend-list-item-right">{{item.value}}</span>
                                       </el-popover>
                                       <span v-else class="legend-list-item-right">{{item.value}}</span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  name: "legend-list",
  props:{
    data:{
      type: Array,
      default:()=>[]
    },
    title:{
      type: Object,
      default:()=>({})
    },
    active:[String,Number],
    tooltip: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped lang="scss">
  .legend-list{
      position: relative;
      .legend-list-content{
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          list-style: none;
          .legend-list-item{
              display: flex;
              justify-content: space-between;
              align-items: center;
              list-style: none;
              width: 100%;
              padding: 5px;
              cursor: pointer;
              .legend-list-item-left{
                  display: inline-flex;
                  align-items: center;
                //   width: 100px;

                .url {
                    width: 24px;
                    height: 24px;
                }

                  .legend-list-icon{
                      display: inline-block;
                      width: 10px;
                      height: 10px;
                      background: red;
                      border-radius: 50%;
                  }
                  .legend-list-text{
                      white-space:nowrap;
                      padding: 0 0 0 5px;
                  }
              }
              .legend-list-item-right{
                  padding: 0 5px;
              }
          }
          .legend-list-item1{
              padding: 2px;
              &:hover{
                  color: #8153fa;
              }
              &.is-active{
                  color: #6e47d4;
              }
          }

      }
  }


</style>
