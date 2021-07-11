
import http from './http';
import Pubsub from 'pubsub-js';

import * as tearust_utils from 'tearust_utils';
import {hexToString, formatBalance} from 'tearust_layer1';

import './index';

import strings from '../assets/string';

const str = (key)=>{
  return _.get(strings, key, key);
};

const {_, uuid, forge} = tearust_utils;

// window.L = require('tearust_layer1');

const consts = {
  CmlType: {A: 'A', B: 'B', C: 'C'},
  DefrostScheduleType: {Investor: 'Investor', Team: 'Team'},
  VoucherOutdatedBlock: 600,
};

const _MEM = {};
const mem = {
  set(key, val){
    _MEM[key] = val;
  },
  get(key){
    return _.get(_MEM, key, null);
  },
  remove(key){
    delete _MEM[key];
  }
};

const cache = {
  put(id, data) {
    localStorage.setItem(id, JSON.stringify(data));
  },
  get(id) {
    const d = localStorage.getItem(id);
    try{
      return JSON.parse(d);
    } catch(e){
      return d;
    }
  },
  remove(id){
    localStorage.removeItem(id);
  },

};

// TODO move to tearust_layer1 pkgs
const layer1 = {
  formatBalance(number){
    return formatBalance(number, {decimals: 12, withSi: true, withUnit: 'TEA'});
  }
};

const crypto = {
  
  sha256(data){
    const tmp = forge.sha256.create();
    tmp.update(data);
    return tmp.digest().toHex();
  }
};

const form = {
  nameToLabel(name){
    return _.map(name.split('_'), (n, i)=>{
      if(i>0) return n;
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
    if(!_http_base_url){
      throw 'no http url';
      
    }

    return _http_base_url;
  },
  setHttpBaseUrl(url) {
    _http_base_url = url;
    http.initBaseUrl();
  },

  convertU8ToString(u8_array){
    return (_.map(u8_array, (x)=>String.fromCharCode(x))).join('');
  },

  uuid(){
    return uuid();
  },

  uint8array_to_arraybuffer(uint8){
    return uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
  },
  uint8array_to_base64(uint8){
    uint8 = F.convertU8ToString(uint8);
    return forge.util.encode64(uint8);
  },


  get_env(key){
    if(key === 'env'){
      return process.env.NODE_ENV;
    }

    const x_key = 'VUE_APP_'+_.toUpper(key);
    return _.get(process.env, x_key, null);
  },


  register: (key, cb)=>{
    Pubsub.unsubscribe(key);
    Pubsub.subscribe(key, cb);
  },
  publish: Pubsub.publish,

  async sleep(time){
    return new Promise((resolve) => setTimeout(resolve, time))
  },

  toNumber(n){
    const tmp = n.toString().replace(/,/g, '');
    return _.toNumber(tmp);
  },

  _toData(layer1_json){
    const rs = {};
    _.each(layer1_json, (val, key)=>{
      if(_.isArray(val)){
        rs[key] = _.map(val, (item)=>{
          return F._toData(item);
        });
      }
      else if(_.isString(val) && _.startsWith(val, '0x')){
        rs[key] = hexToString(val);
      }
      else{
        rs[key] = val;
      }
    });

    return rs;
  },
  toData(layer1_query){
    const tmp = layer1_query.toJSON();
    return F._toData(tmp);
  },

  async waitLayer1Ready(layer1){
    while (layer1.connected !== 2) {
      await F.sleep(500);
    }
  },

  async getPriceTable(){
    const key = 'staking_price_table';
    const rs = mem.get(key);
    if(rs) return rs;
    
    // const request = require('../request');
    // const price_table = await request.layer1_rpc('cml_stakingPriceTable', []);
    const fn = (n)=>{
      return Math.round((Math.sqrt(n+1)-Math.sqrt(n))*100, 2)/100
    };
    const price_table = _.map(_.range(10), (n)=>fn(n));
    // console.log(111, price_table);
    mem.set(key, price_table);

    return price_table;
  },
  async getStakingWeightByIndex(index, len){
    const table = await F.getPriceTable();
    const xt = _.slice(table, 0, len);
    const total = _.sum(xt);

    return (Math.round((table[index] / total)*100000)/1000)+'%';
  }


};

window.utils = F;
export default F;