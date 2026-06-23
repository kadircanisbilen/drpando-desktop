# DrPando Desktop

A thin **Electron** desktop shell around the DrPando web panel (`https://drpando.com`).
It opens the live web app in its own window — no duplicated code, always up to date.
Targets **macOS** (`.dmg`) and **Windows** (`.exe` NSIS installer).

## Develop / run locally

```bash
npm install
npm start          # launches the app window pointing at drpando.com
```

## Releasing (CI does both platforms, auto-published)

Don't build for distribution locally (Windows `.exe` can't be built on a Mac).
Instead push a version tag — GitHub Actions builds both installers and publishes
the Release automatically:

```bash
# 1. bump "version" in package.json (must match the tag)
# 2. merge develop → main, push main
git tag vX.Y.Z && git push origin vX.Y.Z
```

CI builds **macOS** (`DrPando-mac.dmg`, universal, **signed + notarized**) and
**Windows** (`DrPando-Setup.exe`, **unsigned**), then flips the Release to
public + latest once both are uploaded. The drpando-web download buttons point
at the stable `releases/latest/download/DrPando-mac.dmg` / `DrPando-Setup.exe`
URLs, so nothing else needs updating per release.

Local `npm run dist:mac` still works for testing a `.dmg` on your own Mac.

## Signing

- **macOS — configured & free** (existing Apple Developer account, team
  `4HPU43552C`). CI signs with the "Developer ID Application" cert and notarizes,
  using repo secrets `MAC_CSC_LINK`, `MAC_CSC_KEY_PASSWORD`, `APPLE_ID`,
  `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`. The `.dmg` opens with no
  warning on any Mac.
- **Windows — unsigned (paid, not set up).** First launch shows a SmartScreen
  "unknown publisher" prompt (*More info → Run anyway*); the app works fine. To
  remove it, add an OV/EV cert via `CSC_LINK` / `CSC_KEY_PASSWORD` on the Windows
  build step.

## Notes

- The app requires internet (DrPando is an online SaaS).
- External links (outside drpando.com) open in the user's default browser.
- The window is fully sandboxed (`contextIsolation`, no `nodeIntegration`).
