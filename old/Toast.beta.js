import { EventBus, getId } from '../utils';
import { TOAST_TYPE, TOAST_EVENT } from '../constants';
import globalCss from './style.css';
/**
 *
 * @param {*} name
 * @param {*} msg
 *
 */
function InToast(toastsArr) {
  function computeClass(type) {
    return 'msgContainer';
  }
  return (
    <>
      <div className={computeClass()}>
        {Object.keys(toastsArr)}
      </div>

      <style>{globalCss}</style>
    </>
  );
}
const toasts = {};
function ToastContainer(globalProps) {
  const { eventBus } = globalProps;

  function addToast(passProps) {
    const mergeProps = Object.assign({}, globalProps, passProps);

    if (passProps.id !== undefined) {
      toasts[passProps.id] = mergeProps;
    }
    console.log(toasts);
  }

  function dismissToast(id) {
    toasts[id] && delete toasts[id];
  }
  eventBus.on(TOAST_EVENT.ADD, addToast);
  eventBus.on(TOAST_EVENT.DISMISS, dismissToast);

  return (
    <>
      {InToast(toasts)}
    </>
  );
}

const defaultOptions = {
  type: TOAST_TYPE.INFO,
  timeout: 3000,
  closeOnClick: true,
};
const toastFactory = (globalOptions = defaultOptions) => {
  // eslint-disable-next-line no-multi-assign
  const events = (globalOptions.eventBus = globalOptions.eventBus || new EventBus());

  // 初始化DOM
  document.body.appendChild(ToastContainer(globalOptions));

  // toast 控制函数
  const toast = (content, options) => {
    const props = Object.assign({}, { id: getId(), type: TOAST_TYPE.DEFAULT }, options, {
      content,
    });
    // 触发ToastContainer 来生成toast
    events.emit(TOAST_EVENT.ADD, props);
    return props.id;
  };

  // 删除指定的Toast
  toast.dismiss = (id) => {
    events.emit(TOAST_EVENT.DISMISS, id);
  };

  toast.success = (content, options) => toast(content,
    Object.assign({}, options, { type: TOAST_TYPE.SUCCESS }));

  toast.error = (content, options) => toast(content,
    Object.assign({}, options, { type: TOAST_TYPE.ERROR }));

  toast.info = (content, options) => toast(content,
    Object.assign({}, options, { type: TOAST_TYPE.INFO }));

  toast.warn = (content, options) => toast(content,
    Object.assign({}, options, { type: TOAST_TYPE.WARNING }));
  return toast;
};

const toast = toastFactory();
export default toast;
