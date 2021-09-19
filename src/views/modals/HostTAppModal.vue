<template>

  <el-dialog
    title="Host / Unhost TApp"
    :visible="visible"
    width="80%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <i v-if="!param || loading" class="el-icon-loading" style="display: block; width: 40px; height: 40px;font-size: 40px; margin: 0 auto;"></i>

  <div v-if="!loading && param && param.tapp">
      <p class="c-info" v-if="param.tapp.is_full">This TApp no longer accepts new hosts</p>
      <p class="c-info" v-if="!param.tapp.is_full">
        {{param.tapp.name}} requires {{param.tapp.host_performance}} performance to host. Please select one of the CML which is qualified to host. <br/>
        For more info about maximizing your hosting revenue, <a class="t-wiki" href="https://github.com/tearust/teaproject/wiki/Epoch-3-Mining#host-and-unhost-tapp" target="_blank">visit our wiki</a>.
      </p>
    

    <el-table 
      v-if="cml_list"
      :data="cml_list"
      class="tea-table"
      stripe
      size="small"
      border
    >
      
      <el-table-column
        prop="id"
        label="CML ID"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="
            close();
            $router.push('/cml_details/'+scope.row.id);
          ">{{scope.row.id}}</el-button>
        </template>
      </el-table-column>

      <el-table-column
        prop="current"
        label="Current performance"
      />
      <el-table-column
        prop="remaining"
        label="Remaining performance"
      />
      <el-table-column
        prop="life_day"
        label="Life remaining"
      />

      <el-table-column
        label="Actions"
        width="200">
        <template slot-scope="scope">

          <TeaIconButton :disabled="scope.row.is_on || param.tapp.is_full || scope.row.remaining<param.tapp.host_performance" tip="Host" icon="download" icon_style="font-size:20px;" @click="hostApp(scope)" />

          <TeaIconButton style="position:relative;top:1px;" :disabled="!scope.row.is_on" tip="Hosting this TApp now. Unhost?" icon="upload" icon_style="font-size:20px;" @click="unhostApp(scope)" />
          
        </template>
      </el-table-column>
      
    
    </el-table>
    <h5 v-if="!cml_list" style="font-size:20px;">You can only host a TApp using your CML currently in mining.</h5>


  </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="close()">Close</el-button>
    </span>

  </el-dialog>


</template>
<script>
import { mapState, mapGetters } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import request from '../../request';
import TeaIconButton from '../../components/TeaIconButton';
import helper from '../helper';

export default {
  components: {
    TeaIconButton
  },
  data(){
    return {
      cml_list: null,
      loading: true,

      tapp: null,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible:state => store.state.modal.host_tapp.visible,
      param: state => store.state.modal.host_tapp.param,
    }),
  },

  methods: {
    async init_cml_list(){
      const tapp_id = this.param.tapp.id;

      this.cml_list = await helper.bonding_listCandidateMiners(this, tapp_id);

      this.loading = false;
    },

    async openHandler(){
      this.wf = new Base();
      await this.wf.init();

      await this.init_cml_list();
    },

    close(){
      this.loading = true;
      this.cml_list = null;
      this.$store.commit('modal/close', 'host_tapp');
    },

    async hostApp(scope){
      const x = await this.$confirm('Once hosting a TApp, you cannot unhost until 1000 blocks later. <br/>Are you sure?', {
        dangerouslyUseHTMLString: true,
      }).catch(()=>{});
      if(!x){
        return false;
      }

      const tapp_id = this.param.tapp.id;
      const cml_id = scope.row.id;

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const cb = utils.mem.get('host_tapp');

      this.$root.loading(true);
      try{
        const tx = api.tx.bondingCurve.host(cml_id, tapp_id);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        
        this.close();

        if(cb){
          await cb();
        }

      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);

    },
    async unhostApp(scope){
      const tapp_id = this.param.tapp.id;
      const cml_id = scope.row.id;

      const cb = utils.mem.get('host_tapp');
      helper.unhostTApp(this, {
        tapp_id, cml_id,
      }, async ()=>{
        
        this.close();
        if(cb){
          await cb();
        }
      });
    },

    
  }
}
</script>