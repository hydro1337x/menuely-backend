import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersRepository } from './users.repository'
import { FilesModule } from '../files/files.module'
import { ConfigModule } from '@nestjs/config'
import appConfig from '../config/app.config'
import { MailModule } from '../mail/mail.module'
import { TokensModule } from '../tokens/tokens.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository]),
    ConfigModule.forFeature(appConfig),
    FilesModule,
    MailModule,
    TokensModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
