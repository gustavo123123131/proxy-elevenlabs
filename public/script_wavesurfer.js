// Inicializa a bolha de áudio com WaveSurfer (onda real do áudio)
async function addBotAudioMessage(blobOrFile) {
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

  const waveId = `waveform-${Date.now()}`;

// 1. monta HTML
wrapper.innerHTML = `
  <button class="play-button">▶️</button>
  <div class="waveform-container" id="${waveId}"></div>
  <div class="timestamps">
    <span class="current-time">0:00</span>
  </div>
  <div class="audio-avatar-end">
    <img src="images/avatar.jpg" alt="avatar">
  </div>
`;

chat.appendChild(wrapper);

// 2. já captura o playBtn aqui
const playBtn = wrapper.querySelector('.play-button');
playBtn.disabled = true;

// 3. inicializa o Wavesurfer
const wavesurfer = WaveSurfer.create({
container: `#${waveId}`,
waveColor: '#848488',
progressColor: '#00A884',
barWidth: 2,
barGap: 1,
cursorWidth: 0,
height: 32,
responsive: true,
normalize: true,
pixelRatio: 1
});

// 4. formatação de tempo
function formatTime(sec) {
const m = Math.floor(sec/60);
const s = Math.floor(sec%60).toString().padStart(2,'0');
return `${m}:${s}`;
}

// 5. quando estiver pronto, seta duração e libera o play
wavesurfer.on('ready', () => {
wrapper.querySelector('.duration')
       .textContent = formatTime(wavesurfer.getDuration());
playBtn.disabled = false;
});

// 6. a cada frame de áudio, atualiza o tempo corrente
wavesurfer.on('audioprocess', () => {
wrapper.querySelector('.current-time')
       .textContent = formatTime(wavesurfer.getCurrentTime());
});

// 7. carrega e conecta o blob
wavesurfer.loadBlob(blobOrFile);

// 8. play/pause
playBtn.addEventListener('click', () => {
wavesurfer.playPause();
playBtn.textContent = wavesurfer.isPlaying() ? '⏸️' : '▶️';
});
}

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/audios/qual-seu-nome.mp3');
    const blob = await res.blob();
    const file = new File([blob], "qual-seu-nome.mp3", { type: "audio/mpeg" });
    await addBotAudioMessage(file);
  } catch (err) {
    console.error('Erro ao carregar áudio inicial:', err);
  }
});

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
    if (!res.ok) throw new Error('Erro ao buscar áudio');

    const blob = await res.blob();
    const file = new File([blob], "voz.mp3", { type: "audio/mpeg" });

    await addBotAudioMessage(file);
  } catch (err) {
    console.error('Erro ao gerar áudio:', err);
    alert('Falha ao gerar o áudio.');
  }
});
