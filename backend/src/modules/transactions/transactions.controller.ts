import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { Transaction } from './schemas/transaction.schema';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * POST /transactions — Yeni transaction oluşturur
   */
  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }

  /**
   * GET /transactions — Tüm transaction'ları listeler
   */
  @Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionsService.findAll();
  }

  /**
   * GET /transactions/stats — Dashboard KPI istatistikleri
   */
  @Get('stats')
  async getStats() {
    return this.transactionsService.getStats();
  }

  /**
   * GET /transactions/:id — Tek bir transaction'ın detayı
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionsService.findOne(id);
  }

  /**
   * GET /transactions/:id/breakdown — Finansal döküm raporu (Case 4.2)
   */
  @Get(':id/breakdown')
  async getBreakdown(@Param('id') id: string) {
    return this.transactionsService.getFinancialBreakdown(id);
  }

  /**
   * PATCH /transactions/:id/stage — Stage geçişi (Case 4.1)
   */
  @Patch(':id/stage')
  async updateStage(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
  ): Promise<Transaction> {
    return this.transactionsService.updateStage(id, updateStageDto.stage);
  }
}
