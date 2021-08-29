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
      width="70"
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
      prop="owner"
      label="Owner"
      width="100"
    >
      <template slot-scope="scope">
        <el-tooltip effect="light" :content="scope.row.owner" placement="right">
        <el-button
          @click="
            $root.goPath('/user_details/'+scope.row.owner)"
          type="text">
          {{scope.row.owner}}
        </el-button>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column
      prop="token_symbol"
      label="Ticker"
      width="70"
    />

    <el-table-column
      prop="total_supply"
      label="Total supply"
    />

    <el-table-column
      prop="buy_price"
      label="Buy price (TEA)"
    />

    <el-table-column
      prop="sell_price"
      label="Sell price (TEA)"
    />

    <el-table-column
      label="Market cap"
      prop="market_cap"
    />
    <el-table-column
      prop="host_performance"
      label="Host performance requirement"
      width="120"
    />
    <el-table-column
      prop="host_n"
      label="Current/Max hosts"
    />


    <el-table-column
      label="Actions"
      width="120"
    >
      <template slot-scope="scope">
        <TeaIconButton tip="Buy" icon="buy" @click="buyHandler(scope)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sellHandler(scope)" />

        <TeaIconButton tip="Host/Unhost" icon="host" @click="hostHandler(scope)" />
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

      const list = await request.layer1_rpc('bonding_listTApps', []);
      console.log(11, list);

      this.list = _.map(list, (arr)=>{
        const item = {
          id: _.toNumber(arr[1]),
          name: utils.rpcArrayToString(arr[0]),
          token_symbol: utils.rpcArrayToString(arr[2]),

          total_supply: utils.layer1.balanceToAmount(arr[3]),
          buy_price: utils.layer1.balanceToAmount(arr[4]),
          sell_price: utils.layer1.balanceToAmount(arr[5]),
          owner: arr[6],
          detail: utils.rpcArrayToString(arr[7]),
          link: utils.rpcArrayToString(arr[8]),

          host_performance: arr[9],
          host_n: `${arr[10]}/${arr[11]}`,
          is_full: arr[10] >= arr[11],
        };
        item.market_cap = utils.layer1.roundAmount(item.sell_price * item.total_supply);

        return item;
      });

      this.$root.loading(false);
    },
    openTo(url){
      url = utils.urlToLink(url);
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
          pallet: 'bondingCurve',
          confirm_text: 'Next',
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
              label: 'Initial token',
              type: 'number',
              default: 1,
            },
            detail: {
              label: 'Details',
              type: 'Input',
            },
            link: {
              label: 'Link',
              type: 'Input',
            },
            host_performance: {
              type: 'number',
              default: 500
            },
            max_allowed_hosts: {
              type: 'number',
              default: 10
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          
          const amount = utils.layer1.amountToBalance(form.init_fund)
          let estimate = await request.layer1_rpc('bonding_estimateTeaRequiredToBuyGivenToken', [
            null, amount
          ]);
          estimate = utils.layer1.balanceToAmount(estimate);

          try{
            await this.$confirm(`You will pay <b>${estimate} TEA</b> <br/> Are you sure?`, {
              dangerouslyUseHTMLString: true,
            });
          }catch(e){
            this.$root.loading(false);
            return false;
          }

          try{

            const name = stringToHex(form.tapp_name);
            const fund = utils.toBN(amount);
            const ticker = stringToHex(_.toUpper(form.ticker));

            const tx = api.tx.bondingCurve.createNewTapp(
              name, ticker, fund, stringToHex(form.detail), stringToHex(form.link), form.host_performance, form.max_allowed_hosts
            );

            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshList();

            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },

    async hostHandler(scope){
      await helper.openHostTappModal(this, scope.row, async ()=>{
        await this.refreshList();
      });
    }
  }
};

</script>
<style lang="scss">

</style>