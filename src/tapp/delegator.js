import {_, axios} from 'tearust_utils';
import utils from '../tea/utils';

const F = {
  async eachItem(ip, tapp){
    const rs = {};

    const hh = await F.health(ip);
    if(!hh) return null;

    rs.ping = hh+'ms';

    // if(tapp.json.type === 'bbs'){
    //   rs.url = `http://${ip}:8080/ipfs/${tapp.cid}`;
    // }
    // else if(tapp.json.type === 'youtube'){
    //   rs.url = `http://${ip}:3200?v=${tapp.json.v}`;
    // }

    const cid = utils.get_env('TAPP_CID');
    rs.url = 'http://'+ip+':8080/ipfs/'+cid+`?id=${tapp.id}&v=${tapp.json.v}&t=${tapp.json.t}`;

    return rs;
  },
  async candidateList(){
    // TODO get from layer1
    const c_list = utils.get_env('DELEGATOR_LIST').split(',');

    return c_list;
  },

  async getTableData(tapp){
    const c_list = await F.candidateList();

    const list = [];
    await Promise.all(_.map(c_list, async (ip)=>{
      const item = await F.eachItem(ip, tapp);
      if(item && item.url){
        list.push({
          ...item,
        });
      }

      return null;
    }));

    return list;
  },


  async health(ip){
    const st = Date.now();
    try{
      await axios.get(`http://${ip}:8000/dump`, {
        timeout: 2000,
      });
    }catch(e){
      return null;
    }
    
    const et = Date.now();
    return et-st;
  }
};

export default F;