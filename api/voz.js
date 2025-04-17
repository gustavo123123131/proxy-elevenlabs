import fetch from 'node-fetch';

export default async function handler(req, res) {
  const nome = req.query.nome;
  if (!nome) {
    return res.status(400).json({ error: 'Parâmetro "nome" obrigatório.' });
  }

  const text = `Olá, tudo bem? ${nome}`;
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID; // configure no Vercel/Env

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.7, similarity_boost: 0.75 }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('ElevenLabs error:', error);
    res.status(500).json({ error: 'Erro interno ao gerar áudio.' });
  }
}
