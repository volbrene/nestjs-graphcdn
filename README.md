<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://kamilmysliwiec.com/public/nest-logo.png#1" alt="Nest Logo" />   </a>
  <a href="https://graphcdn.io" target="_blank"><img src="https://lever-client-logos.s3.us-west-2.amazonaws.com/1edec3d1-1149-485d-8a88-8c897c5c84ca-1624441726076.png" width="380"></a>
</p>

<p align="center">GraphCDN Module for Nest framework</p>

<p align="center">
<a href="https://www.npmjs.com/package/nestjs-graphcdn"><img src="https://img.shields.io/npm/v/nestjs-graphcdn.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nestjs-graphcdn"><img src="https://img.shields.io/npm/l/nestjs-graphcdn.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nestjs-graphcdn"><img src="https://img.shields.io/npm/dm/nestjs-graphcdn.svg" alt="NPM Downloads" /></a>
</p>

## Description

This's a module for [Nest](https://github.com/nestjs/nest) to handle the purge api from [GraphCDN](https://graphcdn.io/).

## Installation

```bash
$ npm i --save nestjs-graphcdn
```

## Quick Start

### Using purge Interceptor

> app.controller.ts

```ts
  @UseInterceptors(new GraphCDNPurgeInterceptor({
        serviceName: "<service-name>",
        purgeToken: "<token>",
  }))
  @Get('/some/route')
  public async someRoute() {
    ...
  }
```

#### Global

If you want to set up interceptor as global, you have to follow Nest
instructions [here](https://docs.nestjs.com/interceptors). Something like
this.

> app.module.ts

```ts
import { APP_INTERCEPTOR } from "@nestjs/core";
import { GraphCDNPurgeInterceptor } from "nestjs-graphcdn";

@Module({
  imports: [RavenModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new GraphCDNPurgeInterceptor({
        serviceName: "<service-name>",
        purgeToken: "<token>",
      }),
    },
  ],
})
export class ApplicationModule {}
```

### Use purge decorator

To purge some queries you can now use the `GraphCDNPurgeQuery` decorator.

> app.controller.ts

```ts
import { GraphCDNPurgeQuery } from "nestjs-graphcdn"

  @Get('/some/route')
  @GraphCDNPurgeQuery(["allPosts"])
  public async someRoute()
    ...
  }
```
