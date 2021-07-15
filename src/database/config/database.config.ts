import { registerAs } from '@nestjs/config'

export default registerAs('database', () => ({
  cloudSqlConnectionName: process.env.CLOUD_SQL_CONNECTION_NAME,
  databaseHost: process.env.DATABASE_HOST,
  databasePort: parseInt(process.env.DATABASE_PORT),
  databaseUser: process.env.DATABASE_USER,
  databasePassword: process.env.DATABASE_PASSWORD,
  databaseName: process.env.DATABASE_NAME
}))
