# ZELAR+ Expo — Relatório de status (rodada atual)

## Resumo
Das 90 telas do app (rotas em `app/(app)/`), **89 têm funcionalidade real**
ligada ao Supabase — sem tela "fantasma"/placeholder. A única tela ainda
somente-leitura por decisão de design é `profissionais.tsx` (diretório de
profissionais; edição de cadastro é feita em `usuarios.tsx`, que tem CRUD
completo).

| Tipo de tela | Quantidade | O que faz |
|---|---|---|
| CRUD completo (`CrudScreen`) | 58 | Lista + busca + criar + editar + excluir, direto no Supabase |
| Formulário dedicado (`EntityFormScreen`) | 9 | As rotas `*-novo` de RH/contratos |
| Ficha de detalhe (`DetailScreen`) | 5 | Registro completo por id |
| Telas sob medida | 26 | Dashboards, mapa, chat de IA, onboarding, upload de arquivo etc. (ver lista abaixo) |
| Somente leitura (intencional) | 1 | Diretório de profissionais |

### Telas sob medida construídas/mantidas nesta rodada
`inicio`, `agenda`, `chat`, `sos`, `teleconsulta`, `financeiro` (já existiam,
reais) + `mapa` (novo — `react-native-maps` com pontos reais de
`service_calls`), `assistente-ia` e `chat-ia` (porta fiel do comportamento
simulado do webapp), `notificacoes` (marcar como lida), `minha-conta`,
`seguranca` (troca de senha real via `supabase.auth`), `configuracoes`,
`onboarding`, `upload-documentos` (`expo-document-picker` + Supabase
Storage, bucket `documentos`), `dashboard-cliente`, `portal-cliente`,
`cliente-historico` (linha do tempo agregando 3 tabelas), `analytics`,
`monitoramento`, `status-sistema` (contagens agregadas reais),
`dashboard-executivo`, `dashboard-profissional`, `admin`, `perfil`.

## Correções de mapeamento (bugs reais que existiam nos stubs)
- `assinatura-documentos`, `upload-documentos` e `aprovacoes` apontavam para
  uma tabela **`documentos` que não existe** no schema — corrigido para
  `profissional_documentos` (tabela real).
- `assinaturas`, `planos`, `cupons`, `convenios`, `comissoes` apontavam
  todas para a tabela genérica `quotes`, sem relação nenhuma com o
  conceito de cada tela. Corrigido: `assinaturas`→`subscriptions`,
  `planos`→`plans` (ambas já existiam), e criei uma **migration nova**
  (`20260827090000_cupons_convenios_comissoes.sql`) com as tabelas reais
  `cupons`, `convenios` e `comissoes` (schema + RLS completos).
- `auditoria` apontava para `notifications`; corrigido para `audit_logs`
  (a tabela de trilha de auditoria correta, somente leitura).
- `avaliacoes` apontava para a tabela errada (`evaluations`, que também
  existe mas é outro conceito); corrigido para `avaliacoes` (a tabela
  usada de fato pelo dashboard do profissional).
- O bucket de Storage `documentos`, referenciado pelo código mas nunca
  criado por nenhuma migration, agora tem sua própria migration
  (`20260827091500_documentos_storage_bucket.sql`) com policies de RLS.

## O que ainda falta (real, não pequeno)
1. **Teleconsulta em vídeo de verdade**: a tela `teleconsulta.tsx` existe e
   gerencia a sessão via Supabase, mas a chamada de vídeo em si (WebRTC)
   precisa de um SDK nativo (`react-native-webrtc` ou um provedor como
   Daily/Twilio) — não incluí isso por exigir conta/API key de terceiros.
2. **Assistente de IA real**: tanto no app quanto no webapp original, o
   "Assistente IA" e "Chat com IA" respondem com lógica simulada
   (`if/else` local) — a própria versão web nunca teve uma API de IA
   conectada. Para IA de verdade, é preciso criar uma Supabase Edge
   Function chamando OpenAI/Anthropic e trocar a função `generateResponse`
   local por uma chamada a essa function.
3. **Gráficos de tendência** no `dashboard-executivo` (o original web tinha
   645 linhas com sparklines) — a versão atual mostra as métricas reais em
   cards, mas sem os gráficos de série temporal nem exportação PDF/Excel.
4. **Push notifications reais** (Firebase/Expo Notifications) — a tabela
   `notification_settings` e a tela de preferências existem e gravam de
   verdade, mas o envio de push em si (registro de device token,
   Edge Function de disparo) não foi implementado.
5. **Testar/instalar de fato**: este ambiente não tem acesso à internet,
   então não rodei `npm install`, `npx expo start`, nem `npm run build` —
   o código foi revisado com cuidado e os padrões seguem exatamente os
   arquivos que já existiam e funcionavam no projeto, mas o primeiro
   `npm install` + build local é o teste real de que tudo compila.
6. Supabase e Cloudflare: **schema e infraestrutura como código estão
   prontos** (migrations + `wrangler.toml`), mas alguém com acesso à
   internet precisa efetivamente criar o projeto Supabase, rodar
   `supabase db push`, criar a conta Cloudflare e rodar `wrangler deploy`
   — passo a passo em `SUPABASE_SETUP.md` e `CLOUDFLARE_DEPLOY.md`.

## Como validar
```bash
cd zelar-app-expo
npm install
cp .env.example .env   # preencha com seu projeto Supabase (ver SUPABASE_SETUP.md no webapp)
npx expo start
```
