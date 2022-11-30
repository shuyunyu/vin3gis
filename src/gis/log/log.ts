import { Constructor } from "../../@types/global/global";


/**
 * 日志等级
 */
export enum LogLevel {
    DEBUG,
    TRACE,
    INFO,
    SUCCESS,
    WARN,
    ERROR
}

//日志tag
export type Tag = string | Constructor;


/**
 * 日志类
 */
export class Log {
    //是否开启日志
    public static ENABLE: boolean = true;
    //日志打印的等级
    public static LEVEL: LogLevel = LogLevel.DEBUG;

    private static baseLogStyle: string = [
        "font-size:12px",
        "padding:2px 4px",
        "border-radius:2px",
        "color:white"
    ].join(';');

    //日志tag
    private _tag?: string

    public constructor (tag?: Tag) {
        this._tag = Log.getTag(tag);
    }

    public static getLogger (tag?: Tag) {
        return new Log(tag);
    }

    public debug (...data: any) {
        Log.write(LogLevel.DEBUG, this._tag, data);
    }

    public trace (...data: any) {
        Log.write(LogLevel.TRACE, this._tag, data);
    }

    public info (...data: any) {
        Log.write(LogLevel.INFO, this._tag, data);
    }

    public success (...data: any) {
        Log.write(LogLevel.SUCCESS, this._tag, data);
    }

    public warn (...data: any) {
        Log.write(LogLevel.WARN, this._tag, data);
    }

    public error (...data: any) {
        Log.write(LogLevel.ERROR, this._tag, data);
    }

    public static debug (tag: Tag, ...data: any) {
        Log.write(LogLevel.DEBUG, this.getTag(tag), data);
    }

    public static trace (tag: Tag, ...data: any) {
        Log.write(LogLevel.TRACE, this.getTag(tag), data);
    }

    public static info (tag: Tag, ...data: any) {
        this.write(LogLevel.INFO, this.getTag(tag), data);
    }

    public static success (tag: Tag, ...data: any) {
        this.write(LogLevel.SUCCESS, this.getTag(tag), data);
    }

    public static warn (tag: Tag, ...data: any) {
        this.write(LogLevel.WARN, this.getTag(tag), data);
    }

    public static error (tag: Tag, ...data: any) {
        this.write(LogLevel.ERROR, this.getTag(tag), data);
    }

    private static getTag (tag?: Tag) {
        return tag ? Log.isString(tag) ? String(tag) : (tag as Constructor).name : undefined;
    }

    private static write (level: LogLevel, tag: string = 'default', ...data: any) {
        if (Log.ENABLE && level >= Log.LEVEL) {
            let levelInfo = this.getLevelInfo(level);
            let fstr = `%c[%s] [%s] [%s] - `;
            let args = [Log.baseLogStyle + ";background:" + levelInfo.color, this.formatDate(new Date()), levelInfo.label, tag];
            for (let i = 0; i < data[0].length; i++) {
                let ele = data[0][i];
                fstr += Log.isString(ele) ? "%s" : "%o";
                args.push(ele);
            }
            console.log.apply(globalThis, [fstr].concat(args));
            const showTrace = level === LogLevel.TRACE || level >= LogLevel.WARN;
            if (showTrace) {
                console.groupCollapsed('click to show call stack.');
                console.trace();
                console.groupEnd();
            }
        }
    }

    private static isString (ele: any) {
        return typeof (ele) === "string";
    }

    private static getLevelInfo (level: LogLevel): { label: string, color: string } {
        let l: string, c: string;
        switch (level) {
            case LogLevel.DEBUG:
                l = "DEBUG  ";
                c = "#999";
                break;
            case LogLevel.INFO:
                l = "INFO   ";
                c = "#555";
                break;
            case LogLevel.SUCCESS:
                l = "SUCCESS";
                c = "green";
                break;
            case LogLevel.WARN:
                l = "WARN   ";
                c = "#fab409";
                break;
            case LogLevel.ERROR:
                l = "ERROR  ";
                c = "red";
                break;
            default:
                break;
        }
        return { label: l, color: c };
    }

    private static formatDate (date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const second = date.getSeconds();
        const ms = date.getMilliseconds();
        return `${year}-${this.fillNumber(month)}-${this.fillNumber(day)} ${this.fillNumber(hours)}:${this.fillNumber(minutes)}:${this.fillNumber(second)}.${this.fillNumber(ms, true)}`;
    }

    private static fillNumber (num: number, twoZero: boolean = false) {
        return !twoZero ? num < 10 ? '0' + num : String(num) : num < 10 ? '00' + num : num < 100 ? '0' + num : num;
    }

}

