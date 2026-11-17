# Wireframe v4 spec

> **Penpot 项目链接：** <https://design.penpot.app/?screen=viewer&file-id=b4b906dd-9024-819c-8008-f4673c7ac5e7&page-id=b4b906dd-9024-819c-8008-f4673c7ac5e8&section=interactions&index=0>

What P1 must show. **Chosen tool: Penpot** (open source, cloud, three-person
collaboration). Draw in Penpot, export PNG (or PDF) into `draft/`.
Previous version: `draft/JobTrack_Wireframe_P1.png` (v3).

## Penpot setup

- Project name: `JobTrack P1 v4`
- One board per screen size, named exactly as below so exports are unambiguous:
  - `01 Login — Desktop` (1440×900)
  - `02 Dashboard — Desktop` (1440×900)
  - `03 Dashboard — Mobile` (390×844)
  - `04 Admin Users — Desktop` (1440×900)
  - `05 Admin Users — Mobile` (390×844)
  - `06 Login — Mobile` (390×844)
  - `07 Application Detail — Desktop` (1440×900)
  - `08 Application Detail — Mobile` (390×844)
  - `09 Add Application — Modal — Desktop` (1440×900)
  - `10 Add Application — Modal — Mobile` (390×844)
  - `11 Delete Confirm — Modal — Desktop` (1440×900)
  - `12 Delete Confirm — Modal — Mobile` (390×844)
  - `13 Component Library` (880×520)
- Every desktop screen has a mobile counterpart — the mobile board is a re-flow
  of the same components, not a reduced feature set. Decoration-only elements
  (the login brand panel, wide stat band) may differ.
- Use Penpot's flex/grid layout on the card grid and stacked cards so the
  desktop 3-column and mobile 1-column variants are visibly one design system.
- Export each board at 2× PNG, or export a single combined PNG/PDF for submission.

The list is a **card grid on every screen size**: desktop 2–3 columns, mobile
one column. No data table, no responsive column hiding.

## Screen 1 — `/login` (board `01`, mobile `06`)

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

## Screen 2 — `/` (dashboard, board `02`, mobile `03`)

**Top bar** — brand `JobTrack`, current username, `[登出]`.

**Status filters** — one chip per status, each carrying its count:
`全部 {n}` `已投递 {n}` `面试机会 {n}` `Offer {n}` `已拒绝 {n}`. Desktop in one
row under the top bar; mobile in a horizontally scrollable row.

> Spec change: the original four-card stats row was dropped. It repeated the
> same counts the filter chips already show, so the chips are the single place
> the numbers live and the card grid moves up one band.

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
│ [面试机会]                        │  ← status badge (component instance)
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

## Screen 3 — `/admin/users` (admin only, board `04`, mobile `05`)

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

## Screen 4 — `/applications/:id` (board `07`, mobile `08`)

The card grid truncates long notes and has nowhere to put the original advert,
so opening a card lands on a detail view of the same record.

| Block | Contents |
|---|---|
| Header | `← 返回看板`, company (24px), position, status badge |
| 投递信息 | 地点 · 薪资 · 截止日期 · 面试日 · 投递日 · 来源, two columns |
| 备注 | full text, no truncation |
| Actions | `编辑投递` (primary), `查看原始职位 ↗` (outline), `删除记录` (danger ghost) |
| 记录信息 | 投递人, 创建时间, 最近更新 |

Mobile stacks the same blocks and moves the three actions into a bottom bar
(`编辑投递` + `删除`). Editing reuses the dashboard form in edit mode.

## Modals (boards `09`–`12`)

Two dialogs, each drawn at both breakpoints on top of the screen that opens it,
with a 45% ink scrim:

| Modal | Trigger | Desktop | Mobile |
|---|---|---|---|
| New / edit application | `新增投递` on the dashboard, pencil on a card | `09` | `10` |
| Delete confirm | `删除记录` on the detail page | `11` | `12` |

Desktop uses a centred card — 720×660 for the form, 420×210 for the confirm.
Mobile uses a bottom sheet for the form and a centred card for the confirm.
Form fields split across the two tables it now models: the advert half (company,
title, posting URL, location, salary, deadline) writes to `jobs`, the personal
half (status, interview date, note) writes to `applications`; company and title
are required.

## Export checklist

- [ ] Desktop and mobile frames shown for every screen (12 boards + library)
- [ ] Both roles shown where they differ (user vs admin list)
- [ ] Error / empty / permission-denied states included
- [ ] File named `draft/JobTrack_Wireframe_P1_v4.png`, v3 kept for history
- [ ] `docs/scope.md` updated when the new file lands (rubric D pays only when the wireframe stays in step with the build)
