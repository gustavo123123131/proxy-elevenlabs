export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { nome } = req.body;

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
      method: "POST",
      headers: {
        "xi-api-key": "sk_3750612c9ab8ef7478d38e43fee4cbc26760dd17391e2a60",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: `Olá, ${nome}. Tudo bem? Aqui é a inteligência artificial do Eleven.`,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 1,
          style: 0.8,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: "Erro ao gerar áudio", detalhe: errText });
    }

    res.setHeader("Content-Type", "audio/mpeg");
    response.body.pipe(res);

  } catch (error) {
    return res.status(500).json({ error: "Erro interno", detalhe: error.message });
  }
}