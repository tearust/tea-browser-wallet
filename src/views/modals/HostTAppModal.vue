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
      <p class="c-info" v-if="param.tapp.is_full">This TApp no longer accepts new host</p>
      <p class="c-info" v-if="!param.tapp.is_full">
        {{param.tapp.name}} requires {{param.tapp.host_performance}} performance to host. Please select one of the CML which is qualified to host.
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
      />
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

          <span v-if="!scope.row.is_on"><el-button type="text" @click="hostApp(scope)">Host</el-button></span>
          
          <span v-if="scope.row.is_on">Hosting this TApp now. <el-button type="text" @click="unhostApp(scope)">Unhost?</el-button></span>
          
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

export default {
  data(){
    return {
      cml_list: null,
      loading: true,
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

      const cml_list = await request.layer1_rpc('bounding_listCandidateMiners', []);
      this.cml_list = await Promise.all(_.map(cml_list, async (arr)=>{
        const item = {
          id: arr[0],
          current: arr[1],
          remaining: arr[2],
          life_day: this.wf.blockToDay(arr[3]),
          is_on: !!_.find(arr[4], (xd)=>xd===tapp_id),
        };

        return item;
      }));

      console.log(111, this.cml_list);

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
      const tapp_id = this.param.tapp.id;
      const cml_id = scope.row.id;

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const sig = await layer1_instance.signWithExtension(this.layer1_account.address, 'aaa');
      console.log(111, sig);
      return;

      const cb = utils.mem.get('host_tapp');

      this.$root.loading(true);
      try{
        const tx = api.tx.boundingCurve.host(cml_id, tapp_id);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        if(cb){
          await cb();
        }
        this.close();

      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);

    },
    async unhostApp(scope){
      const tapp_id = this.param.tapp.id;
      const cml_id = scope.row.id;

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const cb = utils.mem.get('host_tapp');

      this.$root.loading(true);
      try{
        await this.$confirm(`Your CML ${cml_id} will no longer host this TApp, continue?`, 'Unhost');
      }catch(e){
        this.$root.loading(false);
      }

      try{
        const tx = api.tx.boundingCurve.unhost(cml_id, tapp_id);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        if(cb){
          await cb();
        }
        this.close();

      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },

    
  }
}
</script>