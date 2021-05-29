<template>
<div class="tea-page">
  <el-tabs tab-position="left" @tab-click="clickTab($event)">
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
  methods: {
    clickTab(e){
      const label = e.label;

      utils.publish(label, {});
    }
  }
  
}
</script>