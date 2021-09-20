<template>
<div class="tea-page">
  <h4>RA FaaS rewards (Total: {{my_total_reward}})</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshPage()"></el-button>

  <TeaTable
    :data="my_reward || []"
    name="reward_log_table"
    :pagination="true"
  >

    <el-table-column
      prop="name"
      label="Name"
    >
      <template slot-scope="">
        <!-- {{scope.row.name}} -->
        Remote attestation public service award
      </template>
    </el-table-column>


    <el-table-column
      label="CML ID"
    >
      <template slot-scope="scope">
        {{scope.row.cmlId}}
      </template>
    </el-table-column>

    <el-table-column
      label="Reward"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.price | teaIcon"></span>
      </template>
    </el-table-column>
    
    <el-table-column
      prop="atBlock"
      label="At block"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.atBlock}}
      </template>
    </el-table-column>
  </TeaTable>

  <el-divider />
  <h4>Hosting TApp rewards (Fix TEA mode : <b class="block">{{tapp_fix_tea_total}}</b> | Fix Token mode : <b class="block">{{tapp_fix_token_total}}</b>)</h4>
  <TeaTable
    :data="hosting_reward_list || []"
    name="hosting_tapp_reward_log_table"
    :pagination="true"
  >

    <el-table-column
      prop="name"
      label="Name"
    >
      <template slot-scope="">
        <!-- {{scope.row.name}} -->
        Hosting tapp reward
      </template>
    </el-table-column>

    <el-table-column
      label="TApp Id"
    >
      <template slot-scope="scope">
        {{scope.row.tappId}}
      </template>
    </el-table-column>

    <el-table-column
      label="CML ID"
    >
      <template slot-scope="scope">
        {{scope.row.cmlId}}
      </template>
    </el-table-column>

    <el-table-column
      label="Fix host fee reward"
      width="150"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.tapp_mode === 'fix_tea_mode'" :inner-html.prop="scope.row.amount | teaIcon">
        </span>
      </template>
    </el-table-column>

    <el-table-column
      label="Fix host token eward"
      width="150"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.tapp_mode === 'fix_token_mode'" :inner-html.prop="scope.row.amount_in_tea | teaIcon">
        </span>
      </template>
    </el-table-column>
    
    <el-table-column
      prop="atBlock"
      label="At block"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.atBlock}}
      </template>
    </el-table-column>
  </TeaTable>

  <el-divider />

  <h4>Operation Logs</h4>
  <TeaTable
    :data="my_log || []"
    name="operation_log_table"
    :pagination="true"
  >
    <el-table-column
      prop="type"
      label="Type"
      width="120"
    >
      <template slot-scope="scope">
        {{scope.row.type === 'tx' ? 'transaction': scope.row.type}}
      </template>
    </el-table-column>
    <el-table-column
      prop="name"
      label="Name"
    >
      <template slot-scope="scope">
        {{scope.row.name}}
      </template>
    </el-table-column>

    <el-table-column
      label="CML ID"
    >
      <template slot-scope="scope">
        {{scope.row.cmlId}}
      </template>
    </el-table-column>

    <el-table-column
      label="Auction ID"
    >
      <template slot-scope="scope">
        <el-button
          @click="showAuctionDetails(scope.row.auctionId)"
          type="text"
          size="small">
          {{scope.row.auctionId}}
        </el-button>
      </template>
    </el-table-column>

    <el-table-column
      label="TApp ID"
    >
      <template slot-scope="scope">
        {{scope.row.tappId}}
      </template>
    </el-table-column>

    <!-- <el-table-column
      label="Price"
    >
      <template slot-scope="scope">
        {{scope.row.price}}
      </template>
    </el-table-column> -->
    
    <el-table-column
      label="Amount"
    >
      <template slot-scope="scope">
        {{scope.row.amount}}
      </template>
    </el-table-column>

    <!-- <el-table-column
      label="Target user"
    >
      <template slot-scope="scope">
        {{scope.row.target}}
      </template>
    </el-table-column> -->

    <!-- <el-table-column
      prop="args"
      label="Arguments"
    >
      <template slot-scope="scope">
        {{scope.row.args}}
      </template>
    </el-table-column> -->
    <el-table-column
      prop="atBlock"
      label="At block"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.atBlock}}
      </template>
    </el-table-column>

    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">
        <el-link class="tea-action-icon" title="Bids" :underline="false" type="primary" icon="el-icon-view" @click="viewLogDetails(scope)"></el-link>
        
      </template>
    </el-table-column>
  </TeaTable>

  

</div>
</template>

<script>
import {_} from 'tearust_utils';
import utils from '../../tea/utils';
import { mapState, mapGetters } from 'vuex';
import store from '../../store/index';
import TeaTable from '../../components/TeaTable';
import request from '../../request';
import helper from '../helper';

export default {
  components: {
    TeaTable,
  },
  data(){
    return {
      hosting_reward_list: null,

      tapp_fix_tea_total: 0,
      tapp_fix_token_total: 0,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('clog', {
      my_log:state => store.state.clog.my_log,
      my_reward:state => store.state.clog.my_reward,
      my_total_reward:state => store.state.clog.my_total_reward,
    })
  },
  async mounted(){
    this.$root.loading(true);
    await this.refreshPage();
    this.$root.loading(false);
  },
  methods: {
    async refreshPage(){
      this.$root.loading(true);
      await this.$store.dispatch('clog/init_my_auction_log', {});
      await this.$store.dispatch('clog/fetch_my_reward_log', {});

      this.hosting_reward_list = await this.getHostingRewardList();

      const tt = await this.getHostingRewardTotal();
      console.log('tapp reward total ', tt);
      this.tapp_fix_tea_total = tt.fixTeaTotal;
      this.tapp_fix_token_total = tt.fixTokenTotal;

      this.$root.loading(false);
    },

    async getHostingRewardList(){
      const query = `
query {
  logs (
    first: 100
    orderBy: AT_BLOCK_DESC
    filter: {
      to: {in: ["${this.layer1_account.address}"]}
      name: {in: ["TAppExpense", "TAppConsumeRewardStatements"]}
    }
    
  ) {
    nodes {
      name
      type
      args
      atBlock
      from
      to
      auctionId
      cmlId
      price
      amount
      json
      tappId
    }
  }
}     
      `;

      const rs = await request.queryGraphQL(query);

      const tapp_list = {};
      _.map(rs.logs.nodes, (item)=>{
        const id = item.tappId;
        if(id && !tapp_list[id]){
          tapp_list[id] = 1;
        }
        return null;
      });

      const tapp_detail_list = await helper.getTAppDetailsListByTAppIdList(_.keys(tapp_list));
      return _.map(rs.logs.nodes, (item)=>{
        if(item.name === 'TAppExpense'){
          item.tapp_mode = 'fix_tea_mode';
        }
        else{
          item.tapp_mode = 'fix_token_mode';
          const sell_price = tapp_detail_list[item.tappId].sell_price;
          item.amount_in_tea = utils.layer1.roundAmount(_.toNumber(item.amount)*sell_price);
        }
        return item;
      });
    },

    async getHostingRewardTotal(){
      let total = 0;

      const query = `
query {
  hostingTappRewards (
    filter: {
      accountId: {equalTo: "${this.layer1_account.address}"}
   	
    }
  ) {
    nodes {
      id
      cmlId
      tappId
      accountId
      fixTokenTotal
      type
      fixTeaTotal
      fixTokenMinerTotal
      fixTokenInvestorTotal
    }
  }
}     
      `;

      const rs = {
        fixTeaTotal: 0,
        fixTokenTotal: 0,
        fixTokenMinerTotal: 0,
        fixTokenInvestorTotal: 0,
      };

      const graph_result = await request.queryGraphQL(query);

      const tapp_list = {};
      _.map(graph_result.hostingTappRewards.nodes, (item)=>{
        const id = item.tappId;
        if(id && !tapp_list[id]){
          tapp_list[id] = 1;
        }
        return null;
      });

      const tapp_detail_list = await helper.getTAppDetailsListByTAppIdList(_.keys(tapp_list));

      _.map(graph_result.hostingTappRewards.nodes, (item)=>{

        rs.fixTeaTotal += _.toNumber(item.fixTeaTotal);

        const sell_price = tapp_detail_list[item.tappId].sell_price;
        rs.fixTokenTotal += utils.layer1.balanceToAmount(item.fixTokenTotal)*sell_price;
        rs.fixTokenMinerTotal += utils.layer1.balanceToAmount(item.fixTokenMinerTotal)*sell_price;
        rs.fixTokenInvestorTotal += utils.layer1.balanceToAmount(item.fixTokenInvestorTotal)*sell_price;

        return null;
      });

      return {
        fixTeaTotal: utils.layer1.balanceToAmount(rs.fixTeaTotal),
        fixTokenTotal: utils.layer1.roundAmount(rs.fixTokenTotal),
        fixTokenMinerTotal: utils.layer1.roundAmount(rs.fixTokenMinerTotal),
        fixTokenInvestorTotal: utils.layer1.roundAmount(rs.fixTokenInvestorTotal),
      };
    },

    showAuctionDetails(auction_id){
      this.$store.commit('modal/open', {
        key: 'log_details', 
        param: {
          type: 'auction_id', 
          value: auction_id,
        },
      });
    },
    async viewLogDetails(scope){
      let param = {};

      if(scope.row.json && _.size(scope.row.json)>2){
        const json = JSON.parse(scope.row.json);
        param = json;
      }
      else{
        let arr = null;
        try{
          let str = scope.row.args.replace(/\{/g, '[').replace(/\}/g, ']');
          arr = JSON.parse(str);
        }catch(e){
          arr = [];
        }

        _.each(arr, (val, i)=>{
          _.set(param, i+1, val);
        });
      }

      
      param.title = 'Log details';
      this.$store.commit('modal/open', {
        key: 'data_details',
        param,
      });
      
    }
  }
  
}
</script>