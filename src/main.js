import Vue from 'vue'
import App from './App.vue'

import './elementui-style/index.css';
import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
import { Loading } from 'element-ui';
import locale from 'element-ui/lib/locale/lang/en';

import router from './router';
import './style.scss';

import store from './store';
import utils from './tea/utils';
import { _ } from 'tearust_utils';

import layer1_error_tips from './assets/error';
import strings from './assets/string';

Vue.use(ElementUI, { locale });
Vue.config.productionTip = false;



router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.needLogin) {
    const { layer1_account } = store.getters;
    if (!layer1_account) {
      next({ path: '/login_account' })
    }
  }

  next();
})

Vue.filter('formatBalance', (value) => {
  if (!value) return '';
  return utils.layer1.formatBalance(value);
});

Vue.filter('addTea', (value) => {
  return `${value} TEA`;
});
Vue.filter('teaIcon', (value=0) => {
  const symbol = '<span style="margin-right: 0;" class="iconfont icon-a-TeaProject-T"></span>'
  return symbol + (_.isNull(value)?'0':value);
});
Vue.filter('balance', (value) => {
  if(_.isNull(value) || _.isUndefined(value)) return '';
  value = parseInt(value, 10) / (1000000*1000000);
  value = Math.floor(value*10000)/10000;

  const symbol = '<span style="margin-right: 0;" class="iconfont icon-a-TeaProject-T"></span>'
  return symbol + value;
});
Vue.filter('cardTitle', (value) => {
  return value.split(' ').join(' ');
});
Vue.filter('str', (key) => {
  return _.get(strings, key, key);
});

const C = {};
new Vue({
  router,
  store,
  methods: {
    isDev() {
      return true;
    },
    loading(f, text = 'Loading...') {
      if (f) {
        C._loading = Loading.service({
          lock: true,
          text: 'Loading...',
          customClass: 'c-fullscreen-loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      }
      else {
        C._loading && C._loading.close();
      }
    },
    showError(e, title = 'Error message') {
      const err = e.message || e.toString();
      const ex = _.get(layer1_error_tips, err, err);
      this.$alert(ex, title, {
        type: 'error'
      });
    },
    str(key){
      return _.get(strings, key, key);
    },
    goPath(path, type="push"){
      this.$router[type](path).catch(()=>{});
    }
  },
  render: h => h(App),
}).$mount('#app');
