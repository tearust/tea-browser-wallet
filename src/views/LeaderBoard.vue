<template>
<div class="tea-page">
  <h4>Leader board (All assets are in USD value)</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
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
      label="USD account balance"
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
    };
  },
  async mounted(){
    await this.refreshList();
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);
      const tmp = await request.layer1_rpc('cml_userAssetList', []);
      // console.log('cml_userAssetList', tmp);

      // const cml_list = await request.layer1_rpc('cml_currentMiningCmlList',  []);
      // let len = cml_list.length;
      // if(len < 1) len = 1;

      this.list = await Promise.all(_.map(tmp, async (arr, i)=>{
        // console.log(utils.layer1.balanceToAmount(arr[1]) +' / '+len+' = '+utils.layer1.balanceToAmount(arr[1]) / len);

        // for(let j=1; j<7; j++){
        //   arr[j] = _.toNumber(arr[j]);
        // }

        // let l1 = arr[1]/len;
        // let total = l1+arr[2]+arr[3]-arr[4]-arr[5];


        const rs = {
          index: i+1,
          address: arr[0],
          cml_asset: utils.layer1.balanceToAmount(arr[1]),
          tea_asset: utils.layer1.balanceToAmount(arr[2]),
          usd_asset: utils.layer1.balanceToAmount(arr[3]),
          miner_credit: utils.layer1.balanceToAmount(arr[4]),
          loan_credit: utils.layer1.balanceToAmount(arr[5]),
          total: utils.layer1.balanceToAmount(arr[6]),
        };
        return rs;
      }));
      this.$root.loading(false);
    }
  }
}
</script>
<style lang="scss" scoped>

</style>