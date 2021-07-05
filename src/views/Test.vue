<template>
<div class="tea-page">
  <h4>STORAGE</h4>
  <div class="t-box">
    <el-button size="small" type="primary" @click="startMining">Plant for mining</el-button>
    <!-- <el-button size="small" type="primary" @click="queryMiner()">QUERY MINER</el-button>

    <el-button size="small" type="primary" @click="queryEndBlockAuction()">QUERY ENDBLOCK AUCTION</el-button>

    <el-button size="small" type="primary" @click="luckyDrawBox()">LUCKY DRAW BOX</el-button> -->
  </div>
  <el-divider />

  <h4>Result:</h4>
  <div>{{result}}</div>


</div>
</template>
<script>
import Test from '../workflow/Test';
import {_} from 'tearust_utils';
import {helper, stringToU8a} from 'tearust_layer1';
import { mapGetters, mapState } from 'vuex';

export default {
  data(){
    return {
      result: '',
      active_modal: {
        visible: false,
        form: {
          cml_id: '',
          miner_id: '',
          miner_ip: '',
        }
      }
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },

  async mounted(){
    this.$root.loading(true);

    this.test = new Test();
    await this.test.init();

    const layer1_instance = this.test.getLayer1Instance();
    const api = layer1_instance.getApi();

    this.$root.loading(false);
  },

  methods: {
    async startMining(){
      const layer1_instance = this.test.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Active CML',
          pallet: 'cml',
          tx: 'startMining',
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            console.log(111, form);
            const tx = api.tx.cml.startMining(form.cml_id, form.machine_id, form.miner_ip);
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            
            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });

    },
    async queryMiner(){
      const miner_id = await prompt('Input Miner ID');
      if(!miner_id){
        alert('Invalid');
        return;
      }

      const layer1_instance = this.test.getLayer1Instance();
      const api = layer1_instance.getApi();

      const mm = await api.query.cml.minerItemStore(miner_id);

      this.result = mm.toHuman();
    },
    async queryEndBlockAuction(){
      const layer1_instance = this.test.getLayer1Instance();
      const api = layer1_instance.getApi();

      const n = await prompt('Input block number');
      if(!n){
        alert('Invalid');
        return;
      }
      const tmp = await api.query.auction.endblockAuctionStore(n);
      console.log(1, tmp.toHuman());
    },

    async luckyDrawBox(){
      const layer1_instance = this.test.getLayer1Instance();
      const api = layer1_instance.getApi();

      const tmp_A = await api.query.cml.luckyDrawBox("A");
      const tmp_B = await api.query.cml.luckyDrawBox("B");
      const tmp_C = await api.query.cml.luckyDrawBox("C");
      console.log(tmp_A.toJSON(), tmp_B.toJSON(), tmp_C.toJSON());
    }
  },

}
</script>
<style lang="scss">
.t-box{
  display: flex;
  flex-direction: 'row';
}
.x-log{
  position: fixed;
  top: 80px;
  right: 0;
  width: 400px;
  background: #000;
  min-height: 200px;
  padding: 12px 15px;
  color: lime;
  
  p{
    margin: 0;
    margin-bottom: 8px;
  }
}
</style>