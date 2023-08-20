"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDeep = exports.isObject = exports.cloneDeep = exports.deDupeArr = exports.createMatchingSimilarItemList = exports.checkParentRecursive = exports.seededRandom = exports.stringToNum = exports.mountParent = exports.chargeParent = exports.handguardParent = exports.barrelParent = exports.gasblockParent = exports.receiverParent = exports.muzzleParent = exports.pistolGripParent = exports.stockParent = exports.sightParent = exports.moneyParent = exports.masterMod = exports.modParent = exports.medsParent = exports.keyParent = exports.barterParent = exports.magParent = exports.ammoParent = exports.headwearParent = void 0;
const config_json_1 = __importDefault(require("../config/config.json"));
exports.headwearParent = "5a341c4086f77401f2541505";
exports.ammoParent = "5485a8684bdc2da71d8b4567";
exports.magParent = "5448bc234bdc2d3c308b4569";
exports.barterParent = "5448eb774bdc2d0a728b4567";
exports.keyParent = "543be5e94bdc2df1348b4568";
exports.medsParent = "543be5664bdc2dd4348b4569";
exports.modParent = "5448fe124bdc2da5018b4567";
exports.masterMod = "55802f4a4bdc2ddb688b4569";
exports.moneyParent = "543be5dd4bdc2deb348b4569";
exports.sightParent = "5448fe7a4bdc2d6f028b456b";
exports.stockParent = "55818a594bdc2db9688b456a";
exports.pistolGripParent = "55818a684bdc2ddd698b456d";
exports.muzzleParent = "5448fe394bdc2d0d028b456c";
exports.receiverParent = "55818a304bdc2db5418b457d";
exports.gasblockParent = "56ea9461d2720b67698b456f";
exports.barrelParent = "555ef6e44bdc2de9068b457e";
exports.handguardParent = "55818a104bdc2db9688b4569";
exports.chargeParent = "55818a104bdc2db9688b4569";
exports.mountParent = "55818b224bdc2dde698b456f";
const chars = " abcdefghijklmnopqrstuvwxyz1234567890".split("");
const stringToNum = (str) => {
    if (!str)
        return 0;
    const loweredStr = str.toLowerCase();
    let result = 0;
    for (let index = 0; index < loweredStr.length; index++) {
        const letter = loweredStr[index];
        const num = chars.indexOf(letter);
        if (num === -1)
            return;
        result = (num) + result;
    }
    // console.log(loweredStr, result)
    return result;
};
exports.stringToNum = stringToNum;
// in order to work 'Math.seed' must NOT be undefined,
// so in any case, you HAVE to provide a Math.seed
const seededRandom = (max, min, target) => {
    const targetSeed = (0, exports.stringToNum)(target);
    max = max || 1;
    min = min || 0;
    let seed = config_json_1.default.seed + targetSeed;
    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;
    return Math.round(min + rnd * (max - min));
};
exports.seededRandom = seededRandom;
const checkParentRecursive = (parentId, items, queryIds) => {
    if (queryIds.includes(parentId))
        return true;
    if (!items?.[parentId]?._parent)
        return false;
    return (0, exports.checkParentRecursive)(items[parentId]._parent, items, queryIds);
};
exports.checkParentRecursive = checkParentRecursive;
const createMatchingSimilarItemList = () => { };
exports.createMatchingSimilarItemList = createMatchingSimilarItemList;
const deDupeArr = (arr) => [...new Set(arr)];
exports.deDupeArr = deDupeArr;
const cloneDeep = (objectToClone) => JSON.parse(JSON.stringify(objectToClone));
exports.cloneDeep = cloneDeep;
const isObject = (item) => {
    return (item && typeof item === "object" && !Array.isArray(item));
};
exports.isObject = isObject;
const mergeDeep = (target, ...sources) => {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if ((0, exports.isObject)(target) && (0, exports.isObject)(source)) {
        for (const key in source) {
            if ((0, exports.isObject)(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                (0, exports.mergeDeep)(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return (0, exports.mergeDeep)(target, ...sources);
};
exports.mergeDeep = mergeDeep;
