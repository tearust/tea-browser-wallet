<template>
<el-table-column
  v-bind="{...$props, ...$attrs}" 
  v-on="$listeners"
  :render-header="renderHeader"
>

</el-table-column>

</template>
<script>
export default {
  props: {
    tip: {
      type: String,
      default: '',
    },
  },
  data(){
    return {
      ext_props: {},
    };
  },
  mounted(){
    
  },
  methods: {
    renderHeader(h, {column}){
      return column.label;
      // if(!this.tip){
      //   return column.label;
      // }

      // return [
      //   column.label,
      //   h(
      //     'el-tooltip',
      //     {
      //       props: {
      //         content: this.tip,
      //         placement: 'top',
      //         effect: 'light',
      //       }
      //     },
      //     [
      //       h('span', {
      //         class: {
      //           'iconfont icon-questionmark': true
      //         },
      //         style: {
      //           'margin-left': '5px',
      //           'position': 'relative',
      //           'top': '1px',
      //           'font-size': '11px',
      //         }
      //       })
      //     ]
      //   )
      // ];
    }
  },
}
</script>