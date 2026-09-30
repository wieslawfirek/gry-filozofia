import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js?v=2";

const TYPE = {
  natural: "Naturalny",
  scientific: "Naukowy",
  philosophical: "Filozoficzny",
  mixed: "Mieszany"
};

const questions = [
  {
    q: "Patrzysz na czerwone jabłko. Co widzisz?",
    options: [
      { text: "Widzę czerwone jabłko.", type: "natural" },
      { text: "Widzę okrągły kształt, który nie ma kolorów. Jabłko nie ma koloru.", type: "scientific" },
      { text: "Trzeba najpierw zapytać, co właściwie znaczy, że kolor „należy” do rzeczy.", type: "philosophical" }
    ]
  },
  {
    q: "Stół stojący przed Tobą jest…",
    options: [
      { text: "Nieruchomy i dlatego jak przy nim siedzę, to mi nie ucieka.", type: "natural" },
      { text: "W ciągłym ruchu.", type: "scientific" },
      { text: "To zależy od tego, co rozumiemy przez ruch i względem jakiego układu go określamy.", type: "philosophical" }
    ]
  },
  {
    q: "Kamień jest twardy, ponieważ…",
    options: [
      { text: "Twardość jest właściwością kamienia.", type: "natural" },
      { text: "Jego struktura powoduje określoną reakcję podczas kontaktu z innymi ciałami.", type: "scientific" },
      { text: "Najpierw trzeba ustalić, czy „twardość” jest cechą rzeczy samej, czy relacją między rzeczą a poznającym.", type: "philosophical" }
    ]
  },
  {
    q: "Siedzisz teraz nieruchomo na krześle. Czy się poruszasz?",
    options: [
      { text: "Nie.", type: "natural" },
      { text: "Tak — razem z Ziemią wykonuję wiele ruchów.", type: "scientific" },
      { text: "Odpowiedź zależy od przyjętego układu odniesienia i znaczenia słowa „ruch”.", type: "philosophical" }
    ]
  },
  {
    q: "Widzisz drzewo za oknem. Najbardziej naturalne jest dla Ciebie stwierdzenie:",
    options: [
      { text: "Widzę drzewo.", type: "natural" },
      { text: "Mój układ nerwowy interpretuje docierające bodźce jako drzewo.", type: "scientific" },
      { text: "To, że nazywam coś „drzewem”, wymaga już pojęć i określonego sposobu porządkowania rzeczywistości.", type: "philosophical" }
    ]
  },
  {
    q: "Czy świat wygląda mniej więcej tak, jaki naprawdę jest?",
    options: [
      { text: "Tak, świat jest dokładnie taki, jakim go widzimy.", type: "natural" },
      { text: "Nie całkiem — zmysły pokazują tylko wybrane informacje, przetwarzane przez organizm.", type: "scientific" },
      { text: "Najpierw trzeba ustalić, czy w ogóle możemy sensownie porównać „świat sam w sobie” z naszym obrazem świata.", type: "philosophical" }
    ]
  },
  {
    q: "Czy cukier jest słodki?",
    options: [
      { text: "Oczywiście — słodycz jest cechą cukru.", type: "natural" },
      { text: "Nie, cukier nie jest słodki.", type: "scientific" },
      { text: "Pytanie zakłada już pewną koncepcję relacji między przedmiotem a doświadczeniem.", type: "philosophical" }
    ]
  },
  {
    q: "Co bardziej przekonuje Cię, że krzesło naprawdę istnieje?",
    options: [
      { text: "Widzę je i mogę go dotknąć.", type: "natural" },
      { text: "Jego istnienie można badać wieloma niezależnymi metodami i pomiarami.", type: "scientific" },
      { text: "Samo pytanie prowadzi do problemu, co rozumiemy przez „istnieć”.", type: "philosophical" }
    ]
  },
  {
    q: "Czy czas płynie wszędzie tak samo?",
    options: [
      { text: "Intuicyjnie tak — minuta to minuta.", type: "natural" },
      { text: "Nie; nie płynie zawsze tak samo.", type: "scientific" },
      { text: "Trzeba odróżnić czas fizyczny od tego, czym w ogóle jest czas.", type: "philosophical" }
    ]
  },
  {
    q: "Jeśli pięciu ludzi widzi ten sam budynek, to…",
    options: [
      { text: "Wszyscy widzą zasadniczo ten sam budynek.", type: "natural" },
      { text: "Każdy otrzymuje nieco inne dane zmysłowe i przetwarza je swoim układem poznawczym.", type: "scientific" },
      { text: "Powstaje pytanie, co właściwie znaczy „ten sam przedmiot” dla różnych obserwatorów.", type: "philosophical" }
    ]
  },
  {
    q: "Kiedy mówisz: „Słońce codziennie wschodzi”, to…",
    options: [
      { text: "Opisujesz to, co rzeczywiście obserwujesz każdego ranka.", type: "natural" },
      { text: "Używasz wygodnego potocznego opisu; astronomicznie chodzi przede wszystkim o ruch obrotowy Ziemi.", type: "scientific" },
      { text: "Oznacza, że mam nadzieję, że jutro słońce wzejdzie, bo jest to takie pewne.", type: "philosophical" }
    ]
  },
  {
    q: "Masz przed sobą szklankę wody. Co się w niej znajduje?",
    options: [
      { text: "Woda.", type: "natural" },
      { text: "Ogromna liczba cząsteczek H₂O pozostających w ciągłym ruchu i wzajemnych oddziaływaniach.", type: "scientific" },
      { text: "To zależy od poziomu opisu — pytanie brzmi, czy jeden poziom jest bardziej „realny” niż drugi.", type: "philosophical" }
    ]
  },
  {
    q: "Które zdanie najlepiej opisuje człowieka, którego spotykasz?",
    options: [
      { text: "Człowiek posiada ciało i duszę.", type: "natural" },
      { text: "Człowiek jest tylko materialnym ciałem.", type: "scientific" },
      { text: "Trudno powiedzieć. Być może materialne ciała nie istnieją, a człowiek jest tylko duchem bez ciała.", type: "philosophical" }
    ]
  },
  {
    q: "Kiedy widzisz chmurę, która „wygląda groźnie”, to…",
    options: [
      { text: "Chmura rzeczywiście wygląda groźnie.", type: "natural" },
      { text: "To ja przypisuję jej tę cechę na podstawie wcześniejszych doświadczeń i emocji.", type: "scientific" },
      { text: "Pytanie pokazuje problem, ile w poznawanym świecie pochodzi od świata, a ile od poznającego podmiotu.", type: "philosophical" }
    ]
  },
  {
    q: "Gdy nauka bardzo dokładnie wyjaśni, jak działa człowiek i świat, to…",
    options: [
      { text: "Będziemy po prostu lepiej wiedzieć, jaki świat naprawdę jest.", type: "natural" },
      { text: "Nadal nie będziemy wiedzieli o wielu rzeczach.", type: "scientific" },
      { text: "Nadal pozostaną pytania typu: czym jest rzeczywistość, co możemy poznać, dlaczego istnieje świat i jaki ma sens.", type: "philosophical" }
    ]
  }
];

const profileDescriptions = {
  natural: "Najczęściej wybierałeś odpowiedzi zgodne z naturalnym, zdroworozsądkowym obrazem świata. To sposób widzenia rzeczywistości oparty na codziennym doświadczeniu i spontanicznej ufności wobec tego, jak świat nam się jawi.",
  scientific: "Najczęściej wybierałeś odpowiedzi charakterystyczne dla naukowego obrazu świata: wychodzące poza bezpośrednie doświadczenie, odwołujące się do mechanizmów, pomiaru i wyjaśniania.",
  philosophical: "Najczęściej wybierałeś odpowiedzi filozoficzne: zamiast przyjmować pytanie wprost, problematyzujesz pojęcia, założenia i granice poznania.",
  mixed: "Nie dominuje u Ciebie jeden sposób patrzenia na świat. W podobnym stopniu korzystasz z intuicji zdroworozsądkowych, naukowych i filozoficznych."
};

const state = {
  session: "",
  current: 0,
  answers: [],
  shuffled: [],
  user: null,
  db: null,
  auth: null,
  unsubscribe: null,
  teacherMode: false
};

const el = id => document.getElementById(id);
const screens = ["setupScreen","quizScreen","personalResultScreen","groupScreen","errorScreen"];

function showScreen(id) {
  screens.forEach(s => el(s).classList.toggle("active", s === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function normalizeSession(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "-").replace(/-+/g, "-").slice(0,32);
}

function configLooksReady() {
  return firebaseConfig.apiKey && !String(firebaseConfig.apiKey).includes("WSTAW_TUTAJ") && firebaseConfig.projectId && !String(firebaseConfig.projectId).includes("WSTAW_TUTAJ");
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function initQuizOrder() {
  state.shuffled = questions.map(item => shuffle(item.options));
}

function scoreAnswers(answers) {
  const scores = { natural:0, scientific:0, philosophical:0 };
  answers.forEach(type => { if (scores[type] !== undefined) scores[type]++; });
  const max = Math.max(...Object.values(scores));
  const leaders = Object.entries(scores).filter(([,v]) => v === max).map(([k]) => k);
  return { scores, profile: leaders.length === 1 ? leaders[0] : "mixed" };
}

function renderQuestion() {
  const i = state.current;
  const q = questions[i];
  el("questionCounter").textContent = `Pytanie ${i+1} z ${questions.length}`;
  el("sessionBadge").textContent = state.session;
  el("progressBar").style.width = `${(i / questions.length) * 100}%`;
  el("questionText").textContent = q.q;
  const list = el("answersList");
  list.innerHTML = "";
  state.shuffled[i].forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => chooseAnswer(opt.type));
    list.appendChild(btn);
  });
}

function chooseAnswer(type) {
  state.answers[state.current] = type;
  state.current++;
  if (state.current < questions.length) {
    renderQuestion();
  } else {
    el("progressBar").style.width = "100%";
    finishQuiz();
  }
}

function renderBars(target, scores, total) {
  target.innerHTML = "";
  ["natural","scientific","philosophical"].forEach(type => {
    const value = scores[type] || 0;
    const pct = total ? Math.round((value / total) * 100) : 0;
    const block = document.createElement("div");
    block.className = "bar-block";
    block.innerHTML = `
      <div class="bar-label"><span>${TYPE[type]}</span><span>${value} / ${total} (${pct}%)</span></div>
      <div class="bar-track"><div class="bar-fill ${type}" style="width:${pct}%"></div></div>`;
    target.appendChild(block);
  });
}

async function ensureAuth() {
  if (!state.auth) throw new Error("Firebase nie jest skonfigurowany.");
  if (state.auth.currentUser) { state.user = state.auth.currentUser; return; }
  await signInAnonymously(state.auth);
  await new Promise(resolve => {
    const off = onAuthStateChanged(state.auth, user => {
      if (user) { state.user = user; off(); resolve(); }
    });
  });
}

async function finishQuiz() {
  const result = scoreAnswers(state.answers);
  el("profileTitle").textContent = result.profile === "mixed" ? "Profil mieszany" : `${TYPE[result.profile]} obraz świata`;
  el("profileDescription").textContent = profileDescriptions[result.profile];
  renderBars(el("personalBars"), result.scores, questions.length);
  showScreen("personalResultScreen");

  try {
    await ensureAuth();
    const responseRef = doc(state.db, "sessions", state.session, "responses", state.user.uid);
    await setDoc(responseRef, {
      createdAt: serverTimestamp(),
      profile: result.profile,
      scores: result.scores,
      answers: state.answers
    });
    localStorage.setItem(`submitted:${state.session}`, "1");
  } catch (err) {
    console.error(err);
    el("profileDescription").textContent += " Wynik został policzony na urządzeniu, ale nie udało się zapisać go do wspólnej bazy.";
  }
}

function summarizeResponses(responses) {
  const profiles = { natural:0, scientific:0, philosophical:0, mixed:0 };
  const questionCounts = questions.map(() => ({ natural:0, scientific:0, philosophical:0 }));

  responses.forEach(r => {
    if (profiles[r.profile] !== undefined) profiles[r.profile]++;
    if (Array.isArray(r.answers)) {
      r.answers.forEach((type, i) => {
        if (questionCounts[i] && questionCounts[i][type] !== undefined) questionCounts[i][type]++;
      });
    }
  });
  return { profiles, questionCounts, total: responses.length };
}

function renderGroup(summary) {
  const { profiles, questionCounts, total } = summary;
  el("groupMeta").textContent = `Sesja: ${state.session} • liczba ukończonych testów: ${total}`;

  const summaryWrap = el("groupSummary");
  summaryWrap.innerHTML = "";
  ["natural","scientific","philosophical","mixed"].forEach(type => {
    const count = profiles[type] || 0;
    const pct = total ? Math.round(count / total * 100) : 0;
    const card = document.createElement("div");
    card.className = "summary-card";
    card.innerHTML = `<div class="number">${count}</div><div class="label">${TYPE[type]}${type !== "mixed" ? " obraz świata" : ""} • ${pct}%</div>`;
    summaryWrap.appendChild(card);
  });

  const breakdown = el("questionBreakdown");
  breakdown.innerHTML = "";
  questions.forEach((q, i) => {
    const box = document.createElement("div");
    box.className = "q-result";
    const rows = ["natural","scientific","philosophical"].map(type => {
      const value = questionCounts[i][type] || 0;
      const pct = total ? Math.round(value / total * 100) : 0;
      return `<div class="mini-row">
        <div class="mini-label">${TYPE[type]}</div>
        <div class="mini-track"><div class="mini-fill ${type}" style="width:${pct}%"></div></div>
        <div class="mini-value">${pct}%</div>
      </div>`;
    }).join("");
    box.innerHTML = `<h4>${i+1}. ${q.q}</h4>${rows}`;
    breakdown.appendChild(box);
  });
}

async function openGroupResults(teacherMode=false) {
  state.teacherMode = teacherMode;
  const raw = el("sessionCode").value || state.session;
  const session = normalizeSession(raw);
  if (!session) { alert("Wpisz kod grupy / zajęć."); return; }
  state.session = session;
  el("sessionCode").value = session;

  try {
    await ensureAuth();
    showScreen("groupScreen");
    el("teacherTools").classList.toggle("hidden", !teacherMode);
    if (state.unsubscribe) state.unsubscribe();
    const ref = collection(state.db, "sessions", state.session, "responses");
    state.unsubscribe = onSnapshot(ref, snap => {
      const responses = snap.docs.map(d => d.data());
      renderGroup(summarizeResponses(responses));
    }, err => showError(err));
  } catch (err) { showError(err); }
}

function showError(err) {
  console.error(err);
  el("errorText").textContent = `${err?.message || err}. Sprawdź konfigurację Firebase i reguły Firestore.`;
  showScreen("errorScreen");
}

function startQuiz() {
  const session = normalizeSession(el("sessionCode").value);
  if (!session) { alert("Wpisz kod grupy / zajęć."); return; }
  state.session = session;
  const already = localStorage.getItem(`submitted:${session}`) === "1";
  if (already) {
    const go = confirm("Na tym urządzeniu wynik dla tej sesji był już wysłany. Czy chcesz tylko zobaczyć wyniki grupy?");
    if (go) openGroupResults(false);
    return;
  }
  state.current = 0;
  state.answers = [];
  initQuizOrder();
  renderQuestion();
  showScreen("quizScreen");
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const session = normalizeSession(params.get("session") || "");
  if (session) el("sessionCode").value = session;
  if (params.get("view") === "teacher" && session) {
    setTimeout(() => openGroupResults(true), 50);
  }
}

function initFirebase() {
  if (!configLooksReady()) {
    el("configWarning").classList.remove("hidden");
    el("configWarning").textContent = "Aplikacja jest gotowa, ale przed publikacją trzeba wkleić konfigurację Firebase do pliku firebase-config.js. Instrukcja jest w README.md.";
    return;
  }
  const app = initializeApp(firebaseConfig);
  state.auth = getAuth(app);
  state.db = getFirestore(app);
}

el("startBtn").addEventListener("click", startQuiz);
el("teacherBtn").addEventListener("click", () => openGroupResults(true));
el("teacherShortcut").addEventListener("click", () => openGroupResults(true));
el("groupResultsBtn").addEventListener("click", () => openGroupResults(false));
el("restartBtn").addEventListener("click", () => showScreen("setupScreen"));
el("backHomeBtn").addEventListener("click", () => { if (state.unsubscribe) state.unsubscribe(); showScreen("setupScreen"); });
el("errorBackBtn").addEventListener("click", () => showScreen("setupScreen"));
el("sessionCode").addEventListener("keydown", e => { if (e.key === "Enter") startQuiz(); });
el("copyStudentLinkBtn").addEventListener("click", async () => {
  const u = new URL(location.href);
  u.search = "";
  u.searchParams.set("session", state.session);
  try {
    await navigator.clipboard.writeText(u.toString());
    el("copyStatus").textContent = "Link dla studentów skopiowany do schowka.";
  } catch {
    el("copyStatus").textContent = u.toString();
  }
});

initFirebase();
applyUrlParams();
