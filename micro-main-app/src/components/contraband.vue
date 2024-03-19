<template>
  <!-- 违禁品 -->
  <ky-dialog title='违禁品' custom-class='contraband-dialog' :visible.sync='visibleFlag' append-to-body width='700px'>
    <el-scrollbar style='height: 500px;'>
      <div class='content'>
        <div class='content-title'>违禁品</div>
        <!--        <div class='content-desc'>-->
        <!--          航空违禁品主要是指威胁航空飞行安全的物品，指在航空运输中,可能明显地危害人身健康、安全或对财产造成损害的物品或物质。违反规定、隐瞒寄送违禁品，轻则会导致快递时效延误，重则会导致退货、扣货、甚至罚款。-->
        <!--        </div>-->
        <!--        <div class='content-category'>航空违禁品分类</div>-->
        <dl>
          <dt>1.枪支（含仿制品、主要零部件）弹药</dt>
          <dd>1)枪支（含仿制品、主要零部件）：如手枪、步枪、冲锋枪、防暴枪、气枪、猎枪、运动枪、麻醉注射枪、钢珠枪、催泪枪等。</dd>
          <dd>2)弹药（含仿制品）：如子弹、炸弹、手榴弹、火箭弹、照明弹、燃烧弹、烟幕（雾）弹、信号弹、催泪弹、毒气弹、地雷、手雷、炮弹、火药等。</dd>
          <dt>2.管制器具</dt>
          <dd>1)管制刀具：如匕首、三棱刮刀、带有自锁装置的弹簧刀（跳刀）、其他相类似的单刃、双刃、三棱尖刀等。</dd>
          <dd>2)其他：如弩、催泪器、催泪枪、电击器等。</dd>
          <dt>3.爆炸物品</dt>
          <dd>1)爆破器材：如炸药、雷管、导火索、导爆索、爆破剂等。</dd>
          <dd>2)烟花爆竹：如烟花、鞭炮、摔炮、拉炮、砸炮、彩药弹等烟花爆竹及黑火药、烟火药、发令纸、引火线等。</dd>
          <dd>3)其他：如推进剂、发射药、硝化棉、电点火头等。</dd>
          <dt>4.压缩和液化气体及其容器</dt>
          <dd>1)易燃气体：如氢气、甲烷、乙烷、丁烷、天然气、液化石油气、乙烯、丙烯、乙炔、打火机等。</dd>
          <dd>2)有毒气体：如一氧化碳、一氧化氮、氯气等。</dd>
          <dd>3)易爆或者窒息、助燃气体：如压缩氧气、氮气、氦气、氖气、气雾剂等。</dd>
          <dt>5.易燃液体</dt>
          <dd>如汽油、柴油、煤油、桐油、丙酮、乙醚、油漆、生漆、苯、酒精、松香油等。</dd>
          <dt>6.易燃固体、自燃物质、遇水易燃物质</dt>
          <dd>1)易燃固体：如红磷、硫磺、铝粉、闪光粉、固体酒精、火柴、活性炭等。</dd>
          <dd>2)自燃物质：如黄磷、白磷、硝化纤维（含胶片）、钛粉等。</dd>
          <dd>3)遇水易燃物质：如金属钠、钾、锂、锌粉、镁粉、碳化钙（电石）、氰化钠、氰化钾等。</dd>
          <dt>7.氧化剂和过氧化物</dt>
          <dd>如高锰酸盐、高氯酸盐、氧化氢、过氧化钠、过氧化钾、过氧化铅、氯酸盐、溴酸盐、硝酸盐、双氧水等。</dd>
          <dt>8.毒性物质</dt>
          <dd>如砷、砒霜、汞化物、铊化物、氰化物、硒粉、苯酚、汞、剧毒农药等。</dd>
          <dt>9.生化制品、传染性、感染性物质</dt>
          <dd>如病菌、炭疽、寄生虫、排泄物、医疗废弃物、尸骨、动物器官、肢体、未经硝制的兽皮、未经药制的兽骨等。</dd>
          <dt>10.放射性物质</dt>
          <dd>如铀、钴、镭、钚等。</dd>
          <dt>11.腐蚀性物质</dt>
          <dd>如硫酸、硝酸、盐酸、蓄电池、氢氧化钠、氢氧化钾等。</dd>
          <dt>12.毒品及吸毒工具、非正当用途麻醉药品和精神药品、非正当用途的易制毒化学品</dt>
          <dd>1)毒品、麻醉药品和精神药品：如鸦片（包括罂粟壳、花、苞、叶）、吗啡、海洛因、可卡因、大麻、甲基苯丙胺（冰毒）、氯胺酮、甲卡西酮、苯丙胺、安钠咖等。</dd>
          <dd>2)易制毒化学品：如胡椒醛、黄樟素、黄樟油、麻黄素、伪麻黄素、羟亚胺、邻酮、苯乙酸、溴代苯丙酮、醋酸酐、甲苯、丙酮等。</dd>
          <dd>3)吸毒工具：如冰壶等。</dd>
          <dt>13.非法出版物、印刷品、音像制品等宣传品</dt>
          <dd>如含有反动、煽动民族仇恨、破坏国家统一、破坏社会稳定、宣扬邪教、宗教极端思想、淫秽等内容的图书、刊物、图片、照片、音像制品等。</dd>
          <dt>14.间谍专用器材</dt>
          <dd>如暗藏式窃听器材、窃照器材、突发式收发报机、一次性密码本、密写工具、用于获取情报的电子监听和截收器材等。</dd>
          <dt>15.非法伪造物品</dt>
          <dd>如伪造或者变造的货币、证件、公章等。</dd>
          <dt>16.侵犯知识产权和假冒伪劣物品</dt>
          <dd>1)侵犯知识产权：如侵犯专利权、商标权、著作权的图书、音像制品等。</dd>
          <dd>2)假冒伪劣：如假冒伪劣的食品、药品、儿童用品、电子产品、化妆品、纺织品等。</dd>
          <dt>17.濒危野生动物及其制品</dt>
          <dd>如象牙、虎骨、犀牛角及其制品等。</dd>
          <dt>18.禁止进出境物品</dt>
          <dd>如有碍人畜健康的、来自疫区的以及其他能传播疾病的食品、药品或者其他物品；内容涉及国家秘密的文件、资料及其他物品。</dd>
          <dt>19.其他物品</dt>
          <dd>
            《危险化学品目录》《民用爆炸物品品名表》《易制爆危险化学品名录》《易制毒化学品的分类和品种目录》《中华人民共和国禁止进出境物品表》载明的物品和《人间传染的病原微生物名录》载明的第一、二类病原微生物等，以及法律、行政法规、国务院和国务院有关部门规定禁止寄递的其他物品。
          </dd>
        </dl>
      </div>
    </el-scrollbar>
    <div slot='footer' class='dialog-footer'>
      <el-button size='medium' type='primary' @click='visibleFlag = false'>我知道了</el-button>
    </div>
  </ky-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visibleFlag: false
    }
  },
  watch: {
    visible(val) {
      this.visibleFlag = val
    },
    visibleFlag(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang='scss'>
.contraband-dialog {
  .el-dialog__body {
    margin: 20px 0 0 !important;
  }
  
  .content {
    color: #333333;
    font-size: 12px;
    padding: 0 20px;
    
    .extend-style {
      text-align: justify;
    }
    
    .content-title {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      padding-bottom: 20px;
      @extend .extend-style;
    }
    
    .content-desc {
      color: #fc2020;
      line-height: 22px;
      @extend .extend-style;
    }
    
    dl {
      @extend .extend-style;
      
      dt {
        font-weight: bold;
        padding: 20px 0 8px;
        text-indent: 20px;
      }
      
      dd {
        line-height: 24px;
        color: #666666;
        text-indent: 20px;
      }
    }
  }
  
  .content-category {
    padding-top: 20px;
    font-weight: bold;
  }
}
</style>


