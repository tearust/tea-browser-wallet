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
        <el-button size="small" type="text" @click="openTo(scope.row)">{{scope.row.name}}</el-button>
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

    <TeaTableColumn
      prop="total_supply"
      label="Total supply"
      tip="Total number of tokens issued"
      width="100"
    />

    <TeaTableColumn
      prop="buy_price"
      label="Buy price (TEA)"
      tip="Price at which you can buy the token from the bonding curve"
      width="120"
    />

    <TeaTableColumn
      prop="sell_price"
      label="Sell price (TEA)"
      tip="Price at which you can sell the token into the bonding curve"
      width="120"
    />

    <TeaTableColumn
      label="Market cap"
      prop="market_cap"
      tip="The current sell price multiplied by the number of tokens outstanding"
      width="100"
    />
    <TeaTableColumn
      prop="host_performance"
      label="Host performance requirement"
      width="120"
      tip="A mining machine must be at least this powerful to host this TApp"
    />
    <TeaTableColumn
      prop="host_n"
      label="Current/Max hosts"
      width="90"
      tip="The maximum number of hosts that can be hosting this TApp"
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

  <div class="tea-legend" style="
    margin-top: 40px;
    position: relative;
  ">
    <ul style="width: 600px; margin-left: -20px;">
      <li>
        The 
        <a href="https://github.com/tearust/teaproject/wiki/Epoch-3-TApps-List#total-supply" target="_blank">total supply</a> 
        and 
        <a href="https://github.com/tearust/teaproject/wiki/Epoch-3-TApps-List#buy-price" target="_blank">token price </a> 
        are determined by 
        <a href="https://github.com/tearust/teaproject/wiki/Epoch-3-TApps-List#sell-price" target="_blank">the bonding curve.</a> 
      </li>
      <li>
        The 
        <a href="https://github.com/tearust/teaproject/wiki/Epoch-3-Mining#host-performance-requirement" target="_blank">host performance requirement </a> 
        is the minimum power required for a mining machine to host this TApp.
      </li>
      <li>
        <a href="https://github.com/tearust/teaproject/wiki/Epoch-3-Mining#current-and-max-hosts" target="_blank">Current / max hosts </a>
        is the maximum number of CML miners that can be hosting this TApp.
      </li>
      <li>
        In the actions section, you can buy or sell the TApp's token as well as
        <a href="https://github.com/tearust/teaproject/wiki/Epoch-3-Mining#host-and-unhost-tapp" target="_blank">host (or unhost) the TApp.</a> 
      </li>
    </ul>

    <el-button style="width:400px;position:absolute;top:0; right:0;" type="primary" @click="createNewTApp()">Create new TApp</el-button>
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
import TeaTableColumn from '../components/TeaTableColumn';
import TeaIconButton from '../components/TeaIconButton';
import request from '../request';
import helper from './helper';

export default {
  components: {
    TeaTable,
    TeaIconButton,
    TeaTableColumn,
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

    utils.register('refresh-current-account__my_app', async (key, param)=>{
      await this.refreshList();   
    });

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
          host_current: arr[10],
          host_n: `${arr[10]}/${arr[11]}`,
          is_full: arr[10] >= arr[11],
        };
        item.market_cap = utils.layer1.roundAmount(item.sell_price * item.total_supply);

        return item;
      });

      this.$root.loading(false);
    },
    openTo(row){
      helper.openToTApp(this, row);
    },
    async showDetails(scope){
      helper.showTAppDetails(this, scope.row.id);
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

      const name_max_len = api.consts.bondingCurve.tAppNameMaxLength.toJSON();
      const ticker_min_len = api.consts.bondingCurve.tAppTickerMinLength.toJSON();
      const ticker_max_len = api.consts.bondingCurve.tAppTickerMaxLength.toJSON();
      const detail_max_len = api.consts.bondingCurve.tAppDetailMaxLength.toJSON();
      const link_max_len = api.consts.bondingCurve.tAppLinkMaxLength.toJSON();
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
              rules: {
                max: name_max_len,
                message: `Name cannot be longer than ${name_max_len} characters.`,
              }
            },
            ticker: {
              type: 'Input',
              label: 'TApp symbol',
              // tip: `${ticker_min_len}-${ticker_max_len} uppercase character.`,
              rules: [
                {
                  min: ticker_min_len,
                  message: `TApp symbol must be at least ${ticker_min_len} characters.`
                },
                {
                  max: ticker_max_len,
                  message: `TApp symbol cannot be longer than ${ticker_max_len} characters.`
                }
              ]
            },
            init_fund: {
              label: 'Initial token',
              type: 'number',
              default: 1,
            },
            detail: {
              label: 'Details',
              type: 'Input',
              rules: {
                max: detail_max_len,
                message: `Details symbol cannot be longer than ${detail_max_len} characters.`,
              }
            },
            link: {
              label: 'Link',
              type: 'Input',
              rules: {
                max: link_max_len,
                message: `Link symbol cannot be longer than ${link_max_len} characters.`,
              }
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
    },

  }
};

</script>
<style lang="scss">

</style>