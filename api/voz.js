export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome } = req.body;

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/BAM1WUXMAifYYVWSQtaA/stream", // ID DA VOZ NA URL
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY, // PUXA DA .env
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: `Hmm... ${nome}, que nome gostoso viu... fiquei pensando em você o dia inteiro...`,
          model_id: "eleven_multilingual_v2", // MODELO PADRÃO
          voice_settings: {
            stability: 0.4,
            similarity_boost: 1,
            style: 0.8,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const erro = await response.text();
      return res.status(500).json({ error: "Erro na ElevenLabs", detalhe: erro });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(buffer));

  } catch (error) {
    return res.status(500).json({ error: "Erro no servidor", detalhe: error.message });
  }
}
