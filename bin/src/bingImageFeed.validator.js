// Stores the currently-being-typechecked object for error messages.
let obj = null;
export class IBingImageFeedProxy {
    images;
    tooltips;
    static Parse(d) {
        return IBingImageFeedProxy.Create(JSON.parse(d));
    }
    static Create(d, field = 'root') {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        }
        else if (typeof (d) !== 'object') {
            throwNotObject(field, d, false);
        }
        else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkArray(d.images, field + ".images");
        if (d.images) {
            for (let i = 0; i < d.images.length; i++) {
                d.images[i] = ImagesEntityProxy.Create(d.images[i], field + ".images" + "[" + i + "]");
            }
        }
        if (d.images === undefined) {
            d.images = null;
        }
        d.tooltips = TooltipsProxy.Create(d.tooltips, field + ".tooltips");
        return new IBingImageFeedProxy(d);
    }
    constructor(d) {
        this.images = d.images;
        this.tooltips = d.tooltips;
    }
}
export class ImagesEntityProxy {
    startdate;
    fullstartdate;
    enddate;
    url;
    urlbase;
    copyright;
    copyrightlink;
    title;
    quiz;
    wp;
    hsh;
    drk;
    top;
    bot;
    hs;
    static Parse(d) {
        return ImagesEntityProxy.Create(JSON.parse(d));
    }
    static Create(d, field = 'root') {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        }
        else if (typeof (d) !== 'object') {
            throwNotObject(field, d, false);
        }
        else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.startdate, false, field + ".startdate");
        checkString(d.fullstartdate, false, field + ".fullstartdate");
        checkString(d.enddate, false, field + ".enddate");
        checkString(d.url, false, field + ".url");
        checkString(d.urlbase, false, field + ".urlbase");
        checkString(d.copyright, false, field + ".copyright");
        checkString(d.copyrightlink, false, field + ".copyrightlink");
        checkString(d.title, false, field + ".title");
        checkString(d.quiz, false, field + ".quiz");
        checkBoolean(d.wp, false, field + ".wp");
        checkString(d.hsh, false, field + ".hsh");
        checkNumber(d.drk, false, field + ".drk");
        checkNumber(d.top, false, field + ".top");
        checkNumber(d.bot, false, field + ".bot");
        checkArray(d.hs, field + ".hs");
        if (d.hs) {
            for (let i = 0; i < d.hs.length; i++) {
                checkNull(d.hs[i], field + ".hs" + "[" + i + "]");
                if (d.hs[i] === undefined) {
                    d.hs[i] = null;
                }
            }
        }
        if (d.hs === undefined) {
            d.hs = null;
        }
        return new ImagesEntityProxy(d);
    }
    constructor(d) {
        this.startdate = d.startdate;
        this.fullstartdate = d.fullstartdate;
        this.enddate = d.enddate;
        this.url = d.url;
        this.urlbase = d.urlbase;
        this.copyright = d.copyright;
        this.copyrightlink = d.copyrightlink;
        this.title = d.title;
        this.quiz = d.quiz;
        this.wp = d.wp;
        this.hsh = d.hsh;
        this.drk = d.drk;
        this.top = d.top;
        this.bot = d.bot;
        this.hs = d.hs;
    }
}
export class TooltipsProxy {
    loading;
    previous;
    next;
    walle;
    walls;
    static Parse(d) {
        return TooltipsProxy.Create(JSON.parse(d));
    }
    static Create(d, field = 'root') {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        }
        else if (typeof (d) !== 'object') {
            throwNotObject(field, d, false);
        }
        else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.loading, false, field + ".loading");
        checkString(d.previous, false, field + ".previous");
        checkString(d.next, false, field + ".next");
        checkString(d.walle, false, field + ".walle");
        checkString(d.walls, false, field + ".walls");
        return new TooltipsProxy(d);
    }
    constructor(d) {
        this.loading = d.loading;
        this.previous = d.previous;
        this.next = d.next;
        this.walle = d.walle;
        this.walls = d.walls;
    }
}
function throwNull2NonNull(field, d) {
    return errorHelper(field, d, "non-nullable object", false);
}
function throwNotObject(field, d, nullable) {
    return errorHelper(field, d, "object", nullable);
}
function throwIsArray(field, d, nullable) {
    return errorHelper(field, d, "object", nullable);
}
function checkArray(d, field) {
    if (!Array.isArray(d) && d !== null && d !== undefined) {
        errorHelper(field, d, "array", true);
    }
}
function checkNumber(d, nullable, field) {
    if (typeof (d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "number", nullable);
    }
}
function checkBoolean(d, nullable, field) {
    if (typeof (d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "boolean", nullable);
    }
}
function checkString(d, nullable, field) {
    if (typeof (d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "string", nullable);
    }
}
function checkNull(d, field) {
    if (d !== null && d !== undefined) {
        errorHelper(field, d, "null or undefined", false);
    }
}
function errorHelper(field, d, type, nullable) {
    if (nullable) {
        type += ", null, or undefined";
    }
    throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}
//# sourceMappingURL=bingImageFeed.validator.js.map