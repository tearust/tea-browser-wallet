<template>
<div class="tea-page">

  <div class="tea-card">
    <i class="x-icon el-icon-user"></i>

    <div class="x-list">
      <div class="x-item">
        <b>NAME</b>
        <span>{{layer1_account ? layer1_account.name : ''}}</span>
      </div>
      <div class="x-item">
        <b>ADDRESS</b>
        <span>
          <font class="js_need_copy">{{layer1_account ? layer1_account.address : ''}}</font>
          <span title="copy" data-clipboard-target=".js_need_copy" style="margin-left: 5px;" class="iconfont tea-icon-btn icon-copy js_copy"></span>
          <span @click="showAddressQrcode(layer1_account.address)" style="margin-left: 5px;" title="qrcode" class="iconfont tea-icon-btn icon-qr_code"></span>
          
        </span>

      </div>
      <div class="x-item">
        <b>TOTAL BALANCE</b>
        <span>{{layer1_account ? layer1_account.balance : ''}}</span>
      </div>
      <div class="x-item">
        <b>LOCKED BALANCE</b>
        <span>{{layer1_account ? layer1_account.lock_balance : ''}}</span>
      </div>

      <div v-if="layer1_account && layer1_account.debt" class="x-item">
        <b>STAKING DEBT</b>
        <span>{{layer1_account.debt}}</span>
      </div>

      <div v-if="layer1_account && layer1_account.reward" class="x-item">
        <b>STAKING REWARD</b>
        <span>{{layer1_account.reward}}</span>
      </div>

    </div>

    <div class="x-right">
      <el-button @click="showSelectLayer1()">CHANGE</el-button>
      <el-button v-if="layer1_account" @click="rechargeHandler()">TOP UP</el-button>
      <el-button v-if="layer1_account" @click="transferBalance()">SEND</el-button>
      <el-button v-if="layer1_account && layer1_account.reward" @click="withdrawStakingReward()">WITHDRAW REWARD</el-button>
    </div>

  </div>


  <div v-if="
    layer1_account && (
      layer1_account.voucher_team_A || layer1_account.voucher_team_B || layer1_account.voucher_team_C ||
      layer1_account.voucher_investor_A || layer1_account.voucher_investor_B || layer1_account.voucher_investor_C
    )
  ">
  <el-divider />
  <div class="tea-card">
    <i class="x-icon el-icon-user"></i>

    <div class="x-list" style="width: 810px;">
      <div class="x-item">
        <b>COUPON - ( INVESTOR / TEAM )</b>
      </div>
      <div class="x-item">
        <b>TYPE - A</b>
        <span>
          {{layer1_account.voucher_investor_A ? layer1_account.voucher_investor_A.amount : 0}}
          /
          {{layer1_account.voucher_team_A ? layer1_account.voucher_team_A.amount : 0}}
        </span>
      </div>
      <div class="x-item">
        <b>TYPE - B</b>
        <span>
          {{layer1_account.voucher_investor_B ? layer1_account.voucher_investor_B.amount : 0}}
          /
          {{layer1_account.voucher_team_B ? layer1_account.voucher_team_B.amount : 0}}
        </span>
      </div>
      <div class="x-item">
        <b>TYPE - C</b>
        <span>
          {{layer1_account.voucher_investor_C ? layer1_account.voucher_investor_C.amount : 0}}
          /
          {{layer1_account.voucher_team_C ? layer1_account.voucher_team_C.amount : 0}}
        </span>
      </div>

    </div>

    <div class="x-right">
      <el-button 
        :disabled="
          (!layer1_account.voucher_team_A || layer1_account.voucher_team_A.amount<1) &&
          (!layer1_account.voucher_team_B || layer1_account.voucher_team_B.amount<1) &&
          (!layer1_account.voucher_team_C || layer1_account.voucher_team_C.amount<1) 
        "
        style="padding: 0 12px;" @click="lotteryHandler(0)"
      >LUCKDRAW - TEAM</el-button>
      <el-button 
        :disabled="
          (!layer1_account.voucher_investor_A || layer1_account.voucher_investor_A.amount<1) &&
          (!layer1_account.voucher_investor_B || layer1_account.voucher_investor_B.amount<1) &&
          (!layer1_account.voucher_investor_C || layer1_account.voucher_investor_C.amount<1) 
        "
        style="padding: 0 12px;" @click="lotteryHandler(1)"
      >LUCKDRAW - INVESTOR</el-button>
      <el-button @click="dai_modal.visible=true">TRANSFER</el-button>
    </div>

  </div>

  </div>


  <div style="position: relative; padding: 20px 0 40px;">
    <el-tabs tab-position="top" style="margin-top: 32px;" @tab-click="clickTab($event)">
      <el-tab-pane label="MY CML" :lazy="true">
        <MyCmlList />
      </el-tab-pane>
      <el-tab-pane label="MY STAKING" :lazy="true">
        <MyStakingList />
      </el-tab-pane>
      <el-tab-pane label="MY APPS" :lazy="true">
        <MyAppList />
      </el-tab-pane>
  
    </el-tabs>

    <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="clickRefreshBtn(true)" style="top: 52px;"></el-button>
  </div>
  


  <el-dialog
    title="Transfer Coupons"
    :visible.sync="dai_modal.visible"
    width="800px"
    :close-on-click-modal="false"
    custom-class="tea-modal"
  >

    <!-- <p style="margin:0 0 40px; font-size:15px;">
      Transfer Voucher to another account.
    </p> -->
    <el-form :model="dai_modal.form" :rules="dai_modal.rules" ref="dai_modal" label-width="150px">
      <el-form-item label="Target Address" prop="target_address">
        <el-input v-model="dai_modal.form.target_address"></el-input>
      </el-form-item>

      <el-form-item label="Class Type" prop="class">
        <el-select v-model="dai_modal.form.class" style="width: 300px;" placeholder="Please Select Class">
          <el-option
            v-for="val in dai_modal.class_options"
            :key="val"
            :label="val"
            :value="val">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Defrost Schedule" prop="defrost">
        <el-select v-model="dai_modal.form.defrost" style="width: 300px;" placeholder="Please Select Defrost Schedule">
          <el-option
            v-for="val in dai_modal.defrost_options"
            :key="val"
            :label="val"
            :value="val">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Amount" prop="amount">
        <el-input-number v-model="dai_modal.form.amount" :min="1" :max="10000"></el-input-number>
      </el-form-item>
    </el-form>

    
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dai_modal.visible = false">Close</el-button>
      <el-button size="small" type="primary" @click="transferVoucher()">Confirm</el-button>
    </span>

  </el-dialog>


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
import PubSub from 'pubsub-js';
import ClipboardJS from 'clipboard';
export default {
  components: {
    MyCmlList,
    MyStakingList,
    MyAppList,
  },
  data(){
    return {
      tab: 'NA',
      dai_modal: {
        visible: false,
        form: {
          target_address: '',
          amount: null,
          class: null,
          defrost: null,
        },
        rules: {
          target_address: [
            { required: true },
          ],
          amount: [],
          class: [
            { required: true },
          ],
          defrost: [
            { required: true },
          ]
        },
        class_options: [],
        defrost_options: [],
      },
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  
  async mounted(){
    this.dai_modal.class_options = utils.consts.CmlType;
    this.dai_modal.defrost_options = utils.consts.DefrostScheduleType,

    this.$root.loading(true);

    this.wf = new SettingAccount();
    await this.wf.init();

    await this.refreshAccount();

    this.initCopyEvent();
    this.$root.loading(false);
    

    utils.register('refresh-current-account__account', async (key, param)=>{
      await this.refreshAccount();
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
      flag && this.$root.loading(false);
    },


    async lotteryHandler(n){
      let defrost = utils.consts.DefrostScheduleType.Investor;
      if(n === 0){
        defrost = utils.consts.DefrostScheduleType.Team;
      }

      const msg = `
        Lottery will transfer all your ${defrost} Coupons to Camellia Seeds.
        <br />
        Please confirm your operation.
      `
      const x = await this.$confirm(msg, {
        title: 'Lottery',
        dangerouslyUseHTMLString: true,
      }).catch(()=>{});
      if(!x) return false;



      this.$root.loading(true);
      try{
        const layer1_instance = this.wf.getLayer1Instance();
        const api = layer1_instance.getApi();

        const tx = api.tx.cml.drawCmlsFromVoucher(defrost);

        await layer1_instance.sendTx(this.layer1_account.address, tx);
        await this.refreshAccount();

        this.$message.success('success');

      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      
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

    async transferVoucher(){
      const ref = this.$refs['dai_modal'];
      this.$root.loading(true);
      try{
        await ref.validate();
        const {target_address, amount, defrost} = this.dai_modal.form;

        const type = this.dai_modal.form.class;
        const vc = _.get(this.layer1_account, 'voucher_'+_.toLower(defrost)+'_'+type, null);

        if(!vc || amount > vc.amount){
          throw 'Not Enough Coupons for Class - '+type+' - '+defrost;
        }

        const layer1_instance = this.wf.getLayer1Instance();
        const api = layer1_instance.getApi();
        const tx = api.tx.cml.transferVoucher(target_address, type, defrost, amount);
        await layer1_instance.sendTx(this.layer1_account.address, tx);
        await this.refreshAccount();
        this.$message.success('success');
        ref.resetFields();
        this.dai_modal.visible = false;
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      
    },
    clickTab(e){
      const label = e.label;
      this.tab = label;

      utils.publish(label, {});
    },

    clickRefreshBtn(){
      utils.publish('refresh-current-account__account')
      utils.publish('refresh-current-account__'+this.tab)
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
      clipboard.on('success', (e)=>{
        e.clearSelection();
        this.$message.success('copy success.');
      });

      clipboard.on('error', (e)=>{
      });
    }
  }

  
}
</script>