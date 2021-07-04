<template>
<div class="tea-page">

  <span class="tea-info">
    Next window block - {{next_window_block}}
  </span>

  <el-tabs tab-position="left" style="margin-top: 20px;" @tab-click="clickTab($event)">
    <el-tab-pane label="Auction Store" :lazy="true">
      <AuctionStore />
    </el-tab-pane>
    <el-tab-pane label="My Auction" :lazy="true">
      <AccountAuction />
    </el-tab-pane>
    <el-tab-pane label="My Bid" :lazy="true">
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
    return {};
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

      return x;
    }
  },
  methods: {
    clickTab(e){
      const label = e.label;

      utils.publish(label, {});

      console.log(1, this.chain);
    }
  }
  
}
</script>