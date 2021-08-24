<template>
<div class="tea-page">

  <TeaTable
    :data="list || []"
    v-loading="table_loading"
    name="tapps_list_table"
  >
    <el-table-column
      prop="id"
      width="90"
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
      prop="token_symbol"
      label="Token ticker symbol"
    />

    <el-table-column
      prop="amount"
      label="My holding tokens"
      sortable
    />


    <el-table-column
      prop="sell_price"
      label="Token sell price"
    />

    <el-table-column
      label="Actions"
      width="150"
    >
      <template slot-scope="scope">
        <!-- <TeaIconButton tip="View details" icon="el-icon-view" @click="showDetails(scope)" /> -->
        <TeaIconButton tip="Buy" icon="buy" @click="buyHandler(scope)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sellHandler(scope)" />
        <!-- <TeaIconButton :tip="'Visit '+scope.row.link" icon="link" @click="openTo(scope.row.link)" /> -->
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
          sell_price: utils.layer1.balanceToAmount(arr[4]),
          detail: utils.rpcArrayToString(arr[5]),
          link: utils.rpcArrayToString(arr[6]),
        };

        return item;
      });

      helper.tableLoading(this, false);
    },
    openTo(url){
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

  }

  
}
</script>