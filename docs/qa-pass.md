# QA pass — every flow, every kind of visitor (issue 25)

Tested against the local dev server (podman `jobtrack-db`, seeded demo data)
and, for the interactive parts, driven through a real browser (Edge) with
clicks, not scripted HTTP alone. Date: 2026-11-19. Re-run after each merge
until the presentation; the last-known state follows the merges through #37.

## Logged-out visitor

| Flow | Expected | Result |
|---|---|---|
| Open `/` | redirect `/login` | ✅ 302 → `/login` |
| Open `/applications/1` | redirect `/login` (per-route guard) | ✅ |
| Open `/admin/users` | redirect `/login` | ✅ |
| Unknown path (e.g. `/nope`, HTML accept) | redirect `/login` | ✅ |
| Unknown path, non-HTML (`/favicon.ico`) | 404 text, no bounce | ✅ |
| Login with wrong password | back to `/login?error=1`, red 错误 banner | ✅ browser-verified |
| Demo chip fills the form | admin/alice chips fill fields | ✅ browser-verified |
| Login as admin / alice | redirect `/`, shell shows account | ✅ |

## Normal user (alice)

| Flow | Expected | Result |
|---|---|---|
| Dashboard | only her 12 records, chips 12/5/3/2/2 | ✅ |
| Nav | no 用户与权限 entry (sidebar + mobile tabbar both) | ✅ |
| `GET /admin/users` | 403 + 没有权限 dialog over the shell | ✅ browser-verified |
| Create via dialog | card appears, counts step up | ✅ browser-verified |
| Create duplicate (user,job) | dialog stays open, 你已经在跟踪这个职位了 | ✅ browser-verified |
| Create missing company | 请填写公司名称, typed values kept (fetch-enhanced) | ✅ |
| Edit (pencil) | dialog pre-filled; change status/note → card updates, updated_at moves | ✅ browser-verified |
| Delete (confirm dialog) | dialog 删除这条记录? → card removed **without reload**, chip counts step down; last card reloads to 空状态 | ✅ browser-verified |
| Foreign id `/applications/999` | 404 dialog 页面不存在 | ✅ |
| Company name click | opens the detail page | ✅ |

## Admin

| Flow | Expected | Result |
|---|---|---|
| Dashboard | all users' cards, owner label instead of edit/delete actions | ✅ browser-verified |
| Detail of another user's record | 编辑/删除 hidden, 查看原始职位 shown | ✅ |
| `/admin/users` | 200, banner + 3 rows, 你 tag on self | ✅ browser-verified |
| Grant 查看全部投递 to alice | `users.can_view_all_applications` override written; alice's **next request** sees everything (13 cards incl. admin's, with owner labels) | ✅ curl + browser |
| Role change resets overrides | falls back to the new role's template | ✅ curl |
| Self-revoke 管理用户 | blocked in code (forced `true`) — no lock-out | ✅ curl |
| Bulk save with `role[uN]`/`has_*` | every row applies; qs numeric-array trap avoided by the `u` prefix | ✅ curl |
| Logout | POST → `/login`, protected routes bounce again | ✅ |

## Views & responsive (issue 24, emulation part)

Device-emulation sweep (DevTools, headless Edge), overflow + tap-target probe
on every authenticated page at three widths — no horizontal overflow
anywhere; the only "wide" elements are the intentionally scrollable chip row:

| Width | Page | overflowX | Tap targets < 40px |
|---|---|---|---|
| 390×844 | dashboard | 0 | icon-btn 32×32, chips h32 |
| 390×844 | detail | 0 | icon-btn 32×32 |
| 390×844 | admin | 0 | icon-btn 32×32 |
| 375×667 | all four | 0 | same |
| 414×896 | all three | 0 | same |

`@media (pointer: coarse)` enlarges the icon buttons and card text-link hit
areas to 40px on touch devices without changing the desktop design. A
real-phone pass remains optional for the rehearsal (same Wi-Fi or the live
URL).

## Accessibility (Lighthouse, mobile)

Dashboard/login audits after the fix pass: **accessibility 90** (was 80),
best-practices 92, SEO 91. Remaining failed audits are injected by browser
extensions in the test profile (豆包's `aria-label` div, Grammarly's float
button image, ad-blocker console noise) — none originate from the app.
Fixed along the way:

- landmarks: `<main class="page">` (shell) / `<main class="login">` /
  `<nav aria-label>` for the mobile tab bar
- heading order: card titles h3 → h2 (no skipped level under the page h1)
- active-chip counter contrast on the ink chip (0.6 → 0.78 alpha, ≥ 4.5:1)
- `meta description` + SVG favicon (the Penpot app-icon geometry) — favicon
  404 console error gone
- form fields carry `maxlength` per the column limits (company/title/
  location/salary 100)


## Known limitations (accepted for the course)

- Sessions are `MemoryStore`: a server restart logs everyone out; on Render's
  free tier the instance sleeps after idle, so log in again after a cold start.
- Logout is a POST (no CSRF token); `SameSite=lax` keeps cross-site POSTs from
  carrying the session, and there is no login form auto-fill risk beyond the
  seeded demo accounts.
- Search/sort/chips are server-rendered GETs — full page load per change, no
  JS filtering. Fine at demo scale.
