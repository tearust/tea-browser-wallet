<template>
<div class="tea-page">

  <h4>Top mining CML list</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>

  <span>
    Total current performance : <b style="color: #35a696">{{total_current_performance}}</b>.
    Total remaining performance : <b style="color: #35a696">{{total_remaining_performance}}</b>.
  </span>
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
      width="120"
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
      width="160"
    />

    <el-table-column
      prop="remaining_performance"
      label="Remaining performance"
      sortable
      width="170"
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

      total_current_performance: 0,
      total_remaining_performance: 0,
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

    await this.wf.refreshCurrentAccount();
  },

  methods: {
    async refreshList(){
      this.$root.loading(true);

      const cml_list = await request.layer1_rpc('cml_currentMiningCmlList',  []);
      const list = await this.wf.getCmlByList(cml_list);
      this.list = _.orderBy(list, ['slot_len'], ['desc']);

      let s1 = 0;
      let s2 = 0;
      _.each(this.list, (item)=>{
        s1 += item.current_performance;
        s2 += item.remaining_performance;
      });
      this.total_current_performance = s1;
      this.total_remaining_performance = s2;

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
        key: 'common_form', 
        param: {
          title: 'Stake',
          label_width: 200,
          text: 'You can either stake 1000 TEA or one defrosted CML to a staking slot.',
          props: {
            staking_to: {
              type: 'Input',
              label: 'CML ID for staking',
              default: row.id,
              disabled: true,
              required: true,
            },

            is_tea: {
              type: 'switch',
              label: 'Stake type',
              el_props: {
                'active-text': '1000 TEA',
                'inactive-text': 'CML'
              },
              default: true,
            },

            staking_cml: {
              label: 'CML to stake',
              type: 'select',
              options: _.filter(this.layer1_account.cml, (item)=>{
                return item.defrost_day === '0' && item.slot_len<1 && item.status !== 'Staking';
              }),
              condition: {
                target: 'is_tea',
                value: false,
              },
              required: true,
              tip: 'The number of slots occupied depends on the class of CML seed. Type A takes 4 slots, Type B takes 2 slots, and Type C takes 1 slot.'
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
            let staking_cml = null;
            if(!form.is_tea){
              staking_cml = form.staking_cml;
            }

            let index = form.acceptable_slot_index || 0;
            const cml_item = row;
              
            index = cml_item.slot_len + index;

            const tx = api.tx.cml.startStaking(form.staking_to, staking_cml, index);
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshList();
            await this.wf.refreshCurrentAccount();

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
