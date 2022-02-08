<template>
  <el-dialog
    title="Click to open Notification Tapp"
    :visible="visible"
    width="900px"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <i v-if="!param || loading" class="el-icon-loading" style="display: block; width: 40px; height: 40px;font-size: 40px; margin: 0 auto;"></i>

    <div class="tea-modal-card" v-if="!loading" style="margin: 0 -20px; display:block;">
      
      <div v-if="tapp.is_active">

        <p style="
          font-size: 15px;
          margin: -5px 0 15px 0;
          word-break: break-word;
        ">
          
        </p>
        
        
        <h4 style="font-size: 18px;color: #666; margin: 0 0 5px 0;">Delegator list</h4>
        <TeaTable
          :data="list || []"
          name='tapp_detail_hosting_cml_list_table'
          :pagination="false"
        >
          <el-table-column
            label="Link"
          >
            <template slot-scope="scope">
              <el-link :href="scope.row.url" target="_blank" :inner-html.prop="scope.row.url"></el-link>
            </template>
          </el-table-column>

          <!-- <el-table-column
            label="Delay"
            prop="ping"
            width="100"
          /> -->


        </TeaTable>
      </div>
      <div v-if="!tapp.is_active" style="font-size:15px;">
        Current TApp is pending, will active until enough miner hosting it.
      </div>

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
import TeaTable from '../../components/TeaTable';
import {hexToString} from 'tearust_layer1';
import helper from '../helper';
import tapp from '../../tapp';
export default {
  components: {
    TeaTable,
  },
  data(){
    return {
      loading: true,
      tapp: null,

      list: null,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible: state => store.state.modal.notification_link.visible,
      param: state => store.state.modal.notification_link.param,
    })
  },

  methods: {
    close(){
      this.$store.commit('modal/close', 'notification_link');
      this.loading = true;
      this.tapp = null;
      this.list = null;
    },
    async openHandler(){
      this.wf = new Base();
      await this.wf.init();

      this.layer1_instance = this.wf.getLayer1Instance();
      this.api = this.layer1_instance.getApi();

      const tapp_id = utils.get_env("notification_tapp_id");
      if(!tapp_id){
        throw 'Invalid notification tapp id, check the env settings.'
      }

      await this.initInfo(_.toNumber(tapp_id));

      this.loading = false;
    },

    async initInfo(tapp_id){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const tmp_list = await request.layer1_rpc('bonding_tappHostedCmls', [tapp_id]);
      
      const cml_list = await this.wf.getCmlByList(_.map(tmp_list, (arr)=>arr[0]));

      const arr = await request.layer1_rpc('bonding_tappDetails', [tapp_id]);
      const tmp = {
        name: utils.rpcArrayToString(arr[0]),
        token_symbol: utils.rpcArrayToString(arr[2]),
        owner: arr[3],
        link: utils.rpcArrayToString(arr[5]),
      };

      // const cid = (await api.query.bondingCurve.tAppResourceMap(tapp_id)).toJSON();
      // tmp.cid = hexToString(cid);

      const item = (await api.query.bondingCurve.tAppBondingCurve(tapp_id)).toJSON();
      if(_.has(item.status, 'active')){
        tmp.is_active = true;
      }
      else{
        tmp.is_active = false;
      }

      try{
        tmp.json = JSON.parse(tmp.link);
      }catch(e){
        tmp.json = {};
      }

      tmp.id = tapp_id;

      
      this.tapp = tmp;

      const ori_ip_list = _.map(cml_list, (item)=>{
        if(item.cml_type !== 'B') return null;
        if(item.miner_status === 'Active'){
          return item.miner_ip;
        }
        return null;
      });
      const ip_list = _.filter(_.uniq(ori_ip_list));

      const notfication_cid = utils.get_env("notification_tapp_cid");
      if(!notfication_cid){
        throw 'Invalid notification tapp cid, check env settings.';
      }
      console.log(11, this.tapp);
      this.list = _.map(ip_list, (ip)=>{
        const param = `id=${this.tapp.id}&v=${encodeURIComponent(this.tapp.json.v)}`;
        const url = 'http://'+ip+':8080/ipfs/'+notfication_cid+`?${param}#/my_notification`;

        return {
          url,
        };
      });

    },


    
    async updateResourceCid(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const tapp_id = this.param.id;

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Update resource Cid',
          pallet: 'bondingCurve',
          tx: 'updateTappResource',
          text: '',
          props: {
            tapp_id: {
              label: 'TApp Id',
              type: 'Input',
              default: tapp_id,
              disabled: true,
            },
            cid: {
              label: 'IPFS Cid',
              type: 'Input',
            }
          },
        },
        cb: async (form, mclose)=>{
          this.$root.loading(true);

          try{

            const tx = api.tx.bondingCurve.updateTappResource(tapp_id, form.cid);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            this.loading = true;
            await this.openHandler();
            
            mclose();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },
    openUrl(url){
      helper.openUrl(url);
    }
  }
}
</script>
