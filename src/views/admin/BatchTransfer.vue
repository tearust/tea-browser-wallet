<template>
<div class="tea-page">
  <h4>Batch transfer</h4>
  
  <el-form ref="form" :model="form" label-width="150px">
    <el-form-item label="Target address">
      <el-input type="textarea" :rows="10" v-model="form.target"></el-input>
    </el-form-item>
    <el-form-item label="TEA amount to send">
      <el-input v-model="form.amount" ></el-input>
    </el-form-item>

    
  </el-form>

  <div style="display:flex; justify-content: flex-end;">
    <el-button style="width:40%;margin-top: 40px;" type="primary" @click="sendHandler()">Send</el-button>
  </div>
</div>  
</template>

<script>
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import {stringToHex, u8aToString} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import tapp from '../../tapp';
import request from '../../request';

export default {

  data(){
    return {
      form: {
        target: null,
        amount: 1,
      }
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.wf = new Base();
    await this.wf.init();

  },
  methods: {
    async sendHandler(){

      const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
    
      const isValidAddressPolkadotAddress = (address) => {
        try {
          encodeAddress(decodeAddress(address));

          return true;
        } catch (error) {
          return false;
        }
      };

      try{
        const {target, amount} = this.form;
        if(!target){
          throw 'target address required.';
        }
        const amt = _.toNumber(amount);
        if(!amt || amt < 0){
          throw 'Invalid amount.';
        }

        const address_list = _.uniq(_.map(target.split(","), (x)=>{
          const xx = _.trim(x);
          if(!isValidAddressPolkadotAddress(xx)){
            throw 'Invalid address => '+xx;
          }
          return xx;
        }));

        this.$root.loading(true);
        const layer1_instance = this.wf.getLayer1Instance();
        const api = layer1_instance.getApi();
        const tx = api.tx.bondingCurve.batchTransfer(address_list, layer1_instance.asUnit() * amt);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        this.$root.success('success');
        this.form.target = null;
        this.form.amount = 1;
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      
    }
  }
}
</script>