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
        <span>{{layer1_account ? layer1_account.address : ''}}</span>
      </div>
      <div class="x-item">
        <b>TOTAL BALANCE</b>
        <span>{{layer1_account ? layer1_account.balance : ''}}</span>
      </div>
      <div class="x-item">
        <b>LOCK BALANCE</b>
        <span>{{layer1_account ? layer1_account.lock_balance : ''}}</span>
      </div>

    </div>

    <div class="x-right">
      <el-button @click="showSelectLayer1()">CHANGE</el-button>
      <el-button v-if="layer1_account.address" @click="rechargeHandler()">TOP UP</el-button>
      <el-button v-if="layer1_account.address" @click="transferBalance()">TRANSFER</el-button>
    </div>

  </div>

  <el-divider />

  <div v-if="
    layer1_account && (layer1_account.voucher_A || layer1_account.voucher_B || layer1_account.voucher_C)
  ">
  <div class="tea-card">
    <i class="x-icon el-icon-user"></i>

    <div class="x-list">
      <div class="x-item">
        <b>VOUCHER</b>
      </div>
      <div class="x-item">
        <b>TYPE - A</b>
        <span>{{(layer1_account && layer1_account.voucher_A) ? layer1_account.voucher_A.amount : 0}}</span>
      </div>
      <div class="x-item">
        <b>TYPE - B</b>
        <span>{{(layer1_account && layer1_account.voucher_B) ? layer1_account.voucher_B.amount : 0}}</span>
      </div>
      <div class="x-item">
        <b>TYPE - C</b>
        <span>{{(layer1_account && layer1_account.voucher_C) ? layer1_account.voucher_C.amount : 0}}</span>
      </div>

    </div>

    <div class="x-right">
      <el-button @click="lotteryHandler()">LOTTERY</el-button>
      <el-button @click="dai_modal.visible=true">TRANSFER</el-button>
    </div>

  </div>

  <el-divider />
  </div>

  <h4>CML LIST</h4>
  <el-table 
    :data="layer1_account ? layer1_account.cml : []"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="id"
      sortable
      label="CML ID"
    />
    <el-table-column
      prop="cml_type"
      label="Type"
      sortable
      width="70"
    />
    <el-table-column
      prop="group"
      label="Group"
    />
    <el-table-column
      prop="lifespan"
      label="Life Time"
    />
    <el-table-column
      prop="machine_id"
      label="Miner ID"
    > 
      <template slot-scope="scope">
        <el-button
          @click="showMinerInfo(scope.row.machine_id)"
          type="text"
          size="small">
          {{scope.row.machine_id}}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column
      prop="mining_rate"
      label="Mining Rate"
    />

    <el-table-column
      prop="performance"
      label="Performance"
      sortable
      width="120"
    />

    <el-table-column
      prop="defrost_schedule"
      label="Deforst Schedule"
      width="120"
    />

    <el-table-column
      prop="generate_defrost_time"
      label="Deforst Block"
      sortable
      width="120"
    />

    <el-table-column
      prop="status"
      label="Status"
    />

    <el-table-column
      label="Actions"
      width="120">
      <!-- <template slot-scope="scope">
        <el-button
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          Staking List
        </el-button>
      </template> -->
    </el-table-column>
  </el-table>
 



  <el-dialog
    title="Transfer Voucher"
    :visible.sync="dai_modal.visible"
    width="900"
    :close-on-click-modal="false"
    custom-class="tea-modal"
  >

    <p style="margin:0 15px 40px; font-size:15px;">
      Transfer Voucher to another account.
    </p>
    <el-form :model="dai_modal.form" :rules="dai_modal.rules" ref="dai_modal" label-width="120px">
      <el-form-item label="Target Address" prop="target_address">
        <el-input v-model="dai_modal.form.target_address"></el-input>
      </el-form-item>

      <el-form-item label="Class Type" prop="class">
        <el-select v-model="dai_modal.form.class" placeholder="Please Select Class">
          <el-option
            v-for="val in dai_modal.class_options"
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

  <el-dialog
    title="Staking List"
    :visible.sync="staking_modal.visible"
    width="70%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
  >
    <h4>{{staking_modal.data ? staking_modal.data.id : ''}}</h4>
    <el-table 
      :data="staking_modal.data ? staking_modal.data.staking_slot : []"
      stripe
      size="small"
      border
    >
      <el-table-column
        prop="owner"
        label="Owner"
      />
      <el-table-column
        prop="category"
        label="Category"
      />
      <el-table-column
        prop="amount"
        label="Amount"
      />
      
      <el-table-column
        label="Actions"
        width="120">
        <!-- <template slot-scope="scope">
          <el-button
            @click="showStakingSlot(scope)"
            type="text"
            size="small">
            Staking List
          </el-button>
        </template> -->
      </el-table-column>
    </el-table>
    

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="staking_modal.visible = false">Close</el-button>
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
export default {
  data(){
    return {
      dai_modal: {
        visible: false,
        form: {
          target_address: '',
          amount: null,
          class: null,
        },
        rules: {
          target_address: [
            { required: true },
          ],
          amount: [],
          class: [
            { required: true },
          ]
        },
        class_options: [],
      },
      staking_modal: {
        visible: false,
        data: null,
      }
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState([
      'bind_mobile'
    ])
  },
  
  async mounted(){
    this.dai_modal.class_options = utils.consts.CmlType;

    this.$root.loading(true);

    this.wf = new SettingAccount();
    await this.wf.init();

    await this.refreshAccount();
    this.$root.loading(false);
    console.log(this.layer1_account)

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

    async refreshAccount(){
      await this.wf.refreshCurrentAccount();
    },


    showStakingSlot(scope){
      // console.log(11, scope.row, scope.$index);
      this.staking_modal.data = scope.row;

      this.staking_modal.visible = true;
    },

    async lotteryHandler(){
      const msg = `
        Lottery will transfer all your vouchers to Camellia Seeds.
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
        const tx = api.tx.cml.drawCmlsFromVoucher();

        await layer1_instance.sendTx(this.layer1_account.address, tx);
        await this.refreshAccount();

        this.$message.success('success');

      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      
    },

    async showMinerInfo(miner_id){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const mm = await api.query.cml.minerItemStore(miner_id);

      alert(JSON.stringify(mm.toHuman()));
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
        const {target_address, amount} = this.dai_modal.form;

        const type = this.dai_modal.form.class;
        const vc = _.get(this.layer1_account, 'voucher_'+type, null);

        if(vc && amount > vc.amount){
          throw 'Not Enough Vouchers for Class - '+type;
        }

        const layer1_instance = this.wf.getLayer1Instance();
        const api = layer1_instance.getApi();
        const tx = api.tx.cml.transferVoucher(target_address, type, amount);
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