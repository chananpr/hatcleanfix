const { DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const { s3Client, S3_BUCKET, getPublicUrl } = require('../config/s3')

/**
 * S3 Service - file management operations
 */

/**
 * Parse uploaded files from multer-s3 response
 * @param {Array} files - multer files array
 * @returns {Array} formatted file objects
 */
const parseUploadedFiles = (files) => {
  if (!files || !files.length) return []
  return files.map(file => ({
    key: file.key,
    url: getPublicUrl(file.key),
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  }))
}

/**
 * Delete a file from S3
 * @param {string} key - S3 object key
 */
const deleteFile = async (key) => {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key
  }))
}

/**
 * Delete multiple files from S3
 * @param {Array<string>} keys - array of S3 object keys
 */
const deleteFiles = async (keys) => {
  await Promise.all(keys.map(key => deleteFile(key)))
}

/**
 * List files in a folder
 * @param {string} prefix - folder prefix (e.g., 'orders/123/')
 * @returns {Array} list of objects
 */
const listFiles = async (prefix) => {
  const result = await s3Client.send(new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: prefix
  }))
  return (result.Contents || []).map(obj => ({
    key: obj.Key,
    url: getPublicUrl(obj.Key),
    size: obj.Size,
    lastModified: obj.LastModified
  }))
}

module.exports = { parseUploadedFiles, deleteFile, deleteFiles, listFiles, getPublicUrl }
