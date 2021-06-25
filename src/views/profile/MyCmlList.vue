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
 

  <!-- <el-dialog
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
    

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="staking_modal.visible = false">Close</el-button>
    </span>

  </el-dialog> -->

</div>
</template>
<script>
import SettingAccount from '../../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
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

  },

  methods: {
    
    showStakingSlot(scope){
      // console.log(11, scope.row, scope.$index);
      this.staking_modal.data = scope.row;

      this.staking_modal.visible = true;
    },

    
  }

  
}
</script>