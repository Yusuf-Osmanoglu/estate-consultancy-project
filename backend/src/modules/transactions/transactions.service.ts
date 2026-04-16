import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

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
    // Not: ID'leri string'e çevirip karşılaştırmak güvenlidir.
    const isSameAgent = listingAgent.toString() === sellingAgent.toString();

    if (isSameAgent) {
      // Senaryo 1: Aynı Kişi (Ajan havuzun tamamını alır)
      listingAgentShare = agentPool;
      sellingAgentShare = 0; // İkinci bir ödeme yapılmaz
      breakdownNote = 'Agent acted as both listing and selling agent. Earned 100% of agent share.';
    } else {
      // Senaryo 2: Farklı Kişiler (Havuz ikiye bölünür: %25 - %25)
      listingAgentShare = agentPool / 2;
      sellingAgentShare = agentPool / 2;
      breakdownNote = 'Split equally between listing and selling agents (50% each of agent share).';
    }

    // Veritabanına kaydetme
    const createdTransaction = new this.transactionModel({
      ...createTransactionDto,
      companyShare,
      listingAgentShare,
      sellingAgentShare,
      commissionNote: breakdownNote,
    });

    return createdTransaction.save();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().populate('listingAgent').populate('sellingAgent').exec();
  }
}