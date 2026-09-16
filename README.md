# 🎱 LottoSearch

**➡️ https://rinukkusu.github.io/LottoSearch/**

Check whether your numbers have ever been drawn in the Austrian Lotto (6 aus 45), with every draw since 1986.

- Pick 3–5 numbers to see every draw that contained all of them
- Pick 6 numbers to see exact matches and draws that hit 5 of 6
- Optionally filter exact matches by the Zusatzzahl

## Data

Draw results come from the official CSV downloads on [win2day.at](https://www.win2day.at/lotterie/lotto/lotto-statistik-zahlen-ergebnisse-download). [`scripts/build.mjs`](scripts/build.mjs) downloads all files and compiles them into `data/draws.js`.

A [GitHub Actions workflow](.github/workflows/deploy.yml) rebuilds the data daily and deploys the site to GitHub Pages.

## Local development

Requires Node.js 18+ (no dependencies).

```bash
node scripts/build.mjs
```

Then open `index.html`. Add `--save-csv` to also keep the raw CSV files in `data/`.
