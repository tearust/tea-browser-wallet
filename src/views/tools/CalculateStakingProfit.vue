<template>
<div class="tea-page">
  <h4>抵押入仓收益计算器</h4>


  <p>假设每个Block获得收益 100 TEA</p>
  <el-form :model="form" ref="form" >
    <el-form-item label="仓位数量">
      <el-input-number v-model="form.staking_amount" :min="1" :max="999"></el-input-number>

      <el-button style="float:right;" type="primary" @click="calculate">CALCULATE</el-button>
    </el-form-item>
    
  </el-form>

  <h3>计算结果</h3>
  <el-table 
    :data="table"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="index"
      label="仓位"
    />
    <el-table-column
      prop="persent"
      label="收益率"
    />
    <el-table-column
      prop="profit"
      label="收益"
    />
    
  </el-table>

</div>
</template>
<script>
import {_} from 'tearust_utils';
export default {
  data(){
    return {
      form: {
        staking_amount: null,
      },
      table: null,
    };
  },
  methods: {
    calculate(){
      const n = this.form.staking_amount;

      // const arr = [];
      // let total = 0;
      // for(let i=0; i<n; i++){
      //   const index = i+1;
      //   const weight = Math.sqrt(i+1) - Math.sqrt(i);
      //   total += weight;
      //   arr.push({
      //     index,
      //     weight,
      //   });
      // }

      const total = Math.sqrt(n);
      const list = _.map(_.range(n), (i)=>{
        const index = i+1;
        const weight = Math.sqrt(i+1) - Math.sqrt(i);
        const persent = weight / total;
        const profit = 100 * persent;
        return {
          index,
          persent: Math.round(100*persent * 10000) / 10000 + '%',
          profit,
        }
      });

      this.table = list;
    }
  }
}
</script>