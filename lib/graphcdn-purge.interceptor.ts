import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import axios from "axios";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { IGraphCDNPurgeInterceptorOptions } from "./graphcdn-purge.interface";

@Injectable()
export class GraphCDNPurgeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GraphCDNPurgeInterceptor.name);

  constructor(
    private readonly options: IGraphCDNPurgeInterceptorOptions = {},
    private readonly reflector: Reflector = new Reflector()
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (data) => {
        const graphcdnQueries = this.reflector.get<string[]>(
          "graphcdn-purge-queries",
          context.getHandler()
        );

        if (graphcdnQueries) {
          await this.purgeQueries(graphcdnQueries);
        }

        return data;
      })
    );
  }

  /**
   * purge queries
   */
  async purgeQueries(queries: string[]): Promise<Boolean> {
    return new Promise(async (resolve) => {
      if (!this.options.serviceName || !this.options.purgeToken) {
        this.logger.error(`GraphCDN missing serviceName and purgeToken`);

        resolve(false);
        return;
      }

      try {
        const { data } = await axios.post(
          `https://admin.graphcdn.io/${this.options.serviceName}`,
          {
            query: `mutation {
            _purgeQuery(queries: [${queries.toString()}])
      }`,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "graphcdn-token": this.options.purgeToken,
            },
          }
        );

        if (data?.errors) {
          this.logger.error(
            `GraphCDN Purge Api Error: ${JSON.stringify(data.errors)}`
          );

          resolve(false);
          return;
        }

        this.logger.log(
          `Cache was successfully cleared for the quries: ${queries.toString()}`
        );

        resolve(true);
      } catch (e) {
        this.logger.error(`GraphCDN Purge Api Error: ${JSON.stringify(e)}`);

        resolve(false);
      }
    });
  }
}
