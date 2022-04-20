import { Query, Resolver } from "@nestjs/graphql";
import { GraphCDNPurgeQuery } from "../../../lib";

@Resolver("Gql")
export class GqlResolver {
  @Query(() => String)
  @GraphCDNPurgeQuery(["allPosts"])
  async getHello() {
    return "Hello";
  }
}
