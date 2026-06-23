# DrPando Desktop

A thin **Electron** desktop shell around the DrPando web panel (`https://drpando.com`).
It opens the live web app in its own window — no duplicated code, always up to date.
Targets **macOS** (`.dmg`) and **Windows** (`.exe` NSIS installer).

## Develop / run locally

```bash
npm install
npm start          # launches the app window pointing at drpando.com
```

## Build installers

```bash
npm run dist:mac   # → dist/DrPando-<ver>-arm64.dmg + -x64.dmg   (build ON a Mac)
npm run dist:win   # → dist/DrPando Setup <ver>.exe              (best built ON Windows / CI)
```

> Cross-building the Windows installer from macOS needs Wine and is flaky — build
> Windows on a Windows machine or in CI (GitHub Actions `windows-latest`).

## Signing (so users don't get warnings)

- **macOS — free, already covered by the existing Apple Developer account.**
  Sign + notarize so the `.dmg` opens with no warning:
  ```bash
  export CSC_NAME="Developer ID Application: <Your Name> (4HPU43552C)"
  export APPLE_ID="<apple-id-email>"
  export APPLE_APP_SPECIFIC_PASSWORD="<app-specific-password>"
  export APPLE_TEAM_ID="4HPU43552C"
  npm run dist:mac
  ```
  (electron-builder notarizes automatically when these env vars are set.)

- **Windows — optional, paid.** Without a code-signing certificate the app still
  works, but the first launch shows a "Windows protected your PC / unknown
  publisher" SmartScreen prompt (user clicks *More info → Run anyway*). To remove
  it, buy an OV/EV code-signing cert (or Azure Trusted Signing) and set
  `CSC_LINK` / `CSC_KEY_PASSWORD` before `npm run dist:win`.

## Distribute

Upload the built `.dmg` / `.exe` to a public location (e.g. the web server or a
GitHub Release) and link to them from the site, e.g. a "Download desktop app"
button on drpando.com.

## Notes

- The app requires internet (DrPando is an online SaaS).
- External links (outside drpando.com) open in the user's default browser.
- The window is fully sandboxed (`contextIsolation`, no `nodeIntegration`).
