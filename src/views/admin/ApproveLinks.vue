<template>
<div class="tea-page">
  <h4>Approve links</h4>

  <span>TODO: add rpc to get approve links</span>
  <TeaTable
    name="sudo_approve_link_table"
    :data="list"
  >
    <TeaTableColumn
      prop="link"
      label="Link"
    />
    <TeaTableColumn
      prop="desc"
      label="Link description"
    />

  </TeaTable>

  <div class="tea-legend" style="
    margin-top: 20px;
    position: relative;
  ">
    <el-button style="width:400px;position:absolute;top:0; right:0;" type="primary" @click="addLink()">Add approve link</el-button>
  </div>

</div>
</template>
<script>
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import {stringToHex, u8aToString} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import TeaTable from '../../components/TeaTable';
import TeaTableColumn from '../../components/TeaTableColumn';
import tapp from '../../tapp';

export default {
  components: {
    TeaTable,
    TeaTableColumn,
  },
  data(){
    return {
      list: [],
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.wf = new Base();
    await this.wf.init();


    await this.refreshList();
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);


      this.$root.loading(false);
    },
    async addLink(){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit('modal/open', {
        key: 'common_form',
        param: {
          title: 'Add approve link',
          props: {
            template: {
              label: 'Type',
              type: 'select',
              required: true,
              options: _.map(tapp.template.list(), (v)=>{
                return {
                  label: tapp.template.getLabel(v),
                  value: v,
                }
              }),
            },
            YouTube: {
              label: 'Youtube Id',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'YouTube'
              }
            },
            Reddit: {
              label: 'Reddit Id',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'Reddit'
              }
            },
            Twitter: {
              label: 'Twitter Id',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'Twitter'
              }
            },

            description: {
              type: 'Input',
              required: true,
            }
          }
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          try{

            let link_param = form[form.template];
            const link = tapp.template.genLink(form.template, link_param);
            console.log(111, link);

            const tx = api.tx.bondingCurve.registerTappLink(stringToHex(link), stringToHex(form.desc));

            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshList();

            close();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    }
  }
}
</script>