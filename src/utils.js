"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkParentRecursive = exports.seededRandom = exports.replaceTextForQuest = exports.stringToNum = exports.difficulties = exports.moneyParent = exports.keyParent = void 0;
const config_json_1 = __importDefault(require("../config/config.json"));
const locales_json_1 = __importDefault(require("../config/locales.json"));
exports.keyParent = "543be5e94bdc2df1348b4568";
exports.moneyParent = "543be5dd4bdc2deb348b4569";
const chars = " abcdefghijklmnopqrstuvwxyz1234567890".split("");
exports.difficulties = {
    "easy": { high: 100000, low: 0.8 },
    "medium": { high: 10, low: 5 },
    "hard": { high: 5, low: 10 },
    "masochist": { high: 2, low: 1000000 },
    "random": { high: 1000000000, low: 1000000000 },
};
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
const replaceTextForQuest = (locales, refId, target, alternate, questId) => {
    const newId = refId + config_json_1.default.seed;
    const enlocal = locales.global.en;
    const itemNameId = `${target} Name`;
    const itemDescriptionId = `${questId} description`;
    const itemShortNameId = `${target} ShortName`;
    const alternateNameId = `${alternate} Name`;
    const alternateShortNameId = `${alternate} ShortName`;
    const itemEnName = enlocal[itemNameId];
    const itemEnShortName = enlocal[itemShortNameId];
    const alternateEnName = enlocal[alternateNameId];
    const alternateEnShortName = enlocal[alternateShortNameId];
    const localValue = locales.global.en[refId];
    let type = "";
    switch (true) {
        case localValue.includes("Hand over"):
            type = "handover";
            break;
        case localValue.includes("Find"):
            type = "find";
            break;
        case localValue.includes("% durability"):
            type = "armor";
            break;
        case localValue.includes("Obtain"):
            type = "obtain";
            break;
        default:
            console.warn("AlgorithmicQuestRandomizer:", locales.global.en[refId], "NOT Replaced:", localValue, itemEnShortName, itemEnName, alternateEnName, alternateEnShortName);
            break;
    }
    Object.keys(locales.global).forEach(language => {
        const local = locales.global[language];
        const alternateName = local[alternateNameId];
        const alternateShortName = local[alternateShortNameId];
        const questDescription = local[itemDescriptionId];
        const itemNameMulti = local[itemNameId];
        const itemShortNameMulti = local[itemShortNameId];
        if (questDescription.includes(itemNameMulti) || questDescription.includes(itemShortNameMulti)) {
            local[itemDescriptionId] = questDescription.replace(itemNameMulti, alternateName).replace(itemShortNameMulti, alternateShortName);
        }
        if (!local[refId] || !local[itemNameId] || !local[itemShortNameId] || !local[alternateNameId] || !local[alternateShortNameId]) {
            console.warn("AlgorithmicQuestRandomizer:", local[refId], "NOT Replaced for language:", locales.languages[language], "missing value: ", local[refId], local[itemNameId], local[itemShortNameId], local[alternateNameId], local[alternateShortNameId]);
            return "";
        }
        const final = locales_json_1.default?.[language]?.[type] || locales_json_1.default?.["en"]?.[type];
        if (!type || !final) {
            console.log("AlgorithmicQuestRandomizer: There's likely an issue with the locales file.");
            return "";
        }
        const newValue = final.replace("<alternateName>", alternateName).replace("<alternateShortName>", alternateShortName);
        // language === "ru" && console.log(local[refId], newValue)
        local[newId] = newValue;
    });
    return newId;
};
exports.replaceTextForQuest = replaceTextForQuest;
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
