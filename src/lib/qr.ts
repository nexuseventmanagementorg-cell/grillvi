import QRCode from 'qrcode';

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

export function getItemProductUrl(itemIdOrSlug: string, customBaseUrl?: string): string {
  const baseUrl = customBaseUrl || getAppBaseUrl();
  return `${baseUrl}/menu/item/${encodeURIComponent(itemIdOrSlug)}`;
}

export async function generateQrDataUrl(
  text: string,
  options?: { width?: number; margin?: number; colorDark?: string; colorLight?: string }
): Promise<string> {
  const width = options?.width || 360;
  const margin = options?.margin !== undefined ? options.margin : 2;
  const colorDark = options?.colorDark || '#0C0C0E';
  const colorLight = options?.colorLight || '#FFFFFF';

  return await QRCode.toDataURL(text, {
    width,
    margin,
    color: {
      dark: colorDark,
      light: colorLight,
    },
    errorCorrectionLevel: 'M',
  });
}

export async function generateQrSvgString(
  text: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  const width = options?.width || 360;
  const margin = options?.margin !== undefined ? options.margin : 2;

  return await QRCode.toString(text, {
    type: 'svg',
    width,
    margin,
    errorCorrectionLevel: 'M',
  });
}
