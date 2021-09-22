<template>
<div class="tea-page" style="margin-left: 15px;">

  <h4>My bids</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <el-table 
    :data="auction.my_bid_list"
    stripe
    class="tea-table"
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
          @click="$root.goPath('/cml_details/'+scope.row.cml_id)"
          size="small"
          type="text">
          {{scope.row.cml_id}}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column
      prop="cml_type"
      label="Type"
    />

    <el-table-column
      prop="bid_price"
      label="Bid price"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.bid_price | balance"></span>
      </template>
    </el-table-column>

    <el-table-column
      prop="price"
      label="My price"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.price | balance" />
      </template>
    </el-table-column>

    
    
    <!-- <el-table-column
      prop="created_at"
      label="Created at"
    />
    <el-table-column
      prop="updated_at"
      label="Updated at"
    /> -->
    
    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-link class="tea-action-icon" title="Increase Bid" :underline="false" type="primary" icon="el-icon-plus" @click="addPriceForBid(scope)"></el-link>
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
import request from '../../request';

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
      _.delay(()=>{
        this.refreshList();
      }, 200);
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
      // let step = utils.toBN(api.consts.auction.minPriceForBid.toJSON());

      const rs = await request.layer1_rpc('auction_calculateMinimumBidPrice', [row.auction_id, this.layer1_account.address]);
      let min_price = utils.toBN(rs[0]);
      // min_price = min_price.sub(row.price);
      console.log('min-price => ', min_price.toString());

      return min_price;
    },
    async addPriceForBid(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const min_price = await this.calculateBidMinPrice(api, scope.row);

      if(min_price.lt(utils.toBN(0))){
        this.$root.showError('This auction is completed');
        await this.refreshList();
        return;
      }

      const msg = `You need to add at least <b>${utils.layer1.formatBalance(min_price, true)}</b> to your existing bid.`;

      let buy_now_need = null;

      const auction = scope.row.auction;
      if(auction.buy_now_price){
        buy_now_need = auction.buy_now_price;

        buy_now_need = buy_now_need.sub(scope.row.price);

        buy_now_need = utils.layer1.formatBalance(buy_now_need);
      }

      this.$store.commit('modal/open', {
        key: 'bid_for_auction', 
        param: {
          cml_id: scope.row.cml_id,
          msg,
          type: 'add',
          buy_now_price: auction.buy_now_price,
          buy_now_need,
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            const auction_id = scope.row.auction_id;     
            const price = utils.toBN(layer1_instance.asUnit(form.price));

            if(price.lt(min_price)){
              throw 'Please input higher bid price'
            }
            
            const tx = api.tx.auction.bidForAuction(auction_id, price);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            this.$root.success();
            close();

            await this.$store.dispatch('init_my_bid_list');
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },
    async deleteBid(scope){
      let is_highest = false;
      if(scope.row.auction.bid_user === this.layer1_account.address){
        // this.$root.showError('You can\'t delete this bid until someone bids higher.');
        // return;
        is_highest = true;
      }

      let title = 'Are you sure to delete this bid?';
      if(is_highest){

        const penalty = await request.layer1_rpc('auction_penaltyAmount', [scope.row.auction_id, this.layer1_account.address]);

        if(_.toNumber(penalty) > 0){
          title = 'You need to pay '+utils.layer1.balanceToAmount(penalty)+' TEA penalty due to you are the highest bider, Are you sure?';
        }

      }
      const x = await this.$confirm(title, "Delete bid").catch(()=>{});
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
    }
  }
}
</script>