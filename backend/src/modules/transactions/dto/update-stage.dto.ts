import { IsEnum, IsNotEmpty } from 'class-validator';

export enum TransactionStage {
  AGREEMENT = 'agreement',
  EARNEST_MONEY = 'earnest_money',
  TITLE_DEED = 'title_deed',
  COMPLETED = 'completed',
}

export class UpdateStageDto {
  @IsEnum(TransactionStage)
  @IsNotEmpty()
  stage: TransactionStage;
}
