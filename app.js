const state = { xp: 1240, streak: 7, lessons: 24, sound: true, quizIndex: 0, selected: null };

const questions = [
  { q: 'How do you say “goodbye” informally?', a: ['See you!', 'Pleased to meet you.', 'Excuse me.'], c: 0 },
  { q: 'Which phrase asks for someone’s name?', a: ['What is your name?', 'How are you?', 'Where is it?'], c: 0 },
  { q: 'Choose the polite way to ask for help.', a: ['Help now.', 'Could you help me, please?', 'You help me.'], c: 1 }
];

const saved = JSON.parse(localStorage.getItem('lexi-state') || '{}');
Object.assign(state, saved);

function save() { localStorage.setItem('lexi-state', JSON.stringify(state)); }
function toast(text) {
  const el = document.getElementById('toast'); el.textContent = text; el.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function switchView(view) {
  ['learn','practice','progress'].forEach(name => document.getElementById(`${name}-view`).classList.toggle('hidden', name !== view));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  document.querySelector('.sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => switchView(item.dataset.view)));
document.getElementById('menu-button').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));

document.getElementById('continue-button').addEventListener('click', () => switchView('practice'));
document.querySelectorAll('.topic-card').forEach(card => card.addEventListener('click', () => toast(`${card.dataset.topic} lessons coming next`)));
document.getElementById('see-all').addEventListener('click', () => toast('All topics are ready to explore'));
document.querySelector('.edit-goal').addEventListener('click', () => toast('Weekly goal: 6 lessons'));
document.getElementById('profile-button').addEventListener('click', () => switchView('progress'));
document.getElementById('sound-button').addEventListener('click', () => { state.sound = !state.sound; save(); toast(state.sound ? 'Sound on' : 'Sound off'); });

document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.value.trim()) { toast(`Searching for “${e.target.value.trim()}”`); e.target.blur(); }
});

function renderQuestion() {
  const item = questions[state.quizIndex];
  state.selected = null;
  document.getElementById('quiz-step').textContent = `Question ${state.quizIndex + 1} of ${questions.length}`;
  document.getElementById('quiz-progress-bar').style.width = `${((state.quizIndex + 1) / questions.length) * 100}%`;
  document.getElementById('question-text').textContent = item.q;
  const answers = document.getElementById('answers'); answers.innerHTML = '';
  item.a.forEach((text, index) => {
    const button = document.createElement('button'); button.className = 'answer'; button.textContent = text;
    button.addEventListener('click', () => {
      document.querySelectorAll('.answer').forEach(a => a.classList.remove('selected')); button.classList.add('selected');
      state.selected = index; document.getElementById('next-question').disabled = false;
      document.getElementById('next-question').textContent = 'Check answer';
    }); answers.appendChild(button);
  });
  document.getElementById('next-question').disabled = true; document.getElementById('next-question').textContent = 'Check answer';
}

document.getElementById('next-question').addEventListener('click', e => {
  const button = e.currentTarget;
  const item = questions[state.quizIndex];
  if (button.textContent === 'Check answer') {
    document.querySelectorAll('.answer').forEach((a, i) => { if (i === item.c) a.classList.add('correct'); if (i === state.selected && i !== item.c) a.classList.add('wrong'); });
    button.textContent = state.quizIndex === questions.length - 1 ? 'Finish lesson' : 'Next question';
    if (state.selected === item.c) toast('Correct! +20 XP');
  } else {
    if (state.quizIndex === questions.length - 1) {
      state.xp += 60; state.lessons += 1; save(); updateStats(); toast('Lesson complete! +60 XP');
      state.quizIndex = 0; switchView('learn');
    } else { state.quizIndex += 1; }
    renderQuestion();
  }
});

function updateStats() {
  document.getElementById('xp-count').textContent = state.xp.toLocaleString();
  document.getElementById('progress-xp').textContent = state.xp.toLocaleString();
  document.getElementById('lessons-done').textContent = state.lessons;
  document.getElementById('progress-streak').textContent = `${state.streak} days`;
  document.getElementById('sidebar-streak').textContent = `${state.streak} day streak`;
}

updateStats(); renderQuestion();
