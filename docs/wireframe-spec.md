# Wireframe v4 spec

What P1 must show. Tool-agnostic on purpose — draw it in Figma, Penpot, or
whatever the group agrees on, then export PNG (or PDF) into `draft/`.
Previous version: `draft/JobTrack_Wireframe_P1.png` (v3).

The list is a **card grid on every screen size**: desktop 2–3 columns, mobile
one column. No data table, no responsive column hiding.

## Screen 1 — `/login`

| Element | Notes |
|---|---|
| Centred card (~400px desktop, full-width minus margins on mobile) | |
| Header | `JobTrack` |
| Username input | |
| Password input | |
| `登录` button | |
| Error state | red text `用户名或密码不正确` |
| Demo accounts hint | `admin` / `user`, seeded — there is no registration page |

States to draw: default, error, and "already logged in → redirect to `/`".

## Screen 2 — `/` (dashboard)

**Top bar** — brand `JobTrack`, current username, `[登出]`.

**Stats row** — four cards: `总投递 {n}`, `面试中 {n}`, `Offer {n}`, `已拒绝 {n}`.
Desktop 4 across, mobile 2×2.

**Add / edit form** (one card):

| Field | Control |
|---|---|
| 公司 | text input with a dropdown of existing company names |
| 职位 | text input |
| 状态 | select: applied / interviewing / offer / rejected |
| 面试日 | date picker |
| 投递链接 | URL input |
| 地点 | text input |
| 薪资 | text input, free text |
| 截止日期 | date picker |
| 备注 | textarea |
| 保存 | primary button |

Mobile: one field per row, buttons full width. Edit mode reuses the same form
pre-filled, titled `编辑投递`. Note on the card: `admin 可见全组数据`.

**Application cards** (grid, desktop 2–3 columns, mobile 1):

```
┌──────────────────────────────────┐
│ Example Ltd                      │  ← company
│ Junior Developer ↗               │  ← position, links to posting_url
│ [面试中]                          │  ← status badge
│ 香港 · HKD 20k-25k · 截止 12/15    │  ← location · salary · deadline (muted)
│ 面试日 2026-11-30                 │
│ 备注：Second round with platform  │
│              [编辑]  [删除]        │  ← delete shows a confirm dialog
└──────────────────────────────────┘
```

- If a posting field is empty, omit that part of the meta line.
- Empty state: `还没有投递记录` with a hint to use the form above.
- `user` sees only their own cards; `admin` sees all cards and each card carries
  a small username label.
- Delete is AJAX: no full page reload after confirming.

## Screen 3 — `/admin/users` (admin only)

Top bar same as `/`. One card containing a row per user:

```
┌──────────────────────────────────────────────────────┐
│ alice  角色 [user ▼]                                  │
│        查看全部投递 [ ]   管理用户 [ ]                  │
│ bob    角色 [user ▼]                                  │
│        查看全部投递 [ ]   管理用户 [ ]                  │
│                                    [保存]             │
└──────────────────────────────────────────────────────┘
```

Mobile: each user becomes a stacked block, toggles full width.

Unauthenticated visit → redirect to `/login`; non-admin visit → a clear
`没有权限` state. This screen is the visible proof of "grant" in rubric F.

## Export checklist

- [ ] Desktop and mobile frames shown for every screen
- [ ] Both roles shown where they differ (user vs admin list)
- [ ] Error / empty / permission-denied states included
- [ ] File named `draft/JobTrack_Wireframe_P1_v4.png`, v3 kept for history
- [ ] `docs/scope.md` updated when the new file lands (rubric D pays only when the wireframe stays in step with the build)
