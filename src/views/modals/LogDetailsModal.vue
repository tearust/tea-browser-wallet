<template>
  <el-dialog
    :title="title || 'Log Details'"
    :visible="visible"
    width="80%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @close="$store.commit('modal/close', 'log_details')"
  >

    

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="$store.commit('modal/close', 'log_details')">Close</el-button>
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
      visible: state => store.state.modal.log_details.visible,
      param: state => store.state.modal.log_details.param,
    }),
    ...mapState('clog', {
      details: state => store.state.clog.details,
    }),
  },

  methods: {
    
  }
}
</script>