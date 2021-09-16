
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import request from '../request';

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
      key: 'common_tx', 
      param: {
        title: 'Buy token',
        pallet: 'bondingCurve',
        tx: 'buyToken',
        confirm_text: 'Next',
        text: `You are buying the ${data.name}'s token ${data.token_symbol}. For more information on how to invest in TApp tokens, <a href="https://github.com/tearust/teaproject/wiki/Epoch-3-TApps-List#tapp-token-strategy" class="t-wiki" target="_blank">visit our wiki</a>.`,
        props: {
          tapp_id: {
            class: 'hidden',
            default: data.id,
          },
          tapp_amount: {
            label: 'Amount token',
            type: 'number',
            max: 100000000,
            remove_required_rule: true,
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
          id, amount
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
      key: 'common_tx', 
      param: {
        title: 'Sell token',
        confirm_text: 'Next',
        pallet: 'bondingCurve',
        tx: 'sellToken',
        text: `You are selling the ${data.name}'s token ${data.token_symbol}`,
        props: {
          tapp_id: {
            class: 'hidden',
            default: data.id,
          },
          tapp_amount: {
            label: 'Amount token',
            type: 'number',
            max: 100000000,
            remove_required_rule: true
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
          id, amount
        ]);
        estimate = utils.layer1.balanceToAmount(estimate);

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
      const item = {
        id: arr[0],
        current: arr[1],
        remaining: arr[2],
        life_day: self.wf.blockToDay(arr[3]),
        is_on: !!_.find(arr[4], (xd)=>xd===tapp_id),
      };

      return item;
    }));

    return list;
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
    if(row.host_current < 1){
      self.$root.showError('This TApp has zero host at this moment. It has not been deployed yet.');
      return;
    }

    let url = _.trim(row.link);
    url = utils.urlToLink(url);
    url += '&id='+row.id;
    window.open(url, '_blank');
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
      total
      
    }
  }
}
    `;

    const rs = await request.queryGraphQL(query);
    return rs.hostingTappRewards.nodes[0];
  },

  async showTAppDetails(self, tapp_id,){
    self.$store.commit('modal/open', {
      key: 'tapp_details',
      param: {
        id: tapp_id,
      },
    });
  }

};




export default F;