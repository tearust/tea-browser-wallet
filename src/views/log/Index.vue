<template>
<div class="tea-page">
  <h4>My Logs</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshPage()"></el-button>
  <el-table 
    :data="my_log || []"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="type"
      label="Type"
      width="120"
    >
      <template slot-scope="scope">
        {{scope.row.type === 'tx' ? 'transaction': scope.row.type}}
      </template>
    </el-table-column>
    <el-table-column
      prop="name"
      label="Name"
    >
      <template slot-scope="scope">
        {{scope.row.name}}
      </template>
    </el-table-column>

    <el-table-column
      label="Auction ID"
    >
      <template slot-scope="scope">
        <el-button
          @click="showAuctionDetails(scope.row.auctionId)"
          type="text"
          size="small">
          {{scope.row.auctionId}}
        </el-button>
      </template>
    </el-table-column>

    <el-table-column
      label="CML ID"
    >
      <template slot-scope="scope">
        {{scope.row.cmlId}}
      </template>
    </el-table-column>

    <el-table-column
      label="Price"
    >
      <template slot-scope="scope">
        {{scope.row.price}}
      </template>
    </el-table-column>
    
    <el-table-column
      label="Amount"
    >
      <template slot-scope="scope">
        {{scope.row.amount}}
      </template>
    </el-table-column>

    <el-table-column
      label="Target user"
    >
      <template slot-scope="scope">
        {{scope.row.target}}
      </template>
    </el-table-column>

    <!-- <el-table-column
      prop="args"
      label="Arguments"
    >
      <template slot-scope="scope">
        {{scope.row.args}}
      </template>
    </el-table-column> -->
    <el-table-column
      prop="atBlock"
      label="At block"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.atBlock}}
      </template>
    </el-table-column>
    
  </el-table>

</div>
</template>

<script>
import {_} from 'tearust_utils';
import utils from '../../tea/utils';
import { mapState } from 'vuex';
import store from '../../store/index';
export default {
  components: {

  },
  data(){
    return {};
  },
  computed: {
    ...mapState('clog', {
      my_log:state => store.state.clog.my_log,
    })
  },
  async mounted(){
    this.$root.loading(true);
    await this.refreshPage();
    this.$root.loading(false);
  },
  methods: {
    async refreshPage(){
      await this.$store.dispatch('clog/init_my_auction_log', {});
    },

    showAuctionDetails(auction_id){
      this.$store.commit('modal/open', {
        key: 'log_details', 
        param: {
          type: 'auction_id', 
          value: auction_id,
        },
      });
    }
  }
  
}
</script>