import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { Transaction } from './schemas/transaction.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock Transaction Model — veritabanı yerine bellek içi çalışır
const createMockModel = () => {
  const mockSave = jest.fn();
  const MockModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: mockSave.mockResolvedValue({ ...data, _id: 'mock-id' }),
  }));

  MockModel.find = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    exec: jest.fn().mockResolvedValue([]),
  });

  MockModel.findById = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
    }),
  });

  MockModel.mockSave = mockSave;
  return MockModel;
};

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ========================================================================
  // CASE 4.3: Komisyon Hesaplama Kuralları
  // ========================================================================
  describe('Commission Calculation (Case 4.3)', () => {

    // Senaryo 1: Aynı ajan hem listing hem selling ise
    describe('Scenario 1: Same agent for listing and selling', () => {
      it('should give 50% to agency and 50% to the sole agent', async () => {
        const dto = {
          propertyAddress: '123 Main St, Istanbul',
          totalServiceFee: 100000,
          listingAgent: '6651a1b2c3d4e5f6a7b8c9d0',
          sellingAgent: '6651a1b2c3d4e5f6a7b8c9d0', // Aynı ajan
        };

        const result = await service.create(dto);

        // Şirket payı: %50 = 50,000
        expect(result.companyShare).toBe(50000);
        // Listing agent payı: %50 = 50,000 (çünkü tek ajan)
        expect(result.listingAgentShare).toBe(50000);
        // Selling agent payı: 0 (aynı kişi olduğu için ayrıca ödenmez)
        expect(result.sellingAgentShare).toBe(0);
      });

      it('should set correct commission note for sole agent', async () => {
        const dto = {
          propertyAddress: '456 Test Ave',
          totalServiceFee: 200000,
          listingAgent: 'aaa111bbb222ccc333ddd444',
          sellingAgent: 'aaa111bbb222ccc333ddd444',
        };

        const result = await service.create(dto);
        expect(result.commissionNote).toContain('100%');
        expect(result.commissionNote).toContain('both listing and selling');
      });
    });

    // Senaryo 2: Farklı ajanlar
    describe('Scenario 2: Different agents for listing and selling', () => {
      it('should give 50% to agency, 25% to listing agent, 25% to selling agent', async () => {
        const dto = {
          propertyAddress: '789 Oak Blvd, Ankara',
          totalServiceFee: 100000,
          listingAgent: '6651a1b2c3d4e5f6a7b8c9d0',
          sellingAgent: '6651a1b2c3d4e5f6a7b8c9d1', // Farklı ajan
        };

        const result = await service.create(dto);

        // Şirket payı: %50 = 50,000
        expect(result.companyShare).toBe(50000);
        // Listing agent payı: %25 = 25,000
        expect(result.listingAgentShare).toBe(25000);
        // Selling agent payı: %25 = 25,000
        expect(result.sellingAgentShare).toBe(25000);
      });

      it('should set correct commission note for split agents', async () => {
        const dto = {
          propertyAddress: '321 Pine St',
          totalServiceFee: 80000,
          listingAgent: 'aaa111bbb222ccc333ddd444',
          sellingAgent: 'bbb222ccc333ddd444eee555',
        };

        const result = await service.create(dto);
        expect(result.commissionNote).toContain('equally');
        expect(result.commissionNote).toContain('25%');
      });
    });

    // Sınır değer testleri
    describe('Edge cases', () => {
      it('should handle zero service fee correctly', async () => {
        const dto = {
          propertyAddress: 'Zero Fee Property',
          totalServiceFee: 0,
          listingAgent: '6651a1b2c3d4e5f6a7b8c9d0',
          sellingAgent: '6651a1b2c3d4e5f6a7b8c9d1',
        };

        const result = await service.create(dto);
        expect(result.companyShare).toBe(0);
        expect(result.listingAgentShare).toBe(0);
        expect(result.sellingAgentShare).toBe(0);
      });

      it('should handle large service fee correctly', async () => {
        const dto = {
          propertyAddress: 'Luxury Villa, Bodrum',
          totalServiceFee: 5000000,
          listingAgent: '6651a1b2c3d4e5f6a7b8c9d0',
          sellingAgent: '6651a1b2c3d4e5f6a7b8c9d1',
        };

        const result = await service.create(dto);
        expect(result.companyShare).toBe(2500000);
        expect(result.listingAgentShare).toBe(1250000);
        expect(result.sellingAgentShare).toBe(1250000);
      });

      it('should always ensure companyShare + agentShares = totalServiceFee', async () => {
        const dto = {
          propertyAddress: 'Integrity Check Property',
          totalServiceFee: 333333, // Tek sayı — bölünme bütünlüğü testi
          listingAgent: '6651a1b2c3d4e5f6a7b8c9d0',
          sellingAgent: '6651a1b2c3d4e5f6a7b8c9d1',
        };

        const result = await service.create(dto);
        const total = result.companyShare + result.listingAgentShare + result.sellingAgentShare;
        expect(total).toBeCloseTo(dto.totalServiceFee, 2);
      });
    });
  });

  // ========================================================================
  // CASE 4.1: Stage Transitions (Aşama Geçişleri)
  // ========================================================================
  describe('Stage Transitions (Case 4.1)', () => {

    // Stage geçiş testi için mock transaction oluşturucu
    const setupMockTransaction = (currentStatus: string) => {
      const mockTransaction = {
        _id: 'txn-001',
        propertyAddress: '123 Test St',
        totalServiceFee: 100000,
        companyShare: 50000,
        listingAgentShare: 25000,
        sellingAgentShare: 25000,
        status: currentStatus,
        listingAgent: { _id: 'agent-1', name: 'Agent A' },
        sellingAgent: { _id: 'agent-2', name: 'Agent B' },
        commissionNote: 'Test note',
        save: jest.fn().mockImplementation(function () {
          return Promise.resolve(this);
        }),
      };

      mockModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockTransaction),
          }),
        }),
      });

      return mockTransaction;
    };

    describe('Valid transitions (forward, sequential)', () => {
      it('should allow agreement → earnest_money', async () => {
        const mockTxn = setupMockTransaction('agreement');
        const result = await service.updateStage('txn-001', 'earnest_money' as any);
        expect(result.status).toBe('earnest_money');
        expect(mockTxn.save).toHaveBeenCalled();
      });

      it('should allow earnest_money → title_deed', async () => {
        const mockTxn = setupMockTransaction('earnest_money');
        const result = await service.updateStage('txn-001', 'title_deed' as any);
        expect(result.status).toBe('title_deed');
        expect(mockTxn.save).toHaveBeenCalled();
      });

      it('should allow title_deed → completed', async () => {
        const mockTxn = setupMockTransaction('title_deed');
        const result = await service.updateStage('txn-001', 'completed' as any);
        expect(result.status).toBe('completed');
        expect(mockTxn.save).toHaveBeenCalled();
      });
    });

    describe('Invalid transitions (should throw BadRequestException)', () => {
      it('should reject agreement → completed (skipping stages)', async () => {
        setupMockTransaction('agreement');
        await expect(
          service.updateStage('txn-001', 'completed' as any),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject agreement → title_deed (skipping earnest_money)', async () => {
        setupMockTransaction('agreement');
        await expect(
          service.updateStage('txn-001', 'title_deed' as any),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject completed → agreement (backward transition)', async () => {
        setupMockTransaction('completed');
        await expect(
          service.updateStage('txn-001', 'agreement' as any),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject earnest_money → agreement (backward transition)', async () => {
        setupMockTransaction('earnest_money');
        await expect(
          service.updateStage('txn-001', 'agreement' as any),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject same-stage transition (agreement → agreement)', async () => {
        setupMockTransaction('agreement');
        await expect(
          service.updateStage('txn-001', 'agreement' as any),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject transition from completed (no further stages)', async () => {
        setupMockTransaction('completed');
        await expect(
          service.updateStage('txn-001', 'earnest_money' as any),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('Not found scenarios', () => {
      it('should throw NotFoundException when transaction does not exist', async () => {
        mockModel.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null),
            }),
          }),
        });

        await expect(
          service.updateStage('nonexistent-id', 'earnest_money' as any),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  // ========================================================================
  // CASE 4.2: Financial Breakdown
  // ========================================================================
  describe('Financial Breakdown (Case 4.2)', () => {
    it('should return correct breakdown for different agents', async () => {
      const mockTxn = {
        _id: 'txn-001',
        propertyAddress: '123 Test St',
        totalServiceFee: 100000,
        companyShare: 50000,
        listingAgentShare: 25000,
        sellingAgentShare: 25000,
        status: 'completed',
        listingAgent: { _id: 'agent-1', name: 'Alice' },
        sellingAgent: { _id: 'agent-2', name: 'Bob' },
        commissionNote: 'Split equally between listing and selling agents (25% each of total fee).',
      };

      mockModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockTxn),
          }),
        }),
      });

      const result = await service.getFinancialBreakdown('txn-001');

      expect(result.breakdown.agency.amount).toBe(50000);
      expect(result.breakdown.agency.percentage).toBe(50);
      expect(result.breakdown.listingAgent.name).toBe('Alice');
      expect(result.breakdown.listingAgent.amount).toBe(25000);
      expect(result.breakdown.listingAgent.percentage).toBe(25);
      expect(result.breakdown.sellingAgent.name).toBe('Bob');
      expect(result.breakdown.sellingAgent.amount).toBe(25000);
      expect(result.breakdown.sellingAgent.percentage).toBe(25);
    });

    it('should return correct breakdown for same agent (sole agent)', async () => {
      const sameAgentId = 'agent-solo';
      const mockTxn = {
        _id: 'txn-002',
        propertyAddress: '456 Solo Ave',
        totalServiceFee: 200000,
        companyShare: 100000,
        listingAgentShare: 100000,
        sellingAgentShare: 0,
        status: 'completed',
        listingAgent: { _id: sameAgentId, name: 'Charlie' },
        sellingAgent: { _id: sameAgentId, name: 'Charlie' },
        commissionNote: 'Agent acted as both listing and selling agent.',
      };

      mockModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockTxn),
          }),
        }),
      });

      const result = await service.getFinancialBreakdown('txn-002');

      expect(result.breakdown.agency.amount).toBe(100000);
      expect(result.breakdown.listingAgent.amount).toBe(100000);
      expect(result.breakdown.listingAgent.percentage).toBe(50);
      expect(result.breakdown.sellingAgent.amount).toBe(0);
      expect(result.breakdown.sellingAgent.percentage).toBe(0);
      expect(result.breakdown.listingAgent.role).toContain('sole agent');
    });
  });

  // ========================================================================
  // Stats (Dashboard KPI)
  // ========================================================================
  describe('Stats / KPI calculation', () => {
    it('should calculate totals correctly', async () => {
      mockModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { totalServiceFee: 100000, companyShare: 50000, status: 'completed' },
          { totalServiceFee: 200000, companyShare: 100000, status: 'agreement' },
          { totalServiceFee: 50000, companyShare: 25000, status: 'completed' },
        ]),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      });

      const stats = await service.getStats();
      expect(stats.totalRevenue).toBe(350000);
      expect(stats.totalCompanyProfit).toBe(175000);
      expect(stats.totalDeals).toBe(3);
      expect(stats.completedDeals).toBe(2);
      expect(stats.pendingDeals).toBe(1);
    });
  });
});
