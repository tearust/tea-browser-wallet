<template>
<div class="tea-page">

  <el-table 
    :data="layer1_account ? layer1_account.cml : []"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="id"
      sortable
      width="90"
      label="CML ID"
    />
    <el-table-column
      prop="cml_type"
      label="Type"
      sortable
      width="70"
    />

    <el-table-column
      prop="lifespan"
      label="Life Span"
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
      prop="performance"
      label="Performance"
      sortable
      width="120"
    />

    <el-table-column
      prop="defrost_schedule"
      label="Deforst Schedule"
      sortable
      width="150"
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
      label="Staking Slot"
      width="120">
      <template slot-scope="scope">
        <el-button
          v-if="scope.row.staking_slot.length>0"
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          {{scope.row.staking_slot.length}}
        </el-button>
      </template>
    </el-table-column>
  </el-table>


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
  },
  
  async mounted(){
    this.wf = new SettingAccount();
    await this.wf.init();
  },

  methods: {
    
    showStakingSlot(scope){
      this.$store.commit('modal/open', {
        key: 'staking_slot',
        param: {
          list: scope.row.staking_slot
        }
      });
    },

    async showMinerInfo(miner_id){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let mm = await api.query.cml.minerItemStore(miner_id);
      mm = mm.toJSON();

      mm.id = hexToString(mm.id);
      
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: {
          ...mm,
          title: 'Miner Details',
        },
      });
    },

    
  }

  
}
</script>