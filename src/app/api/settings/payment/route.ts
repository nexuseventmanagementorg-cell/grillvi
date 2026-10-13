import { NextRequest, NextResponse } from 'next/server';
import { getPaymentSettings, updatePaymentSettings } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';
import { initialPaymentSettings } from '@/lib/initialData';
import {
  isPersistentSettingsConfigured,
  readPersistentSetting,
  writePersistentSetting,
} from '@/lib/persistentSettings';

const PAYMENT_SETTINGS_KEY = 'grillvi_payment_settings';

export async function GET() {
  try {
    const settings = isPersistentSettingsConfigured()
      ? (await readPersistentSetting(PAYMENT_SETTINGS_KEY)) ?? initialPaymentSettings
      : process.env.NODE_ENV === 'production'
      ? initialPaymentSettings
      : getPaymentSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching payment settings:', err);
    return NextResponse.json({ error: 'Failed to fetch payment settings.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const updates = await req.json();
    const updated = {
      ...initialPaymentSettings,
      ...updates,
      easypaisa: { ...initialPaymentSettings.easypaisa, ...updates.easypaisa },
      jazzcash: { ...initialPaymentSettings.jazzcash, ...updates.jazzcash },
      bankTransfer: { ...initialPaymentSettings.bankTransfer, ...updates.bankTransfer },
      cashOnDelivery: { ...initialPaymentSettings.cashOnDelivery, ...updates.cashOnDelivery },
    };

    if (isPersistentSettingsConfigured()) {
      await writePersistentSetting(PAYMENT_SETTINGS_KEY, updated);
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Payment settings are not saved yet. Configure Supabase persistence first.' },
        { status: 503 }
      );
    } else {
      updatePaymentSettings(updated);
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error('Error updating payment settings:', err);
    return NextResponse.json({ error: 'Failed to update payment settings.' }, { status: 500 });
  }
}
