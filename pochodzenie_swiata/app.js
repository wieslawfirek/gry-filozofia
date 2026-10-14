import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "../obraz_swiata/firebase-config.js?v=4";

const el = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const teacherMode = params.get("view") === "teacher";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let session = "", user = null, unsubscribe = null, busy = false;
const choices = ["creationism", "evolutionism"];

function code(value) {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{1,32}$/.test(normalized)) throw new Error("Wpisz kod o długości do 32 znaków: litery A–Z, cyfry, myślnik lub podkreślenie.");
  return normalized;
}
function show(id) {
  ["setup", "teacher", "poll", "results"].forEach(name => el(name).classList.toggle("active", name === id));
  el("error").classList.add("hidden");
}
function showError(error) {
  console.error(error);
  let message = error.message || "Nie udało się połączyć. Spróbuj ponownie.";
  if (error.code === "permission-denied") message = "Baza nie zezwala na tę operację. Prowadzący powinien sprawdzić reguły Firestore dla nowego głosowania (plik pochodzenie_swiata/firestore.rules).";
  else if (error.code === "unavailable") message = "Brak połączenia z bazą. Sprawdź internet i spróbuj ponownie. Głos nie został jeszcze potwierdzony.";
  el("error").textContent = message;
  el("error").classList.remove("hidden");
}
async function authenticate() {
  user = auth.currentUser || (await signInAnonymously(auth)).user;
}
function sessionRef() { return doc(db, "originPollSessions", session); }
function voteRef() { return doc(db, "originPollSessions", session, "votes", user.uid); }
function url(isTeacher) {
  const link = new URL(location.href);
  link.search = ""; link.hash = "";
  if (session) link.searchParams.set("session", session);
  if (isTeacher) link.searchParams.set("view", "teacher");
  return link.toString();
}
async function perform(button, action) {
  if (busy) return;
  busy = true; button.disabled = true; el("error").classList.add("hidden");
  el("changeCode").disabled = true;
  el("newSession").disabled = true;
  try { await action(); } catch (error) { showError(error); }
  finally { busy = false; button.disabled = false; el("changeCode").disabled = false; el("newSession").disabled = false; }
}
async function enterSession(isTeacher) {
  session = code(el(isTeacher ? "teacherCode" : "sessionCode").value);
  await authenticate();
  let existing = await getDoc(sessionRef());
  if (!existing.exists()) {
    if (!isTeacher) throw new Error("Nie znaleziono sesji. Sprawdź kod albo poproś prowadzącego o utworzenie głosowania.");
    try {
      await setDoc(sessionRef(), { poll: "origin", createdAt: serverTimestamp(), createdBy: user.uid });
    } catch (error) {
      // Another teacher tab may have created the same code in the meantime.
      existing = await getDoc(sessionRef());
      if (!existing.exists()) throw error;
    }
  }
  history.replaceState(null, "", url(isTeacher));
  if (isTeacher) return openResults();
  const previous = await getDoc(voteRef());
  if (previous.exists()) return openResults(previous.data().choice, true);
  el("pollCode").textContent = session;
  el("voteForm").reset();
  show("poll");
}
async function submitVote() {
  const choice = new FormData(el("voteForm")).get("choice");
  if (!choices.includes(choice)) throw new Error("Wybierz jedną odpowiedź.");
  const previous = await getDoc(voteRef());
  if (previous.exists()) return openResults(previous.data().choice, true);
  try { await setDoc(voteRef(), { choice, createdAt: serverTimestamp() }); }
  catch (error) {
    // Recover a confirmed write after a retry or simultaneous submission in another tab.
    const confirmed = await getDoc(voteRef());
    if (confirmed.exists()) return openResults(confirmed.data().choice, true);
    throw error;
  }
  openResults(choice);
}
function openResults(choice, already = false) {
  show("results");
  el("resultCode").textContent = session;
  el("voteConfirmation").classList.toggle("hidden", teacherMode);
  if (!teacherMode) el("voteConfirmation").textContent = `${already ? "Twój głos w tej sesji jest już zapisany" : "Twój głos został zapisany"}: ${choice === "creationism" ? "kreacjonizm" : "ewolucjonizm"}.`;
  el("shareTools").classList.toggle("hidden", !teacherMode);
  if (teacherMode) renderShare();
  el("total").textContent = "—";
  el("liveStatus").textContent = "Łączenie z wynikami…";
  el("emptyResults").classList.add("hidden");
  for (const key of choices) { el(`${key}Count`).textContent = "—"; el(`${key}Bar`).style.width = "0%"; }
  if (unsubscribe) unsubscribe();
  unsubscribe = onSnapshot(collection(db, "originPollSessions", session, "votes"), snapshot => {
    const counts = { creationism: 0, evolutionism: 0 };
    snapshot.docs.forEach(item => { const key = item.data().choice; if (choices.includes(key)) counts[key]++; });
    const total = counts.creationism + counts.evolutionism;
    el("total").textContent = total;
    for (const key of choices) {
      const percentage = total ? Math.round(counts[key] / total * 100) : 0;
      el(`${key}Count`).textContent = `${counts[key]} głosów · ${percentage}%`;
      el(`${key}Bar`).style.width = `${percentage}%`;
    }
    el("emptyResults").classList.toggle("hidden", total !== 0);
    el("liveStatus").textContent = snapshot.metadata.fromCache ? "Oczekiwanie na połączenie — wyniki mogą być nieaktualne." : "Wyniki aktualizują się automatycznie.";
  }, error => { el("liveStatus").textContent = "Aktualizacja wyników została przerwana. Otwórz sesję ponownie."; showError(error); });
}
function renderShare() {
  const link = url(false);
  el("studentLink").value = link;
  el("shareCode").textContent = session;
  el("studentQr").replaceChildren();
  el("copyStatus").textContent = "";
  el("downloadQr").disabled = !window.QRCode;
  if (window.QRCode) new window.QRCode(el("studentQr"), { text: link, width: 220, height: 220, correctLevel: window.QRCode.CorrectLevel.M });
  else el("studentQr").textContent = "Kod QR jest niedostępny. Udostępnij kod sesji lub link.";
}
function reset() {
  if (unsubscribe) unsubscribe();
  unsubscribe = null; session = "";
  history.replaceState(null, "", url(teacherMode));
  show(teacherMode ? "teacher" : "setup");
}
el("joinForm").addEventListener("submit", event => { event.preventDefault(); perform(el("joinBtn"), () => enterSession(false)); });
el("teacherForm").addEventListener("submit", event => { event.preventDefault(); perform(el("openBtn"), () => enterSession(true)); });
el("voteForm").addEventListener("submit", event => { event.preventDefault(); perform(el("voteBtn"), submitVote); });
el("newSession").addEventListener("click", reset);
el("changeCode").addEventListener("click", reset);
el("copyLink").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(url(false)); el("copyStatus").textContent = "Link skopiowany."; }
  catch { el("studentLink").select(); el("copyStatus").textContent = "Zaznaczony link możesz skopiować ręcznie."; }
});
el("downloadQr").addEventListener("click", () => {
  const canvas = el("studentQr").querySelector("canvas"), img = el("studentQr").querySelector("img");
  const href = canvas ? canvas.toDataURL("image/png") : img?.src;
  if (!href) return;
  const a = document.createElement("a"); a.href = href; a.download = `QR_POCHODZENIE_${session}.png`; a.click();
});
show(teacherMode ? "teacher" : "setup");
if (params.get("session")) {
  try {
    const value = code(params.get("session"));
    el(teacherMode ? "teacherCode" : "sessionCode").value = value;
    if (teacherMode) perform(el("openBtn"), () => enterSession(true));
  } catch (error) { showError(error); }
}
