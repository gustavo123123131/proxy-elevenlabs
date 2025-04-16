export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome } = req.body;

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/BAM1WUXMAifYYVWSQtaA", {
      method: "POST",
      headers: {
        "xi-api-key": "sk_3750612c9ab8ef7478d38e43fee4cbc26760dd17391e2a60",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: `Hmm... ${nome}, que nome gostoso viu... fiquei pensando em você o dia inteiro.`,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 1,
          style: 0.8,
          use_speaker_boost: true
        }
      })
    });

    const contentType = response.headers.get("content-type");

    // Se for um áudio, não dá pra tratar como JSON
    if (contentType.includes("audio/mpeg")) {
      return res.status(500).json({ error: "A resposta foi um áudio bruto, não JSON. Verifique a conta ou modelo usado na ElevenLabs." });
    }

    const data = await response.json();
    return res.status(200).json({ audio: data.audio_url });

  } catch (error) {
    return res.status(500).json({ error: "Erro no servidor", detalhe: error.message });
  }
}
