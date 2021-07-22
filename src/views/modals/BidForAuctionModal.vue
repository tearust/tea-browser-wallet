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

    <el-form :model="form" label-width="120px">
      <p>{{param.msg || ''}}</p>
      <el-form-item label="CML Id">
        <el-input :disabled="true" :value="param.cml_id"></el-input>
      </el-form-item>
      <el-form-item label="Price">
        <el-input-number v-model="form.price" :min="0" :max="100000"></el-input-number>
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
export default {
  data(){
    return {
      form: {
        price: null,
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
      const cb = utils.mem.get('bid_for_auction');
      if(cb){
        await cb(this.form, ()=>{
          this.form = {
            price: null,
          };

          this.$store.commit('modal/close', 'bid_for_auction');
        });
      }
    }
  }
}
</script>