import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem"
import config from "../config/config.json";
import localesConfig from "../config/locales.json";
import { ILocaleBase } from "@spt-aki/models/spt/server/ILocaleBase";


export const keyParent = "543be5e94bdc2df1348b4568"
export const moneyParent = "543be5dd4bdc2deb348b4569"
const chars = " abcdefghijklmnopqrstuvwxyz1234567890".split("")

export const difficulties = {
    "easy": { high: 100000, low: 0.8 },
    "medium": { high: 10, low: 5 },
    "hard": { high: 5, low: 10 },
    "masochist": { high: 2, low: 1000000 },
    "random": { high: 1000000000, low: 1000000000 },
}

export const stringToNum = (str: string) => {
    if (!str) return 0
    const loweredStr = str.toLowerCase()
    let result = 0
    for (let index = 0; index < loweredStr.length; index++) {
        const letter = loweredStr[index];
        const num = chars.indexOf(letter)
        if (num === -1) return
        result = (num) + result
    }
    // console.log(loweredStr, result)
    return result
}

export const replaceTextForQuest = (locales: ILocaleBase, refId: string, target: string, alternate: string, questId: string) => {
    const newId = refId + config.seed

    const enlocal = locales.global.en
    const itemNameId = `${target} Name`
    const itemDescriptionId = `${questId} description`
    const itemShortNameId = `${target} ShortName`
    const alternateNameId = `${alternate} Name`
    const alternateShortNameId = `${alternate} ShortName`
    const itemEnName = enlocal[itemNameId]
    const itemEnShortName = enlocal[itemShortNameId]
    const alternateEnName = enlocal[alternateNameId]
    const alternateEnShortName = enlocal[alternateShortNameId]

    const localValue = locales.global.en[refId]
    let type: "" | "handover" | "obtain" | "armor" | "find" = ""
    switch (true) {
        case localValue.includes("Hand over"):
            type = "handover"
            break;
        case localValue.includes("Find"):
            type = "find"
            break;
        case localValue.includes("% durability"):
            type = "armor"
            break;
        case localValue.includes("Obtain"):
            type = "obtain"
            break;
        default:
            console.warn("AlgorithmicQuestRandomizer:", locales.global.en[refId], "NOT Replaced:", localValue, itemEnShortName, itemEnName, alternateEnName, alternateEnShortName)
            break;
    }

    Object.keys(locales.global).forEach(language => {
        const local = locales.global[language]
        const alternateName = local[alternateNameId]
        const alternateShortName = local[alternateShortNameId]
        const questDescription = local[itemDescriptionId]
        const itemNameMulti = local[itemNameId]
        const itemShortNameMulti = local[itemShortNameId]

        if (questDescription.includes(itemNameMulti) || questDescription.includes(itemShortNameMulti)) {
            local[itemDescriptionId] = questDescription.replace(itemNameMulti, alternateName).replace(itemShortNameMulti, alternateShortName)
        }

        if (!local[refId] || !local[itemNameId] || !local[itemShortNameId] || !local[alternateNameId] || !local[alternateShortNameId]) {
            console.warn("AlgorithmicQuestRandomizer:", local[refId], "NOT Replaced for language:", locales.languages[language], "missing value: ", local[refId], local[itemNameId], local[itemShortNameId], local[alternateNameId], local[alternateShortNameId])
            return ""
        }

        const final = localesConfig?.[language]?.[type] || localesConfig?.["en"]?.[type]

        if (!type || !final) {
            console.log("AlgorithmicQuestRandomizer: There's likely an issue with the locales file.")
            return ""
        }

        const newValue = final.replace("<alternateName>", alternateName).replace("<alternateShortName>", alternateShortName)
        // language === "ru" && console.log(local[refId], newValue)
        local[newId] = newValue
    })

    return newId
}

// in order to work 'Math.seed' must NOT be undefined,
// so in any case, you HAVE to provide a Math.seed
export const seededRandom = (max: number, min: number, target?: string) => {
    const targetSeed = stringToNum(target)
    max = max || 1;
    min = min || 0;
    let seed = config.seed + targetSeed
    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;

    return Math.round(min + rnd * (max - min));
}


export const checkParentRecursive = (parentId: string, items: Record<string, ITemplateItem>, queryIds: string[]): boolean => {
    if (queryIds.includes(parentId)) return true
    if (!items?.[parentId]?._parent) return false

    return checkParentRecursive(items[parentId]._parent, items, queryIds)
}


