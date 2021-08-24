<template>
<div class="tea-page">
  <h4>TApps list</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <TeaTable
    :data="list || []"
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
      prop="total_supply"
      label="Token total supply"
      sortable
    />

    <el-table-column
      prop="buy_price"
      label="Token buy price"
      sortable
    />

    <el-table-column
      prop="sell_price"
      label="Token sell price"
      sortable
    />

    <el-table-column
      label="Market cap"
      prop="market_cap"
      sortable
    />


    <el-table-column
      label="Actions"
      width="150"
    >
      <template slot-scope="scope">
        <TeaIconButton tip="Buy" icon="buy" @click="buyHandler(scope)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sellHandler(scope)" />
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
import {stringToHex, u8aToString} from 'tearust_layer1';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString} from 'tearust_layer1';
import TeaTable from '../components/TeaTable';
import TeaIconButton from '../components/TeaIconButton';
import request from '../request';
import helper from './helper';

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
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
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

      const list = await request.layer1_rpc('bounding_listTApps', []);
      console.log(11, list);

      this.list = _.map(list, (arr)=>{
        const item = {
          id: _.toNumber(arr[1]),
          name: utils.rpcArrayToString(arr[0]),
          token_symbol: utils.rpcArrayToString(arr[2]),

          total_supply: utils.layer1.balanceToAmount(arr[3]),
          buy_price: utils.layer1.balanceToAmount(arr[4]),
          sell_price: utils.layer1.balanceToAmount(arr[5]),
     
          detail: utils.rpcArrayToString(arr[6]),
          link: utils.rpcArrayToString(arr[7]),
        };
        item.market_cap = item.sell_price * item.total_supply;

        return item;
      });

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
      await helper.tapps_buyToken(this, scope.row, async ()=>{
        this.refreshList();
      });
    },
    async sellHandler(scope){
      await helper.tapps_sellToken(this, scope.row, async ()=>{
        this.refreshList();
      });
    },
    async createNewTApp(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const curve_option = [];
      _.each(utils.consts.CurveType, (val, key)=>{
        const tmp = {
          key,
          label: key,
          value: val
        };
        curve_option.push(tmp);
      });

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Create new TApp',
          pallet: 'boundingCurve',
          tx: 'createNewTapp',
          text: '',
          props: {
            tapp_name: {
              type: 'Input',
              label: 'Name',
            },
            ticker: {
              type: 'Input',
              label: 'TApp symbol',
              tip: '3-5 uppercase character.',
            },
            init_fund: {
              type: 'number',
              default: 1,
              max: 10000000,
            },
            detail: {
              label: 'Details',
              type: 'Input',
            },
            link: {
              label: 'Link',
              type: 'Input',
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            // console.log(111, form);

            const name = stringToHex(form.tapp_name);
            const fund = utils.toBN(utils.layer1.amountToBalance(form.init_fund));
            const ticker = stringToHex(_.toUpper(form.ticker));

            const tx = api.tx.boundingCurve.createNewTapp(name, ticker, fund, stringToHex(form.detail), stringToHex(form.link));
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshList();

            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    }
  }
};

</script>
<style lang="scss">

</style>