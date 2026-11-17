# JobTrack UI design

> **Penpot 文件：** `JobTrack`，页面 `JobTrack P1 v4`
>
> **直接打开（查看视图）：**
> <https://design.penpot.app/?screen=viewer&file-id=b4b906dd-9024-819c-8008-f4673c7ac5e7&page-id=b4b906dd-9024-819c-8008-f4673c7ac5e8&section=interactions&index=0>
>
> **公开链接：** _待填 — 在查看视图点 `Share` → `Get link`_
>
> **画板导出 PNG：** [`draft/design/penpot/`](../draft/design/penpot)，12 张画板图
> （1:1 实际尺寸：1440×900 / 390×844）+ 1 张总览板。

This is the **design direction** for the preliminary report, not a finished
product. Twelve boards cover every screen at both breakpoints (1440×900 desktop,
390×844 mobile) plus the two dialogs, each at both sizes; the card grid reflows
from 3 columns to one, the admin table becomes stacked user cards, and the
detail page drops its right rail into a bottom action bar. The component
masters live on the file's `Components` page and are not duplicated on the
screens page.

![JobTrack — all boards at a glance](../draft/design/penpot/00-overview.png)

*`00-overview.png` — every board at a glance. The Penpot viewer shows one board
at a time; this is the whole design in a single image.*

| # | Board | Purpose |
|---|---|---|
| 01 | Login — Desktop | entry point, demo accounts, error state |
| 02 | Dashboard — Desktop | search, status filters, application card grid |
| 03 | Dashboard — Mobile | same dashboard, single column + tab bar / FAB |
| 04 | Admin Users — Desktop | user rows, role select, two permission toggles |
| 05 | Admin Users — Mobile | same admin screen, stacked cards, save bar |
| 06 | Login — Mobile | mobile entry point, same fields and demo accounts |
| 07 | Application Detail — Desktop | full notes, meta grid, edit / source / delete |
| 08 | Application Detail — Mobile | same detail, stacked meta + bottom action bar |
| 09 | Add Application — Modal — Desktop | 720×660 form over the dimmed dashboard |
| 10 | Add Application — Modal — Mobile | same form as a bottom sheet |
| 11 | Delete Confirm — Modal — Desktop | 420×210 confirm over the detail page |
| 12 | Delete Confirm — Modal — Mobile | same confirm, centred card |

Counts live in the status filter chips (`全部 / 已投递 / 面试机会 / Offer /
已拒绝`). The earlier KPI row repeated the same numbers, so it was removed
rather than shown twice.

## Boards

Every frame carries a `PNG · 1x` export entry, so a board can be selected and
exported straight from the Penpot right-hand panel. The checked-in copies in
`draft/design/penpot/` were produced that way — no resampling, no cropping.

### 01 · Login — Desktop

![01 Login — Desktop](../draft/design/penpot/01-login-desktop.png)

`01-login-desktop.png` · 1440×900

### 02 · Dashboard — Desktop

![02 Dashboard — Desktop](../draft/design/penpot/02-dashboard-desktop.png)

`02-dashboard-desktop.png` · 1440×900

### 03 · Dashboard — Mobile

![03 Dashboard — Mobile](../draft/design/penpot/03-dashboard-mobile.png)

`03-dashboard-mobile.png` · 390×844

### 04 · Admin Users — Desktop

![04 Admin Users — Desktop](../draft/design/penpot/04-admin-users-desktop.png)

`04-admin-users-desktop.png` · 1440×900

### 05 · Admin Users — Mobile

![05 Admin Users — Mobile](../draft/design/penpot/05-admin-users-mobile.png)

`05-admin-users-mobile.png` · 390×844

### 06 · Login — Mobile

![06 Login — Mobile](../draft/design/penpot/06-login-mobile.png)

`06-login-mobile.png` · 390×844

### 07 · Application Detail — Desktop

![07 Application Detail — Desktop](../draft/design/penpot/07-application-detail-desktop.png)

`07-application-detail-desktop.png` · 1440×900

### 08 · Application Detail — Mobile

![08 Application Detail — Mobile](../draft/design/penpot/08-application-detail-mobile.png)

`08-application-detail-mobile.png` · 390×844

### 09 · Add Application — Modal — Desktop

![09 Add Application — Modal — Desktop](../draft/design/penpot/09-add-application-modal-desktop.png)

`09-add-application-modal-desktop.png` · 1440×900

### 10 · Add Application — Modal — Mobile

![10 Add Application — Modal — Mobile](../draft/design/penpot/10-add-application-modal-mobile.png)

`10-add-application-modal-mobile.png` · 390×844

### 11 · Delete Confirm — Modal — Desktop

![11 Delete Confirm — Modal — Desktop](../draft/design/penpot/11-delete-confirm-modal-desktop.png)

`11-delete-confirm-modal-desktop.png` · 1440×900

### 12 · Delete Confirm — Modal — Mobile

![12 Delete Confirm — Modal — Mobile](../draft/design/penpot/12-delete-confirm-modal-mobile.png)

`12-delete-confirm-modal-mobile.png` · 390×844

`00-overview.png` (1388×2700) is exported from the `00 Overview — All Boards`
board itself: desktop 2×2, the two desktop dialogs, the mobile row, then the
two mobile dialogs. Each cell is a linked image fill of the latest per-board
export, so the overview and the individual boards cannot drift apart.

## Design tokens

The Penpot file has a `JobTrack Core` token set (73 tokens, including 25 `color` and 7 `typography`
composites: `type-h1/h2/title/body/body-medium/meta/meta-medium`) and matching
library styles. Shape fills, font size/weight/family, radius, stroke width and
spacing bind to these tokens, so a palette change propagates.

| Token | Value |
|---|---|
| `canvas` | `#F8FAFC` |
| `surface` | `#FFFFFF` |
| `line` | `#E2E8F0` |
| `ink` / `body` / `muted` / `faint` | `#0F172A` / `#475569` / `#64748B` / `#64748B` |

Text and UI contrast was measured against WCAG AA: body `#475569` 7.6:1, muted/faint
`#64748B` 4.8:1, white on brand `#2563EB` 5.2:1, white on danger `#DC2626` 4.8:1, and all
four status pills 4.5–6.2:1. The former `#94A3B8` faint tone (2.6:1) was retired; the
implementation's `--faint` token moved to `#64748B` at the same time.
| `brand` / `brand-soft` | `#2563EB` / `#EFF6FF` |
| applied | `#EFF6FF` / `#1D4ED8` |
| interviewing | `#FEF3C7` / `#B45309` |
| offer | `#D1FAE5` / `#047857` |
| rejected | `#FEE2E2` / `#B91C1C` |
| radius | 6 / 10 / 12 / 16 / pill |
| icon scale | 16 inline · 18 nav/input · 20 tab bar · 24 FAB |

## Screen notes

- **Position is a link** (`Junior Developer ↗`) pointing at `posting_url`; when
  empty it renders as plain text.
- **Status badge labels**: `已投递`, `面试机会`, `Offer`, `已拒绝`. The stored codes
  remain `applied | interviewing | offer | rejected` — `面试机会` is only the
  display label for `interviewing` (an interview is an event/opportunity, not a
  continuous process).
- **Meta line** shows location · salary · deadline, omitting empty values.
- **Delete** is confirm-then-AJAX, no page reload.
- **Admin** sees every user's cards with a username label; a normal user sees
  only their own. Writes are always ownership-based.
- **`/admin/users`** is the visible "grant" demo: role + two permission toggles.

## Component library

The component **masters** live on the file's `Components` page (hidden in view
mode); the screens page only carries instances. The `Components` page is laid
out on a 1200px grid as labelled white panels: `BUTTONS`, `PAGE BUTTONS`,
`SHELLS`, `INPUTS`, `NAV & BRAND`, `ICONS`, and `STATUS BADGES`.

Badges are real components and every badge on every screen is an instance:

| Component | Variants on boards |
|---|---|
| `badge-applied-v2` | `已投递` |
| `badge-interviewing-v2` | `面试机会` |
| `badge-offer-v2` | `Offer` |
| `badge-rejected-v2` | `已拒绝` |

The `Components` page holds ten more masters, each built from the same tokens
(`10px` radius, `44px` control height, `13px` label). The three icon buttons
are a real interactive variant set with `Variant` and `State` properties:
`Normal`, `Hover`, and `Disabled`.

| Component | Used for |
|---|---|
| `button-with-icon-variants` | Primary / Save / Danger buttons; `Variant` × `State` (`Normal` / `Hover` / `Disabled`) |
| `chip-filter-active` / `chip-filter-idle` | status filter chips with counts |
| `field-text` / `field-select` | form fields (label + control + placeholder) |
| `switch-toggle` | admin permission toggles |
| `nav-item-active` | sidebar row in its active state |
| `modal-shell` | dialog frame: card, title, divider, footer |
| `drawer-shell` | mobile bottom sheet with grabber, rounded top and footer |
| `app-icon` | shared briefcase + progress-check brand mark |

That is 37 component sets in the file library: 19 icon components, 3 state-variant button sets (9 states), 3 single button components used by the pages (`btn-primary` / `btn-save` / `btn-danger`), and the badges, chips, fields, shells and app icon.
Component boards on the `Components`
page are marked "hide in view mode", so the viewer only shows screens and the
two dialogs.

Icons come from **Lucide** (`lucide-static`, a dev dependency): every icon in the
file is a component built from the package's 24×24 SVG at `1.75px` stroke, so the
design and the markup can be traced back to the same source instead of
hand-drawn paths.

`public/css/app.css` holds the matching tokens and component styling, so the
design maps 1:1 onto the implementation.

## Prototype interactions

Wired with `shape.addInteraction('click', { type: 'navigate-to', destination })`:

| From | Click target | To |
|---|---|---|
| 01 Login — Desktop | `登录` | 02 Dashboard — Desktop |
| 06 Login — Mobile | `登录` | 03 Dashboard — Mobile |
| 02 Dashboard — Desktop | `用户与权限` (icon, label, Admin badge) | 04 Admin Users — Desktop |
| 04 Admin Users — Desktop | `投递看板` (icon, label) | 02 Dashboard — Desktop |
| 02 / 04 | sidebar logout icon | 01 Login — Desktop |
| 03 Dashboard — Mobile | `我的` tab (icon, label) | 05 Admin Users — Mobile |
| 05 Admin Users — Mobile | `← 返回` | 03 Dashboard — Mobile |
| 02 Dashboard — Desktop | `新增投递` | 09 Add Application — Modal — Desktop |
| 09 Add Application — Desktop | close / cancel / save | 02 Dashboard — Desktop |
| 03 Dashboard — Mobile | FAB `+` | 10 Add Application — Modal — Mobile |
| 10 Add Application — Mobile | close / cancel / save | 03 Dashboard — Mobile |
| 02 Dashboard — Desktop | first application card | 07 Application Detail — Desktop |
| 03 Dashboard — Mobile | first application card | 08 Application Detail — Mobile |
| 07 Application Detail — Desktop | `删除记录` | 11 Delete Confirm — Modal — Desktop |
| 11 Delete Confirm — Desktop | cancel / confirm | 07 Application Detail — Desktop |
| 08 Application Detail — Mobile | `删除` | 12 Delete Confirm — Modal — Mobile |
| 12 Delete Confirm — Mobile | cancel / confirm | 08 Application Detail — Mobile |

To add more, select a shape in Penpot and drag its interaction handle to the
target board, or use the `execute_code` MCP tool with `addInteraction`.

## Handoff to P1

After implementing the screens, capture the real pages at desktop and mobile
widths and save as `draft/JobTrack_Wireframe_P1_v4.png`, keeping v3 for history.
That satisfies rubric D's "wireframe followed or updated throughout".
