export type Price = {
  code: string; name: string; currency: string; date: string;
  local: number; exchange: number; dollars: number;
};

function positive(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parsePrices(body: unknown): Price[] {
  if (!body || typeof body !== 'object' || !('data' in body) || !Array.isArray(body.data)) {
    throw new Error('A API retornou um formato inesperado.');
  }
  const result: Price[] = [];
  const seen = new Set<string>();
  for (const item of body.data) {
    const a = item?.attributes;
    if (!a || typeof a.iso_a3 !== 'string' || typeof a.name !== 'string' ||
      typeof a.currency_code !== 'string' || !/^[A-Z]{3}$/.test(a.currency_code) ||
      typeof a.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) continue;
    const local = positive(a.local_price);
    const exchange = positive(a.dollar_ex);
    if (local === null || exchange === null) continue;
    const key = `${a.date}:${a.iso_a3}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ code: a.iso_a3, name: a.name, currency: a.currency_code, date: a.date,
      local, exchange, dollars: local / exchange });
  }
  return result;
}

export const difference = (a: Price, b: Price) => (a.dollars / b.dollars - 1) * 100;
export const impliedExchange = (a: Price, b: Price) => a.local / b.local;
export const actualExchange = (a: Price, b: Price) => a.exchange / b.exchange;
export const burgerCount = (amount: number, origin: Price, destination: Price) =>
  amount / origin.exchange / destination.dollars;

export const money = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
export const decimal = (n: number, digits = 1) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
export const edition = (date: string) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

const names: Record<string, string> = {
  ARG: 'Argentina', AUS: 'Austrália', AZE: 'Azerbaijão', BHR: 'Bahrein', BRA: 'Brasil', CAN: 'Canadá',
  CHE: 'Suíça', CHL: 'Chile', CHN: 'China', COL: 'Colômbia', CRI: 'Costa Rica', CZE: 'Tchéquia',
  DNK: 'Dinamarca', EGY: 'Egito', EUZ: 'Zona do euro', GBR: 'Reino Unido', GTM: 'Guatemala',
  HKG: 'Hong Kong', HND: 'Honduras', HUN: 'Hungria', IDN: 'Indonésia', IND: 'Índia', ISR: 'Israel',
  JOR: 'Jordânia', JPN: 'Japão', KOR: 'Coreia do Sul', KWT: 'Kuwait', LBN: 'Líbano', MDA: 'Moldávia',
  MEX: 'México', MYS: 'Malásia', NIC: 'Nicarágua', NOR: 'Noruega', NZL: 'Nova Zelândia', OMN: 'Omã',
  PAK: 'Paquistão', PER: 'Peru', PHL: 'Filipinas', POL: 'Polônia', QAT: 'Catar', ROU: 'Romênia',
  RUS: 'Rússia', SAU: 'Arábia Saudita', SGP: 'Singapura', SWE: 'Suécia', THA: 'Tailândia',
  TUR: 'Turquia', TWN: 'Taiwan', UKR: 'Ucrânia', URY: 'Uruguai', USA: 'Estados Unidos',
  VEN: 'Venezuela', VNM: 'Vietnã', ZAF: 'África do Sul', ARE: 'Emirados Árabes Unidos',
  AUT: 'Áustria', BEL: 'Bélgica', DEU: 'Alemanha', ESP: 'Espanha', EST: 'Estônia', FIN: 'Finlândia',
  FRA: 'França', GRC: 'Grécia', IRL: 'Irlanda', ITA: 'Itália', LTU: 'Lituânia', LVA: 'Letônia',
  NLD: 'Países Baixos', PRT: 'Portugal', SVK: 'Eslováquia', SVN: 'Eslovênia', HRV: 'Croácia',
};
export const countryName = (p: Price) => names[p.code] ?? p.name;
const regions: Record<string, string> = { BRA: 'BR', USA: 'US', EUZ: 'EU', GBR: 'GB', CHE: 'CH',
  ARG: 'AR', JPN: 'JP', CHN: 'CN', CAN: 'CA', AUS: 'AU', NOR: 'NO', SWE: 'SE', MEX: 'MX',
  CHL: 'CL', COL: 'CO', URY: 'UY', ZAF: 'ZA', IND: 'IN', KOR: 'KR', NZL: 'NZ', PRT: 'PT',
  FRA: 'FR', DEU: 'DE', ITA: 'IT', ESP: 'ES', HKG: 'HK', SGP: 'SG', TUR: 'TR', POL: 'PL',
  DNK: 'DK', THA: 'TH', IDN: 'ID', PER: 'PE', RUS: 'RU', UKR: 'UA', ISR: 'IL', EGY: 'EG',
  PAK: 'PK', PHL: 'PH', MYS: 'MY', VNM: 'VN', SAU: 'SA', ARE: 'AE', TWN: 'TW', HUN: 'HU',
  CZE: 'CZ', ROU: 'RO', CRI: 'CR', GTM: 'GT', HND: 'HN', NIC: 'NI', VEN: 'VE', AZE: 'AZ',
  BHR: 'BH', JOR: 'JO', KWT: 'KW', LBN: 'LB', MDA: 'MD', OMN: 'OM', QAT: 'QA' };
export const flag = (code: string) => regions[code]
  ? [...regions[code]].map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('') : '◎';

export async function fetchPrices(history = false, signal?: AbortSignal): Promise<Price[]> {
  const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
  const response = await fetch(`${base}/big_macs${history ? '' : '/latest'}`, {
    signal: AbortSignal.any([signal ?? new AbortController().signal, AbortSignal.timeout(15000)]),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Não foi possível consultar os dados (HTTP ${response.status}).`);
  return parsePrices(await response.json());
}
