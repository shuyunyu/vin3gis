/**
 * xhr响应类型
 */
export enum XHRResponseType {
    JSON = 1,
    ARRAYBUFFER,
    BLOB,
    TEXT
}

/**
 * 请求类型
 */
export enum XHRRequestMethod {
    GET = 1,
    POST,
    PUT,
    DELETE
}

/**
 * XHRRequest请求构造参数
 */
export interface XHRRequestOptions {
    //请求地址 可以是相对地址 也可以是完整地址
    url: string;
    //请求方法
    method?: XHRRequestMethod;
    //基本URL 优先级高于默认配置中的baseURL
    baseURL?: string;
    //随请求发送的URL参数
    params?: any;
    //随请求发送的请求体数据 只对非GET请求有效
    data?: any;
    //响应内容
    responseType?: XHRResponseType;
    //请求头
    headers?: Record<string, string>;
    //如果设置为true 则会发送json请求数据 即强制请求头Content-Type设置为 application/json
    jsonBody?: boolean;
    //指定请求超时时间
    timeout?: number;
    //是否跨站点访问控制请求
    withCredentials?: boolean;
    //用来取消xhr请求的对象
    cancelToken?: XHRCancelToken;
    //参数序列化方法 可自定义参数序列化  args=> 0:params
    paramsSerializer?: Function;
    //发送请求前 可以变化请求参数data 只对非get请求有效 最后一个方法必须返回string  args=> 0:data,1:config
    transformRequest?: Function[];
    //该方法可以在响应结果被传递给then/catch前调用来转换响应结果  最后一个方法必须返回data
    transformResponse?: Function[];
}

/**
 * 请求配置
 */
interface XHRRequestConfig {
    //基础请求url e.g. http://localhost:8080
    baseURL: string;
    //请求头配置
    headers: XHRRequestHeaderConfig
}

/**
 * 请求头配置
 */
interface XHRRequestHeaderConfig {
    //公共请求头
    common: Record<string, string>,
    //post请求使用的请求头
    post: Record<string, string>,
    //get请求使用的请求头
    get: Record<string, string>
}

/**
 * xhr请求响应结果
 */
export interface XHRResponse {
    //响应数据
    data: any,
    //状态码
    status: number,
    //状态描述
    statusText: string,
    //响应头
    headers: Record<string, any>,
    //请求配置
    config: XHRRequestOptions,
    //xhr请求对象
    request: XHRRequest,
    //消息 如果报错(如：转换JSON失败) 则有消息
    message: string | undefined,
    //标识 该请求是否被终止了
    abort: boolean;
}

/**
 * 拦截器
 */
interface Interceptors {
    request: Interceptor,
    response: Interceptor,
}

/**
 * 拦截器对象
 */
interface Interceptor {
    //添加拦截器处理方法
    use (handleFunc: Function, handleErorFunc?: Function): void;
    //发送请求前的处理
    handleBeforeRequest (options: XHRRequestOptions): XHRRequestOptions;
    //请求错误的处理 return true 则继续执行 reject  否则 不执行reject
    handleRequestError (httpRequest: XMLHttpRequest, error: any): boolean;
    //请求成功后的处理 return true 则继续执行 reject  否则 不执行reject
    handleAfaterResponse (httpRequest: XMLHttpRequest, response: XHRResponse): XHRResponse;
    //请求失败(响应状态码不为2XX的响应)后的处理 return true 则继续执行 resovle  否则 不执行resovle
    handlerAfterResponseError (httpRequest: XMLHttpRequest, response: XHRResponse): boolean;
}

const defined = function (val: any) {
    return val !== undefined && val !== null;
}

const trim = function (str: string) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * 拦截器基类
 */
class BaseInterceptor implements Interceptor {

    private _handerFuncs: Function[] = [];

    private _handleErrorFuncs: Function[] = [];

    /**
     * 使用拦截方法
     * @param handleFunc 
     * @param handleErorFunc 
     */
    use (handleFunc: Function, handleErorFunc?: Function): void {
        if (this._handerFuncs.indexOf(handleFunc) === -1) {
            this._handerFuncs.push(handleFunc);
        }
        if (defined(handleErorFunc)) {
            if (this._handleErrorFuncs.indexOf(handleErorFunc!) === -1) {
                this._handleErrorFuncs.push(handleErorFunc!);
            }
        }

    }

    /**
     * xhr请求发出前 处理
     * @param options 
     */
    handleBeforeRequest (options: XHRRequestOptions): XHRRequestOptions {
        let config: XHRRequestOptions | undefined;
        for (let i = 0; i < this._handerFuncs.length; i++) {
            const func = this._handerFuncs[i];
            config = func.apply(null, [options]);
        }
        return defined(config) ? config! : options;
    }

    /**
     * 处理请求错误
     * @param error 
     */
    handleRequestError (httpRequest: XMLHttpRequest, error: any): boolean {
        let pass = true;
        for (let i = 0; i < this._handleErrorFuncs.length; i++) {
            const func = this._handleErrorFuncs[i];
            pass = func.apply(null, [error]);
            //不会调用reject了
            if (!pass) {
                break;
            }
        }
        return pass;
    }

    /**
     * xhr请求响应时处理
     * @param httpRequest 
     * @param response 
     */
    handleAfaterResponse (httpRequest: XMLHttpRequest, response: XHRResponse): XHRResponse {
        let res: XHRResponse | undefined;
        for (let i = 0; i < this._handerFuncs.length; i++) {
            const func = this._handerFuncs[i];
            res = func.apply(null, [response]);
        }
        return defined(res) ? response : response
    }

    /**
     * xhr非2XX响应处理
     * @param httpRequest 
     * @param response 
     */
    handlerAfterResponseError (httpRequest: XMLHttpRequest, response: XHRResponse): boolean {
        let pass = true;
        for (let i = 0; i < this._handleErrorFuncs.length; i++) {
            const func = this._handleErrorFuncs[i];
            pass = func.apply(null, [response.message]);
            //不会调用resolve了
            if (!pass) {
                break;
            }
        }
        return pass;
    }

}

/**
 * 用来控制 xhr请求 取消的类
 */
export class XHRCancelToken {

    private static xctIndex: number = 0;

    private _httpRequest: XMLHttpRequest | undefined;

    private _id: string;

    private _cancelFunc: (cancelF: Function) => void;

    private _canceled: boolean = false;

    public get id () {
        return this._id;
    }

    public get cancelFunc () {
        return this._cancelFunc;
    }

    public get canceled () {
        return this._canceled;
    }

    public get httpRequest () {
        return this._httpRequest;
    }

    public set httpRequest (request: XMLHttpRequest | undefined) {
        this._httpRequest = request;
    }

    constructor (cancelFunc: (cancelF: Function) => void) {
        this._cancelFunc = cancelFunc;
        this._id = "xhr_xct_" + XHRCancelToken.xctIndex++;
        this._cancelFunc.call(null, this.generateCancelRequest());
    }

    /**
     * 生成 用于 取消xhr请求的 方法
     * @returns 
     */
    private generateCancelRequest () {
        let _this = this;
        return function () {
            if (_this._canceled) return;
            _this._canceled = true;
            if (_this._httpRequest) {
                //@ts-ignore
                _this._httpRequest.__aborted = true;
                _this._httpRequest.abort();
            }
        }
    }

}


export class XHRRequest {

    //默认配置
    public static defaults: XHRRequestConfig = {
        baseURL: "",
        headers: {
            common: {},
            post: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            get: {}
        }

    };

    //拦截器
    public static interceptors: Interceptors = {
        request: new BaseInterceptor(),
        response: new BaseInterceptor()
    };

    /**
     * 序列化数据
     * @param params 
     * @returns 
     */
    private static serialize (params: any) {
        let data = '';
        if (defined(params)) {
            for (let key in params) {
                if (params.hasOwnProperty(key)) {
                    let param = params[key];
                    let type = Object.prototype.toString.call(param);
                    let value;

                    if (data.length) {
                        data += '&';
                    }

                    if (type === '[object Array]') {
                        value = (Object.prototype.toString.call(param[0]) === '[object Object]') ? JSON.stringify(param) : param.join(',');
                    } else if (type === '[object Object]') {
                        value = JSON.stringify(param);
                    } else if (type === '[object Date]') {
                        value = param.valueOf();
                    } else {
                        value = param;
                    }

                    data += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }
            }
        }
        return data;
    }

    private static falseFn () {
        return false;
    }

    /**
     * 创建xhr请求
     * @param callback 回调
     * @param context 回调的this
     */
    private static createRequest (options: XHRRequestOptions, callback: Function) {
        let _this = this;
        let httpRequest = new globalThis.XMLHttpRequest();
        this.setRequestResponseType(httpRequest, options);
        httpRequest.onerror = function (e) {
            httpRequest.onreadystatechange = XHRRequest.falseFn;
            callback.call(null, 'XMLHttpRequest error', null);
        };
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                let response = _this.getRequestReponse(httpRequest, options);
                httpRequest.onerror = XHRRequest.falseFn;
                if (defined(response.message)) {
                    callback.call(null, response.message, null);
                } else {
                    callback.call(null, null, response);
                }
            }
        };
        httpRequest.ontimeout = function () {
            httpRequest.onreadystatechange = XHRRequest.falseFn;
            callback.call(null, 'XMLHttpRequest timeout', null);
        };
        return httpRequest;
    }

    /**
     * 获取xhr的响应
     * @param httpRequest 
     * @param options 
     */
    private static getRequestReponse (httpRequest: XMLHttpRequest, options: XHRRequestOptions): XHRResponse {
        let responseType = options.responseType;
        let responseData = null;
        let message = undefined;
        if (responseType === XHRResponseType.TEXT) {
            responseData = httpRequest.responseText;
        } else if (responseType === XHRResponseType.JSON) {
            //@ts-ignore
            if (!httpRequest.__aborted) {
                try {
                    responseData = JSON.parse(httpRequest.responseText);
                } catch (error) {
                    message = 'Could not parse response as JSON. This could also be caused by a CORS or XMLHttpRequest error.';
                }
            }
        } else {
            responseData = httpRequest.response;
        }

        return {
            data: responseData,
            status: httpRequest.status,
            statusText: httpRequest.statusText,
            config: options,
            headers: this.getAllResponseHeaders(httpRequest),
            request: httpRequest,
            message: message,
            //@ts-ignore
            abort: httpRequest.__aborted === true
        }
    }

    /**
     * 设置请求的 响应
     * @param httpRequest 
     * @param options 
     */
    private static setRequestResponseType (httpRequest: XMLHttpRequest, options: XHRRequestOptions) {
        let responseType = options.responseType;
        if (responseType === XHRResponseType.ARRAYBUFFER) {
            httpRequest.responseType = "arraybuffer";
        } else if (responseType === XHRResponseType.BLOB) {
            httpRequest.responseType = "blob";
        }
    }

    /**
     * 获取所有响应头
     * @param httpRequest 
     * @returns 
     */
    private static getAllResponseHeaders (httpRequest: XMLHttpRequest): Record<string, string> {
        let headers = httpRequest.getAllResponseHeaders();
        let headerRecord: Record<string, any> = {};
        if (defined(headers)) {
            let strArr = headers.split('\n');
            for (let i = 0; i < strArr.length; i++) {
                const line = strArr[i];
                let index = line.indexOf(':');
                let key = trim(line.substr(0, index)).toLowerCase();
                let val = trim(line.substr(index + 1));
                if (key) {
                    if (key === 'set-cookie') {
                        headerRecord[key] = (headerRecord[key] ? headerRecord[key] : []).concat([val]);
                    } else {
                        headerRecord[key] = headerRecord[key] ? headerRecord[key] + "," + val : val;
                    }

                }
            }
        }
        return headerRecord;
    }

    /**
     * 设置请求超时时间
     * @param httpRequest 
     * @param options 
     */
    private static configRequest (httpRequest: XMLHttpRequest, options: XHRRequestOptions) {
        this.setRequestHeaders(httpRequest, options);
        if (defined(options.timeout)) {
            httpRequest.timeout = options.timeout!;
        }
        if (defined(options.withCredentials)) {
            httpRequest.withCredentials = options.withCredentials!;
        }
    }

    /**
     * 设置请求头
     * @param httpRequest 
     * @param headerRecord 
     */
    private static setRequestHeadersWithRecord (httpRequest: XMLHttpRequest, headers: Record<string, string>, filterHeaders: string[]) {
        let keys = Object.keys(headers!);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (filterHeaders.indexOf(key) > -1) continue;
            httpRequest.setRequestHeader(key, headers![key]);
        }
    }

    /**
     * 设置请求头
     * @param httpRequest 
     * @param options 
     */
    private static setRequestHeaders (httpRequest: XMLHttpRequest, options: XHRRequestOptions) {
        let filterHeaders: string[] = [];
        if (options.jsonBody) {
            let key = "Content-Type";
            httpRequest.setRequestHeader(key, "application/json; charset=UTF-8");
            filterHeaders.push(key);
        }
        //设置公共请求头
        let commonHeaders = this.defaults.headers.common;
        this.setRequestHeadersWithRecord(httpRequest, commonHeaders, filterHeaders);
        //设置每种方法请求头
        if (defined(options.method)) {
            let methodHeaders: Record<string, string> | undefined;
            switch (options.method) {
                case XHRRequestMethod.GET:
                    methodHeaders = this.defaults.headers.get;
                    break;
                case XHRRequestMethod.POST:
                    methodHeaders = this.defaults.headers.post;
                    break;
                default:
                    break;
            }
            if (defined(methodHeaders)) {
                this.setRequestHeadersWithRecord(httpRequest, methodHeaders!, filterHeaders);
            }
        }
        //设置其他请求头
        let headers = options.headers;
        if (defined(headers)) {
            this.setRequestHeadersWithRecord(httpRequest, headers!, filterHeaders);
        }
    }

    /**
     * 组合url
     * @param baseUrl
     * @param url 
     */
    private static combineUrl (baseUrl: string, url: string) {
        if (!baseUrl) return url;
        baseUrl = baseUrl.slice(baseUrl.length - 1) === "/" ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl;
        url = url.slice(0, 1) === "/" ? url : "/" + url;
        return `${baseUrl}${url}`;
    }

    /**
     * 获取请求Url
     * @param options 
     */
    private static getRequestUrl (options: XHRRequestOptions) {
        let url = options.url;
        let baseUrl = defined(options.baseURL) ? options.baseURL! : this.defaults.baseURL;
        let res = url.startsWith("http") ? url : this.combineUrl(baseUrl, url);
        if (defined(options.params)) {
            let urlParmaStr = (defined(options.paramsSerializer)) ? options.paramsSerializer!.call(null, [options.params!]) : this.serialize(options.params);
            res = res + (res.indexOf('?') === -1 ? '?' : '&') + urlParmaStr;
        }
        return res;
    }

    /**
     * 转换响应为Blob
     * @param response 
     */
    private static convertResponseToBlob (response: XHRResponse, inFilename?: string) {
        let fileInfoHeader = response.headers['content-disposition'];
        const filename = defined(inFilename) ? inFilename! : defined(fileInfoHeader) ? decodeURI(response.headers['content-disposition'].match(
            /filename=(.*)/
        )[1]) : Date.now().toString();
        // 将二进制流转为blob
        const blob = new Blob([response.data], {
            type: 'application/octet-stream'
        })
        //@ts-ignore
        if (defined(globalThis.navigator.msSaveBlob)) {
            //@ts-ignore
            globalThis.navigator.msSaveBlob(blob, decodeURI(filename))
        } else {
            const blobURL = globalThis.URL.createObjectURL(blob)
            const tempLink = document.createElement('a')
            tempLink.style.display = 'none'
            tempLink.href = blobURL
            tempLink.setAttribute('download', decodeURI(filename))
            if (defined(tempLink.download)) {
                tempLink.setAttribute('target', '_blank')
            }
            document.body.appendChild(tempLink)
            tempLink.click()
            document.body.removeChild(tempLink)
            globalThis.URL.revokeObjectURL(blobURL)
        }
    }

    /**
     * 获取请求方法名称
     * @param options 
     */
    private static getMethodName (options: XHRRequestOptions) {
        if (defined(options.method)) {
            let name = "";
            switch (options.method!) {
                case XHRRequestMethod.GET:
                    name = "GET";
                    break;
                case XHRRequestMethod.POST:
                    name = "POST";
                    break;
                case XHRRequestMethod.PUT:
                    name = "PUT";
                    break;
                case XHRRequestMethod.DELETE:
                    name = "DELETE";
                    break;
                default:
                    name = "GET";
                    break;
            }
            return name;
        } else {
            return "GET";
        }
    }

    /**
     * 获取 发送的请求数据
     * @param options 
     */
    private static getSendData (options: XHRRequestOptions) {
        if (options.method === XHRRequestMethod.GET) {
            return null;
        } else {
            return options.jsonBody ? JSON.stringify(options.data) : this.serialize(options.data);
        }
    }

    /**
     * 调用结果转换方法
     * @param options 
     * @param response 
     */
    private static callTransformResponse (options: XHRRequestOptions, response: XHRResponse): any {
        if (defined(options.transformResponse)) {
            let res: XHRResponse | undefined;
            for (let i = 0; i < options.transformResponse!.length; i++) {
                const transform = options.transformResponse![i];
                let respon = transform.apply(null, [response]);
                if (i === options.transformResponse!.length - 1) {
                    res = respon;
                }
            }
            return res;
        } else {
            return response;
        }

    }

    /**
     * 创建xhr请求
     * @param requestOptions 
     */
    public static create (requestOptions: XHRRequestOptions): Promise<XHRResponse> {
        return new Promise<XHRResponse>((resolve, reject) => {
            //调用拦截器
            requestOptions = this.interceptors.request.handleBeforeRequest(requestOptions);
            requestOptions.responseType = defined(requestOptions.responseType) ? requestOptions.responseType : XHRResponseType.JSON;
            let request = this.createRequest(requestOptions, (err: any, response: XHRResponse) => {
                if (defined(err)) {
                    let shouldReject = this.interceptors.request.handleRequestError(request, err);
                    if (shouldReject) {
                        reject(err);
                    }
                } else {
                    let status = response.status;
                    if (status < 200 || status > 299) {
                        let shouldResolve = this.interceptors.response.handlerAfterResponseError(request, response);
                        if (shouldResolve) {
                            resolve(this.callTransformResponse(requestOptions, response));
                        }
                    } else {
                        this.interceptors.response.handleAfaterResponse(request, response);
                        resolve(this.callTransformResponse(requestOptions, response));
                    }

                }
            });
            let method = this.getMethodName(requestOptions);
            let url = this.getRequestUrl(requestOptions);
            request.open(method, url);
            this.configRequest(request, requestOptions);
            if (defined(requestOptions.cancelToken)) {
                requestOptions.cancelToken!.httpRequest = request;
            }
            let toSendData;
            //调用请求数据转换方法
            if (defined(requestOptions.transformRequest) && requestOptions.method !== XHRRequestMethod.GET) {
                let data: any;
                for (let i = 0; i < requestOptions.transformRequest!.length; i++) {
                    const transform = requestOptions.transformRequest![i];
                    let res = transform.apply(null, [requestOptions.data, requestOptions]);
                    if (i === requestOptions.transformRequest!.length - 1) {
                        data = res;
                    }
                }
                toSendData = data;
            } else {
                toSendData = this.getSendData(requestOptions);
            }
            //检查 当前请求是否已经被取消
            if (defined(requestOptions.cancelToken) && !requestOptions.cancelToken!.canceled) {
                request.send(toSendData);
            }
        });
    }

    /**
     * 文件下载
     * @param requestOptions 
     */
    public static download (requestOptions: XHRRequestOptions, fileName?: string) {
        requestOptions.responseType = defined(requestOptions.responseType) ? requestOptions.responseType : XHRResponseType.BLOB;
        requestOptions.transformResponse = [(response: XHRResponse) => {
            this.convertResponseToBlob(response, fileName);
        }];
        return this.create(requestOptions);
    }

    /**
     * 文件上传
     */
    public static upload (requestOptions: XHRRequestOptions): Promise<XHRResponse> {
        requestOptions.headers = defined(requestOptions.headers) ? requestOptions.headers : {};
        requestOptions.headers!["Content-Type"] = "multipart/form-data";
        return this.post(requestOptions);
    }

    /**
     * 创建get请求
     * @returns 
     */
    public static get (requestOptions: XHRRequestOptions): Promise<XHRResponse> {
        requestOptions.method = XHRRequestMethod.GET;
        return this.create(requestOptions);
    }

    /**
     * 创建Post请求
     * @returns 
     */
    public static post (requestOptions: XHRRequestOptions): Promise<XHRResponse> {
        requestOptions.method = XHRRequestMethod.POST;
        return this.create(requestOptions);
    }
}

