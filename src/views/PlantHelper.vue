<template>
  <div class="tea-page">
    <h4>Plant my Camellia</h4>
    <p>
      Please fill out the form below to generate the shell mining commands. <br />
      Note that you need <b class="block">{{ form.miner_price }} COFFEE</b> to buy a mining machine.
      <br />
      The machine is not reusable if you decide to unplant your CML in the future. If you agree, {{ form.miner_price }} COFFEE will be burned from your account.
    </p>

    <el-form :model="form" label-width="180px" :rules="rules" ref="form">
      <el-form-item label="CML Id" prop="cml_id">
        <el-input v-model="form.cml_id"></el-input>
      </el-form-item>

      <el-form-item label="Miner Id" prop="miner_id">
        <el-input v-model="form.miner_id"></el-input>
      </el-form-item>

      <el-form-item label="Miner Ip" prop="miner_ip">
        <el-input v-model="form.miner_ip"></el-input>
      </el-form-item>

      <el-form-item label="Machine cost in COFFEE" prop="miner_price">
        <el-input :disabled="true" v-model="form.miner_price"></el-input>
      </el-form-item>

      <el-form-item label="Account" prop="account">
        <el-input v-model="form.account"></el-input>
      </el-form-item>
    </el-form>

    <div style="display: flex; justify-content: flex-end; margin-top: 40px">
      <!-- <el-button style="padding-left: 15px; padding-right: 15px;" 
      @click="testPlant()"
      plain
      type="primary">
      Plant for mining
    </el-button> -->

      <el-button
        style="padding-left: 15px; padding-right: 15px"
        @click="generateShell()"
        type="primary"
      >
        Generate scripts
      </el-button>
    </div>

    <div class="c-shell" v-if="shell">
      <p>run >./start_tea_node.sh</p>
    </div>
    <div
      v-if="shell"
      style="display: flex; justify-content: flex-end; margin-top: 10px"
    >
      <el-button
        style="padding-left: 15px; padding-right: 15px"
        @click="testPlant()"
        plain
        type="primary"
      >
        Plant
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
  data() {
    return {
      form: {
        cml_id: null,
        miner_id: null,
        miner_ip: null,
        miner_price: null,
        account: null,
      },
      rules: {
        cml_id: [{ required: true }],
        miner_id: [{ required: true }],
        miner_ip: [{ required: true }],
        account: [{ required: true }],
      },

      shell: false,
    };
  },
  computed: {
    ...mapGetters(["layer1_account"]),
  },
  async mounted() {
    this.form.cml_id = this.$route.params.cml_id;
    this.form.account = this.layer1_account.address;

    this.wf = new Base();
    await this.wf.init();

    this.$root.loading(true);

    const layer1_instance = this.wf.getLayer1Instance();
    const api = layer1_instance.getApi();

    let cml = await api.query.cml.cmlStore(this.form.cml_id);
    cml = cml.toJSON();

    const map = {
      A: "cmlAMiningMachineCost",
      B: "cmlBMiningMachineCost",
      C: "cmlCMiningMachineCost",
    };

    const price =
      api.consts.genesisExchange[map[cml.intrinsic.cml_type]].toJSON();
    this.form.miner_price = utils.layer1.formatBalance(price);

    this.$root.loading(false);
  },
  methods: {
    async generateShell() {
      const ref = this.$refs["form"];
      await ref.validate();
      this.shell = true;
    },
    async testPlant() {
      const ref = this.$refs["form"];
      await ref.validate();

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      try {
        // console.log(111, this.form);
        const form = this.form;
        const tx = api.tx.cml.startMining(
          form.cml_id,
          form.miner_id,
          form.miner_ip
        );
        await layer1_instance.sendTx(this.layer1_account.address, tx);

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
.c-shell {
  padding: 5px 15px;
  margin-top: 20px;
  height: 140px;
  background: #000;

  p {
    color: rgb(2, 250, 35);
    padding: 2px 0;
    margin: 0;
  }
}
</style>