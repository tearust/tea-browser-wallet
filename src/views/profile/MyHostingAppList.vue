<template>
<div class="tea-page">

  <TeaTable
    :data="list || []"
    v-loading="table_loading"
    name="my_hosting_tapps_list_table"
  >
    
    <el-table-column
      prop="tapp_id"
      width="90"
      sortable
      label="TApp ID"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.tapp_id}}</el-button>
      </template>
    </el-table-column>
      
    <el-table-column
      label="TApp Name"
      width="100"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="openTo(scope.row)">{{scope.row.tapp_name}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      label="Ticker"
      width="80"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.tapp_ticker}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="host_performance"
      label="Host performance requirement"
    />

    <el-table-column
      prop="cml_id"
      width="100"
      sortable
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
      prop="total_income"
      label="Total fixed hosting fee income in TEA"
      width="120"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.total_income"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Total hosting token income in TEA"
      width="120"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.total_token_income"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Actions"
      width="180">
      <template slot-scope="scope">

        <TeaIconButton 
          style="position:relative;top:1px;" 
          tip="Hosting this TApp now. Unhost?" 
          icon="upload" 
          icon_style="font-size:20px;" 
          @click="unhostApp(scope)" 
        />
        
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

        await Promise.all(_.map(tapps, async (arr)=>{
          const x_item = {
            cml_id: arr[0],
            remaining: item.remaining_performance, //arr[1],
            tapp_id: arr[2],
            tapp_name: utils.rpcArrayToString(arr[4]),
            tapp_ticker: utils.rpcArrayToString(arr[3]),
            tapp_detail: utils.rpcArrayToString(arr[5]),
            tapp_link: utils.rpcArrayToString(arr[6]),
            host_performance: arr[7],
          };

          x_item.total_income = '---';
          x_item.total_token_income = '---';
          x_list.push(x_item);

      
          ((index)=>{
            _.delay(()=>{
              helper.getHostingReward(this.layer1_account.address, x_item.cml_id, x_item.tapp_id).then(async (tmp)=>{
                
                const value = tmp ? tmp.total : 0;
                const token_total = tmp.fixTokenTotal || 0;
                console.log('from indexer', index, value, token_total);

                if(value || token_total){
                  const tapp_detail_list = await helper.getTAppDetailsListByTAppIdList([x_item.tapp_id]);
                  // const sell_price = tapp_detail_list[x_item.tapp_id].sell_price;
                  const sell_price = 1;

                  this.list[index].total_income = utils.layer1.formatBalance(value, true);
                  this.list[index].total_token_income = utils.layer1.formatBalance(token_total*sell_price, true);
                }
                else{
                  this.list[index].total_income = 0;
                  this.list[index].total_token_income = 0;
                }
                
              });
            }, 500+index*100);
            
          })(x_list.length - 1);
          
          return null;
        }));

        return null;
      }));

      // console.log(111, x_list);
      this.list = x_list;

      // await utils.sleep(3000);
      helper.tableLoading(this, false);
    },
    openTo(row){
      helper.showTAppLink(this, row.tapp_id);
    },
    async showDetails(scope){
      helper.showTAppDetails(this, scope.row.tapp_id);
    },

    async unhostApp(scope){
      const tapp_id = scope.row.tapp_id;
      const cml_id = scope.row.cml_id;

      helper.unhostTApp(this, {
        tapp_id, cml_id,
      }, async ()=>{
        
        await this.refreshList();
      });
    }
    

  }

  
}
</script>
