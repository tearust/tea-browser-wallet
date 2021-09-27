<template>
<div class="tea-page" style="margin-left: 15px;">

  <h4>Auction list</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>

  <el-table 
    :data="auction.auction_list"
    stripe
    class="tea-table"
    size="small"
    border
  >
    <el-table-column
      prop="id"
      label="Auction ID"
      width="80"
    />
    <el-table-column
      prop="cml_id"
      label="CML ID"
      width="60"
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
      width="50"
    />

    <el-table-column
      prop="liferemaining"
      label="Life remaining"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.cml.life_day}}
      </template>
    </el-table-column>
    <el-table-column
      prop="cml.performance"
      label="Current / Peak performance"
      width="110"
    />
    <el-table-column
      prop="generate_defrost_time"
      label="Defrost day"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.cml.defrost_day}}
      </template>
    </el-table-column>

    <el-table-column
      prop="starting_price"
      label="Starting price"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.starting_price | balance" />
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
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-button
          @click="bidForAuctionItem(scope)"
          type="text"
          :disabled="scope.row.cml_owner === layer1_account.address"
          size="small">
          {{scope.row.for_current ? 'Add' : 'Bid'}}
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

    utils.register('refresh_auction__auction_store', async ()=>{
      _.delay(()=>{
        this.refreshList();
      }, 200);
    });
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);
      try{
        await this.$store.dispatch('init_auction_store');
      }catch(e){
        this.$root.showError(e);
      }

      this.$root.loading(false);
    },

    async bidForAuctionItem(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let buy_now_need = null;
      if(scope.row.buy_now_price){
        buy_now_need = scope.row.buy_now_price;
        
        if(scope.row.for_current){
          buy_now_need = buy_now_need.sub(scope.row.for_current.price);
        }
        buy_now_need = utils.layer1.formatBalance(buy_now_need);
      }
      
      this.$store.commit('modal/open', {
        key: 'bid_for_auction', 
        param: {
          cml_id: scope.row.cml_id,
          auction_id: scope.row.id,
          type: scope.row.for_current ? 'add' : 'new',
          buy_now_price: scope.row.buy_now_price,
          auction: scope.row,
          buy_now_need,
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            const auction_id = scope.row.id;        
            const price = utils.toBN(layer1_instance.asUnit(form.price));

            const tx = api.tx.auction.bidForAuction(auction_id, price);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            this.$root.success();
            close();

            await this.$store.dispatch('init_auction_store');
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