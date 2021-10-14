<template>
<div class="tea-page">

  <TeaTable 
    :data="layer1_account ? layer1_account.cml : []"
    name="profile_cml_list_table"
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
          class="c-btn"
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
      width="90"
    >
      <template slot-scope="scope">
        {{scope.row.miner_status}}
      </template>
    </el-table-column>

    <el-table-column
      label="Staking status"
      width="160">
      <template slot-scope="scope">
        <el-button
          v-if="scope.row.staking_slot.length === 1"
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          Mining - 1 occupied slot
        </el-button>
        <!-- <span v-if="scope.row.staking_slot.length === 1">Mining - 1 occupied slot</span> -->
        <el-button
          v-if="scope.row.staking_slot.length>1"
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          Mining - {{scope.row.staking_slot.length}} occupied slots
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

    
  },

  methods: {
    
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

      mm.id = hexToString(mm.id);
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
      try{
        let msg = `Are you sure your miner is online and you wish to resume mining? <br/>
        Please note that you need to pay 100 TEA as a deposit.`;
        
        await this.$confirm(msg, {
          title: 'Notice',
          dangerouslyUseHTMLString: true,
        });
      }catch(e){
        return;
      } 


      await helper.resumeCmlMiner(this, scope.row.id, async ()=>{
        this.$root.success();
        utils.publish('refresh-current-account__account');
      });

    }

    
  }

  
}
</script>
