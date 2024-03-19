# upload-order-file

# 上传资料

使用方式

```html
<upload-order-file ref="uploadOrderFile" @save="handleSave" />
```

```js
{
  methods: {
    handleSave(formData) {
      console.log(formData)
    },
    // 显示弹窗
    handleUploadPickupInfo(ydNo) {
      this.$refs.UploadPickupFile.showDialog({
        reserveInfo: ['4010', '4020', '4030'], // 显示类型 '4010': 仅显示上传资料、'4020': 仅显示预约时间、'4030': 仅显示预约号、['4010', '4020', '4030']: 显示上传资料、预约号、预约时间
        warehouseType: '40', // 仓库类型
        waybillNo: ydNo, // 运单号
        startDate: '2021-03-07', // 预约时间开始时间
        endDate: '2021-09-07', // 预约时间结束时间
        appointDate: '2021-09-07', // 预约时间
        appointNumber: '123123123', // 预约号
        address: '广东省深圳市宝安区航站四路深航航空公司', // 详细地址
        company: '跨越速运集团', // 收件公司
      })
    },
  }
}
```
