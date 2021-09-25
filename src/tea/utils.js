
import http from './http';
import Pubsub from 'pubsub-js';

import * as tearust_utils from 'tearust_utils';
import { 
  hexToString, formatBalance, hexToNumber, hexToBn, numberToHex,
  BN_MILLION, isBn, BN, u8aToHex,

} from 'tearust_layer1';

import './index';

import strings from '../assets/string';

const str = (key) => {
  return _.get(strings, key, key);
};

const { _, uuid, forge, axios } = tearust_utils;

// window.L = require('tearust_layer1');

const consts = {
  CmlType: { A: 'A', B: 'B', C: 'C' },
  DefrostScheduleType: { Investor: 'Investor', Team: 'Team' },
  CurveType: {Linear: 'Linear', SquareRoot: 'SquareRoot'},

  SUDO_ACCOUNT: '5Eo1WB2ieinHgcneq6yUgeJHromqWTzfjKnnhbn43Guq4gVP',
  TOTAL_REWARD: 2000,
};

const _MEM = {};
const mem = {
  set(key, val) {
    _MEM[key] = val;
  },
  get(key) {
    return _.get(_MEM, key, null);
  },
  remove(key) {
    delete _MEM[key];
  }
};

const cache = {
  put(id, data) {
    localStorage.setItem(id, JSON.stringify(data));
  },
  get(id) {
    const d = localStorage.getItem(id);
    try {
      return JSON.parse(d);
    } catch (e) {
      return d;
    }
  },
  remove(id) {
    localStorage.removeItem(id);
  },

};

// TODO move to tearust_layer1 pkgs
const layer1 = {
  formatBalance(value, with_icon=false) {
    let is_negative = false;
    if(_.isNumber(value) && value < 0){
      value = Math.abs(value);
      is_negative = true;
    }

    value = F.toBN(value);
    value = F.bnToBalanceNumber(value);
    value = layer1.roundAmount(value);

    if(is_negative){
      return value * -1;
    }

    if(!with_icon) return value;
    const symbol = '<span style="margin-right: 0;" class="iconfont icon-a-TeaProject-T"></span>'
    return symbol + value;

  },
  amountToBalance(value){
    return Math.floor(_.toNumber(value) * (1000000*1000000));
  },
  balanceToAmount(value){
    return layer1.formatBalance(value);
  },
  roundAmount(value){
    return Math.round(value*10000) / 10000;
  },
  toRealBalance(value){
    value = F.toBN(value);
    value = F.bnToBalanceNumber(value);
    const unit = 1000000*1000000;
    return Math.round(value * unit) / unit;
  }
};

const crypto = {

  sha256(data) {
    const tmp = forge.sha256.create();
    tmp.update(data);
    return tmp.digest().toHex();
  },
  md5(data){
    const tmp = forge.md5.create();
    tmp.update(JSON.stringify(data));
    return tmp.digest().toHex();
  }
};

const form = {
  nameToLabel(name) {
    return _.map(name.split('_'), (n, i) => {
      if (i > 0) return n;
      return _.capitalize(n);
    }).join(' ');
  }
};

let _http_base_url = '';
const F = {
  cache,
  mem,
  crypto,
  forge,
  layer1,
  consts,
  str,
  form,

  getHttpBaseUrl() {
    if (!_http_base_url) {
      throw 'no http url';

    }

    return _http_base_url;
  },
  setHttpBaseUrl(url) {
    _http_base_url = url;
    http.initBaseUrl();
  },

  convertU8ToString(u8_array) {
    return (_.map(u8_array, (x) => String.fromCharCode(x))).join('');
  },

  uuid() {
    return uuid();
  },

  uint8array_to_arraybuffer(uint8) {
    return uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
  },
  uint8array_to_base64(uint8) {
    uint8 = F.convertU8ToString(uint8);
    return forge.util.encode64(uint8);
  },


  get_env(key) {
    if (key === 'env') {
      return process.env.NODE_ENV;
    }

    const x_key = 'VUE_APP_' + _.toUpper(key);
    return _.get(process.env, x_key, null);
  },

  register: (key, cb) => {
    Pubsub.unsubscribe(key);
    Pubsub.subscribe(key, cb);
  },
  publish: Pubsub.publish,

  async sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  },

  toNumber(n) {
    const tmp = n.toString().replace(/,/g, '');
    return _.toNumber(tmp);
  },

  toBN(val){
    if(isBn(val)) return val;
    if(_.isNumber(val)){
      return hexToBn(numberToHex(val));
    }
    if(_.isString(val)){
      if(_.startsWith(val, '0x')){
        return hexToBn(val);
      }

      return new BN(val);
    }

    throw 'Can not convert to BN => '+val;
  },

  bnToBalanceNumber(bn){
    const value = parseInt(bn.toString(),10)/(1000000*1000000);
    // const value = bn.div(BN_MILLION.mul(BN_MILLION)).toNumber();
    return value;
  },


  async waitLayer1Ready(layer1) {
    while (layer1.connected !== 2) {
      await F.sleep(500);
    }
  },

  async getPriceTable() {
    const key = 'staking_price_table';
    const rs = mem.get(key);
    if (rs) return rs;

    const request = (require('../request')).default;
    const rpc_rs = await request.layer1_rpc('cml_stakingPriceTable', []);
    const fn = (n) => {
      return n / (1000000 * 1000000);
    };
    const price_table = _.map(rpc_rs, (n) => fn(n));
    // console.log(111, price_table);
    mem.set(key, price_table);

    return price_table;
  },
  async getStakingWeightByIndex(index, len, cml) {
    const table = await F.getPriceTable();
    console.log(11, table, cml)
    const xt = _.slice(table, 0, len);
    const total = _.sum(xt);

    return (Math.round((table[index] / total) * 100000) / 1000) + '%';
  },

  rpcArrayToString(arr){
    return hexToString(u8aToHex(arr));
  },

  urlToLink(url){
    if(!_.startsWith(url, 'https://') && !_.startsWith(url, 'http://')){
      url = 'http://'+url; 
    }

    return url;
  },

  parseJSON(str, default_value=null){
    let rs;
    try{
      rs = JSON.parse(str);
    }catch(e){
      rs = default_value
    }

    return rs;
  }


};

F.safe = {
  layer1_url: null,
  layer1_rpc: null,
  _index: 0,


  async getForLayer1(){
    if(F.safe.layer1_url && F.safe.layer1_rpc){
      return [F.safe.layer1_url, F.safe.layer1_rpc];
    }

    const arr1 = F.get_env('layer1_url') ? F.get_env('layer1_url').split(',') : ['ws://127.0.0.1:9944'];
    const arr2 = F.get_env('layer1_rpc') ? F.get_env('layer1_rpc').split(',') : ['http://127.0.0.1:9933'];

    if(arr1.length !== arr2.length){
      throw 'invalid layer1 env config.';
    }

    if(F.safe._index > arr1.length-1){
      F.safe._index = 0;
    }

    const url = arr1[F.safe._index];
    const rpc = arr2[F.safe._index];

    try{
      const rs = await axios.get(rpc+'/health', {});
      if(rs.data){

        F.safe.layer1_url = url;
        F.safe.layer1_rpc = rpc;

        console.log('layer1_url => '+url);
        console.log('layer1_rpc => '+rpc);

        return [F.safe.layer1_url, F.safe.layer1_rpc];
      }

      console.log('health result => ', rs);
      throw 'health check fail.';

    }catch(e){
      console.error('layer1 health check error => ', e);
    }

    F.safe.layer1_url = null;
    F.safe.layer1_rpc = null;
    F.safe._index += 1;
    
    return await F.safe.getForLayer1();


  }
};

window.utils = F;
export default F;