# Big Mac, mundo afora

Frontend independente em React + TypeScript + Vite para a Big Mac Index API. Interface em português, responsiva, com comparação entre países, explicação do índice bruto, escolha de edição histórica e ranking com orçamento editável.

**Produção:** [bigmac.gurgelrenan.tech](https://bigmac.gurgelrenan.tech). A [API pública](https://bigmac-api.gurgelrenan.tech/api/v1/big_macs/latest) roda na mesma VPS Hostinger; o site consulta `/api/v1` pelo próprio domínio.

## Desenvolvimento

Requisitos: Node.js 20.19+ (ou 22.12+) e a API Rails com o banco populado.

```sh
# No projeto da API, em outro terminal:
DISABLE_SPRING=1 bundle exec rails server -b 127.0.0.1 -p 3000

# Neste projeto:
npm install
cp .env.example .env.local
npm run dev
```

Abra http://127.0.0.1:5173. O proxy de desenvolvimento encaminha `/api` para `http://127.0.0.1:3000`; ajuste `API_PROXY_TARGET` em `.env.local` caso necessário. Reinicie o Vite após mudar o ambiente. Não é necessário alterar CORS para esse fluxo.

```sh
npm test
npm run build
```

## API e produção

- `GET /api/v1/big_macs/latest`: primeira carga, edição mais recente disponível.
- `GET /api/v1/big_macs`: carregamento sob demanda das demais edições.
- A resposta segue JSON:API (`data[].attributes`). Valores decimais em string são normalizados e registros sem preço/câmbio positivo são descartados. Países são comparados dentro da mesma edição.
- Não há valores fictícios nem fallback silencioso. Carregamento, falha com nova tentativa, ausência de dados e busca sem resultados têm estados próprios.

O deploy na VPS usa Docker, Nginx e Kamal; veja [DEPLOY.md](DEPLOY.md). O Nginx encaminha `/api` à API pela rede interna, preservando o acesso no mesmo domínio. Para outra hospedagem, defina `VITE_API_BASE_URL=https://seu-host/api/v1` antes de `npm run build` e hospede `dist/`; configure CORS para a origem do frontend caso a API use outro domínio. O proxy do Vite funciona somente no desenvolvimento. Variáveis `VITE_*` são públicas: nunca inclua tokens nelas.

## Cálculos

O preço em dólares é `local_price / dollar_ex`. A diferença percentual é `(preço USD A / preço USD B - 1) × 100`. O câmbio implícito é `preço local A / preço local B`, na mesma orientação do câmbio observado `dollar_ex A / dollar_ex B`. O orçamento usa a moeda do primeiro país e é convertido pelo câmbio da edição, sem taxas. A interface apresenta o índice bruto; não mistura o índice ajustado por renda.

O índice é uma aproximação didática da paridade do poder de compra. Não mede sozinho custo de vida, renda disponível ou capacidade de compra dos moradores. Comparações entre lugares com a mesma moeda são diferenças de preços, não avaliação cambial.

## Direção visual

Veja [design/README.md](design/README.md) para as referências Uizze e o alvo visual gerado. A interface é implementada em texto, controles nativos e SVG; a imagem do alvo não substitui a página.

Fontes: DM Sans e DM Serif Display via Google Fonts, com fallback local. Dados: [The Economist](https://github.com/TheEconomist/big-mac-data). Projeto educativo independente, sem afiliação às marcas citadas.

## Verificação desta implementação

- Build de produção concluído.
- 13 testes aprovados: cálculos, normalização JSON:API, erros de rede e interações da interface.
- API Rails e proxy do Vite verificados com 54 registros reais da edição de julho de 2026.
- Revisão visual concluída com capturas reais em desktop (1440 × 1000) e celular emulado (390 × 664), usando Chromium/Playwright. Seletor de ordenação ampliado após inspeção.
- 16 testes de navegador aprovados: dados reais, troca de países, mesma seleção, edições, orçamento, filtro, recuperação de erro e resposta vazia. Sem erros JavaScript ou estouro horizontal no fluxo principal.
- Deploy inicial validado em 6 de novembro de 2026: frontend e API com HTTPS, 2.056 registros importados e 54 registros na edição de julho de 2026. Os 16 testes Playwright passaram contra o site publicado em desktop e celular. O Fiscaliza continuou respondendo com HTTP 200.
- `npm run lint` conclui com um aviso existente de `react(set-state-in-effect)` em `src/App.tsx`.

## Testes no navegador

Com frontend e API em execução:

```sh
npm run test:e2e
# Ou contra o deploy de produção:
PLAYWRIGHT_BASE_URL=https://bigmac.gurgelrenan.tech npm run test:e2e
```

O padrão usa o Google Chrome instalado, em perfil temporário isolado. Para usar outro Chromium, informe `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. A URL pode ser alterada com `PLAYWRIGHT_BASE_URL`. O relatório completo fica em `playwright-report/index.html` (ignorado pelo Git). Os testes de falha e ausência de dados interceptam a resposta somente no navegador de teste; os demais consultam a API do ambiente selecionado.

Capturas revisadas: [desktop](design/review-desktop.png) e [celular](design/review-mobile.png).

## Seletores

Países, edições e ordenação usam um componente compartilhado em `src/Picker.tsx`, com React Aria Components. Países e edições têm busca sem distinção de acentos. Os menus suportam teclado, indicação da opção selecionada, Escape, clique fora e retorno de foco. As opções de países exibem bandeira e moeda. Capturas: [desktop](design/selector-desktop.png) e [celular](design/selector-mobile.png). A suíte Playwright cobre essas interações nos dois tamanhos.

## Licença e atribuições

O código deste frontend está disponível sob a [licença MIT](LICENSE), copyright © 2026 Renan Gurgel. Dependências, fontes, marcas e dados de terceiros conservam suas próprias licenças e direitos; a licença deste projeto não os substitui.

**Dados do Índice Big Mac:** The Economist, [The Big Mac index — dados e metodologia](https://github.com/TheEconomist/big-mac-data), disponibilizados sob a [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/), conforme a [declaração de licença da fonte](https://github.com/TheEconomist/big-mac-data#licence). A licença da fonte não abrange conteúdo e dados de terceiros que não sejam de autoria do The Economist.

Este frontend acessa os dados pela Big Mac Index API, traduz nomes de países e recalcula preços convertidos, diferenças percentuais e quantidades de hambúrgueres para exibição, com arredondamento. A edição utilizada aparece na interface. Essas adaptações são deste projeto e não indicam aprovação do The Economist.

Projeto educativo independente, sem vínculo com McDonald’s ou The Economist. As marcas pertencem aos respectivos titulares.
