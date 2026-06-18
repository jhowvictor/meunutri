## Plano: Plataforma Modular de Motores (B2B / Profissionais)

Tudo abaixo é **acrescentado** ao que já existe. Nada será removido. Toda a área é exibida **somente para usuários cadastrados como profissional** (perfil B2B). Pacientes e usuários B2C continuam vendo o app como hoje.

### Onde aparece
- Novo painel no `ProDashboard` chamado **"Motores"**, com 6 cards (um por motor) abrindo páginas dedicadas em `/profissional/motores/*`.
- Bloqueio de rota: se o usuário não tiver `professional_profiles` (ou flag B2B), redireciona para `/`.
- Usuários B2C (Index) **não veem nada disso**.

### Os 6 Motores

**1. Motor de Criação (`/profissional/motores/criacao`)**
Atalhos para gerar — para um paciente específico — dieta, treino, receita ou plano inicial usando as páginas que já existem (`DietaPersonalizada`, `MontarTreino`, `ReceitaPersonalizada`), pré-preenchidas com dados do paciente. Sempre editável antes de enviar. Sem decisão clínica automática.

**2. Motor de Adaptação (`/profissional/motores/adaptacao`)**
Pega um plano já enviado ao paciente (`patient_assignments`) + últimos dados (peso/medidas/glicemia/adesão) e gera **nova versão sugerida** via IA (substituições de alimento/exercício, recálculo). Profissional revisa, edita, salva como nova versão e reenvia.

**3. Motor de Comunicação (`/profissional/motores/comunicacao`)**
- Envio por WhatsApp (link `wa.me`) e email (`mailto:`) com PDF anexado/linkado.
- PDFs já saem com branding do profissional (`proPdf.ts` existente — vamos reforçar).
- Templates de mensagem prontos (boas-vindas, envio de plano, lembrete, motivacional) com variáveis `{{nome}}`, `{{profissional}}`.

**4. Motor de Acompanhamento (`/profissional/motores/acompanhamento`)**
Dashboard consolidado: lista de pacientes com **status calculado** (ativo / alerta / inativo) baseado em `last_activity_at`, % de adesão (assignments concluídos / enviados), última atividade, alertas de abandono (>14 dias sem atividade). Filtros e ordenação.

**5. Motor de Relatórios (`/profissional/motores/relatorios`)**
Estende o `MonthlyReportButton` que já existe: relatórios **semanal**, **mensal**, **resumo de adesão**, **progresso de peso/hábitos**. Exporta PDF e oferece envio direto ao paciente.

**6. Motor de Conteúdo (`/profissional/motores/conteudo`)**
Biblioteca de mensagens prontas geradas por IA por categoria: educativa, motivacional, reengajamento, orientação diária/semanal. Botões "Copiar" e "Enviar para paciente".

### Banco de dados (migration)

Novas tabelas (com GRANTs + RLS escopadas ao `professional_id = auth.uid()`):

- `engine_message_templates` — templates do motor de conteúdo/comunicação (categoria, título, corpo com variáveis, criado pelo profissional ou padrão do sistema).
- `plan_versions` — versões de planos (`assignment_id`, `version_number`, `content_json`, `notes`, `created_at`) para o motor de adaptação.
- `professional_profiles` ganha colunas opcionais: `brand_color`, `logo_url`, `whatsapp_number` (se ainda não existirem) para o motor de comunicação.

### Componentes/arquivos novos
- `src/pages/profissional/MotoresHub.tsx` (grid dos 6 motores)
- `src/pages/profissional/motores/Criacao.tsx`
- `src/pages/profissional/motores/Adaptacao.tsx`
- `src/pages/profissional/motores/Comunicacao.tsx`
- `src/pages/profissional/motores/Acompanhamento.tsx`
- `src/pages/profissional/motores/Relatorios.tsx`
- `src/pages/profissional/motores/Conteudo.tsx`
- `src/components/ProfessionalGuard.tsx` — wrapper que checa `professional_profiles` e bloqueia B2C
- `src/lib/engineAi.ts` — chamadas IA para adaptação e conteúdo (usa `LOVABLE_API_KEY` via edge function existente `openai-chat` ou nova)
- Edge function `engine-adapt` — gera nova versão de plano a partir do contexto do paciente
- `supabase/migrations/<timestamp>_motores.sql`

### Arquivos editados
- `src/App.tsx` — novas rotas dentro de `ProtectedRoute` + `ProfessionalGuard`
- `src/pages/profissional/ProDashboard.tsx` — adiciona seção "Motores" com 6 cards
- `src/pages/Index.tsx` — **nenhuma mudança** (B2C intacto)

### Regras de produto reforçadas
- Toda saída de IA é **sugestão editável**, nunca aplicada automaticamente.
- Nada bloqueia o fluxo atual dos pacientes B2C.
- PDFs e mensagens sempre carregam nome + branding do profissional logado.

### Entrega
Vou implementar tudo em sequência: migration → guard + rotas → hub → 6 páginas de motor → edge function de adaptação → ajustes no `ProDashboard`. Depois rodamos os bugs juntos como você pediu.

Posso seguir?
