<template>
<div class="tea-page">

  <div class="tea-card">
    <i class="x-icon el-icon-user"></i>

    <div class="x-list" style="width: 810px;">
      <div class="x-item">
        <b>{{'Coupon - ( Investors / Team )' | cardTitle}}</b>
      </div>
      <div class="x-item">
        <b>{{'Type - A' | cardTitle}}</b>
        <span>
          {{layer1_account.voucher_investor_A ? layer1_account.voucher_investor_A.amount : 0}}
          /
          {{layer1_account.voucher_team_A ? layer1_account.voucher_team_A.amount : 0}}
        </span>
      </div>
      <div class="x-item">
        <b>{{'Type - B' | cardTitle}}</b>
        <span>
          {{layer1_account.voucher_investor_B ? layer1_account.voucher_investor_B.amount : 0}}
          /
          {{layer1_account.voucher_team_B ? layer1_account.voucher_team_B.amount : 0}}
        </span>
      </div>
      <div class="x-item">
        <b>{{'Type - C' | cardTitle}}</b>
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
      >Seed draw- Team</el-button>
      <el-button 
        :disabled="
          (!layer1_account.voucher_investor_A || layer1_account.voucher_investor_A.amount<1) &&
          (!layer1_account.voucher_investor_B || layer1_account.voucher_investor_B.amount<1) &&
          (!layer1_account.voucher_investor_C || layer1_account.voucher_investor_C.amount<1) 
        "
        style="padding: 0 12px;" @click="lotteryHandler(1)"
      >Seed draw - Investor</el-button>
      <el-button @click="dai_modal.visible=true">Transfer</el-button>
    </div>

  </div>
  <span class="tea-card-tip">Expired blockheight 100</span>


 <el-dialog
    title="Transfer Coupons"
    :visible.sync="dai_modal.visible"
    width="800px"
    :close-on-click-modal="false"
    custom-class="tea-modal"
  >


    <el-form :model="dai_modal.form" :rules="dai_modal.rules" ref="dai_modal" label-width="150px">
      <el-form-item label="Receiver's address" prop="target_address">
        <el-input v-model="dai_modal.form.target_address"></el-input>
      </el-form-item>

      <el-form-item label="Type" prop="class">
        <el-select v-model="dai_modal.form.class" style="width: 300px;" placeholder="Please select class">
          <el-option
            v-for="val in dai_modal.class_options"
            :key="val"
            :label="val"
            :value="val">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Defrost schedule" prop="defrost">
        <el-select v-model="dai_modal.form.defrost" style="width: 300px;" placeholder="Please select defrost schedule">
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
import SettingAccount from '../../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString} from 'tearust_layer1';
export default {
  data(){
    return {
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
            { required: true, message: 'Receiver\'s address is required.' },
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

    this.wf = new SettingAccount();
    await this.wf.init();
  },

  methods: {

    async refreshAccount(){
      
    },
    
    async transferVoucher(){
      const ref = this.$refs['dai_modal'];
      await ref.validate();
      this.$root.loading(true);
      try{
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

    
  }

  
}
</script>