import { IsNotEmpty, IsNumber, IsString, IsMongoId, IsEnum, IsOptional, Min } from 'class-validator';
import { TransactionStage } from './update-stage.dto';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  propertyAddress: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalServiceFee: number;

  @IsMongoId()
  @IsNotEmpty()
  listingAgent: string;

  @IsMongoId()
  @IsNotEmpty()
  sellingAgent: string;

  @IsEnum(TransactionStage)
  @IsOptional()
  status?: TransactionStage;
}