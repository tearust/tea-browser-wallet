<template>
<div class="tea-page">

  <h4>Top mining CML list</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <TeaTable 
    :data="list || []"
    name="top_mining_cml_list_table"
  >
    <el-table-column
      prop="id"
      sortable
      width="90"
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


    <!-- <el-table-column
      prop="liferemaining"
      label="Life remaining"
      sortable
      width="120"
    /> -->
    <el-table-column
      prop="liferemaining"
      label="Life remaining"
      sortable
      width="120"
    >
      <template slot-scope="scope">
        {{scope.row.life_day}}
      </template>
    </el-table-column>
    
    <el-table-column
      prop="machine_id"
      label="Miner ID"
      width="150"
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
      label="Performance"
      sortable
      width="110"
    />

    <el-table-column
      prop="defrost_schedule"
      label="Defrost schedule"
      sortable
      width="130"
    />

    <!-- <el-table-column
      prop="defrost_day"
      label="Defrost day"
      sortable
      width="120"
    /> -->

    <el-table-column
      prop="status"
      label="Status"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.status | str}}
      </template>
    </el-table-column>

    <el-table-column
      label="Total slots"
      prop="slot_len"
      sortable
      width="120">
      <template slot-scope="scope">
        <el-button
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          {{scope.row.slot_len}}
        </el-button>
      </template>
    </el-table-column>

    <!-- <el-table-column
      label="Staking status"
      width="180">
      <template slot-scope="scope">
        <el-button
          v-if="scope.row.staking_slot.length === 1"
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          Mining - 1 occupied slot
        </el-button>
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
    </el-table-column> -->

    <el-table-column
      label="Actions"
      
    >
      <template slot-scope="scope">
        <TeaIconButton tip="Stake" icon="invest" @click="openInvolveStakingModal(scope.row)" />
      </template>
    </el-table-column>
  </TeaTable>


</div>
</template>
<script>
import Base from '../workflow/Base';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString} from 'tearust_layer1';
import TeaTable from '../components/TeaTable';
import TeaIconButton from '../components/TeaIconButton';
import request from '../request';
export default {
  components: {
    TeaTable, TeaIconButton,
  },
  data(){
    return {
      list: null,
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  
  async mounted(){
    
    this.wf = new Base();
    await this.wf.init();
    await this.refreshList();

    utils.register('refresh-current-account__account', async (key, param={})=>{
      _.delay(()=>{
        this.refreshList()
      }, 200);
      
    });
  },

  methods: {
    async refreshList(){
      this.$root.loading(true);

      const cml_list = await request.layer1_rpc('cml_currentMiningCmlList',  []);
      const list = await this.wf.getCmlByList(cml_list);
      this.list = _.orderBy(list, ['slot_len'], ['desc']);

      this.$root.loading(false);
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


    async openInvolveStakingModal(row){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Staking invest',
          label_width: 200,
          pallet: 'cml',
          tx: 'startStaking',
          text: 'You can either stake 1000 TEA or one defrosted CML to a staking slot. You should leave "Staking with CML" empty if you\'re staking with TEA.',
          props: {
            staking_to: {
              type: 'Input',
              label: 'CML ID for staking',
              default: row.id,
              disabled: true,
            },
            staking_cml: {
              type: 'select',
              options: _.filter(this.layer1_account.cml, (item)=>{
                return item.generate_defrost_time < 1 && item.slot_len<1 && item.status !== 'Staking';
              }),
            },

            acceptable_slot_index: {
              type: 'number',
              label: 'Max allowable slippage',
              tip: 'Select how many levels you\'re willing to fall and still have your staking transaction executed if others are competing for a slot. <br/>Selecting 0 means you only want to stake at the currently available slot with no allowable slippage.',
              min: 0,
              default: 0
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            let index = form.acceptable_slot_index || 0;
            const cml_item = row;
              
            index = cml_item.slot_len + index;

            const tx = api.tx.cml.startStaking(form.staking_to, form.staking_cml||null, index);
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshList();

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