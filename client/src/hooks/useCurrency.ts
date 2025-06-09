import { useState, useEffect } from 'react'

// Currency configuration
export const CURRENCY_CONFIG = {
  GBP: { symbol: '£', code: 'GBP' },
  USD: { symbol: '$', code: 'USD' },
  EUR: { symbol: '€', code: 'EUR' },
  CAD: { symbol: 'C$', code: 'CAD' },
  AUD: { symbol: 'A$', code: 'AUD' },
  NZD: { symbol: 'NZ$', code: 'NZD' },
  JPY: { symbol: '¥', code: 'JPY' },
  INR: { symbol: '₹', code: 'INR' },
  SGD: { symbol: 'S$', code: 'SGD' },
  AED: { symbol: 'د.إ', code: 'AED' },
  ZAR: { symbol: 'R', code: 'ZAR' },
  BRL: { symbol: 'R$', code: 'BRL' },
  HKD: { symbol: 'HK$', code: 'HKD' },
  CNY: { symbol: '¥', code: 'CNY' },
  KRW: { symbol: '₩', code: 'KRW' },
  SAR: { symbol: '﷼', code: 'SAR' },
  QAR: { symbol: '﷼', code: 'QAR' },
  EGP: { symbol: 'E£', code: 'EGP' },
  NGN: { symbol: '₦', code: 'NGN' },
  ARS: { symbol: 'AR$', code: 'ARS' },
  CLP: { symbol: 'CL$', code: 'CLP' },
  COP: { symbol: 'CO$', code: 'COP' },
  PEN: { symbol: 'S/', code: 'PEN' },
  MXN: { symbol: 'Mex$', code: 'MXN' },
} as const

export type CurrencyCode = keyof typeof CURRENCY_CONFIG

// Custom hook for currency formatting
export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyCode>('GBP')

  useEffect(() => {
    // Get user's locale from browser
    const userLocale = navigator.language

    // Map region to currency with type safety
    const regionToCurrency: Record<string, CurrencyCode> = {
      // Europe
      GB: 'GBP',
      IE: 'EUR',
      FR: 'EUR',
      DE: 'EUR',
      IT: 'EUR',
      ES: 'EUR',
      PT: 'EUR',
      NL: 'EUR',
      BE: 'EUR',
      AT: 'EUR',
      CH: 'EUR',
      SE: 'EUR',
      NO: 'EUR',
      DK: 'EUR',
      FI: 'EUR',

      // North America
      US: 'USD',
      CA: 'CAD',

      // Asia Pacific
      AU: 'AUD',
      NZ: 'NZD',
      JP: 'JPY',
      IN: 'INR',
      SG: 'SGD',
      HK: 'HKD',
      CN: 'CNY',
      KR: 'KRW',

      // Middle East
      AE: 'AED',
      SA: 'SAR',
      QA: 'QAR',

      // Africa
      ZA: 'ZAR',
      EG: 'EGP',
      NG: 'NGN',

      // South America
      BR: 'BRL',
      AR: 'ARS',
      CL: 'CLP',
      CO: 'COP',
      PE: 'PEN',
      MX: 'MXN',
    }

    // Safely get the region
    let userRegion: string | undefined
    try {
      userRegion = new Intl.Locale(userLocale).maximize().region
    } catch {
      userRegion = undefined
    }

    // Set currency with type safety
    if (userRegion && userRegion in regionToCurrency) {
      setCurrency(regionToCurrency[userRegion])
    } else {
      setCurrency('GBP') // Default to GBP
    }
  }, [])

  const formatPrice = (amount: number) => {
    const formatter = new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol',
    })

    // Get the formatted number without the currency symbol
    const parts = formatter.formatToParts(amount)
    const numericPart = parts
      .filter((part) => part.type !== 'currency')
      .map((part) => part.value)
      .join('')

    // Always put the currency symbol first
    return `${CURRENCY_CONFIG[currency].symbol}${numericPart}`
  }

  return { currency, formatPrice }
}
