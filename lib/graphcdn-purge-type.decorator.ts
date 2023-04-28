import { SetMetadata } from "@nestjs/common";

export const GraphCDNPurgeType = (type: string, idReference?: string) =>
  SetMetadata("graphcdn-purge-type", { type, idReference });
