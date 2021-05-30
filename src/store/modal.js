import _ from 'lodash';

import utils from '../tea/utils';

const initState = ()=>{
  return {
    put_to_auction_store: {
      visible: false,
      param: {},
    },
    bid_for_auction: {
      visible: false,
      param: {},
    },
    data_details: {
      visible: false,
      title: '',
      param: {}
    },

  };
}

export default {
  namespaced: true,

  state: initState(),
  mutations: {
    open(state, params){
      const {key, cb, param} = params;
      if(!_.isUndefined(state[key])){
        const doc = {
          visible: true,
        };
        if(param.title){
          doc.title = param.title;
          doc.param = _.omit(param, 'title');
        }

        _.set(state, key, doc);

        cb && utils.mem.set(key, cb);
      }
    },
    close(state, key){
      if(!_.isUndefined(state[key])){
        _.set(state, key, {
          visible: false,
          param: {},
        });

        utils.mem.remove(key);
      }
    }
  }
};