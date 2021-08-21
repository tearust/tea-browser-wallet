
import {_} from 'tearust_utils';
import utils from '../tea/utils';
// self means vue instance, required.
const F = {
  async tapps_buyToken(self, data){
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
            label: 'Amount',
            type: 'number',
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);
        try{

          const id = form.tapp_id;
          const amount = utils.layer1.amountToBalance(form.tapp_amount);

          const tx = api.tx.boundingCurve.buyToken(id, amount);
          await layer1_instance.sendTx(self.layer1_account.address, tx);

          close();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  },

  async tapps_sellToken(self, data){
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
        try{

          const id = form.tapp_id;
          const amount = utils.layer1.amountToBalance(form.tapp_amount);

          const tx = api.tx.boundingCurve.sellToken(id, amount);
          await layer1_instance.sendTx(self.layer1_account.address, tx);

          close();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  }
};




export default F;