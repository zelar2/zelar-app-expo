# ZELAR+ — Expo / React Native

Port do app web `healthee-reach-main` (TanStack Start + Vite + Tailwind + Radix)
para **Expo Router / React Native**.

## Como rodar

```bash
npm install
cp .env.example .env      # preencha com a URL e a anon key do seu Supabase
npx expo start
```

Abra no Expo Go (Android/iOS) ou em um emulador. Este pacote não foi rodado
com `npm install` neste ambiente (sem acesso à internet aqui), mas todo o
código TypeScript/TSX foi validado sintaticamente (114 arquivos, 0 erros).

## O que está portado

### Núcleo (lógica idêntica ao original)
- Cliente Supabase + tipos do banco (`Database`) — única mudança é
  `localStorage` → `AsyncStorage`, necessária em React Native.
- Autenticação completa: login, cadastro, OAuth Google, callback, mesma
  validação com zod (`app/auth.tsx`, `app/auth-callback.tsx`).
- `AuthContext`/`useAuth`, hooks `useRole`/`usePermission`/`usePermissions`.
- RBAC completo: `src/permissions/*` e `src/lib/route-access.ts`, copiados
  sem alteração — a mesma fonte única de verdade de papéis/permissões do
  projeto web.
- Menu de módulos (`src/lib/module-menu.data.ts`) — mesmos grupos, rótulos
  e visibilidade por papel, renderizado como Drawer nativo.

### Todas as ~90 rotas do app original existem e navegam
- As **76 rotas do menu principal** (`MODULE_GROUPS`) — mesmo caminho e
  mesma regra de RBAC da versão web.
- As rotas secundárias que no original **não ficam no menu**: fichas de
  detalhe (`usuarios-detalhe`, `cliente-perfil`, `profissional-perfil`,
  `chamada-detalhe`) e formulários "novo" de RH (`escalas-novo`,
  `ferias-novo`, `afastamentos-novo`, `banco-horas-novo`,
  `avaliacoes-funcionarios-novo`, `folha-pagamento-novo`,
  `colaboradores-novo`, `contratos-novo`), mais `onboarding` e `backup`.
- 3 rotas (`colaboradores.novo`, `contratos.novo`, `backup`) eram **stubs
  "Hello..."** já no projeto original (nunca foram implementadas na versão
  web) — portadas no mesmo estado, sem regressão.

### Telas com dados reais (não são mocks)
52 das telas de listagem já buscam dados **reais** da tabela Supabase
correspondente à tela original (mapeamento extraído diretamente das
chamadas `.from(...)` de cada arquivo de rota web — ex: `agenda` →
`appointments`, `clientes` → `clientes`, `enfermagem` → `sae_records`,
`folha-pagamento` → `folha_pagamento` etc.), com pull-to-refresh e
tratamento de erro/carregando. `usuarios`, `clientes`, `profissionais` e
`chamadas` já navegam para sua ficha de detalhe ao tocar em um item.
Dashboards (`dashboard-executivo`, `dashboard-profissional`, `admin`) usam
contagens reais via `count` do Supabase.

## Atualização desta rodada de port

- **Kit de UI nativo** (`src/components/ui/Kit.tsx`): `Card`, `Badge` (com
  detecção automática de tom por status), `InitialsAvatar`, `SectionHeader`,
  `SearchInput`, `StatCard`, `AppButton`, `Field`, estados de
  loading/erro/vazio. Usado por `GenericScreen`, `DetailScreen` e pelas
  telas customizadas abaixo — qualquer tela nova deve reaproveitar este kit.
- **`GenericScreen` e `DetailScreen` reescritos**: em vez de `JSON.stringify`
  bruto, agora renderizam cartões com avatar de iniciais, título/subtítulo
  detectados por heurística de campo (nome, categoria, data), badge de
  status colorido, busca local e pull-to-refresh. Como **82 das 95 rotas**
  ainda usam esses dois componentes, esta mudança melhora a aparência real
  de todas elas de uma vez, sem precisar tocar arquivo por arquivo.
- **3 telas totalmente customizadas** (não usam mais `GenericScreen`):
  - `inicio.tsx` — hero banner por papel, grade de atalhos, tira de
    categorias e prévia de profissionais reais (paciente/familiar/
    profissional/admin), fiel ao layout original.
  - `agenda.tsx` — faixa de 14 dias com contagem de atendimentos, lista do
    dia selecionado com ícone/hora/status, e modal nativo de "Novo
    atendimento" com os mesmos campos e grava na tabela `appointments`.
  - `financeiro.tsx` — carteira, movimentação recente, tabela de
    honorários por categoria (catálogo real portado para
    `src/data/service-catalog.ts`, sem os imports de asset só-web) com
    busca, carrinho de orçamento com quantidade, orçamentos salvos
    (CRUD completo na tabela `quotes`) e modal de salvar/editar.

## O que ainda falta (não é possível "1:1 sem mudar nada")

Componentes web (Radix UI + Tailwind, `<div>`/CSS) não têm equivalente
automático em React Native — não existe ferramenta que converta isso sem
reescrever a camada visual. O que resta, tela a tela:

- **UI específica de cada tela**: hoje as telas de listagem/formulário usam
  `GenericScreen`/`DetailScreen` (componentes genéricos que já buscam dados
  reais, mas mostram como JSON bruto em vez do layout, filtros, gráficos e
  ações específicas de cada uma — ex: dashboard-executivo tinha 645 linhas
  com sparklines SVG; cliente.$clienteId tinha 1063 linhas de formulário
  multi-abas).
- Os 66 componentes de `src/components/ui/*` (baseados em Radix): cada um
  precisa de um equivalente nativo (`dialog.tsx` → `Modal`, `select.tsx` →
  picker nativo, `table.tsx` → `FlatList` com colunas, etc). Nenhum foi
  portado individualmente — as telas atuais usam estilos nativos diretos.
- Funcionalidades que dependem de infraestrutura própria de plataforma:
  mapa de atendimentos (`react-leaflet` → `react-native-maps`, já está no
  `package.json` mas a tela ainda não desenha o mapa), chat em tempo real
  (Supabase Realtime funciona igual em RN, falta a UI de conversa),
  teleconsulta/videochamada (WebRTC precisa de SDK nativo, ex:
  `react-native-webrtc`), assinatura de documentos e upload de arquivos
  (precisa de `expo-document-picker`/`expo-file-system`).
- Formulários de criação (`*-novo`) hoje listam a tabela em vez de
  apresentar o formulário completo com os mesmos campos/validação do
  original.

## Estrutura

```
app/
  _layout.tsx           # providers globais (Auth, React Query) + Stack
  index.tsx              # redireciona /inicio ou /auth conforme sessão
  auth.tsx                # login / cadastro
  auth-callback.tsx        # retorno do OAuth
  (app)/
    _layout.tsx            # Drawer autenticado (guarda de sessão + menu RBAC)
    inicio.tsx               # dashboard inicial
    dashboard-executivo.tsx   # métricas reais (contagens Supabase)
    dashboard-profissional.tsx
    admin.tsx                  # porta fiel do original (RoleGuard)
    usuarios.tsx / usuarios-detalhe.tsx   # lista + ficha (dados reais)
    clientes.tsx / cliente-perfil.tsx
    profissionais.tsx / profissional-perfil.tsx
    chamadas.tsx / chamada-detalhe.tsx
    ...demais ~80 rotas (uma tela por rota original)
src/
  integrations/supabase/     # cliente + tipos (Database)
  context/                    # AuthContext / useAuth
  permissions/                 # ROLES, PERMISSIONS (idêntico ao original)
  hooks/                        # useRole, usePermission, usePermissions
  lib/route-access.ts            # RBAC de navegação (idêntico ao original)
  lib/module-menu.data.ts         # menu de módulos (idêntico, adaptado de
                                    # LinkProps do TanStack Router p/ string)
  components/
    GenericScreen.tsx             # lista genérica com dados reais + navegação
    DetailScreen.tsx               # ficha genérica com dados reais por id
    MetricCard.tsx                  # cartão de métrica dos dashboards
    RoleGuard.tsx                    # porta fiel do guard original
    AppMenu.tsx                       # menu lateral (Drawer)
  theme/colors.ts                     # paleta
```

## Próximos passos sugeridos (por ordem de impacto)
1. Portar os 66 componentes `ui/*` mais usados (Button, Card, Badge, Table,
   Dialog, Select, Tabs) como uma pequena lib de UI nativa reutilizável.
2. Substituir `GenericScreen`/`DetailScreen` pela UI real das telas mais
   usadas: `inicio`, `agenda`, `clientes`, `atendimentos`, `financeiro`.
3. Mapa (`react-native-maps`), chat (Realtime) e teleconsulta (WebRTC).
4. Formulários de criação/edição completos (`react-hook-form` já funciona
   em RN sem mudanças — falta só a camada de inputs nativos).
