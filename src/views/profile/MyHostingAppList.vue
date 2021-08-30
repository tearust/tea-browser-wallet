<template>
<div class="tea-page">

  <TeaTable
    :data="list || []"
    v-loading="table_loading"
    name="my_hosting_tapps_list_table"
  >
    <el-table-column
      prop="cml_id"
      width="80"
      label="CML ID"
    >
      <template slot-scope="scope">
        <el-button type="text" @click="$router.push('/cml_details/'+scope.row.cml_id)">{{scope.row.cml_id}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="remaining"
      label="Remaining performance"
    />
    <el-table-column
      prop="tapp_id"
      width="70"
      label="TApp ID"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.tapp_id}}</el-button>
      </template>
    </el-table-column>
      
    <el-table-column
      label="TApp Name"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="openTo(scope.row)">{{scope.row.tapp_name}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      label="Ticker"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.tapp_ticker}}</el-button>
      </template>
    </el-table-column>


  
    <el-table-column
      prop="host_performance"
      label="Host performance requirement"
    />


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

    utils.register('refresh-current-account__my_hosting', async (key, param)=>{
      await this.refreshList();   
    });
  },

  methods: {
    async refreshList(){
      
      helper.tableLoading(this, true);
      const cml_list = _.filter(this.layer1_account.cml, (item)=>{
        return item.status === 'Mining';
      });

      const x_list = [];
      await Promise.all(_.map(cml_list, async (item)=>{
        const tapps = await request.layer1_rpc('bonding_listCmlHostingTapps', [item.id]);

        _.map(tapps, (arr)=>{
          const x_item = {
            cml_id: arr[0],
            remaining: item.remaining_performance, //arr[1],
            tapp_id: arr[2],
            tapp_name: utils.rpcArrayToString(arr[4]),
            tapp_ticker: utils.rpcArrayToString(arr[3]),
            tapp_detail: utils.rpcArrayToString(arr[5]),
            host_performance: arr[6],
          };

          x_list.push(x_item);

          return null;
        });

        return null;
      }));

      console.log(111, x_list);
      this.list = x_list;

      // await utils.sleep(3000);
      helper.tableLoading(this, false);
    },
    openTo(row){
      let url = row.link;
      url = utils.urlToLink(url);
      url += '&id='+row.id;
      window.open(url, '_blank');
    },
    async showDetails(scope){

      const data = _.clone(scope.row);
      delete data.cml_id;
      delete data.remaining;
      
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: {
          ...data,
          title: 'TApp details',
        },
      });
    },
    

  }

  
}
</script>