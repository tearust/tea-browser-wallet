<template>
<div class="tea-page">
  <h4>Auction List</h4>
  <el-table 
    :data="auction.auction_list"
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
    
    <el-table-column
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
    </el-table-column>
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
    this.$root.loading(true);
    this.wf = new Auction();
    await this.wf.init();
    try{
      await this.$store.dispatch('init_auction_store', 10, true);
    }catch(e){
      this.$root.showError(e);
    }
    await utils.sleep(1000)
    this.$root.loading(false);
  },
  methods: {
    async bidForAuctionItem(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'bid_for_auction', 
        param: {
          cml_id: scope.row.cml_id,
        },
        cb: async (form)=>{
          this.$root.loading(true);
          try{
            const auction_id = scope.row.id;        
            const price = layer1_instance.asUnit(form.price);
            
            console.log(11, price);

            const tx = api.tx.auction.bidForAuction(auction_id, price);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            this.$message.success('success');
            this.$store.commit('modal/close', 'bid_for_auction');
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