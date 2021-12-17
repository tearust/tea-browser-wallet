import Layer1 from '../tea/layer1';
import utils from '../tea/utils';
import Log from '../shared/utility/Log';
import http from '../tea/http';
import store from '../store';
import request from '../request';

import { _, forge, moment } from 'tearust_utils';
import { hexToString, numberToHex } from 'tearust_layer1';

import '../tea/moment-precise-range';

window._layer1 = require('tearust_layer1');

let _layer1 = null;
let _init = false;
export default class {
  constructor() {
    this.layer1 = _layer1;
    this._log = Log.create(this.defineLog());

    this.gluon = null;
  }

  defineLog() {
    return 'Base';
  }

  async init() {
    const init_loop = (resolve) => {
      if (!this.layer1 || this.layer1.connected !== 2) {
        _.delay(() => {
          init_loop(resolve);
        }, 300);
      }
      else {
        resolve();
      }
    };


    return new Promise(async (resolve) => {
      if (!_init) {
        _init = true;
        await this.initLayer1();
      }
      init_loop(resolve);
    });

  }

  async getAllLayer1Account() {
    const layer1_instance = this.getLayer1Instance();
    if (layer1_instance && layer1_instance.extension) {
      const all_account = await layer1_instance.extension.getAllAccounts();

      return all_account;
    }

    return [];
  }

  async initLayer1() {
    if (!_layer1) {
      _layer1 = new Layer1();

      await _layer1.init();
      await utils.waitLayer1Ready(_layer1);
      this.layer1 = _layer1;
      await this.initEvent();
    }
  }

  async initEvent() {
    const api = this.getLayer1Instance().getApi();
    if (utils.get_env('env') !== 'prod') {
      window.api = api;
    }
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

  getLayer1Instance() {
    if (this.layer1) {
      return this.layer1.getLayer1Instance();
    }

    return null;
  }

  async getCurrentBlock(api) {
    if (!api) {
      const layer1_instance = this.getLayer1Instance();
      api = layer1_instance.getApi();
    }
    const block = await api.rpc.chain.getBlock();
    return block.toJSON().block.header.number;
  }

  showQrCodeModal(opts) {
    utils.publish('tea-qrcode-modal', {
      visible: true,
      text: opts.text,
    });
  }
  closeQrCodeModal() {
    utils.publish('tea-qrcode-modal', {
      visible: false,
    });
  }

  blockToDay(block) {
    const hour = 60 * 60 / 6;
    const d = Math.ceil(block / hour);
    if(d < 0) return '0';

    const tmp = moment.utc().preciseDiff(moment.utc().add(d, 'h'), true);
    let rs = '';
    if (tmp.years) {
      rs += tmp.years + 'y';
    }
    if (tmp.months) {
      rs += tmp.months + 'm';
    }
    
    rs += (tmp.days||0) + 'd';

    if(rs === '0d'){
      if(tmp.hours){
        rs = tmp.hours + 'h';
      }
      else if(tmp.minutes){
        rs = tmp.minutes + 'mins'
      }
      else if(tmp.seconds){
        rs = tmp.seconds + 'seconds'
      }
    }

    if(rs === '0d'){
      rs = '0';
    }
    
    return rs;
  }

  encode_b64(str) {
    return forge.util.encode64(str);
  }

  showSelectLayer1Modal() {
    utils.publish('tea-select-layer1-modal', true);
  }

  async getTeaDebtByPawnList(cml_list){
    const rs = {
      prime: 0,
      interest: 0,
      total: 0,
    };

    await Promise.all(_.map(cml_list, async (arr)=>{
      const cml_id = arr[0];
      let tmp = await request.layer1_rpc('cml_calculateLoanAmount', [cml_id]);
      rs.prime += _.toNumber(tmp[0]);
      rs.interest += _.toNumber(tmp[1]);
      rs.total += _.toNumber(tmp[2]);
      return null;
    }));

    return rs;

  }

  async getAllPawnByAddress(address){
    const cml_list = await request.layer1_rpc('cml_userCmlLoanList', [
      address
    ]);

    return cml_list;
  }

  async getAllBalance(address) {
    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();
    let tmp = await api.query.system.account(address);
    // console.log('balance =>', tmp.toJSON().data);
    tmp = tmp.data;

    let reward = await api.query.cml.accountRewards(address);
    reward = reward.toJSON();

    const free_b = parseInt(tmp.free, 10);
    const fee_frozen_b = parseInt(tmp.feeFrozen, 10);
    const misc_frozen_b = parseInt(tmp.miscFrozen, 10);
    const reserved_b = parseInt(tmp.reserved, 10);

    const frozen_b = misc_frozen_b > fee_frozen_b ? misc_frozen_b : fee_frozen_b;

    const free = (free_b - frozen_b) / layer1_instance.asUnit();
    const fee_frozen = frozen_b / layer1_instance.asUnit();
    const lock = reserved_b / layer1_instance.asUnit();

    const total = (free_b+reserved_b) / layer1_instance.asUnit();
    if (reward) {
      reward = reward / layer1_instance.asUnit();
    }


    // let usd = await api.query.genesisExchange.uSDStore(address);
    // usd = usd.toJSON();
    // usd = utils.layer1.balanceToAmount(usd);

    // let usd_debt = await api.query.genesisExchange.uSDDebt(address);
    // usd_debt = usd_debt.toJSON();
    // usd_debt = utils.layer1.balanceToAmount(usd_debt);
    
    return {
      free: Math.floor(free * 10000) / 10000,
      lock: Math.floor(lock * 10000) / 10000,
      fee_frozen: Math.floor(fee_frozen * 10000) / 10000,
      total_balance: Math.floor(total * 10000) / 10000,
      reward: reward ? Math.floor(reward * 10000) / 10000 : null,
      usd: 0,
      usd_debt: 0
    };
  }

  async transferBalance(address, amount) {
    const layer1_account = store.getters.layer1_account;
    if (!layer1_account.address) {
      return false;
    }

    if (!amount || amount === 0) {
      throw 'Invalid transfer balance.';
    }

    if(!address){
      throw 'Invalid receiver\'s address.';
    }

    if(address === layer1_account.address){
      throw 'You cannot send TEA to yourself.';
    }

    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    const total = layer1_instance.asUnit() * amount;
    const transfer_tx = api.tx.balances.transfer(address, numberToHex(total));
    await layer1_instance.sendTx(layer1_account.address, transfer_tx);
  }

  async getCoupons(address) {
    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    let coupon_investor_A = await api.query.cml.investorCouponStore(address, 'A');
    let coupon_investor_B = await api.query.cml.investorCouponStore(address, 'B');
    let coupon_investor_C = await api.query.cml.investorCouponStore(address, 'C');
    coupon_investor_A = coupon_investor_A.toJSON();
    coupon_investor_B = coupon_investor_B.toJSON();
    coupon_investor_C = coupon_investor_C.toJSON();
    if(coupon_investor_A && coupon_investor_A.amount < 1){
      coupon_investor_A = null;
    }
    if(coupon_investor_B && coupon_investor_B.amount < 1){
      coupon_investor_B = null;
    }
    if(coupon_investor_C && coupon_investor_C.amount < 1){
      coupon_investor_C = null;
    }

    let coupon_team_A = await api.query.cml.teamCouponStore(address, 'A');
    let coupon_team_B = await api.query.cml.teamCouponStore(address, 'B');
    let coupon_team_C = await api.query.cml.teamCouponStore(address, 'C');
    coupon_team_A = coupon_team_A.toJSON();
    coupon_team_B = coupon_team_B.toJSON();
    coupon_team_C = coupon_team_C.toJSON();
    if(coupon_team_A && coupon_team_A.amount < 1){
      coupon_team_A = null;
    }
    if(coupon_team_B && coupon_team_B.amount < 1){
      coupon_team_B = null;
    }
    if(coupon_team_C && coupon_team_C.amount < 1){
      coupon_team_C = null;
    }

    return {
      coupon_investor_A: coupon_investor_A,
      coupon_investor_B: coupon_investor_B,
      coupon_investor_C: coupon_investor_C,
      coupon_team_A: coupon_team_A,
      coupon_team_B: coupon_team_B,
      coupon_team_C: coupon_team_C,
    }
  }

  async refreshCurrentAccount() {

    const layer1_account = store.getters.layer1_account;
    if (!layer1_account.address) {
      return false;
    }

    const layer1_instance = this.getLayer1Instance();

    const api = layer1_instance.getApi();
    const balance = await this.getAllBalance(layer1_account.address);

    const coupons = await this.getCoupons(layer1_account.address);

    const pawn_cml_list = await this.getAllPawnByAddress(layer1_account.address);
    const tea_debt = await this.getTeaDebtByPawnList(pawn_cml_list);

    // reset all state
    store.commit('reset_state');

    // let my_auction = await api.query.auction.userAuctionStore(layer1_account.address);
    // my_auction = my_auction.toHuman();
    const cml_list = await this.getCmlListByUser(layer1_account.address);
    const cml_data = await this.getCmlByList(cml_list);

    this._log.i("refresh current layer1_account");
    store.commit('set_account', {
      balance: balance.free,
      lock_balance: balance.lock,
      address: layer1_account.address,
      ori_name: layer1_account.name,
      cml: cml_data,
      reward: balance.reward,
      
      usd: balance.usd,
      usd_debt: balance.usd_debt,

      coupons,
      pawn_cml_list,
      tea_debt,

      fee_frozen: balance.fee_frozen,
      total_balance: balance.total_balance,
    });


  }

  async getCmlListByUser(address) {
    const user_cml_list = await request.layer1_rpc('cml_userCmlList', [
      address
    ])

    return user_cml_list;
  }

  async getCmlByList(cml_list) {
    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    const current_block = await this.getCurrentBlock(api);

    const unzip_status = async (cml) => {
      const status = cml.status;
      let rs = status;
      if (_.isObject(status)) {
        if (_.has(status, 'frozenSeed')) {
          rs = 'FrozenSeed';
        }
        else if (_.has(status, 'staking')) {
          rs = 'Staking';
          cml.staking_cml_id = status.staking.cml_id;
          const [x_cml] = await this.getCmlByList([cml.staking_cml_id]);

          const tmp = _.find(x_cml.staking_slot, (x)=>(x.cml && x.cml===cml.intrinsic.id));
          if(tmp){
            cml.staking_index = tmp.real_index.toString().replace(/ /g, '');
          }
          else{
            console.error('Unexpect error, check for unzip_status in Base.js');
            cml.staking_index = status.staking.staking_index;
          }

        }
        else if (_.has(status, 'tree')) {
          rs = 'Tree';
        }
        else {
          rs = 'FreshSeed';
          cml.fresh_seed_block = status.freshSeed.fresh_seed;
        }
      }
      cml.status = rs;
      return cml;
    };

    const list = await Promise.all(_.map(cml_list, async (cml_id) => {
      let cml = await api.query.cml.cmlStore(cml_id);
      cml = cml.toJSON();

      cml.defrost_day = this.blockToDay(cml.intrinsic.generate_defrost_time - current_block);
      let remaining = cml.intrinsic.lifespan;
      
      cml = await unzip_status(cml);
      if (cml.status !== 'FrozenSeed') {
        remaining = remaining + cml.planted_at - current_block;
      }

      if (remaining < 0) remaining = 0;
      cml.liferemaining = remaining;
      cml.life_day = this.blockToDay(remaining);

      if(cml.machine_id){
        const miner = (await api.query.cml.minerItemStore(cml.machine_id)).toJSON();
        
        cml.miner_controller_account = miner.controller_account;
        cml.miner_ip = hexToString(miner.ip);
        cml.miner_status = miner.status;
        cml.suspend_block = miner.suspend_height;
        cml.miner_orbitdb_id = miner.orbitdb_id;

      }

      const ttp = await request.layer1_rpc('cml_cmlPerformance', [_.toNumber(cml_id)]);
      // console.log(111, ttp);
      const performance = (ttp[0]||0)+'/'+ttp[2];
      const remaining_performance = ttp[1] || 0;
      const current_performance = ttp[0]||0;

      cml.slot_len = cml.staking_slot.length;
      let real_index_total = 0;
      let next_real_index = 0;
      for(let i=0, len=cml.slot_len; i<len; i++){
        const item = cml.staking_slot[i];
        item.category = _.toUpper(item.category);

        item.real_index = _.clone(next_real_index);
        if(item.cml){
          let xcml = await api.query.cml.cmlStore(item.cml);
          xcml = xcml.toJSON();
          item.cml_type = xcml.intrinsic.cml_type;
          item.cml_weight = utils.consts.CmlWeightByType[item.cml_type];
          real_index_total += item.cml_weight;

          next_real_index += item.cml_weight;
        }
        else{
          item.cml_weight = 1;
          real_index_total += 1;

          next_real_index += item.cml_weight;
        }

        if(item.cml_weight !== 1){
          item.real_index += ' - '+(item.real_index+item.cml_weight-1).toString();
        }

        cml.staking_slot[i] = item;
      }
      
      cml.staking_slot = _.map(cml.staking_slot, (item)=>{
        item.cml_weight_total = real_index_total;
        return item;
      });

      // cml = await unzip_status(cml);

      // status;
      cml.status = ((row) => {
        if (row.status === 'Tree') {
          if (row.staking_slot.length > 0) {
            return 'Mining';
          }
          else {
            return 'Tree'
          }
        }

        return row.status;
      })(cml);

      cml.real_total = real_index_total;
      return {
        ...cml,
        ...cml.intrinsic,
        performance,
        current_performance,
        remaining_performance,
        machine_id: (cml.machine_id),
      };
    }));
// console.log(1, list);
    return list;

  }




}