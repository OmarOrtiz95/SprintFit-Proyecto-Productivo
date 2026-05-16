import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider, EmailOptions } from '../email.provider';

@Injectable()
export class MockEmailProvider extends EmailProvider {
  private readonly logger = new Logger(MockEmailProvider.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async send(options: EmailOptions): Promise<void> {
    this.logger.log(`[MOCK EMAIL] To: ${options.to}`);
    this.logger.log(`[MOCK EMAIL] Subject: ${options.subject}`);
    this.logger.log(`[MOCK EMAIL] Body: ${options.html}`);
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    this.logger.log(`[MOCK EMAIL] To: ${email}`);
    this.logger.log('[MOCK EMAIL] Subject: Verifica tu cuenta en SprintFit');
    this.logger.log(`[MOCK EMAIL] Verification URL: ${verificationUrl}`);
  }
}
