<template>
  <el-dialog
    title="PUT CML TO AUCTION STORE"
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @close="$store.commit('modal/close', 'put_to_auction_store')"
  >

    <el-form :model="form" label-width="120px">
      <el-form-item label="Cml Id">
        <el-input :disabled="true" :value="param.cml_id"></el-input>
      </el-form-item>
      <el-form-item label="Starting Price">
        <el-input-number v-model="form.starting_price" :min="0" :max="50000"></el-input-number>
      </el-form-item>
      <el-form-item label="Buy Now Price">
        <el-input-number v-model="form.buy_now_price" :min="0" :max="100000"></el-input-number>
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