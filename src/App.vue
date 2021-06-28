<template>
  <div id="app">
    <PageHeader />
    <section class="tea-section">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
      
    </section>
    
    <PageFooter />

    <QRCodeModal />
    <SelectLayer1Modal />

    <PutToAuctionStoreModal />
    <BidForAuctionModal />
    <DataDetailsModal />
    <TransferBalanceModal />
    <LogDetailsModal />
    <CommonTxModal />
    <StakingSlotModal />
  </div>
</template>

<script>
import PageHeader from './components/PageHeader';
import PageFooter from './components/PageFooter';

import QRCodeModal from './components/QRCodeModal';
import SelectLayer1Modal from './components/SelectLayer1Modal';

import PutToAuctionStoreModal from './views/modals/PutToAuctionStoreModal';
import BidForAuctionModal from './views/modals/BidForAuctionModal';
import DataDetailsModal from './views/modals/DataDetailsModal';
import TransferBalanceModal from './views/modals/TransferBalanceModal';
import LogDetailsModal from './views/modals/LogDetailsModal';
import CommonTxModal from './views/modals/CommonTxModal';
import StakingSlotModal from './views/modals/StakingSlotModal';

export default {
  components: {
    PageHeader,
    PageFooter,
    QRCodeModal,
    SelectLayer1Modal,
    
    PutToAuctionStoreModal,
    BidForAuctionModal,
    DataDetailsModal,
    TransferBalanceModal,
    LogDetailsModal,
    CommonTxModal,
    StakingSlotModal,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#app .tea-section{
  margin: 0 auto;
  width: 1080px;
  padding: 24px 0 40px;
}
</style>
