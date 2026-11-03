import { describe, expect, it, vi, afterEach } from 'vitest';
import { actualExchange, burgerCount, difference, fetchPrices, impliedExchange, parsePrices, type Price } from './data';

const brazil: Price = { code:'BRA', name:'Brazil', currency:'BRL', date:'2026-07-01', local:25, exchange:5, dollars:5 };
const usa: Price = { code:'USA', name:'United States', currency:'USD', date:'2026-07-01', local:6.25, exchange:1, dollars:6.25 };

describe('comparações econômicas',()=>{
  it('usa a base selecionada e inverte a comparação corretamente',()=>{
    expect(difference(brazil,usa)).toBeCloseTo(-20);
    expect(difference(usa,brazil)).toBeCloseTo(25);
    expect(difference(brazil,brazil)).toBe(0);
  });
  it('compara câmbio implícito com câmbio observado na mesma orientação',()=>{
    expect(impliedExchange(brazil,usa)).toBe(4);
    expect(actualExchange(brazil,usa)).toBe(5);
    expect((impliedExchange(brazil,usa)/actualExchange(brazil,usa)-1)*100).toBeCloseTo(difference(brazil,usa));
  });
  it('converte o orçamento da moeda de origem antes de calcular as quantidades',()=>{
    expect(burgerCount(100,brazil,usa)).toBeCloseTo(3.2);
    expect(burgerCount(100,brazil,brazil)).toBe(4);
    expect(burgerCount(0,brazil,usa)).toBe(0);
  });
});

describe('contrato JSON:API',()=>{
  const attributes = { date:'2026-07-01',iso_a3:'BRA',name:'Brazil',currency_code:'BRL',local_price:'25.0',dollar_ex:'5.0',dollar_price:null };
  it('aceita decimais serializados como strings e calcula o preço em dólares',()=>{
    expect(parsePrices({data:[{attributes}]})).toEqual([brazil]);
  });
  it('descarta preços ou taxas ausentes, zero, negativos e não finitos',()=>{
    for(const invalid of [null,undefined,0,-1,'NaN','Infinity','']) {
      expect(parsePrices({data:[{attributes:{...attributes,dollar_ex:invalid}}]})).toEqual([]);
      expect(parsePrices({data:[{attributes:{...attributes,local_price:invalid}}]})).toEqual([]);
    }
  });
  it('remove duplicados sem juntar países de edições diferentes',()=>{
    expect(parsePrices({data:[{attributes},{attributes},{attributes:{...attributes,date:'2025-07-01'}}]})).toHaveLength(2);
  });
  it('distingue uma resposta vazia de uma resposta incompatível',()=>{
    expect(parsePrices({data:[]})).toEqual([]);
    expect(()=>parsePrices({prices:[]})).toThrow('formato inesperado');
  });
});

describe('carregamento',()=>{
  afterEach(()=>vi.unstubAllGlobals());
  it('não transforma uma falha de rede em dados vazios',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:503}));
    await expect(fetchPrices()).rejects.toThrow('HTTP 503');
  });
});
