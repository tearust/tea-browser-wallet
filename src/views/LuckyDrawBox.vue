<template>
<div class="tea-page">
  <el-tabs tab-position="left" @tab-click="clickTab($event)" style="position:absolute;">
    <el-tab-pane label="CLASS - A" ct="A" :lazy="true">
    </el-tab-pane>
    <el-tab-pane label="CLASS - B" ct="B" :lazy="true">
    </el-tab-pane>
    <el-tab-pane label="CLASS - C" ct="C" :lazy="true">
    </el-tab-pane>
    
  </el-tabs>

  <div class="tea-page" style="margin-left: 130px;">
    <h4>CML LIST</h4>

  <el-table 
    :data="cml_list || []"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="id"
      label="CML ID"
    />
    <el-table-column
      prop="group"
      label="Group"
    />
    <el-table-column
      prop="lifespan"
      label="Life Time"
    />
    
    <el-table-column
      prop="performance"
      label="Performance"
    />

    <el-table-column
      prop="defrost_schedule"
      label="Deforst Schedule"
    />

    <el-table-column
      prop="generate_defrost_time"
      label="Deforst Block"
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
      type: null,
      cml_list: null,
    };
  },
  async mounted(){
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

      let list = await api.query.cml.luckyDrawBox(ct);
      list = list.toJSON();

      const cml_list = await this.wf.getCmlByList(list);
      this.cml_list = cml_list;

      this.$root.loading(false);

    }
  }
  
}
</script>