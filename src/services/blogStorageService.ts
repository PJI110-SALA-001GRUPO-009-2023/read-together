import { randomUUID } from 'crypto'
import * as config from '../config'
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'

const containerName = 'readtogether-images'
const storageUrl = config.URL_COM_TOKEN_SAS_AZURE_BLOB_STORAGE

const blobService = new BlobServiceClient(storageUrl)
const containerClient: ContainerClient = blobService.getContainerClient(containerName)

export async function createBlobInContainer(mimeType: string, data: string, moduleFrom: string) {
    console.log(moduleFrom)
    const fileType = mimeType.substring(mimeType.indexOf('/')+1)
    const blobClient = containerClient.getBlockBlobClient(`${randomUUID().toString()}${moduleFrom}.${fileType}`)
    const blobUrl = blobClient.url

    // set mimetype as determined from browser with file upload control
    const options = { blobHTTPHeaders: { blobContentType: mimeType } }

    // upload file
    await blobClient.uploadData(Buffer.from(data, 'base64'), options)
    return blobUrl
}

