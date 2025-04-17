import fetch from 'node-fetch';

export default async function handler(req, res) {
  // lê nome via POST JSON (req.body.nome) ou GET query (?nome=)
  const nome = (req.body && req.body.nome) || req.query.nome;
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

  // logs para ajudar a debugar no Vercel
  console.log('🔑 ELEVENLABS_API_KEY existe?', !!API_KEY);
  console.log('🎙️ ELEVENLABS_VOICE_ID:', VOICE_ID);
  console.log('📝 nome recebido:', nome);

  if (!nome) {
    return res.status(400).json({ error: 'Parâmetro "nome" obrigatório.' });
  }
  if (!API_KEY || !VOICE_ID) {
    return res.status(500).json({ error: 'Configuração de API_KEY ou VOICE_ID faltando.' });
  }

  // monta o texto que será falado
  const text = `Olá, tudo bem? ${nome}`;

  try {
    // chama a API do ElevenLabs
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
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      // se a API devolveu erro, repassa mensagem
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return res.status(response.status).send(errorText);
    }

    // converte o ArrayBuffer em Buffer do Node e envia como MP3
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);

  } catch (error) {
    // loga no server e retorna 500
    console.error('ElevenLabs error:', error);
    res.status(500).json({ error: 'Erro interno ao gerar áudio.' });
  }
}
