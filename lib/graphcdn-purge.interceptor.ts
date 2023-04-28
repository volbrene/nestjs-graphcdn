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

        const graphcdnType = this.reflector.get<{
          type: string;
          idReference: string | number;
        }>("graphcdn-purge-type", context.getHandler());

        if (graphcdnQueries) {
          await this.purgeQueries(graphcdnQueries);
        }

        if (graphcdnType?.type) {
          await this.purgeType(
            graphcdnType?.type,
            graphcdnType?.idReference,
            data
          );
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
      const query = `mutation { _purgeQuery(queries: [${queries.join(",")}]) }`;

      const successfull = await this.sendPurgeRequest(query);

      if (successfull)
        this.logger.log(
          `Cache was successfully cleared for the queries: ${queries.join(",")}`
        );

      resolve(true);
    });
  }

  /**
   * purge type
   */
  async purgeType(
    type: string,
    idReference: string | number,
    data: any
  ): Promise<Boolean> {
    return new Promise(async (resolve) => {
      if (idReference && !data[idReference]) {
        this.logger.error(
          `GraphCDN Purge Error: Id reference "${idReference}" not found in response object!`
        );

        resolve(false);
        return;
      }

      const id = idReference && data[idReference];
      const purgeMutationName = `purge${
        type.toString().charAt(0).toUpperCase() + type.toString().slice(1)
      }`;
      const query = `mutation {
          ${purgeMutationName}${id ? `(id: ["${id.toString()}"])` : ""}
        }`;

      const successfull = await this.sendPurgeRequest(query);

      if (successfull)
        this.logger.log(
          `Cache was successfully cleared for the type: ${type.toString()}${
            id ? ` | ID: ${id.toString()}` : ""
          }`
        );

      resolve(true);
    });
  }

  /**
   *
   * @param query
   * @returns
   */
  private async sendPurgeRequest(query: string) {
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
            query,
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

        resolve(true);
      } catch (e) {
        this.logger.error(`GraphCDN Purge Api Error: ${JSON.stringify(e)}`);

        resolve(false);
      }
    });
  }
}
