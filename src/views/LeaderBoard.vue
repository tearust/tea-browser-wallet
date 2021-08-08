<template>
<div class="tea-page">
  <h4>Leader board</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <TeaTable
    name="leader_board_table"
    :data="list || []"
  >
    <el-table-column
      prop="index"
      label="Index"
      width="120"
    >
    </el-table-column>

    <el-table-column
      prop="address"
      label="Account"
    >
      <template slot-scope="scope">
        <el-button
          :title="scope.row.address"
          @click="
            $root.goPath('/user_details/'+scope.row.address)"
          type="text">
          {{scope.row.address}}
        </el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="amount"
      label="Asset (USD)"
    >
      
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

      this.list = await Promise.all(_.map(tmp, async (arr, i)=>{
        const rs = {
          index: i+1,
          address: arr[0],
          amount: utils.layer1.balanceToAmount(arr[1]),
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