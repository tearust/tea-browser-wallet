import {_} from 'tearust_utils';

const F = {
  
};

const TEM_LIST = [
  {
    key: 'youtube',
    label: 'Youtube',
    link(video_id){
      return 'aa-'+video_id;
    }
  }, 
  {
    key: 'bbs',
    label: 'Tea Party',
    link(channel_id){
      return 'bb-'+channel_id
    }
  }
];
const TEM_MAP = {};
_.each(TEM_LIST, (item)=>{
  _.set(TEM_MAP, item.key, item);
});

F.template = {
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

export default F;