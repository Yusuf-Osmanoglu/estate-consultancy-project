import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStage } from './dto/update-stage.dto';

// Geçerli stage geçiş sırası — yalnızca ileri yönlü geçişler
const STAGE_ORDER: TransactionStage[] = [
  TransactionStage.AGREEMENT,
  TransactionStage.EARNEST_MONEY,
  TransactionStage.TITLE_DEED,
  TransactionStage.COMPLETED,
];

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  /**
   * Yeni transaction oluşturur ve komisyon hesaplamasını yapar.
   * Case 4.3: %50 şirket, %50 ajanlar arasında bölünür.
   * Senaryo 1: Aynı ajan → ajan havuzun %100'ünü alır.
   * Senaryo 2: Farklı ajanlar → eşit paylaşım (%25/%25).
   */
  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { totalServiceFee, listingAgent, sellingAgent } = createTransactionDto;

    // 1. Şirket Payı Sabit: %50
    const companyShare = totalServiceFee * 0.50;
    
    // 2. Danışmanlar İçin Kalan Toplam Havuz: %50
    const agentPool = totalServiceFee * 0.50;

    let listingAgentShare = 0;
    let sellingAgentShare = 0;
    let breakdownNote = '';

    // Senaryo Kontrolü: Aynı kişi mi farklı kişiler mi?
    const isSameAgent = listingAgent.toString() === sellingAgent.toString();

    if (isSameAgent) {
      // Senaryo 1: Aynı Kişi (Ajan havuzun tamamını alır)
      listingAgentShare = agentPool;
      sellingAgentShare = 0;
      breakdownNote = 'Agent acted as both listing and selling agent. Earned 100% of agent share (50% of total fee).';
    } else {
      // Senaryo 2: Farklı Kişiler (Havuz ikiye bölünür: %25 - %25)
      listingAgentShare = agentPool / 2;
      sellingAgentShare = agentPool / 2;
      breakdownNote = 'Split equally between listing and selling agents (25% each of total fee).';
    }

    const createdTransaction = new this.transactionModel({
      ...createTransactionDto,
      companyShare,
      listingAgentShare,
      sellingAgentShare,
      commissionNote: breakdownNote,
    });

    return createdTransaction.save();
  }

  /**
   * Tüm transaction'ları çeker, listing ve selling agent populate edilir.
   */
  async findAll(): Promise<Transaction[]> {
    return this.transactionModel
      .find()
      .populate('listingAgent')
      .populate('sellingAgent')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Tek bir transaction'ı detaylı olarak döndürür.
   */
  async findOne(id: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('listingAgent')
      .populate('sellingAgent')
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    return transaction;
  }

  /**
   * Stage geçişi yapar. Geçersiz geçişler engellenir.
   * Case 4.1: agreement → earnest_money → title_deed → completed
   * Yalnızca ileri yönlü, sıralı geçişlere izin verilir.
   */
  async updateStage(id: string, newStage: TransactionStage): Promise<TransactionDocument> {
    const transaction = await this.findOne(id);

    const currentIndex = STAGE_ORDER.indexOf(transaction.status as TransactionStage);
    const newIndex = STAGE_ORDER.indexOf(newStage);

    // Geçersiz geçiş kontrolü: yalnızca bir sonraki aşamaya geçilebilir
    if (newIndex !== currentIndex + 1) {
      const currentStage = transaction.status;
      const expectedNext = STAGE_ORDER[currentIndex + 1] || 'none (already completed)';
      throw new BadRequestException(
        `Invalid stage transition: "${currentStage}" → "${newStage}". ` +
        `Expected next stage: "${expectedNext}". Only forward, sequential transitions are allowed.`
      );
    }

    transaction.status = newStage;
    return transaction.save();
  }

  /**
   * Case 4.2: Tamamlanmış bir transaction için finansal döküm raporu.
   * Kimin ne kadar kazandığını ve nedenini döndürür.
   */
  async getFinancialBreakdown(id: string): Promise<{
    transactionId: string;
    propertyAddress: string;
    totalServiceFee: number;
    status: string;
    breakdown: {
      agency: { amount: number; percentage: number; note: string };
      listingAgent: { id: string; name: string; amount: number; percentage: number; role: string };
      sellingAgent: { id: string; name: string; amount: number; percentage: number; role: string };
    };
    commissionNote: string;
  }> {
    const transaction = await this.findOne(id);

    const isSameAgent =
      (transaction.listingAgent as any)._id.toString() === (transaction.sellingAgent as any)._id.toString();

    return {
      transactionId: (transaction as any)._id.toString(),
      propertyAddress: transaction.propertyAddress,
      totalServiceFee: transaction.totalServiceFee,
      status: transaction.status,
      breakdown: {
        agency: {
          amount: transaction.companyShare,
          percentage: 50,
          note: '50% of total service fee goes to the agency as per company policy.',
        },
        listingAgent: {
          id: (transaction.listingAgent as any)._id.toString(),
          name: (transaction.listingAgent as any).name,
          amount: transaction.listingAgentShare,
          percentage: isSameAgent ? 50 : 25,
          role: isSameAgent ? 'Listing & Selling Agent (sole agent)' : 'Listing Agent',
        },
        sellingAgent: {
          id: (transaction.sellingAgent as any)._id.toString(),
          name: (transaction.sellingAgent as any).name,
          amount: transaction.sellingAgentShare,
          percentage: isSameAgent ? 0 : 25,
          role: isSameAgent ? 'Same as listing agent' : 'Selling Agent',
        },
      },
      commissionNote: transaction.commissionNote,
    };
  }

  /**
   * Dashboard KPI verileri: toplam gelir, şirket payı, toplam işlem sayısı hesaplar.
   */
  async getStats(): Promise<{
    totalRevenue: number;
    totalCompanyProfit: number;
    totalDeals: number;
    completedDeals: number;
    pendingDeals: number;
  }> {
    const transactions = await this.transactionModel.find().exec();

    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalServiceFee, 0);
    const totalCompanyProfit = transactions.reduce((sum, t) => sum + t.companyShare, 0);
    const totalDeals = transactions.length;
    const completedDeals = transactions.filter(t => t.status === 'completed').length;
    const pendingDeals = totalDeals - completedDeals;

    return {
      totalRevenue,
      totalCompanyProfit,
      totalDeals,
      completedDeals,
      pendingDeals,
    };
  }
}