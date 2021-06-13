import _, { template } from 'lodash';
import utils from '../tea/utils';
import request from '../request';

const help = {
  logArgs(name, args){
    let xargs = JSON.parse(args.replace("{", "[").replace('}',']'));
    let auction_id = null;
    let cml_id = null;
    let price = null;
    let target = null;

    let flag = false;
    if(name === 'bidForAuction'){
      auction_id = xargs[0];
      price = utils.layer1.formatBalance(xargs[1]);

      flag = true;
    }
    else if(name === 'AuctionSuccess'){
      auction_id = xargs[0];
      target = xargs[1];
      price = utils.layer1.formatBalance(xargs[2]);

      flag = true;
    }
    else if(name === 'putToStore'){
      cml_id = xargs[0];

      flag = true;
    }
    else if(name === 'NewAuctionToStore'){
      auction_id = xargs[0];

      flag = true;
    }
    else if(name === 'activeCmlForNitro'){
      cml_id = xargs[0];

      flag = true;
    }
    else if(name === 'convertCmlFromDai'){

      flag = true;
    }

    if(!flag) return false;

    return {
      args,
      auction_id,
      cml_id,
      price,
      target,
    }
  },
  formatLogs(nodes=[]){
    const list = _.map(nodes, (item)=>{
      const tmp = {
        ...item,
      };

      const args = help.logArgs(item.name, item.args);
      if(args){
        _.extend(tmp, args);
      }

      return tmp;
    });
    console.log(1, list);
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

    async fetch_details_log(store, type, value){
      // const filter = {};

      // if(type === 'auction'){
      //   type
      // }
    }
  }
};