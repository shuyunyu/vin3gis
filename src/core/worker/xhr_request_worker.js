"use strict";
var XHR = {};
XHR.__esModule = true;
XHR.XHRRequest = XHR.XHRCancelToken = XHR.XHRRequestMethod = XHR.XHRResponseType = void 0;
/**
 * xhr响应类型
 */
var XHRResponseType;
(function (XHRResponseType) {
    XHRResponseType[XHRResponseType["JSON"] = 1] = "JSON";
    XHRResponseType[XHRResponseType["ARRAYBUFFER"] = 2] = "ARRAYBUFFER";
    XHRResponseType[XHRResponseType["BLOB"] = 3] = "BLOB";
    XHRResponseType[XHRResponseType["TEXT"] = 4] = "TEXT";
})(XHRResponseType = XHR.XHRResponseType || (XHR.XHRResponseType = {}));
/**
 * 请求类型
 */
var XHRRequestMethod;
(function (XHRRequestMethod) {
    XHRRequestMethod[XHRRequestMethod["GET"] = 1] = "GET";
    XHRRequestMethod[XHRRequestMethod["POST"] = 2] = "POST";
    XHRRequestMethod[XHRRequestMethod["PUT"] = 3] = "PUT";
    XHRRequestMethod[XHRRequestMethod["DELETE"] = 4] = "DELETE";
})(XHRRequestMethod = XHR.XHRRequestMethod || (XHR.XHRRequestMethod = {}));
var defined = function (val) {
    return val !== undefined && val !== null;
};
var trim = function (str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
};
/**
 * 拦截器基类
 */
var BaseInterceptor = /** @class */ (function () {
    function BaseInterceptor() {
        this._handerFuncs = [];
        this._handleErrorFuncs = [];
    }
    /**
     * 使用拦截方法
     * @param handleFunc
     * @param handleErorFunc
     */
    BaseInterceptor.prototype.use = function (handleFunc, handleErorFunc) {
        if (this._handerFuncs.indexOf(handleFunc) === -1) {
            this._handerFuncs.push(handleFunc);
        }
        if (defined(handleErorFunc)) {
            if (this._handleErrorFuncs.indexOf(handleErorFunc) === -1) {
                this._handleErrorFuncs.push(handleErorFunc);
            }
        }
    };
    /**
     * xhr请求发出前 处理
     * @param options
     */
    BaseInterceptor.prototype.handleBeforeRequest = function (options) {
        var config;
        for (var i = 0; i < this._handerFuncs.length; i++) {
            var func = this._handerFuncs[i];
            config = func.apply(null, [options]);
        }
        return defined(config) ? config : options;
    };
    /**
     * 处理请求错误
     * @param error
     */
    BaseInterceptor.prototype.handleRequestError = function (httpRequest, error) {
        var pass = true;
        for (var i = 0; i < this._handleErrorFuncs.length; i++) {
            var func = this._handleErrorFuncs[i];
            pass = func.apply(null, [error]);
            //不会调用reject了
            if (!pass) {
                break;
            }
        }
        return pass;
    };
    /**
     * xhr请求响应时处理
     * @param httpRequest
     * @param response
     */
    BaseInterceptor.prototype.handleAfaterResponse = function (httpRequest, response) {
        var res;
        for (var i = 0; i < this._handerFuncs.length; i++) {
            var func = this._handerFuncs[i];
            res = func.apply(null, [response]);
        }
        return defined(res) ? response : response;
    };
    /**
     * xhr非2XX响应处理
     * @param httpRequest
     * @param response
     */
    BaseInterceptor.prototype.handlerAfterResponseError = function (httpRequest, response) {
        var pass = true;
        for (var i = 0; i < this._handleErrorFuncs.length; i++) {
            var func = this._handleErrorFuncs[i];
            pass = func.apply(null, [response.message]);
            //不会调用resolve了
            if (!pass) {
                break;
            }
        }
        return pass;
    };
    return BaseInterceptor;
}());
/**
 * 用来控制 xhr请求 取消的类
 */
var XHRCancelToken = /** @class */ (function () {
    function XHRCancelToken(cancelFunc) {
        this._canceled = false;
        this._cancelFunc = cancelFunc;
        this._id = "xhr_xct_" + XHRCancelToken.xctIndex++;
        this._cancelFunc.call(null, this.generateCancelRequest());
    }
    Object.defineProperty(XHRCancelToken.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(XHRCancelToken.prototype, "cancelFunc", {
        get: function () {
            return this._cancelFunc;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(XHRCancelToken.prototype, "canceled", {
        get: function () {
            return this._canceled;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(XHRCancelToken.prototype, "httpRequest", {
        get: function () {
            return this._httpRequest;
        },
        set: function (request) {
            this._httpRequest = request;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 生成 用于 取消xhr请求的 方法
     * @returns
     */
    XHRCancelToken.prototype.generateCancelRequest = function () {
        var _this = this;
        return function () {
            if (_this._canceled)
                return;
            _this._canceled = true;
            if (_this._httpRequest) {
                //@ts-ignore
                _this._httpRequest.__aborted = true;
                _this._httpRequest.abort();
            }
        };
    };
    XHRCancelToken.xctIndex = 0;
    return XHRCancelToken;
}());
XHR.XHRCancelToken = XHRCancelToken;
var XHRRequest = /** @class */ (function () {
    function XHRRequest() {
    }
    /**
     * 序列化数据
     * @param params
     * @returns
     */
    XHRRequest.serialize = function (params) {
        var data = '';
        if (defined(params)) {
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    var param = params[key];
                    var type = Object.prototype.toString.call(param);
                    var value = void 0;
                    if (data.length) {
                        data += '&';
                    }
                    if (type === '[object Array]') {
                        value = (Object.prototype.toString.call(param[0]) === '[object Object]') ? JSON.stringify(param) : param.join(',');
                    }
                    else if (type === '[object Object]') {
                        value = JSON.stringify(param);
                    }
                    else if (type === '[object Date]') {
                        value = param.valueOf();
                    }
                    else {
                        value = param;
                    }
                    data += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }
            }
        }
        return data;
    };
    XHRRequest.falseFn = function () {
        return false;
    };
    /**
     * 创建xhr请求
     * @param callback 回调
     * @param context 回调的this
     */
    XHRRequest.createRequest = function (options, callback) {
        var _this = this;
        var httpRequest = new globalThis.XMLHttpRequest();
        this.setRequestResponseType(httpRequest, options);
        httpRequest.onerror = function (e) {
            httpRequest.onreadystatechange = XHRRequest.falseFn;
            callback.call(null, 'XMLHttpRequest error', null);
        };
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                var response = _this.getRequestReponse(httpRequest, options);
                httpRequest.onerror = XHRRequest.falseFn;
                if (defined(response.message)) {
                    callback.call(null, response.message, null);
                }
                else {
                    callback.call(null, null, response);
                }
            }
        };
        httpRequest.ontimeout = function () {
            httpRequest.onreadystatechange = XHRRequest.falseFn;
            callback.call(null, 'XMLHttpRequest timeout', null);
        };
        return httpRequest;
    };
    /**
     * 获取xhr的响应
     * @param httpRequest
     * @param options
     */
    XHRRequest.getRequestReponse = function (httpRequest, options) {
        var responseType = options.responseType;
        var responseData = null;
        var message = undefined;
        if (responseType === XHRResponseType.TEXT) {
            responseData = httpRequest.responseText;
        }
        else if (responseType === XHRResponseType.JSON) {
            //@ts-ignore
            if (!httpRequest.__aborted) {
                try {
                    responseData = JSON.parse(httpRequest.responseText);
                }
                catch (error) {
                    message = 'Could not parse response as JSON. This could also be caused by a CORS or XMLHttpRequest error.';
                }
            }
        }
        else {
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
        };
    };
    /**
     * 设置请求的 响应
     * @param httpRequest
     * @param options
     */
    XHRRequest.setRequestResponseType = function (httpRequest, options) {
        var responseType = options.responseType;
        if (responseType === XHRResponseType.ARRAYBUFFER) {
            httpRequest.responseType = "arraybuffer";
        }
        else if (responseType === XHRResponseType.BLOB) {
            httpRequest.responseType = "blob";
        }
    };
    /**
     * 获取所有响应头
     * @param httpRequest
     * @returns
     */
    XHRRequest.getAllResponseHeaders = function (httpRequest) {
        var headers = httpRequest.getAllResponseHeaders();
        var headerRecord = {};
        if (defined(headers)) {
            var strArr = headers.split('\n');
            for (var i = 0; i < strArr.length; i++) {
                var line = strArr[i];
                var index = line.indexOf(':');
                var key = trim(line.substr(0, index)).toLowerCase();
                var val = trim(line.substr(index + 1));
                if (key) {
                    if (key === 'set-cookie') {
                        headerRecord[key] = (headerRecord[key] ? headerRecord[key] : []).concat([val]);
                    }
                    else {
                        headerRecord[key] = headerRecord[key] ? headerRecord[key] + "," + val : val;
                    }
                }
            }
        }
        return headerRecord;
    };
    /**
     * 设置请求超时时间
     * @param httpRequest
     * @param options
     */
    XHRRequest.configRequest = function (httpRequest, options) {
        this.setRequestHeaders(httpRequest, options);
        if (defined(options.timeout)) {
            httpRequest.timeout = options.timeout;
        }
        if (defined(options.withCredentials)) {
            httpRequest.withCredentials = options.withCredentials;
        }
    };
    /**
     * 设置请求头
     * @param httpRequest
     * @param headerRecord
     */
    XHRRequest.setRequestHeadersWithRecord = function (httpRequest, headers, filterHeaders) {
        var keys = Object.keys(headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (filterHeaders.indexOf(key) > -1)
                continue;
            httpRequest.setRequestHeader(key, headers[key]);
        }
    };
    /**
     * 设置请求头
     * @param httpRequest
     * @param options
     */
    XHRRequest.setRequestHeaders = function (httpRequest, options) {
        var filterHeaders = [];
        if (options.jsonBody) {
            var key = "Content-Type";
            httpRequest.setRequestHeader(key, "application/json; charset=UTF-8");
            filterHeaders.push(key);
        }
        //设置公共请求头
        var commonHeaders = this.defaults.headers.common;
        this.setRequestHeadersWithRecord(httpRequest, commonHeaders, filterHeaders);
        //设置每种方法请求头
        if (defined(options.method)) {
            var methodHeaders = void 0;
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
                this.setRequestHeadersWithRecord(httpRequest, methodHeaders, filterHeaders);
            }
        }
        //设置其他请求头
        var headers = options.headers;
        if (defined(headers)) {
            this.setRequestHeadersWithRecord(httpRequest, headers, filterHeaders);
        }
    };
    /**
     * 组合url
     * @param baseUrl
     * @param url
     */
    XHRRequest.combineUrl = function (baseUrl, url) {
        if (!baseUrl)
            return url;
        baseUrl = baseUrl.slice(baseUrl.length - 1) === "/" ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl;
        url = url.slice(0, 1) === "/" ? url : "/" + url;
        return "".concat(baseUrl).concat(url);
    };
    /**
     * 获取请求Url
     * @param options
     */
    XHRRequest.getRequestUrl = function (options) {
        var url = options.url;
        var baseUrl = defined(options.baseURL) ? options.baseURL : this.defaults.baseURL;
        var res = url.startsWith("http") ? url : this.combineUrl(baseUrl, url);
        if (defined(options.params)) {
            var urlParmaStr = (defined(options.paramsSerializer)) ? options.paramsSerializer.call(null, [options.params]) : this.serialize(options.params);
            res = res + (res.indexOf('?') === -1 ? '?' : '&') + urlParmaStr;
        }
        return res;
    };
    /**
     * 转换响应为Blob
     * @param response
     */
    XHRRequest.convertResponseToBlob = function (response, inFilename) {
        var fileInfoHeader = response.headers['content-disposition'];
        var filename = defined(inFilename) ? inFilename : defined(fileInfoHeader) ? decodeURI(response.headers['content-disposition'].match(/filename=(.*)/)[1]) : Date.now().toString();
        // 将二进制流转为blob
        var blob = new Blob([response.data], {
            type: 'application/octet-stream'
        });
        //@ts-ignore
        if (defined(globalThis.navigator.msSaveBlob)) {
            //@ts-ignore
            globalThis.navigator.msSaveBlob(blob, decodeURI(filename));
        }
        else {
            var blobURL = globalThis.URL.createObjectURL(blob);
            var tempLink = document.createElement('a');
            tempLink.style.display = 'none';
            tempLink.href = blobURL;
            tempLink.setAttribute('download', decodeURI(filename));
            if (defined(tempLink.download)) {
                tempLink.setAttribute('target', '_blank');
            }
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            globalThis.URL.revokeObjectURL(blobURL);
        }
    };
    /**
     * 获取请求方法名称
     * @param options
     */
    XHRRequest.getMethodName = function (options) {
        if (defined(options.method)) {
            var name_1 = "";
            switch (options.method) {
                case XHRRequestMethod.GET:
                    name_1 = "GET";
                    break;
                case XHRRequestMethod.POST:
                    name_1 = "POST";
                    break;
                case XHRRequestMethod.PUT:
                    name_1 = "PUT";
                    break;
                case XHRRequestMethod.DELETE:
                    name_1 = "DELETE";
                    break;
                default:
                    name_1 = "GET";
                    break;
            }
            return name_1;
        }
        else {
            return "GET";
        }
    };
    /**
     * 获取 发送的请求数据
     * @param options
     */
    XHRRequest.getSendData = function (options) {
        if (options.method === XHRRequestMethod.GET) {
            return null;
        }
        else {
            return options.jsonBody ? JSON.stringify(options.data) : this.serialize(options.data);
        }
    };
    /**
     * 调用结果转换方法
     * @param options
     * @param response
     */
    XHRRequest.callTransformResponse = function (options, response) {
        if (defined(options.transformResponse)) {
            var res = void 0;
            for (var i = 0; i < options.transformResponse.length; i++) {
                var transform = options.transformResponse[i];
                var respon = transform.apply(null, [response]);
                if (i === options.transformResponse.length - 1) {
                    res = respon;
                }
            }
            return res;
        }
        else {
            return response;
        }
    };
    /**
     * 创建xhr请求
     * @param requestOptions
     */
    XHRRequest.create = function (requestOptions) {
        var _this_1 = this;
        return new Promise(function (resolve, reject) {
            //调用拦截器
            requestOptions = _this_1.interceptors.request.handleBeforeRequest(requestOptions);
            requestOptions.responseType = defined(requestOptions.responseType) ? requestOptions.responseType : XHRResponseType.JSON;
            var request = _this_1.createRequest(requestOptions, function (err, response) {
                if (defined(err)) {
                    var shouldReject = _this_1.interceptors.request.handleRequestError(request, err);
                    if (shouldReject) {
                        reject(err);
                    }
                }
                else {
                    var status_1 = response.status;
                    if (status_1 < 200 || status_1 > 299) {
                        var shouldResolve = _this_1.interceptors.response.handlerAfterResponseError(request, response);
                        if (shouldResolve) {
                            resolve(_this_1.callTransformResponse(requestOptions, response));
                        }
                    }
                    else {
                        _this_1.interceptors.response.handleAfaterResponse(request, response);
                        resolve(_this_1.callTransformResponse(requestOptions, response));
                    }
                }
            });
            var method = _this_1.getMethodName(requestOptions);
            var url = _this_1.getRequestUrl(requestOptions);
            request.open(method, url);
            _this_1.configRequest(request, requestOptions);
            if (defined(requestOptions.cancelToken)) {
                requestOptions.cancelToken.httpRequest = request;
            }
            var toSendData;
            //调用请求数据转换方法
            if (defined(requestOptions.transformRequest) && requestOptions.method !== XHRRequestMethod.GET) {
                var data = void 0;
                for (var i = 0; i < requestOptions.transformRequest.length; i++) {
                    var transform = requestOptions.transformRequest[i];
                    var res = transform.apply(null, [requestOptions.data, requestOptions]);
                    if (i === requestOptions.transformRequest.length - 1) {
                        data = res;
                    }
                }
                toSendData = data;
            }
            else {
                toSendData = _this_1.getSendData(requestOptions);
            }
            //检查 当前请求是否已经被取消
            if (defined(requestOptions.cancelToken) && !requestOptions.cancelToken.canceled) {
                request.send(toSendData);
            }
        });
    };
    /**
     * 文件下载
     * @param requestOptions
     */
    XHRRequest.download = function (requestOptions, fileName) {
        var _this_1 = this;
        requestOptions.responseType = defined(requestOptions.responseType) ? requestOptions.responseType : XHRResponseType.BLOB;
        requestOptions.transformResponse = [function (response) {
            _this_1.convertResponseToBlob(response, fileName);
        }];
        return this.create(requestOptions);
    };
    /**
     * 文件上传
     */
    XHRRequest.upload = function (requestOptions) {
        requestOptions.headers = defined(requestOptions.headers) ? requestOptions.headers : {};
        requestOptions.headers["Content-Type"] = "multipart/form-data";
        return this.post(requestOptions);
    };
    /**
     * 创建get请求
     * @returns
     */
    XHRRequest.get = function (requestOptions) {
        requestOptions.method = XHRRequestMethod.GET;
        return this.create(requestOptions);
    };
    /**
     * 创建Post请求
     * @returns
     */
    XHRRequest.post = function (requestOptions) {
        requestOptions.method = XHRRequestMethod.POST;
        return this.create(requestOptions);
    };
    //默认配置
    XHRRequest.defaults = {
        baseURL: "",
        headers: {
            common: {},
            post: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            get: {}
        }
    };
    //拦截器
    XHRRequest.interceptors = {
        request: new BaseInterceptor(),
        response: new BaseInterceptor()
    };
    return XHRRequest;
}());
XHR.XHRRequest = XHRRequest;


var postMessage = globalThis.webkitPostMessage || globalThis.postMessage;

//save all request 
//format=> {request:XMLHttpRequest,data:any,requestId:"",cancelFunc:function}
var requests = [];

globalThis.onmessage = function (event) {
    var data = event.data;
    //XHRRequest.create的参数
    var options = data.params.options;
    //the request's uuid
    var requestId = data.params.requestId;
    // execute | abort (执行请求|终止请求)
    var taskType = data.params.taskType;
    if (taskType === "execute") {
        executeRequest(requestId, options, data);
    } else if (taskType === "abort") {
        abortRequest(requestId, data);
    }
};

//执行请求
var executeRequest = function (requestId, options, data) {
    var _cancelFunc;
    options.cancelToken = new XHRCancelToken(function (cancelFunc) {
        _cancelFunc = cancelFunc;
    });
    var request = XHRRequest.create(options);
    requests.push({ requestId: requestId, request: request, data: data, cancelFunc: _cancelFunc });
    var shouldCreateImageBitMap = options.responseType === XHRResponseType.BLOB && options.createImageBitMap;
    request.then(function (response) {
        if (!shouldCreateImageBitMap) {
            if (!request.__aborted) {
                removeRequest(requestId);
                //remove request property
                delete response.request;
                if (response.config) delete response.config.cancelToken;
                if (!response.abort) sendCompleteMessage(data, response, requestId, 'success');
            }
        } else {
            if (!request.__aborted) {
                createImageBitmap(response.data, options.imageBitMapOptions || {}).then(function (imageBitMap) {
                    //remove request property
                    delete response.request;
                    if (response.config) delete response.config.cancelToken;
                    if (!response.abort) {
                        response.data = imageBitMap;
                        sendCompleteMessage(data, response, requestId, 'success', [imageBitMap]);
                    }
                }).catch(function (err) {
                    if (!request.__aborted) {
                        removeRequest(requestId);
                        sendCompleteMessage(data, { message: err }, requestId, 'error');
                    }
                })
            }
        }
    }).catch(function (err) {
        removeRequest(requestId);
        sendCompleteMessage(data, { message: err }, requestId, 'error');
    });
}

//终止请求
var abortRequest = function (requestId, data) {
    var item = removeRequest(requestId);
    if (item && item.cancelFunc) {
        item.cancelFunc();
        sendCompleteMessage(data, null, requestId, 'abort');
    }
}

var removeRequest = function (requestId) {
    var index = findRequestIndex(requestId);
    if (index > -1) {
        return requests.splice(index, 1)[0];
    }
}

//根据索引查找请求id
var findRequestIndex = function (requestId) {
    var index = -1;
    for (var i = 0; i < requests.length; i++) {
        var request = requests[i];
        if (request.requestId === requestId) {
            index = i;
            break;
        }
    }
    return index;
}

//发送完成消息
var sendCompleteMessage = function (data, response, requestId, stats, transferObjs) {
    postMessage({
        id: data.id,
        error: null,
        result: {
            stats: stats,
            response: response,
            requestId: requestId
        }
    }, transferObjs || null);
}
