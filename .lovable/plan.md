## Visão geral

Transformar o MeuNutri.AI em uma plataforma com duas experiências (B2C "Pessoa" e B2B "Profissional"), adicionar módulo de Controle Glicêmico, modo treino interativo, painel de pacientes, relatórios PDF profissionais e melhorias nos módulos existentes.

Por ser um escopo muito grande (≈ 8-10 módulos novos + reformulação de 6 existentes), vou entregar em **fases**. Cada fase é funcional sozinha — você testa, aprova, e avançamos para a próxima.

---

## FASE 1 — Fundação B2C / B2B (essencial, primeiro passo)

Sem isto nada do resto faz sentido.

**Backend**
- Adicionar `account_type` em `profiles`: `pessoa` | `profissional`
- Tabela `professional_profiles`: nome de exibição, registro (CRN/CREF/CRM), especialidade, logotipo, branding (cor), bio
- Tabela `patients`: vínculo profissional ↔ paciente (com convite por e-mail)
- Tabela `patient_assignments`: itens enviados ao paciente (receita/dieta/treino/lista) com status
- RLS: profissional só vê seus pacientes; paciente só vê o que recebeu

**Frontend**
- Onboarding passo 0: escolher Pessoa ou Profissional
- Fluxo profissional preenche dados extras (registro, logo, especialidade)
- Roteamento condicional: Profissional vê dashboard `/profissional` no lugar da Home; Pessoa mantém a Home atual
- Novo `BottomNav` adaptativo por tipo de conta
- Página `/profissional/pacientes` com lista + semáforo (verde/amarelo/vermelho) por aderência
- Página `/profissional/paciente/:id` com abas: Dietas, Treinos, Receitas, Refeições, Evolução, Glicemia

---

## FASE 2 — Controle Glicêmico (módulo novo, B2C + B2B)

- Tabela `glucose_readings`: valor, tipo (jejum / pós-refeição / antes de dormir), observação, timestamp
- Tabela `glucose_goals`: metas definidas por profissional para paciente
- Página `/glicemia`: registro rápido + gráficos diário/semanal/mensal (recharts)
- Análise por IA via edge function: padrões, melhorias, alertas
- No painel profissional: ver leituras do paciente, definir metas

---

## FASE 3 — Receitas/Dietas/Treinos premium + PDFs profissionais

**Receitas**
- Card premium com foto IA, macros completos, ações Salvar/Compartilhar/Exportar PDF
- Modo profissional: botão "Enviar para paciente" (WhatsApp/e-mail/histórico)
- PDF com cabeçalho do profissional (nome, logo, registro)

**Dietas**
- Geração de plano de 30 dias estruturado
- PDF com cabeçalho profissional, alimentos permitidos/evitados, orientações
- Histórico e duplicação por paciente

**Treinos**
- Card com séries/repetições/descanso/GIF (usar API gratuita de GIFs de exercício)
- **Modo treino interativo**: cronômetro, checklist de séries, registro automático
- Banco profissional de exercícios com filtros (grupo muscular, equipamento, nível)
- Templates e envio para aluno

---

## FASE 4 — Análise de Refeições, Evolução, Lista de Compras

- Análise por foto: já existe — adicionar dashboard profissional (aderência, média calórica, alertas)
- Evolução corporal: adicionar gordura % e massa muscular, comparativo antes/depois, relatório PDF
- Lista de compras: agrupamento por categoria, estimativa de custo, envio ao paciente, tracking de aderência

---

## FASE 5 — Refinamento

- Notificações in-app (treino programado, mensagens do profissional)
- Relatório mensal automático em PDF para cada paciente
- Comparação entre planos de dieta

---

## Considerações técnicas

- **PDFs**: gerados client-side com `jspdf` + `jspdf-autotable` (sem custo de servidor)
- **Gráficos**: `recharts` (já compatível com o stack)
- **GIFs de exercício**: usar base estática (wger API ou assets internos)
- **WhatsApp/e-mail**: links `wa.me` e `mailto:` (sem custo); envio real por servidor pode vir depois
- **IA**: continuar usando Lovable AI Gateway via edge function
- **Idioma**: tudo em português (regra do projeto)

---

## O que pergunto antes de começar

Como o escopo é gigante, **começo pela Fase 1** (fundação B2C/B2B + painel profissional básico) para garantir uma base sólida. As fases seguintes virão em mensagens separadas conforme você aprovar cada entrega.

**Confirma que posso iniciar pela Fase 1?** Se preferir outra ordem (por ex. começar pelo Controle Glicêmico ou pelos PDFs profissionais), me diga.