import request from '../request';
import BaseFeature from './BaseFeature';
import { Store, ts_ms, isNewDay } from '../utils';
import { NAME, SIGNED_ARR, WB_CONFIG_CONSTANT } from '../constants';

function isCheck() {
  return Store.get('isCheck') || false;
}
const lastCheck = Store.get('lastCheck');

const signInterestAPI = (id) => {
  return request({
    url: 'p/aj/general/button',
    // eslint-disable-next-line no-undef
    params: {
      ajwvr: 6,
      api: 'http://i.huati.weibo.com/aj/super/checkin',
      texta: encodeURI('签到'),
      textb: encodeURI('已签到'),
      status: 0,
      id, // 话题id
      location: 'page_100808_super_index',
      timezone: 'GMT 0800',
      lang: 'zh-cn',
      plat: 'Windows',
      ua: 'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
      screen: '1920*1080',
      __rnd: new Date().getTime(),
    },
  });
};

let SignedArr = Store.get(SIGNED_ARR) || [];
const signInterest = (id, name) => {
  return new Promise((resolve, reject) => {
    signInterestAPI(id).then(
      (response) => {
        const { data } = response;
        if (data.code === '100000') {
          window.toast.success(
            `[${name}签到成功]${data.msg} ---${data.data.alert_title}`,
          );
          Store.set('lastCheck', ts_ms());
          SignedArr.push(name);
          SignedArr = Array.from(new Set(SignedArr));
          Store.set(SIGNED_ARR, SignedArr);
        } else {
          window.toast.warn(`[${name}超话签到]${data.msg}`);
          if (data.code !== 382004) {
            // 其他错误
            reject('error');
          } else {
            // 已经签到
            Store.set('lastCheck', ts_ms());
            SignedArr.push(name);
            SignedArr = Array.from(new Set(SignedArr));
            Store.set(SIGNED_ARR, SignedArr);
          }
        }
        resolve();
      },
      (err) => {
        reject(err);
        window.toast.error(`[${name}超话签到]签到失败，请检查网络`);
      },
    );
  });
};

function getInterestNameAId() {
  return new Promise((resolve, reject) => {
    request({
      url: 'ajax/profile/topicContent?tabid=231093_-_chaohua',
    }).then(
      (response) => {
        const { data: { data, ok } } = response;
        if (ok !== 1) {
          reject({ err: '获取关注超话失败', data });
        }

        const list = data.list;
        /**
         *
         * @param {*} oid
         * @returns 超话id
         */
        function extractId(oid) {
          return oid.slice(5);
        }
        const simList = list.map(({ oid, topic_name }) => ({
          id: extractId(oid),
          name: topic_name,
        }));
        resolve(simList);
      },
      (err) => {
        console.error(`[${NAME}]`, err);
        reject('获取hash失败');
      },
    );
  });
}

class Interest extends BaseFeature {
  constructor() {
    super({ name: WB_CONFIG_CONSTANT });
  }

  launch= async () => {
    const config = super.store;
    if (!config.AUTO_SIGN) return;

    if (isCheck() && !isNewDay(lastCheck)) {
      window.toast.info('今日已签到');
      return;
    }

    // 每天重新签到时 清空已经签到列表
    if (isNewDay(lastCheck)) {
      Store.remove(SIGNED_ARR);
      Store.set('isCheck', false);
    }

    const idNameList = await getInterestNameAId();

    // 当所有都签到成功后，就设置'isCheck'为true
    Promise.all(idNameList.map(({ name, id }) => signInterest(id, name))).then(() => {
      Store.set('isCheck', true);
    });
  }

  run() {
    this.init().then((self) => {

    });
  }
}
export default new Interest();
