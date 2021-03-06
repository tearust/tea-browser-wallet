import utils from './utils';

import types from './types.json';

import {
  _,
} from 'tearust_utils';
import {
  Layer1 as TeaLayer1,
} from 'tearust_layer1';

class Layer1 {
  constructor(){
    this.layer1_instance = null;
    this.callback = {};

    this.gluon = null;

    this.connected = 0;
  }

  async init(){
    if(this.connected > 0) return;

    this.connected = 1;

    const [LAYER1_URL, LAYER1_RPC] = await utils.safe.getForLayer1();
    
    const _layer1 = new TeaLayer1({
      ws_url: LAYER1_URL,
      http_url: LAYER1_RPC,
      system_top_up_account: 'Alice',
      env: 'browser',
      types,
    });

    await _layer1.init();
    this.layer1_instance = _layer1;

    // // Subscribe to system events via storage
    // this.api.query.system.events((events) => {
    //   this.handle_events(events)
    // });

    // this.gluon = new gluon(this.api, this, this.extension, 'browser', {
    //   layer1_http: LAYER1_HTTP
    // });

    this.connected = 2;

    utils.mem.set('layer1_instance', _layer1);
  }

  getLayer1Instance(){
    return this.layer1_instance;
  }

  isConnected(){
    return this.connected;
  }

 
}


export default Layer1;

