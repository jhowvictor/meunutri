# Redesign Premium MeuNutri.AI

Vou redesenhar toda a experiência logada (Home, Perfil, Onboarding) mantendo todas as funcionalidades já existentes (Receitas, Dietas, Treinos, E-books, Análise de Refeição, Evolução Corporal, Lista de Compras, Mini Chef, Biblioteca).

## 1. Design System Premium

- Fundo preto premium `#050505`, verde neon `#00ff88` como cor principal
- Glassmorphism leve em cards (`backdrop-blur`, bordas suaves `rounded-2xl`, glow sutil)
- Atualizar `src/index.css` e `tailwind.config.ts` com novos tokens (background, primary, glow, glass-border)
- Micro animações (fade-in, hover scale, glow pulse)
- Remover botão "+" central da navegação

## 2. Nova Home (`src/pages/Index.tsx`)

Estrutura inspirada na referência (sem copiar):

- **Header**: logo MeuNutri.AI + sino de notificações + avatar do usuário (puxa foto do perfil)
- **Hero**: saudação personalizada ("Olá, {Nome} 👋"), headline, subheadline, CTA "Criar agora" + atalho Mini Chef, imagem premium de comida com orbitais de ícones
- **Grid de Ferramentas** ("O que você deseja criar hoje?"): cards horizontais roláveis com TODAS as 8 funcionalidades (Receitas, Dietas, Treinos, E-books, Revolução Corporal, Análise de Refeição, Lista de Compras, Biblioteca)
- **Continue de onde parou**: últimos itens da `library_items` + `recipes` agrupados por tipo, com miniatura, título e data
- **Seus favoritos**: itens com `is_favorite=true`
- **Dashboard pessoal**: cards opcionais com peso atual, meta, sequência de uso

## 3. Navegação Inferior (novo componente `BottomNav.tsx`)

- 🏠 Início → `/`
- 📚 Biblioteca → `/minha-biblioteca`
- ❤️ Favoritos → `/favoritos` (nova página filtrando library_items favoritos)
- 👤 Perfil → `/perfil`
- **Sem botão "+"**

## 4. Mini Chef flutuante (atualizar `MiniChef.tsx`)

- Botão flutuante fixo bottom-right com glow verde pulsante
- Balão de sugestão contextual ("Posso te ajudar? Fale comigo!")
- Sugestões rápidas no chat: "Melhorar minha dieta", "Adaptar receita", "Ajuda com treino"
- Não interfere na bottom nav

## 5. Sistema de Perfil Completo

**Banco** (nova migration):
- Tabela `profiles` com: avatar_url, full_name, age, sex, height_cm, weight_kg, target_weight_kg, main_goal, activity_level, dietary_restrictions[], food_preferences[], onboarding_completed, streak_days
- Bucket de storage `avatars` para fotos de perfil
- RLS + GRANTs corretos
- Trigger `handle_new_user` para criar profile no signup

**Páginas novas**:
- `src/pages/Perfil.tsx`: foto, dados pessoais, objetivos, peso, medidas, preferências, configurações, segurança (com seções em accordion/tabs)
- `src/pages/Onboarding.tsx`: 5 passos (foto+básicos → objetivos → preferências → atividade → conclusão), com barra de progresso
- `src/pages/Favoritos.tsx`: lista de favoritos por categoria

**Hook** `useProfile.ts` para carregar/atualizar perfil em qualquer página.

## 6. Personalização da experiência

- Mini Chef e geradores (Dieta, Treino, Receita) recebem o perfil como contexto no prompt para personalizar resultados
- Saudação dinâmica na Home baseada no objetivo do usuário

## 7. Fluxo de Auth

- Após signup, redirecionar para `/onboarding` se `onboarding_completed=false`
- Após login, ir direto para `/` se já completou

## Arquivos a criar
- `supabase/migrations/...profiles.sql`
- `src/hooks/useProfile.ts`
- `src/components/BottomNav.tsx`
- `src/components/AppShell.tsx` (wrapper com header + bottom nav + mini chef)
- `src/pages/Perfil.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/Favoritos.tsx`
- `src/assets/hero-food.jpg` (gerado)

## Arquivos a editar
- `src/index.css`, `tailwind.config.ts` (tokens premium)
- `src/pages/Index.tsx` (redesign completo)
- `src/components/Header.tsx` (avatar + notificações)
- `src/components/MiniChef.tsx` (flutuante + sugestões)
- `src/App.tsx` (novas rotas + redirect onboarding)
- `src/pages/Auth.tsx` (redirect para onboarding após signup)

## Escopo / não-objetivos
- Tela de login permanece intacta visualmente
- Notificações: apenas UI do sino (sem sistema de push real) — pode ser ampliado depois
- Conquistas/streak: visual + contador básico baseado em `created_at` dos itens da biblioteca

Posso prosseguir com a implementação?