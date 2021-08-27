
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
        text: `You are buying the ${data.name}'s token ${data.token_symbol}`,
        props: {
          tapp_id: {
            class: 'hidden',
            default: data.id,
          },
          tapp_amount: {
            label: 'Amount token',
            type: 'number',
            max: 100000000,
          }
        },
      },
      cb: async (form, close)=>{
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
            label: 'Amount',
            type: 'number',
            max: 100000000,
          }
        },
      },
      cb: async (form, close)=>{
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
  }
};




export default F;