import _, { template } from 'lodash';
import utils from '../tea/utils';
import request from '../request';

const help = {
  formatLogs(nodes=[]){
    const list = _.map(nodes, (item)=>{
      const tmp = {
        ...item,
        price: item.price ? utils.layer1.formatBalance(item.price) : '',
        target: item.to,
      };

      return tmp;
    });

    return list;
  }
};

const initState = ()=>{
  return {
    my_log: null,

    details: null,
  };
}

export default {
  namespaced: true,

  state: initState(),
  mutations: {
    set_my_log(state, logs){
      state.my_log = logs;
    },
    set_details(state, logs){
      state.details = logs;
    }
  },

  actions: {
    async init_my_auction_log(store){
      const layer1_account = store.rootGetters.layer1_account;
      if(!layer1_account){
        throw 'Invalid layer1 account';
      }

      const rs = await request.getLog({
        from: `in: ["${layer1_account.address}"]`
      });

      store.commit('set_my_log', help.formatLogs(rs.nodes));
    },

    async fetch_details_log(store, opts){
      const {type, value} = opts;

      const filter = {};

      if(type === 'auction_id'){
        filter.auctionId = `equalTo: "${value}"`;
        filter.type = `in: ["event", "tx"]`;
      }

      const rs = await request.getLog(filter);
      store.commit('set_details', help.formatLogs(rs.nodes));
    }
  }
};