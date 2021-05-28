<template>
<div class="tea-page" style="margin-left: 15px;">

  <h4>My Auction</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <el-table 
    :data="auction.my_auction_list"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="id"
      label="Auction Id"
    />
    <el-table-column
      prop="cml_id"
      label="CML Id"
    />
    <!-- <el-table-column
      prop="cml_owner"
      label="CML Owner"
    /> -->
    <el-table-column
      prop="starting_price"
      label="Starting Price"
    />
    <el-table-column
      prop="buy_now_price"
      label="Buy Now Price"
    />
    <el-table-column
      prop="bid_price"
      label="Bid Price"
    />
    <el-table-column
      prop="status"
      label="Status"
    />
    
    <!-- <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-button
          @click="bidForAuctionItem(scope)"
          type="text"
          size="small">
          Bid
        </el-button>
        
      </template>
    </el-table-column> -->
  </el-table>
</div>
</template>

<script>
import {_} from 'tearust_utils';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import Auction from '../../workflow/Auction';
export default {
  data(){
    return {};
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState([
      'auction',
    ])
  },
  async mounted(){
    this.wf = new Auction();
    await this.wf.init();
    
    await this.refreshList();
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);
      try{
        await this.$store.dispatch('init_my_auction_list');
      }catch(e){
        this.$root.showError(e);
      }
      await utils.sleep(1000)
      this.$root.loading(false);
    },
    async bidForAuctionItem(scope){
    }
  }
}
</script>