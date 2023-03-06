/**
 * See: http://hg.grauw.nl/grauw-lib/file/tip/src/uri.js
 */
const parseRegex = new RegExp('^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(?:\\?([^#]*))?(?:#(.*))?$');

const caseRegex = /%[0-9a-z]{2}/gi;
const percentRegex = /[a-zA-Z0-9\-\._~]/;
const authorityRegex = /(.*@)?([^@:]*)(:.*)?/;

function replaceCase (str: string) {
    let dec = unescape(str);
    return percentRegex.test(dec) ? dec : str.toUpperCase();
}

function replaceAuthority (str: string, p1: string, p2: string, p3: string) {
    return (p1 || '') + p2.toLowerCase() + (p3 || '');
}

export class URI {

    private _scheme: string | null;

    private _authority: string | null;

    private _path: string;

    private _query: string | null;

    private _fragment: string | null;

    public get scheme () {
        return this._scheme;
    }

    public set scheme (val: string | null) {
        this._scheme = val;
    }


    public get authority () {
        return this._authority;
    }

    public set authority (val: string | null) {
        this._authority = val;
    }

    public get path () {
        return this._path;
    }

    public set path (val: string) {
        this._path = val;
    }

    public get query () {
        return this._query;
    }

    public set query (val: string | null) {
        this._query = val;
    }

    public get fragment () {
        return this._fragment;
    }

    public set fragment (val: string | null) {
        this._fragment = val;
    }

    constructor (uri?: URI | string) {
        if (uri instanceof URI) {
            this._scheme = uri.scheme;
            this._authority = uri.authority;
            this._path = uri.path;
            this._query = uri.query;
            this._fragment = uri.fragment;
        } else {
            let c = uri !== null && uri !== undefined ? parseRegex.exec(uri) : null;
            this._scheme = c != null ? c[1] : null;
            this._authority = c != null ? c[2] : null;
            this._path = c != null ? c[3] : "";
            this._query = c != null ? c[4] : null;
            this._fragment = c != null ? c[5] : null;
        }
    }

    public isAbsolute () {
        return !!this.scheme && !this.fragment;
    }

    public isSameDocumentAs (uri: URI) {
        return uri.scheme == this.scheme &&
            uri.authority == this.authority &&
            uri.path == this.path &&
            uri.query == this.query;
    }

    public equals (uri: URI) {
        return this.isSameDocumentAs(uri) && uri.fragment == this.fragment;
    }

    public normalize () {
        this.removeDotSegments();
        if (this.scheme)
            this._scheme = this.scheme.toLowerCase();
        if (this.authority)
            this._authority = this.authority.replace(authorityRegex, replaceAuthority).
                replace(caseRegex, replaceCase);
        if (this.path)
            this._path = this.path.replace(caseRegex, replaceCase);
        if (this.query)
            this._query = this.query.replace(caseRegex, replaceCase);
        if (this.fragment)
            this._fragment = this.fragment.replace(caseRegex, replaceCase);
    }

    public resolve (baseURI: URI) {
        var uri = new URI();
        if (this.scheme) {
            uri.scheme = this.scheme;
            uri.authority = this.authority;
            uri.path = this.path;
            uri.query = this.query;
        } else {
            uri.scheme = baseURI.scheme;
            if (this.authority) {
                uri.authority = this.authority;
                uri.path = this.path;
                uri.query = this.query;
            } else {
                uri.authority = baseURI.authority;
                if (this.path == '') {
                    uri.path = baseURI.path;
                    uri.query = this.query || baseURI.query;
                } else {
                    if (this.path.charAt(0) == '/') {
                        uri.path = this.path;
                        uri.removeDotSegments();
                    } else {
                        if (baseURI.authority && baseURI.path == '') {
                            uri.path = '/' + this.path;
                        } else {
                            uri.path = baseURI.path.substring(0, baseURI.path.lastIndexOf('/') + 1) + this.path;
                        }
                        uri.removeDotSegments();
                    }
                    uri.query = this.query;
                }
            }
        }
        uri.fragment = this.fragment;
        return uri;
    }

    public removeDotSegments () {
        let input = this.path.split('/'),
            output = [],
            segment,
            absPath = input[0] == '';
        if (absPath)
            input.shift();
        let sFirst = input[0] == '' ? input.shift() : null;
        while (input.length) {
            segment = input.shift();
            if (segment == '..') {
                output.pop();
            } else if (segment != '.') {
                output.push(segment);
            }
        }
        if (segment == '.' || segment == '..')
            output.push('');
        if (absPath)
            output.unshift('');
        this._path = output.join('/');
    }

    public toString () {
        let result = '';
        if (this.scheme)
            result += this.scheme + ':';
        if (this.authority)
            result += '//' + this.authority;
        result += this.path;
        if (this.query)
            result += '?' + this.query;
        if (this.fragment)
            result += '#' + this.fragment;
        return result;
    }

}
