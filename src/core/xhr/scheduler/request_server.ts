/**
 * 请求服务器
 */
export class RequestServer {

    //地址
    private _host: string;

    //当前请求数量
    private _curRequestCount: number;

    private static _serverMap: Record<string, RequestServer> = {};

    public get host () {
        return this._host;
    }

    public get curRequestCount () {
        return this._curRequestCount;
    }

    public set curRequestCount (count: number) {
        this._curRequestCount = count;
    }

    private constructor (host: string) {
        this._host = host;
        this._curRequestCount = 0;
    }

    /**
     * 获取请求server
     * @param url 请求地址
     */
    public static getServer (url: string) {
        let host = this.getServerHost(url);
        let server = this._serverMap[host];
        if (server) {
            return server;
        }
        server = new RequestServer(host);
        this._serverMap[host] = server;
        return server;
    }

    private static getServerHost (url: string) {
        let host: string = "";
        let regex = /^\w+\:\/\/([^\/]*).*/;
        let match = url.match(regex);
        if (match) {
            host = match[1];
        }
        return host;
    }

}