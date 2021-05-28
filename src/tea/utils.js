
import http from './http';
import Pubsub from 'pubsub-js';

import * as tearust_utils from 'tearust_utils';


import './index';

const {_, uuid, forge} = tearust_utils;

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


const crypto = {
  

  sha256(data){
    const tmp = forge.sha256.create();
    tmp.update(data);
    return tmp.digest().toHex();
  }
};


let _http_base_url = '';
const F = {
  cache,
  mem,
  crypto,
  tearust_utils,

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


  publish(msg, data){
    Pubsub.publish(msg, data);
  },

  async sleep(time){
    return new Promise((resolve) => setTimeout(resolve, time))
  },

  toNumber(n){
    const tmp = n.toString().replace(/,/g, '');
    return _.toNumber(tmp);
  },

  async waitLayer1Ready(layer1){
    while (layer1.connected !== 2) {
      await F.sleep(500);
    }
  }
};

window.utils = F;
export default F;