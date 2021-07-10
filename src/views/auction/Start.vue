<template>
<div class="tea-page">

  <span class="tea-info">
    Next trading window starts in <b class="block">{{next_window_block}}</b> blocks
  </span>

  <el-tabs tab-position="left" style="margin-top: 20px;" v-model="tab" @tab-click="clickTab()">
    <el-tab-pane name="auction_store" label="Auction store" :lazy="true">
      <AuctionStore />
    </el-tab-pane>
    <el-tab-pane name="my_auction" label="My auction" :lazy="true">
      <AccountAuction />
    </el-tab-pane>
    <el-tab-pane name="my_bid" label="My bid" :lazy="true">
      <AccountBid />
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script>
import {_} from 'tearust_utils';
import utils from '../../tea/utils';
import {mapState} from 'vuex';

import AuctionStore from './AuctionStore';
import AccountBid from './AccountBid';
import AccountAuction from './AccountAuction';
export default {
  components: {
    AuctionStore,
    AccountBid,
    AccountAuction,
  },
  data(){
    return {
      tab: 'auction_store'
    };
  },
  computed: {
    ...mapState([
      'chain'
    ]),
    next_window_block: (p)=>{
      if(!p.chain) return '...';
      const block = parseInt(p.chain.current_block, 10);
      if(!block) return '...';
      
      const window_size = p.chain.metadata.consts.auction.auctionDealWindowBLock.toJSON();
      if(!window_size) return 'invalid window size';

      const x = Math.ceil(block/window_size)*window_size;

      let rs = x - block;
      if(rs === window_size-1){
        // publish refresh event.
        p.clickTab();
      }

      return rs;
    }
  },
  methods: {
    clickTab(){
      const key = 'refresh_auction__'+this.tab;
      utils.publish(key, {});
    }
  },
  mounted(){
    utils.register('refresh-current-account__account', async (key, param={})=>{
      this.clickTab();
    });
  }
  
}
</script>