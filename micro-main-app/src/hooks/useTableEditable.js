export default function(){
  const getCellErrorMsg = ({row,col,prop})=>{
    prop = prop || col?.prop
    return row[prop].errorInfo.msg
  }
  const getCellWariningMsg = ({row,col,prop})=>{
    prop = prop || col?.prop
    return row[prop].warningInfo.msg
  }

  return{
    getCellErrorMsg,
    getCellWariningMsg
  }
}