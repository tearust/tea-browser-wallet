<template>
<el-tooltip :disabled="!tip" effect="dark" :content="tip" placement="top">
  <el-button 
    v-bind="{...$props, ...$attrs}" 
    v-on="$listeners" 
    size="small"
    :type="type"
    :disabled="false"
    :class="
      'tea-icon-button'+
      (disabled?' is-disabled':'')
    "
    style="width:auto;"
  >
    <span :class="'iconfont icon-'+icon"></span>
  </el-button>
</el-tooltip>

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
    icon: {
      type: String,
      required: true,
    },
    tip: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    disabled: {
      type: Boolean,
      default: false,
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