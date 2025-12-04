import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  details?: any;
}

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ type: ApiErrorDto, required: false })
  error?: ApiErrorDto;

  @ApiProperty({ required: false })
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export function createSuccessResponse<T>(data: T, meta?: any): ApiResponseDto<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

export function createErrorResponse(code: string, message: string, details?: any): ApiResponseDto<null> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}
