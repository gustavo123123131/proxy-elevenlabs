// public/script.js

let audioElement;

// Função pra tocar áudio
async function playAudio(src) {
  return new Promise((resolve, reject) => {
    if (audioElement) audioElement.remove();
    audioElement = new Audio(src);
    audioElement.addEventListener('ended', resolve);
    audioElement.addEventListener('error', reject);
    audioElement.play();
  });
}

// Ao carregar a página, toca o áudio de boas-vindas
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await playAudio('/audios/qual-seu-nome.mp3');
  } catch (err) {
    console.error('Erro ao tocar áudio inicial:', err);
  }
});

// Quando o usuário clicar em enviar
document.querySelector('.send-button').addEventListener('click', async () => {
  const input = document.querySelector('.message-input');
  const nome = input.value.trim();
  if (!nome) return;

  // Mostra a mensagem no chat (opcional)
  const chat = document.querySelector('.chat-content');
  const msg = document.createElement('div');
  msg.className = 'user-msg';
  msg.textContent = nome;
  chat.appendChild(msg);

  // Limpa o campo
  input.value = '';

  try {
    // Faz a chamada para o back-end
    const res = await fetch(`/api/voz?nome=${encodeURIComponent(nome)}`);

    console.log('💬 /api/voz status:', res.status);
    console.log('🗒️ /api/voz body:', await res.clone().text());

    if (!res.ok) throw new Error(`API retornou status ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    await playAudio(url);

  } catch (err) {
    console.error('Erro ao buscar áudio com nome:', err);
    alert('Erro ao gerar o áudio. Tenta de novo aí, filhote.');
  }
});
