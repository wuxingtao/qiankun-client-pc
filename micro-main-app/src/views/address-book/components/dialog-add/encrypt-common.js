import { mapGetters } from 'vuex'

export default{
  data(){
    return{
      menuText:''
    }
  },
  methods: {
    showEncryptInput(fieldName){
      return this.encryptField[fieldName].visible
    },
    resetEncryptVisible(){
      if(!this.isEncryptField){
        return
      }
      this.encryptFields.forEach(k=>{
        this.encryptField[k].visible = this.encryptField[k].value && true
      })
    },
    setEncryptVisibleBySelectAddress(){
      this.$nextTick(()=>{
        if(!this.isEncryptField){
          return
        }
        this.encryptFields.forEach(k=>{
          this.encryptField[k].visible = this.encryptField[k].value && true
        })
      })
    }
  },
  computed:{
    ...mapGetters(['isEncryptField']),
    encryptFields(){
      return Object.keys(this.encryptField)
    }
  },
  watch:{
    menuText(text){
      this.encryptFields.forEach(k=>{
        this.encryptField[k].menuText = text
      })
    }
  }
}