import { registerAs } from '@nestjs/config'

export default registerAs('files', () => ({
  awsAccessKeyID: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME
}))
