<script setup>
import { ref, watch, computed } from 'vue'

import { saveAs } from 'file-saver'
import JSZip from 'jszip'

import { byteToMbSize, filterPngFiles } from './utils'
import { convertToKKCard, filterKKSCards } from './utils/kk'



const uploadRef = ref()
const _fileList = ref([])
const convertedFiles = ref([])
const fileList = computed({
  set(value) {
    _fileList.value = filterPngFiles(value)
  },
  get() {
    return _fileList.value
  }
})

const dropover = ref(false)
const pngFileList = ref([])

const isAllConverted = computed(() => convertedFiles.value.length === pngFileList.value.length && pngFileList.value.length != 0)

watch(() => fileList.value, async () => {
  pngFileList.value = await filterKKSCards(fileList.value)
}, { deep: true })

const cardsCount = computed(() => {
  return pngFileList.value.length
})

const _fileInfoList = ref()

const fileInfoList = computed({
  set(value) {
    _fileInfoList.value = value
  },
  get() {
    return pngFileList.value.map(file => {
      const { name, size } = file
      const url = URL.createObjectURL(file)
      return { name, size: byteToMbSize(size), url, converted: false }
    })
  }
})

const handleCleanFile = () => {
  fileList.value = []
  convertedFiles.value = []
}

const handleOpenUploadDialog = () => {
  uploadRef?.value.click()
}

const handleDropFile = (e) => {
  const { dataTransfer: { files } = { files: [] } } = e
  fileList.value.push(...files)
}

const handleUploadFile = () => {
  fileList.value.push(...(uploadRef?.value?.files || []))
  uploadRef.value.value = ''
}

const handleConvertToKKCard = async () => {
  if (!pngFileList.value.length) {
    return handleOpenUploadDialog()
  }

  convertedFiles.value = []
  for (const file of pngFileList.value) {
    convertedFiles.value.push({
      blob: new Blob([await convertToKKCard(file)], { type: 'image/png' }),
      name: '[KK]_' + file.name
    })

    const item = fileInfoList.value.find(f => f.name === file.name)
    if (item) {
      item.converted = true
    }
  }
}

const handleDownloadAsZip = () => {
  const zip = new JSZip()
  const zipFilename = convertedFiles.value.map(file => file.name.replace('[KK]', '')).join(',')

  convertedFiles.value.forEach(file => {
    zip.file(file.name, file.blob)
  })

  zip.generateAsync({ type: "blob" })
    .then(function (content) {
      saveAs(content, zipFilename + ".zip");
    });
}
const handleDownload = () => {
  convertedFiles.value.forEach(file => {
    saveAs(file.blob, file.name)
  })
}
</script>

<template>
  <div class="container">
    <div :class="{ active: dropover }" class="droparea" @dragover.prevent="dropover = true"
      @dragleave="dropover = false" @drop.prevent="handleDropFile" @click="handleOpenUploadDialog">
      <div class="droparea-inner">
        <p style="font-size: 1.2rem; font-weight: bold;">Drop or click to upload card</p>
        <p>All operations are completed locally, and no files will be uploaded to the server.</p>
        <p>所有操作均在本地完成，不会有文件被上传到服务器</p>
        <input @change="handleUploadFile" multiple ref="uploadRef" type="file" class="droparea-file"
          accept="png,image/png"></input>
      </div>
    </div>

    <div class="convert">
      <button v-if="!isAllConverted" @click="handleConvertToKKCard" class="button convert-button button__primary">
        Convert to Koikatsu Card<span v-if="cardsCount">({{ cardsCount }})</span>
      </button>
      <div class="download" v-if="convertedFiles.length && isAllConverted">
        <button @click="handleDownloadAsZip" class="button zip-button button__primary">
          Download as ZIP
        </button>
        <button @click="handleDownload" class="button download-button button__secondary">
          Download
        </button>
      </div>

      <button @click="handleCleanFile" class="button clean-button button__secondary">
        Clean
      </button>
    </div>

    <ul class="file-list">
      <li class="file-list-title" :class="{ active: cardsCount > 0 }">
        <p>
          Found {{ cardsCount }} KKS Cards
        </p>
      </li>

      <li v-for="info in fileInfoList" :key="info.name" class="file-list-item" :class="{ converted: info.converted }">
        <div class="file-image-wrapper">
          <img :src="info.url"></img>
        </div>
        <div class="file-item-info">
          <span>{{ info.converted ? '[KK]' : '' }} {{ info.name }} {{ info.size }}MB</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  width: 100%;
  margin-top: 10vh;

  flex-flow: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;

  .droparea,
  .file-list {
    max-width: 60%;
    width: 60%;
  }

  .droparea,
  .droparea-inner {
    transition: 0.2s ease;
  }

  .droparea-inner {
    display: flex;
    flex-flow: column;
    font-size: 14px;

    p {
      margin: 0.5rem 0 0 0;
    }
  }

  .droparea.active,
  .droparea.active .droparea-inner,
  .droparea:hover,
  .droparea:hover .droparea-inner {
    border-color: #39b5e7;
    color: #39b5e7 !important;
  }

  .download {
    margin-bottom: 20px;

    .zip-button {
      background-color: #67C142;
    }

    .download-button {
      background-color: #EEBE79;
      color: white;
    }
  }

  .convert {
    display: flex;

    .convert-button {
      width: 20rem;
    }

    .download-button,
    .zip-button {
      width: 11rem;
    }

    .clean-button {
      width: 8rem;
    }
  }

  .droparea {
    height: 40vh;
    border: 2px dotted #ccc;
    margin-bottom: 20px;
    border-radius: 5px;

    .droparea-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #ccc;
    }

    .droparea-file {
      display: none;
    }
  }

  .file-list {
    padding: 0;
    list-style: none;
    margin: 20px 0 40px 0;

    display: grid;
    grid-template-columns: repeat(4, 25%);
    gap: 20px 10px;

    img {
      border-radius: 5px;
    }

    .file-list-title {
      grid-column: 1 / span 4;
      font-size: 0.9rem;
      font-weight: bold;
      color: #E3E5E7;

      &.active {
        color: black;
      }
    }

    .file-image-wrapper {
      width: 100%;
      height: calc(100% - 1rem);

      img {
        object-fit: contain;
        width: 100%;
        height: 100%;
      }
    }

    .file-item-info {
      background-color: #F8F9F9;
      color: black;
      font-size: 0.8rem;
      text-align: center;
      padding: 2px;
      font-weight: bold;
      margin-top: 2px;
    }

    .file-list-item {
      max-height: 300px;
    }

    .file-list-item.converted .file-item-info {
      color: white;
      border-radius: 5px;

      background-color: #39b5e7;
    }
  }
}
</style>
