import { computed, ref ,nextTick,watch} from '@vue/composition-api'

export default function({vm,encryptField}){
  const menuText = ref('')
  const encryptFields = computed(()=>Object.keys(encryptField))
  
  watch(menuText,text=>{
    console.log('text :>> ', text)
    encryptFields.value.forEach(k=>{
      encryptField[k].menuText = text
    })
  })

  const showEncryptInput = fieldName=>{
    return encryptField[fieldName].visible
  }
  const resetEncryptVisible =()=>{
    if(!vm.$store.getters.isEncryptField){
      return
    }
    encryptFields.value.forEach(k=>{
      encryptField[k].visible = encryptField[k].value && true
    })
  }

  const setEncryptVisibleBySelectAddress =() =>{
    nextTick(()=>{
      if(!vm.$store.getters.isEncryptField){
        return
      }
      encryptFields.value.forEach(k=>{
        encryptField[k].visible = encryptField[k].value && true
      })
    })
  }

  
  return{
    menuText,
    showEncryptInput,
    resetEncryptVisible,
    setEncryptVisibleBySelectAddress
  }
}