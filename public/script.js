// seletores
const startBtn = document.getElementById('start-btn');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');
const loading = document.getElementById('loading');

let audioCtx, audioElement;

// função genérica para tocar um áudio via URL ou blob
async function playAudio(src) {
  return new Promise((resolve, reject) => {
    if (audioElement) audioElement.remove();
    audioElement = new Audio(src);
    audioElement.addEventListener('ended', resolve);
    audioElement.addEventListener('error', reject);
    audioElement.play();
  });
}

// ao clicar em “começar”, libera o áudio e mostra o formulário
startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  // toca seu arquivo estático de boas‑vindas
  await playAudio('/audios/qual-seu-nome.mp3');
  nameForm.classList.remove('hidden');
});

// ao enviar o nome, chama sua API e toca o retorno
nameForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nome = nameInput.value.trim();
  if (!nome) return;

  loading.classList.remove('hidden');
  try {
    const res = await fetch(`/api/voz?nome=${encodeURIComponent(nome)}`);
    if (!res.ok) throw new Error('Erro na API');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    await playAudio(url);
  } catch (err) {
    alert('Desculpe, falhou ao gerar o áudio.');
    console.error(err);
  } finally {
    loading.classList.add('hidden');
  }
});
