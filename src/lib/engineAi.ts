import { supabase } from "@/integrations/supabase/client";

export async function callEngineAi(systemMessage: string, prompt: string, max_tokens = 1200) {
  const { data, error } = await supabase.functions.invoke("openai-chat", {
    body: { systemMessage, prompt, model: "gpt-4o-mini", max_tokens, temperature: 0.6 },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any)?.content as string;
}

export const engineSystemPrompts = {
  adaptation:
    "Você é um assistente que sugere ajustes em planos (dieta/treino) com base nos dados do paciente. Gere apenas SUGESTÕES editáveis, em texto claro e estruturado em pt-BR. Nunca tome decisão clínica final - apenas proponha alternativas.",
  content:
    "Você é um assistente que cria mensagens curtas, claras e profissionais em pt-BR para profissionais de saúde enviarem aos seus pacientes. Tom acolhedor, objetivo, sem jargão.",
};

export const messageTemplatesSeed = [
  { category: "boas-vindas", title: "Boas-vindas", body: "Olá {{nome}}! Sou {{profissional}} e estou muito feliz em iniciar essa jornada com você. Qualquer dúvida, estou à disposição." },
  { category: "envio-plano", title: "Envio de plano", body: "Olá {{nome}}, segue o seu novo plano. Vamos juntos! Qualquer ajuste necessário, me avise. — {{profissional}}" },
  { category: "lembrete", title: "Lembrete de acompanhamento", body: "Oi {{nome}}, passando para lembrar do seu acompanhamento desta semana. Como você está se sentindo? — {{profissional}}" },
  { category: "motivacional", title: "Mensagem motivacional", body: "{{nome}}, lembre-se: cada pequeno passo conta. Estou aqui para te apoiar nessa evolução. — {{profissional}}" },
  { category: "reengajamento", title: "Reengajamento", body: "Oi {{nome}}, senti sua falta por aqui! Vamos retomar o ritmo? Me conta como posso ajudar. — {{profissional}}" },
  { category: "educativa", title: "Conteúdo educativo", body: "{{nome}}, uma dica rápida: hidratação adequada melhora disposição e ajuda na recuperação. Que tal monitorar sua ingestão de água hoje? — {{profissional}}" },
];

export function applyVars(body: string, vars: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}
