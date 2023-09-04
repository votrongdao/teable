import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { ITableFullVo, ITableListVo, ITableVo } from '@teable-group/core';
import {
  getTableQuerySchema,
  ICreateTablePreparedRo,
  IGetTableQuery,
  tableRoSchema,
} from '@teable-group/core';
import { ApiResponse, responseWrap } from '../../../utils/api-response';
import { ZodValidationPipe } from '../../../zod.validation.pipe';
import { TableService } from '../table.service';
import { TableOpenApiService } from './table-open-api.service';
import { TablePipe } from './table.pipe';

@ApiTags('table')
@Controller('api/table')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly tableOpenApiService: TableOpenApiService
  ) {}

  @Get(':tableId/defaultViewId')
  @ApiOkResponse({
    description: 'default id in table',
    type: ApiResponse<{ id: string }>,
  })
  async getDefaultViewId(@Param('tableId') tableId: string): Promise<ApiResponse<{ id: string }>> {
    const snapshot = await this.tableService.getDefaultViewId(tableId);
    return responseWrap(snapshot);
  }

  @Get(':tableId')
  async getTable(
    @Param('tableId') tableId: string,
    @Query(new ZodValidationPipe(getTableQuerySchema)) query: IGetTableQuery
  ): Promise<ApiResponse<ITableVo>> {
    const table = await this.tableService.getTable(tableId, query);
    return responseWrap(table);
  }

  @Get()
  async getTables(): Promise<ApiResponse<ITableListVo>> {
    const tables = await this.tableService.getTables();
    return responseWrap(tables);
  }

  @ApiOperation({ summary: 'Create table' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The table has been successfully created.',
    type: ApiResponse<ITableFullVo>,
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  async createTable(
    @Body(new ZodValidationPipe(tableRoSchema), TablePipe) createTableRo: ICreateTablePreparedRo
  ): Promise<ApiResponse<ITableFullVo>> {
    const result = await this.tableOpenApiService.createTable(createTableRo);
    return responseWrap(result);
  }

  @ApiOperation({ summary: 'Delete table' })
  @ApiOkResponse({ description: 'The table has been deleted' })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':tableId')
  async archiveTable(@Param('tableId') tableId: string) {
    const result = await this.tableOpenApiService.deleteTable(tableId);
    return responseWrap(result);
  }

  @Delete('arbitrary/:tableId')
  deleteTableArbitrary(@Param('tableId') tableId: string) {
    return this.tableOpenApiService.deleteTable(tableId);
  }
}
