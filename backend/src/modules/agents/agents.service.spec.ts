import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { Agent } from './schemas/agent.schema';
import { NotFoundException } from '@nestjs/common';

describe('AgentsService', () => {
  let service: AgentsService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...data, _id: 'mock-agent-id' }),
    }));

    mockModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: 'agent-1', name: 'Alice', email: 'alice@test.com' },
        { _id: 'agent-2', name: 'Bob', email: 'bob@test.com' },
      ]),
    });

    mockModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: getModelToken(Agent.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new agent', async () => {
      const dto = { name: 'Test Agent', email: 'test@example.com', phone: '+905551234567' };
      const result = await service.create(dto);
      expect(result.name).toBe('Test Agent');
      expect(result.email).toBe('test@example.com');
    });

    it('should create agent without optional phone', async () => {
      const dto = { name: 'No Phone Agent', email: 'nophone@example.com' };
      const result = await service.create(dto);
      expect(result.name).toBe('No Phone Agent');
    });
  });

  describe('findAll', () => {
    it('should return all agents', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
    });
  });

  describe('findOne', () => {
    it('should return agent by ID', async () => {
      const mockAgent = { _id: 'agent-1', name: 'Alice', email: 'alice@test.com' };
      mockModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAgent),
      });

      const result = await service.findOne('agent-1');
      expect(result.name).toBe('Alice');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      mockModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
