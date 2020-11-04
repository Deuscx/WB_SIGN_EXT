import request from '../request';
import BaseFeature from './BaseFeature';
import { Store, ts_ms, isNewDay } from '../utils';
import { NAME, PAGE_ID, SIGNED_ARR, WB_CONFIG_CONSTANT } from '../constants';

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

/**
 *
 * @param {*} arr
 * @returns  { 话题名: 话题id ,... }
 */
function normalizeHash(arr) {
  return new Promise((resolve, reject) => {
    const result = {};
    arr.filter(({ status }) => status === 'fulfilled').forEach(({ value }) => {
      Object.assign(result, value);
    });
    if (Store.get(SIGNED_ARR)) {
      const Sarr = Store.get(SIGNED_ARR);
      Sarr.forEach((name) => {
        delete result[name];
      });
    }
    resolve(result);
  });
}

function getPagesizeAndUser() {
  return new Promise((resolve, reject) => {
    let userId = null;
    const pageId = window.$CONFIG.page_id;
    // eslint-disable-next-line no-restricted-globals
    const isPageIdValid = !isNaN(parseInt(pageId, 10));

    if (!Store.has(PAGE_ID) && !isPageIdValid) {
      window.toast.error("未获取到page_id  请到'关注页'再刷新尝试");
      return;
    }
    if (isPageIdValid) {
      Store.set(PAGE_ID, pageId);
    }
    userId = Store.get(PAGE_ID);

    request({
      url: `p/${userId}/myfollow?relate=interested`,
    }).then(
      (response) => {
        let pageSize = 1;
        const { data } = response;
        if (data.includes('Pl_Official_RelationInterested__97_page')) {
          const a = data.split(/Pl_Official_RelationInterested__97_page/);
          pageSize = a[a.length - 2][1];
        }

        resolve({ pageSize, userId });
      },
      (err) => {
        console.error(`[${NAME}]`, err);
        reject('获取hash失败');
      },
    );
  });
}

/**
 * 从响应文本中解析出话题名称和 hash
 * @param {*} pagesize 关注列表总页数
 * @param {*} userId 用户ID
 */
async function getInterestHash(pagesize, userId) {
  const promiseArr = [];
  let nameStartIndex; let nameEndIndex;
  let name;
  let hash;
  for (let i = 1; i <= pagesize; i++) {
    promiseArr.push(
      // eslint-disable-next-line no-loop-func
      new Promise((resolve, reject) => {
        request({
          url: `p/${userId}/myfollow?cfs=600&relate=interested&Pl_Official_RelationInterested__97_page=${i}`,
        }).then(
          (response) => {
            const { data } = response;
            let nameIndex = data.indexOf('screen_name=');
            const result = {};
            while (nameIndex !== -1) {
              // 循环得到 data 的话题名和 hash
              nameStartIndex = nameIndex + 12;
              nameEndIndex = data.indexOf('&', nameIndex); // 从name_index找到&
              name = data.slice(nameStartIndex, nameEndIndex); // slice从start到end（不包含）
              hash = data.slice(
                nameIndex - 56,
                nameIndex - 56 + 38,
              );
              result[name] = hash;
              nameIndex = data.indexOf(
                'screen_name=',
                nameIndex + 100,
              );
            }
            resolve(result);
          },
          (err) => {
            reject(err);
          },
        );
      }),
    );
  }
  const result = await Promise.allSettled(promiseArr);

  return normalizeHash(result);
}
class Interest extends BaseFeature {
  constructor() {
    super({ name: WB_CONFIG_CONSTANT });
  }

  launch= async () => {
    const config = super.store;
    if (!config.AUTO_SIGN) return; // 没有设置签到
    // 判断是否签到
    if (isCheck() && !isNewDay(lastCheck)) {
    // 已经签到 并且不是新的一天
      window.toast.info('今日已签到');
      return;
    }

    // 每天重新签到时 清空已经签到列表
    if (isNewDay(lastCheck)) {
      Store.remove(SIGNED_ARR);
      Store.set('isCheck', false);
    }

    const { pageSize, userId } = await getPagesizeAndUser();

    const hashMap = await getInterestHash(pageSize, userId);

    // 当所有都签到成功后，就设置'isCheck'为true
    Promise.all(Object.entries(hashMap).map(([name, id]) => signInterest(id, name))).then(() => {
      Store.set('isCheck', true);
    });
  }

  run() {
    this.init().then((self) => {

    });
  }
}
export default new Interest();
