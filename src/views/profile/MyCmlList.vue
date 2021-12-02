<template>
<div class="tea-page">

  <TeaTable 
    :data="list"
    name="profile_cml_list_table"
    v-loading="table_loading"
    :row-class-name="tableRowClassName"
  >
    <el-table-column
      prop="id"
      sortable
      label="CML ID"
    >
      <template slot-scope="scope">
        <el-button type="text" @click="$router.push('/cml_details/'+scope.row.id)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>
    <el-table-column
      prop="cml_type"
      label="Type"
      sortable
      width="70"
    />

    <el-table-column
      prop="liferemaining"
      label="Life remaining"
      width="120"
      sortable
    >
      <template slot-scope="scope">
        {{scope.row.life_day}}
      </template>
    </el-table-column>

    <el-table-column
      prop="machine_id"
      label="Miner ID"
      width="90"
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
      prop="performance"
      label="Current / Peak performance"
      width="110"
    />

    <el-table-column
      prop="remaining_performance"
      label="Remaining performance"
      width="100"
    />

    <el-table-column
      prop="generate_defrost_time"
      label="Defrost day"
      sortable
      width="110"
    >
      <template slot-scope="scope">
        {{scope.row.defrost_day}}
      </template>
    </el-table-column>

    <el-table-column
      prop="status"
      label="Status"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        {{scope.row.status | str}}
      </template>
    </el-table-column>
    <el-table-column
      prop="status"
      label="Miner status"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.miner_status}}
        <span v-if="scope.row.miner_ip"><br/>{{scope.row.miner_ip}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Staking status"
      width="180">
      <template slot-scope="scope">
        
        <el-button
          v-if="scope.row.staking_slot.length>=1"
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          Mining - {{scope.row.real_total}} occupied slots
        </el-button>
        <span v-if="scope.row.status === 'Staking'">
          Stake to
          <el-button
            @click="$root.goPath('/cml_details/'+scope.row.staking_cml_id)"
            type="text"
            size="small">
            CML{{scope.row.staking_cml_id}}
          </el-button> at slot #{{scope.row.staking_index}}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      label="Actions"
      fixed="right"
      width="120"
    >
      <template slot-scope="scope">
        <TeaIconButton
          :disabled="
            !(scope.row.defrost_day==='0' 
            && scope.row.status!=='Staking'
            && scope.row.staking_slot.length<1)"
          @click="clickPlantAction(scope)"
          tip="Plant"
          icon="plant"
        />
        <TeaIconButton
          :disabled="
            scope.row.staking_slot.length<1
          "
          @click="clickUnplantAction(scope)"
          tip="Unplant"
          icon="stop"
        />

        <TeaIconButton
          :disabled="
            !(scope.row.status==='FrozenSeed'
            && scope.row.staking_slot.length<1)"
          @click="pawnCmlToGB(scope)"
          tip="Deposit for loan"
          icon="bank"
        />
        <TeaIconButton
          v-if="
            (scope.row.miner_status &&
            scope.row.miner_status === 'Offline')
          "
          @click="resumeMiner(scope)"
          tip="Resume miner"
          icon="fixed"
        />

        <TeaIconButton
          v-if="
            scope.row.version_expired
          "
          style="color: rgb(245, 108, 108);"
          @click="fixVersionExpired(scope)"
          tip="Reset expired versions for miner"
          icon="fixed"
        />
      </template>
    </el-table-column>
  </TeaTable>


</div>
</template>
<script>
import SettingAccount from '../../workflow/SettingAccount';
import {_} from 'tearust_utils';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString, stringToHex, hexToU8a, compactAddLength, u8aToHex} from 'tearust_layer1';
import TeaTable from '../../components/TeaTable';
import TeaIconButton from '../../components/TeaIconButton';
import request from '../../request';
import helper from '../helper';
export default {
  components: {
    TeaTable,
    TeaIconButton,
  },
  data(){
    return {
      staking_modal: {
        visible: false,
        data: null,
      },
      list: [],
      table_loading: true,
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  
  async mounted(){
    
    this.wf = new SettingAccount();
    await this.wf.init();

    utils.register('refresh-current-account__my_cml', async ()=>{
      await this.refresh();
    });
    
    await this.refresh();
  },

  methods: {

    async refresh(){
      this.table_loading = true;

      this.list = await this.initCheckMinerVersion();
      this.table_loading = false;
    },

    async initCheckMinerVersion(){
      let expired_miner_list = [];
      try{
        await request.layer1_rpc('tea_versionExpiredNodes', []);
      }catch(e){}
      
      const cml_list = this.layer1_account.cml;
      _.each(expired_miner_list, (mm)=>{
        const miner_id = u8aToHex(mm);

        const cml_index = _.findIndex(cml_list, (c)=>{
          return c.machine_id === miner_id;
        });
        if(cml_index > -1){
          cml_list[cml_index].version_expired = true;
        }
      });
      
      return cml_list;
    },
    
    showStakingSlot(scope){
      // console.log(111, scope.row);
      this.$store.dispatch('modal/open', {
        key: 'staking_slot',
        param: {
          list: scope.row.staking_slot,
          cml_id: scope.row.id,
        }
      });
    },

    async showMinerInfo(miner_id){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let mm = await api.query.cml.minerItemStore(miner_id);
      mm = mm.toJSON();

      mm.id = ' '+mm.id;
      mm.ip = hexToString(mm.ip);
      
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: {
          ...mm,
          title: 'Miner Details',
        },
      });
    },

    clickPlantAction(scope){
      if(this.layer1_account.balance <= 1001){
        this.$root.showError('You need at least 1001 TEA to plant CML. You can put up some of your extra <a href="https://github.com/tearust/teaproject/wiki/Genesis-TEA-Loans" target="_blank">CML seeds for a Genesis Loan</a> and receive TEA in return.');

        return;
      }

      this.$router.push('/plant_helper/'+scope.row.id);
    },

    async pawnCmlToGB(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'deposit_loan', 
        param: {
          cml_id: scope.row.id
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            
            // thanks for https://github.com/polkadot-js/api/issues/2624
            let asset_id = api.registry.createType('u64', form.id);
            asset_id = u8aToHex(asset_id.toU8a());

            const tx = api.tx.genesisBank.applyLoanGenesisBank(asset_id, form.asset_type);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            this.$root.success();
            close();
            utils.publish('refresh-current-account__account');
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },

    async clickUnplantAction(scope){

      const tmp = await request.layer1_rpc('cml_estimateStopMiningPenalty', [scope.row.id]);
      const ct = utils.layer1.balanceToAmount(tmp);
      try{
        let msg = 'Are you sure you want to unplant this CML? <br/>';
        if(ct > 0){
          msg = `Please note that you'll need to compensate a total of ${ct} TEA to stakers.`;
        }

        await this.$confirm(msg, {
          title: 'Info',
          dangerouslyUseHTMLString: true,
        });
      }catch(e){
        return;
      }

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      try{

        const tx = api.tx.cml.stopMining(scope.row.id, scope.row.machine_id);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        this.$root.success();
        utils.publish('refresh-current-account__account');
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    async resumeMiner(scope){
      await helper.resumeMiner(this, scope.row.id, async ()=>{
        this.$root.success();
        utils.publish('refresh-current-account__account');
      });
    },
    tableRowClassName({row}){
      if(row.version_expired){
        return 'v-error';
      }
      return '';
    },
    async fixVersionExpired(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      // TODO
      const fixed_html = `
        Please fix your miner program versions as below. <br/>
        <ol>
          <li>aaaa</li>
          <li>bbbb</li>
          <li>cccc</li>
        </ol>
      `;

      this.$store.commit('modal/open', {
        key: 'common_form', 
        param: {
          title: 'Reset expired version for miner',
          label_width: 310,
          text: fixed_html,
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
        
          try{
            const tx = api.tx.tea.resetExpiredState(scope.row.machine_id);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            await utils.sleep(2000);
            close();
            await this.refresh();
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
