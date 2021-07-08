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
    <p>Cml Id: {{param.cml_id}}</p>
    <el-table 
      v-if="param.list"
      :data="param.list"
      class="tea-table"
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
        label="Staker"
      />
      <el-table-column
        prop="category"
        label="Staking with"
        width="120"
      />

      <el-table-column
        label="Staking CML ID"
        width="180"
      >
        <template slot-scope="scope">{{scope.row.cml}}</template>
      </el-table-column>

      <el-table-column
        label="Amount"
        width="150"
      >
        <template v-if="scope.row.amount" slot-scope="scope">
          <span :inner-html.prop="scope.row.amount | balance"></span>
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
      this.wf = new Base();
      await this.wf.init();
      await utils.waitLayer1Ready(this.wf.layer1);
      this.layer1_instance = this.wf.getLayer1Instance();
      this.api = this.layer1_instance.getApi();
    },

    close(){
      this.$store.commit('modal/close', 'staking_slot');
    },

    
  }
}
</script>