"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphCDNPurgeQuery = void 0;
const common_1 = require("@nestjs/common");
const GraphCDNPurgeQuery = (queries) => (0, common_1.SetMetadata)("graphcdn-purge-queries", queries);
exports.GraphCDNPurgeQuery = GraphCDNPurgeQuery;
