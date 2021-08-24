<template>
<div class="tea-page" style="margin-left: 15px;">

  <h4>My auctions</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <el-table 
    :data="auction.my_auction_list"
    stripe
    class="tea-table"
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
        <el-button size="small" type="text" @click="$root.goPath('/cml_details/'+scope.row.cml_id)">{{scope.row.cml_id}}</el-button>
      </template>
    </el-table-column>
    <el-table-column
      prop="cml_type"
      label="Type"
    />

    <el-table-column
      prop="starting_price"
      label="Starting price"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.starting_price | bn_balance" />
      </template>
    </el-table-column>

    <el-table-column
      prop="buy_now_price"
      label="Buy now price"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.buy_now_price | balance"></span>
      </template>
    </el-table-column>

    <el-table-column
      prop="bid_price"
      label="Bid price"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.bid_price | balance"></span>
      </template>
    </el-table-column>

    <el-table-column
      prop="status"
      label="Status"
    />
    
    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-link class="tea-action-icon" title="Bids" :underline="false" type="primary" icon="el-icon-view" @click="viewBidList(scope)"></el-link>
        <el-link class="tea-action-icon" :underline="false" type="primary" icon="el-icon-delete" @click="deleteAuction(scope)"></el-link>
        
      </template>
    </el-table-column>
  </el-table>

  <div style="display:flex; justify-content: flex-end;">
    <el-button style="width:40%;margin-top: 40px;" type="primary" @click="openPutAuctionModal()">Add new auction</el-button>
  </div>
</div>
</template>

<script>
import {_} from 'tearust_utils';
import {numberToHex, numberToBn, hexToBn} from 'tearust_layer1';
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

    utils.register('refresh_auction__my_auction', async ()=>{
      _.delay(()=>{
        this.refreshList();
      }, 200);
    });
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
    },

    async openPutAuctionModal(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'put_to_auction_store', 
        param: {},
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            const cml_id = form.cml_id;
            let p1 = layer1_instance.asUnit(form.starting_price);
            let p2 = form.buy_now_price ? layer1_instance.asUnit(form.buy_now_price) : null;

            if(p2 && p2<=p1){
              throw 'BuyNowPriceShouldHigherThanStartingPrice';
            }

            if(p2){
              p2 = utils.toBN(p2);
            }
            p1 = utils.toBN(p1);

            const tx = api.tx.auction.putToStore(cml_id, p1, p2, form.auto_renew);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            close();

            await this.refreshList();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },

    async deleteAuction(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let tmp = await api.query.auction.auctionBidStore(scope.row.id);
      tmp = tmp.toJSON();
      const len = tmp ? tmp.length : 0;
      const penalty = api.consts.auction.auctionOwnerPenaltyForEachBid.toJSON() * len;

      const msg = penalty > 0 ? `Remove this auction will charge you ${utils.layer1.formatBalance(penalty)} TEA, Are you sure?` : 'Are you sure to delete this auction?';

      const x = await this.$confirm(msg, "Delete Auction").catch(()=>{});
      if(!x) return false;

      this.$root.loading(true);
      try{
        const auction_id = scope.row.id;

        const tx = api.tx.auction.removeFromStore(auction_id);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        await this.refreshList();
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },

    async viewBidList(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const bid_user = await api.query.auction.auctionBidStore(scope.row.id);
      const bid_user_data = bid_user.toJSON();

      
      const list = await Promise.all(_.map(bid_user_data, async (user)=>{
        const bid_item = await api.query.auction.bidStore(user, scope.row.id);
        const tmp = bid_item.toHuman();
        tmp.ori_price = _.get(bid_item.toJSON(), 'price');
        return tmp;
      }));
      

      list.sort((a, b)=>{
        return b.ori_price - a.ori_price;
      });

      const param = {};
      _.each(list, (item)=>{
        const price = utils.layer1.formatBalance(item.ori_price, true);
        _.set(param, item.user, price);
      });

      param.title = 'Active bids';
      this.$store.commit('modal/open', {
        key: 'data_details',
        param,
      });
      
    }
  }
}
</script>