import Vuex from 'vuex';
import Vue from 'vue';
import _ from 'lodash';

import Base from '../workflow/Base';

import modal from './modal';
import clog from './clog';
import utils from '../tea/utils';

Vue.use(Vuex);

const F = {
  async getLayer1(){
    const wf = new Base();
    await wf.init();
    return wf.layer1;
  }
};


const MIN_AUCTION_ID = 1;
const initState = ()=>{
  return {
    layer1_account: {
      name: null,
      address: null,
      balance: null,
      cml: [],
    },

    // address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    // uuid: '29308409284023805283502845038453095803485308503',
    bind_mobile: null,

    btc_list: [],

    latest_meta: {
      delegator_nonce: null,
      delegator_nonce_hash: null,
      delegator_nonce_rsa: null,
    },


    layer1_asset: {
      dot: []
    },

    auction: {
      last_auction_id: 0,

      auction_list: [],

      my_auction_list: [],
      my_bid_list: [],
    },

    chain: {
      current_block: null,
      current_block_hash: null,
    },
  }
};

const store = new Vuex.Store({
  modules: {
    modal: modal,
    clog: clog,
  },

  state: initState(),

  getters: {
    layer1_account: (state)=>{
      if(state.layer1_account.address){
        return state.layer1_account;
      }
      const ll = localStorage.getItem('tea-layer1-account');
      if(ll){
        
        return JSON.parse(ll);
      }

      return state.layer1_account;
    }
  },

  mutations: {
    set_account(state, account){
      state.layer1_account = {
        name: account.ori_name,
        address: account.address,
        balance: account.balance,
        lock_balance: account.lock_balance,
        cml: account.cml || [],
        ...account.vouchers || {},
      };
      
      localStorage.setItem('tea-layer1-account', JSON.stringify(state.layer1_account));
    },

    set_chain(state, chain_data){
      state.chain = _.extend(state.chain, chain_data||{});
    },

    reset_state(state){
      const init_state = initState();
      // Object.keys(init_state).forEach(key => {
      //   state[key] = init_state[key]
      // })
      state.layer1_account = init_state.layer1_account;
      state.auction.my_auction_list = [];
      state.auction.my_bid_list = [];
    },

    set_bind_mobile(state, opts){
      if(!opts){
        state.bind_mobile = null;
      }
      else{
        state.bind_mobile = {
          address: opts.address,
          uuid: opts.uuid,
        };
      }
    },


    // set_meta(state, opts){
    //   state.latest_meta = _.extend(state.latest_meta, opts);
    // },
    // set_layer1_asset(state, asset){
    //   if(asset && asset.dot){
    //     state.layer1_asset.dot = asset.dot;
    //   }
    // },

    set_auction_last_id(state, id){
      state.auction.last_auction_id = id;
    },
    set_auction_list(state, list=[]){
      state.auction.auction_list = list;
    },
    set_my_auction_list(state, list=[]){
      state.auction.my_auction_list = list;
    },
    set_my_bid_list(state, list=[]){
      state.auction.my_bid_list = list;
    }
    
      
  },

  actions: {
    async set_layer1_asset(store){
      const layer1_account = store.getters.layer1_account;
      if(!layer1_account){
        throw 'Invalid layer1 account';
      }

      const layer1 = await F.getLayer1();
      const layer1_instance = layer1.getLayer1Instance();
      // const gluon_pallet = layer1_instance.getGluonPallet();

      // const asset = await gluon_pallet.getAccountAssets(layer1_account.address);

      store.commit('set_layer1_asset', null);
    },
    
    async init_auction_store(store, params){
      const layer1_account = store.getters.layer1_account;
      if(!layer1_account){
        throw 'Invalid layer1 account';
      }

      const {page_size=10, from_start=false} = params;

      const layer1 = await F.getLayer1();
      await utils.waitLayer1Ready(layer1);

      const layer1_instance = layer1.getLayer1Instance();
      const api = layer1_instance.getApi();

      let last_auction_id;
      if(from_start){
        
        last_auction_id = await api.query.auction.lastAuctionId();
        store.commit('set_auction_last_id', last_auction_id.toJSON());
        store.commit('set_auction_list', []);
      }
      else{
        const last_auction = _.last(store.state.auction.auction_list.length);
        if(last_auction){
          last_auction_id = last_auction.id;
        }
        else{
          last_auction_id = MIN_AUCTION_ID;
        }
      }
      
      let end = last_auction_id - page_size;
      if(end < MIN_AUCTION_ID) end = MIN_AUCTION_ID-1;

      const list = [];
      
      for(let i=last_auction_id; i>end; i--){
        const tmp = await api.query.auction.auctionStore(i);
        const d = tmp.toJSON();
        if(d){
          if(d.bid_user){
            let bid_item = await api.query.auction.bidStore(d.bid_user, d.id);
            bid_item = bid_item.toJSON();
            d.bid_price = bid_item.price;
          }
          
          let tmp = await api.query.auction.bidStore(layer1_account.address, d.id);
          tmp = tmp.toJSON();
          d.for_current = tmp;

          list.push(d);
        }
      }

      const xlist = _.map(list, (item)=>{
        item.id = utils.toNumber(item.id);
        item.cml_id = utils.toNumber(item.cml_id);
        return item;
      });
      console.log(11, xlist);
      store.commit('set_auction_list', xlist);
    },

    async init_my_auction_list(store){
      const layer1_account = store.getters.layer1_account;
      if(!layer1_account){
        throw 'Invalid layer1 account';
      }

      const layer1 = await F.getLayer1();
      await utils.waitLayer1Ready(layer1);

      const layer1_instance = layer1.getLayer1Instance();
      const api = layer1_instance.getApi();

      let user_auction = await api.query.auction.userAuctionStore(layer1_account.address);
      user_auction = user_auction.toJSON();
      const x_list = [];
      if(user_auction && user_auction.length > 0){
        for(let i=0, len=user_auction.length; i<len; i++){
          const tmp = await api.query.auction.auctionStore(user_auction[i]);
          const d = tmp.toHuman();
          if(d){
            if(d.bid_user){
              let bid_item = await api.query.auction.bidStore(d.bid_user, user_auction[i]);
              bid_item = bid_item.toHuman();
              d.bid_price = bid_item.price;
            }
            
            x_list.push(d);
          }
        }
      }
      
      const list = _.map(x_list, (item)=>{
        item.id = utils.toNumber(item.id);
        item.cml_id = utils.toNumber(item.cml_id);
        return item;
      });

      store.commit('set_my_auction_list', list);
    },

    async init_my_bid_list(store){
      const layer1_account = store.getters.layer1_account;
      if(!layer1_account){
        throw 'Invalid layer1 account';
      }

      const layer1 = await F.getLayer1();
      await utils.waitLayer1Ready(layer1);

      const layer1_instance = layer1.getLayer1Instance();
      const api = layer1_instance.getApi();

      let user_bid = await api.query.auction.userBidStore(layer1_account.address);
      user_bid = user_bid.toJSON();
      
      const x_list = [];

      if(user_bid && user_bid.length > 0){
        for(let i=0, len=user_bid.length; i<len; i++){
          const tmp = await api.query.auction.bidStore(layer1_account.address, user_bid[i]);
          const d = tmp.toJSON();
          if(d){
            const auction = await api.query.auction.auctionStore(d.auction_id);
            d.auction = auction.toHuman();
            d.cml_id = utils.toNumber(auction.toHuman().cml_id);
            x_list.push(d);
          }
        }
      }
      // console.log(111, x_list);

      const list = _.map(x_list, (item)=>{
        item.auction_id = utils.toNumber(item.auction_id);
        return item;
      });

      store.commit('set_my_bid_list', list);
    }
  }
})

export default store;