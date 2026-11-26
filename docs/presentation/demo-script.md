# Presentation — demo script (issues 21/29)

Target runtime: ~10 minutes demo + Q&A. Every member speaks (rubric J).
Run from **main** with the seeded database (`npm run dev` locally, or the
Render URL — wake it 2 minutes before). Browser window at 1440×900, DevTools
device toolbar pre-set to 390×844 for the phone part, and **Edge auto-dark
off** so the light theme renders as designed (toggle the in-app theme
instead: the sun/moon button).

Fallback: the exported boards in `draft/design/penpot/` are the screenshots
— if the live app fails, present the PNGs and narrate the same steps.

---

## Opening — problem → what's built (1 min, member 1)

- 问题：求职投递记录散落在备忘录和邮箱里，状态靠记忆。
- JobTrack：一张看板看清所有投递的进度；管理员可以看到全组数据并管理权限。
- 展示仓库：12+ 张设计板、5 张表的 ERD、8 条 squash 合并的 PR、22 个单元
  测试、13 个请求的 Postman collection——每一步都走 issue → branch → PR。

## Login + sessions (1.5 min, member 1)

1. 访问 `/` → 未登录被踢到 `/login`（守卫：requireAuth）。
2. 故意输错密码 → 红色「用户名或密码不正确」。
3. 点演示账号 chip **admin**，登录。
4. 顺带指出：登出是 POST 表单（防 prefetch 登出），密码是 scrypt + salt。

## CRUD — the core loop (2.5 min, member 2)

1. 看板：12 张卡片、筛选 chip 上的计数（GROUP BY 查询）、搜索、排序。
2. 新增投递：公司 find-or-create，职位/状态/日期/备注——保存。
3. 再提交一次同样的公司+职位 → 「你已经在跟踪这个职位了」（唯一约束）。
4. 编辑刚才的卡片：改状态为 Offer，保存 → 计数变化。
5. 删除：原生 `<dialog>` 确认 → fetch 删除，**卡片消失但页面不刷新**，
   chip 计数同步递减。

## Schema — ERD (2 min, member 2/3)

- 打开 `draft/JobTrack_ERD_P3.png`：companies 1—n jobs 1—n applications n—1 users。
- 一条广告只存一次：URL/薪资/截止存在 `jobs`，每个人的状态/备注在
  `applications`（m:n 连接表，`UNIQUE(user_id, job_id)`）。
- 状态由数据库 `CHECK` 约束，不只是 UI 下拉。
- JOIN 列表 + `GROUP BY status` 就是看板的两条核心查询。

## Grant — the rubric's F (2 min, member 3)

1. 侧栏「用户与权限」→ `/admin/users`。
2. 指出横幅：守卫检查的是**权限布尔**，角色只是默认模板。
3. 给 bob 打开「查看全部投递」→ 保存。
4. 登出，用 bob 登录 → 他立刻从空列表变成 12 张卡（全是 alice 的，带 owner 标签）
   ——**下一个请求即生效**，不用重新登录。
5. 直接输 `/admin/users` 的 URL 会怎样？bob 看到 403 弹窗。
6. 收尾：撤销 bob 的覆盖，恢复原状（或演示改角色 → 覆盖列清空回落模板）。

## Phone view (1.5 min, member 3)

1. DevTools 切 390×844：单列卡片、可横滑的 chip、底部 tab bar + 中央 FAB。
2. 详情页：底部操作条（编辑/删除），记录信息堆叠。
3. 管理页：横幅 + 堆叠用户卡 + 保存条。
4. 主题：点侧栏 sun/moon → 深色（Penpot 的 Dark 29 色 token）→ 刷新后仍记住。

## Closing (1 min, member 1)

- 已完成：#10–18、#22、#23、#25、#27 的全部 checklist；CI 绿（build + tests）。
- 回答预案：
  - **为什么不 JWT？** 课程讲 session + Passport；服务端会话让「权限下一个请求生效」免费拿到。
  - **谁能编辑别人的记录？** 没有人——读看权限，写永远 owner-only（连 admin 也不行）。
  - **测试测什么？** 纯函数（密码、校验、格式化、id、排序）——node:test，22 个用例，CI 跑。
  - **部署**：Render + Neon，push main → Actions build → deploy hook。

## Rehearsal notes (issue 29)

- 演示前 2 分钟：本地 `npm run seed`（重置演示数据），或先访问一次线上 URL 唤醒。
- 双彩排计时；每人讲自己 lane 的段落；Q&A 预案每人都能答。
- 手机真机连一次（issue 24 最后一条）：同一 Wi-Fi 访问本地 dev（`--host`）或线上 URL。
