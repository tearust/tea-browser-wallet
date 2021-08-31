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
      label="Current / Peak performance"
      width="160"
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
      prop="due"
      label="Due day"
      sortable
      width="110"
    >
    
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
          @click="paybackToGB(scope, true)"
          tip="Pay interest to extend"
          icon="pay-back"
        />
        <TeaIconButton
          v-if="
            scope.row.status!=='Staking'
            && scope.row.staking_slot.length<1"
          @click="paybackToGB(scope, false)"
          tip="Pay off loan"
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

    utils.register('refresh-current-account__my_pawn', async (key, param)=>{
      await this.refreshList();   
    });

    await this.refreshList();
  },

  methods: {
    async refreshList(){
      const list = this.layer1_account && this.layer1_account.pawn_cml_list;

      if(!list || list.length < 1) return;

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();
      const current_block = await this.wf.getCurrentBlock(api);
      this.list = await Promise.all(_.map(list, async (arr)=>{
        const tmp = await this.wf.getCmlByList([arr[0]]);
        const item = tmp[0];
        const block = arr[1] - current_block;
        item.due = await this.wf.blockToDay(block);
        return item;
      }));

    },
    async paybackToGB(scope, only_interest){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const cml_id = scope.row.id;
      

      let asset_id = api.registry.createType('u64', cml_id);
      asset_id = u8aToHex(asset_id.toU8a());

      let redeem_amount = await request.layer1_rpc('cml_calculateLoanAmount', [cml_id]);
      redeem_amount = only_interest ? redeem_amount[1] : redeem_amount[2];

      let an = utils.layer1.balanceToAmount(redeem_amount);
      let info = `You need to pay ${an} TEA to get your CML back.`;
      if(only_interest){
        info = `You need to pay ${an} TEA for the loan interest to extend the due day.`;
      }

      const title = only_interest ? 'Pay interest to extend' : 'Pay off loan';

      const x = await this.$confirm(info, title).catch(()=>{});
      if(!x) return;

      this.$root.loading(true);
      try{
        const tx = api.tx.genesisBank.payoffLoan(asset_id, 'CML', utils.toBN(redeem_amount));
        await layer1_instance.sendTx(this.layer1_account.address, tx);
        this.$root.success();

        if(only_interest){
          utils.publish('refresh-current-account__account', {
            tab: 'my_pawn',
          });
          await this.refreshList();
        }
        else{
          utils.publish('refresh-current-account__account', {
            tab: 'my_cml',
          });
        }
        
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      

    }
    

    
  }

  
}
</script>