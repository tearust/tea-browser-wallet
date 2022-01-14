<template>
  <div class="tea-page">

    <h4>
      Camellia detail
    </h4>
    <span v-if="miner && cml && cml.cml_type==='B'">Miner public address : {{miner.ip}}</span>
    <el-table 
      :data="cml ? [cml] : []"
      stripe
      size="small"
      border
      class="tea-table"
    >
      <el-table-column
        prop="id"
        width="90"
        label="CML ID"
      />

      <el-table-column
        prop="owner"
        label="Owner"
        width="100"
      >
        <template slot-scope="scope">
          <el-button
            :title="scope.row.owner"
            @click="
              $root.goPath('/user_details/'+scope.row.owner, 'replace')"
            type="text">
            {{scope.row.owner}}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column
        prop="cml_type"
        label="Type"
        width="70"
      />

      <el-table-column
        prop="lifespan"
        label="Life remaining"
      >
        <template slot-scope="scope">
          {{scope.row.life_day}}
        </template>
      </el-table-column>


      <el-table-column
        prop="machine_id"
        label="Miner ID"
      > 
        <template slot-scope="scope">
          <el-button
            @click="showMinerInfo(scope.row.machine_id)"
            type="text"
            size="small">
            {{scope.row.machine_id}}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column
        prop="miner_status"
        label="Miner status"
        width="100"
      />

      <el-table-column
        prop="performance"
        label="Current / Peak performance"
        width="110"
      />

      <el-table-column
        prop="defrost_schedule"
        label="Defrost schedule"
        width="150"
      />

      <el-table-column
        prop="defrost_day"
        label="Defrost day"
        width="120"
      />

      <el-table-column
          prop="status"
          label="Status"
          width="120"
        >
        <template slot-scope="scope">{{scope.row.status | str}}</template>
      </el-table-column>

      <el-table-column
        v-if="is_staking"
        label="Staking to"
        width="120"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="changeCmlId(scope.row.staking_cml_id)">{{scope.row.staking_cml_id}}</el-button>
        </template>
      </el-table-column>
      

    </el-table>
    
    <div style="margin-top: 8px; height: 24px;" v-if="layer1_account && cml && miner && layer1_account.address===cml.owner">
      
      <TeaIconButton 
        type="primary"
        tip="Migrate miner id and ip address"
        icon="NA"
        :disabled="miner.status==='Active'"
        title="Migrate miner"
        @click="migrateMiner()"
      />
      <TeaIconButton 
        type="primary"
        tip="Schedule start up mining machine"
        icon="NA"
        :disabled="miner.status!=='ScheduleDown'"
        title="Schedule start miner"
        @click="scheduleUp()"
      />
      <TeaIconButton 
        type="primary"
        tip="Schedule shut down mining machine"
        icon="NA"
        :disabled="miner.status!=='Active'"
        title="Schedule shut down miner"
        @click="scheduleDown()"
      />


      <el-button 
        style="float:right;"
        type="primary"
        size="small"
        plain
        @click="OpenToPolkadotForStaking()"
      >Apply to be a blockchain validator</el-button>
      
    </div>
    <div v-if="layer1_account && cml && miner && layer1_account.address===cml.owner">
      <p style="margin-top: 8px;margin-bottom:-8px;" v-if="miner.status==='Active'">
        Please note that mining machines must be shutdown before their CML can be migrated. 
        <a href="https://github.com/tearust/teaproject/wiki/CML-Migration-(Transfer)" target="_blank">Click here </a>
        for more information. <br>
        For more information on becoming a blockchain validator, <a href="https://github.com/tearust/teaproject/wiki/Mining---Layer-1-Validator-Mining" target="_blank">click and follow this guide</a>.
      </p>
    </div>

    <el-divider />
    <h4>Staking slots</h4>
    <el-table 
      :data="cml ? cml.staking_slot : []"
      stripe
      class="tea-table"
      size="small"
      border
    >
      <el-table-column
        label="Index"
        width="100"
      >
        <template slot-scope="scope">{{scope.row.real_index}}</template>
      </el-table-column>
      <el-table-column
        prop="owner"
        label="Staker"
      >
        <template slot-scope="scope">
          <el-button 
            @click="$router.push('/user_details/'+scope.row.owner)"
            type="text">
            {{scope.row.owner}}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="category"
        label="Staking with"
        width="120"
      />

      <el-table-column
        label="Staking CML ID"
        width="180"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="changeCmlId(scope.row.cml)">{{scope.row.cml}}</el-button>
        </template>
      </el-table-column>

      <el-table-column
        label="Amount"
        width="150"
      >
        <template v-if="scope.row.amount" slot-scope="scope">
          <span :inner-html.prop="scope.row.amount | balance"></span>
        </template>
      </el-table-column>
      <TeaTableColumn
        label="Weight"
        prop="weight"
        width="150"
        link="https://github.com/tearust/teaproject/wiki/Staking#staking-percentages"
      />
      
      
    </el-table>

    <el-divider />

    <h4>Hosting TApps</h4>
    <el-table 
      :data="tapp_list || []"
      stripe
      class="tea-table"
      size="small"
      border
    >
      <el-table-column
        label="TApp ID"
        prop="id"
        width="90"
      />
      <el-table-column
        prop="name"
        label="TApp Name"
      >
        <template slot-scope="scope">
          <el-button size="small" type="text" @click="openTo(scope.row)">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="token_symbol"
        label="Ticker"
        width="70"
      />
      <el-table-column
        prop="host_performance"
        label="Host performance requirement"
      />
      <el-table-column
        prop="host_n"
        label="Current/Max hosts"
      />
      
      <el-table-column
        label="Actions"
        width="200">
        <template slot-scope="scope">

          <TeaIconButton 
            style="position:relative;top:1px;" 
            :disabled="!cml || !layer1_account || cml.owner !== layer1_account.address" 
            tip="Hosting this TApp now. Unhost?" 
            icon="upload" 
            icon_style="font-size:20px;" 
            @click="unhostApp(scope)" 
          />
          
        </template>
      </el-table-column>
      
      
    </el-table>

    <el-divider />
    <h4>Accepted FaaS list</h4>

    <el-table 
      :data="faas_list || []"
      stripe
      class="tea-table"
      size="small"
      border
    >
      <el-table-column
        label="FaaS ID"
        prop="id"
        width="90"
      />
      <el-table-column
        prop="name"
        label="Name"
      />
      <el-table-column
        prop="detail"
        label="Detail"
        width="500"
      >
        <template slot-scope="scope">
          <span style="word-break:break-word;">{{scope.row.detail}}</span>
        </template>
      
      </el-table-column>
      <el-table-column
        prop="estimate"
        label="Estimate (TEA)"
      />

    </el-table> 
      

  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import store from '../store/index';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import {hexToString} from 'tearust_layer1';
import {_} from 'tearust_utils';
import helper from './helper';
import TeaIconButton from '../components/TeaIconButton';
import TeaTableColumn from '../components/TeaTableColumn'
import request from '../request';

export default {
  components: {
    TeaIconButton,
    TeaTableColumn
  },
  data(){
    return {
      cml: null,
      id: null,
      is_staking: false,
      miner: null,

      tapp_list: null,
      faas_list: [
        {
          id: '0',
          name: 'Availability Attestation',
          detail: 'C CML are randomly selected to run Availability Attestation on B CML to ensure they are online.',
          estimate: ''
        },
        // {
        //   id: '1',
        //   name: 'Delegator(upcoming epoch4)',
        //   detail: 'This service is counterpart of traditional "web server" that serve web client. Note: host needs to public IP address',
        //   estimate: '---'
        // }
      ],
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.id = this.$route.params.id;

    this.$root.loading(true);
    this.wf = new Base();
    await this.wf.init();

    
    await this.refresh();
    this.$root.loading(false);
  },

  methods: {
    async refresh(){
      this.$root.loading(true);
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();
      const cml_data = await this.wf.getCmlByList([this.id]);
      // console.log(111, cml_data[0]);
      this.cml = cml_data[0];
      this.cml.staking_slot = await Promise.all(_.map(this.cml.staking_slot, async (item, index)=>{
        item.weight = await utils.getStakingWeightByIndex(item);
        return item;
      }));
      this.is_staking = this.cml.status === 'Staking';

      this.faas_list[0].estimate = this.cml.slot_len;

      const app_list = (await api.query.bondingCurve.cmlHostingTApps(this.cml.id)).toJSON();
      this.tapp_list = await Promise.all(_.map(app_list, async (tapp_id)=>{
        const item = {
          id: tapp_id
        };

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

        return {
          ...item,
          ...tmp,
        };
      }));

      const mm = await this.getMinerDetails(this.cml.machine_id);
      // mm.status = 'Offline';
      this.miner = mm;
      this.cml.miner_status = mm.status;


      this.$root.loading(false);
    },
    async getMinerDetails(miner_id){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let mm = await api.query.cml.minerItemStore(miner_id);
      mm = mm.toJSON();

      mm.id = ' '+mm.id;
      mm.ip = hexToString(mm.ip);

      return mm;
    },
    async showMinerInfo(miner_id){
      let mm = this.miner;
      if(!mm){
        mm = await this.getMinerDetails(miner_id);
      }
      
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: {
          ...mm,
          title: 'Miner details',
        },
      });
    },
    async changeCmlId(cml_id){
      this.$root.goPath('/cml_details/'+cml_id, 'replace');
      this.id = cml_id

      await this.refresh();
    },

    async unhostApp(scope){
      const tapp_id = scope.row.id;
      const cml_id = this.cml.id

      helper.unhostTApp(this, {
        tapp_id, cml_id,
      }, async ()=>{
        
        await this.refresh();
      });
    },
    openTo(row){
      helper.showTAppLink(this, row.id);
    },
    OpenToPolkadotForStaking(){
      helper.openUrl(`https://polkadot.js.org/apps/?rpc=${encodeURIComponent('wss://wallet.teaproject.org/wss1')}#/staking`);
      
    },
    
    async migrateMiner(){
      await helper.migrateMiner(this, this.cml, this.miner, async ()=>{
        this.$root.success();
        await this.refresh();
      });
    },
    async scheduleUp(){
      await helper.scheduleUpMiner(this, this.cml.id, async ()=>{
        this.$root.success();
        await this.refresh();
      });
    },
    async scheduleDown(){
      await helper.scheduleDownMiner(this, this.cml.id, async ()=>{
        this.$root.success();
        await this.refresh();
      });
    },
    
  }
}
</script>
