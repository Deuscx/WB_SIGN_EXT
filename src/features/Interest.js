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
      /*       location: "page_100808_super_index",
      timezone: "GMT 0800",
      lang: "zh-cn",
      plat: "Windows",
      ua: "Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14",
      screen: "1920*1080", */
      __rnd: new Date().getTime(),
    },
  });
};

let SignedArr = Store.get(SIGNED_ARR) || [];
const signInterest = ({ id, name }) => {
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getInterestNameAId(page = 1) {
  return new Promise((resolve, reject) => {
    request({
      url: `ajax/profile/topicContent?tabid=231093_-_chaohua&page=${page}`,
    }).then(
      (response) => {
        const {
          data: { data, ok },
        } = response;
        if (ok !== 1) {
          reject({ err: '获取关注超话失败', data });
        }

        const list = data.list;
        const max_page = data.max_page;
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

        if (page < max_page) {
          getInterestNameAId(page + 1).then((li) => {
            resolve(simList.concat(li));
          });
        } else {
          resolve(simList);
        }
      },
      (err) => {
        console.error(`[${NAME}]`, err);
        reject('获取hash失败');
      },
    );
  });
}

class PromiseQueue {
  constructor({ concurrency = 1, timeout = 0 } = {}) {
    this.queue = [];
    this.running = 0;
    this.concurrency = concurrency;
    this.timeout = timeout;
  }

  add(promiseFn) {
    return new Promise((resolve, reject) => {
      const wrappedFn = async () => {
        try {
          const timeoutPromise = promiseFn();

          await delay(this.timeout);
          const result = await timeoutPromise;
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      };

      this.queue.push(wrappedFn);
      this.processQueue();
    });
  }

  processQueue() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      this.running++;
      const task = this.queue.shift();
      task();
    }
  }
}

class Interest extends BaseFeature {
  constructor() {
    super({ name: WB_CONFIG_CONSTANT });
  }

  launch = async () => {
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

    let idNameList = await getInterestNameAId();
    const signedArr = Store.get(SIGNED_ARR);
    if (signedArr && signedArr.length) {
      idNameList = idNameList.filter((v) => !signedArr.includes(v.name));
    }

    // 每次只签一个 避免触发检测，增加500ms延迟
    const queue = new PromiseQueue({ concurrency: 1, timeout: 500 });

    for (const { name, id } of idNameList) {
      await queue.add(() => signInterest({ id, name }));
    }

    // 当所有都签到成功后，就设置'isCheck'为true
    Store.set('isCheck', true);
  };

  run() {
    this.init().then((self) => {});
  }
}
export default new Interest();
