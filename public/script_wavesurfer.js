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

  wrapper.innerHTML = `
    <img src="images/avatar.jpg" class="audio-avatar" alt="avatar">
    <div class="audio-bubble">
      <div id="${waveId}" class="waveform-static"></div>
      <button class="play-button">▶️</button>
    </div>
    <img src="images/avatar.jpg" class="audio-avatar end" alt="avatar">
  `;

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;

  const wavesurfer = WaveSurfer.create({
    container: '#' + waveId,
    waveColor: '#00a884',
    progressColor: '#004c3f',
    barWidth: 2,
    height: 40,
    responsive: true,
    normalize: true
  });

  wavesurfer.on('error', (e) => {
    console.error('WaveSurfer erro:', e);
  });

  wavesurfer.loadBlob(blobOrFile); // ✅ CORREÇÃO AQUI

  const playBtn = wrapper.querySelector('.play-button');
  playBtn.disabled = true;

  wavesurfer.on('ready', () => {
    playBtn.disabled = false;
    console.log("✔️ Onda pronta para exibir");
  });

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
