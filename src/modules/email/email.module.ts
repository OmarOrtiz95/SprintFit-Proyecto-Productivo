import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { DatabaseModule } from '../../database/database.module';
import { EmailProvider } from './email.provider';
import { MockEmailProvider } from './providers/mock-email.provider';
import { SmtpEmailProvider } from './providers/smtp-email.provider';
import { EmailVerificationService } from './email-verification.service';
import * as path from 'path';

@Module({})
export class EmailModule {
  static forRootAsync(): DynamicModule {
    return {
      module: EmailModule,
      imports: [
        DatabaseModule,
        MailerModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            transport: {
              host: config.get('MAIL_HOST'),
              port: parseInt(config.get('MAIL_PORT', '587'), 10),
              secure: false,
              auth: {
                user: config.get('MAIL_USER'),
                pass: config.get('MAIL_PASS'),
              },
            },
            defaults: {
              from: config.get('MAIL_FROM', 'noreply@sprintfit.com'),
            },
            template: {
              dir: path.resolve(__dirname, 'templates'),
              adapter: new HandlebarsAdapter(),
            },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [
        {
          provide: EmailProvider,
          useFactory: (config: ConfigService, mailerService: MailerService) => {
            const transport = config.get('MAIL_TRANSPORT', 'mock');
            if (transport === 'smtp') {
              return new SmtpEmailProvider(mailerService, config);
            }
            return new MockEmailProvider(config);
          },
          inject: [ConfigService, MailerService],
        },
        EmailVerificationService,
      ],
      exports: [EmailProvider, EmailVerificationService],
    };
  }
}
