import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Agent } from '../../agents/schemas/agent.schema';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  propertyAddress: string;

  @Prop({ required: true })
  totalServiceFee: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', required: true })
  listingAgent: Agent;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', required: true })
  sellingAgent: Agent;

  @Prop({ 
    required: true, 
    enum: ['agreement', 'earnest_money', 'title_deed', 'completed'],
    default: 'agreement' 
  })
  status: string;

  @Prop({ required: true })
  companyShare: number;

  @Prop({ required: true })
  listingAgentShare: number;

  @Prop({ required: true })
  sellingAgentShare: number;

  @Prop() // Neden bu tutarın kazanıldığını açıklayan raporlama alanı
  commissionNote: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);