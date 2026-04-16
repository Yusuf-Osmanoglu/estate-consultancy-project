import { Controller, Get, Post, Body } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Agent } from './schemas/agent.schema';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  async create(@Body() createAgentDto: any): Promise<Agent> {
    return this.agentsService.create(createAgentDto);
  }

  @Get()
  async findAll(): Promise<Agent[]> {
    return this.agentsService.findAll();
  }
}
