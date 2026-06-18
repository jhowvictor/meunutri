import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Reading {
  value_mg_dl: number;
  reading_type: string;
  measured_at: string;
  notes?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { readings } = await req.json() as { readings: Reading[] };
    if (!Array.isArray(readings) || readings.length === 0) {
      return new Response(JSON.stringify({ analysis: 'Adicione algumas medições para receber análise da IA.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY ausente' }), { status: 500, headers: corsHeaders });
    }

    const summary = readings.slice(0, 60).map((r) =>
      `${new Date(r.measured_at).toLocaleString('pt-BR')} - ${r.reading_type} - ${r.value_mg_dl} mg/dL${r.notes ? ` (${r.notes})` : ''}`
    ).join('\n');

    const prompt = `Você é um assistente de saúde focado em controle glicêmico. Analise as últimas medições do usuário (em pt-BR) e produza uma análise breve e útil em 3-5 frases curtas:
1. Padrão geral observado
2. Pontos de atenção (picos, hipoglicemias, variações)
3. Tendência (melhora/piora) se houver dados suficientes
4. Sugestão prática

Seja direto, claro e empático. NÃO dê diagnóstico médico. NÃO substitua orientação profissional.

Medições (mais recentes primeiro):
${summary}`;

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': key,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'Você é um assistente de saúde em português do Brasil. Não faz diagnóstico.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      const status = res.status;
      const msg = status === 429 ? 'Limite de uso atingido. Tente novamente em instantes.' :
                  status === 402 ? 'Créditos da IA esgotados. Adicione créditos no painel.' :
                  `Falha na análise: ${text}`;
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await res.json();
    const analysis = data.choices?.[0]?.message?.content ?? 'Sem análise disponível.';

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
