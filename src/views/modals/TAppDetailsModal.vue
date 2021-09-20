<template>
  <el-dialog
    :title="tapp ? tapp.name : '---'"
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
      <!-- <h4 style="font-size: 18px;color: #666; margin: 0 0 5px 0;">{{tapp.name}}</h4> -->
      <el-row class="x-list" style="flex-direction: row;">
        <el-col :span="24">

          <div class="x-item" v-for="(item, i) of item_list" :key="i">
            <b>{{item.label}} :</b>
            <span>{{item.value}}</span>
          </div>
          

          
        </el-col>
        
      </el-row>
      <!-- <el-row class="x-list" style="flex-direction: row; margin-top:10px;">
        <el-col :span="24">
          <div class="x-item">
            <b>Resource Cid :</b>
            <span>{{tapp.cid}}</span>
          </div>
          <div style="margin-top:8px;text-align:right;">
            <el-button v-if="tapp && layer1_account && layer1_account.address === tapp.owner" size="small" plain type="primary" @click="updateResourceCid()">Update Cid</el-button>
            <el-button style="margin-left: 15px;" size="small" plain type="primary" @click="visitIpfs()">Visit</el-button>
          </div>
        </el-col>
      </el-row> -->
      
      <h4 style="font-size: 18px;color: #666; margin: 20px 0 5px 0;">Hosting CML list</h4>
      <TeaTable
        :data="cml_list || []"
        name='tapp_detail_hosting_cml_list_table'
        :pagination="false"
      >
        <el-table-column
          prop="cml_id"
          label="CML ID"
          width="80"
          sortable
        >
          <template slot-scope="scope">
            <el-button type="text" @click="close();$router.push('/cml_details/'+scope.row.cml_id)">{{scope.row.cml_id}}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="owner"
          label="Owner"
        >
          <template slot-scope="scope">
            <el-button 
              @click="close();$router.push('/user_details/'+scope.row.owner)"
              type="text">
              {{scope.row.owner}}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column
          prop="liferemaining"
          label="Life remaining"
          sortable
          width="120"
        >
          <template slot-scope="scope">
            {{scope.row.life_day}}
          </template>
        </el-table-column>
        <el-table-column
          prop="performance"
          label="Current / Peak performance"
          width="180"
        />
        <el-table-column
          prop="remaining_performance"
          label="Remaining performance"
          width="180"
          sortable
        />

        <el-table-column
          label="Total income"
          width="120"
          sortable
          prop="reward"
        >
          <template slot-scope="scope">
            <span :inner-html.prop="scope.row.reward?scope.row.reward:'---'"></span>
          </template>
        </el-table-column>


      </TeaTable>

    </div>
    
    <span slot="footer" class="dialog-footer">
      <!-- <el-button v-if="tapp && layer1_account && layer1_account.address === tapp.owner" style="float:left;" size="small" type="primary" @click="updateResourceCid()">Update resource Cid</el-button> -->

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
export default {
  components: {
    TeaTable,
  },
  data(){
    return {
      loading: true,
      tapp: null,

      cml_list: null,
      item_list: [],
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible: state => store.state.modal.tapp_details.visible,
      param: state => store.state.modal.tapp_details.param,
    })
  },

  methods: {
    close(){
      this.$store.commit('modal/close', 'tapp_details');
      this.loading = true;
      this.tapp = null;
      this.cml_list = null;
    },
    async openHandler(){
      this.wf = new Base();
      await this.wf.init();

      this.layer1_instance = this.wf.getLayer1Instance();
      this.api = this.layer1_instance.getApi();

      const tapp_id = this.param.id;

      await this.initDetailInfo(tapp_id);
      await this.initCmlInfo(tapp_id);

      this.loading = false;
    },

    async initDetailInfo(tapp_id){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const arr = await request.layer1_rpc('bonding_tappDetails', [tapp_id]);
      const tmp = {
        name: utils.rpcArrayToString(arr[0]),
        token_symbol: utils.rpcArrayToString(arr[2]),
        owner: arr[3],
        detail: utils.rpcArrayToString(arr[4]),
        link: utils.rpcArrayToString(arr[5]),
        host_performance: arr[6],
        host_current: arr[7],
        host_max: arr[8],
        host_min: 3,
        is_full: arr[7] >= arr[8],
        total_supply: utils.layer1.balanceToAmount(arr[9]),
        buy_price: utils.layer1.balanceToAmount(arr[10]),
        sell_price: utils.layer1.balanceToAmount(arr[11]),
      };

      let item_list = [
        {
          label: 'Ticker',
          value: tmp.token_symbol,
        },
        {
          value: tmp.detail,
          label: 'Details'
        },
        {
          value: tmp.host_performance,
          label: 'Host performance'
        }
      ];

      const cid = (await api.query.bondingCurve.tAppResourceMap(tapp_id)).toJSON();
      tmp.cid = hexToString(cid);

      tmp.market_cap = utils.layer1.roundAmount(tmp.sell_price * tmp.total_supply);

      const item = (await api.query.bondingCurve.tAppBondingCurve(tapp_id)).toJSON();

      if(_.has(item.billing_mode, 'fixedHostingToken')){
        tmp.billing_mode = 'Fixed TApp token and dividend payments per 100 blocks';
        item_list.push({
          label: 'Billing model',
          value: tmp.billing_mode
        });
        item_list.push({
          label: 'Stake token amount',
          value: utils.layer1.balanceToAmount(item.billing_mode.fixedHostingToken.FixedHostingToken)
        });
      }
      else if(_.has(item.billing_mode, 'fixedHostingFee')){
        tmp.billing_mode = 'Fixed TEA payment per 100 blocks';
        item_list.push({
          label: 'Billing model',
          value: tmp.billing_mode
        });
        item_list.push({
          label: 'Reward per 1000 performance',
          value: utils.layer1.balanceToAmount(item.billing_mode.fixedHostingFee.FixedHostingFee)
        });
      }
      
      tmp.type = item.tapp_type;

      this.tapp = tmp;

      item_list = _.concat(item_list, [
        {
          label: 'Min / Max hosts',
          value: tmp.host_min+' / '+tmp.host_max
        },
        {
          label: 'Current hosts',
          value: tmp.host_current
        },
        {
          label: 'TApp template',
          value: tmp.type,
        },
        {
          label: 'Total supply',
          value: tmp.total_supply,
        },
        {
          label: 'Buy / Sell price',
          value: tmp.buy_price+' / '+tmp.sell_price
        },
        {
          label: 'Market cap',
          value: tmp.market_cap
        }
      ]);

      this.item_list = item_list;

    },
    async initCmlInfo(tapp_id){
      const tmp_list = await request.layer1_rpc('bonding_tappHostedCmls', [tapp_id]);

      const list = await Promise.all(_.map(tmp_list, async (arr, i)=>{
        const item = {
          cml_id: arr[0],
          owner: arr[1],
          life_day: this.wf.blockToDay(arr[2]),
          current_performace: arr[3],
          remaining_performance: arr[4],
          peak_performance: arr[5],
          reward: null,
        };
        item.performance = `${item.current_performace}/${item.peak_performance}`;

        this.getReward(item.cml_id, tapp_id, (total, total_str)=>{
          console.log(`${item.cml_id} => `+total);
          this.cml_list[i].reward = total_str;
        });

        return item;
      }));

      this.cml_list = list;
    },

    async getReward(cml_id, tapp_id, cb){ 
      let total = 0;
      const query = `
query {
  hostingTappRewards (
    first: 100,
    filter: {
      cmlId: {equalTo: "${cml_id}"},
      tappId: {equalTo: "${tapp_id}"}
    }
  ) {
    nodes {
      id
      cmlId
      tappId
      accountId
      
      
    }
  }
}
      `;

      const rs = await request.queryGraphQL(query);
      _.map(rs.hostingTappRewards.nodes, (item)=>{
        const n = _.toNumber(item.total);
        total += n;
        return null;
      });

      cb(utils.layer1.balanceToAmount(total), utils.layer1.formatBalance(total, true));
      
    },

    openTo(){
      
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
            await this.initDetailInfo(tapp_id);
            mclose();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },
    visitIpfs(){
      const cid = this.tapp.cid;
      helper.goToTAppWithIpfsCid(cid);
    }
  }
}
</script>