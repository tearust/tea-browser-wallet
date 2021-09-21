<template>
<div class="tea-page">

  <span>
    My total investment value in TEA : <b style="color: #35a696;">{{total_investment_tea}}</b>
  </span>
  <TeaTable
    :data="list || []"
    v-loading="table_loading"
    name="tapps_list_table"
  >
    <el-table-column
      prop="id"
      width="70"
      label="ID"
      sortable
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="name"
      label="TApp Name"
      width="120"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="openTo(scope.row)">{{scope.row.name}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="owner"
      label="Owner"
      width="100"
    >
      <template slot-scope="scope">
        <el-tooltip effect="light" :content="scope.row.owner" placement="right">
        <el-button
          @click="
            $root.goPath('/user_details/'+scope.row.owner)"
          type="text">
          {{scope.row.owner}}
        </el-button>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column
      prop="token_symbol"
      label="Ticker"
      width="90"
    />

    <el-table-column
      prop="amount"
      label="My token holdings"
      width="150"
      sortable
    />
    <el-table-column
      prop="total_supply"
      label="Total supply"
    />


    <el-table-column
      prop="sell_price"
      label="Sell price (TEA)"
      width="130"
      sortable
    />

    <el-table-column
      prop="market_value"
      label="Market value (TEA)"
      width="140"
      sortable
    />

    <!-- <el-table-column
      prop="host_performance"
      label="Host performance requirement"
      width="120"
    />
    <el-table-column
      prop="host_n"
      label="Current/Max hosts"
    /> -->

    <el-table-column
      label="Actions"
      width="120"
    >
      <template slot-scope="scope">
        <!-- <TeaIconButton tip="View details" icon="el-icon-view" @click="showDetails(scope)" /> -->
        <TeaIconButton tip="Buy" icon="buy" @click="buyHandler(scope)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sellHandler(scope)" />

        <TeaIconButton tip="Host/Unhost" icon="host" @click="hostHandler(scope)" />
      </template>
    </el-table-column>


  </TeaTable>

</div>
</template>
<script>
import SettingAccount from '../../workflow/SettingAccount';
import {_} from 'tearust_utils';
// import {helper} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import TeaTable from '../../components/TeaTable';
import TeaIconButton from '../../components/TeaIconButton';
import request from '../../request';
import helper from '../helper';

export default {
  components: {
    TeaTable,
    TeaIconButton,
  },
  data(){
    return {
      list: null,

      table_loading: false,

      total_investment_tea: 0,
    }
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  

  async mounted(){
    this.wf = new SettingAccount();
    await this.wf.init();

    await this.refreshList();

    utils.register('refresh-current-account__my_app', async (key, param)=>{
      await this.refreshList();   
    });
  },

  methods: {
    async refreshList(){
      helper.tableLoading(this, true);

      const list = await request.layer1_rpc('bonding_listUserAssets', [
        this.layer1_account.address
      ]);
// console.log(11, list);

      let sum = 0;
      this.list = _.map(list, (arr)=>{
        const item = {
          id: _.toNumber(arr[1]),
          name: utils.rpcArrayToString(arr[0]),
          token_symbol: utils.rpcArrayToString(arr[2]),

          amount: utils.layer1.balanceToAmount(arr[3]),
          sell_price: utils.layer1.balanceToAmount(arr[4]),
          owner: arr[5],
          detail: utils.rpcArrayToString(arr[6]),
          link: utils.rpcArrayToString(arr[7]),

          host_performance: arr[8],
          host_current: arr[9],
          host_n: `${arr[9]}/${arr[10]}`,
          is_full: arr[9] >= arr[10],
          total_supply: utils.layer1.balanceToAmount(arr[11]), 
        };

        item.market_value = utils.layer1.roundAmount(item.amount*item.sell_price);
        sum += item.market_value;

        return item;
      });

      this.total_investment_tea = sum;

      helper.tableLoading(this, false);
    },
    openTo(row){
      helper.openToTApp(this, row);
    },
    async showDetails(scope){
      helper.showTAppDetails(this, scope.row.id);
    },
    async buyHandler(scope){
      await helper.tapps_buyToken(this, scope.row, async ()=>{
        this.refreshList();
        utils.publish('refresh-current-account__account', {});
      });
    },
    async sellHandler(scope){
      await helper.tapps_sellToken(this, scope.row, async ()=>{
        this.refreshList();
        utils.publish('refresh-current-account__account', {});
      });
    },

    async hostHandler(scope){
      await helper.openHostTappModal(this, scope.row, async ()=>{
        await this.refreshList();
      });
    }

  }

  
}
</script>