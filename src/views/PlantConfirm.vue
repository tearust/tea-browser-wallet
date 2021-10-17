<template>
  <div class="tea-page">
    <h4>Activate miner for CML {{cml_id}}</h4>
    
    <p style="font-size:18px; color: #f00;" v-if="error">
      Can't activate miner, see reason below.<br/>
      {{error}}
    </p>

    <div
      v-if="!error"
      style="display: flex; justify-content: flex-start; margin-top: 10px"
    >
      <el-button
        style="padding-left: 15px; padding-right: 15px; width:250px;"
        @click="testPlant()"
        
        type="primary"
      >
        Activate miner
      </el-button>
    </div>
    
  </div>
</template>
<script>
import Base from "../workflow/Base";
import { _ } from "tearust_utils";
import utils from "../tea/utils";
import { mapGetters } from "vuex";

export default {
  components: {

  },
  data() {
    return {
      cml_id: null,
      orbit_id: null,

      error: null,
    };
  },
  computed: {
    ...mapGetters(["layer1_account"])
  },
  watch: {
    async layer1_account(){
      await this.checkCanActive();
    }
  },
  async mounted() {
    this.cml_id = utils.urlHashParam('cml');
    this.orbit_id = utils.urlHashParam('orbit');

    console.log('cml_id =>', this.cml_id);
    console.log('orbit_id =>', this.orbit_id);

    if(!this.cml_id || !this.orbit_id){
      this.fail('Invalid params.');
      return;
    }

    this.$root.loading(true);
    this.wf = new Base();
    await this.wf.init();


    await this.checkCanActive();

    this.$root.loading(false);

  },
  methods: {

    async checkCanActive(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let cml = await api.query.cml.cmlStore(this.cml_id);
      cml = cml.toJSON();

      if(cml.planted_at){
        this.fail('CML already active.');
        return;
      }

      if(cml.owner !== this.layer1_account.address){
        this.fail(`CML owner is invalid.`);
        return;
      }

      this.fail(null);
    },

    fail(str){
      if(str){
        this.error = str;
      }
      else{
        this.error = null;
      }
      this.$root.loading(false);
    },
    
    async testPlant() {
    
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const form = utils.cache.get('cml_plant_'+this.cml_id);

      if(!form){
        this.fail('Invalid cache for CML.');
        return;
      }

      this.$root.loading(true);
      try {
        // validate tea and coffee balance
        if(this.layer1_account.balance <= 1000){
          throw 'You need 1000 TEA for the first staking slot.';
        }
        if(this.layer1_account.usd <= form.miner_price){
          throw 'You need '+form.miner_price+' COFFEE to pay for this mining machine.';
        }

        const tx = api.tx.cml.startMining(
          form.cml_id,
          form.miner_id,
          form.miner_ip,
          this.orbit_id,
        );
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        utils.cache.remove('cml_plant_'+this.cml_id);

        this.$router.push("/login_account");
      } catch (e) {
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    
  },
};
</script>
<style lang="scss" scoped>

</style>
