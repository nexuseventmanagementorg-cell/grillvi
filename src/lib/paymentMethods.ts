import type { PaymentMethod, PaymentSettings } from '@/types';

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPaymentMethodAvailable(
  settings: PaymentSettings,
  method: PaymentMethod
): boolean {
  switch (method) {
    case 'cash_on_delivery':
      return settings.cashOnDelivery?.enabled === true;
    case 'easypaisa':
      return (
        settings.easypaisa?.enabled === true &&
        hasText(settings.easypaisa.accountTitle) &&
        hasText(settings.easypaisa.accountNumber)
      );
    case 'jazzcash':
      return (
        settings.jazzcash?.enabled === true &&
        hasText(settings.jazzcash.accountTitle) &&
        hasText(settings.jazzcash.accountNumber)
      );
    case 'bank_transfer':
      return (
        settings.bankTransfer?.enabled === true &&
        hasText(settings.bankTransfer.bankName) &&
        hasText(settings.bankTransfer.accountTitle) &&
        Boolean(
          hasText(settings.bankTransfer.accountNumber) ||
            hasText(settings.bankTransfer.iban)
        )
      );
  }
}
