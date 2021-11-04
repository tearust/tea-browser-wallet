<template>
<div class="tea-page">
  <h4>TApps list</h4>

  <el-button v-if="layer1_account && layer1_account.address==='5Eo1WB2ieinHgcneq6yUgeJHromqWTzfjKnnhbn43Guq4gVP'" style="right: 50px;" size="small" class="tea-refresh-btn" type="primary" @click="$root.goPath('/admin/approve_links')">Approve links</el-button>

  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <TeaTable
    :data="list || []"
    name="tapps_list_table"
    style="overflow-y:"
  >
    <el-table-column
      prop="id"
      width="60"
      label="ID"
      sortable
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
        <span v-if="!scope.row.active_block">{{scope.row.name}}</span>
        <el-button v-if="scope.row.active_block" size="small" type="text" @click="showLink(scope)">{{scope.row.name}}</el-button>
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

    <el-table-column
      prop="total_supply"
      label="Total supply"
      width="110"
      sortable
    />

    <el-table-column
      prop="buy_price"
      label="Buy price"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.buy_price | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      prop="sell_price"
      label="Sell price"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.sell_price | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      prop="market_cap"
      label="Market cap"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.market_cap | teaIcon"></span>
      </template>
    </el-table-column>


    <el-table-column
      label="Theta"
      prop="theta"
      width="80"
      sortable
    />
    <el-table-column
      prop="host_performance"
      label="Min perf"
      width="80"
    />

    <!-- <TeaTableColumn
      prop="host_current"
      label="Current hosts"
      width="60"
    /> -->
    <el-table-column
      label="Current/Min/Max hosts"
      width="120"
    >
      <template slot-scope="scope">
        {{scope.row.host_current}}/{{scope.row.host_n}}
      </template>
    </el-table-column>

    <TeaTableColumn
      prop="status"
      label="Status"
    />


    <el-table-column
      label="Actions"
      width="110"
      fixed="right"
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
        <a href="https://github.com/tearust/teaproject/wiki/TApps-List#total-supply" target="_blank">total supply</a> 
        and 
        <a href="https://github.com/tearust/teaproject/wiki/TApps-List#buy-price" target="_blank">token price </a> 
        are determined by 
        <a href="https://github.com/tearust/teaproject/wiki/TApps-List#sell-price" target="_blank">the bonding curve.</a> 
        Your TApp tokens in your wallet will expand or contract based on 
        <a href="https://github.com/tearust/teaproject/wiki/TApp-Token-Supply-and-Demand#tapp-tokens-in-wallet-expand-on-consume-contract-on-expense" target="_blank">consume and expense actions </a> 
        on the TApp's bonding curve.
      </li>
      <li>
        <a href="https://github.com/tearust/teaproject/wiki/Bonding-Curve-Theta" target="_blank">Theta</a> is the % of every TApp token buy or consume event that goes to the developer.
      </li>
      <li>
        The 
        <a href="https://github.com/tearust/teaproject/wiki/Mining#host-performance-requirement" target="_blank">host performance requirement </a> 
        is the minimum power required for a mining machine to host this TApp.
      </li>
      <li>
        <strong>Hosting rewards</strong> refers to how miners are incentivized to host a particular TApp: either a fixed <strong>T</strong> amount or a set amount of <a href="https://github.com/tearust/teaproject/wiki/Mining:-Staked-TApp-Tokens" target="_blank">staked hosting tokens</a> 
        paid out to miners hosting this TApp every 1000 blocks.
      </li>
      <li>
        <a href="https://github.com/tearust/teaproject/wiki/Mining#current-hosts" target="_blank">Current hosts </a>
        is the current number of miners hosting this TApp. <a href="https://github.com/tearust/teaproject/wiki/Mining#min-and-max-hosts" target="_blank">Min/Max hosts</a> refers to the minimum number of miners needed to host this TApp before it runs and the maximum number of CML miners that can host this TApp.
      </li>
      <li>
      <strong>Status</strong> refers to the current state of the TApp. Note that users can still perform <strong>buy / sell / host</strong> actions on the TApp even if the status is pending.
      </li>
      <li>
        In the actions section, you can buy or sell the TApp's token as well as
        <a href="https://github.com/tearust/teaproject/wiki/Mining:-Host-and-Unhost-TApps" target="_blank">host (or unhost) the TApp.</a> 
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
// console.log(111, list);
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
          host_n: `3/${arr[10][1]}`,
          is_full: arr[10][0] >= arr[10][1],

          active_block: arr[11],
        };
        item.market_cap = utils.layer1.roundAmount(item.sell_price * item.total_supply);

        item.ori = (await api.query.bondingCurve.tAppBondingCurve(item.id)).toJSON();
        if(_.has(item.ori.status, 'pending')){
          item.status = 'Pending';
        }
        else if(_.has(item.ori.status, 'active')){
          item.status = 'Active';
        }
        item.type = item.ori.tapp_type;
        item.theta = (item.ori.buy_curve_theta-item.ori.sell_curve_theta)+'%';

        return item;
      }));

      this.$root.loading(false);
    },
    showLink(scope){
      helper.showTAppLink(this, scope.row.id);
      // helper.openToTApp(this, scope.row);
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
          title: 'Create TEAfluencer TApp',
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
              },
              tip: 'Click to visit wiki.',
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#create-new-tapp---name');
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
              label: 'Initial tokens',
              type: 'select_number',
              el_props: {
                'allow-create': true,
                'filterable': true,
              },
              required: true,
              default: 10,
              options: [
                {id: 10}, {id: 100}, {id: 1000}, {id: 2000}, {id: 5000}, {id: 10000}
              ],
              rules: {
                type: 'number',
                message: 'Initial token must be number.',
              },
              action: {
                button_text: 'Calculate cost',
                html: '',
                handler: async (val)=>{
                  const v = await helper.calculateTEAByToken(val);
                  return `Required <b>${v}</b> TEA`;
                }
              },
              tip: 'Click to visit wiki.',
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#create-new-tapp---initial-tokens');
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

                // {
                //   label: 'Create your own TApp',
                //   value: 'own',
                //   disabled: true,
                // }
              ],
              action: {
                tip_html: (val, form)=>{
                  if(!val) return null;
                  const x = {'youtube': 2000, 'reddit':1500, 'twitter':1000, 'bbs': 2000,}[_.toLower(val)];
                  return `Requires a ${x} performance CML`;
                }
              },
              tip: 'Different TApp templates have different CML performance requirements. <br/>Click to visit wiki.',
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#minimum-hosting-performance-requirement');
              }
            },
            YouTube: {
              label: 'YouTube Id',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'YouTube'
              },
              el_props: {
                placeholder: 'e.g. Jg8tkBqA2ww',
              },
              tip: 'Click to visit wiki',
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#create-new-tapp---youtube-id')
              }
            },
            Reddit: {
              label: 'Reddit Id',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'Reddit'
              },
              el_props: {
                placeholder: 'e.g. pkqhir',
              }
            },
            Twitter: {
              label: 'Twitter tag',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'Twitter'
              },
              el_props: {
                placeholder: 'e.g. teaproject',
              }
            },
            bbs: {
              label: 'Channel name',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'bbs'
              },
              el_props: {
                placeholder: 'e.g. tea project',
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
              tip: 'Click to visit wiki',
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#create-new-tapp---max-allowed-hosts')
              }
            },


            fixed_token_mode: {
              label: 'Billing model',
              type: 'radio-group',
              required: true,
              default: 1,
              options: [
                {
                  label: 'Fixed TEA payment per 1000 blocks',
                  value: 2,
                },
                {
                  label: 'Fixed TApp token and dividend payments per 1000 blocks',
                  value: 1,
                }
              ],
              tip: 'Click to visit wiki',
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#create-new-tapp---billing-model')
              }
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
              label: 'Staked tokens per miner',
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
              tip: 'Click to visit wiki',
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#create-new-tapp---staked-token-amount')
              }
            },

            theta: {
              label: 'Theta',
              type: 'select_number',
              el_props: {
                'allow-create': true,
                'filterable': true,
              },
              required: true,
              default: 1,
              options: [
                {id: 1}, {id: 2}, {id: 3}, {id: 5}, {id: 10}, {id: 30}
              ],
              rules: {
                type: 'number',
                message: 'Theta must be number.',
              },
              after: '%',
              tip: 'Click to visit wiki',
              tip_action: ()=>{
                helper.openUrl('https://github.com/tearust/teaproject/wiki/Bonding-Curve-Theta#theta-as-tapp-creator')
              }
            }
            
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          
          const amount = utils.layer1.amountToBalance(form.init_fund)

          try{

            const name = stringToHex(form.tapp_name);
            const fund = utils.toBN(amount);
            const ticker = stringToHex(_.toUpper(form.ticker));

            let link_param = form[form.template];
            const link = tapp.template.genLink(form.template, link_param);

            const fix_token_mode = form.fixed_token_mode===1;

            const theta = 100 - _.toNumber(form.theta);
            if(theta < 70){
              throw 'Theta can\'t be more than 30';
            }
            const tx = api.tx.bondingCurve.createNewTapp(
              name, 
              ticker, 
              fund, 
              stringToHex(form.detail), 
              stringToHex(link), 
              form.max_allowed_hosts,
              form.template,
              fix_token_mode,
              fix_token_mode ? null : utils.layer1.amountToBalance(form.reward_per_performance),
              fix_token_mode ? utils.toBN(utils.layer1.amountToBalance(form.stake_token_amount)) : null,
              100,
              theta,
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
