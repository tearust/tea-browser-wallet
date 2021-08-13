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
        <b>
          {{'Locked balance' | cardTitle}}
          <TeaIconButton style="position:relative; top:1px;" place="right" tip="The balance locked in staking and auction selling or bidding." icon="questionmark" />
        </b>
        <span :inner-html.prop="layer1_account ? layer1_account.lock_balance : '' | teaIcon"></span>
      </div>

      <div class="x-item">
        <b>
          {{'My USD' | cardTitle}}
          <TeaIconButton style="position:relative;" place="right" :tip="
            (usd_interest_rate ? ('USD interest rate is '+usd_interest_rate+'.') : '')
          " icon="questionmark" />
        </b>
        <span :inner-html.prop="layer1_account ? layer1_account.usd : '' | usd"></span>
      </div>

      <div v-if="layer1_account && layer1_account.debt" class="x-item">
        <b>
          {{'Staking debt' | cardTitle}}
        </b>
        <span :inner-html.prop="layer1_account.debt | teaIcon"></span>
      </div>

      <div v-if="layer1_account && layer1_account.reward" class="x-item">
        <b>
          {{'Staking reward' | cardTitle}}
          <TeaIconButton style="position:relative; top:1px;" place="right" tip="Reward paid out for staking in CML-activated nodes. The first to plant a CML seed along with a 1000 TEA stake is considered the miner for that node." icon="questionmark" />
        </b>
        <span :inner-html.prop="layer1_account.reward | teaIcon"></span>
      </div>

      <div class="x-bottom">
        <el-button v-if="layer1_account && layer1_account.balance>0" @click="teaToUsd()">
          Sell TEA ({{rate.teaToUsd}} USD/TEA)
        </el-button>
        <el-button v-if="layer1_account && layer1_account.usd>0" @click="usdToTea()">
          Sell USD ({{rate.usdToTea}} TEA/USD)
        </el-button>

        <!-- <el-button v-if="layer1_account" @click="rechargeHandler()">Top up</el-button> -->
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

      <el-tab-pane v-if="layer1_account && layer1_account.pawn_cml_list && layer1_account.pawn_cml_list.length>0" label="My collateral seeds" name="my_pawn" :lazy="true">
        <MyPawnList />
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
import {helper, numberToHex} from 'tearust_layer1';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';
import MyCmlList from './profile/MyCmlList';
import MyStakingList from './profile/MyStakingList';
import MyAppList from './profile/MyAppList';
import MyPawnList from './profile/MyPawnList';
import MyCoupon from './profile/MyCoupon';
import PubSub from 'pubsub-js';
import ClipboardJS from 'clipboard';
import TeaIconButton from '../components/TeaIconButton';
import request from '../request';
export default {
  components: {
    MyCmlList,
    MyStakingList,
    MyAppList,
    MyCoupon,
    MyPawnList,
    TeaIconButton,
  },
  data(){
    return {
      has_coupon_tab: false,
      tab: 'my_cml',
      
      rate: {
        usdToTea: null,
        teaToUsd: null,
      },

      usd_interest_rate: null,
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

    const layer1_instance = this.wf.getLayer1Instance();
    const api = layer1_instance.getApi();
    const pl = api.consts.genesisExchange.interestPeriodLength.toJSON();
    this.usd_interest_rate = (api.consts.genesisExchange.usdInterestRate.toJSON() / pl) + ' per '+pl+' blocks';
  },

  methods: {
    showSelectLayer1(){
      this.wf.showSelectLayer1Modal();
    },

    async getExchangeRate(type){
      let rs = null;
      if(type === 'teaToUsd'){
        const rate = await request.layer1_rpc('cml_currentExchangeRate', []);
        rs = utils.layer1.balanceToAmount(rate);
        console.log('[cml_currentExchangeRate] tea/usd rate =>', rate, rs);
        this.rate.teaToUsd = rs;
      }
      else if(type === 'usdToTea'){
        const rate = await request.layer1_rpc('cml_reverseExchangeRate', []);
        rs = utils.layer1.balanceToAmount(rate);
        console.log('[cml_reverseExchangeRate] usd/tea rate =>', rate, utils.layer1.balanceToAmount(rate));
        this.rate.usdToTea = rs;
      }
      else{
        throw 'invalid exchange rate type.';
      }

      return rs;
    },

    async rechargeHandler(){
      // this.$root.loading(true);
      // const layer1_instance = this.wf.getLayer1Instance();
      // await layer1_instance.faucet(this.layer1_account.address);
      // this.refreshAccount();
      
      // this.$root.loading(false);
      const url = utils.get_env('faucet_url');
      window.open(url, '_blank');
    },

    async refreshAccount(flag=false){
      flag && this.$root.loading(true);
      await this.wf.refreshCurrentAccount();

      const layer1_account = this.layer1_account;
      if (
        layer1_account && (
          layer1_account.coupon_team_A || layer1_account.coupon_team_B || layer1_account.coupon_team_C ||
          layer1_account.coupon_investor_A || layer1_account.coupon_investor_B || layer1_account.coupon_investor_C
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

      await this.getExchangeRate('usdToTea');
      await this.getExchangeRate('teaToUsd');
      
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
      utils.publish('refresh-current-account__account');
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
        this.$root.success();
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
        this.$root.success('Copied');
      });

      clipboard.on('error', (e)=>{
      });
    },

    async repaymentHandler(){
      const cml_id_option = [];
      _.each(this.layer1_account.debt_detail, (val, key)=>{
        const tmp = {
          value: key,
          label: `${key} - ${val}`,
          key,
        };
        cml_id_option.push(tmp);
      });

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();
      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Pay off debt',
          pallet: 'cml',
          tx: 'payOffMiningCredit',
          text: 'Are you sure you want to pay off your debt in full? If your balance doesn\'t cover your entire staking debt, the transaction will be cancelled.',
          props: {
            cml_id: {
              label: 'CML ID to pay off',
              type: 'select',
              options: cml_id_option,
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            const tx = api.tx.cml.payOffMiningCredit(form.cml_id);
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshAccount();
            this.$root.success();
            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });

    },
    async teaToUsd(){
      // sell tea
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Sell TEA',
          pallet: 'genesisExchange',
          tx: 'teaToUsd',
          text: '',
          props: {
            buy_usd_amount: {
              class: 'hidden',
            },
            sell_tea_amount: {
              label: 'Sell amount (TEA)',
              type: 'number',
              max: this.layer1_account.balance,
              min: 0,
              step: 0.1,
              default: 0,
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          const amount = form.sell_tea_amount;
          // let estimate = await request.layer1_rpc('cml_estimateAmount', [utils.layer1.amountToBalance(amount), false]);
          try{
            await this.$confirm(`Estimated amount is <b>${utils.layer1.roundAmount(this.rate.teaToUsd*amount)} USD</b> for this exchange. <br/> Are you sure?`, {
              dangerouslyUseHTMLString: true,
            });
          }catch(e){
            this.$root.loading(false);
            return false;
          }
      
          try{
            const tx = api.tx.genesisExchange.teaToUsd(null, numberToHex(utils.layer1.amountToBalance(amount)));
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshAccount();
            this.$root.success();
            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
        open_cb: async(opts)=>{
          await this.getExchangeRate('teaToUsd');
          const rate = this.rate.teaToUsd
          opts.text = `Current exchange rate is <b>${rate} USD/TEA</b>.`;
        },
      });
    },
    async usdToTea(){
      // sell usd
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Sell USD',
          pallet: 'genesisExchange',
          tx: 'usdToTea',
          text: '',
          props: {
            buy_tea_amount: {
              class: 'hidden',
            },
            sell_usd_amount: {
              label: 'Sell amount (USD)',
              type: 'number',
              max: this.layer1_account.usd,
              min: 0,
              step: 0.1,
              default: 0,
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          const amount = form.sell_usd_amount;
          // let estimate = await request.layer1_rpc('cml_estimateAmount', [utils.layer1.amountToBalance(amount), true]);
          
          try{
            await this.$confirm(`Estimated amount is <b>${utils.layer1.roundAmount(this.rate.usdToTea*amount)} TEA</b> for this exchange. <br/> Are you sure?`, {
              dangerouslyUseHTMLString: true,
            });
          }catch(e){
            this.$root.loading(false);
            return false;
          }
          try{
            const tx = api.tx.genesisExchange.usdToTea(null, numberToHex(utils.layer1.amountToBalance(amount)));
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshAccount();
            this.$root.success();
            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
        open_cb: async(opts)=>{
          await this.getExchangeRate('usdToTea');
          const rate = this.rate.usdToTea;
          opts.text = `Current exchange rate is <b>${rate} TEA/USD</b>.`;
        },
      });

    },
  }

  
}
</script>