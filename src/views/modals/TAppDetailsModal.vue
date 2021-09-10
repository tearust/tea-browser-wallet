<template>
  <el-dialog
    :title="tapp ? tapp.name : '---'"
    :visible="visible"
    width="1080px"
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
        <el-col :span="12" style="padding-right: 10px;">
          <div class="x-item">
            <b>Ticker :</b>
            <span>{{tapp.token_symbol}}</span>
          </div>
          <div class="x-item">
            <b>Details :</b>
            <span>{{tapp.detail}}</span>
          </div>
          
        </el-col>
        
        <el-col :span="12" style="padding-left: 10px;">
          <!-- <div class="x-item">
            <b>Owner :</b>
            <span>{{tapp.owner}}</span>
          </div> -->
          <div class="x-item">
            <b>Performance required :</b>
            <span>{{tapp.host_performance}}</span>
          </div>
          <div class="x-item">
            <b>Current/Max hosts :</b>
            <span>{{tapp.host_n}}</span>
          </div>
        </el-col>
      </el-row>
      
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
          prop="life_day"
          label="Life remaining"
          width="100"
        />
        <el-table-column
          prop="performance"
          label="Current / Peak performance"
          width="180"
        />
        <el-table-column
          prop="remaining_performance"
          label="Remaining performance"
          width="180"
        />

        <el-table-column
          label="Total income"
          width="120"
        >
          <template slot-scope="scope">
            <span :inner-html.prop="scope.row.reward?scope.row.reward:'---'"></span>
          </template>
        </el-table-column>


      </TeaTable>

    </div>
    
    <span slot="footer" class="dialog-footer">
      <!-- <el-button style="float:left;" size="small" type="primary" @click="close()">Goto TApp</el-button> -->

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
export default {
  components: {
    TeaTable,
  },
  data(){
    return {
      loading: true,
      tapp: null,

      cml_list: null,
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
      const arr = await request.layer1_rpc('bonding_tappDetails', [tapp_id]);
      const tmp = {
        name: utils.rpcArrayToString(arr[0]),
        token_symbol: utils.rpcArrayToString(arr[2]),
        owner: arr[3],
        detail: utils.rpcArrayToString(arr[4]),
        link: utils.rpcArrayToString(arr[5]),
        host_performance: arr[6],
        host_current: arr[7],
        host_n: `${arr[7]}/${arr[8]}`,
        is_full: arr[7] >= arr[8],
      };

      // console.log(tmp);
      this.tapp = tmp;
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
      total
      
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
      
    }
  }
}
</script>