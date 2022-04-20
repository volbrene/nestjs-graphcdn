import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { GraphCDNPurgeInterceptor, GraphCDNPurgeQuery } from "../../lib";

@Controller()
@UseInterceptors(new GraphCDNPurgeInterceptor())
export class AppController {
  @Get()
  @GraphCDNPurgeQuery(["allPosts"])
  getHello(): string {
    return "Hello";
  }
}
