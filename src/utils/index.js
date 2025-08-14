/**
 * 移除重复文件
 * 
*/
export const RmDuplicatedFiles = (fileList) => {
    const getFileHash = (file) => {
        const hash = ['type', 'size', 'name', 'lastModified'].map(key => `${key}:${file[key] || ""}`).join(', ')

        return hash
    }

    return fileList.filter((file, index) => {
        const hash = getFileHash(file)
        return fileList.findIndex(file => hash === getFileHash(file)) === index
    })
}

/**
 * 根据后缀筛选文件
 * 
*/
export const filterFileByType = (fileList, ext) => {
    fileList = RmDuplicatedFiles(fileList)

    return fileList.filter(file => file && file.type.endsWith(ext))
}

/**
 * 筛选 PNG 文件
 * 
*/
export const filterPngFiles = (fileList) => {
    return filterFileByType(fileList, 'png')
}

export const byteToMbSize = (n) => {
    return (n / 1024 / 1024).toFixed(2)
}