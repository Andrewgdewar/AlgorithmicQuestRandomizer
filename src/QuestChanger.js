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
    const loot = tables.loot.staticLoot;
    const locales = tables.locales;
    const local = locales.global.en;
    const replaceTextForQuest = (refId, target, alternate) => {
        // const descriptionToReplace = `5967733e86f774602332fc84 description`
        const localValue = local[refId];
        const newId = refId + config_json_1.default.seed;
        // console.log(localValue)
        const itemNameId = `${target} Name`;
        const itemShortNameId = `${target} ShortName`;
        const alternateNameId = `${alternate} Name`;
        const alternateShortNameId = `${alternate} ShortName`;
        if (!local[refId] || !local[itemNameId] || !local[itemShortNameId] || !local[alternateNameId] || !local[alternateShortNameId]) {
            console.warn("AlgorithmicQuestRandomizer:", local[refId], "NOT Replaced, missing value:", local[refId], local[itemNameId], local[itemShortNameId], local[alternateNameId], local[alternateShortNameId]);
            return "";
        }
        const itemName = local[itemNameId];
        const itemShortName = local[itemShortNameId];
        const alternateName = local[alternateNameId];
        const alternateShortName = local[alternateShortNameId];
        const handover = `Hand over the ${alternateName} (${alternateShortName})`;
        const find = `Find ${alternateName} in raid`;
        const armorDura = `Obtain ${alternateName} in 0-50% durability`;
        const obtain = `Obtain ${alternateName}`;
        let final = "";
        switch (true) {
            case localValue.includes("Hand over the"):
                // console.log(/*localValue, "=", */handover)
                final = handover;
                break;
            case localValue.includes("Find"):
                // console.log(/*localValue, "=", */find)
                final = find;
                break;
            case localValue.includes("% durability"):
                // console.log(/*localValue, "=", */armorDura)
                final = armorDura;
                break;
            case localValue.includes("Obtain"):
                // console.log(/*localValue, "=", */obtain)
                final = obtain;
                break;
            default:
                console.warn("AlgorithmicQuestRandomizer:", local[refId], "NOT Replaced:", localValue, itemShortName, itemName, alternateName, alternateShortName);
                break;
        }
        if (!final)
            return "";
        locales.global.en[newId] = final;
        return newId;
    };
    // const configServer = container.resolve<ConfigServer>("ConfigServer");
    // const questConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.);
    // const therapist = tables.traders["54cb57776803fa99248b456e"]
    // console.log(JSON.stringify(therapist))
    // return
    // /JSON.stringify
    // Object.keys(local).filter(id => {
    //     if (local[id].includes("Salewa")) {
    //         console.log(id, local[id])
    //     }
    // })
    // return
    // const traderItems = new Set([])
    // traderList.forEach(({ base: { nickname }, questassort, assort: { items: tradItems, loyal_level_items, barter_scheme } = {}, }, index) => {
    //     if (!tradItems || !nickname) return
    //     tradItems.forEach(({ _tpl, _id, parentId, slotId, }) => {
    //         const item = items[_tpl]
    //         if (!item) return;
    //         const parent = item._parent
    //         if (!parent || !items[parent]) return console.log("AlgorithmicQuestChanger: Skipping custom item: ", _tpl, " for trader: ", nickname);
    //         const loyaltyLevel = loyal_level_items[_id] || loyal_level_items[parentId]
    //         //Set trader list for levels
    //         if (loyaltyLevel) {
    //             traderItems.add(_tpl)
    //         }
    //     })
    // })
    const changeItems = {};
    const parentMapper = {};
    const lootList = Object.values(loot).map(({ itemDistribution }) => itemDistribution).flat(1);
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
        const itemsParent = items[target]._parent;
        const itemsRarity = parentMapper[itemsParent][target];
        const alternates = Object.keys(parentMapper[itemsParent]).filter(itemId => {
            if (itemId === target || currentlyUsed.has(itemId + parent))
                return false;
            const rarity = parentMapper[itemsParent][itemId];
            return itemsRarity * 10 > rarity && rarity * 10 > itemsRarity;
        });
        const alternateIndex = (0, utils_1.seededRandom)(alternates.length - 1, 0, target + questId);
        return alternates[alternateIndex];
    };
    let numOfChangedItems = 0;
    Object.keys(quests).forEach(questId => {
        const quest = quests[questId];
        if (quest && quest.type === "PickUp") {
            let changed = false;
            // if (quest.QuestName === "Shortage") console.log(JSON.stringify(quest))
            const currentlyUsed = new Set([]);
            quest.conditions?.AvailableForFinish.forEach(({ _props, _parent }, index) => {
                if (!_props?.target)
                    return;
                const target = _props.target?.[0] || _props.target;
                if (changeItems[target]) {
                    const alternateId = getAlternate(target, currentlyUsed, questId, _parent);
                    if (!alternateId || !items[alternateId])
                        return config_json_1.default.debug && console.log('Not Changing Item: ', items[target]?._name, target);
                    const questReqId = replaceTextForQuest(_props.id, target, alternateId);
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
                    // _props.target.length > 1 && console.log(JSON.stringify(quest))
                    config_json_1.default.debug && console.log("Switching: ", current, "for", alternate, changeItems[target], changeItems[alternateId]);
                    numOfChangedItems++;
                    changed = true;
                    currentlyUsed.add(alternateId + _parent);
                }
            });
            config_json_1.default.debug && changed && console.log(quest.QuestName.toUpperCase(), "\n");
        }
    });
    console.log('AlgorithmicQuestRandomizer: Successfully changed:', numOfChangedItems, "quest items with seed:", config_json_1.default.seed);
}
exports.default = QuestChanger;
