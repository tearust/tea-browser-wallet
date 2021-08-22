
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import request from '../request';

// self means vue instance, required.
const F = {
  async tapps_buyToken(self, data, succ_cb){
    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();

    self.$store.commit('modal/open', {
      key: 'common_tx', 
      param: {
        title: 'Buy token',
        pallet: 'boundingCurve',
        tx: 'buyToken',
        text: `You are buying the ${data.name}'s token ${data.token_symbol}`,
        props: {
          tapp_id: {
            class: 'hidden',
            default: data.id,
          },
          tapp_amount: {
            label: 'Amount token',
            type: 'number',
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);
        
        const id = form.tapp_id;
        // const amount = utils.layer1.amountToBalance(form.tapp_amount);
        const amount = (form.tapp_amount);
        const estimate = await request.layer1_rpc('bounding_estimateTeaRequiredToBuyGivenToken', [
          id, amount
        ]);

        try{
          await self.$confirm(`You will pay <b>${estimate} TEA</b> <br/> Are you sure?`, {
            dangerouslyUseHTMLString: true,
          });
        }catch(e){
          self.$root.loading(false);
          return false;
        }
        
      
        try{

          const tx = api.tx.boundingCurve.buyToken(id, amount);
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
        pallet: 'boundingCurve',
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
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);
        const id = form.tapp_id;
        // const amount = utils.layer1.amountToBalance(form.tapp_amount);
        const amount = (form.tapp_amount);
        const estimate = await request.layer1_rpc('bounding_estimateReceivedTeaBySellGivenToken', [
          id, amount
        ]);

        try{
          await self.$confirm(`You will receive <b>${estimate} TEA</b> <br/> Are you sure?`, {
            dangerouslyUseHTMLString: true,
          });
        }catch(e){
          self.$root.loading(false);
          return false;
        }


        try{

          const tx = api.tx.boundingCurve.sellToken(id, amount);
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