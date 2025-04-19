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
      <canvas class="waveform-canvas" width="200" height="30"></canvas>
    </div>
    <img src="images/avatar.jpg" class="audio-avatar end" alt="avatar">
  `;

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;

  const canvas = wrapper.querySelector('.waveform-canvas');
  const audio = wrapper.querySelector('.audio-player');
  renderWaveform(audio, canvas); // 🟢 isso faz o canvas desenhar a onda do áudio
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

  const userMsg = document.createElement('div');
  userMsg.className = 'user-msg';
  userMsg.textContent = nome;
  chat.appendChild(userMsg);

  input.value = '';

  try {
    const res = await fetch(`/api/voz?nome=${encodeURIComponent(nome)}`);
    console.log('💬 /api/voz status:', res.status);
    console.log('🗒️ /api/voz body:', await res.clone().text());

    if (!res.ok) throw new Error(`API retornou status ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // 🔊 Mostra bolha de áudio e renderiza onda automaticamente
    addBotAudioMessage(url);

    // ▶️ Toca o som
    await playAudio(url);

  } catch (err) {
    console.error('Erro ao buscar áudio com nome:', err);
    alert('Erro ao gerar o áudio. Tenta de novo aí, filhote.');
  }
});


// Garante que o script só execute depois que o DOM estiver carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {});
}function renderWaveform(audioElement, canvas) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audioElement);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  const ctx = canvas.getContext('2d');

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#202c33'; // fundo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00a884'; // cor da onda

    ctx.beginPath();
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if(i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  draw();
}
