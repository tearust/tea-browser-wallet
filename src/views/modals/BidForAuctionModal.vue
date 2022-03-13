<template>
  <el-dialog
    title="Bid"
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <i v-if="!param || loading" class="el-icon-loading" style="display: block; width: 40px; height: 40px;font-size: 40px; margin: 0 auto;"></i>

    <el-form v-if="!loading" :model="form" label-width="150px">
      <p class="c-info" :inner-html.prop="msg"></p>

      <el-form-item label="CML Id">
        <el-input :disabled="true" :value="param.cml_id"></el-input>
      </el-form-item>
      <el-form-item :label="param.type==='add' ? 'Amount to increase bid' : 'Bid'">
        <el-input-number :disabled="form.buy_now" v-model="form.price" :min="0" :max="100000"></el-input-number>
      </el-form-item>

      <el-form-item style="margin-top:-18px;" v-if="param.buy_now_price" label="Buy it now">
        <el-checkbox v-model="form.buy_now" @change="changeHandler()">
          Buy now price is <b>{{param.buy_now_price | balance_number}} TEA</b>.
          <span v-if="form.buy_now">
            Buying it now at this price will cancel your existing bid.
          </span>
         
        </el-checkbox>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="close()">Close</el-button>
      <el-button size="small" type="primary" @click="confrim()">Confirm</el-button>
    </span>

  </el-dialog>


</template>
<script>
import { mapState, mapGetters } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
import {_} from 'tearust_utils';
import Auction from '../../workflow/Auction';
import request from '../../request';
export default {
  data(){
    return {
      loading: true,
      msg: '',
      xm: null,
      form: {
        price: undefined,

        buy_now: false,
      }
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible:state => store.state.modal.bid_for_auction.visible,
      param: state => store.state.modal.bid_for_auction.param,
    })
  },

  methods: {
    async openHandler(){
      this.wf = new Auction();
      await this.wf.init();

      const [min_price, my_bid, is_mining] = await this.calculateBidMinPrice();

      if(min_price.lt(utils.toBN(0))){
        this.$root.showError('This auction is completed, please refresh.');
        this.close();
        return;
      }

      let msg = `You need at least <b>${utils.layer1.formatBalance(min_price)} TEA</b> to bid on this auction`;
      if(is_mining && !my_bid){
        msg += `, and <b>1000 TEA</b> for staking. <br/>`;
      }
      else{
        msg += '.<br/>';
      }

      if(my_bid){
        msg += 'Your current bid is '+utils.layer1.formatBalance(my_bid)+' TEA';
      }

      this.msg = msg;

      this.xm = [min_price, my_bid, is_mining];

      this.loading = false;
    },
    changeHandler(){
      if(this.form.buy_now){
        this.form.price = this.param.buy_now_need;
      }
    },
    async calculateBidMinPrice(){
      const auction_id = this.param.auction_id;
      const rs = await request.layer1_rpc('auction_calculateMinimumBidPrice', [auction_id, this.layer1_account.address]);
      let min_price = utils.toBN(rs[0]);
      let my_bid = rs[1] ? utils.toBN(rs[1]) : null;
      const is_mining = rs[2];

      if(is_mining){
        min_price = min_price.sub(utils.toBN(utils.layer1.amountToBalance(1000)));
      }

      console.log('min-price => ', min_price.toString());

      return [min_price, my_bid, is_mining];
    },
    close(){
      this.$store.commit('modal/close', 'bid_for_auction');
      this.form = {
        price: undefined,
        buy_now: false,
      }
      this.msg = '';
      this.xm = null;
      _.delay(()=>{
        this.loading = true;
      }, 500)
    },
    async confrim(){
      const form = _.clone(this.form);
      if(form.buy_now){
        form.price = this.param.buy_now_need;
      }

      // if(!this.form.buy_now && this.param.buy_now_need && this.form.price > this.param.buy_now_need){
      //   const x = await this.$confirm(`You only need ${this.param.buy_now_need} TEA to buy it now. Would you like to buy it at that price?`, 'Info');
      //   if(!x) return;

      //   this.form.price = this.param.buy_now_need;
      //   this.form.buy_now = true;
      //   return;
      // }

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const auction_id = this.param.auction_id;        
      const price = utils.toBN(layer1_instance.asUnit(form.price));

      const [min_price, my_bid, is_mining] = this.xm;
      if(price.lt(min_price)){
        this.$root.showError('Please input a higher bid price');
        return false;
      }

      let tt_total = price;
      if(is_mining && !my_bid){
        tt_total = price.add(utils.toBN(utils.layer1.amountToBalance(1000)));
      }
      let tt_msg = 'Total bid amount will be '+utils.layer1.balanceToAmount(tt_total)+' TEA: <br />';
      if(is_mining && !my_bid){
        tt_msg += ''+utils.layer1.balanceToAmount(price)+' TEA for the CML and 1000 TEA for staking.';
      }
      if(my_bid){
        //
      }

      const x = await this.$confirm(tt_msg, {dangerouslyUseHTMLString: true}).catch(()=>{});
      if(!x){
        return false;
      }

      const cb = utils.mem.get('bid_for_auction');
      if(cb){
        await cb(form, this.close);
      }
    }
  }
}
</script>
