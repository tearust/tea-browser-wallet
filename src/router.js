import Vue from 'vue'
import Router from 'vue-router'


import Home from './views/Home';
// import SocialRecovery from './views/SocialRecovery';
import LoginAccount from './views/LoginAccount';
import Test from './views/Test';

import CalculateStakingProfit from './views/tools/CalculateStakingProfit';

import AuctionStore from './views/auction/AuctionStore';


Vue.use(Router);



let routers = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      needLogin: true
    }
  },
  {
    path: '/login_account',
    name: 'login_account',
    component: LoginAccount,
  },
  
  {
    path: '/test',
    name: 'test',
    component: Test,
    meta: {
      needLogin: true
    }
  },

  {
    path: '/tools/calculate_staking_profit',
    name: 'calculate_staking_profit',
    component: CalculateStakingProfit,
  },

  {
    path: '/auction_store',
    name: 'auction_store',
    component: AuctionStore,
  }
  
];

export default new Router({
  routes: routers
})