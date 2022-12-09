import { BrowserType, OSType } from "../../@types/core/sys/sys";

/**
 * 系统信息
 */
class Sys {

    public os: OSType;

    public browser: BrowserType;

    public isMobile: boolean;

    public constructor () {
        const mac = navigator.platform.startsWith('Mac');
        const linux = navigator.platform.startsWith('Linux');
        const win = navigator.platform.startsWith('Win');
        if (mac) {
            this.os = OSType.MAC
        } else if (linux) {
            this.os = OSType.LINUX;
        } else if (win) {
            this.os = OSType.WIN;
        } else {
            this.os = OSType.UNKNOW;
        }

        this.isMobile = typeof orientation !== 'undefined' || this.userAgentContains('mobile');

        const webkit = this.userAgentContains('webkit');

        const chrome = this.userAgentContains('chrome');
        const safari = !chrome && this.userAgentContains('safari');
        // @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
        const gecko = this.userAgentContains('gecko') && !webkit;
        if (chrome) {
            this.browser = BrowserType.CHROME;
        } else if (safari) {
            this.browser = BrowserType.SAFARI;
        } else if (gecko) {
            this.browser = BrowserType.FIRFOX;
        } else {
            this.browser = BrowserType.UNKNOW;
        }
    }

    public userAgentContains (str: string) {
        return navigator.userAgent.toLowerCase().includes(str);
    }

}

export const sys = new Sys();