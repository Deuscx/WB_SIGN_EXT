import { TOAST_TYPE, WB_CONFIG_CONSTANT } from '../constants';
import { getId, Store } from '../utils';
import globalCss from './style.css';

const MAX_TOAST = 8;
let totalToast = 0;
const innerToast = (props) => {
  const { content, type, timeout } = props;
  function remove() {
    const current = document.querySelector(`[data-tid='${props.id}']`);
    current.classList.add('removing');
    requestAnimationFrame(() => {
      current.parentNode.removeChild(current);
      totalToast--;
    });
  }
  timeout && setTimeout(() => {
    remove();
  }, timeout);

  return (
    <>
      <div data-tid={props.id} className={`toastItem toast-${type}`} onClick={remove}>
        {content}
      </div>
    </>
  );
};
const ToastContainer = () => {
  return (
    <div className="msgContainer">
      <style>{globalCss}</style>
    </div>
  );
};
const defaultOptions = {
  type: TOAST_TYPE.INFO,
  timeout: 5000,
};

const toastFactory = () => {
  const c = ToastContainer();
  const container = document.body.appendChild(c);
  const toast = (content, options) => {
    if (!Store.get(WB_CONFIG_CONSTANT).SHOW_TOAST) return;

    const newOptions = Object.assign({}, defaultOptions, { id: getId() }, options, {
      content,
    });

    // Show Toast
    if (totalToast < MAX_TOAST) {
      totalToast++;
      container.appendChild(innerToast(newOptions));
    }
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
