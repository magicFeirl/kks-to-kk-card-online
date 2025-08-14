import { filterPngFiles } from "."
import { isSubTypedArray, fileToUint8Array, stringToUint8Array, replaceAllSubTypedArray } from "./buffer"
import constants from "./constants"
/**
 * 判断文件是否是 KKS 角色卡
 * 
*/
export const isKKSCard = async (file) => {
    return isSubTypedArray(await fileToUint8Array(file), stringToUint8Array(constants.KKS_FEAT_STRING))
}

/**
 * 筛选 KKS 角色卡
 * 
*/
export const filterKKSCards = async (fileList) => {
    const result = []
    for (const file of filterPngFiles(fileList)) {
        if (await isKKSCard(file)) {
            result.push(file)
        }
    }

    return result
}

/**
 * 转为 KK 卡
 * 
*/
export const convertToKKCard = async (file) => {
    let bytes = await fileToUint8Array(file)
    
    const pairList = constants.KKS_TO_KK_REPLACE_PAIR_LIST.map(([a, b]) => [stringToUint8Array(a), stringToUint8Array(b)])
    for (const [search, replace] of pairList) {
        bytes = replaceAllSubTypedArray(bytes, search, replace)
    }

    return bytes
}
