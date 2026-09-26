# Design: Studio policies

- Version: 2
- Status: approved
- Date: 2026-09-27
- Implements: docs/prd/studio-policies.md v1; uses docs/design/visual-language.md

## Platforms

| web | wap | android | ios |
|---|---|---|---|
| page (tabs) | page (accordion) | webview of the wap page | webview of the wap page |

## Component inventory

| Component | Screen | Purpose | Platforms | Data source |
|---|---|---|---|---|
| NavLink "Policies" | shell | Goes to `/policies`, or the Policies tab | all | — |
| PoliciesScreen | policies | Root, titled "Studio policies" | web, wap | — |
| StudioTabs | policies | One tab per studio, with a panel below | web | `GET /policies` |
| StudioAccordion | policies | One toggle per studio; the expanded panel appears under its toggle | wap | `GET /policies` |
| PolicyPanel | policies | Studio name, then the rules list | web, wap | `StudioPolicies` |
| PolicyRule | policies | Title (bold) and text | web, wap | `PolicyRule` |
| PoliciesWebView | policies | Full-screen webview | android, ios | `<web>/policies?embed=1` |

## States

**Policies page (web, wap)**

| State | Visible | Identifiers |
|---|---|---|
| loading | "Loading policies…" | `policies.screen`, `policies.loading` |
| empty | "No policies published." | `policies.empty` |
| error | API `message` | `policies.error` |
| populated, web | tabs and the selected panel | `policies.tabs`, `policies.studio.tab` × 3, `policies.panel` |
| populated, wap | toggles, and at most one panel | `policies.accordion`, `policies.studio.toggle` × 3, `policies.panel` (only while expanded) |

A panel contains `policies.rule.item` × N and, **on web only**,
`policies.studio.name` as its heading. On wap the expanded toggle already
shows the studio name directly above the rules, so repeating it was
redundant; the web tab row sits apart from the panel, so the heading still
orients the reader there. Each
rule item contains `policies.rule.title` and `policies.rule.text`.

On web, the selected tab has `aria-selected="true"`. On wap, an expanded
toggle has `aria-expanded="true"`.

**PoliciesWebView (android, ios)**

| State | Visible | Identifiers |
|---|---|---|
| loading | spinner | `policies.webview`, `policies.webview.loading` |
| error | "Could not load the policies page." | `policies.webview.error` |
| populated | the wap page, with wap identifiers in the webview context | `policies.webview` (native), plus the `policies.*` identifiers above (web context) |

"Empty" belongs to the embedded page.

## Breakpoint behaviour (web vs wap)

| Component | web (≥ 768 px) | wap (< 768 px) |
|---|---|---|
| Studio selection | `StudioTabs`: a `role="tablist"` row, as `policies.tabs` | `StudioAccordion`: stacked `<button>` toggles, as `policies.accordion` |
| Initial state | the first studio is selected | all collapsed |
| Panel | always one | zero or one |

## Native behaviour (android / ios)

- **Tab:** a third tab, "Policies", with `tabBarButtonTestID: 'nav.policies.link'`.
- **Webview:** `react-native-webview` with `webviewDebuggingEnabled`,
  which makes the web context visible to Appium on both OSes. The
  loading and error views come from `renderLoading` and `renderError`.
- android and ios don't differ.

## Acceptance criteria mapping

| PRD AC | Identifiers |
|---|---|
| AC-2 | `nav.policies.link`, `policies.screen` |
| AC-3 | `policies.tabs`, `policies.studio.tab`, `policies.panel`, `policies.studio.name` (web only) |
| AC-4 | `policies.accordion`, `policies.studio.toggle`, `policies.panel` |
| AC-5 | `policies.rule.item`, `policies.rule.title`, `policies.rule.text` |
| AC-6, AC-7 | `policies.webview`, then the wap identifiers in the web context |
| AC-8 | absence of `nav.bar` and `nav.tabs` |
| EC-1, EC-3 | `policies.error`, `policies.loading` |
| EC-2 | `policies.webview.error` |

## Open questions

None.

## Changelog

- v2 (M4): `policies.studio.name` becomes web-only, removing the duplicated studio name on wap (and so inside the native webview); each studio toggle and tab shows its accent dot and neighbourhood.
