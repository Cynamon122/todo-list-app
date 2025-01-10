# To-Do List App

## Opis projektu

To-Do List App to progresywna aplikacja webowa (PWA), która pozwala użytkownikom zarządzać listami zadań i notatkami głosowymi. Aplikacja jest responsywna, działa w trybie offline i może zostać zainstalowana na urządzeniach mobilnych oraz komputerach.

## Funkcjonalności

- **Zarządzanie zadaniami tekstowymi**:
  - Dodawanie zadań.
  - Usuwanie zadań.
- **Notatki głosowe**:
  - Nagrywanie notatek głosowych za pomocą mikrofonu.
  - Odtwarzanie nagranych notatek.
  - Usuwanie notatek głosowych.
- **Tryb offline**:
  - Aplikacja działa bez dostępu do internetu dzięki Service Worker i Cache API.
  - Informowanie użytkownika o statusie połączenia internetowego.
- **Instalacja aplikacji**:
  - Możliwość instalacji na ekranie głównym urządzenia mobilnego lub jako aplikacja desktopowa.
- **Responsywny design**:
  - Aplikacja dostosowuje się do różnych rozmiarów ekranu.

## Technologie

- **HTML, CSS, JavaScript**:
  - Podstawowe technologie użyte do budowy aplikacji.
- **IndexedDB**:
  - Lokalna baza danych do przechowywania zadań i notatek głosowych.
- **Service Worker i Cache API**:
  - Obsługa trybu offline i buforowanie zasobów aplikacji.

## Instalacja i uruchomienie

### Lokalnie
1. Sklonuj repozytorium:
    ```bash
    git clone https://github.com/twoj-uzytkownik/to-do-list-app.git
    ```
2. Przejdź do folderu projektu:
    ```bash
    cd to-do-list-app
    ```
3. Uruchom serwer lokalny (np. za pomocą Pythona):
    ```bash
    python3 -m http.server
    ```
4. Otwórz aplikację w przeglądarce pod adresem:
    ```
    http://localhost:8000
    ```

### Instalacja jako aplikacja PWA
1. Otwórz aplikację w przeglądarce obsługującej PWA (np. Chrome, Edge).
2. Kliknij ikonę trzech kropek w prawym górnym rogu przeglądarki.
3. Wybierz opcję "Zainstaluj aplikację".

### Dostęp online
Aplikacja jest dostępna online pod adresem: [To-Do List App na GitHub Pages](https://cynamon122.github.io/todo-list-app/).

## Tryb offline

- Aplikacja obsługuje tryb offline dzięki wykorzystaniu Service Worker.
- Zasoby statyczne są buforowane, a dane użytkownika przechowywane w IndexedDB.
- Jeśli aplikacja nie ma dostępu do internetu, użytkownik zostanie o tym poinformowany, a dostępne funkcjonalności będą działać lokalnie.

## Widoki

1. **Home**: Ekran powitalny z informacjami o aplikacji.
2. **Tasks**: Zarządzanie listą zadań.
3. **Voice Notes**: Nagrywanie, odtwarzanie i usuwanie notatek głosowych.

## Wymagania projektu

- **Plik manifestu**:
  - Aplikacja posiada plik `manifest.json`, który definiuje metadane aplikacji.
- **Natywne funkcje urządzenia**:
  - Wykorzystano mikrofon do nagrywania notatek głosowych.
- **Tryb offline**:
  - Wdrożono Service Worker i Cache API.
- **Responsywność**:
  - Aplikacja dostosowuje się do różnych urządzeń i rozdzielczości ekranu.

## Realizacja projektu

Projekt został stworzony w ramach realizacji wymagań projektu edukacyjnego na zajęcia Tworzenie progresywnych aplikacji mobilnych.
