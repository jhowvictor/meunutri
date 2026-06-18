import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return json({ error: "LOVABLE_API_KEY não configurada" }, 500);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ error: "Campo 'file' ausente" }, 400);
    }

    const upstream = new FormData();
    upstream.append("model", "openai/gpt-4o-mini-transcribe");
    const filename = file.name || "audio.webm";
    upstream.append("file", file, filename);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}` },
      body: upstream,
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("STT err:", data);
      return json({ error: (data as any)?.error?.message || "Erro na transcrição" }, resp.status);
    }
    return json({ text: (data as any).text ?? "" });
  } catch (err) {
    console.error("erro stt:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
