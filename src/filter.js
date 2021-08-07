import Vue from 'vue';
import utils from './tea/utils';
import { _ } from 'tearust_utils';
import strings from './assets/string';


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
Vue.filter('balance_number', (value) => {
  if(_.isNull(value) || _.isUndefined(value)) return '';
  value = parseInt(value, 10) / (1000000*1000000);
  value = Math.floor(value*10000)/10000;
  return value;

});
Vue.filter('cardTitle', (value) => {
  return value.split(' ').join(' ');
});
Vue.filter('str', (key) => {
  return _.get(strings, key, key);
});

Vue.filter('upper', (value)=>{
  return _.toUpper(value);
});

