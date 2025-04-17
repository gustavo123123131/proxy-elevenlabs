import fs from "fs";
import path from "path";

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
    const audioBuffer = Buffer.from(buffer);

    // Gera o nome do arquivo com base no nome da pessoa
    const filename = `${nome.toLowerCase().replace(/[^a-z0-9]/gi, "_")}.mp3`;
    const filePath = path.join(process.cwd(), "public", "audios", filename);

    // Salva o arquivo localmente (em /public/audios)
    fs.writeFileSync(filePath, audioBuffer);

    // Gera a URL de acesso ao áudio
    const audioUrl = `https://proxy-elevenlabs.vercel.app/audios/${filename}`;

    return res.status(200).json({ audioUrl });

  } catch (error) {
    return res.status(500).json({ error: "Erro no servidor", detalhe: error.message });
  }
}

