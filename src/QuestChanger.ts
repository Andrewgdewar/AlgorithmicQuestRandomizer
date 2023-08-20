import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { DependencyContainer } from "tsyringe";
import config from "../config/config.json";
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";
import { checkParentRecursive, keyParent, replaceTextForQuest, seededRandom } from "./utils";


export default function QuestChanger(
    container: DependencyContainer
): undefined {
    const tables = container.resolve<DatabaseServer>("DatabaseServer").getTables();
    const items = tables.templates.items;
    const quests = tables.templates.quests as unknown as Record<string, IQuest>;

    const locales = tables.locales
    const local = locales.global.en

    const loot = tables.loot.staticLoot
    const lootList = Object.values(loot).map(({ itemDistribution }) => itemDistribution).flat(1)



    const changeItems = {}
    const parentMapper = {} as Record<string, Record<string, number>>


    lootList.forEach(({ tpl, relativeProbability }) => {
        if (checkParentRecursive(tpl, items, [keyParent])) return;
        if (changeItems[tpl]) {
            changeItems[tpl] = changeItems[tpl] + relativeProbability
        } else {
            changeItems[tpl] = relativeProbability
        }

        if (parentMapper?.[items[tpl]._parent]?.[tpl]) {
            parentMapper[items[tpl]._parent][tpl] = parentMapper[items[tpl]._parent][tpl] + relativeProbability
        } else {
            parentMapper[items[tpl]._parent] = { ...parentMapper[items[tpl]._parent] || {}, [tpl]: relativeProbability }
        }
    })

    const getAlternate = (target: string, currentlyUsed: Set<string>, questId: string, parent: string) => {
        const itemsParent = items[target]._parent
        const itemsRarity = parentMapper[itemsParent][target]
        const alternates = Object.keys(parentMapper[itemsParent]).filter(itemId => {
            if (itemId === target || currentlyUsed.has(itemId + parent)) return false
            const rarity = parentMapper[itemsParent][itemId]
            return itemsRarity * 10 > rarity && rarity * 10 > itemsRarity
        })
        const alternateIndex = seededRandom(alternates.length - 1, 0, target + questId)
        return alternates[alternateIndex]
    }

    let numOfChangedItems = 0

    Object.keys(quests).forEach(questId => {
        const quest = quests[questId]
        if (quest && quest.type === "PickUp") {
            let changed = false

            const currentlyUsed = new Set([])
            quest.conditions?.AvailableForFinish.forEach(({ _props, _parent }, index) => {
                if (!_props?.target) return;
                const target = _props.target?.[0] || _props.target as string;

                if (changeItems[target]) {
                    const alternateId = getAlternate(target, currentlyUsed, questId, _parent)
                    if (!alternateId || !items[alternateId]) return config.debug && console.log('Not Changing Item: ', items[target]?._name, target)
                    const questReqId = replaceTextForQuest(local, _props.id, target, alternateId)
                    if (!questReqId) return config.debug && console.log('Not Changing Item: ', items[target]?._name, target)
                    const alternate = items[alternateId]._name
                    const current = items[target]._name
                    quests[questId].conditions.AvailableForFinish[index]._props.id = questReqId

                    if (typeof _props.target === "string") {
                        quests[questId].conditions.AvailableForFinish[index]._props.target = alternateId
                    } else {
                        quests[questId].conditions.AvailableForFinish[index]._props.target = _props.target.map(() => alternateId)
                    }

                    config.debug && console.log("Switching: ", current, "for", alternate, changeItems[target], changeItems[alternateId])

                    numOfChangedItems++
                    changed = true

                    currentlyUsed.add(alternateId + _parent)
                }
            })
            config.debug && changed && console.log(quest.QuestName.toUpperCase(), "\n")
        }
    })

    console.log('AlgorithmicQuestRandomizer: Successfully changed:', numOfChangedItems, "quest items with seed:", config.seed)
}