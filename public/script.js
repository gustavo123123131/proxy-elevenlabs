let audioElement;

/**
 * Toca um áudio a partir do caminho.
 * @param {string} src - Caminho do arquivo de áudio
 */
async function playAudio(src) {
  return new Promise((resolve, reject) => {
    if (audioElement) audioElement.remove();
    audioElement = new Audio(src);
    audioElement.addEventListener('ended', resolve);
    audioElement.addEventListener('error', reject);
    audioElement.play();
  });
}

async function addBotAudioMessage(url) {
  const chat = document.querySelector('.chat-content');

  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.textContent = 'gravando áudio...';
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  await new Promise(resolve => setTimeout(resolve, 2000));
  typing.remove();

  const wrapper = document.createElement('div');
  wrapper.className = 'audio-message';

  wrapper.innerHTML = `
    <img src="images/avatar.jpg" class="audio-avatar" alt="avatar">
    <div class="audio-bubble">
      <audio controls class="audio-player">
        <source src="${url}" type="audio/mpeg">
        Seu navegador não suporta áudio.
      </audio>
      <img class="waveform" src="https://raw.githubusercontent.com/neguidavb/waveform-fake/main/wave.png" alt="onda sonora">
    </div>
    <img src="images/avatar.jpg" class="audio-avatar end" alt="avatar">
  `;

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}


/**
 * Quando a página carregar, tocar o áudio de boas-vindas
 */
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Adiciona bolha visual (opcional)
    addBotAudioMessage('/audios/qual-seu-nome.mp3');
    // Toca o áudio inicial
    await playAudio('/audios/qual-seu-nome.mp3');
  } catch (err) {
    console.error('Erro ao tocar áudio inicial:', err);
  }
});

/**
 * Quando o usuário clicar em enviar
 */
document.querySelector('.send-button').addEventListener('click', async () => {
  const input = document.querySelector('.message-input');
  const nome = input.value.trim();
  if (!nome) return;

  const chat = document.querySelector('.chat-content');

  // Adiciona a mensagem do usuário
  const userMsg = document.createElement('div');
  userMsg.className = 'user-msg';
  userMsg.textContent = nome;
  chat.appendChild(userMsg);

  // Limpa o campo
  input.value = '';

  try {
    const res = await fetch(`/api/voz?nome=${encodeURIComponent(nome)}`);
    console.log('💬 /api/voz status:', res.status);
    console.log('🗒️ /api/voz body:', await res.clone().text());

    if (!res.ok) throw new Error(`API retornou status ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Mostra bolha do bot com áudio
    addBotAudioMessage(url);

    // Toca o áudio
    await playAudio(url);

  } catch (err) {
    console.error('Erro ao buscar áudio com nome:', err);
    alert('Erro ao gerar o áudio. Tenta de novo aí, filhote.');
  }
});
