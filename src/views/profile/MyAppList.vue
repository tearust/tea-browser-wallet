<template>
<div class="tea-page">

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
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="openTo(scope.row.link)">{{scope.row.name}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="owner"
      label="Owner"
      width="200"
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
      label="My holding tokens"
      sortable
    />


    <el-table-column
      prop="sell_price"
      label="Sell price (TEA)"
    />

    <el-table-column
      prop="host_performance"
      label="Host performance requirement"
      width="120"
    />
    <el-table-column
      prop="host_n"
      label="Current/Max hosts"
    />

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

      const list = await request.layer1_rpc('bounding_listUserAssets', [
        this.layer1_account.address
      ]);
console.log(11, list);
      this.list = _.map(list, (arr)=>{
        const item = {
          id: _.toNumber(arr[1]),
          name: utils.rpcArrayToString(arr[0]),
          token_symbol: utils.rpcArrayToString(arr[2]),

          amount: utils.layer1.balanceToAmount(arr[3]),
          sell_price: utils.layer1.toRealBalance(arr[4]),
          owner: arr[5],
          detail: utils.rpcArrayToString(arr[6]),
          link: utils.rpcArrayToString(arr[7]),

          host_performance: arr[8],
          host_n: `${arr[9]}/${arr[10]}`,
          is_full: arr[9] >= arr[10],
        };

        return item;
      });

      helper.tableLoading(this, false);
    },
    openTo(url){
      url = utils.urlToLink(url);
      window.open(url, '_blank');
    },
    async showDetails(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const data = _.clone(scope.row);
      
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: {
          ...data,
          title: 'TApp details',
        },
      });
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