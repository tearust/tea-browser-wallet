<template>
<div class="tea-page" style="margin-left: 15px;">

  <h4>Auction List</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>

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
    <!-- <el-table-column
      prop="cml_owner"
      label="CML Owner"
    /> -->
    <el-table-column
      prop="starting_price"
      label="Starting Price"
    >
      <template slot-scope="scope">
        {{scope.row.starting_price | formatBalance}}
      </template>
    </el-table-column>

    <el-table-column
      prop="buy_now_price"
      label="Buy Now Price"
    >
      <template slot-scope="scope">
        {{scope.row.buy_now_price | formatBalance}}
      </template>
    </el-table-column>

    <el-table-column
      prop="bid_price"
      label="Bid Price"
    >
      <template slot-scope="scope">
        {{scope.row.bid_price | formatBalance}}
      </template>
    </el-table-column>
    
    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-button
          @click="bidForAuctionItem(scope)"
          type="text"
          :disabled="scope.row.cml_owner === layer1_account.address"
          size="small">
          {{scope.row.for_current ? 'ADD' : 'BID'}}
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

    utils.register('Auction Store', async ()=>{
      await this.refreshList();
    });
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);
      try{
        await this.$store.dispatch('init_auction_store', {
          page_size: 100,
          from_start: true,
        });
      }catch(e){
        this.$root.showError(e);
      }
      await utils.sleep(1000)
      this.$root.loading(false);
    },

    calculateBidMinPrice(api, row){
      let step = api.consts.auction.minPriceForBid.toJSON();
      let min_price = row.starting_price + step;

      if(row.bid_user){
        min_price = row.bid_price + step;
      }

      if(row.for_current){
        min_price = min_price - row.for_current.price;
      }

      return min_price;
    },

    async bidForAuctionItem(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const min_price = this.calculateBidMinPrice(api, scope.row);

      const msg = `You need at least ${utils.layer1.formatBalance(min_price)} to ${scope.row.for_current ? 'add price' : 'bid this auction'}`;

      this.$store.commit('modal/open', {
        key: 'bid_for_auction', 
        param: {
          cml_id: scope.row.cml_id,
          msg,
        },
        cb: async (form)=>{
          this.$root.loading(true);
          try{
            const auction_id = scope.row.id;        
            const price = layer1_instance.asUnit(form.price);
            
            if(price < min_price){
              throw 'Not Enough balance.'
            }

            const tx = api.tx.auction.bidForAuction(auction_id, price);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            this.$message.success('success');
            this.$store.commit('modal/close', 'bid_for_auction');

            await this.$store.dispatch('init_auction_store', {
              page_size: 100,
              from_start: true,
            });
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
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