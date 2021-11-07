<template>
<div class="tea-page">
  <h4>Approved links</h4>

  <TeaTable
    name="sudo_approve_link_table"
    :data="list"
  >
    <TeaTableColumn
      prop="tapp_id"
      label="TApp Id"
    />
    <TeaTableColumn
      prop="creator"
      label="Creator"
    />

    <TeaTableColumn
      prop="type"
      label="Type"
    />
    <TeaTableColumn
      prop="tid"
      label="Tapp social param"
    />
    <TeaTableColumn
      prop="desc"
      label="Link description"
    />

  </TeaTable>

  <div class="tea-legend" style="
    margin-top: 20px;
    position: relative;
    height: 80px;
  ">
    <el-button style="width:400px;position:absolute;top:0; right:0;" type="primary" @click="addLink()">Add approved link</el-button>
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
import request from '../../request';

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

      const xl = await request.layer1_rpc('cml_approvedLinks', []);

      
      this.list = await Promise.all(_.map(xl, async (arr)=>{
        const link = utils.rpcArrayToString(arr[0]);
        const tapp_id = arr[1];
        const desc = utils.rpcArrayToString(arr[2]);
        const creator = arr[3];

        let json = utils.parseJSON(link, {});
        return {
          tapp_id,
          desc,
          type: json.t || '',
          tid: json.v || '',
          creator,
        }
        
      }));
      // console.log(11, this.list);

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
              type: 'radio-group',
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
              label: 'Twitter tag',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'Twitter'
              }
            },
            bbs: {
              label: 'Party table name',
              type: 'Input',
              required: true,
              condition: {
                target: 'template',
                value: 'bbs'
              }
            },

            description: {
              type: 'Input',
              required: true,
            },

            creator: {
              type: 'Input',
              label: 'Creator address',
            }
          }
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          try{

            let link_param = form[form.template];
            const link = tapp.template.genLink(form.template, link_param);

            const tx = api.tx.bondingCurve.registerTappLink(stringToHex(link), stringToHex(form.description), form.creator);

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
