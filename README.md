## Menuely backend

Graduate thesis project backend application created to modernize the process of menu creation and orders in hospitality facilities

## Description

The application enables login and registration of users and restaurants as separate entities. Restaurants have the ability to create, update and delete menus. Each menu can have its categories and each category can have products. By creating a menu QR codes are sent to the restaurants registered email address. The amount of QR codes should be equal to the number of tables a restaurant has. Users may be invited by restaurants to become a member of their working staff. Users may also scan QR codes to browse a restaurants offers list and create an order. Orders are marked as pending until a member of the restaurants staff accepts it. Both entities have the ability to extensively edit their profiles.

## Technologies

- [Nest](https://github.com/nestjs/nest)
- [TypeScript](https://www.typescriptlang.org/)
- [Amazon S3](https://aws.amazon.com/s3/)
- [Mailtrap](https://mailtrap.io/)
- [Docker](https://www.docker.com/)
- [Heroku](https://devcenter.heroku.com/articles/container-registry-and-runtime)

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

The application is currently being hosted on Heroku and its API consumed by the [iOS application](https://github.com/hydro1337x/menuely-ios)
