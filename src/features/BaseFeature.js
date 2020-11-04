import { Store } from '../utils';

class BaseFeature {
  /**
   * @param {*} name 配置的名称
   */
  constructor({ name }) {
    this.name = name;
  }

  get store() {
    const res = Store.get(this.name);
    if (res) {
      return res;
    }
    Store.set(this.name, undefined);
    return undefined;
  }

  set store(v) {
    Store.set(this.name, v);
  }

  init() {
    return new Promise((resolve, reject) => {
      try {
        this.launch();
        resolve(this);
      } catch (error) {
        console.log(`run ${this.name} error`);
        reject(error);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  launch = () => {}
}

export default BaseFeature;
