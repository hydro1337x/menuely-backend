import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './global/interceptors/transform.interceptor'
import { NestExpressApplication } from '@nestjs/platform-express'
import { resolve } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  })

  app.useGlobalInterceptors(new TransformInterceptor())

  app.useStaticAssets(resolve('./src/public'))
  app.setBaseViewsDir([resolve('./src/auth/views')])
  app.setViewEngine('hbs')

  await app.listen(parseInt(process.env.PORT))

  console.log('Application is listening on port: ', await app.getUrl())
}

bootstrap()
