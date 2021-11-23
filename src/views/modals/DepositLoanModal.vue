<template>
  <el-dialog
    title="Deposit CML for loan"
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >
    <p class="c-info"
    >
      Are you sure you want to deposit CML as collateral for a Genesis loan? <br/>
      For more info on how to use these loans, <a class="t-wiki" href="https://github.com/tearust/teaproject/wiki/Genesis-TEA-Loans" target="_blank">visit our wiki</a>.
    </p>

    <el-form v-if="param" :model="form" label-width="120px">
      <el-form-item label="CML Id" style="margin-bottom: 0">
        <el-input v-model="param.cml_id" :disabled="true"></el-input>
      </el-form-item>

      <el-form-item label="Agree">
        <el-checkbox v-model="form.agree" label=""></el-checkbox>
        <el-button @click="toggleAgreement()" type="text" style="margin-left: 10px;"
          >TEA Token Loan Agreement
          <i
            style="position: relative; top: 1px"
            :class="show_agreement ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
          ></i
        ></el-button>

        <!-- <span style="margin-left: 20px; color: #9c9c9c"
          >Click confirm means you argee.</span
        > -->
      </el-form-item>
    </el-form>

    <div class="x-argeement" v-if="show_agreement">
      <h5>TEA Token Loan Agreement</h5>
      <p>
        Deposit CML to use as collateral for a TEA token loan.<br />
        The current loan amount depends on the type of seed used for collateral: 3000T for B seeds, and 1500T for C seeds.<br />
        Each billing cycle is 1000 blocks long (approximately 100 minutes).<br />
        The interest rate for every billing cycle is {{loan_rate}}.<br />
        The loan term is 200,000 blocks, approximately 55 hours.<br />
        
      </p>
      <p>
        <b>Loan Repayment</b><br />
        The borrower needs to repay the loan before the 200,000 block-term ends.
        If the full borrowed amount is not repaid by the end of the loan term,
        the loan is considered to be in default and the CML collateral will be
        liquidated. There's also the option to only pay the interest due.<br/>
        Paying the outstanding interest due will renew the loan for another term.
      </p>
      <p>
        The borrower can repay the loan at any time. If repaid before the end of
        the loan term, the adjusted loan term is equal to blockheight when
        repaid - blockheight at loan start. The adjusted loan term/billing cycle
        calculates the number of times the interest rate is applied. This number
        is always rounded up. The total interest on the loan is calculated as
        rounded number of billing cycles * interest rate * loan amount. The
        interest rate is {{loan_rate}}, and the loan amount from the Genesis loan is
        3000T for B seeds and 1500T for C seeds.
      </p>
      <p>
        <b>Return of Collateral</b><br />
        When the borrower has repaid the loaned amount + interest, their
        collateral CML seed will be returned to them. Both the primary loan
        amount and interest in TEA token that's been repaid will be burned.
      </p>
    </div>
    <!-- <div style="text-align:right;" v-if="show_agreement">Click confirm means you argee.</div> -->

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="close()">Cancel</el-button>
      <el-button size="small" type="primary" @click="confrim()"
        >Confirm</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import store from "../../store/index";
import utils from "../../tea/utils";
import Base from '../../workflow/Base';
export default {
  data() {
    return {
      form: {
        agree: false,
      },
      show_agreement: false,
      loan_rate: '',
    };
  },
  computed: {
    ...mapState("modal", {
      visible: (state) => store.state.modal.deposit_loan.visible,
      param: (state) => store.state.modal.deposit_loan.param,
    }),
  },

  methods: {
    close() {
      this.form.agree = false;
      this.show_agreement = false;
      this.$store.commit("modal/close", "deposit_loan");
    },
    toggleAgreement() {
      this.show_agreement = !this.show_agreement;
    },
    async confrim() {
      if(!this.form.agree){
        this.$root.showError('You must click Agree before going to the next step.');

        return;
      }
      const cb = utils.mem.get("deposit_loan");
      if (cb) {
        const form = {
          id: this.param.cml_id,
          asset_type: "CML",
        };
        await cb(form, () => {
          this.close();
        });
      }
    },
    async openHandler(){
      this.wf = new Base();
      await this.wf.init();
      const layer1_instance = this.wf.getLayer1Instance();

      const api = layer1_instance.getApi();
      const loan_rate = (await api.query.genesisBank.interestRate()).toJSON();
      // const pl = api.consts.genesisBank.loanTermDuration.toJSON();
      this.loan_rate = (loan_rate/100)+'%';
    }
  },
};
</script>
<style lang="scss" scoped>
.tea-modal {
  .x-argeement {
    border-top: 1px solid #d9d9d9;
    border-bottom: 1px solid #d9d9d9;

    margin: 20px 0 2px 120px;
    padding: 24px 0 24px;

    h5 {
      font-size: 16px;
      margin: 0;
    }
    p {
      margin: 10px 0;
      word-break: break-word;
    }
  }
}
</style>
