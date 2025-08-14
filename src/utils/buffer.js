/**
 * 搜索 subBuffer 在 buffer 的下表，其中 subBuffer 必须完全是 buffer 的子集
 * 
*/
export const searchSubTypedArrayIndex = (buffer, subBuffer) => {
    let lastIndex = 0

    do {
        let find = true
        lastIndex = buffer.indexOf(subBuffer[0], lastIndex)

        if (subBuffer.length === 1) {
            return buffer[lastIndex] === subBuffer[0] ? lastIndex : -1
        }

        for (let i = 1, j = subBuffer.length; i < j; i++) {
            if (buffer[lastIndex + i] !== subBuffer[i]) {
                find = false
                break
            }
        }

        if (find) {
            return lastIndex
        }

        lastIndex += 1
    } while (lastIndex > 0)

    return lastIndex - 1
}

export const isSubTypedArray = (buffer, subBuffer) => {
    return searchSubTypedArrayIndex(buffer, subBuffer) > -1
}

/**
 * 文件转 bytes
 */
export const fileToUint8Array = async (file) => {
    return new Uint8Array(await file.arrayBuffer())
}

/**
 * 字符串转 bytes
 * */
export const stringToUint8Array = (str) => {
    const buffer = new Uint8Array(str.length)

    for (let i = 0; i < str.length; i++) {
        buffer.set([str.charCodeAt(i)], i)
    }

    return buffer
}

/**
 * 替换 Buffer 的内容
 * */
export const replaceAllSubTypedArray = (buffer, searchValue, replaceValue) => {
    let lastIndex
    const newBuffer = []

    do {
        lastIndex = searchSubTypedArrayIndex(buffer, searchValue)

        if (lastIndex < 0) {
            break
        }

        newBuffer.push(buffer.slice(0, lastIndex))
        newBuffer.push(replaceValue)
        buffer = buffer.slice(lastIndex + searchValue.length)
    } while (lastIndex != -1)
    newBuffer.push(buffer)

    const length = newBuffer.map(buffer => buffer.length).reduce((a, b) => a + b, 0)
    const newBufferBytes = new Uint8Array(length)

    let offset = 0
    for (const buffer of newBuffer) {
        newBufferBytes.set(buffer, offset)
        offset += buffer.length
    }

    return newBufferBytes
}
