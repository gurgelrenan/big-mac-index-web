# Deploy na VPS

O frontend usa Docker + Kamal 2 em `bigmac.gurgelrenan.tech`. O build do Vite é servido por Nginx; `/api/` passa pela rede Docker até o Kamal Proxy, com o host `bigmac-api.gurgelrenan.tech`. Não é necessário configurar CORS nem expor a porta do Rails.

## Infraestrutura em produção

| Serviço | Domínio / recurso |
| --- | --- |
| Frontend | `https://bigmac.gurgelrenan.tech` |
| API Rails | `https://bigmac-api.gurgelrenan.tech` |
| Fiscaliza, na mesma VPS | `https://deputados.gurgelrenan.tech` |
| Imagem do frontend | `ghcr.io/gurgelrenan/big-mac-index-web` (`amd64`) |
| Rede Docker compartilhada | `kamal` |

Os registros A dos dois domínios Big Mac apontam para `187.77.50.57`, com proxy Cloudflare ativado. O Traefik existente mantém as portas 80/443, redireciona HTTP para HTTPS e emite certificados pelo resolver `letsencrypt` na entrypoint `websecure`.

Fluxo: Cloudflare → Traefik → `big-mac-index-web-router` → `kamal-proxy` → Nginx do frontend. As chamadas `/api/` retornam ao Kamal Proxy com o host da API e seguem para o Rails. A aplicação tem limite de memória de 64 MB; o router, 32 MB.

## Preparar

Tenha Docker, Ruby (3.2 ou superior), Bundler e acesso SSH à VPS. Ruby e Bundler são usados somente na ferramenta de deploy.

```sh
bundle install
cp .kamal/secrets.example .kamal/secrets
```

Preencha `KAMAL_REGISTRY_PASSWORD` com uma credencial GHCR com permissão de publicação. Não versione o arquivo de segredos. A VPS padrão é `187.77.50.57`; altere com `KAMAL_HOST`.

## Publicar

Publique a API e importe os dados antes de publicar o frontend. Crie o DNS A de `bigmac.gurgelrenan.tech` para a VPS.

```sh
npm test
npm run lint
npm run build
bin/kamal deploy
bin/kamal accessory boot router  # Somente na primeira publicação.
```

O acessório `router` adiciona a rota no Traefik existente. O Traefik emite o certificado HTTPS. Nenhuma porta 80/443 adicional é publicada e o proxy compartilhado do Fiscaliza não precisa ser reiniciado.

O build usa o contexto local (`builder.context: .`): revise `git diff` e registre as mudanças no Git para rastrear cada release. Arquivos `.env*` e `.kamal/` são excluídos da imagem; a API usa o caminho relativo `/api/v1`.

## Verificar e atualizar

```sh
curl -f https://bigmac.gurgelrenan.tech/up
curl -f https://bigmac.gurgelrenan.tech/api/v1/big_macs/latest
PLAYWRIGHT_BASE_URL=https://bigmac.gurgelrenan.tech npm run test:e2e
bin/kamal app logs
bin/kamal deploy
bin/kamal rollback VERSION
```

O Nginx mantém HTML sem cache e assets com hash em cache por um ano. Accessories são gerenciados separadamente dos releases da aplicação.

Não use `kamal proxy reboot`, `kamal proxy remove` ou `kamal server bootstrap` como etapa rotineira: o proxy e a VPS também atendem o Fiscaliza e a API. Para mudar a configuração do router, use `bin/kamal accessory reboot router`; ele é independente do container principal.

## Estado validado no deploy inicial

Em 6 de novembro de 2026, a release `web-20261106-1` foi publicada. Build e 13 testes de unidade/componentes passaram; lint apresentou um aviso existente em `src/App.tsx`. Os 16 testes Playwright passaram contra o domínio público em desktop e celular, e `/api/v1/big_macs/latest` retornou 54 registros de julho de 2026. HTTPS foi validado na origem e pela Cloudflare; Fiscaliza permaneceu com HTTP 200.

O frontend não tem banco nem arquivos persistentes. O banco e o procedimento de backup pertencem ao projeto `big-mac-index-api`; a configuração atual não inclui backup automático.
