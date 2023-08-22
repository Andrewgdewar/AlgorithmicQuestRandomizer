"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("../config/config.json"));
const utils_1 = require("./utils");
function QuestChanger(container) {
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
    const getAlternate = (target, currentlyUsed, questId, parent) => {
        const { high, low } = utils_1.difficulties[config_json_1.default.difficulty];
        const itemsParent = items[target]._parent;
        const itemsRarity = parentMapper[itemsParent][target];
        const alternates = Object.keys(parentMapper[itemsParent]).filter(itemId => {
            if (itemId === target || currentlyUsed.has(itemId + parent))
                return false;
            const rarity = parentMapper[itemsParent][itemId];
            return itemsRarity * high > rarity && rarity * low > itemsRarity;
        });
        const alternateIndex = (0, utils_1.seededRandom)(alternates.length - 1, 0, target + questId);
        return alternates[alternateIndex];
    };
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
                if (changeItems[target] && !(0, utils_1.checkParentRecursive)(target, items, [utils_1.moneyParent])) {
                    const alternateId = getAlternate(target, currentlyUsed, questId, _parent);
                    if (!alternateId || !items[alternateId])
                        return config_json_1.default.debug && console.log('Not Changing Item: ', items[target]?._name, target);
                    const questReqId = (0, utils_1.replaceTextForQuest)(locales, _props.id, target, alternateId);
                    if (!questReqId)
                        return config_json_1.default.debug && console.log('Not Changing Item: ', items[target]?._name, target);
                    const alternate = items[alternateId]._name;
                    const current = items[target]._name;
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
                    config_json_1.default.debug && _parent === "HandoverItem" && console.log("Switching:", itemName, "====>", alternateName, changeItems[target], changeItems[alternateId]);
                    numOfChangedItems++;
                    changed = true;
                    currentlyUsed.add(alternateId + _parent);
                }
            }
        });
        config_json_1.default.debug && changed && console.log(quest.QuestName.toUpperCase(), "\n");
    });
    console.log('AlgorithmicQuestRandomizer: Successfully changed:', numOfChangedItems, "quest items with seed:", config_json_1.default.seed);
}
exports.default = QuestChanger;
