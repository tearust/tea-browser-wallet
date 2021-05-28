<template>
<div class="tea-page" style="margin-left: 15px;">

  <h4>My Bid List</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <el-table 
    :data="auction.my_bid_list"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="auction_id"
      label="Auction Id"
    />
    <el-table-column
      prop="cml_id"
      label="CML Id"
    />
    <el-table-column
      prop="price"
      label="My Price"
    />
    
    <el-table-column
      prop="created_at"
      label="Created At"
    />
    <el-table-column
      prop="updated_at"
      label="Updated At"
    />
    
    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-button
          @click="addPriceForBid(scope)"
          type="text"
          size="small">
          Add Price
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
    this.wf = new Auction();
    await this.wf.init();

    await this.refreshList();
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);
      try{
        await this.$store.dispatch('init_my_bid_list');
      }catch(e){
        this.$root.showError(e);
      }
      await utils.sleep(1000)
      this.$root.loading(false);
    },
    async addPriceForBid(scope){
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
            const auction_id = scope.row.auction_id;        
            const price = layer1_instance.asUnit(form.price);
            
            const tx = api.tx.auction.bidForAuction(auction_id, price);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            this.$message.success('success');
            this.$store.commit('modal/close', 'bid_for_auction');

            await this.$store.dispatch('init_my_bid_list');
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