import Layer1 from '../tea/layer1';
import utils from '../tea/utils';
import Log from '../shared/utility/Log';
import http from '../tea/http';
import store from '../store';
import request from '../request';

import {_, forge} from 'tearust_utils';
import {hexToString} from 'tearust_layer1';
import { add } from 'lodash';


let _layer1 = null;
export default class {
  constructor() {
    this.layer1 = _layer1;
    this._log = Log.create(this.defineLog());

    this.gluon = null;
  }

  defineLog(){
    return 'Base';
  }

  async init() {
    await this.initLayer1();
    // this.gluon = this.layer1.gluon;
  }

  async getAllLayer1Account(){
    const layer1_instance = this.getLayer1Instance();
    if(layer1_instance && layer1_instance.extension){
      const all_account = await layer1_instance.extension.getAllAccounts();

      return all_account;
    }
    
    return [];
  }

  async initLayer1() {
    if (!_layer1) {
      try {
        _layer1 = new Layer1();
        await _layer1.init();
        await utils.waitLayer1Ready(_layer1);
        this.layer1 = _layer1;

        await this.initEvent();
      } catch (e) {
        console.error(e);
      }
    }
  }

  async initEvent(){
    const api = this.getLayer1Instance().getApi();
    api.rpc.chain.subscribeNewHeads(async (header) => {
      // console.log(`chain is at #${header.number} has hash ${header.hash}`);
      store.commit('set_chain', {
        current_block: header.number,
        current_block_hash: header.hash,
        metadata: this.getLayer1Instance().getMetadata(),
      });

      // const blockInfo = await api.rpc.chain.getBlock(header.hash);

      // const tmp = blockInfo.block.extrinsics;
      // _.each(tmp, (item)=>{
      //   if(item.isSigned){
      //     const rs = {
      //       method: item.method.method,
      //       args: _.map(item.method.args, (v)=>v.toJSON()),
      //       section: item.method.section,
      //       signature: item.signature.toHuman(),
      //       sender: item.signer.toHuman().Id,

      //     };
      //     window.R = rs;
      //     console.log(1, rs)
      //   }
      // })
      
    });

    const chainInfo = await api.registry.getChainProperties();
    store.commit('set_chain', chainInfo.toHuman());

    
    // console.log(1, api.errors)
  }

  getLayer1Instance(){
    if(this.layer1){
      return this.layer1.getLayer1Instance();
    }

    return null;
  }

  showQrCodeModal(opts){
    utils.publish('tea-qrcode-modal', {
      visible: true,
      text: opts.text,
    });
  }
  closeQrCodeModal(){
    utils.publish('tea-qrcode-modal', {
      visible: false,
    });
  }

  encode_b64(str){
    return forge.util.encode64(str);
  }

  showSelectLayer1Modal(){
    utils.publish('tea-select-layer1-modal', true);
  }

  async getAllBalance(address){
    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();
    let tmp = await api.query.system.account(address);
    // console.log('balance =>', tmp.toJSON().data);
    tmp = tmp.data;

    let reward = await api.query.cml.accountRewards(address);
    reward = reward.toJSON();
    
    const free = parseInt(tmp.free, 10) / layer1_instance.asUnit();
    const lock = parseInt(tmp.reserved, 10) / layer1_instance.asUnit();
    if(reward){
      reward = reward / layer1_instance.asUnit();
    }

    let debt = await api.query.cml.genesisMinerCreditStore(address);
    debt = debt.toJSON();
    if(debt){
      debt = debt / layer1_instance.asUnit();
    }

    return {
      free: Math.floor(free*10000)/10000,
      lock: Math.floor(lock*10000)/10000,
      reward: reward ? Math.floor(reward*10000)/10000 : null,
      debt: debt ? Math.floor(debt*10000)/10000 : null,
    };
  }
  
  async transferBalance(address, amount){
    const layer1_account = store.getters.layer1_account;
    if(!layer1_account.address){
      return false;
    }

    if(!amount || amount == 0){
      throw 'Invalid transfer balance.';
    }

    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    const total = layer1_instance.asUnit() * amount;

    const transfer_tx = api.tx.balances.transfer(address, total);

    await layer1_instance.sendTx(layer1_account.address, transfer_tx);
  }

  async getVouchers(address){
    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    const voucher_investor_A = await api.query.cml.investorVoucherStore(address, 'A');
    const voucher_investor_B = await api.query.cml.investorVoucherStore(address, 'B');
    const voucher_investor_C = await api.query.cml.investorVoucherStore(address, 'C');

    const voucher_team_A = await api.query.cml.teamVoucherStore(address, 'A');
    const voucher_team_B = await api.query.cml.teamVoucherStore(address, 'B');
    const voucher_team_C = await api.query.cml.teamVoucherStore(address, 'C');

    return {
      voucher_investor_A: voucher_investor_A.toJSON(),
      voucher_investor_B: voucher_investor_B.toJSON(),
      voucher_investor_C: voucher_investor_C.toJSON(),
      voucher_team_A: voucher_team_A.toJSON(),
      voucher_team_B: voucher_team_B.toJSON(),
      voucher_team_C: voucher_team_C.toJSON(),
    }
  }

  async refreshCurrentAccount(){
    
    const layer1_account = store.getters.layer1_account;
    if(!layer1_account.address){
      return false;
    }

    this._log.i("refresh current layer1_account");
    const layer1_instance = this.getLayer1Instance();
    // const balance = await layer1_instance.getAccountBalance(layer1_account.address);

    const api = layer1_instance.getApi();
    const balance = await this.getAllBalance(layer1_account.address);

    const vouchers = await this.getVouchers(layer1_account.address);

    // reset all state
    store.commit('reset_state');

    // let my_auction = await api.query.auction.userAuctionStore(layer1_account.address);
    // my_auction = my_auction.toHuman();
    const cml_list = await this.getCmlListByUser(layer1_account.address);
    const cml_data = await this.getCmlByList(cml_list);

    store.commit('set_account', {
      balance: balance.free,
      lock_balance: balance.lock,
      address: layer1_account.address,
      ori_name: layer1_account.name,
      cml: cml_data,
      reward: balance.reward,
      debt: balance.debt,
      vouchers,
    });


  }

  async getCmlListByUser(address){
    const user_cml_list = await request.layer1_rpc('cml_getUserCmlList', [
      address
    ])

    return user_cml_list;
  }

  async getCmlByList(cml_list){
    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    const list = await Promise.all(_.map(cml_list, async (cml_id)=>{
      let cml = await api.query.cml.cmlStore(cml_id);
      cml = cml.toJSON();

      cml.deforst_day = Math.floor(cml.intrinsic.generate_defrost_time*6/(60*60*24));
      return {
        ...cml,
        ...cml.intrinsic,
        machine_id: hexToString(cml.machine_id),
      };
    }));

    return list;
    
  }

  

  
}