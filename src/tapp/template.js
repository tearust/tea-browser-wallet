import {_} from 'tearust_utils';
import utils from '../tea/utils';

const http = 'http://'+utils.get_env('TAPP_BASE_IP');
const TEM_LIST = [
  {
    key: 'YouTube',
    label: 'Youtube',
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
    key: 'Reddit',
    label: 'Reddit',
    link(tid){
      return JSON.stringify({
        t: 'Reddit',
        v: tid,
      });
    },
    url(id, tid){
      throw 'TODO';
    },
  }, 
  {
    key: 'Twitter',
    label: 'Twitter',
    link(tid){
      return JSON.stringify({
        t: 'Twitter',
        v: tid,
      });
    },
    url(id, tid){
      throw 'TODO';
    },
  }, 
  // {
  //   key: 'bbs',
  //   label: 'Tea Party',
  //   link(){
  //     return JSON.stringify({
  //       type: 'bbs',
  //     });
  //   }
  // }
];
const TEM_MAP = {};
_.each(TEM_LIST, (item)=>{
  _.set(TEM_MAP, item.key, item);
});

export default {
  list(){
    return _.map(TEM_LIST, (item)=>{
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
