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

390×844 mobile emulation (Edge, dpr 2) — real-device pass still to do with a
phone before the presentation:

- dashboard: top bar + brand/avatar, horizontally scrollable chips, single
  column cards, bottom tab bar with centre FAB → modal ✅ (screenshot taken)
- detail: stacked cards, fixed bottom action bar (编辑投递 / 查看原始职位 or 删除) ✅
- admin: banner + stacked user rows + save bar ✅ (screenshot taken)
- login: brand panel collapses, form full width ✅

## Known limitations (accepted for the course)

- Sessions are `MemoryStore`: a server restart logs everyone out; on Render's
  free tier the instance sleeps after idle, so log in again after a cold start.
- Logout is a POST (no CSRF token); `SameSite=lax` keeps cross-site POSTs from
  carrying the session, and there is no login form auto-fill risk beyond the
  seeded demo accounts.
- Search/sort/chips are server-rendered GETs — full page load per change, no
  JS filtering. Fine at demo scale.
