export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { nome } = req.body;

  try {
    // 1. Gera o áudio com ElevenLabs
    const elevenResponse = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/BAM1WUXMAifYYVWSQtaA/stream",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: `Olá, ${nome}. Tudo bem?`,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 1,
            style: 0.8,
            use_speaker_boost: true
          }
        })
      }
    );

    const audioBuffer = Buffer.from(await elevenResponse.arrayBuffer());

    // 2. Faz upload pro Supabase
    const fileName = `${nome.toLowerCase().replace(/[^a-z0-9]/gi, "_")}.mp3`;
    const uploadRes = await fetch(`https://uqtngkpyugnlvrqqsdfw.supabase.co/storage/v1/object/audios/${fileName}`, {
      method: "PUT",
      headers: {
        "Content-Type": "audio/mpeg",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        "x-upsert": "true"
      },
      body: audioBuffer
    });

    if (!uploadRes.ok) {
      const erro = await uploadRes.text();
      return res.status(500).json({ error: "Erro ao enviar pro Supabase", detalhe: erro });
    }

    // 3. Retorna o link público
    const audioUrl = `https://uqtngkpyugnlvrqqsdfw.supabase.co/storage/v1/object/public/audios/${fileName}`;

    return res.status(200).json({ audioUrl });

  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar ou enviar áudio", detalhe: error.message });
  }
}
