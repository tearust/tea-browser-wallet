<template>
<div class="tea-page">

  <div class="tea-card">
    <i class="x-icon ">
      <img src="/fav.png" />
    </i>
    

    <div class="x-list" style="width:100%;">
      <div class="x-item">
        <b>{{'Name' | cardTitle}}</b>
        <span>{{layer1_account ? layer1_account.name : ''}}</span>
      </div>
      <div class="x-item">
        <b>{{'Address' | cardTitle}}</b>
        <span>
          <font class="js_need_copy">{{layer1_account ? layer1_account.address : ''}}</font>
          <span title="copy" data-clipboard-target=".js_need_copy" style="margin-left: 5px;" class="iconfont tea-icon-btn icon-copy js_copy"></span>
          <span @click="showAddressQrcode(layer1_account.address)" style="margin-left: 5px;" title="qrcode" class="iconfont tea-icon-btn icon-qr_code"></span>
          
        </span>

      </div>
      <div class="x-item">
        <b>{{'Total balance' | cardTitle}}</b>
        <span :inner-html.prop="layer1_account ? layer1_account.balance : '' | teaIcon"></span>
      </div>
      <div class="x-item">
        <b>{{'Locked balance' | cardTitle}}</b>
        <span :inner-html.prop="layer1_account ? layer1_account.lock_balance : '' | teaIcon"></span>
      </div>

      <div v-if="layer1_account && layer1_account.debt" class="x-item">
        <b>{{'Staking debt' | cardTitle}}</b>
        <span :inner-html.prop="layer1_account.debt | teaIcon"></span>
      </div>

      <div v-if="layer1_account && layer1_account.reward" class="x-item">
        <b>{{'Staking reward' | cardTitle}}</b>
        <span :inner-html.prop="layer1_account.reward | teaIcon"></span>
      </div>

      <div class="x-bottom">
        <!-- <el-button @click="showSelectLayer1()">CHANGE</el-button> -->
        <el-button v-if="layer1_account" @click="rechargeHandler()">Top up</el-button>
        <el-button v-if="layer1_account" @click="transferBalance()">Send</el-button>
        <el-button v-if="layer1_account && layer1_account.reward" @click="withdrawStakingReward()">Withdraw reward</el-button>
        <el-button v-if="layer1_account && layer1_account.debt" @click="repaymentHandler()">Pay off debt</el-button>
      </div>

    </div>

    <!-- <div class="x-right">
      
    </div> -->

  </div>



  <div style="position: relative; padding: 20px 0 40px;">
    <el-tabs tab-position="top" style="margin-top: 32px;" v-model="tab" @tab-click="clickTab(tab)">
      <el-tab-pane v-if="has_coupon_tab" label="My Coupon" name="my_coupon" :lazy="true">
        <MyCoupon />
      </el-tab-pane>

      <el-tab-pane label="My Camellia" name="my_cml" :lazy="true">
        <MyCmlList />
      </el-tab-pane>
      
      <el-tab-pane label="My staking on Camellia" name="my_staking" :lazy="true">
        <MyStakingList />
      </el-tab-pane>
      <el-tab-pane label="My investment on Apps" name="my_app" :lazy="true">
        <MyAppList />
      </el-tab-pane>
  
    </el-tabs>

    <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="clickRefreshBtn(true)" style="top: 52px;"></el-button>
  </div>
  

</div>
</template>
<script>
import SettingAccount from '../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';
import MyCmlList from './profile/MyCmlList';
import MyStakingList from './profile/MyStakingList';
import MyAppList from './profile/MyAppList';
import MyCoupon from './profile/MyCoupon';
import PubSub from 'pubsub-js';
import ClipboardJS from 'clipboard';
export default {
  components: {
    MyCmlList,
    MyStakingList,
    MyAppList,
    MyCoupon,
  },
  data(){
    return {
      has_coupon_tab: false,
      tab: 'my_cml',
      
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },

  async created(){
    this.initCopyEvent();
  },
  beforeDestroy(){
    this.clipboard && this.clipboard.destroy();
  },
  
  async mounted(){
    this.$root.loading(true);

    this.wf = new SettingAccount();
    await this.wf.init();
    await this.refreshAccount();

    this.$root.loading(false);
    
    utils.register('refresh-current-account__account', async (key, param={})=>{
      await this.refreshAccount();
      if(param.tab && this.tab !== param.tab){
        if(param.tab === 'my_coupon'){
          if(this.has_coupon_tab) this.tab = param.tab;
          // else this.tab = 'my_cml';
        }
        else{
          this.tab = param.tab;
        }
        
      }
    });
  },

  methods: {
    showSelectLayer1(){
      this.wf.showSelectLayer1Modal();
    },

    async rechargeHandler(){
      this.$root.loading(true);
      const layer1_instance = this.wf.getLayer1Instance();
      await layer1_instance.faucet(this.layer1_account.address);
      this.refreshAccount();
      
      this.$root.loading(false);
    },

    async refreshAccount(flag=false){
      flag && this.$root.loading(true);
      await this.wf.refreshCurrentAccount();

      const layer1_account = this.layer1_account;
      if (
        layer1_account && (
          layer1_account.voucher_team_A || layer1_account.voucher_team_B || layer1_account.voucher_team_C ||
          layer1_account.voucher_investor_A || layer1_account.voucher_investor_B || layer1_account.voucher_investor_C
        )
      ) {
        
        // this.tab = 'my_coupon';
        this.has_coupon_tab = true;
      }
      else {
        this.has_coupon_tab = false;
        if(this.tab === 'my_coupon'){
          this.tab = 'my_cml';
        }
      }
      
      flag && this.$root.loading(false);
    },


    async transferBalance(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'transfer_balance',
        param: {},
        cb: async (form, closeFn)=>{
          this.$root.loading(true);
          try{
            const {address, amount} = form;
            if(address === this.layer1_account.address){
              throw 'You cannot send TEA to yourself.';
            }

            await this.wf.transferBalance(address, amount);

            closeFn();
            await this.refreshAccount();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },

    
    clickTab(tab){
      utils.publish(tab, {});
    },

    clickRefreshBtn(){
      utils.publish('refresh-current-account__account')
      utils.publish('refresh-current-account__'+this.tab);
    },

    async withdrawStakingReward(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      try{
        const tx = api.tx.cml.withdrawStakingReward();
        await layer1_instance.sendTx(this.layer1_account.address, tx);
        await this.refreshAccount();
        this.$message.success('success');
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },

    showAddressQrcode(address){
      PubSub.publish('tea-qrcode-modal', {
        info: null,
        visible: true,
        text: address,
      });
    },

    initCopyEvent(){
      const clipboard = new ClipboardJS('.js_copy');
      this.clipboard = clipboard;
      clipboard.on('success', (e)=>{
        e.clearSelection();
        this.$message.success('copy success.');
      });

      clipboard.on('error', (e)=>{
      });
    },

    async repaymentHandler(){
      const x = await this.$confirm("Are you sure to payoff the debt? Your staking debt is paid off in full or none.", "Info").catch(()=>{});
      if(!x) return;

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      try{
        const tx = api.tx.cml.payOffMiningCredit();
        await layer1_instance.sendTx(this.layer1_account.address, tx);
        await this.refreshAccount();
        this.$message.success('success');
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    }
  }

  
}
</script>