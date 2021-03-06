import {_} from 'tearust_utils';
import utils from '../tea/utils';

const http = 'http://'+utils.get_env('TAPP_BASE_IP');
const TEM_LIST = [
  {
    key: 'YouTube',
    label: 'YouTube',
    link(tid){
      return JSON.stringify({
        t: 'YouTube',
        v: tid,
      });
    },
    url(id, tid){
      return `${http}:3200?t=youtube&v=${tid}&id=${id}`;
    },
  }, 
  {
    key: 'ReferralCode',
    label: 'ReferralCode',
    link(info){
      const i = utils.forge.util.encode64(info);
      return JSON.stringify({
        t: 'ReferralCode',
        v: i,
      });
    }
  },
  // {
  //   key: 'Reddit',
  //   label: 'Reddit',
  //   link(tid){
  //     return JSON.stringify({
  //       t: 'Reddit',
  //       v: tid,
  //     });
  //   },
  //   url(id, tid){
  //     return `${http}:3200?t=reddit&v=${tid}&id=${id}`;
  //   },
  // }, 
  // {
  //   key: 'Twitter',
  //   label: 'Twitter',
  //   link(tid){
  //     tid = tid.replace(/^#/, '');
  //     return JSON.stringify({
  //       t: 'Twitter',
  //       v: tid,
  //     });
  //   },
  //   url(id, tid){
  //     return `${http}:3200?t=twitter&v=${tid}&id=${id}`;
  //   },
  // }, 
  {
    key: 'bbs',
    label: 'Tea Party',
    link(tid){
      return JSON.stringify({
        t: 'bbs',
        v: tid,
      });
    },
  }
];
const TEM_MAP = {};
_.each(TEM_LIST, (item)=>{
  _.set(TEM_MAP, item.key, item);
});

export default {
  list(is_sudo){
    let list = _.clone(TEM_LIST);
    if(!is_sudo){
      list.pop();
    }
    return _.map(list, (item)=>{
      return item.key;
    });
  },
  getLabel(value){
    return _.get(TEM_MAP[value], 'label');
  },
  genLink(value, param){
    const item = TEM_MAP[value];
    return item.link.call(null, _.trim(param));
  },
  call(value, key, args){
    const item = TEM_MAP[value];
    const cb = item[key];

    return cb.apply(null, args);
  }
};
