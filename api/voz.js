export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome } = req.body;

  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/ShB6BQqbEXZxWO5511Qq', {
    method: 'POST',
    headers: {
      'xi-api-key': 'sk_3750612c9ab8ef7478d38e43fee4cbc26760dd17391e2a60',
      'Content-Type': 'application/json'
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

  const data = await response.json();
  return res.status(200).json({ audio: data.audio_url });
}