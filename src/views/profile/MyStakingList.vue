<template>
<div class="tea-page">


  <div style="display:flex; justify-content: flex-end;">
    <el-button style="width:40%;margin-top: 40px;" type="primary" @click="openInvolveStakingModal()">Involve Staking</el-button>
  </div>
</div>
</template>
<script>
import SettingAccount from '../../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
export default {
  data(){
    return {
      
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  
  async mounted(){
    this.wf = new SettingAccount();
    await this.wf.init();
  },

  methods: {
    async openInvolveStakingModal(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Involve Staking',
          pallet: 'cml',
          tx: 'startStaking',
          text: 'If no staking cml, means use 1000 TEA to staking.',
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            const tx = api.tx.cml.startStaking(form.staking_to, form.staking_cml);
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshList();
            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },

    async refreshList(){

    }
    

    
  }

  
}
</script>