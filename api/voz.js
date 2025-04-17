import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
          text: `Olá, ${nome}, tudo bem? Aqui é a voz da Eleven Labs.`,
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

    const buffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(buffer);

    const filename = `${nome.toLowerCase().replace(/[^a-z0-9]/gi, "_")}.mp3`;
    const filePath = path.join(process.cwd(), "public", "audios", filename);

    fs.writeFileSync(filePath, audioBuffer);

    const audioUrl = `https://proxy-elevenlabs.vercel.app/audios/${filename}`;

    return res.status(200).json({ audioUrl });

  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar áudio", detalhe: error.message });
  }
}
