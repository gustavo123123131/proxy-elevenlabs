export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome } = req.body;

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/BAM1WUXMAifYYVWSQtaA/stream",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: `Hmm... ${nome}, que nome gostoso viu... fiquei pensando em você o dia inteiro...`,
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

    if (!response.ok) {
      const erro = await response.text();
      return res.status(500).json({ error: "Erro na ElevenLabs", detalhe: erro });
    }

    const buffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    // Monta o áudio base64 formatado
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return res.status(200).json({ audioUrl: audioDataUrl });

  } catch (error) {
    return res.status(500).json({ error: "Erro no servidor", detalhe: error.message });
  }
}
