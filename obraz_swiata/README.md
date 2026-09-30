# Jak naprawdę widzisz świat? — test na GitHub Pages

Gotowa aplikacja do zajęć. Student odpowiada na 15 pytań, otrzymuje indywidualny profil, a jego anonimowy wynik trafia do wspólnej sesji. Widok grupy pokazuje na żywo:

- liczbę osób z profilem naturalnym, naukowym, filozoficznym i mieszanym,
- procenty dla całej grupy,
- rozkład odpowiedzi na każde pytanie.

## Dlaczego potrzebny jest Firebase?

GitHub Pages przechowuje tylko statyczne pliki strony. Żeby telefony wszystkich studentów mogły zapisywać wyniki w jednym miejscu, potrzebna jest mała zewnętrzna baza. W tej wersji używany jest Firebase Firestore + anonimowe logowanie Firebase Authentication.

## 1. Utwórz projekt Firebase

1. Wejdź do Firebase Console i utwórz nowy projekt.
2. W projekcie wybierz **Authentication** → **Sign-in method** → włącz **Anonymous**.
3. Wybierz **Firestore Database** → **Create database**.
4. W ustawieniach projektu dodaj aplikację **Web** (`</>`).
5. Firebase pokaże obiekt `firebaseConfig`.

## 2. Wklej konfigurację

Otwórz plik `firebase-config.js` i zamień pola `WSTAW_TUTAJ` na wartości podane przez Firebase.

Przykład:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "twoj-projekt.firebaseapp.com",
  projectId: "twoj-projekt",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Konfiguracja aplikacji Web Firebase może znajdować się w kodzie strony. Bezpieczeństwo danych zapewniają reguły Firestore, a nie ukrywanie `firebaseConfig`.

## 3. Ustaw reguły Firestore

W Firebase Console otwórz **Firestore Database → Rules**.

Skopiuj całą zawartość pliku `firestore.rules` i kliknij **Publish**.

Reguły pozwalają uczestnikowi utworzyć tylko jeden dokument odpowiedzi pod jego anonimowym identyfikatorem. Nie pozwalają na późniejszą edycję ani usuwanie odpowiedzi z poziomu aplikacji.

## 4. Wgraj folder na GitHub

Możesz umieścić ten test jako osobny folder w swoim repozytorium z grami, np.:

```text
/
  index.html                 <- Twoja strona główna z grami
  obraz-swiata/
    index.html
    style.css
    app.js
    firebase-config.js
    firestore.rules
```

Po wgraniu adres będzie wyglądał np. tak:

```text
https://TWOJ_LOGIN.github.io/TWOJE_REPO/obraz-swiata/
```

## 5. Jak prowadzić zajęcia

### Student

1. Otwiera stronę lub skanuje QR.
2. Wpisuje kod sesji, np. `FILOZOFIA-W1`.
3. Odpowiada na 15 pytań.
4. Widzi własny profil.
5. Dopiero po zakończeniu może zobaczyć wyniki grupy.

### Prowadzący

1. Otwiera tę samą stronę.
2. Wpisuje ten sam kod sesji.
3. Kliknie **Pokaż wyniki grupy** albo **Widok prowadzącego**.
4. Wyniki aktualizują się na żywo.

Możesz też wejść od razu do widoku prowadzącego:

```text
https://.../obraz-swiata/?session=FILOZOFIA-W1&view=teacher
```

A link dla studentów może mieć już wpisany kod sesji:

```text
https://.../obraz-swiata/?session=FILOZOFIA-W1
```

## Jak liczony jest wynik?

Każda odpowiedź jest wewnętrznie przypisana do jednego z trzech sposobów patrzenia na świat:

- **naturalny / zdroworozsądkowy**,
- **naukowy**,
- **filozoficzny**.

Kolejność odpowiedzi jest losowana osobno przy każdym pytaniu, więc student nie widzi schematu A/B/C.

Wygrywa kategoria z największą liczbą odpowiedzi. W przypadku remisu aplikacja pokazuje **profil mieszany**. Dzięki temu wynik nie jest sztucznie przypisywany do jednej kategorii.

## Dane

Aplikacja nie pyta o imię, nazwisko, e-mail ani numer albumu. W bazie zapisuje tylko:

- anonimowy techniczny identyfikator Firebase,
- wybrane kategorie odpowiedzi,
- sumę punktów w trzech profilach,
- profil końcowy,
- czas zapisu.

Kod sesji warto zmieniać dla każdej grupy lub każdego roku, np. `FILO-W1-2026-A`.

## Ważne

Blokada wielokrotnego udziału działa na dwóch poziomach:

- dokument wyniku jest zapisany pod anonimowym identyfikatorem Firebase użytkownika,
- przeglądarka zapamiętuje lokalnie, że dla danego kodu sesji wynik został już wysłany.

To wystarcza do dydaktycznego głosowania na zajęciach, ale nie jest systemem egzaminacyjnym.
