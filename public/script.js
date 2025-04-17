// public/script.js

// seletores
const startBtn   = document.getElementById('start-btn');
const nameForm   = document.getElementById('name-form');
const nameInput  = document.getElementById('name-input');
const loading    = document.getElementById('loading');

let audioElement;

/**
 * Toca um áudio a partir de uma URL ou Blob.
 * @param {string} src URL ou objeto Blob URL.createObjectURL
 */
async function playAudio(src) {
  return new Promise((resolve, reject) => {
    // remove instância anterior, se houver
    if (audioElement) {
      audioElement.remove();
    }
    audioElement = new Audio(src);
    audioElement.addEventListener('ended', resolve);
    audioElement.addEventListener('error', reject);
    audioElement.play();
  });
}

// Click no botão “Clique para começar”
startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  // toca o áudio estático de boas‑vindas
  await playAudio('/audios/qual-seu-nome.mp3');
  // exibe o form de nome
  nameForm.classList.remove('hidden');
});

// Submit do formulário de nome
nameForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nome = nameInput.value.trim();
  if (!nome) return;

  loading.classList.remove('hidden');

  try {
    // Faz a chamada ao seu endpoint
    const res = await fetch(`/api/voz?nome=${encodeURIComponent(nome)}`);

    // Logs para debug
    console.log('💬 /api/voz status:', res.status);
    console.log('🗒️ /api/voz body:', await res.clone().text());

    // Se não for 2xx, dispara erro
    if (!res.ok) {
      throw new Error(`API retornou status ${res.status}`);
    }

    // Converte resposta em blob e toca o áudio
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    await playAudio(url);

  } catch (err) {
    alert('Desculpe, falhou ao gerar o áudio.');
    console.error('Erro no fetch /api/voz:', err);
  } finally {
    loading.classList.add('hidden');
  }
});
