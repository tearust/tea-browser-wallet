<template>
<div class="tea-page">
  <el-tabs v-if="cml_type" tab-position="left" @tab-click="clickTab($event)" style="position:absolute;">
    <el-tab-pane v-for="(type, key) of cml_type" :key="key" :label="'CLASS - '+type" :ct="type" :lazy="true">
    </el-tab-pane>
    
  </el-tabs>

  <div class="tea-page" style="margin-left: 130px;">
    <h4>Genesis Camellia seeds in pool</h4>
    <p>The followings are all remaining genesis Camellia seeds. You can draw a seed using your coupon.</p>  

  <TeaTable 
    :data="list || []"
    name="luck_draw_seed_pool_table"
  >
    <el-table-column
      prop="id"
      label="CML ID"
      sortable
    />

    <el-table-column
      prop="lifespan"
      label="Life span"
      sortable
    />
    
    <el-table-column
      prop="performance"
      label="Performance"
      sortable
    />

    <el-table-column
      prop="defrost_schedule"
      label="Defrost schedule"
      sortable
    />

    <el-table-column
      prop="generate_defrost_time"
      label="Defrost block"
      sortable
    />


    <el-table-column
      prop="status"
      label="Status"
    />


  </TeaTable>
  
  <el-pagination
    hide-on-single-page
    background
    style="text-align: right; margin: 10px -10px 40px;"
    :current-page.sync="P.current"
    @current-change="changePage($event)"
    @prev-click="changePage($event)"
    @next-click="changePage($event)"
    :page-size.sync="P.size"
    layout="prev, pager, next"
    :total="P.total" />

  </div>
  
</div>
</template>

<script>
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import TeaTable from '../components/TeaTable';
export default {
  components: {TeaTable},
  data(){
    return {
      cml_type: null,
      type: null,
      cml_list: null,
      list: null,

      P: {
        current: 1,
        size: 20,
        total: 0,
      },
    };
  },
  async mounted(){
    this.cml_type = utils.consts.CmlType;

    this.wf = new Base();
    await this.wf.init();
    this.type = 'A';

    await this.refreshList();
  },
  methods: {
    async clickTab(e){
      const ct = e.$attrs.ct
      this.type = ct;
      this.P.current = 1;
      await this.refreshList();
    },
    async refreshList(){
      this.$root.loading(true);
      const ct = this.type;

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let list = await api.query.cml.luckyDrawBox(ct, utils.consts.DefrostScheduleType.Investor);
      list = list.toJSON();
      let list1 = await api.query.cml.luckyDrawBox(ct, utils.consts.DefrostScheduleType.Team);
      list1 = list1.toJSON();

      const cml_list = await this.wf.getCmlByList(_.concat(list, list1));
      this.cml_list = cml_list;
      this.P.total = this.cml_list.length;

      this.list = _.slice(this.cml_list, (this.P.current-1)*this.P.size, this.P.current*this.P.size);

      this.$root.loading(false);

    },
    changePage(val){
      this.P.current = val;
      const from = (this.P.current-1)*this.P.size;
      const to = this.P.current*this.P.size;
      this.list = _.slice(this.cml_list, from, to);
    }
  }
  
}
</script>