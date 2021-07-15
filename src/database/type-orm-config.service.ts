import { Inject, Injectable } from '@nestjs/common'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import databaseConfig from '../database/config/database.config'
import appConfig from '../config/app.config'
import { ConfigType } from '@nestjs/config'
import { Environment } from '../config/enums/environment.enum'

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(databaseConfig.KEY)
    private readonly databaseConfiguration: ConfigType<typeof databaseConfig>,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>
  ) {}

  private readonly productionOptions: TypeOrmModuleOptions = {
    type: 'postgres',
    host: '/cloudsql/' + this.databaseConfiguration.cloudSqlConnectionName,
    username: this.databaseConfiguration.databaseUser,
    password: this.databaseConfiguration.databasePassword,
    database: this.databaseConfiguration.databaseName,
    autoLoadEntities: true,
    synchronize: true
  }

  private readonly developmentOptions: TypeOrmModuleOptions = {
    type: 'postgres',
    host: this.databaseConfiguration.databaseHost,
    port: this.databaseConfiguration.databasePort,
    username: this.databaseConfiguration.databaseUser,
    password: this.databaseConfiguration.databasePassword,
    database: this.databaseConfiguration.databaseName,
    autoLoadEntities: true,
    synchronize: true
  }

  createTypeOrmOptions(
    connectionName?: string
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return this.appConfiguration.nodeEnv === Environment.PRODUCTION
      ? this.productionOptions
      : this.developmentOptions
  }
}
