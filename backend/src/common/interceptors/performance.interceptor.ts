import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Log slow requests (> 1000ms)
        if (duration > 1000) {
          this.logger.warn(
            `Slow request: ${method} ${url} took ${duration}ms`,
          );
        }

        // Add performance header
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Response-Time', `${duration}ms`);
      }),
    );
  }
}
