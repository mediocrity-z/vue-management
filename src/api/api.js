import axios from 'axios'
import ElMessage from 'element-ui'

function myAxios(axiosConfig) {
    const service = axios.create({
        baseURL: 'http://175.27.228.178:3434/api/private/v1/',
        timeout: 10000
    })

    // 取消重复请求

    // 生成每个请求唯一的键
    const pendingMap = new Map()

    function getPendingKey(config) {
        let { url, method, params, data } = config;
        if (typeof data === 'string') data = JSON.parse(data); // response里面返回的config.data是个字符串对象
        return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
    }

    // 储存每个请求的唯一值，即cancel方法，用于取消请求
    function addPending(config) {
        const pendingKey = getPendingKey(config);
        config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
            if (!pendingMap.has(pendingKey)) {
                pendingMap.set(pendingKey, cancel);
            }
        });
    }


    // 删除重复的请求
    function removePending(config) {
        const pendingKey = getPendingKey(config);
        if (pendingMap.has(pendingKey)) {
            const cancelToken = pendingMap.get(pendingKey);
            cancelToken(pendingKey);
            pendingMap.delete(pendingKey);
        }
    }


    // 请求拦截
    service.interceptors.request.use(config => {
        config.headers.Authorization = window.sessionStorage.getItem('token');

        // 取消重复请求
        removePending(config);
        addPending(config);
        return config;
    }, err => {
        return Promise.reject(err)
    })

    // 响应拦截
    service.interceptors.response.use(response => {
        removePending(response.config)
        return response
    }, err => {
        err.config && removePending(err.config)
        httpErrorStatusHandle(err)
        return Promise.reject(err)
    })

    return service(axiosConfig)
}

function httpErrorStatusHandle(error) {
    // 处理被取消的请求
    if (axios.isCancel(error)) return console.error('请求的重复请求：' + error.message);
    let message = '';
    if (error && error.response) {
        switch (error.response.status) {
            case 302: message = '接口重定向了！'; break;
            case 400: message = '参数不正确！'; break;
            case 401: message = '您未登录，或者登录已经超时，请先登录！'; break;
            case 403: message = '您没有权限操作！'; break;
            case 404: message = '请求地址出错: ' + error.response.config.url; break; // 在正确域名下
            case 408: message = '请求超时！'; break;
            case 409: message = '系统已存在相同数据！'; break;
            case 500: message = '服务器内部错误！'; break;
            case 501: message = '服务未实现！'; break;
            case 502: message = '网关错误！'; break;
            case 503: message = '服务不可用！'; break;
            case 504: message = '服务暂时无法访问，请稍后再试！'; break;
            case 505: message = 'HTTP版本不受支持！'; break;
            default: message = '异常问题，请联系管理员！'; break
        }
    }
    if (error.message.includes('timeout')) message = '网络请求超时！';
    if (error.message.includes('Network')) message = window.navigator.onLine ? '服务端异常！' : '您断网了！';

    ElMessage({
        type: 'error',
        message
    })
}
export default myAxios