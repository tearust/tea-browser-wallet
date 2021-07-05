<template>
<div class="tea-page">
  <el-tabs v-if="cml_type" tab-position="left" @tab-click="clickTab($event)" style="position:absolute;">
    <el-tab-pane v-for="(type, key) of cml_type" :key="key" :label="'CLASS - '+type" :ct="type" :lazy="true">
    </el-tab-pane>
    
  </el-tabs>

  <div class="tea-page" style="margin-left: 130px;">
    <h4>Genesis Camllia seeds in pool</h4>
    <p>You can find all remaining genesis camellia seeds here. You can lucky draw the seeds using your coupons</p>  

  <el-table 
    :data="cml_list || []"
    stripe
    size="small"
    border
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
      label="Deforst schedule"
      sortable
    />

    <el-table-column
      prop="generate_defrost_time"
      label="Deforst block"
      sortable
    />


    <el-table-column
      prop="status"
      label="Status"
    />

  </el-table>

  </div>
  
</div>
</template>

<script>
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import Base from '../workflow/Base';
export default {

  data(){
    return {
      cml_type: null,
      type: null,
      cml_list: null,
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

      this.$root.loading(false);

    }
  }
  
}
</script>