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
      prop="lifespan"
      label="Life span"
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
      label="Defrost schedule"
      sortable
      width="150"
    />

    <el-table-column
      prop="defrost_day"
      label="Defrost day"
      sortable
      width="120"
    />

    <el-table-column
      prop="status"
      label="Status"
      width="120"
      sortable
    >
      <template slot-scope="scope">{{scope.row.status | str}}</template>
    </el-table-column>

    <el-table-column
      label="Staking status"
      width="150">
      <template slot-scope="scope">
        <span v-if="scope.row.staking_slot.length === 1">Myself</span>
        <el-button
          v-if="scope.row.staking_slot.length>1"
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          {{scope.row.staking_slot.length}}
        </el-button>
        <span v-if="scope.row.status === 'Staking'">
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
      width="200">
      <template slot-scope="scope">
        <el-button
          v-if="
            scope.row.generate_defrost_time<1 
            && (scope.row.status==='FrozenSeed' || scope.row.status==='FreshSeed')"
          @click="clickPlantAction(scope)"
          type="text"
          size="small">
          {{'Plant'}}
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
      // console.log(111, scope.row);
      this.$store.commit('modal/open', {
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
    }

    
  }

  
}
</script>