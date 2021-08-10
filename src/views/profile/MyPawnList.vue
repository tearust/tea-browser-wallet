<template>
<div class="tea-page">

  <TeaTable 
    v-if="list"
    :data="list"
    name="profile_cml_list_table"
  >
    <el-table-column
      prop="id"
      sortable
      label="CML ID"
    >
      <template slot-scope="scope">
        <el-button type="text" @click="$router.push('/cml_details/'+scope.row.id)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>
    <el-table-column
      prop="cml_type"
      label="Type"
      sortable
      width="70"
    />

    <el-table-column
      prop="liferemaining"
      label="Life remaining"
      width="120"
      sortable
    >
      <template slot-scope="scope">
        {{scope.row.life_day}}
      </template>
    </el-table-column>

    

    <el-table-column
      prop="performance"
      label="Performance"
      sortable
      width="110"
    />

    <el-table-column
      prop="defrost_schedule"
      label="Defrost schedule"
      sortable
      width="130"
    />

    <el-table-column
      prop="generate_defrost_time"
      label="Defrost day"
      sortable
      width="110"
    >
      <template slot-scope="scope">
        {{scope.row.defrost_day}}
      </template>
    </el-table-column>

    <el-table-column
      prop="status"
      label="Status"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        {{scope.row.status | str}}
      </template>
    </el-table-column>


    <el-table-column
      label="Actions"
    >
      <template slot-scope="scope">
        
        <TeaIconButton
          v-if="
            scope.row.status!=='Staking'
            && scope.row.staking_slot.length<1"
          @click="paybackToGB(scope)"
          tip="Pay off"
          icon="pay-back"
        />
      </template>
    </el-table-column>
  </TeaTable>


</div>
</template>
<script>
import SettingAccount from '../../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import utils from '../../tea/utils';
import request from '../../request';
import { mapGetters, mapState } from 'vuex';
import {hexToString, stringToHex, hexToU8a, compactAddLength, u8aToHex} from 'tearust_layer1';
import TeaTable from '../../components/TeaTable';
import TeaIconButton from '../../components/TeaIconButton';
export default {
  components: {
    TeaTable,
    TeaIconButton,
  },
  data(){
    return {
      list: null,
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account',
    ]),
    ...mapState([
      'chain',
    ]),
  },
  
  async mounted(){
    
    this.wf = new SettingAccount();
    await this.wf.init();

    await this.refreshList();
  },

  methods: {
    async refreshList(){
      const list = this.layer1_account && this.layer1_account.pawn_cml_list;
      if(!list || list.length < 1) return;

      this.list = await Promise.all(_.map(list, async (arr)=>{
        const item = await this.wf.getCmlByList([arr[0]]);
        item.due = arr[1];
        return item;
      }));

      console.log(111, this.list);

    },
    async paybackToGB(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let block = this.chain.current_block.toJSON();
      block += 2;

      const cml_id = scope.row.id;

      let asset_id = api.registry.createType('u64', cml_id);
      asset_id = u8aToHex(asset_id.toU8a());

      const redeem_amount = await request.layer1_rpc('cml_calculateLoanAmount', [cml_id, block]);

      const info = `You need to pay ${redeem_amount/(1000000*1000000)}TEA to get your CML back.`;
      const x = await this.$confirm(info, "Pay off loan").catch(()=>{});
      if(!x) return;

      this.$root.loading(true);
      try{
        const tx = api.tx.genesisBank.payoffLoan(asset_id, 'CML');
        await layer1_instance.sendTx(this.layer1_account.address, tx);
        this.$root.success();
        utils.publish('refresh-current-account__account', {
          tab: 'my_cml',
        });
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      

    }
    

    
  }

  
}
</script>