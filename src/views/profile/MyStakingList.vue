<template>
<div class="tea-page">

  <el-table 
    v-if="list"
    :data="list"
    stripe
    size="small"
    border
  >
    <el-table-column
      prop="id"
      width="90"
      label="CML ID"
    >
      <template slot-scope="scope">
        <el-button
          @click="showCmlDetails(scope)"
          type="text"
          size="small">
          {{scope.row.id}}
        </el-button>
      </template>
    </el-table-column>
    <el-table-column
      label="Total slots"
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

    <el-table-column
      prop="index"
      width="100"
      label="My slot index"
    />
    <el-table-column
      label="Staking with"
      width="150"
    >
      <template slot-scope="scope">
        {{scope.row.staking_slot[scope.row.index].category | upper}}
        <el-button type="text" @click="$root.goPath('/cml_details/'+scope.row.staking_slot[scope.row.index].cml)" v-if="scope.row.staking_slot[scope.row.index].cml">
          ({{scope.row.staking_slot[scope.row.index].cml}})
        </el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="weight"
      label="Weight"
      width="120"
    >
      <template slot-scope="scope">
        {{scope.row.weight || 'TODO'}}
      </template>
    </el-table-column>

    <el-table-column
      label="Actions"

    >
      <template slot-scope="scope">
        <el-tooltip v-if="scope.row.index<1" :content="'UnstakingButtonDisabledReason' | str">
          <el-link class="tea-action-icon" 
            :underline="false" 
            type="primary" 
            icon="el-icon-delete" 
            @click="removeStaking(scope)"
            :disabled="true"
          ></el-link>
        </el-tooltip>
        <el-link v-if="scope.row.index>0" class="tea-action-icon" 
          :underline="false" 
          type="primary" 
          icon="el-icon-delete" 
          @click="removeStaking(scope)"
        ></el-link>
        
      </template>
    </el-table-column>



  </el-table>

  <div style="display:flex; justify-content: flex-end;">
    <el-button style="width:40%;margin-top: 40px;" type="primary" @click="openInvolveStakingModal()">Invest to staking</el-button>
  </div>

</div>
</template>
<script>
import SettingAccount from '../../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {helper} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import request from '../../request';
export default {
  data(){
    return {
      list: null,
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  
  async mounted(){
    this.wf = new SettingAccount();
    await this.wf.init();

    await this.refreshList();
    utils.register('my_staking', async ()=>{
      await this.refreshList();
    });

    utils.register('refresh-current-account__my_staking', async (key, param)=>{
      await this.refreshList();   
    });
  },

  methods: {
    async openInvolveStakingModal(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_tx', 
        param: {
          title: 'Staking invest',
          pallet: 'cml',
          tx: 'startStaking',
          text: 'If no staking cml, means use 1000 TEA to staking.',
          props: {
            staking_cml: {
              type: 'select',
              options: _.filter(this.layer1_account.cml, (item)=>{
                return item.generate_defrost_time < 1 && item.staking_slot.length<1 && item.status !== 'Staking';
              }),
            },
            acceptable_slot_index: {
              type: 'number',
              min: 0,
              default: 0

            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            let index = form.acceptable_slot_index;
            if(index < 1){
              const [cml_item] = await this.wf.getCmlByList([form.staking_to]);
              
              index = cml_item.staking_slot.length;
            }

            const tx = api.tx.cml.startStaking(form.staking_to, form.staking_cml||null, index);
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshList();

            utils.publish('refresh-current-account__account', {
              tab: 'my_staking',
            });
            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },

    async refreshList(){
      const list = await request.layer1_rpc('cml_userStakingList', [
        this.layer1_account.address
      ]);

      const cml_list = await Promise.all(_.map(list, async (val)=>{
        const cml_id = val[0];
        const index = val[1];

        const [cml] = await this.wf.getCmlByList([cml_id]);

        return {
          ...cml,
          index,
        }
      }));

      this.list = cml_list;
    },

    showStakingSlot(scope){
      this.$store.commit('modal/open', {
        key: 'staking_slot',
        param: {
          list: scope.row.staking_slot,
          cml_id: scope.row.id,
        }
      });
    },

    async showCmlDetails(scope){
      this.$router.push('/cml_details/'+scope.row.id);
    },
    
    async removeStaking(scope){
      const x = await this.$confirm("Are you sure to remove staking?", "Remove Staking").catch(()=>{});
      if(!x) return;

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();
      this.$root.loading(true);
      try{
        const tx = api.tx.cml.stopStaking(scope.row.id, scope.row.index);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        utils.publish('refresh-current-account__account', {tab: 'my_staking'});
        utils.publish('refresh-current-account__my_staking');
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);

    }
    
  }

  
}
</script>