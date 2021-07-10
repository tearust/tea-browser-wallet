import Vue from 'vue'
import Router from 'vue-router'


import Home from './views/Home';
// import SocialRecovery from './views/SocialRecovery';
import LoginAccount from './views/LoginAccount';
import Test from './views/Test';

import CalculateStakingProfit from './views/tools/CalculateStakingProfit';

import AuctionStoreStart from './views/auction/Start';
import LogIndex from './views/log/Index';

import LuckyDrawBox from './views/LuckyDrawBox';
import CmlDetails from './views/CmlDetails';

import PlantHelper from './views/PlantHelper';
import UserDetails from './views/UserDetails';

import MiningTreeList from './views/MiningTreeList';


Vue.use(Router);



let routers = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
  },
  {
    path: '/login_account',
    name: 'login_account',
    component: LoginAccount,
    meta: {
      needLogin: true
    }
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
    component: AuctionStoreStart,
  },
  {
    path: '/log',
    name: 'log',
    component: LogIndex,
  },
  {
    path: '/lucky_draw',
    name: 'lucky_draw',
    component: LuckyDrawBox,
  },
  {
    path: '/cml_details/:id',
    name: 'cml_details',
    component: CmlDetails,
  },
  {
    path: '/plant_helper/:cml_id',
    name: 'plant_helper',
    component: PlantHelper
  },
  {
    path: '/user_details/:address',
    name: 'user_details',
    component: UserDetails,
  },
  {
    path: '/top_tree_list',
    name: 'top_tree_list',
    component: MiningTreeList,
  }
  
];

export default new Router({
  routes: routers
})