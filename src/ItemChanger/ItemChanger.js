"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("../../config/config.json"));
const utils_1 = require("../utils");
const ItemChangerUtils_1 = require("./ItemChangerUtils");
const fs = require("fs");
function ItemChanger(container) {
    const tables = container.resolve("DatabaseServer").getTables();
    const items = tables.templates.items;
    const quests = tables.templates.quests;
    const locales = tables.locales;
    const local = locales.global.en;
    const loot = tables.loot.staticLoot;
    const lootList = Object.values(loot).map(({ itemDistribution }) => itemDistribution).flat(1);
    const changeItems = {};
    const parentMapper = {};
    lootList.forEach(({ tpl, relativeProbability }) => {
        if ((0, utils_1.checkParentRecursive)(tpl, items, [utils_1.keyParent]))
            return;
        if (changeItems[tpl]) {
            changeItems[tpl] = changeItems[tpl] + relativeProbability;
        }
        else {
            changeItems[tpl] = relativeProbability;
        }
        if (parentMapper?.[items[tpl]._parent]?.[tpl]) {
            parentMapper[items[tpl]._parent][tpl] = parentMapper[items[tpl]._parent][tpl] + relativeProbability;
        }
        else {
            parentMapper[items[tpl]._parent] = { ...parentMapper[items[tpl]._parent] || {}, [tpl]: relativeProbability };
        }
    });
    const getAlternate = (target, currentlyUsed, questId, parent, value) => {
        let quantity = Number(value);
        const { high, low } = ItemChangerUtils_1.difficulties[config_json_1.default.difficulty];
        const itemsParent = items[target]._parent;
        const itemsRarity = parentMapper[itemsParent][target];
        const alternates = Object.keys(parentMapper[itemsParent]).filter(itemId => {
            if (itemId === target || currentlyUsed.has(itemId + parent))
                return false;
            const rarity = parentMapper[itemsParent][itemId];
            return itemsRarity * high > rarity && rarity * low > itemsRarity;
        });
        const alternateIndex = (0, utils_1.seededRandom)(alternates.length - 1, 0, target + questId);
        const alternateId = alternates[alternateIndex];
        const alternateRarity = changeItems[alternateId];
        let newCount = quantity * (alternateRarity / itemsRarity);
        if (newCount > (quantity * config_json_1.default.maxQuantityModifier))
            newCount = quantity * config_json_1.default.maxQuantityModifier;
        if (newCount < 1 /* || checkParentRecursive(parent, items, [""])*/)
            newCount = 1;
        return { alternateId, quantity: Math.round(newCount) };
    };
    let fixedVisibilityRefs = 0;
    let numOfChangedItems = 0;
    Object.keys(quests).forEach(questId => {
        const quest = quests[questId];
        let changed = false;
        const currentlyUsed = new Set([]);
        quest.conditions?.AvailableForFinish.forEach(({ _props, _parent }, index) => {
            if (_parent === "FindItem" || _parent === "HandoverItem") {
                if (!_props?.target)
                    return;
                const target = _props.target?.[0] || _props.target;
                if (changeItems[target] && !(0, utils_1.checkParentRecursive)(target, items, [utils_1.moneyParent, utils_1.armorParent])) {
                    const { alternateId, quantity } = getAlternate(target, currentlyUsed, questId, _parent, Number(_props.value));
                    if (!alternateId || !items[alternateId])
                        return config_json_1.default.debug && console.log('Not Changing Item: ', items[target]?._name, target);
                    const questReqId = (0, ItemChangerUtils_1.replaceTextForQuest)(locales, _props.id, target, alternateId, questId, _props);
                    if (!questReqId)
                        return config_json_1.default.debug && console.log('Not Changing Item: ', items[target]?._name, target);
                    const propsIdCopy = _props.id;
                    quests[questId].conditions.AvailableForFinish[index]._props.id = questReqId;
                    if (typeof _props.target === "string") {
                        quests[questId].conditions.AvailableForFinish[index]._props.target = alternateId;
                    }
                    else {
                        quests[questId].conditions.AvailableForFinish[index]._props.target = _props.target.map(() => alternateId);
                    }
                    const itemShortNameId = `${target} Name`;
                    const alternateNameId = `${alternateId} Name`;
                    const itemName = local[itemShortNameId];
                    const alternateName = local[alternateNameId];
                    if (config_json_1.default.debug && _parent === "HandoverItem") {
                        console.log("Switching:", itemName, Number(_props.value), "====>", quantity, alternateName, changeItems[target], changeItems[alternateId]);
                    }
                    quests[questId].conditions.AvailableForFinish[index]._props.value = quantity.toString();
                    quest.conditions?.AvailableForFinish.forEach(({ _props: { visibilityConditions } }, internalIndex) => {
                        if (internalIndex === index || !visibilityConditions)
                            return;
                        visibilityConditions.forEach((condition, conditionIndex) => {
                            if (condition?._props?.target.includes(propsIdCopy)) {
                                fixedVisibilityRefs++;
                                quest.conditions.AvailableForFinish[internalIndex]._props.visibilityConditions[conditionIndex]._props.target = questReqId;
                            }
                        });
                    });
                    numOfChangedItems++;
                    changed = true;
                    currentlyUsed.add(alternateId + _parent);
                }
            }
        });
    });
    console.log('AlgorithmicQuestRandomizer: Successfully changed:', numOfChangedItems, "quest items with seed:", config_json_1.default.seed);
}
exports.default = ItemChanger;
