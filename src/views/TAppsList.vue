<template>
<div class="tea-page">
  <h4>TApps list</h4>

  <TeaTable
    :data="list || []"
    name="tapps_list_table"
  >
    <el-table-column
      prop="id"
      width="90"
      label="ID"
    />

    <el-table-column
      prop="name"
      label="Name"
    />

    <el-table-column
      prop="token_symbol"
      label="Token"
    />

    <el-table-column
      prop="total_supply"
      label="Total supply"
    />

    <el-table-column
      prop="buy_price"
      label="Buy price"
    />

    <el-table-column
      prop="sell_price"
      label="Sell price"
    />

    <el-table-column
      label="Market cap"
    >
      <template slot-scope="scope">
        {{scope.row.sell_price * scope.row.total_supply}}
      </template>
    </el-table-column>


    <el-table-column
      label="Actions"
      width="150"
    >
      <template slot-scope="scope">
        <TeaIconButton tip="View details" icon="el-icon-view" @click="showDetails(scope)" />
        <TeaIconButton tip="Buy" icon="buy" @click="buyHandler(scope)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sellHandler(scope)" />
        <TeaIconButton :tip="'Visit TApp homepage'" icon="link" @click="openTo(scope.row.link)" />
      </template>
    </el-table-column>


  </TeaTable>
  
  <div style="display:flex; justify-content: flex-end;">
    <el-button style="width:40%;margin-top: 40px;" type="primary" @click="createNewTApp()">Create new TApp</el-button>
  </div>

</div>
</template>
<script>
import Base from '../workflow/Base';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString} from 'tearust_layer1';
import TeaTable from '../components/TeaTable';
import TeaIconButton from '../components/TeaIconButton';
import request from '../request';


const DATA = [
  {
    id: '001',
    name: 'First App',
    token_symbol: 'FTA',
    total_supply: 10000000,
    buy_price: 100,
    sell_price: 110,
    detail: 'This is the first tapp',
    link: 'https://teaproject.org',
  }
];

export default {
  components: {
    TeaTable,
    TeaIconButton,
  },
  data(){
    return {
      list: null,
    }
  },
  async mounted(){
    this.wf = new Base();
    await this.wf.init();

    await this.refreshList();
  },

  methods: {
    async refreshList(){
      this.$root.loading(true);
      await utils.sleep(1000);

      this.list = DATA;

      this.$root.loading(false);
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
      this.$alert('TODO');
    },
    async sellHandler(scope){
      this.$alert('TODO');
    },
    async createNewTApp(){
      
    }
  }
};

</script>
<style lang="scss">

</style>