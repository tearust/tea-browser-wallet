<template>
  <el-dialog
    title="Bid"
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @close="$store.commit('modal/close', 'bid_for_auction')"
  >

    <el-form :model="form" label-width="150px">
      <p class="c-info" :inner-html.prop="param.msg || ''"></p>

      <el-form-item label="CML Id">
        <el-input :disabled="true" :value="param.cml_id"></el-input>
      </el-form-item>
      <el-form-item :label="param.type==='add' ? 'Amount to increase bid' : 'Bid'">
        <el-input-number :disabled="form.buy_now" v-model="form.price" :min="0" :max="100000"></el-input-number>
      </el-form-item>

      <el-form-item style="margin-top:-18px;" v-if="param.buy_now_price" label="Buy it now">
        <el-checkbox v-model="form.buy_now">
          Buy now price is <b>{{param.buy_now_price | balance_number}} TEA</b>.
          <span v-if="form.buy_now">
            Buying it now at this price will cancel your existing bid.
          </span>
         
        </el-checkbox>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="$store.commit('modal/close', 'bid_for_auction')">Close</el-button>
      <el-button size="small" type="primary" @click="confrim()">Confirm</el-button>
    </span>

  </el-dialog>


</template>
<script>
import { mapState } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
import {_} from 'tearust_utils';
export default {
  data(){
    return {
      form: {
        price: undefined,

        buy_now: false,
      }
    };
  },
  computed: {
    ...mapState('modal', {
      visible:state => store.state.modal.bid_for_auction.visible,
      param: state => store.state.modal.bid_for_auction.param,
    })
  },

  methods: {
    async confrim(){
      const form = _.clone(this.form);
      if(form.buy_now){
        form.price = this.param.buy_now_need;
      }

      if(this.form.buy_now && this.param.buy_now_need && this.form.price > this.param.buy_now_need){
        // const x = await this.$confirm(`You only need ${this.param.buy_now_need} TEA to buy it now. Would you like to buy it at that price?`, 'Info');
        // if(!x) return;

        // this.form.price = this.param.buy_now_need;
        // this.form.buy_now = true;
        // return;
      }


      const cb = utils.mem.get('bid_for_auction');
      if(cb){
        await cb(form, ()=>{
          this.form = {
            price: null,
            buy_now: false,
          };

          this.$store.commit('modal/close', 'bid_for_auction');
        });
      }
    }
  }
}
</script>