import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './global/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalInterceptors(new TransformInterceptor())

  await app.listen(parseInt(process.env.PORT), () => {
    console.log('App listening on port: ', process.env.PORT)
  })
}

bootstrap()
