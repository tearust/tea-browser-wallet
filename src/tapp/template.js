import {_} from 'tearust_utils';

const TEM_LIST = [
  {
    key: 'youtube',
    label: 'Youtube',
    link(video_id){
      return JSON.stringify({
        type: 'youtube',
        v: video_id,
      });
    }
  }, 
  {
    key: 'bbs',
    label: 'Tea Party',
    link(){
      return JSON.stringify({
        type: 'bbs',
      });
    }
  }
];
const TEM_MAP = {};
_.each(TEM_LIST, (item)=>{
  _.set(TEM_MAP, item.key, item);
});

export default {
  list(){
    return _.map(TEM_LIST, (item)=>{
      return item.key;
    });
  },
  getLabel(value){
    return _.get(TEM_MAP[value], 'label');
  },
  genLink(value, param){
    const item = TEM_MAP[value];
    return item.link.call(null, param);
  }
};
