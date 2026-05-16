export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export abstract class EmailProvider {
  abstract send(options: EmailOptions): Promise<void>;
  abstract sendVerificationEmail(email: string, token: string): Promise<void>;
}
