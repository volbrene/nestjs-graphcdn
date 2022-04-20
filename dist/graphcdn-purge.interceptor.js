"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GraphCDNPurgeInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphCDNPurgeInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const axios_1 = __importDefault(require("axios"));
const operators_1 = require("rxjs/operators");
let GraphCDNPurgeInterceptor = GraphCDNPurgeInterceptor_1 = class GraphCDNPurgeInterceptor {
    constructor(options = {}, reflector = new core_1.Reflector()) {
        this.options = options;
        this.reflector = reflector;
        this.logger = new common_1.Logger(GraphCDNPurgeInterceptor_1.name);
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.tap)((data) => __awaiter(this, void 0, void 0, function* () {
            const graphcdnQueries = this.reflector.get("graphcdn-purge-queries", context.getHandler());
            if (graphcdnQueries) {
                yield this.purgeQueries(graphcdnQueries);
            }
            return data;
        })));
    }
    purgeQueries(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (!this.options.serviceName || !this.options.purgeToken) {
                    this.logger.error(`GraphCDN missing serviceName and purgeToken`);
                    resolve(false);
                    return;
                }
                try {
                    const { data } = yield axios_1.default.post(`https://admin.graphcdn.io/${this.options.serviceName}`, {
                        query: `mutation {
            _purgeQuery(queries: [${queries.toString()}])
      }`,
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                            "graphcdn-token": this.options.purgeToken,
                        },
                    });
                    if (data === null || data === void 0 ? void 0 : data.errors) {
                        this.logger.error(`GraphCDN Purge Api Error: ${JSON.stringify(data.errors)}`);
                        resolve(false);
                        return;
                    }
                    this.logger.log(`Cache was successfully cleared for the quries: ${queries.toString()}`);
                    resolve(true);
                }
                catch (e) {
                    this.logger.error(`GraphCDN Purge Api Error: ${JSON.stringify(e)}`);
                    resolve(false);
                }
            }));
        });
    }
};
GraphCDNPurgeInterceptor = GraphCDNPurgeInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, core_1.Reflector])
], GraphCDNPurgeInterceptor);
exports.GraphCDNPurgeInterceptor = GraphCDNPurgeInterceptor;
