const tz_offset = new Date().getTimezoneOffset() + 480;
const ts_ms = Date.now;

/**
 * 检查是否为新的一天，以UTC+8为准
 * @param {*} ts 保存的时间戳
 */
const isNewDay = (ts) => {
  if (!ts) return true;

  const t = new Date(ts);
  t.setMinutes(t.getMinutes() + tz_offset);
  t.setHours(0, 0, 0, 0);
  const d = new Date();
  d.setMinutes(t.getMinutes() + tz_offset);
  return d - t > 86400e3;
};

const Store = (function () {
  const set = function (key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const get = function (key) {
    const v = localStorage.getItem(key);
    try {
      return JSON.parse(v);
    } catch (error) {
      return v;
    }
  };

  const remove = function (key) {
    localStorage.removeItem(key);
  };

  const has = function (key) {
    return Reflect.has(localStorage, key);
  };
  return { set, get, remove, has };
}());

// eslint-disable-next-line no-plusplus
const getId = (i => () => i++)(0);

export class EventBus {
  allHandlers={}

  getHandlers(type) {
    return this.allHandlers[type] || [];
  }

  on(eventType, handler) {
    const handlers = this.getHandlers(eventType);
    handlers.push(handler);
    this.allHandlers[eventType] = handlers;
  }

  off(eventType, handler) {
    const handlers = this.getHandlers(eventType);
    handlers.splice(handlers.indexOf(handler), 1);
  }

  emit(eventType, event) {
    const handlers = this.getHandlers(eventType);
    handlers.forEach(handler => handler(event));
  }
}

export { isNewDay, Store, ts_ms, getId };
