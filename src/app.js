// global CSS
import globalCss from './style.css';
// CSS modules
import styles, { stylesheet } from './style.module.css';
import { Store } from './utils';
import { WB_CONFIG_CONSTANT } from './constants';

let CONFIG = Store.get(WB_CONFIG_CONSTANT);

export function getGreetings() {
  return (
    <>
      <div className={styles.panel}>
        hello
      </div>
      <style>{globalCss}</style>
      <style>{stylesheet}</style>
    </>
  );
}

export function ConfigPanel() {
  const handleAutoSign = (e) => {
    const v = e.target.checked;
    const newConfig = Object.assign({}, CONFIG, { AUTO_SIGN: v });
    CONFIG = newConfig;
    Store.set(WB_CONFIG_CONSTANT, CONFIG);
  };

  const handleShowToast = (e) => {
    const v = e.target.checked;
    const newConfig = Object.assign({}, CONFIG, { SHOW_TOAST: v });
    CONFIG = newConfig;
    Store.set(WB_CONFIG_CONSTANT, CONFIG);
  };

  const handleTimeout = (e) => {
    const v = e.target.value;
    const newConfig = Object.assign({}, CONFIG, { TIMEOUT: v });
    CONFIG = newConfig;
    Store.set(WB_CONFIG_CONSTANT, CONFIG);
  };

  const toggleClassList = () => {
    document.querySelector('.configContainer').classList.toggle('active');
  };
  return (
    <>
      <div className="configContainer">
        <label htmlFor="AUTO_SIGN" className="cItem">
          <span className="des">自动签到</span>
          <input
            id="AUTO_SIGN"
            type="checkbox"
            onInput={handleAutoSign}
            checked={CONFIG.AUTO_SIGN}
          />
        </label>
        <label htmlFor="SHOW_TOAST" className="cItem"><span className="des">是否展示气泡</span>
          <input id="SHOW_TOAST" type="checkbox" onInput={handleShowToast} checked={CONFIG.SHOW_TOAST} />
        </label>
        <label htmlFor="TIMEOUT" className="cItem"><span className="des">气泡展示时间</span><input
          id="TIMEOUT"
          type="number"
          onInput={handleTimeout}
          min="0"
          value={parseInt(CONFIG.TIMEOUT, 10)}
          placeholder="单位为毫秒"
        />
        </label>
        <div className="action" onClick={toggleClassList}>收放</div>
      </div>
      <style>{globalCss}</style>
    </>

  );
}
