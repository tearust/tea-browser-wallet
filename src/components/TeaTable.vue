<template>
<el-table 
  v-bind="{...$props, ...$attrs}" 
  v-on="$listeners" 
  size="small"
  :ref="name"
  stripe
  border
  @sort-change="sortChangeHandler"
  class="tea-table">
  <slot></slot>
</el-table>

</template>
<script>
import {_} from 'tearust_utils';
import utils from '../tea/utils';
export default {
  inheritAttrs: false,
  data(){
    return {};
  },
  props: {
    name: {
      type: String,
      required: true,
    }
  },
  mounted(){    
    const key = this.sort_key();
    const default_sort = utils.mem.get(key);
    const ref = this.$refs[this.name];
    if(default_sort && ref && ref.sort){
      ref.sort(default_sort.prop, default_sort.order);
    }
  },
  methods: {
    sort_key(){
      return this.name+'__sort';
    },
    sortChangeHandler({order, prop}){
      const key = this.sort_key();
      utils.mem.set(key, {
        order, prop
      });
    }
  }
}
</script>