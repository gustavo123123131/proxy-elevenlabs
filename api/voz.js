export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome não fornecido" });
  }

  const texto = `Hmm... ${nome}, que nome gostoso viu... fiquei pensando em você o dia inteiro...`;

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/ShB6BQqbEXZxWO5511Qq", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVEN_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: texto,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 1,
          style: 0.8,
          use_speaker_boost: true
        }
      })
    });

    const result = await response.json();

    if (!result.audio_url) {
      return res.status(500).json({ error: "Erro ao gerar áudio" });
    }

    return res.status(200).json({ audio: result.audio_url });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
