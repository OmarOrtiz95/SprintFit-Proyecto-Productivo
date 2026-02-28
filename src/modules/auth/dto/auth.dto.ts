import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@sprintfit.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'adminPassword123' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'admin@sprintfit.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'adminPassword123' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Administrador SprintFit' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: '3001234567', required: false })
    @IsString()
    phone?: string;
}
