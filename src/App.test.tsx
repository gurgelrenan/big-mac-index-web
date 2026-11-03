// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

function entry(code: string, name: string, currency: string, local: number, exchange: number, date='2026-07-01') {
  return {attributes:{iso_a3:code,name,currency_code:currency,local_price:String(local),dollar_ex:String(exchange),date}};
}
const latest = [entry('BRA','Brazil','BRL',25,5),entry('USA','United States','USD',6.25,1),entry('JPN','Japan','JPY',500,100)];
const response = (data: unknown[])=>({ok:true,json:async()=>({data})});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

describe('experiência de exploração',()=>{
  it('exibe a comparação real e recalcula ao inverter os países',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(latest)));
    render(<App/>);
    await screen.findByText('20,0% menos');
    fireEvent.click(screen.getByRole('button',{name:'Trocar países de posição'}));
    expect(screen.getByText('25,0% mais')).toBeTruthy();
    expect(screen.getByRole('button',{name:/^Primeiro país:/}).textContent).toContain('Estados Unidos');
  });
  it('não mostra resultados enganosos quando o orçamento fica vazio ou negativo',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(latest)));
    render(<App/>);await screen.findByText('20,0% menos');
    const input=screen.getByLabelText('QUANTO VOCÊ LEVARIA?');
    fireEvent.change(input,{target:{value:''}});
    expect(screen.getByText('Preencha um valor para comparar.')).toBeTruthy();
    fireEvent.change(input,{target:{value:'-10'}});
    expect(screen.getByText('Digite um valor de 0 a 1 bilhão.')).toBeTruthy();
    fireEvent.change(input,{target:{value:'0'}});
    expect(screen.queryByText('Preencha um valor para comparar.')).toBeNull();
  });
  it('carrega outras edições sob demanda sem misturar períodos',async()=>{
    const old = [entry('BRA','Brazil','BRL',20,4,'2020-01-01'),entry('USA','United States','USD',5,1,'2020-01-01')];
    const fetchMock=vi.fn().mockResolvedValueOnce(response(latest)).mockResolvedValueOnce(response([...latest,...old]));
    vi.stubGlobal('fetch',fetchMock);
    render(<App/>);await screen.findByText('20,0% menos');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button',{name:'Ver outras edições ↗'}));
    await screen.findByRole('button',{name:/^Edição dos dados:/});
    expect(screen.getByText('20,0% menos')).toBeTruthy();
    expect(screen.getByText(/3 lugares/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('distingue indisponibilidade e ausência de preços e permite nova tentativa',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockRejectedValueOnce(new Error('Sem conexão')).mockResolvedValueOnce(response([])));
    render(<App/>);
    await screen.findByText('O balcão ainda não abriu.');
    fireEvent.click(screen.getByRole('button',{name:'Tentar novamente'}));
    await screen.findByText('Ainda não há preços para comparar.');
    expect(screen.queryByText('O preço pelo mundo')).toBeNull();
  });
  it('filtra os países e explica uma busca sem resultados',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(latest)));
    render(<App/>);await screen.findByText('20,0% menos');
    fireEvent.change(screen.getByLabelText('Buscar país no ranking'),{target:{value:'xyz'}});
    await waitFor(()=>expect(screen.getByText('Nenhum país encontrado para “xyz”.')).toBeTruthy());
    expect(screen.queryByRole('button',{name:'Comparar com Brasil'})).toBeNull();
  });
});
