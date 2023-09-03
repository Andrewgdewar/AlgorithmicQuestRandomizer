"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceTextForQuest = exports.difficulties = void 0;
const locales_json_1 = __importDefault(require("../../config/locales.json"));
const config_json_1 = __importDefault(require("../../config/config.json"));
exports.difficulties = {
    "easy": { high: 100000, low: 0.8 },
    "medium": { high: 10, low: 5 },
    "hard": { high: 5, low: 10 },
    "masochist": { high: 2, low: 1000000 },
    "random": { high: 1000000000, low: 1000000000 },
};
const replaceTextForQuest = (locales, refId, target, alternate, questId, props) => {
    const { minDurability, maxDurability } = props;
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
        if (!questDescription || !local[refId] || !local[itemNameId] || !local[itemShortNameId] || !local[alternateNameId] || !local[alternateShortNameId]) {
            console.warn("AlgorithmicQuestRandomizer:", local[refId], "NOT Replaced for language:", locales.languages[language], "missing value: ", local[refId], local[itemNameId], local[itemShortNameId], local[alternateNameId], local[alternateShortNameId]);
            return "";
        }
        if (questDescription?.includes(itemNameMulti) || questDescription.includes(itemShortNameMulti)) {
            local[itemDescriptionId] = questDescription.replaceAll(itemNameMulti, alternateName).replaceAll(itemShortNameMulti, alternateShortName);
        }
        const final = locales_json_1.default?.[language]?.[type] || locales_json_1.default?.["en"]?.[type];
        if (!type || !final) {
            console.log("AlgorithmicQuestRandomizer: There's likely an issue with the locales file.");
            return "";
        }
        const newValue = final.replace("<alternateName>", alternateName)
            .replace("<alternateShortName>", alternateShortName)
            .replace("<minDurability>", minDurability)
            .replace("<maxDurability>", maxDurability);
        local[newId] = newValue;
    });
    return newId;
};
exports.replaceTextForQuest = replaceTextForQuest;
