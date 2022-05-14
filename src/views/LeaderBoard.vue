<template>
<div class="tea-page">
  <h4>
    Leader board
  </h4>
  <!-- <el-button @click="changeShowType()" type="primary" size="small" style="margin:5px 0 10px;">
    {{show_for_coffee ? 'All assets are in COFFEE, change to TEA?' : 'All assets are in TEA, change to COFFEE?'}}
  </el-button> -->
  <span style="">
    Current reward rate:
    <b style="color:#35a696;">987892.2248 TEA /6 Mainnet CML coupon = 164648.7041 T/C Remaining: 6</b>.
    <a href="https://docs.google.com/forms/d/1NzNKRNTaNgif2-zYgVC1IOdo4PPoM9Z619LDpji5d4U/viewform?edit_requested=true" style="margin-left: 10px;" target="_blank">Reward application</a>.
    <a href="https://github.com/tearust/teaproject/wiki/Epoch-9" target="_blank">Rules</a>.
  </span>
  <el-button type="primary" size="small" style="position:absolute; top:0; right: 50px;" @click="registerHandler()">Register for competition</el-button>
  <el-button size="small" style="top: 0px;" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <TeaTable
    name="leader_board_table"
    :data="list || []"
  >
    <el-table-column
      prop="$index"
      label="Rank"
      width="60"
    >
      <template slot-scope="scope">
        {{scope.$index+1}}
      </template>
    </el-table-column>

    <el-table-column
      prop="address"
      label="Account"
      width="220"
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
      prop="coupon_amount"
      width="120"
      label="Mainnet coupon"
    />

    <!-- <el-table-column
      prop="cml_asset"
      label="Projected 7 day mining income"
      width="120"
    /> -->
    <el-table-column
      prop="tea_asset"
      label="TEA account balance"
      width="180"
    />
    <el-table-column
      prop="usd_asset"
      label="COFFEE account balance"
      width="110"
    />
    <el-table-column
      prop="token_asset"
      label="TApp token balance"
      width="180"
    />
    <el-table-column
      prop="loan_credit"
      label="Genesis loan"
    />
    <!-- <el-table-column
      prop="usd_debt"
      label="COFFEE debt"
    /> -->

    <el-table-column
      prop="total"
      width="180"
      label="Total account value"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.total>=0">{{scope.row.total}}</span>
        <span v-if="scope.row.total<0" style="color:#f00;">({{scope.row.total}})</span>
      </template>
    </el-table-column>
    

    <!-- <el-table-column
      prop="reward"
      label="Prize share"
    >
      <template slot-scope="scope">
        <span style="color: #35a696;font-weight:bold;" :inner-html.prop="scope.row.reward>0?`<i class='iconfont icon-dollar'></i>${scope.row.reward}`:'0'"></span>
      </template>
    </el-table-column> -->
      

  </TeaTable>

  

</div>
</template>
<script>
import request from '../request';
import TeaTable from '../components/TeaTable';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import {stringToHex} from 'tearust_layer1';
import { mapGetters, mapState } from 'vuex';

export default {
  components: {
    TeaTable,
  },
  data(){
    return {
      list: null,
      reward_rate: '31251.5690',

      show_for_coffee: false,
    };
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
      let tmp = await request.layer1_rpc('cml_userAssetList', []);

      tmp = _.filter(tmp, (arr)=>{
        return arr[0] !== utils.consts.SUDO_ACCOUNT;
      });

      const rtmp = await request.layer1_rpc('cml_currentExchangeRate', []);
      const usdToTea = 1; //utils.layer1.balanceToAmount(rtmp[1]);

      let x_list = null;
      const sum_arr = [];
      let sum = 0;
      let tea_total = 0;
      if(this.show_for_coffee){
        x_list = await Promise.all(_.map(tmp, async (arr, i)=>{
          for(let j=1; j<7; j++){
            arr[j] = _.toNumber(arr[j]);
          }
          arr[1] = 0;
          const total = arr[1]+arr[2]+arr[3]+arr[4]-arr[5]-arr[6];
          const rs = {
            index: i+1,
            address: arr[0],
            cml_asset: utils.layer1.balanceToAmount(arr[1]),
            tea_asset: utils.layer1.balanceToAmount(arr[2]),
            usd_asset: utils.layer1.balanceToAmount(arr[3]),
            token_asset: utils.layer1.balanceToAmount(arr[4]),

            loan_credit: utils.layer1.balanceToAmount(arr[5]),
            usd_debt: utils.layer1.balanceToAmount(arr[6]),
            total: utils.layer1.balanceToAmount(total),
          };

          if(rs.total > 0 && _.size(sum_arr)<20){
            sum += rs.total;
            sum_arr.push(rs.index);
          }
          
          return rs;
        }));
      }
      else{
        x_list = await Promise.all(_.map(tmp, async (arr, i)=>{
          arr[1] = utils.layer1.balanceToAmount(arr[1])*usdToTea;
          arr[2] = utils.layer1.balanceToAmount(arr[2])*usdToTea;
          arr[3] = utils.layer1.balanceToAmount(arr[3])*usdToTea;
          arr[4] = utils.layer1.balanceToAmount(arr[4])*usdToTea;
          arr[5] = utils.layer1.balanceToAmount(arr[5])*usdToTea;
          arr[6] = utils.layer1.balanceToAmount(arr[6])*usdToTea;

          for(let j=1; j<7; j++){
            arr[j] = _.toNumber(arr[j]);
          }
          arr[1] = 0;
          // arr[3] = 0;
          arr[6] = 0;
          // const total = arr[1]+arr[2]+arr[3]+arr[4]-arr[5]-arr[6];
          const total = arr[1]+arr[2]+arr[4]-arr[5]-arr[6];
          
          const rs = {
            index: i+1,
            address: arr[0],
            cml_asset: utils.layer1.roundAmount(arr[1]),
            tea_asset: utils.layer1.roundAmount(arr[2]),
            usd_asset: utils.layer1.roundAmount(arr[3]),
            token_asset: utils.layer1.roundAmount(arr[4]),
            loan_credit: utils.layer1.roundAmount(arr[5]),
            usd_debt: utils.layer1.roundAmount(arr[6]),
            total: utils.layer1.roundAmount(total),

            coupon_amount: _.toNumber(arr[8])/1000000000000,
          };

          if(rs.total > 0){
            sum += rs.total;
            sum_arr.push(rs.index);
          }
          tea_total += rs.tea_asset;

          return rs;
        }));
      }

      // this.reward_rate = utils.layer1.roundAmount(sum/3);

      this.list = _.reverse(_.sortBy(_.map(x_list, (item)=>{
         
        if(_.includes(sum_arr, item.index)){
          item.reward = utils.layer1.roundAmount(utils.consts.TOTAL_REWARD*(item.total / sum));
        }
        else{
          item.reward = 0;
        }
       
        return item;
      }), 'total'));

      this.$root.loading(false);
    },

    async changeShowType(){
      this.show_for_coffee = !this.show_for_coffee;
      await this.refreshList();
      
    },
    async registerHandler(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Register for competition',
          pallet: 'genesisExchange',
          tx: 'registerForCompetition',
          text: '',
          props: {
            user: {
              label: 'Polkadot{.js} address',
              type: 'Input',
              disabled: true,
              default: this.layer1_account.address,
            },
            erc20_address: {
              class: 'hidden',
              default: 'NA',
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            const account = form.user;
            const erc20_address = form.erc20Address;
            const email_address = form.email_address;

            const tx = api.tx.genesisExchange.registerForCompetition(
              account, erc20_address, email_address
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
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
