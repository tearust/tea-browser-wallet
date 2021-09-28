<template>
  <el-dialog
    :title="'PutCmlToAuctionStore' | str"
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @close="close()"
  >

    <el-form ref="tx_form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="CML Id" prop="cml_id">
        <el-input v-model="form.cml_id"></el-input>
      </el-form-item>
      <el-form-item label="Starting price">
        <el-input-number v-model="form.starting_price" :min="1" :max="500000"></el-input-number>
      </el-form-item>
      <el-form-item label="Buy now price">
        <el-input-number v-model="form.buy_now_price" :min="0" :max="1000000"></el-input-number>
        <TeaIconButton style="margin-left: 10px;" icon_style="font-size:18px;" @click="openUrl('https://github.com/tearust/teaproject/wiki/Marketplace-Auctions#buy-now-price')" icon="questionmark" />
      </el-form-item>
      <el-form-item label="Auto renew">
        <el-checkbox v-model="form.auto_renew"></el-checkbox>

        <TeaIconButton style="margin-left: 10px;" icon_style="font-size:18px;" @click="openUrl('https://github.com/tearust/teaproject/wiki/Marketplace-Auctions#auto-renew')" icon="questionmark" />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="close()">Close</el-button>
      <el-button size="small" type="primary" @click="confrim()">Confirm</el-button>
    </span>

  </el-dialog>


</template>
<script>
import { mapState } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
import TeaIconButton from '../../components/TeaIconButton';
import helper from '../helper'
export default {
  components: {
    TeaIconButton,
  },
  data(){
    return {
      form: {
        starting_price: 1,
        buy_now_price: undefined,
        cml_id: null,
        auto_renew: false,
      },
      rules: {
        cml_id: [{required: true}],
      }
    };
  },
  computed: {
    ...mapState('modal', {
      visible:state => store.state.modal.put_to_auction_store.visible,
      param: state => store.state.modal.put_to_auction_store.param,
    })
  },

  methods: {
    close(){
      this.$store.commit('modal/close', 'put_to_auction_store');
      this.form = {
        starting_price: null,
        buy_now_price: null,
        cml_id: null,
        auto_renew: false,
      };
    },
    async confrim(){
      const ref = this.$refs['tx_form'];
      await ref.validate();

      const cb = utils.mem.get('put_to_auction_store');
      if(cb){
        cb(this.form, this.close);
      }
    },
    openUrl: helper.openUrl,
  }
}
</script>
