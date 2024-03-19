/**
 * @Desc: StorageBase
 * @Author: wu xingtao
 * @Date: 2021/11/13
 */


class StorageBase {
  constructor ({key,sessionName}) {
    this.key = key
    this.sessionName = sessionName
  }
  _getJsonValue(){
    return JSON.parse(sessionStorage.getItem(this.sessionName) || '[]')
  }
  _setJsonValue(value){
    sessionStorage.setItem(this.sessionName,JSON.stringify(value))
  }
  _hasOneIndex(id){
    const lists = this._getJsonValue()
    return lists.findIndex(item=>item.id === id)
  }
  getById(id){
    const lists = this._getJsonValue()
    return lists.find(item=>item.id === id)
  }
  setById(id,value){
    const lists = [...this._getJsonValue()]
    const idIndex = this._hasOneIndex(id)
    if(idIndex !== -1){
      lists[idIndex].value = value
    }else{
      lists.push({
        id: id,
        value
      })
    }
    this._setJsonValue(lists)
  }
}



export default StorageBase
