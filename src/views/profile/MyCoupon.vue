<template>
<div class="tea-page">

  <span v-if="expired_block > 0" class="tea-table-tip">All coupons will be expired in <b class="block">{{expired_block}}</b> blocks</span>
  <el-table 
    :data="list"
    stripe
    size="small"
    border
    v-if="expired_block > 0"
  >
    <el-table-column
      prop="type"
      width="150"
      label="Seeds type"
      sortable
    />
    <el-table-column
      prop="schedule"
      label="Seeds defrost schedule"
      sortable
    />

    <el-table-column
      prop="amount"
      label="Coupon amount"
      width="150"
    />
  
  </el-table>

  <div v-if="expired_block > 0" style="display:flex; justify-content: flex-end; margin-top: 40px;">
    <el-button style="padding-left: 15px; padding-right: 15px;" 
      @click="dai_modal.visible=true"
      plain
      type="primary">
      Transfer coupon
    </el-button>

    <el-button style="padding-left: 15px; padding-right: 15px;" 
      @click="lotteryHandler(0)"
      :disabled="
        (!layer1_account.coupon_team_A || layer1_account.coupon_team_A.amount<1) &&
        (!layer1_account.coupon_team_B || layer1_account.coupon_team_B.amount<1) &&
        (!layer1_account.coupon_team_C || layer1_account.coupon_team_C.amount<1) 
      "
      type="primary">
      Redeem team coupon
    </el-button>

    <el-button style="padding-left: 15px; padding-right: 15px;" 
      @click="lotteryHandler(1)"
      :disabled="
        (!layer1_account.coupon_investor_A || layer1_account.coupon_investor_A.amount<1) &&
        (!layer1_account.coupon_investor_B || layer1_account.coupon_investor_B.amount<1) &&
        (!layer1_account.coupon_investor_C || layer1_account.coupon_investor_C.amount<1) 
      "
      type="primary">
      Redeem investor coupon
    </el-button>

  </div>
  <h6 v-if="expired_block < 1" class="t-info">All your coupons have expired.</h6>


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
      <el-button size="small" type="primary" @click="transferCoupon()">Confirm</el-button>
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
      has_team: false,
      has_investor: false,
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
    ...mapState([
      'chain'
    ]),
    list: (p)=>{
      if(!p.layer1_account) return [];
      const layer1_account = p.layer1_account;
      const list = [];
      const tmp = [
        ['coupon_investor_A', 'Investor', 'A'],
        ['coupon_investor_B', 'Investor', 'B'],
        ['coupon_investor_C', 'Investor', 'C'],
        ['coupon_team_A', 'Team', 'A'],
        ['coupon_team_B', 'Team', 'B'],
        ['coupon_team_C', 'Team', 'C'],
      ]
      _.each(tmp, (item)=>{
        const key = item[0];
        if(layer1_account[key] && layer1_account[key].amount>0){
          list.push({
            amount: layer1_account[key].amount,
            type: item[2],
            schedule: item[1],
          })
        }
      });
      return list;
    },
    expired_block: (p)=>{
      if(!p.chain) return 'NA';
      
      const block = parseInt(p.chain.current_block, 10);
      const max = p.chain.metadata.consts.cml.couponTimoutHeight.toJSON();

      let rs = max-block;
      if(rs < 0) rs = 0;

      return rs;
    },
  },
  
  async mounted(){
    this.dai_modal.class_options = utils.consts.CmlType;
    this.dai_modal.defrost_options = utils.consts.DefrostScheduleType,

    this.wf = new SettingAccount();
    await this.wf.init();
  },

  methods: {

    async refreshAccount(){
      utils.publish('refresh-current-account__account', {});
    },
    
    async transferCoupon(){
      const ref = this.$refs['dai_modal'];
      await ref.validate();
      this.$root.loading(true);
      try{
        const {target_address, amount, defrost} = this.dai_modal.form;

        const type = this.dai_modal.form.class;
        const vc = _.get(this.layer1_account, 'coupon_'+_.toLower(defrost)+'_'+type, null);

        if(!vc || amount > vc.amount){
          throw 'Not Enough Coupons for Class - '+type+' - '+defrost;
        }

        const layer1_instance = this.wf.getLayer1Instance();
        const api = layer1_instance.getApi();
        const tx = api.tx.cml.transferCoupon(target_address, type, defrost, amount);
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

    async lotteryHandler(n){
      let defrost = utils.consts.DefrostScheduleType.Investor;
      if(n === 0){
        defrost = utils.consts.DefrostScheduleType.Team;
      }

      const msg = `
        This will redeem all your ${defrost} coupons to Camellia seeds.
      `
      const x = await this.$confirm(msg, {
        title: 'Coupon redemption',
        dangerouslyUseHTMLString: true,
      }).catch(()=>{});
      if(!x) return false;

      this.$root.loading(true);
      try{
        const layer1_instance = this.wf.getLayer1Instance();
        const api = layer1_instance.getApi();

        const tx = api.tx.cml.drawCmlsFromCoupon(defrost);

        await layer1_instance.sendTx(this.layer1_account.address, tx);
        await this.refreshAccount();

        this.$message.success('success');

      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      
    },

    
  }

  
}
</script>