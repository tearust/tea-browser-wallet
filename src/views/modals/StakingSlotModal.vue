<template>

  <el-dialog
    title="Staking Slot List"
    :visible="visible"
    width="80%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <el-table 
      v-if="param.list"
      :data="param.list"
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
        width="350"
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

      <el-table-column
        label="Cml Id"
        width="150"
      >
        <template slot-scope="scope">{{scope.row.cml}}</template>
      </el-table-column>
      
      <el-table-column
        label="Actions"
      >
        <template slot-scope="scope">
          <el-link class="tea-action-icon" 
            :underline="false" 
            type="primary" 
            icon="el-icon-delete" 
            @click="removeStaking(scope)"
            :disabled="layer1_account.address !== scope.row.owner || scope.$index<1"
          ></el-link>
        </template>
      </el-table-column>
    </el-table>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="close()">Close</el-button>
    </span>

  </el-dialog>


</template>
<script>
import { mapState, mapGetters } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';

export default {
  data(){
    return {

    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible:state => store.state.modal.staking_slot.visible,
      // title: state => store.state.modal.common_tx.title,
      param: state => store.state.modal.staking_slot.param,
    })
  },

  methods: {
    async openHandler(){
      
    },
    close(){
      this.$store.commit('modal/close', 'staking_slot');
    },
    async removeStaking(scope){
console.log(111, scope);
    }
  }
}
</script>