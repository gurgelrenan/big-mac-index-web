# Direção visual e referências

Conceito: economia em uma mordida. Fundo creme, tinta escura, tomate e mostarda. Títulos editoriais em serifada, interface em sans, ilustração de hambúrguer em SVG, bordas finas e números hierarquizados.

Referências consultadas com Uizze:

- [Tremor — Dashboard chart components](https://uizze.com/packs/36d22879-1291-4d20-8152-67196b85388f): referência direta de visualização de dados; inspira legibilidade e barras horizontais, sem adicionar a biblioteca.
- [Fathom Analytics — Website analytics dashboard](https://uizze.com/packs/70d0c4e8-0e70-490a-b58b-4a6a3d7ff2cb): referência direta de dados e tabelas, com hierarquia calma e pouco ruído.
- [Wirepay — Wallet, cards, and currency exchange](https://uizze.com/packs/b37d690a-2b8e-4bb2-a709-0e128c2cf2e9): referência relacionada a moedas; não demonstra um conversor.

O alvo `visual-target.png` foi criado com o ImageGen integrado antes da implementação. Números e textos da imagem são ilustrativos e não são usados como dados no frontend. A interface final usa dados reais da API e inclui limitações metodológicas mais precisas.

Prompt utilizado:

> Use case: ui-mockup. Create a polished realistic desktop web interface design target, 1440px wide, for a Portuguese educational Big Mac Index explorer named 'Big Mac, mundo afora'. Warm ivory #FAF6ED, deep ink #29251F, tomato #C7472D, mustard #E7B446. Editorial food magazine meets data journalism. Compact top nav with simple burger symbol brand and links Compare, Entenda, Explore. Huge left-aligned headline 'Um hambúrguer. Muitas economias.' with tomato emphasis and short intro. Right hero has a charming flat cut-paper double burger illustration, mustard circular backdrop and tiny Brazil/USA paper price tags. Below hero a white bordered comparison workbench, two country dropdowns Brasil and Estados Unidos separated by small swap button. Each column has large local price and dollar equivalent. Small edition label above. Warm peach narrative strip under comparison with clear cheaper percentage example explicitly illustrative. Below a three-step explanation of price/currency, and world ranking horizontal bars. Elegant tight serif display headings, clean sans body, ample intentional whitespace, thin dark rules, restrained round corners, no gradients or generic SaaS dashboard, no device mockup. All numeric examples label 'Exemplo ilustrativo'. This is visual target only, make legible coherent hierarchy.

Refinamento dos seletores: [Stripe — Account creation form](https://uizze.com/packs/51946660-f763-427c-bc17-7784c1fbe255), encontrado no Uizze como referência direta de country selector. A interface mantém a paleta editorial existente e usa um menu com busca, bandeira, moeda e seleção marcada. Capturas reais em `selector-desktop.png` e `selector-mobile.png`.
