import { useEffect, useMemo, useState } from 'react';
import Burger from './Burger';
import Picker from './Picker';
import { actualExchange, burgerCount, countryName, decimal, difference, edition, fetchPrices, flag, impliedExchange, money, type Price } from './data';
import './App.css';

function CountryCard({ value, options, onChange, label }: { value: Price; options: Price[]; onChange: (code: string) => void; label: string }) {
  return <div className="country-card">
    <p className="eyebrow">{label === 'country-a' ? '01 / Seu ponto de partida' : '02 / Do outro lado do balcão'}</p>
    <Picker country searchable label={label === 'country-a' ? 'Primeiro país' : 'País de comparação'} value={value.code} choices={options.map(p=>({id:p.code,title:countryName(p),detail:p.currency,flag:flag(p.code)}))} onChange={onChange}/>
    <p className="local-price">{money(value.local, value.currency)}</p>
    <div className="dollar-price"><span>{money(value.dollars)}</span> <span>em dólares americanos</span></div>
    <div className="price-footnote">Um Big Mac · preço local convertido pelo câmbio da edição</div>
  </div>;
}

function App() {
  const [records, setRecords] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [aCode, setACode] = useState('BRA');
  const [bCode, setBCode] = useState('USA');
  const [date, setDate] = useState('');
  const [historyStatus, setHistoryStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [budget, setBudget] = useState('100');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'cheap' | 'expensive'>('cheap');
  const [showAll, setShowAll] = useState(false);

  useEffect(()=>{
    const controller = new AbortController();
    setLoading(true); setError('');
    fetchPrices(false, controller.signal).then(data=>{
      setRecords(data); setDate(data.map(p=>p.date).sort().at(-1) ?? '');
      setHistoryStatus('idle');
    }).catch(e=>{ if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Não foi possível carregar os dados.'); })
      .finally(()=>{if (!controller.signal.aborted) setLoading(false);});
    return ()=>controller.abort();
  },[attempt]);

  const dates = useMemo(()=>[...new Set(records.map(p=>p.date))].sort().reverse(),[records]);
  const countries = useMemo(()=>records.filter(p=>p.date===date).sort((a,b)=>countryName(a).localeCompare(countryName(b),'pt-BR')),[records,date]);
  const a = countries.find(p=>p.code===aCode) ?? countries.find(p=>p.code==='BRA') ?? countries[0];
  const b = countries.find(p=>p.code===bCode) ?? countries.find(p=>p.code==='USA') ?? countries.find(p=>p.code!==a?.code) ?? countries[0];
  const delta = a && b ? difference(a,b) : 0;
  const samePrice = Math.abs(delta)<0.05;
  const amount = budget.trim() === '' ? NaN : Number(budget);
  const validBudget = Number.isFinite(amount) && amount>=0 && amount<=1e9;
  const ranking = useMemo(()=>countries.filter(p=>countryName(p).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))).sort((a,b)=>sort==='cheap'?a.dollars-b.dollars:b.dollars-a.dollars),[countries,query,sort]);
  const shown = showAll ? ranking : ranking.slice(0,8);
  const maxPrice = countries.length ? Math.max(...countries.map(p=>p.dollars)) : 1;

  async function loadHistory() {
    setHistoryStatus('loading');
    try { const data = await fetchPrices(true); setRecords(data); setHistoryStatus('loaded'); }
    catch { setHistoryStatus('error'); }
  }

  return <>
    <a href="#comparar" className="skip-link">Pular para a comparação</a>
    <header className="header wrap">
      <a href="#" className="brand" aria-label="Big Mac, mundo afora — início"><span className="brand-icon" aria-hidden="true"><i/><i/><i/></span><span>Big Mac,<br/><b>mundo afora.</b></span></a>
      <nav aria-label="Navegação principal"><a href="#comparar">Compare</a><a href="#entenda">Entenda</a><a href="#explore">Explore o mundo <span aria-hidden="true">↗</span></a></nav>
      <span className="header-note">ECONOMIA EM UMA MORDIDA</span>
    </header>
    <main>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><span className="status-dot"/> UM JEITO DIFERENTE DE ENTENDER O DINHEIRO</p>
          <h1 id="hero-title">Um hambúrguer.<br/><em>Muitas economias.</em></h1>
          <p className="intro">O mesmo Big Mac, preços diferentes pelo mundo. Descubra o que isso conta sobre o valor das moedas — sem precisar entender de economia.</p>
          <a className="text-link" href="#comparar">Vamos comparar? <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art"><div className="sun-disc"/><span className="art-orbit orbit-one"/><span className="art-orbit orbit-two"/><div className="hero-burger"><Burger/></div><span className="art-label label-one">MESMA RECEITA.</span><span className="art-label label-two">OUTRO VALOR.</span><span className="art-spark" aria-hidden="true">✳</span><p className="art-caption">Uma pequena mordida na economia mundial.</p></div>
      </section>

      <section className="comparison-section wrap" id="comparar" aria-labelledby="compare-title">
        <div className="section-top"><div><p className="eyebrow">01 / COMPARE NA PRÁTICA</p><h2 id="compare-title">Dois países. Um Big Mac.</h2></div>
          {!loading && !error && date && <div className="edition-control"><span className="eyebrow">EDIÇÃO DOS DADOS</span>{historyStatus==='loaded'?<Picker label="Edição dos dados" value={date} onChange={setDate} searchable choices={dates.map((d,i)=>({id:d,title:edition(d),detail:i===0?'Mais recente':'Edição histórica'}))}/>:<strong>{edition(date)}</strong>}{historyStatus!=='loaded'&&<button type="button" className="subtle-button" onClick={loadHistory} disabled={historyStatus==='loading'}>{historyStatus==='loading'?'Carregando edições…':historyStatus==='error'?'Tentar carregar edições':'Ver outras edições ↗'}</button>}{historyStatus==='error'&&<span role="status" className="small-error">O histórico não carregou. A edição atual continua disponível.</span>}</div>}
        </div>
        {loading ? <div className="state-panel" role="status"><span className="loading-dot"/><h3>Buscando os preços pelo mundo…</h3><p>Preparando a edição mais recente disponível na API.</p></div> : error ? <div className="state-panel error-panel" role="alert"><span className="state-symbol">↻</span><h3>O balcão ainda não abriu.</h3><p>{error}</p><p>Confira se a API está disponível e tente novamente.</p><button className="button" onClick={()=>setAttempt(n=>n+1)}>Tentar novamente</button></div> : !a || !b ? <div className="state-panel" role="status"><h3>Ainda não há preços para comparar.</h3><p>A API não retornou registros com preço e câmbio válidos. Importe uma edição para começar.</p><button className="button" onClick={()=>setAttempt(n=>n+1)}>Atualizar dados</button></div> : <>
          <div className="comparison-box">
            <CountryCard value={a} options={countries} onChange={setACode} label="country-a"/>
            <button className="swap-button" onClick={()=>{setACode(b.code);setBCode(a.code);}} aria-label="Trocar países de posição">⇄</button>
            <CountryCard value={b} options={countries} onChange={setBCode} label="country-b"/>
          </div>
          <div className="insight" aria-live="polite" aria-atomic="true"><span className="insight-icon" aria-hidden="true">↳</span><div><p className="eyebrow">TRADUZINDO OS NÚMEROS</p><p>{a.code===b.code?<>Você escolheu o mesmo país. Experimente outro para descobrir a diferença.</>:samePrice?<>Nesta edição, os preços em <strong>{countryName(a)}</strong> e <strong>{countryName(b)}</strong> eram praticamente iguais em dólares.</>:<>Em <strong>{countryName(a)}</strong>, o Big Mac custava <mark>{decimal(Math.abs(delta))}% {delta<0?'menos':'mais'}</mark> que em <strong>{countryName(b)}</strong>.</>}</p><span>Comparação dos preços convertidos em dólares, com o câmbio de {edition(date)}.</span></div></div>
        </>}
      </section>

      <section className="explanation wrap" id="entenda" aria-labelledby="explain-title">
        <div className="section-top"><div><p className="eyebrow">02 / POR TRÁS DA MORDIDA</p><h2 id="explain-title">Tá, mas o que isso significa?</h2></div><p className="section-description">Um hambúrguer ajuda a fazer uma pergunta grande: quanto vale uma moeda em relação a outra?</p></div>
        <div className="steps">
          <article className="step"><span className="step-number">1</span><span className="step-drawing" aria-hidden="true">≋</span><h3>Comece pelo preço.</h3><p>O Big Mac tem uma receita parecida em vários países. Ele vira uma referência simples para comparar preços.</p>{a&&b&&!loading&&!error&&<div className="step-example">{countryName(a)}: <strong>{money(a.local,a.currency)}</strong><br/>{countryName(b)}: <strong>{money(b.local,b.currency)}</strong></div>}</article>
          <article className="step"><span className="step-number">2</span><span className="step-drawing" aria-hidden="true">⇄</span><h3>Imagine outro câmbio.</h3><p>Que taxa de câmbio faria os dois hambúrgueres custarem o mesmo? Basta dividir um preço local pelo outro.</p>{a&&b&&!loading&&!error&&<div className="step-example">1 {b.currency} = <strong>{decimal(impliedExchange(a,b),3)} {a.currency}</strong><br/><span>Câmbio implícito no hambúrguer</span></div>}</article>
          <article className="step"><span className="step-number">3</span><span className="step-drawing" aria-hidden="true">↗</span><h3>Compare com a realidade.</h3><p>Se o câmbio observado é diferente, o índice sugere uma moeda subvalorizada ou sobrevalorizada em relação à outra.</p>{a&&b&&!loading&&!error&&<div className="step-example">1 {b.currency} = <strong>{decimal(actualExchange(a,b),3)} {a.currency}</strong><br/><span>Câmbio observado na edição</span></div>}</article>
        </div>
        {a&&b&&!loading&&!error&&a.code!==b.code&&<details className="methodology"><summary>E o que o índice sugere sobre {a.currency}?</summary><p>{a.currency===b.currency?'Os dois lugares usam a mesma moeda. A diferença mostra preços locais distintos, não uma diferença de câmbio entre moedas.':samePrice?`Os preços estão próximos da paridade nesta comparação.`:`Pelo índice bruto, ${a.currency} aparece ${decimal(Math.abs(delta))}% ${delta<0?'subvalorizada':'sobrevalorizada'} em relação a ${b.currency}. Isso descreve a distância entre o câmbio implícito e o observado nesta edição; não prevê para onde o câmbio vai.`}</p><p className="formula">Índice bruto = [(preço local A ÷ preço local B) ÷ (câmbio A ÷ câmbio B) − 1] × 100</p></details>}
        <aside className="context-note"><span aria-hidden="true">✳</span><p><strong>Um hambúrguer não conta a história toda.</strong> Salários, impostos, aluguéis e custos locais também mudam o preço. O índice é uma comparação simplificada: não mede sozinho o custo de vida nem o poder de compra de quem mora no país.</p></aside>
      </section>

      {a&&b&&!loading&&!error&&<section className="explore-section" id="explore" aria-labelledby="explore-title"><div className="wrap explore-layout"><div className="explore-intro"><p className="eyebrow">03 / SEU DINHEIRO, MUNDO AFORA</p><h2 id="explore-title">E se o mundo<br/>fosse um cardápio?</h2><p>Converta um valor de {countryName(a)} e veja quantos Big Macs ele compraria em cada lugar.</p><label className="eyebrow" htmlFor="budget">QUANTO VOCÊ LEVARIA?</label><div className="budget-input"><span>{a.currency}</span><input id="budget" type="number" min="0" max="1000000000" step="any" value={budget} onChange={e=>setBudget(e.target.value)} aria-invalid={!validBudget} aria-describedby="budget-help"/></div><p id="budget-help" className={!validBudget?'small-error':'budget-help'}>{validBudget?`Valor convertido pelo câmbio de ${edition(date)}. Sem taxas de conversão.`:'Digite um valor de 0 a 1 bilhão.'}</p><div className="budget-result" aria-live="polite">{validBudget?<><span>EM {countryName(b).toLocaleUpperCase('pt-BR')}</span><strong>{decimal(burgerCount(amount,a,b))}<small> Big Macs</small></strong><p>com {money(amount,a.currency)}</p></>:<p>Preencha um valor para comparar.</p>}</div><p className="ranking-note">As quantidades incluem frações para facilitar a comparação. Não representam preços de um pedido real.</p></div>
          <div className="ranking-panel"><div className="ranking-title"><h3>O preço pelo mundo</h3><span>{countries.length} lugares · {edition(date)}</span></div><div className="ranking-controls"><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Buscar país no ranking" placeholder="Buscar um país" value={query} onChange={e=>{setQuery(e.target.value);setShowAll(false);}}/></label><Picker label="Ordenar ranking" value={sort} onChange={id=>setSort(id as 'cheap'|'expensive')} choices={[{id:'cheap',title:'Mais baratos primeiro'},{id:'expensive',title:'Mais caros primeiro'}]}/></div><div className="ranking-head"><span>PAÍS / PREÇO EM US$</span><span>BIG MACS COM SEU VALOR</span></div><ol className="ranking-list">{shown.map(p=><li key={p.code} className={p.code===a.code?'selected-row':''}><span className="rank-flag" aria-hidden="true">{flag(p.code)}</span><div className="rank-detail"><div><button onClick={()=>{setBCode(p.code);document.getElementById('comparar')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}} aria-label={`Comparar com ${countryName(p)}`}>{countryName(p)}{p.code===a.code&&<small>SEU PAÍS</small>}</button><span>{money(p.dollars)}</span></div><div className="bar-track" aria-hidden="true"><div style={{width:`${p.dollars/maxPrice*100}%`}}/></div></div><strong className="rank-count">{validBudget?decimal(burgerCount(amount,a,p)):'—'}<span> Big Macs</span></strong></li>)}</ol>{!shown.length&&<p className="no-results" role="status">Nenhum país encontrado para “{query}”.</p>}{ranking.length>8&&<button className="show-all" onClick={()=>setShowAll(v=>!v)}>{showAll?'Mostrar menos ↑':`Ver todos os ${ranking.length} lugares ↓`}</button>}<p className="table-help">Clique em um país para levá-lo à comparação.</p></div>
        </div></section>}
    </main>
    <footer className="wrap footer"><div><a href="#" className="footer-brand">Big Mac, mundo afora.</a><p>Economia fica melhor quando todo mundo entende.</p></div><div><p>Dados: <a href="https://github.com/TheEconomist/big-mac-data" target="_blank" rel="noreferrer">The Economist ↗</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · Índice bruto</p><p><a href="https://en.wikipedia.org/wiki/Big_Mac_Index" target="_blank" rel="noreferrer">Conheça a metodologia ↗</a></p><p className="disclaimer">Projeto educativo independente, sem vínculo com McDonald’s ou The Economist.</p></div></footer>
  </>;
}

export default App;
