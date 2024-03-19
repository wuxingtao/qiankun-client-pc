<template>
  <div class="mj-way-template__container">
    <div class="img__wrapper">
      <el-tooltip placement="right" effect="light" :disabled="!(item.value&&item.value.trim())">
        <img :class="['img-thumbnail',item.value&&item.value.trim()?'':'none']" :src="getItemImg()" />
        <div slot="content">
          <img class="img-preview" :src="getItemImg()" />
        </div>
      </el-tooltip>
    </div>
    <div class="text__wrapper">
      <div>{{item.label}}</div>
      <div>{{getItemProp('desc')}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      typeof: Object,
      default: () => { return {} }
    }
  },
  setup(props) {
    const itemList = [
      {value:'10',desc:'按个收费',imgName:'wooden-pallet'},
      {value:'20',desc:'按体积收费',imgName:'wooden-shelf'},
      {value:'30',desc:'按体积收费',imgName:'wooden-box'},
      {value:' ',imgName:'wooden-none'}
    ]
    
    const getItemImg= ()=>{
      const imgName = getItemProp('imgName')
      return require( `@/assets/image/delivery/${imgName}.png`)
    }

    const getItemProp = prop =>{
      const info = itemList.find(f=>f.value === props.item.value)
      return info&&info[prop] || ''
    }
    return{
      getItemProp,
      getItemImg
    }
  }
}
</script>


<style lang="scss" scoped>
.mj-way-template__container{
  display: flex;
  padding: 8px 0;
  .img__wrapper{
    width: 50px;
    height: 50px;
    padding: 4px;
    box-sizing: border-box;
    margin-right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border: 1px solid #eef1ff;
    border-radius: 4px;
    .img-thumbnail{
      width: 100%;
      height: 100%;
      &.none{
        width: 26px;
        height: 26px;
      }
    }
    .img-preview{
      width: 264px;
      height: 264px;
    }
  }
  .text__wrapper{
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #999999;
    &>div{
      line-height: 1;
      &:first-of-type{
        font-size: 14px;
        font-weight: bold;
        color: #03050d;
      }
      &:last-of-type{
        padding-top: 8px;
      }
    }
  }
}

</style>