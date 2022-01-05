<template>
  <el-dialog
    title="Camellia details"
    :visible="visible"
    width="80%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @close="$store.commit('modal/close', 'cml_details')"
  >

    <el-table 
      :data="param.cml ? [param.cml] : []"
      stripe
      size="small"
      border
    >
      <el-table-column
        prop="id"
        width="90"
        label="CML ID"
      />
      <el-table-column
        prop="cml_type"
        label="Type"
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
      </el-table-column>

      <el-table-column
        prop="performance"
        label="Current / Peak performance"
        width="160"
      />

      <el-table-column
        prop="defrost_schedule"
        label="Defrost schedule"
        width="150"
      />

      <el-table-column
        prop="defrost_day"
        label="Defrost day"
        width="120"
      />

      

      <el-table-column
        prop="status"
        label="Status"
      />
    </el-table>


    <h6>Staking slot</h6>
    <el-table 
      :data="param.cml ? param.cml.staking_slot : []"
      stripe
      size="small"
      border
    >
      <el-table-column
        label="Index"
        width="100"
      >
        <template slot-scope="scope">{{scope.$index}}</template>
      </el-table-column>
      <el-table-column
        prop="owner"
        label="Owner"
      />
      <el-table-column
        prop="category"
        label="Category"
        width="90"
      />

      <el-table-column
        label="Amount"
        width="150"
      >
        <template v-if="scope.row.amount" slot-scope="scope">{{scope.row.amount | formatBalance}}</template>
      </el-table-column>
      
      
    </el-table>




    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="$store.commit('modal/close', 'cml_details')">Close</el-button>
    </span>

  </el-dialog>


</template>
<script>
import { mapState } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
export default {
  data(){
    return {
      form: {
        price: null,
      }
    };
  },
  computed: {
    ...mapState('modal', {
      visible: state => store.state.modal.cml_details.visible,
      param: state => store.state.modal.cml_details.param,
    })
  },

  methods: {
    async transferToControllerAccount(){

    }
  }
}
</script>