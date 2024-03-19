<template>
    <div class="list-card">
        <el-form label-width="125px">
            <el-row :gutter="40">
                <el-col :span="8" class="card-item_wrap">
                    <el-form-item label="公司名称：" style="margin-bottom: 15px;">
                        <div class="card-item-label">{{client.paymentCustomerName || user.customerName }}</div>
                    </el-form-item>
                </el-col>
                <el-col :span="8" class="card-item_wrap">
                    <el-form-item label="优惠折扣：" style="margin-bottom: 15px;">
                        <div class="card-item-label">
                           {{client.discountRate || 0}}%
                        </div>
                    </el-form-item>
                </el-col>
                <el-col :span="8" class="card-item_wrap">
                    <el-form-item label="可用余额（元）：" style="margin-bottom: 15px;">
                        <div class="card-item-label">
                         ¥&nbsp;{{client.currentAmount || 0}}
                        </div>
                    </el-form-item>
                </el-col>
                <el-col :span="8" class="card-item_wrap">
                    <el-form-item label="市场员：" style="margin-bottom: 15px;">
                        <div class="card-item-label">
                            {{client.marketer || user.marketName }}
                        </div>
                    </el-form-item>
                </el-col>
                <el-col :span="8" class="card-item_wrap">
                    <el-form-item label="开卡时间：" style="margin-bottom: 15px;">
                        <div class="card-item-label">
                               {{(client.devDate ) | formatdate}}
                        </div>
                    </el-form-item>
                </el-col>
                <el-col :span="8" class="card-item_wrap">
                    <el-form-item label="备注：" style="margin-bottom: 15px;">
                        <div class="card-item-label">
                            {{client.remark}}
                        </div>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>
<script>
import * as time from '@/utils/formatDate'
let FormatDate = time.default
import {getUserData} from "@/utils/storage"
import { getByCustomerName} from '@/services/api/customer'
export default {
  data() {
    return {
      client: {
      },
      user: {}
    }
  },
  created () {
    let user = getUserData()
    if(user){
      this.user = user.customerInfo
    }
    this.getByCustomerName()
  },
  filters: {
    formatdate (val) {
      if(val){
        return FormatDate.date(val)
      }
    }
  },
  methods: {
    async getByCustomerName () {
      const res = await getByCustomerName()
      if (res.code === 0) {
        this.client = res.data
      }
    },
  }
}
</script>
<style lang="scss" scoped>
    .list-card {
        .card-item_wrap {
            .card-item-label {
                width: 100%;
                border-radius: 18px;
              /*  background: #eef3fc;*/
                padding: 0 15px;
                height: 40px;
                background-color: #F5F7FA;
                border-color: #E4E7ED;
                color: #C0C4CC;
                cursor: not-allowed;
            }
        }
    }
</style>
