# CLAUDE.md — drpando-desktop

This file provides guidance to Claude Code (claude.ai/code) when working in the **drpando-desktop** repository.

`drpando-desktop` is the **desktop app** for DrPando: a thin **Electron** shell that loads the live web panel `https://drpando.com` in its own sandboxed window. It is NOT a separate frontend — there's no duplicated UI code; it just wraps the web app, so it's always up to date. Part of the DrPando workspace (see the sibling `drpando/` and `drpando-web/` repos).

## What's here

```
main.js                       # the whole app: a BrowserWindow that loads drpando.com
package.json                  # electron + electron-builder config (build targets, publish)
build/icon.png                # 1254px source icon; electron-builder generates .icns/.ico
.github/workflows/release.yml # CI: build Mac + Windows installers on a version tag, auto-publish
README.md                     # human-facing quick guide
```

`main.js` behavior: loads `https://drpando.com`; external links (non-drpando.com) open in the user's default browser; renderer is fully sandboxed (`contextIsolation`, no `nodeIntegration`); shows a "Bağlantı kurulamadı / Yeniden dene" screen if offline. The app **requires internet** (DrPando is online SaaS).

## Branch workflow

Same as the other repos: two long-lived branches `main` + `develop`. Work on **`develop`**; merge to **`main`** to ship. (`main` is also where release tags are cut from.)

## Releasing (the only deploy path)

Installers are **built in GitHub Actions, never locally** — Windows `.exe` can't be built on a Mac. To cut a release:

1. Bump `version` in `package.json` (must match the tag you'll push).
2. Merge `develop` → `main`, push `main`.
3. `git tag vX.Y.Z && git push origin vX.Y.Z`.

CI then: builds **macOS** (`DrPando-mac.dmg`, universal Intel+Apple Silicon — **signed with Developer ID + notarized**) and **Windows** (`DrPando-Setup.exe` — **unsigned**), uploads both to a draft GitHub Release, then a `publish` job flips it to **public + latest** once both are done. No manual step.

- **Stable artifact names** (`DrPando-mac.dmg`, `DrPando-Setup.exe`) are intentional: the drpando-web download buttons link to `https://github.com/kadircanisbilen/drpando-desktop/releases/latest/download/<name>`, which only stay valid if names don't change per version.
- The repo is **public** so those `/latest/download/` links work anonymously.

## Signing / notarization (already configured)

macOS signing + notarization run in CI from **repo secrets** (already set): `MAC_CSC_LINK` (base64 of the Developer ID Application .p12), `MAC_CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` (`4HPU43552C`). Cert: "Developer ID Application: Kadircan Isbilen (4HPU43552C)" — covered free by the existing Apple Developer account. `hardenedRuntime: true` (required for notarization).

**Windows is unsigned** → first-run SmartScreen "unknown publisher" warning (bypassable). Removing it needs a paid code-signing cert (`CSC_LINK`/`CSC_KEY_PASSWORD` for the Windows step) — not set up.

## Local dev

```bash
npm install
npm start          # launches the window pointing at drpando.com
npm run dist:mac   # local .dmg (signs with whatever Developer ID is in the keychain)
```

## Gotchas

- **Do NOT set `CSC_NAME`** with the "Developer ID Application:" prefix — electron-builder errors ("remove prefix … chosen automatically"). Omit it; it auto-selects the Developer ID cert for the dmg.
- **Never pass an empty `CSC_LINK`** env (e.g. a missing secret) — electron-builder treats `""` as a file path → "not a file" error. The mac/win build steps are split so the Windows job has no signing env at all.
- `package.json` `version` must equal the pushed tag, or the auto-publish job (which un-drafts `${{ github.ref_name }}`) won't match the release electron-builder created.
- macOS notarization waits on Apple's notary service — usually minutes, but their queue can occasionally take 30–45+ min. That's Apple's side; check with `xcrun notarytool history --apple-id <id> --password <app-specific> --team-id 4HPU43552C`.
