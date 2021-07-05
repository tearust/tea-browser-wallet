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

Vue.use(ElementUI, {locale});
Vue.config.productionTip = false;



router.beforeEach((to, from, next)=>{  
  if(to.meta && to.meta.needLogin){
    const {layer1_account} = store.getters;
    if(!layer1_account){
      next({path: '/login_account'})
    }
  }

  next();
})

Vue.filter('formatBalance', (value)=>{
  if(!value) return '';
  return utils.layer1.formatBalance(value);
});

Vue.filter('addTea', (value)=>{
  return `${value} TEA`;
});
Vue.filter('teaIcon', (value)=>{
  return '<img src="/tea_logo/tea.png" style="width: 16px;height: 16px;position: relative;top: 2px;" /> '+value;
});

const C = {};
new Vue({
  router,
  store,
  methods: {
    isDev(){
      return true;
    },
    loading(f, text='Loading...'){
      if(f){
        C._loading = Loading.service({
          lock: true,
          text: 'Loading...',
          customClass: 'c-fullscreen-loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      }
      else{
        C._loading && C._loading.close();
      }
    },
    showError(e, title='Layer1 Error'){
      const err = e.message || e.toString();
      this.$alert(err, title, {
        type: 'error'
      });
    },
  },
  render: h => h(App),
}).$mount('#app');
