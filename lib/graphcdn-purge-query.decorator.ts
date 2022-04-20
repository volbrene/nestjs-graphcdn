import { SetMetadata } from "@nestjs/common";

export const GraphCDNPurgeQuery = (queries: string[]) =>
  SetMetadata("graphcdn-purge-queries", queries);
