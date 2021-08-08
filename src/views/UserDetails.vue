<template>
  <div class="tea-page">
    <h4>Account Details</h4>
    <div class="tea-card">
      <!-- <i class="x-icon iconfont icon-a-TeaProject-T"></i> -->
      <i class="x-icon ">
        <img src="/fav.png" />
      </i>
      
      <div class="x-list" style="width:100%;">
        
        <div class="x-item">
          <b>{{'Address' | cardTitle}}</b>
          <span>
            <font class="js_need_copy">{{address}}</font>
            <!-- <span title="copy" data-clipboard-target=".js_need_copy" style="margin-left: 5px;" class="iconfont tea-icon-btn icon-copy js_copy"></span> -->
            
          </span>

        </div>
        <div class="x-item">
          <b>{{'Total balance' | cardTitle}}</b>
          <span :inner-html.prop="info ? info.free : '' | teaIcon"></span>
        </div>
        <div class="x-item">
          <b>{{'Locked balance' | cardTitle}}</b>
          <span :inner-html.prop="info ? info.lock : '' | teaIcon"></span>
        </div>
        <div class="x-item">
          <b>{{'USD'}}</b>
          <span :inner-html.prop="info ? info.usd : ''"></span>
        </div>

      </div>

    </div>
    <el-divider />

    <h4>CML List</h4>
    <el-table 
      :data="cml_list || []"
      stripe
      class="tea-table"
      size="small"
      border
    >
      <el-table-column
        prop="id"
        sortable
        width="90"
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
        prop="lifespan"
        label="Life span"
      />
      <el-table-column
        prop="machine_id"
        label="Miner ID"
      > 
        <template slot-scope="scope">
          <el-button
            @click="showMinerInfo(scope.row.machine_id)"
            type="text"
            size="small">
            {{scope.row.machine_id}}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column
        prop="performance"
        label="Performance"
        sortable
        width="120"
      />

      <el-table-column
        prop="defrost_schedule"
        label="Defrost schedule"
        sortable
        width="150"
      />

      <el-table-column
        prop="defrost_day"
        label="Defrost day"
        sortable
        width="120"
      />

      <el-table-column
        prop="status"
        label="Status"
        width="120"
        sortable
      />

      <el-table-column
        label="Staking slot"
        width="120">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.staking_slot.length>0"
            @click="showStakingSlot(scope)"
            type="text"
            size="small">
            {{scope.row.staking_slot.length}}
          </el-button>
        </template>
      </el-table-column>

    </el-table>

  </div>
</template>
<script>
import { mapState } from 'vuex';
import store from '../store/index';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import {hexToString} from 'tearust_layer1';
export default {
  data(){
    return {
      address: '',
      info: null,
      cml_list: null,
    };
  },
  async beforeRouteUpdate(to, from, next){
    if(to.params.address && this.address && to.params.address !== this.address){
      this.address = to.params.address;
      this.$root.loading(true);
      await this.refresh();
      this.$root.loading(false);
    }

    next();
  },
  async mounted(){
    this.address = this.$route.params.address;

    this.$root.loading(true);
    this.wf = new Base();
    await this.wf.init();

    await this.refresh();
    this.$root.loading(false);
  },

  methods: {
    async refresh(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const all_balance = await this.wf.getAllBalance(this.address);
      this.info = all_balance;

      const cml_list = await this.wf.getCmlListByUser(this.address);
      const cml_data = await this.wf.getCmlByList(cml_list);

      this.cml_list = cml_data;
    },
    showStakingSlot(scope){
      // console.log(111, scope.row);
      this.$store.dispatch('modal/open', {
        key: 'staking_slot',
        param: {
          list: scope.row.staking_slot,
          cml_id: scope.row.id,
          staker_click: ()=>{
            alert(1)
          }
        }
      });
    },
    async showMinerInfo(miner_id){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let mm = await api.query.cml.minerItemStore(miner_id);
      mm = mm.toJSON();

      mm.id = hexToString(mm.id);
      mm.ip = hexToString(mm.ip);
      
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: {
          ...mm,
          title: 'Miner Details',
        },
      });
    },
  }
}
</script>