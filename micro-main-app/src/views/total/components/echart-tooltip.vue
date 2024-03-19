<template>
    <div class="tooltip">
        <div>{{title}}</div>
        <div>
            <span class="tooltip-icon"></span><span>{{number}}</span>
        </div>
    </div>
</template>

<script>
export default {
  name: "echart-tooltip",
  props:{
    title: [String],
    number: [Number,String]
  }
}
</script>

<style scoped lang="scss">
    .tooltip{
        position: absolute;
        border-style: solid;
        white-space: nowrap;
        z-index: 9999999;
        transition: left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s;
        background-color: rgb(255, 255, 255);
        border-width: 0px;
        border-color: rgb(51, 51, 51);
        border-radius: 4px;
        color: rgb(0, 0, 0);
        font-size: 14px;
        padding: 5px;
        left: 480px;
        top: 52px;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 5px;
        pointer-events: none;"
        .tooltip-icon{
        display:inline-block;
        margin-right:5px;
        border-radius:10px;
        width:10px;
        height:10px;
        background-color:#61A2FF;
    }
    }

</style>
