import { ConfigPanel } from './app';
import toast from './components/Toast';
/*
基础流程:
检查是否签到 并且是否是新一天
    如果没有签到 && 是新的一天 =》 签到
*/
import { Store } from './utils';
import { WB_DEFAULT_CONFIG } from './config';
import { WB_CONFIG_CONSTANT } from './constants';
import Interest from './features/Interest';

// init

function initConfig() {
  if (!Store.get(WB_CONFIG_CONSTANT)) {
    Store.set(WB_CONFIG_CONSTANT, WB_DEFAULT_CONFIG);
  }
}

function initDOM() {
  return new Promise((resolve, reject) => {
    try {
      const mainI = ConfigPanel();
      document.body.appendChild(mainI);
    } catch (error) {
      throw new Error('初始化DOM失败');
    }
  });
}
function BaseInit() {
  // 初始化配置
  initConfig();
  // 初始化Toast
  window.toast = toast;
}
function OtherInit() {
  // 初始化界面
  initDOM();
}

// 主流程
function main() {
  BaseInit();

  // 界面初始化
  OtherInit();

  // 未签到
  Interest.run();
}

main();
