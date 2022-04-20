import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { IGraphCDNPurgeInterceptorOptions } from "./graphcdn-purge.interface";
export declare class GraphCDNPurgeInterceptor implements NestInterceptor {
    private readonly options;
    private readonly reflector;
    private readonly logger;
    constructor(options?: IGraphCDNPurgeInterceptorOptions, reflector?: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    purgeQueries(queries: string[]): Promise<Boolean>;
}
