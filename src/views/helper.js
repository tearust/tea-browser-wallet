
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import request from '../request';
import tapp from '../tapp';

// self means vue instance, required.
const F = {
  tableLoading(self, flag=false){
    if(flag){
      self.$root.loading(true);
      self.table_loading = true;
    }
    else{
      self.$root.loading(false);
      self.table_loading = false;
    }
    
  },

  async tapps_buyToken(self, data, succ_cb){
    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Buy token',
        confirm_text: 'Next',
        text: `You are buying the ${data.token_symbol} token using the ${data.name} template. For more information on how to invest in TApp tokens, <a href="https://github.com/tearust/teaproject/wiki/TApps-List#tapp-token-strategy" class="t-wiki" target="_blank">visit our wiki</a>.`,
        props: {
          tapp_id: {
            class: 'hidden',
            default: data.id,
          },
          tapp_amount: {
            label: 'Token amount',
            type: 'number',
            max: 100000000,
            remove_required_rule: true,
            default: undefined,
            tip: 'Click "Next" button to see how much you can convert to, or input a number below to convert back.'
          },
          tea: {
            label: 'TEA',
            type: 'number',
            default: undefined,
            model_action: {
              button_text: 'Convert back',
              ref: 'tapp_amount',
              handler: async (v)=>{
                if(!v) return null;
                const amount = utils.layer1.amountToBalance(v);
                let estimate = await request.layer1_rpc('bonding_estimateHowMuchTokenBoughtByGivenTea', [
                  data.id, amount
                ]);
                estimate = utils.layer1.balanceToAmount(estimate);
                return estimate;
              }
            }
          }
        },
      },
      cb: async (form, close)=>{
        if(!form.tapp_amount){
          self.$root.showError('Amount token is required.');
          return;
        }

        self.$root.loading(true);
        
        const id = form.tapp_id;
        const amount = utils.layer1.amountToBalance(form.tapp_amount);
        let estimate = await request.layer1_rpc('bonding_estimateTeaRequiredToBuyGivenToken', [
          id, amount, 100
        ]);
        estimate = utils.layer1.balanceToAmount(estimate);

        try{
          await self.$confirm(`You will pay <b>${estimate} TEA</b> <br/> Are you sure?`, {
            dangerouslyUseHTMLString: true,
          });
        }catch(e){
          self.$root.loading(false);
          return false;
        }
        
      
        try{

          const tx = api.tx.bondingCurve.buyToken(id, utils.toBN(amount));
          await layer1_instance.sendTx(self.layer1_account.address, tx);

          close();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  },

  async tapps_sellToken(self, data, succ_cb){
    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Sell token',
        confirm_text: 'Next',
        text: `You are selling the ${data.name}'s token ${data.token_symbol}`,
        props: {
          tapp_id: {
            class: 'hidden',
            default: data.id,
          },
          tapp_amount: {
            label: 'Token amount',
            type: 'number',
            max: 100000000,
            remove_required_rule: true,
            default: undefined,
            tip: 'Click "Next" button to see how much you can convert to, or input a number below to convert back.',
            model_action: {
              button_text: 'Sell all',
              handler: async ()=>{
                const list = await request.layer1_rpc('bonding_listUserAssets', [
                  self.layer1_account.address
                ]);
                const tmp = _.find(list, (arr)=>arr[1]===data.id);
                return utils.layer1.balanceToAmount(tmp[3][0]);
              },
            },
          },
          tea: {
            label: 'TEA',
            type: 'number',
            default: undefined,
            model_action: {
              button_text: 'Convert back',
              ref: 'tapp_amount',
              handler: async (v)=>{
                if(!v) return null;
                const amount = utils.layer1.amountToBalance(v);
                let estimate = await request.layer1_rpc('bonding_estimateHowMuchTokenToSellByGivenTea', [
                  data.id, amount
                ]);
                estimate = utils.layer1.balanceToAmount(estimate);
                return estimate;
              }
            }
          }
        },
      },
      cb: async (form, close)=>{
        if(!form.tapp_amount){
          self.$root.showError('Amount token is required.');
          return;
        }
        self.$root.loading(true);

        const id = form.tapp_id;
        const amount = utils.layer1.amountToBalance(form.tapp_amount);
        let estimate = await request.layer1_rpc('bonding_estimateReceivedTeaBySellGivenToken', [
          id, amount,
        ]);
        estimate = utils.layer1.balanceToAmount(estimate);

        if(estimate === 0){
          self.$root.showError('Insufficient token balance. Your token balance fluctuates according to the block height. <br/>Please try selling an amount slightly smaller than your total supply.');
          self.$root.loading(false);
          return false;
        }

        try{
          await self.$confirm(`You will receive <b>${estimate} TEA</b> <br/> Are you sure?`, {
            dangerouslyUseHTMLString: true,
          });
        }catch(e){
          self.$root.loading(false);
          return false;
        }


        try{

          const tx = api.tx.bondingCurve.sellToken(id, utils.toBN(amount));
          await layer1_instance.sendTx(self.layer1_account.address, tx);

          close();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  },

  async openHostTappModal(self, data, succ_cb){
    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();

    self.$store.commit('modal/open', {
      key: 'host_tapp',
      param: {
        tapp: data,
        
      },
      cb: async ()=>{
        await succ_cb();
      }
    });
  },

  async bonding_listCandidateMiners(self, tapp_id){
    const cml_list = await request.layer1_rpc('bonding_listCandidateMiners', [
      self.layer1_account.address,
    ]);
    const list = await Promise.all(_.map(cml_list, async (arr)=>{
      const [cml] = await self.wf.getCmlByList([arr[0]]);

      const item = {
        id: arr[0],
        current: arr[1],
        remaining: arr[2],
        life_day: self.wf.blockToDay(arr[3]),
        is_on: !!_.find(arr[4], (xd)=>xd===tapp_id),
      };

      if(cml.cml_type !== 'B'){
        return null;
      }
      
      item.miner_ip = cml.miner_ip;

      return item;
    }));

    return _.filter(list);
  },
  async unhostTApp(self, data, succ_cb){
    const tapp_id = data.tapp_id;
    const cml_id = data.cml_id;

    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();

    try{
      await self.$confirm(`Your CML ${cml_id} will no longer host this TApp, continue?`, 'Unhost');
    }catch(e){
      self.$root.loading(false);
    }

    self.$root.loading(true);
    try{
      const tx = api.tx.bondingCurve.unhost(cml_id, tapp_id);
      await layer1_instance.sendTx(self.layer1_account.address, tx);

      await succ_cb();

    }catch(e){
      self.$root.showError(e);
    }
    self.$root.loading(false);
  },

  openToTApp(self, row){
    // if(row.host_current < 1){
    //   self.$root.showError('This TApp has zero hosts at this moment. It has not been deployed yet.');
    //   return;
    // }

    try{
      const json = JSON.parse(row.link);
      let url = tapp.template.call(row.type, 'url', [row.id, json.v]);
      url = utils.urlToLink(url);

      window.open(url, '_blank');

    }catch(e){
      self.$root.showError(e);
    }

  },

  async getHostingReward(account_id, cml_id, tapp_id){
    const query = `
query {
  hostingTappRewards (
    first: 100,
    filter: {
      accountId: {equalTo: "${account_id}"},
      cmlId: {equalTo: "${cml_id}"},
      tappId: {equalTo: "${tapp_id}"}
    }
  ) {
    nodes {
      id
      cmlId
      tappId
      accountId
      fixTokenTotal
      type
      fixTeaTotal
      fixTokenMinerTotal
      fixTokenInvestorTotal
      
    }
  }
}
    `;

    const rs = await request.queryGraphQL(query);
    const item = rs.hostingTappRewards.nodes[0];

    if(!item){
      return {
        total: 0
      };
    }
    
    item.total = item.fixTeaTotal;
    
    return item;
  },

  async showTAppDetails(self, tapp_id){
    self.$store.commit('modal/open', {
      key: 'tapp_details',
      param: {
        id: tapp_id,
      },
    });
  },
  async showTAppLink(self, tapp_id){
    self.$store.commit('modal/open', {
      key: 'tapp_link',
      param: {
        id: tapp_id,
      },
    });
  },

  // goToTAppWithIpfsCid(cid){
  //   const ss = utils.get_env('ipfs_url');

  //   window.open(ss+'/ipfs/'+cid, '_blank');
  // },

  async calculateTEAByToken(token_amount){
    const amount = utils.layer1.amountToBalance(token_amount)
    let estimate = await request.layer1_rpc('bonding_estimateTeaRequiredToBuyGivenToken', [
      null, amount, 100,
    ]);
    estimate = utils.layer1.balanceToAmount(estimate);

    return estimate;
  },

  async getTAppDetailsListByTAppIdList(id_list){
    const rs = {};
    await Promise.all(_.map(id_list, async (id)=>{
      const arr = await request.layer1_rpc('bonding_tappDetails', [_.toNumber(id)]);
      rs[id] = {
        sell_price: utils.layer1.balanceToAmount(arr[11]),
      };

      return null;
    }));

    return rs;
  },
  openUrl(url){
    window.open(url, '_blank');
  },

  async resumeMiner(self, cml_id, succ_cb){
    try{
      let msg = `Are you sure your miner is online and you wish to resume mining? <br/>
      Please note that you need to pay 100 TEA as a deposit.`;
      
      await self.$confirm(msg, {
        title: 'Notice',
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return;
    } 

    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();
    self.$root.loading(true);

    try{
      const tx = api.tx.cml.resumeMining(cml_id);
      await layer1_instance.sendTx(self.layer1_account.address, tx);

      await succ_cb();
    }catch(e){
      self.$root.showError(e);
    }

    self.$root.loading(false);
  },
  async scheduleUpMiner(self, cml_id, succ_cb){
    try{
      let msg = `Are you sure you want to start up your miner?`;
      
      await self.$confirm(msg, {
        title: 'Notice',
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return;
    } 

    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();
    self.$root.loading(true);

    try{
      const tx = api.tx.cml.scheduleUp(cml_id);
      await layer1_instance.sendTx(self.layer1_account.address, tx);

      await succ_cb();
    }catch(e){
      self.$root.showError(e);
    }

    self.$root.loading(false);
  },
  async scheduleDownMiner(self, cml_id, succ_cb){
    try{
      let msg = `Are you sure you want to shutdown your miner?`;
      
      await self.$confirm(msg, {
        title: 'Notice',
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return;
    } 

    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();
    self.$root.loading(true);

    try{
      const tx = api.tx.cml.scheduleDown(cml_id);
      await layer1_instance.sendTx(self.layer1_account.address, tx);

      await succ_cb();
    }catch(e){
      self.$root.showError(e);
    }

    self.$root.loading(false);
  },
  async migrateMiner(self, cml, miner, succ_cb){
    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Migrate miner',
        // text: ``,
        props: {
          cml_id: {
            label: 'CML ID',
            type: 'Input',
            default: cml.id,
            disabled: true,
          },
          miner_id: {
            label: 'Machine ID',
            type: 'Input',
            required: true,
            el_props: {
              'show-word-limit': true,
              maxlength: 66,
              minlength: 66
            },
            rules: [
              {min: 66,},
              {max: 66,},
            ]
          },
          miner_ip: {
            label: 'Miner IP',
            type: 'Input',
            required: true,
            rules: {
              validator: (rule, val, cb)=>{
                if(cml.cml_type === 'B'){
                  if(!utils.isValidIP(val)){
                    cb('Invalid ip address');
                  }
                  else{
                    cb();
                  }
                }
                else{
                  cb();
                }
                
              }
            }
          },
          account: {
            label: 'Mining machine\'s Polkadot wallet (SSS8) address',
            type: 'Input',
            required: true,

          },
          
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);
        
        try{
          const tx = api.tx.cml.migrate(
            form.cml_id,
            form.miner_id,
            form.miner_ip,
            form.account,
            null,
          );
          await layer1_instance.sendTx(self.layer1_account.address, tx);

          await close();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        
        self.$root.loading(false);
      },
    });
  },

};




export default F;
