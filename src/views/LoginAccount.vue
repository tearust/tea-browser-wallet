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
        <b>{{'My TEA' | cardTitle}}</b>
        <span :inner-html.prop="layer1_account ? layer1_account.balance : '' | teaIcon"></span>
      </div>

      <div class="x-item" v-if="tea_debt_str">
        <b>
          {{'My TEA debt'}}
          <TeaIconButton style="position:relative;" place="right" tip="
            Principle / Interest / Total
          " icon="questionmark" />
        </b>
        <span :inner-html.prop="
          tea_debt_str
        "></span>
      </div>

      <div class="x-item">
        <b>
          {{'Locked TEA' | cardTitle}}
          <TeaIconButton style="position:relative; top:0;" place="right" tip="The balance locked in staking and auction selling or bidding." icon="questionmark" />
        </b>
        <span :inner-html.prop="layer1_account ? layer1_account.lock_balance : '' | teaIcon"></span>
      </div>

      <div class="x-item">
        <b>
          {{'My COFFEE' | cardTitle}}
          <TeaIconButton style="position:relative;" place="right" :tip="
            (usd_interest_rate ? ('COFFEE interest rate is '+(usd_interest_rate)+'.') : '')
          " icon="questionmark" />
        </b>
        <span :inner-html.prop="layer1_account ? layer1_account.usd : '' | usd"></span>
      </div>

      <div class="x-item" v-if="layer1_account && layer1_account.usd_debt">
        <b>
          {{'My COFFEE debt'}}
          <TeaIconButton style="position:relative;" place="right" :tip="
            (usd_interest_rate ? ('COFFEE debt interest rate is '+(usd_interest_rate)+'.') : '')
          " icon="questionmark" />
        </b>
        <span :inner-html.prop="layer1_account.usd_debt | usd"></span>
      </div>

      <!-- <div v-if="layer1_account && layer1_account.debt" class="x-item">
        <b>
          {{'Staking debt' | cardTitle}}
        </b>
        <span :inner-html.prop="layer1_account.debt | teaIcon"></span>
      </div> -->

      <div v-if="layer1_account && layer1_account.reward" class="x-item">
        <b>
          {{'Public service staking reward' | cardTitle}}
          <TeaIconButton style="position:relative; top:1px;" place="right" tip="Public service (e.g. remote attestation) rewards paid out for mining or staking in CML-activated nodes." icon="questionmark" />
        </b>
        <span :inner-html.prop="layer1_account.reward | teaIcon"></span>
      </div>

      <div class="x-bottom">
        <el-button v-if="layer1_account && layer1_account.balance>0" @click="teaToUsd()">
          Sell TEA ({{rate.teaToUsd}} COFFEE/TEA)
        </el-button>
        <el-button v-if="layer1_account && layer1_account.usd>0" @click="usdToTea()">
          Sell COFFEE ({{rate.usdToTea}} TEA/COFFEE)
        </el-button>

        <el-tooltip effect="light" placement="top" content="Receive 0.01 TEA to help pay transaction fees"><el-button v-if="layer1_account" @click="rechargeHandler()">Top up</el-button></el-tooltip>

        <el-tooltip v-if="layer1_account && layer1_account.reward" effect="light" placement="top" content="Send your staking reward to your TEA wallet balance"><el-button @click="withdrawStakingReward()">Withdraw reward</el-button></el-tooltip>
        
        <el-tooltip effect="light" placement="top" content="Borrow COFFEE at the interest rate listed below"><el-button @click="borrowButtonHandler()">Borrow COFFEE</el-button></el-tooltip>

        <el-button v-if="layer1_account && layer1_account.usd_debt" @click="payOffButtonhandler()">Pay off COFFEE debt</el-button>

        <el-tooltip effect="light" placement="top" content="In this epoch, this feature is disabled during contest."><div style="margin-left: 10px;">
        <el-button v-if="layer1_account" :disabled="true" @click="transferBalance()">Send</el-button>
        </div></el-tooltip>
      </div>

    </div>

    <!-- <div class="x-right">
      
    </div> -->

  </div>


  <div class="t-major-financial" v-if="loan_amount && loan_rate && !show_other">
    Interest rate: Genesis loan <b>{{loan_rate}}</b>, COFFEE <b>{{usd_interest_rate_number}}</b>. 
    <a href="javascript:void(0)" @click="show_other=true;" style="margin-left: 5px;">others ...</a>
  </div>
  <div class="t-major-financial" v-if="loan_amount && loan_rate && show_other" :inner-html.prop="
    'Genesis loan principle is <b>' + (loan_amount) + '</b> <span>|</span>'+
    'Coffee interest rate is <b>'+usd_interest_rate+'</b>'+
    '<br/>Genesis loan interest rate is '+loan_rate_str + ''
  ">
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

      <el-tab-pane label="My investment in TApps" name="my_app" :lazy="true">
        <MyAppList />
      </el-tab-pane>

      <el-tab-pane label="My hosting TApps" name="my_hosting" :lazy="true">
        <MyHostingAppList />
      </el-tab-pane>

  
    </el-tabs>

    <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="clickRefreshBtn(true)" style="top: 52px;"></el-button>
  </div>
  

</div>
</template>
<script>
import Vue from 'vue';
import SettingAccount from '../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {numberToHex} from 'tearust_layer1';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';
import MyCmlList from './profile/MyCmlList';
import MyStakingList from './profile/MyStakingList';
import MyAppList from './profile/MyAppList';
import MyPawnList from './profile/MyPawnList';
import MyCoupon from './profile/MyCoupon';
import MyHostingAppList from './profile/MyHostingAppList';
import PubSub from 'pubsub-js';
import ClipboardJS from 'clipboard';
import TeaIconButton from '../components/TeaIconButton';
import request from '../request';
import helper from './helper';
export default {
  components: {
    MyCmlList,
    MyStakingList,
    MyAppList,
    MyCoupon,
    MyPawnList,
    MyHostingAppList,
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
      usd_interest_rate_number: null,

      loan_rate: null,
      loan_rate_str: null,
      loan_amount: null,

      show_other: false,

    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    tea_debt_str: (p)=>{
      if(p.layer1_account && p.layer1_account.tea_debt){
        return utils.layer1.formatBalance(p.layer1_account.tea_debt.prime, true)
          +' / '+ utils.layer1.formatBalance(p.layer1_account.tea_debt.interest)
          +' / '+ utils.layer1.formatBalance(p.layer1_account.tea_debt.total)
      }

      return null;
    }
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
    const query_rate = (await api.query.genesisExchange.uSDInterestRate()).toJSON();
    const usd_interest_rate = query_rate;
    this.usd_interest_rate = (usd_interest_rate/100) + '% per '+pl+' blocks';
    this.usd_interest_rate_number = (usd_interest_rate/100)+'%';

    await this.getMajorFinancial();

    
  },

  methods: {
    showSelectLayer1(){
      this.wf.showSelectLayer1Modal();
    },

    async getExchangeRate(){
      let rs = null;
      const tmp = await request.layer1_rpc('cml_currentExchangeRate', []);
      console.log(`[cml_currentExchangeRate] result => ${tmp}`);

      this.rate.teaToUsd = utils.layer1.balanceToAmount(tmp[0]);
      this.rate.usdToTea = utils.layer1.balanceToAmount(tmp[1]);
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

      await this.getExchangeRate();
      
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
      // utils.publish(tab, {});
      utils.publish('refresh-current-account__'+tab);
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
        key: 'common_form', 
        param: {
          title: 'Sell TEA',
          text: '',
          props: {
            sell_tea_amount: {
              label: 'Sell amount (TEA)',
              type: 'number',
              // max: this.layer1_account.balance,
              min: 0,
              step: 0.1,
              default: undefined,
              tip: 'Click "Confirm" button to see how much you can convert to, or input a number below to convert back.',
              model_action: {
                button_text: 'Sell all',
                handler: async ()=>{
                  const val = utils.layer1.roundAmount(this.layer1_account.balance-0.01);
                  return val;
                },
              },
              
            },
            coffee: {
              label: 'COFFEE',
              type: 'number',
              default: undefined,
              model_action: {
                button_text: 'Convert back',
                handler: async (amount)=>{
                  const val = utils.layer1.roundAmount(this.rate.usdToTea*amount);
                  return val;
                },
                ref: 'sell_tea_amount'
              },
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TEA-and-COFFEE#convert-back')
              },
              tip: 'Click to visit wiki for "Convert back"',
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          const amount = form.sell_tea_amount || 0;
          // let estimate = await request.layer1_rpc('cml_estimateAmount', [utils.layer1.amountToBalance(amount), false]);
          try{
            await this.$confirm(`Estimated amount is <b>${utils.layer1.roundAmount(this.rate.teaToUsd*amount)} COFFEE</b> for this exchange. <br/> Are you sure?`, {
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
          await this.getExchangeRate();
          const rate = this.rate.teaToUsd
          opts.text = `Current exchange rate is <b>${rate} COFFEE/TEA</b>.`;
        },
      });
    },
    async usdToTea(){
      // sell usd
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_form', 
        param: {
          title: 'Sell COFFEE',
          text: '',
          props: {
            sell_usd_amount: {
              label: 'Sell amount (COFFEE)',
              type: 'number',
              max: this.layer1_account.usd,
              min: 0,
              step: 0.1,
              default: undefined,
              tip: 'Click "Confirm" button to see how much you can convert to, or input a number below to convert back.',
              model_action: {
                button_text: 'Sell all',
                handler: async ()=>{
                  const val = (this.layer1_account.usd)
                  return val;
                },
              },
            },
            tea: {
              label: 'TEA',
              type: 'number',
              default: undefined,
              model_action: {
                button_text: 'Convert back',
                handler: async (amount)=>{
                  const val = utils.layer1.roundAmount(this.rate.teaToUsd*amount)
                  return val;
                },
                ref: 'sell_usd_amount'
              },
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TEA-and-COFFEE#convert-back')
              },
              tip: 'Click to visit wiki for "Convert back"',
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          const amount = form.sell_usd_amount || 0;
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
          await this.getExchangeRate();
          const rate = this.rate.usdToTea;
          opts.text = `Current exchange rate is <b>${rate} TEA/COFFEE</b>.`;
        },
      });

    },

    async getMajorFinancial(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const loan_rate = (await api.query.genesisBank.interestRate()).toJSON();
      const pl = api.consts.genesisBank.loanTermDuration.toJSON();
      this.loan_rate_str = '<b>'+(loan_rate/100) + '% per 1000 blocks</b>. Loan term is <b>'+pl+'</b> blocks';
      this.loan_rate = (loan_rate/100)+'%';

      let loan_amount = utils.layer1.formatBalance(api.consts.genesisBank.cmlALoanAmount.toJSON(), true);
      loan_amount += '(A)/'+utils.layer1.formatBalance(api.consts.genesisBank.cmlBLoanAmount.toJSON());
      loan_amount += '(B)/'+utils.layer1.formatBalance(api.consts.genesisBank.cmlCLoanAmount.toJSON());
      loan_amount += '(C)';
      this.loan_amount = loan_amount;
    },

    async borrowButtonHandler(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let max_borrow = null;

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Borrow COFFEE',
          pallet: 'genesisExchange',
          tx: 'borrowUsd',
          text: 'COFFEE interest rate is <b>'+(this.usd_interest_rate)+'</b>',
          props: {
            amount: {
              type: 'number',
              label: 'Amount (COFFEE)',
              remove_required_rule: true,
            }
            
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{

            if(!form.amount){
              throw 'Amount (COFFEE) is required.';
            }

            if(max_borrow && form.amount > max_borrow){
              throw `You can only borrow <b>${max_borrow} COFFEE</b> at most.`;
            }

            const amount = utils.toBN(utils.layer1.amountToBalance(form.amount));

            const tx = api.tx.genesisExchange.borrowUsd(amount);
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshAccount();

            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
        open_cb: async(opts)=>{
          const borrow_rate = await request.layer1_rpc('cml_userBorrowingUsdMargin', [this.layer1_account.address]);
          max_borrow = utils.layer1.balanceToAmount(borrow_rate);
          opts.text += `<br/>You can borrow at most <b>${max_borrow} COFFEE</b>.<br/>More info about COFFEE interest compounding is available <a class="t-wiki" href="https://github.com/tearust/teaproject/wiki/COFFEE-Loans" target="_blank">on our wiki</a>.`;

        }
      });
    },
    async payOffButtonhandler(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_form', 
        param: {
          title: 'Pay off COFFEE debt',
          text: '',
          props: {
            amount: {
              type: 'number',
              label: 'Amount (COFFEE)',
              max: this.layer1_account.usd_debt,
              default: 1,
              model_action: {
                button_text: 'Use entire coffee balance',
                handler: async (v)=>{
                  const {usd, usd_debt} = this.layer1_account;

                  return usd > usd_debt ? usd_debt : usd;
                }
              }
            }
            
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{

            const amount = utils.toBN(utils.layer1.amountToBalance(form.amount));

            const tx = api.tx.genesisExchange.repayUsdDebts(amount);
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshAccount();

            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    }
  }

  
}
</script>

<style lang="scss">
.tea-page{
  .t-major-financial{
    margin-top: 5px;
    text-align: right;
    padding-right: 8px;

    b{
      color: #35a696;
    }
    span{
      margin: 0 5px;
      color: #c9c9c9;
    }
    span.iconfont{
      color: #35a696;
      margin: 0;
    }
  }
}

</style>
