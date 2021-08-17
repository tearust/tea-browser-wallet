<template>
<div class="tea-page">
  <h4>
    Leader board
  </h4>
  <el-button @click="changeShowType()" type="primary" size="small" style="margin:5px 0 10px;">
    {{show_for_coffee ? 'All assets are in COFFEE, change to TEA?' : 'All assets are in TEA, change to COFFEE?'}}
  </el-button>
  <el-button size="small" style="top: 50px;" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <TeaTable
    name="leader_board_table"
    :data="list || []"
  >
    <el-table-column
      prop="index"
      label="Rank"
      width="60"
    >
    </el-table-column>

    <el-table-column
      prop="address"
      label="Account"
      width="200"
    >
      <template slot-scope="scope">
        <el-tooltip effect="light" :content="scope.row.address" placement="right">
        <el-button
          @click="
            $root.goPath('/user_details/'+scope.row.address)"
          type="text">
          {{scope.row.address}}
        </el-button>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column
      prop="cml_asset"
      label="Projected 7 day mining income"
      width="180"
    />
    <el-table-column
      prop="tea_asset"
      label="TEA account balance"
      width="140"
    />
    <el-table-column
      prop="usd_asset"
      label="COFFEE account balance"
      width="150"
    />
    <el-table-column
      prop="miner_credit"
      label="Staking debt"
    />
    <el-table-column
      prop="loan_credit"
      label="Genesis loan"
    />
    <el-table-column
      prop="total"
      width="150"
      label="Total account value"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.total>=0">{{scope.row.total}}</span>
        <span v-if="scope.row.total<0" style="color:#f00;">({{scope.row.total}})</span>
      </template>
    </el-table-column>
      

  </TeaTable>
</div>
</template>
<script>
import request from '../request';
import TeaTable from '../components/TeaTable';
import {_} from 'tearust_utils';
import utils from '../tea/utils';

export default {
  components: {
    TeaTable,
  },
  data(){
    return {
      list: null,

      show_for_coffee: false,
    };
  },
  async mounted(){
    await this.refreshList();
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);
      const tmp = await request.layer1_rpc('cml_userAssetList', []);

      const rtmp = await request.layer1_rpc('cml_currentExchangeRate', []);
      const usdToTea = utils.layer1.balanceToAmount(rtmp[1]);

      if(this.show_for_coffee){
        this.list = await Promise.all(_.map(tmp, async (arr, i)=>{
          for(let j=1; j<7; j++){
            arr[j] = _.toNumber(arr[j]);
          }
          const total = arr[1]+arr[2]+arr[3]-arr[4]-arr[5];
          const rs = {
            index: i+1,
            address: arr[0],
            cml_asset: utils.layer1.balanceToAmount(arr[1]),
            tea_asset: utils.layer1.balanceToAmount(arr[2]),
            usd_asset: utils.layer1.balanceToAmount(arr[3]),
            miner_credit: utils.layer1.balanceToAmount(arr[4]),
            loan_credit: utils.layer1.balanceToAmount(arr[5]),
            total: utils.layer1.balanceToAmount(total),
          };
          return rs;
        }));
      }
      else{
        this.list = await Promise.all(_.map(tmp, async (arr, i)=>{
          arr[1] = utils.layer1.balanceToAmount(arr[1])*usdToTea;
          arr[2] = utils.layer1.balanceToAmount(arr[2])*usdToTea;
          arr[3] = utils.layer1.balanceToAmount(arr[3])*usdToTea;
          arr[4] = utils.layer1.balanceToAmount(arr[4])*usdToTea;
          arr[5] = utils.layer1.balanceToAmount(arr[5])*usdToTea;
          arr[6] = utils.layer1.balanceToAmount(arr[6])*usdToTea;

          for(let j=1; j<7; j++){
            arr[j] = _.toNumber(arr[j]);
          }
          const total = arr[1]+arr[2]+arr[3]-arr[4]-arr[5];
          const rs = {
            index: i+1,
            address: arr[0],
            cml_asset: utils.layer1.roundAmount(arr[1]),
            tea_asset: utils.layer1.roundAmount(arr[2]),
            usd_asset: utils.layer1.roundAmount(arr[3]),
            miner_credit: utils.layer1.roundAmount(arr[4]),
            loan_credit: utils.layer1.roundAmount(arr[5]),
            total: utils.layer1.roundAmount(total),
          };
          return rs;
        }));
      }
      
      this.$root.loading(false);
    },

    async changeShowType(){
      this.show_for_coffee = !this.show_for_coffee;
      await this.refreshList();
      
    }
  }
}
</script>
<style lang="scss" scoped>

</style>