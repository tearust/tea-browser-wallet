<template>
  <el-dialog
    :title="'PutCmlToAuctionSore' | str"
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @close="$store.commit('modal/close', 'put_to_auction_store')"
  >

    <el-form :model="form" label-width="120px">
      <el-form-item label="Cml Id">
        <el-input v-model="form.cml_id"></el-input>
      </el-form-item>
      <el-form-item label="Starting price">
        <el-input-number v-model="form.starting_price" :min="0" :max="50000"></el-input-number>
      </el-form-item>
      <el-form-item label="Buy now price">
        <el-input-number v-model="form.buy_now_price" :min="0" :max="100000"></el-input-number>
      </el-form-item>
      <el-form-item label="Auto renew">
        <el-checkbox v-model="form.auto_renew"></el-checkbox>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="$store.commit('modal/close', 'put_to_auction_store')">Close</el-button>
      <el-button size="small" type="primary" @click="confrim()">Confirm</el-button>
    </span>

  </el-dialog>


</template>
<script>
import { mapState } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
export default {
  data(){
    return {
      form: {
        starting_price: null,
        buy_now_price: null,
        cml_id: null,
        auto_renew: false,
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
    confrim(){
      const cb = utils.mem.get('put_to_auction_store');
      if(cb){
        cb(this.form);
      }
    }
  }
}
</script>