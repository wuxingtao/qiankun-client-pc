import { parseJson } from '@utils/commonUtil'
import { v4 as uuidv4 } from 'uuid'
class PrinterWebsocket {
  constructor() {
    this.socket = null
  }

  /**
   * 创建websocket客户端
   * @param {String} url websocket服务器地址
   * @param {Function} receiveMsgFunc 接收服务器消息函数
   */
  createSocket(url, receiveMsgFunc) {
    const WsImpl = window.WebSocket || window.MozWebSocket
    const promise = new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== 1) {
        console.log('正在创建websocket连接')
        this.socket = new WsImpl(url)
        this.socket.onopen = (e) => {
          resolve(true)
          console.log('this.socket.onopen ', e)
        }
        this.socket.onmessage = (e) => {
          // console.log('Socket.onmessage ',e,receiveMsgFunc)
          receiveMsgFunc && receiveMsgFunc(e.data)
        }
        this.socket.onerror = (e) => {
          reject(e)
          console.log('this.socket.onerror', e)
          this.socket.close()
          this.socket = null
        }
        this.socket.onclose = (e) => {
          reject(e)
          console.log('this.socket.onclose', e)
        }
      } else {
        resolve(true)
        console.log('websocket已连接')
      }
    })
    return promise
  }

  /**
   * 发送消息
   * @param {String} message 需要发送至服务器的消息
   */
  async sendMessage(message) {
    if (!this.socket) {
      console.log('sendMessage fail :>> ', this.socket)
      return
    }
    for (let i = 0; i < 3; i++) {
      if (this.socket.readyState === 1) {
        break
      }
      console.log('this.socket.readyState :>> ', this.socket.readyState)
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
    if (this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(message))
      return true
    }
    console.log('sendMessage fail :>> ', this.socket)
  }

  /**
   * 发送并接口数据
   * @param {Object} sendData 发送数据
   * @param {Function} receiveMsgFunc 接收数据函数
   */
  async sendAndReceiveData(sendData, receiveMsgFunc) {
    if (!this.socket || this.socket.readyState === 3) {
      await this.createSocket('ws://localhost:51234', receiveMsgFunc)
    }
    this.socket.onmessage = (e) => {
      const data = parseJson(e.data) || e.data
      receiveMsgFunc && receiveMsgFunc(data)
    }
    setTimeout(() => {
      this.sendMessage(sendData)
    }, 500)
  }

  getPrintAppId(cb) {
    this.sendAndReceiveData({ msgType: 'GET_APP_ID' }, (data) => {
      cb(data && data.appId)
    })
  }

  /**
   * 检查打印机组件是否在线
   * @param {String}} id 打印机组件Id
   * @returns
   */
  checkPrintAppOnline(printAppId) {
    const promise = new Promise((resolve) => {
      const cb = (id) => {
        const isOnline = id === printAppId
        const reslut = {
          isOnline,
          msg: isOnline ? '' : '打印组件不在线，请确认是否已开启该打印组件',
        }
        resolve(reslut)
      }
      this.getPrintAppId(cb)
      setTimeout(() => {
        resolve({
          isOnline: false,
          msg: '打印组件不在线，请确认是否已开启该打印组件',
        })
      }, 1500)
    })
    return promise
  }

  /**
   * 检查打印组件默认打印机
   * @returns 如果不存在默认打印机，则返回相应提示语句
   */
  checkPrintAppDefaultPrinter() {
    const promise = new Promise((resolve) => {
      this.sendAndReceiveData({ msgType: 'CHECK_DEFAULT_PRINTER' }, (data) => {
        const msg = data && data.msg
        resolve({msg})
      }) 
      setTimeout(() => {
        resolve({ msg: '打印组件不在线，请确认是否已开启该打印组件'})
      }, 1500)
    })
    return promise
  }

  /**
   * 打印运单
   * @param {Object} waybillData 运单打印数据
   * @returns 
   */
  printWaybill(waybillData) {
    const promise = new Promise((resolve, reject) => {
      const taskId = uuidv4()
      // waybillData.templateData['jjNote']=''
      const sendData = {
        msgType: 'PRINT_NEW_TASK',
        msgData: {
          taskId,
          templateId: waybillData.templateId,
          templateType: waybillData.templateType,
          templateData2:waybillData.templateData,
          templateData: waybillData.templateData,
        }
      }
      this.sendAndReceiveData(sendData, data => {
        if(data&&data.taskId === taskId){
          data.msg?reject(data.msg) : resolve()
        } 
        console.log('data :>> ', data)
      })
      setTimeout(() => {
        resolve({ msg: '打印组件不在线，请确认是否已开启该打印组件'})
      }, 5000)
    })
    return promise
  }
}

export default new PrinterWebsocket()
