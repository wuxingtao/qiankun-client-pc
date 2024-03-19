<template>
  <div class="card-title-container">
    <div class="title">{{title}}
      <el-tooltip placement="top" effect="light" popper-class="el-tooltip-report-card-title" :disabled="!tableData||tableData.length<1" :open-delay="300">
        <div slot="content">
          <el-table :data="tableData" style="width: 100%" :height="tableData.length > 5 ? 400 : 'auto'">
            <el-table-column prop="title" label="指标">
            </el-table-column>
            <el-table-column prop="content" label="说明" width="250px">
            </el-table-column>
          </el-table>
        </div>
        <svg-icon icon-class="icon-question-gray" style="padding-left:4px;color:#8365F6;" />
      </el-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      require: true
    }
  },
  computed: {
    tableData () {
      switch (this.title) {
        case '费用概况':
          return [
            { title: '应付费用', content: '在您的查询时间范围内，您产生的所有支出费用；' },
            { title: '运单运费', content: '在您的查询时间范围内，您所下单的所有运单产生的运单费用；' },
            { title: '总增值费', content: '在您的查询时间范围内，您所下单的所有运单所附带的增值费用，如打木架服务费等；' },
            { title: '优惠金额', content: '在您的查询时间范围内，您所使用的所有有效优惠券总金额；' },
            { title: '另补税金', content: '在您的查询时间范围内，您所下单的所有运单产生的补税金总额；' },
            { title: '单票均价', content: '单票均价=应付费用 / 发货总票数，其中已剔除服务方式为整车的运单；' }
          ]
        case '快件实时动态':
          return [
            { title: '总票数', content: '统计最近30天，您所有已报单的运单总票数，包括待取货、运输中、派送中、已签收、异常的运单；' },
            { title: '待取货', content: '统计最近30天，当前处于您已下单但是司机还未上门取货的运单；' },
            { title: '运输中', content: '统计最近30天，当前处于从司机上门取货后到快件准备进行派送的运单；' },
            { title: '派送中', content: '统计最近30天，当前处于准备派送环节的运单；' },
            { title: '已签收', content: '统计最近30天，当前处于客户成功签收的运单；' }
          ]
        case '快件统计':
          return [
            { title: '发货总票数', content: '在您的查询时间范围内，您所有已报单的运单总票数，包括运输中、派送中、已签收、异常的运单；' },
            { title: '发货总件数', content: '在您的查询时间范围内，您所有已报单的运单总件数，包括运输中、派送中、已签收、异常的运单；' },
            { title: '寄付', content: '在您的查询时间范围内，付款方式为寄付的所有运单总数量；' },
            { title: '到付', content: '在您的查询时间范围内，付款方式为到付的所有运单总数量；' },
            { title: '第三方付', content: '在您的查询时间范围内，付款方式为第三方付的所有运单总数量；' },
            { title: '回单量', content: '在您的查询时间范围内，所有选择了回单服务与回单份数的运单总数量；' },
            { title: '异常', content: '表示该运单在运输过程中发生异常，导致运输中止或延期的运单；' }
          ]
        case '整体妥投分析':
          return [
            { title: '妥投', content: '在您的查询时间范围内，若快件被成功签收，则为妥投；' },
            { title: '妥投时长', content: '妥投时长 = 运单签收时间 - 报单时间；' },
            { title: '妥投率', content: '妥投率 = 已签收运单总票数 / 已发货运单总票数，其中已剔除作废运单；' },
            { title: '总票数', content: '在您的查询时间范围内，满足对应查询条件的发货运单总票数；' }
          ]
        case '时效内妥投分析':
          return [
            { title: '时效内妥投', content: '在您的查询时间范围内，若快件在与贵司约定好的时间内被成功签收，则为时效内妥投；' },
            { title: '妥投时长', content: '妥投时长 = 运单签收时间 - 报单时间；' },
            { title: '妥投率', content: '妥投率 = 已签收运单总票数 / 已发货运单总票数，其中已剔除作废运单；' },
            { title: '总票数', content: '在您的查询时间范围内，满足对应查询条件的发货运单总票数；' }
          ]
        case '流向分析':
          return [
            { title: '总票数', content: '在您的查询时间范围内，满足对应省市线路或收件公司的运单总票数；' },
            { title: '总件数', content: '在您的查询时间范围内，满足对应省市线路或收件公司的运单总件数；' },
            { title: '总重量', content: '在您的查询时间范围内，满足对应省市线路或收件公司的运单总重量；' }
          ]
        case '货物重量':
          return [{ title: '货物重量', content: '在您的查询时间范围内，满足对应货物重量区间的发货运单总票数；' }]
        case '时效分析报表':
          return [
            { title: '总票数', content: '统计在查询时间范围内我发出的/我收到的所有运单号数据汇总；' },
            { title: '总重量', content: '统计在查询时间范围内我发出的/我收到的所有运单号对应的经营重量数据汇总；' },
            { title: '线路', content: '统计总票数所有运单号对应的始发城市-目的城市（城市ID维度）的去重组合；' },
            { title: '内部履约率', content: '1. 内部履约率=100%-（总超时率-外因影响率）；2. 内因超时判断逻辑：总超时票中，运单未派原因（11种）归于公司原因的单据；' },
            { title: '外因影响率', content: '1. 外因影响率=外因超时票/总票数*100%；2. 从总超时票中，取超时原因为：未派原因中客户原因（21种）+不可抗力的合计去重票数/总票数；' },
            { title: '总超时率', content: '1. 总超时率=总超时票/总票数*100%；2. 外部超时判断逻辑：取运单签到/签收时间与客户时效（若有）或派送时效对比；3. 内控超时判断逻辑：取运单签到/签收时间与内控时效（若有）或派送时效对比；' },
            { title: '寄-签耗时（票占比）', content: '(签到或签收时间-寄件时间)在不同时间范围内的票数/取数总票数；' },
            { title: '超时分析（票占比）', content: '超时单据在不同超时原因下的票数/取数条件下的超时总票数；' },
            { title: '拉货', content: '1. 拉货=拉货票数/总超时票*100%；2. 拉货票数：在总超时票端运单基础上判断有无拉货包含全拉、部拉、全拉退货、部拉退货；' },
            { title: '提货耗时长', content: '1. 提货耗时长=提货耗时长票数/总超时票*100%；2. 提货耗时长票数：在总超时票数的运单基础上判断跟飞首票出货时间减去实际落地时间超过2h，排除运输模式=陆运；' },
            { title: '派干耗时长', content: '1. 派干耗时长票数/总超时票*100%；2. 派干耗时长票数：在总超时票的运单基础上判断运单提货时间不为空，且提货时间90分钟内是否有录【干线管理】，如无录则为派干耗时长；如有录则在判断提货时间+90分钟<干线发车时间，满足条件即为派干耗时长；' },
          ]
      }
    }
  }
}
</script>

<style lang="scss">
  @import "../scss/card.scss";
  .el-tooltip-report-card-title{
    .el-table  .el-table__body-wrapper {
      overflow-x: hidden;
      @include scroll-bar
    }
  }
</style>
<style lang="scss" scoped>
  .card-title-container {
    .title {
      font-size: 16px;
      font-weight: bold;
      white-space: nowrap;
    }
  }
</style>
