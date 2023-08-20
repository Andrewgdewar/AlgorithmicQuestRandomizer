import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem"
import config from "../config/config.json";


export const keyParent = "543be5e94bdc2df1348b4568"
const chars = " abcdefghijklmnopqrstuvwxyz1234567890".split("")

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

export const replaceTextForQuest = (local: Record<string, string>, refId: string, target: string, alternate: string) => {
    // const descriptionToReplace = `5967733e86f774602332fc84 description`
    const localValue = local[refId]
    const newId = refId + config.seed
    // console.log(localValue)
    const itemNameId = `${target} Name`
    const itemShortNameId = `${target} ShortName`
    const alternateNameId = `${alternate} Name`
    const alternateShortNameId = `${alternate} ShortName`

    if (!local[refId] || !local[itemNameId] || !local[itemShortNameId] || !local[alternateNameId] || !local[alternateShortNameId]) {
        console.warn("AlgorithmicQuestRandomizer:", local[refId], "NOT Replaced, missing value:", local[refId], local[itemNameId], local[itemShortNameId], local[alternateNameId], local[alternateShortNameId])
        return ""
    }

    const itemName = local[itemNameId]
    const itemShortName = local[itemShortNameId]
    const alternateName = local[alternateNameId]
    const alternateShortName = local[alternateShortNameId]

    const handover = `Hand over the ${alternateName} (${alternateShortName})`
    const find = `Find ${alternateName} in raid`
    const armorDura = `Obtain ${alternateName} in 0-50% durability`
    const obtain = `Obtain ${alternateName}`


    let final = ""
    switch (true) {
        case localValue.includes("Hand over the"):
            // console.log(/*localValue, "=", */handover)
            final = handover
            break;
        case localValue.includes("Find"):
            // console.log(/*localValue, "=", */find)
            final = find
            break;
        case localValue.includes("% durability"):
            // console.log(/*localValue, "=", */armorDura)
            final = armorDura
            break;
        case localValue.includes("Obtain"):
            // console.log(/*localValue, "=", */obtain)
            final = obtain
            break;
        default:
            console.warn("AlgorithmicQuestRandomizer:", local[refId], "NOT Replaced:", localValue, itemShortName, itemName, alternateName, alternateShortName)
            break;
    }
    if (!final) return ""
    local[newId] = final
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


