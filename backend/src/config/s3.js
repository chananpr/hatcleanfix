const { S3Client } = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'hatfixclean-media'
const S3_REGION = process.env.AWS_REGION || 'ap-southeast-1'

const getPublicUrl = (key) =>
  `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`

module.exports = { s3Client, S3_BUCKET, S3_REGION, getPublicUrl }
