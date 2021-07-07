<template>
<div class="tea-page">
  <h4>Plant My Camellia</h4>

  <el-form :model="form" label-width="200px" :rules="rules" ref="form">
    <el-form-item label="Cml Id" prop="cml_id">
      <el-input v-model="form.cml_id"></el-input>
    </el-form-item>

    <el-form-item label="Miner Id" prop="miner_id">
      <el-input v-model="form.miner_id"></el-input>
    </el-form-item>

    <el-form-item label="Miner Ip" prop="miner_ip">
      <el-input v-model="form.miner_ip"></el-input>
    </el-form-item>

    <el-form-item label="Account" prop="account">
      <el-input v-model="form.account"></el-input>
    </el-form-item>
    
  </el-form>

  <div style="display:flex; justify-content: flex-end; margin-top: 40px;">
    <el-button style="padding-left: 15px; padding-right: 15px;" 
      @click="testPlant()"
      plain
      type="primary">
      Plant for mining
    </el-button>

    <el-button style="padding-left: 15px; padding-right: 15px;" 
      @click="generateShell()"
      type="primary">
      Generate Shell
    </el-button>


  </div>

</div>
</template>
<script>

import Base from '../workflow/Base';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import { mapGetters } from 'vuex';
export default {
  data(){
    return {
      form: {
        cml_id: null,
        miner_id: null,
        miner_ip: null,
        account: null,
      },
      rules: {
        cml_id: [{required: true}],
        miner_id: [{required: true}],
        miner_ip: [{required: true}],
        account: [{required: true}],
      }

    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.form.cml_id = this.$route.params.cml_id;
    this.form.account = this.layer1_account.address;

    this.wf = new Base();
    await this.wf.init();
  },
  methods: {
    async generateShell(){
      alert('TODO');
    },
    async testPlant(){
      const ref = this.$refs['form'];
      await ref.validate();

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      try{
        // console.log(111, this.form);
        const form = this.form;
        const tx = api.tx.cml.startMining(form.cml_id, form.miner_id, form.miner_ip);
        await layer1_instance.sendTx(this.layer1_account.address, tx);
        
        this.$router.push('/login_account');
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    }
  }
}
</script>