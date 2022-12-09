import { BrowserType, OSType } from "../../@types/core/sys/sys";

const userAgentContains = (str: string) => {
    return navigator.userAgent.toLowerCase().includes(str);
}

const mac = navigator.platform.startsWith('Mac');
const linux = navigator.platform.startsWith('Linux');
const win = navigator.platform.startsWith('Win');

const webkit = userAgentContains('webkit');

const chrome = userAgentContains('chrome');
const safari = !chrome && userAgentContains('safari');
// @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
const gecko = userAgentContains('gecko') && !webkit;

const isMobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

let os = OSType.UNKNOW;

if (mac) {
    os = OSType.MAC
} else if (linux) {
    os = OSType.LINUX;
} else if (win) {
    os = OSType.WIN;
}

let browser = BrowserType.UNKNOW;

if (chrome) {
    browser = BrowserType.CHROME;
} else if (safari) {
    browser = BrowserType.SAFARI;
} else if (gecko) {
    browser = BrowserType.FIRFOX;
} else {
    browser = BrowserType.UNKNOW;
}

/**
 * 系统信息
 */
export const sys = Object.freeze({
    os: os,
    browser: browser,
    isMobile: isMobile
});
