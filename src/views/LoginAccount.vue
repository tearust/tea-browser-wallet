<template>
<div class="tea-page h-center">

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
        <b>BALANCE</b>
        <span>{{layer1_account ? layer1_account.balance : ''}}</span>
      </div>

    </div>

    <div class="x-right">
      <el-button @click="showSelectLayer1()">CHANGE</el-button>
      <el-button v-if="layer1_account.address" @click="rechargeHandler()">TOP UP</el-button>
    </div>
  </div>

  <el-divider />

  <div class="tea-card">
    <i class="x-icon el-icon-user"></i>

    <div class="x-list">
      <div class="x-item">
        <b>DAI</b>
        <span>{{layer1_account ? layer1_account.dai : ''}}</span>
      </div>

    </div>

    <div class="x-right">
      <el-button @click="convertDaiToCml()">CONVERT</el-button>
      
    </div>
  </div>

  <el-divider />
  <el-table 
    :data="layer1_account ? layer1_account.cml : []"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="id"
      label="NTF ID"
    />
    <el-table-column
      prop="group"
      label="Group"
    />
    <el-table-column
      prop="life_time"
      label="Life Time"
    />
    <el-table-column
      prop="miner_id"
      label="Miner ID"
    />
    <el-table-column
      prop="mining_rate"
      label="Mining Rate"
    />
    <el-table-column
      prop="status"
      label="Status"
    />
    <el-table-column
      prop="created_at"
      label="Created At"
    />
    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-button
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          Staking List
        </el-button>
      </template>
    </el-table-column>
  </el-table>
 
  
</div>
</template>
<script>
import SettingAccount from '../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import { mapGetters, mapState } from 'vuex'
export default {
  data(){
    return {
      
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

    async convertDaiToCml(){
      try{
        const layer1_instance = this.wf.getLayer1Instance();
        const api = layer1_instance.getApi();
        const convert_tx = api.tx.assets.convertCmlFromDai();

        await layer1_instance.sendTx(this.layer1_account.address, convert_tx);
        await this.refreshAccount();
      }catch(e){
        this.$root.showError(e);
      }
      
    },

    showStakingSlot(scope){
      console.log(11, scope.row, scope.$index);
    }

    
  }

  
}
</script>