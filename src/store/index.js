import Vuex from 'vuex';
import Vue from 'vue';
import _ from 'lodash';

import Base from '../workflow/Base';

import modal from './modal';
import clog from './clog';
import utils from '../tea/utils';
import request from '../request';

Vue.use(Vuex);

const F = {
  async getLayer1() {
    const wf = new Base();
    await wf.init();
    return wf.layer1;
  },

  formatAuctionBidData(d){
    if(d.starting_price){
      d.starting_price = utils.toBN(d.starting_price);
    }
    if(d.buy_now_price){
      d.buy_now_price = utils.toBN(d.buy_now_price);
    }
    if(d.price){
      d.price = utils.toBN(d.price);
    }
    return d;
  }
};


const MIN_AUCTION_ID = 1;
const initState = () => {
  return {
    layer1_account: {
      name: null,
      address: null,
      balance: null,
      cml: [],
      reward: null,
      debt: null,
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
    layer1_account: (state) => {
      if (state.layer1_account.address) {
        return state.layer1_account;
      }
      const ll = localStorage.getItem('tea-layer1-account');
      if (ll) {

        return JSON.parse(ll);
      }

      return state.layer1_account;
    }
  },

  mutations: {
    set_account(state, account) {
      state.layer1_account = {
        name: account.ori_name,
        address: account.address,
        balance: account.balance,
        lock_balance: account.lock_balance,
        cml: account.cml || [],
        reward: account.reward,
        // debt: account.debt,
        // debt_detail: account.debt_detail,
        usd_debt: account.usd_debt,
        usd: account.usd,
        pawn_cml_list: account.pawn_cml_list,
        ...account.coupons || {},
      };

      localStorage.setItem('tea-layer1-account', JSON.stringify(state.layer1_account));
    },

    set_chain(state, chain_data) {
      state.chain = _.extend(state.chain, chain_data || {});
    },

    reset_state(state) {
      const init_state = initState();
      // Object.keys(init_state).forEach(key => {
      //   state[key] = init_state[key]
      // })
      state.layer1_account = init_state.layer1_account;
      state.auction.my_auction_list = [];
      state.auction.my_bid_list = [];
    },

    // set_bind_mobile(state, opts){
    //   if(!opts){
    //     state.bind_mobile = null;
    //   }
    //   else{
    //     state.bind_mobile = {
    //       address: opts.address,
    //       uuid: opts.uuid,
    //     };
    //   }
    // },


    // set_meta(state, opts){
    //   state.latest_meta = _.extend(state.latest_meta, opts);
    // },
    // set_layer1_asset(state, asset){
    //   if(asset && asset.dot){
    //     state.layer1_asset.dot = asset.dot;
    //   }
    // },

    set_auction_last_id(state, id) {
      state.auction.last_auction_id = id;
    },
    set_auction_list(state, list = []) {
      state.auction.auction_list = list;
    },
    set_my_auction_list(state, list = []) {
      state.auction.my_auction_list = list;
    },
    set_my_bid_list(state, list = []) {
      state.auction.my_bid_list = list;
    }


  },

  actions: {
    async set_layer1_asset(store) {
      const layer1_account = store.getters.layer1_account;
      if (!layer1_account) {
        throw 'Invalid layer1 account';
      }

      const layer1 = await F.getLayer1();
      const layer1_instance = layer1.getLayer1Instance();
      // const gluon_pallet = layer1_instance.getGluonPallet();

      // const asset = await gluon_pallet.getAccountAssets(layer1_account.address);

      store.commit('set_layer1_asset', null);
    },

    async init_auction_store(store) {
      const layer1_account = store.getters.layer1_account;
      if (!layer1_account) {
        throw 'Invalid layer1 account';
      }

      const layer1 = await F.getLayer1();
      await utils.waitLayer1Ready(layer1);

      const layer1_instance = layer1.getLayer1Instance();
      const api = layer1_instance.getApi();

      const auction_list = await request.layer1_rpc('auction_currentAuctionList', []);

      const list = await Promise.all(_.map(auction_list, async (auction_id) => {
        const tmp = await api.query.auction.auctionStore(auction_id);

        let d = tmp.toJSON();
        d = F.formatAuctionBidData(d);

        if (d && d.id > 0) {
          if (d.bid_user) {
            let bid_item = await api.query.auction.bidStore(d.bid_user, d.id);
            bid_item = bid_item.toJSON();
            bid_item = F.formatAuctionBidData(bid_item);
            d.bid_price = bid_item.price;

          }

          let tmp = await api.query.auction.bidStore(layer1_account.address, d.id);
          tmp = tmp.toJSON();
          tmp = F.formatAuctionBidData(tmp);
          if (tmp && tmp.auction_id > 0) {
            d.for_current = tmp;
          }

          let cml = await api.query.cml.cmlStore(d.cml_id);
          cml = cml.toJSON();

          d.cml_type = cml.intrinsic.cml_type;

          return d;
        }

      }));

      store.commit('set_auction_list', list);
    },

    async init_my_auction_list(store) {
      const layer1_account = store.getters.layer1_account;
      if (!layer1_account) {
        throw 'Invalid layer1 account';
      }

      const layer1 = await F.getLayer1();
      await utils.waitLayer1Ready(layer1);

      const layer1_instance = layer1.getLayer1Instance();
      const api = layer1_instance.getApi();

      let user_auction = await request.layer1_rpc('auction_userAuctionList', [layer1_account.address]);

      const x_list = [];
      if (user_auction && user_auction.length > 0) {
        for (let i = 0, len = user_auction.length; i < len; i++) {
          const tmp = await api.query.auction.auctionStore(user_auction[i]);
          let d = tmp.toJSON();
          d = F.formatAuctionBidData(d);

          if (d) {
            if (d.bid_user) {
              let bid_item = await api.query.auction.bidStore(d.bid_user, user_auction[i]);
              bid_item = bid_item.toJSON();
              bid_item = F.formatAuctionBidData(bid_item);
              d.bid_price = utils.toBN(bid_item.price);
            }

            let cml = await api.query.cml.cmlStore(d.cml_id);
            cml = cml.toJSON();

            d.cml_type = cml.intrinsic.cml_type;

            x_list.push(d);
          }
        }
      }

      store.commit('set_my_auction_list', x_list);
    },

    async init_my_bid_list(store) {
      const layer1_account = store.getters.layer1_account;
      if (!layer1_account) {
        throw 'Invalid layer1 account';
      }

      const layer1 = await F.getLayer1();
      await utils.waitLayer1Ready(layer1);

      const layer1_instance = layer1.getLayer1Instance();
      const api = layer1_instance.getApi();

      let user_bid = await request.layer1_rpc('auction_userBidList', [layer1_account.address]);
      const x_list = [];

      if (user_bid && user_bid.length > 0) {
        for (let i = 0, len = user_bid.length; i < len; i++) {
          const tmp = await api.query.auction.bidStore(layer1_account.address, user_bid[i]);
          let d = tmp.toJSON();
          d = F.formatAuctionBidData(d);
          if (d) {
            const auction = await api.query.auction.auctionStore(d.auction_id);
            d.auction = auction.toJSON();
            d.auction = F.formatAuctionBidData(d.auction);
            if (d.auction.bid_user) {
              let bid_item = await api.query.auction.bidStore(d.auction.bid_user, d.auction_id);
              bid_item = bid_item.toJSON();
              bid_item = F.formatAuctionBidData(bid_item);
              d.bid_price = bid_item.price;
            }
            d.cml_id = d.auction.cml_id;

            let cml = await api.query.cml.cmlStore(d.cml_id);
            cml = cml.toJSON();

            d.cml_type = cml.intrinsic.cml_type;
            x_list.push(d);
          }
        }
      }

      store.commit('set_my_bid_list', x_list);
    }
  }
})

export default store;