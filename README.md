# 🎱 LottoSearch

**➡️ https://rinukkusu.github.io/LottoSearch/**

Prüfe, ob deine Zahlen jemals im österreichischen Lotto (6 aus 45) gezogen wurden – mit allen Ziehungen seit 1986.

- Wähle 3–5 Zahlen, um alle Ziehungen zu sehen, die jede dieser Zahlen enthielten
- Wähle 6 Zahlen, um exakte Treffer und Ziehungen mit 5 von 6 Richtigen zu sehen
- Optional: exakte Treffer nach der Zusatzzahl filtern

## Daten

Die Ziehungsergebnisse stammen aus den offiziellen CSV-Downloads auf [win2day.at](https://www.win2day.at/lotterie/lotto/lotto-statistik-zahlen-ergebnisse-download). [`scripts/build.mjs`](scripts/build.mjs) lädt alle Dateien herunter und fasst sie in `data/draws.js` zusammen.

Ein [GitHub-Actions-Workflow](.github/workflows/deploy.yml) aktualisiert die Daten täglich und veröffentlicht die Seite auf GitHub Pages.

## Lokale Entwicklung

Benötigt Node.js 18+ (keine Abhängigkeiten).

```bash
node scripts/build.mjs
```

Danach `index.html` öffnen. Mit `--save-csv` werden zusätzlich die CSV-Rohdateien in `data/` gespeichert.
