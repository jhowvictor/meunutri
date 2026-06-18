import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return json({ error: "OPENAI_API_KEY não configurada" }, 500);
    }

    const body = await req.json();
    const {
      systemMessage = "",
      history = [],
      userText = "",
      image, // data URL string
      file, // { name, mimetype, base64 }
      model = "gpt-4o",
      max_tokens = 1500,
      temperature = 0.75,
    } = body ?? {};

    const userContent: any[] = [];
    if (userText) userContent.push({ type: "text", text: userText });

    if (image && typeof image === "string") {
      userContent.push({ type: "image_url", image_url: { url: image } });
    }

    if (file?.base64 && file?.mimetype) {
      if (file.mimetype.startsWith("text/") || /json|csv|xml/.test(file.mimetype)) {
        try {
          const decoded = atob(file.base64);
          userContent.push({
            type: "text",
            text: `\n\n[Documento anexado: ${file.name}]\n${decoded.slice(0, 12000)}`,
          });
        } catch {
          userContent.push({ type: "text", text: `[Documento ${file.name} ilegível]` });
        }
      } else {
        userContent.push({
          type: "file",
          file: {
            filename: file.name || "arquivo.pdf",
            file_data: `data:${file.mimetype};base64,${file.base64}`,
          },
        });
      }
    }

    const messages: any[] = [];
    if (systemMessage) messages.push({ role: "system", content: systemMessage });
    for (const m of history) {
      if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
        messages.push({ role: m.role, content: m.content });
      }
    }
    messages.push({
      role: "user",
      content: userContent.length ? userContent : userText || "",
    });

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens, temperature }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("OpenAI err:", data);
      return json({ error: data.error?.message || "Erro na OpenAI" }, resp.status);
    }
    return json({ content: data.choices?.[0]?.message?.content ?? "" });
  } catch (err) {
    console.error("erro:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
