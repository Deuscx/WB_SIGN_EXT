// 创建axios实例
// eslint-disable-next-line no-undef
const instance = axios.create({
  baseURL: 'https://weibo.com/',
  timeout: 1000 * 5,
});
// 设置post请求头
instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
/**
 * 请求拦截器
 * 每次请求前，如果存在token则在请求头中携带token
 */
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.error(error),
);

// 响应拦截器
instance.interceptors.response.use(
  // 请求成功
  (res) => {
    // console.log(res);
    return res.status === 200 ? Promise.resolve(res) : Promise.reject(res);
  },
  // 请求失败
  (error) => {
    const { response } = error;
    if (response) {
      // 请求已发出，但是不在2xx的范围
      console.log(`发送请求失败 ${response}`);
      return Promise.reject(response);
    }
    // 处理断网的情况
    if (!window.navigator.onLine) {
      console.error('断网');
    } else {
      return Promise.reject(error);
    }
  },
);

export default instance;
