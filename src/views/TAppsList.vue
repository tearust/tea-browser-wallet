<template>
<div class="tea-page">
  <h4>TApps list</h4>

  <el-button v-if="layer1_account && layer1_account.address==='5Eo1WB2ieinHgcneq6yUgeJHromqWTzfjKnnhbn43Guq4gVP'" style="right: 50px;" size="small" class="tea-refresh-btn" type="primary" @click="$root.goPath('/admin/approve_links')">Approve links</el-button>

  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <TeaTable
    :data="list || []"
    name="tapps_list_table"
  >
    <el-table-column
      prop="id"
      width="60"
      label="ID"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="name"
      label="Name"
      width="80"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.status==='Pending'">{{scope.row.name}}</span>
        <el-button v-if="scope.row.status!=='Pending'" size="small" type="text" @click="showLink(scope)">{{scope.row.name}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="owner"
      label="Owner"
      width="80"
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
      width="90"
    />

    <TeaTableColumn
      prop="buy_price"
      label="Buy price (TEA)"
      tip="Price at which you can buy the token from the bonding curve"
      width="100"
    />

    <TeaTableColumn
      prop="sell_price"
      label="Sell price (TEA)"
      tip="Price at which you can sell the token into the bonding curve"
      width="100"
    />

    <TeaTableColumn
      label="Market cap"
      prop="market_cap"
      tip="The current sell price multiplied by the number of tokens outstanding"
      width="90"
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

    <TeaTableColumn
      prop="status"
      label="Status"
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
        Your TApp tokens in your wallet will expand or contract based on 
        <a href="https://github.com/tearust/teaproject/wiki/Epoch-3-TApps-List#tapp-tokens-in-wallet-expand-on-consume-contract-on-expense" target="_blank">consume and expense actions </a> 
        on the TApp's bonding curve.
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
import tapp from '../tapp';

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


    await this.refreshList();
  },

  methods: {
    async refreshList(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      // await utils.sleep(1000);

      const list = await request.layer1_rpc('bonding_listTApps', [false]);
console.log(111, list);
      this.list = await Promise.all(_.map(list, async (arr)=>{
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
          host_current: arr[10][0],
          host_n: `${arr[10][0]}/${arr[10][1]}`,
          is_full: arr[10][0] >= arr[10][1],

          active_block: arr[11],
        };
        item.market_cap = utils.layer1.roundAmount(item.sell_price * item.total_supply);

        item.ori = (await api.query.bondingCurve.tAppBondingCurve(item.id)).toJSON();
        item.status = item.ori.status;
        item.type = item.ori.tapp_type;

        return item;
      }));

      this.$root.loading(false);
    },
    showLink(scope){
      // helper.showTAppLink(this, scope.row.id);
      helper.openToTApp(this, scope.row);
    },
    showDetails(scope){
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

      // const default_init_fund_need_tea = await helper.calculateTEAByToken(1000);
      this.$store.commit('modal/open', {
        key: 'common_form', 
        param: {
          title: 'Create new TApp',
          // confirm_text: 'Next',
          text: '',
          label_width: 200,
          props: {
            tapp_name: {
              type: 'Input',
              label: 'Name',
              required: true,
              el_props: {
                'show-word-limit': true,
                maxlength: name_max_len,
              },
              rules: {
                max: name_max_len,
                message: `Name cannot be longer than ${name_max_len} characters.`,
              }
            },
            ticker: {
              type: 'Input',
              label: 'TApp symbol',
              required: true,
              el_props: {
                'show-word-limit': true,
                maxlength: ticker_max_len,
                minlength: ticker_min_len,
              },
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
              type: 'select_number',
              el_props: {
                'allow-create': true,
                'filterable': true,
              },
              required: true,
              default: 1000,
              options: [
                {id: 10}, {id: 100}, {id: 1000}, {id: 2000}, {id: 5000}, {id: 10000}
              ],
              rules: {
                type: 'number',
                message: 'Initial token must be number.',
              },
              action: {
                button_text: 'Calculate',
                html: '<b>Please click calcalute</b>',
                handler: async (val)=>{
                  const v = await helper.calculateTEAByToken(val);
                  return `Required <b>${v}</b> TEA`;
                }
              }
            },
            detail: {
              label: 'Details',
              type: 'Input',
              required: true,
              el_props: {
                'show-word-limit': true,
                maxlength: detail_max_len,
              },
              rules: {
                max: detail_max_len,
                message: `Details symbol cannot be longer than ${detail_max_len} characters.`,
              }
            },

            template: {
              label: 'TApp template',
              type: 'radio-group',
              required: true,
              options: [
                ..._.map(tapp.template.list(), (v)=>{
                  return {
                    label: tapp.template.getLabel(v),
                    value: v,
                  }
                }),
                {
                  label: 'TEA Party',
                  value: 'tea_party',
                  disabled: true,
                },
                {
                  label: 'Create your own TApp',
                  value: 'own',
                  disabled: true,
                }
              ],
            },
            YouTube: {
              label: 'Youtube Id',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'YouTube'
              }
            },
            Reddit: {
              label: 'Reddit Id',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'Reddit'
              }
            },
            Twitter: {
              label: 'Twitter Id',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'Twitter'
              }
            },
            
            min_hosts: {
              label: 'Min hosts',
              type: 'number',
              default: 3,
              disabled: true,
            },

            max_allowed_hosts: {
              type: 'number',
              required: true,
              default: 10,
              min: 3,
            },


            fixed_token_mode: {
              label: 'Billing model',
              type: 'radio-group',
              required: true,
              default: 1,
              options: [
                {
                  label: 'Fixed TEA payment per 100 blocks',
                  value: 2,
                },
                {
                  label: 'Fixed TApp token and dividend payment per 100 blocks',
                  value: 1,
                }
              ]
            },

            reward_per_performance: {
              condition: {
                target: 'fixed_token_mode',
                value: 2
              },
              label: 'Reward per 1000 performance',
              type: 'select_number',
              el_props: {
                'allow-create': true,
                'filterable': true,
              },
              options: [
                {id:0.01}, {id: 0.02}, {id: 0.05}, 
                {id: 0.1}, {id: 0.5}, {id: 1}, {id: 5}, {id: 10}, {id: 100},
              ],
              default: 0.1,
              rules: {
                type: 'number',
                message: 'Reward per 1000 performance must be number.',
              },
            },
            stake_token_amount: {
              type: 'select_number',
              condition: {
                target: 'fixed_token_mode',
                value: 1
              },
              options: [
                {id: 10}, {id: 50}, {id: 100}, {id: 200}, {id: 500}, {id: 1000}, {id: 2000},
                {id: 5000}, {id: 10000},
              ],
              default: 100,
              rules: {
                type: 'number',
                message: 'Stake token amount must be number.',
              },
            },
            
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          
          const amount = utils.layer1.amountToBalance(form.init_fund)
          // let estimate = await request.layer1_rpc('bonding_estimateTeaRequiredToBuyGivenToken', [
          //   null, amount
          // ]);
          // estimate = utils.layer1.balanceToAmount(estimate);

          // try{
          //   await this.$confirm(`You will pay <b>${estimate} TEA</b> <br/> Are you sure?`, {
          //     dangerouslyUseHTMLString: true,
          //   });
          // }catch(e){
          //   this.$root.loading(false);
          //   return false;
          // }

          try{

            const name = stringToHex(form.tapp_name);
            const fund = utils.toBN(amount);
            const ticker = stringToHex(_.toUpper(form.ticker));

            let link_param = form[form.template];
            const link = tapp.template.genLink(form.template, link_param);
            console.log(111, link, form);

            const tx = api.tx.bondingCurve.createNewTapp(
              name, 
              ticker, 
              fund, 
              stringToHex(form.detail), 
              stringToHex(link), 
              form.max_allowed_hosts,
              form.template,
              form.fixed_token_mode===1,
              utils.layer1.amountToBalance(form.reward_per_performance),
              utils.layer1.amountToBalance(form.stake_token_amount),
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