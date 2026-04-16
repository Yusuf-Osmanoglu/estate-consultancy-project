import { IsNotEmpty, IsNumber, IsString, IsMongoId, IsEnum, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  propertyAddress: string;

  @IsNumber()
  @IsNotEmpty()
  totalServiceFee: number;

  @IsMongoId()
  @IsNotEmpty()
  listingAgent: string;

  @IsMongoId()
  @IsNotEmpty()
  sellingAgent: string;

  @IsEnum(['agreement', 'earnest_money', 'title_deed', 'completed'])
  @IsOptional() // İsteğe bağlı olsun, göndermezsen default değer atanır
  status?: string;
}