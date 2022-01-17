import { __decorate, __metadata } from "tslib";
import { Option } from "commander";
import "reflect-metadata";
import * as packageJSON from "../package.json";
var optionTypes;
(function (optionTypes) {
    optionTypes[optionTypes["choices"] = 0] = "choices";
    optionTypes[optionTypes["boolean"] = 1] = "boolean";
    optionTypes[optionTypes["string"] = 2] = "string";
    optionTypes[optionTypes["array"] = 3] = "array";
})(optionTypes || (optionTypes = {}));
const decorators = {
    option: "option",
};
function option(props) {
    return Reflect.metadata(decorators.option, props);
}
function getOptions(options) {
    return Object.keys(options)
        .map((key) => ({
        key: key,
        props: Reflect.getMetadata(decorators.option, options, key),
    }))
        .filter((k) => k.props != null);
}
export class Options {
    version;
    constructor(program) {
        var optionsMetadata = getOptions(this);
        this.version = packageJSON["default"].version;
        optionsMetadata.forEach(({ key, props }) => {
            var option = new Option(props.flags.join(", "), props.description);
            if (this[key]) {
                option.default(this[key]);
            }
            if (props.required) {
                option.required;
            }
            program.addOption(option);
        });
        program.version(this.version);
        var parsedOptions = program.parse().opts();
        for (const key in parsedOptions) {
            const value = parsedOptions[key];
            this[key] = value;
        }
    }
    watch = false;
    baseUrl = "https://www.bing.com/";
    imageFolder = "./output/images/";
    cacheFolder = "./output/_cache/";
    feedUrlFormat = "HPImageArchive.aspx?format=js&idx={start}&n={count}&mkt={locale}";
    locales = [
        "en-US",
        "en-GB",
        "en-AU",
        "de-DE",
        "ja-JP",
        "nl-NL",
        "zh-CN",
        "ru-RU",
    ];
}
__decorate([
    option({
        type: optionTypes.boolean,
        flags: ["-w", "--watch"],
        description: "watch for changes in source and config and re-execute.",
    }),
    __metadata("design:type", Boolean)
], Options.prototype, "watch", void 0);
__decorate([
    option({
        type: optionTypes.string,
        flags: ["-bu", "--baseUrl"],
        description: "Bing base url",
    }),
    __metadata("design:type", String)
], Options.prototype, "baseUrl", void 0);
__decorate([
    option({
        type: optionTypes.string,
        flags: ["-if", "--imageFolder"],
        description: "Folder to output images",
    }),
    __metadata("design:type", String)
], Options.prototype, "imageFolder", void 0);
__decorate([
    option({
        type: optionTypes.string,
        flags: ["-cd", "--cacheFolder"],
        description: "Folder use for disk cache",
    }),
    __metadata("design:type", Object)
], Options.prototype, "cacheFolder", void 0);
__decorate([
    option({
        type: optionTypes.string,
        flags: ["-fuf", "--feedUrlFormat"],
        description: "Format for the feed url path",
    }),
    __metadata("design:type", Object)
], Options.prototype, "feedUrlFormat", void 0);
__decorate([
    option({
        type: optionTypes.array,
        flags: ["-l", "--locales <locale...>"],
        description: "List of locales to use as image sources",
    }),
    __metadata("design:type", Object)
], Options.prototype, "locales", void 0);
//# sourceMappingURL=options.js.map