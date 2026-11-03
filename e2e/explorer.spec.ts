import { test, expect } from '@playwright/test';

test('carrega dados reais, troca países e evita estouro horizontal', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.insight mark')).toBeVisible();
  await expect(page.getByRole('button',{name:/^Primeiro país:/})).toContainText('Brasil');
  await expect(page.getByRole('button',{name:/^País de comparação:/})).toContainText('Estados Unidos');
  const initial = Number((await page.locator('.insight mark').innerText()).match(/[\d,]+/)![0].replace(',','.'));
  expect(initial).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Trocar países de posição' }).click();
  await expect(page.getByRole('button',{name:/^Primeiro país:/})).toContainText('Estados Unidos');
  await expect(page.locator('.insight mark')).toContainText('mais');
  await page.getByRole('button', { name: 'Trocar países de posição' }).click();
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>window.scrollTo(0,0));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({path:`test-results/${testInfo.project.name}-page.png`, fullPage:true});
});

test('seleciona o mesmo país e explica a comparação',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:/^Primeiro país:/})).toBeVisible();
  await page.getByRole('button',{name:/^País de comparação:/}).click();
  await page.getByRole('searchbox').fill('Brasil');
  await page.getByRole('option',{name:/^Brasil/}).click();
  await expect(page.getByText(/Você escolheu o mesmo país/)).toBeVisible();
});

test('carrega outra edição e atualiza a comparação',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Ver outras edições ↗'}).click();
  const selector=page.getByRole('button',{name:/^Edição dos dados:/});
  await expect(selector).toBeVisible();
  const previous=await selector.innerText();
  await selector.click();
  const options=page.getByRole('option');
  expect(await options.count()).toBeGreaterThan(1);
  await options.nth(1).click();
  await expect(selector).not.toHaveText(previous);
  await expect(page.locator('.insight')).toBeVisible();
});

test('altera orçamento, filtra ranking e compara um resultado',async({page})=>{
  await page.goto('/');
  const budget=page.getByLabel('QUANTO VOCÊ LEVARIA?');
  await budget.fill('200');
  await expect(page.locator('.budget-result')).toContainText('200,00');
  await budget.fill('-10');
  await expect(page.getByText('Digite um valor de 0 a 1 bilhão.')).toBeVisible();
  await budget.fill('100');
  const search=page.getByLabel('Buscar país no ranking');
  await search.fill('xyz');
  await expect(page.getByText('Nenhum país encontrado para “xyz”.')).toBeVisible();
  await search.fill('Japão');
  await page.getByRole('button',{name:'Comparar com Japão'}).click();
  await expect(page.getByRole('button',{name:/^País de comparação:/})).toContainText('Japão');
});

test('mostra falha e recupera com nova tentativa',async({page})=>{
  let fail=true;
  await page.route('**/api/v1/big_macs/latest',async route=>{
    if(fail) await route.fulfill({status:503,contentType:'application/json',body:'{}'});
    else await route.continue();
  });
  await page.goto('/');
  await expect(page.getByText('O balcão ainda não abriu.')).toBeVisible();
  fail=false;
  await page.getByRole('button',{name:'Tentar novamente'}).click();
  await expect(page.getByRole('button',{name:/^Primeiro país:/})).toBeVisible();
});

test('mostra estado vazio sem números inventados',async({page})=>{
  await page.route('**/api/v1/big_macs/latest',route=>route.fulfill({json:{data:[]}}));
  await page.goto('/');
  await expect(page.getByText('Ainda não há preços para comparar.')).toBeVisible();
  await expect(page.getByRole('button',{name:/^Primeiro país:/})).toHaveCount(0);
});


test('busca países sem acentos, fecha com Escape e seleciona pelo teclado',async({page},testInfo)=>{
  await page.goto('/');
  const trigger=page.getByRole('button',{name:/^País de comparação:/});
  await trigger.click();
  const search=page.getByRole('searchbox');
  await search.fill('japao');
  await expect(page.getByRole('option',{name:/^Japão/})).toBeVisible();
  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(trigger).toContainText('Japão');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('searchbox').fill('xyz');
  await expect(page.getByText('Nenhum resultado. Tente outro nome.')).toBeVisible();
  await page.getByRole('searchbox').press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.locator('#comparar').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await trigger.click();
  await expect(page.locator('.picker-popover')).not.toHaveAttribute('data-entering','');
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.picker-popover')).toHaveCSS('opacity','1');
  await page.screenshot({path:`test-results/${testInfo.project.name}-country-picker.png`,animations:'disabled'});
  const box=await page.locator('.picker-popover').boundingBox();
  expect(box).toBeTruthy();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x+box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('ordena o ranking pelo menu e fecha ao clicar fora',async({page})=>{
  await page.goto('/');
  const trigger=page.getByRole('button',{name:/^Ordenar ranking:/});
  await trigger.click();
  await page.getByRole('option',{name:'Mais caros primeiro',exact:true}).click();
  await expect(trigger).toContainText('Mais caros primeiro');
  const prices=await page.locator('.rank-detail>div:first-child>span').allTextContents();
  const numeric=prices.map(p=>Number(p.replace(/[^0-9,]/g,'').replace(',','.')));
  expect(numeric[0]).toBeGreaterThanOrEqual(numeric[1]);
  await trigger.click();
  await page.mouse.click(5,5);
  await expect(page.getByRole('listbox')).toHaveCount(0);
});
