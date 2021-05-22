<template>
<div class="tea-page">
  <h4>ASSETS</h4>
  <div class="t-box">
    <el-button size="small" type="primary" @click="active_modal.visible=true">ACTIVE CML</el-button>
    <el-button size="small" type="primary" @click="queryMiner()">QUERY MINER</el-button>
  </div>
  <el-divider />

  <h4>Result:</h4>
  <div>{{result}}</div>

  

  <el-dialog
    title="Transfer Dai"
    :visible.sync="active_modal.visible"
    width="900"
    :close-on-click-modal="false"
    custom-class="tea-modal"
  >

    <el-form :model="active_modal.form" ref="active_modal" label-width="120px">
      <el-form-item label="CML ID">
        <el-input v-model="active_modal.form.cml_id"></el-input>
      </el-form-item>
      <el-form-item label="MINER ID">
        <el-input v-model="active_modal.form.miner_id"></el-input>
      </el-form-item>
      <el-form-item label="MINER IP">
        <el-input v-model="active_modal.form.miner_ip"></el-input>
      </el-form-item>

    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="active_modal.visible = false">Close</el-button>
      <el-button size="small" type="primary" @click="activeCML()">Confirm</el-button>
    </span>

  </el-dialog>
</div>
</template>
<script>
import Test from '../workflow/Test';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
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
    ...mapState([
      'bind_mobile',
    ]),
  },

  async mounted(){
    this.$root.loading(true);

    this.test = new Test();
    await this.test.init();

    this.$root.loading(false);
  },

  methods: {
    async activeCML(){
      const ref = this.$refs['active_modal'];
      this.$root.loading(true);
      try{
        const {cml_id, miner_id, miner_ip} = this.active_modal.form;

        const layer1_instance = this.test.getLayer1Instance();
        const api = layer1_instance.getApi();

        const tx = api.tx.assets.activeCmlForNitro(cml_id, miner_id, miner_ip);
        await layer1_instance.sendTx(this.layer1_account.address, tx);
        console.log(cml_id, miner_id, miner_ip);

        this.$message.success('success');
        ref.resetFields();
        this.active_modal.visible = false;
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    async queryMiner(){
      const miner_id = await prompt('Input Miner ID');
      if(!miner_id){
        alert('Invalid');
        return;
      }

      const layer1_instance = this.test.getLayer1Instance();
      const api = layer1_instance.getApi();

      const mm = await api.query.assets.minerItemStore(miner_id);

      this.result = mm.toHuman();
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