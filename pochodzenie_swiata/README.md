# Skąd się wzięło wszystko to, co istnieje?

Anonimowe głosowanie z dwiema odpowiedziami, kodami sesji i wynikami na żywo.
Korzysta z tego samego projektu Firebase i wyglądu co `obraz_swiata`.

## Jednorazowa aktywacja

W Firebase Console → projekt **gry-filozofia** → **Firestore Database → Rules**
wklej całą zawartość `pochodzenie_swiata/firestore.rules` i kliknij **Publish**.
Plik zawiera również dotychczasowe reguły ankiety o obrazie świata.
Jeśli reguły w konsoli zostały rozszerzone o inne funkcje, dodaj tylko blok
`match /originPollSessions/{sessionId}` do istniejących reguł.
Anonimowe logowanie Authentication powinno być już włączone dla poprzedniej ankiety.
Samo dodanie plików do GitHub nie publikuje reguł w Firebase.

## Prowadzący

1. Otwórz https://wieslawfirek.github.io/gry-filozofia/pochodzenie_swiata/?view=teacher
2. Wpisz swój kod, np. `POCHODZENIE-2026-A`, i kliknij **Utwórz / otwórz sesję**.
3. Podaj studentom kod, link lub kod QR. Wyniki odświeżają się automatycznie.
4. Na kolejne zajęcia lub kolejny rok użyj nowego kodu, np. `POCHODZENIE-2027-A`.
5. Wcześniejszy kod otwiera dotychczasowe wyniki, nie zeruje ich. Zachowaj adres widoku wyników.

## Student

Otwiera stronę, wpisuje kod sesji i wybiera odpowiedź, następnie naciska **Oddaj głos**.
Link/QR może już zawierać kod. Wyniki są widoczne po potwierdzonym zapisie głosu.
Błędny lub jeszcze nieutworzony kod nie otwiera głosowania.

## Dane i ograniczenia

Sesje są zapisane w `originPollSessions`, oddzielnie od poprzedniej ankiety.
Dokument sesji zawiera rodzaj ankiety, czas utworzenia i anonimowy identyfikator twórcy.
Głos zawiera wyłącznie wybraną odpowiedź i czas zapisu, pod anonimowym identyfikatorem Firebase.
Nie zbieramy imion, nazwisk ani numerów albumu.
Baza blokuje zmianę i usunięcie głosu oraz kolejny zapis tego samego użytkownika w tej samej sesji.
Nowy kod pozwala tej samej osobie zagłosować ponownie w kolejnym roku.
Panel prowadzącego jest widokiem organizacyjnym, nie kontem z hasłem.
Każdy znający kod może odczytać anonimowe wyniki; kod oddziela grupy, nie stanowi zabezpieczenia dostępu.
Zmiana przeglądarki lub wyczyszczenie jej danych może pozwolić oddać kolejny głos.
To ankieta dydaktyczna, nie system weryfikujący tożsamość uczestników.

Treść pytania i dwóch odpowiedzi zachowano zgodnie z propozycją prowadzącego.
