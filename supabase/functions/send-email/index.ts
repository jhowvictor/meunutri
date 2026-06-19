// Send transactional email via Resend connector through Lovable connector gateway.
// Body: { to: string | string[], subject: string, text?: string, html?: string, fromName?: string }
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!lovableKey || !resendKey) {
      return new Response(JSON.stringify({ error: "Resend não está conectado" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, subject, text, html, fromName } = await req.json();
    if (!to || !subject || (!text && !html)) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipients = Array.isArray(to) ? to : [to];
    const fromAddr = fromName
      ? `${fromName} <onboarding@resend.dev>`
      : "Plataforma <onboarding@resend.dev>";

    const body: any = { from: fromAddr, to: recipients, subject };
    if (html) body.html = html;
    if (text) body.text = text;

    const resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data?.message || `Erro ${resp.status}` }), {
        status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
