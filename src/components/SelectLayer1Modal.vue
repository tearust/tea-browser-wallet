<template>

<el-dialog
  title=""
  :visible.sync="visible"
  width="900"
  custom-class="tea-modal"
  @open="openedHandler"
  @closed="closedHandler"
  :before-close="handleClose">

  <h6>Please select account</h6>

  <div style="text-align:center;" v-if="!loading">

    <el-select style="width: 400px;" :value="layer1_account ? layer1_account.address : null" @change="layer1ChangeHandler($event)" placeholder="Please select account" no-data-text="Please register account with polkadot extension.">
      <el-option
        v-for="(item, i) in layer1_account_list"
        :key="i"
        :label="item.name"
        :value="item.address">
      </el-option>
    </el-select>

    <p style="width: 400px; text-align:right; margin: 5px auto 0;">
      <el-link href="https://teaproject.org/#/doc_list/%2FFAQ%2Fhow_to_install_polkadot_extension.md" target="_blank">How to install Polkadot browser extension?</el-link>
    </p>
    

  </div>
  

  <span slot="footer" class="dialog-footer">
    <el-button @click="visible = false">Close</el-button>
  </span>

</el-dialog>
</template>
<script>
import PubSub from 'pubsub-js';
import { mapGetters, mapState } from 'vuex';
import SettingAccount from '../workflow/SettingAccount';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
export default {
  data(){
    return {
      visible: false,
      params: null,
      layer1_account_list: [],

      loading: false,
    }
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ])
  },

  methods: {
    handleClose(){
      this.visible = false;
    },

    async openedHandler(){
      this.loading = true;
      const layer1_instance = this.sa.getLayer1Instance();
      let tmp = await this.sa.getAllLayer1Account();
      tmp = _.map(tmp, (item)=>{
        (async ()=>{
          item.balance = await layer1_instance.getAccountBalance(item.address);
          item.ori_name = _.clone(item.name);
          item.name = item.name + '  -  ' + item.balance;
        })();
        return item;
      });
      this.layer1_account_list = await tmp;
      this.loading = false;
    },

    closedHandler(){
      this.sa.refreshCurrentAccount();
      utils.publish('refresh-current-account__my_staking');
    },

    layer1ChangeHandler(account){
      const ac = _.find(this.layer1_account_list, (item)=>item.address === account);
      this.$store.commit('set_account', ac);
    },
  },

  created(){
    PubSub.unsubscribe('tea-select-layer1-modal');
    PubSub.subscribe('tea-select-layer1-modal', (msg, visible)=>{
      this.visible = visible;
       
    })
  },

  async mounted(){

    this.sa = new SettingAccount();
    await this.sa.init();


  },
}
</script>