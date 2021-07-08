<template>
<div class="tea-page" style="margin-left: 15px;">

  <h4>My bid list</h4>
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
    >
      <template slot-scope="scope">
        <el-button
          @click="showCmlDetails(scope)"
          type="text"
          size="small">
          {{scope.row.cml_id}}
        </el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="price"
      label="My price"
    >
      <template slot-scope="scope">{{scope.row.price | formatBalance}}</template>
    </el-table-column>
    
    <el-table-column
      prop="created_at"
      label="Created at"
    />
    <el-table-column
      prop="updated_at"
      label="Updated at"
    />
    
    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-link class="tea-action-icon" title="Add Price" :underline="false" type="primary" icon="el-icon-plus" @click="addPriceForBid(scope)"></el-link>
        <el-link class="tea-action-icon" :underline="false" type="primary" icon="el-icon-delete" @click="deleteBid(scope)"></el-link>
        
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

    utils.register('refresh_auction__my_bid', async ()=>{
      await this.refreshList();
    });
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

    async calculateBidMinPrice(api, row){
      let step = api.consts.auction.minPriceForBid.toJSON();
      let min_price = 0;

      let bid_item = await api.query.auction.bidStore(row.auction.bid_user, row.auction_id);

      if(bid_item){
        bid_item = bid_item.toJSON();
        min_price = bid_item.price - row.price + step;
      }

      return min_price;
    },
    async addPriceForBid(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const min_price = await this.calculateBidMinPrice(api, scope.row);
      const msg = `You need at least ${utils.layer1.formatBalance(min_price)} to add price.`;


      this.$store.commit('modal/open', {
        key: 'bid_for_auction', 
        param: {
          cml_id: scope.row.cml_id,
          msg,
        },
        cb: async (form)=>{
          this.$root.loading(true);
          try{
            const auction_id = scope.row.auction_id;        
            const price = layer1_instance.asUnit(form.price);

            if(price < min_price){
              throw 'Not Enough balance.'
            }
            
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
    },
    async deleteBid(scope){
      if(scope.row.auction.bid_user === this.layer1_account.address){
        this.$message.error('You can delete this bid until anyone bid higher.');
        return;
      }

      const x = await this.$confirm("Are you sure to delete this bid?", "Danger Operation").catch(()=>{});
      if(!x) return;

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      try{
        const auction_id = scope.row.auction_id;

        const tx = api.tx.auction.removeBidForAuction(auction_id);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        await this.refreshList();
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },

    async showCmlDetails(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();
      const cml_data = await api.query.cml.cmlStore(scope.row.cml_id);
      const d = cml_data.toHuman();

      d.title = 'CML Details';
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: _.omit(d, 'staking_slot', 'miner_id'),
      });
    }
  }
}
</script>