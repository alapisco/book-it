# Development workflow

Every feature goes through five stages. Stages 1–4 happen in this repo
with Claude Code. Stage 5 happens in the external test automation
framework, and it is the reason this repo exists. The milestone plan is in
[`ROADMAP.md`](ROADMAP.md).

| Stage | Tool | Writes | Review gate |
|---|---|---|---|
| 1 Specify | `/prd <feature>` (`.claude/commands/prd.md`) | `docs/prd/<feature>.md` | You edit, resolve open questions, commit |
| 2 Design | `/design <feature>` (`.claude/commands/design.md`) | `docs/design/<feature>.md`, `docs/design/testids.md` | You edit, commit |
| 3 Tech spec | `/techspec <feature>` (`.claude/commands/techspec.md`) | `docs/tech/<feature>.md` | You edit, commit |
| 4 Implement | subagents `backend-dev`, `web-dev`, `mobile-dev` (`.claude/agents/`) | `api/` + `docs/api/openapi.json`, `web/`, `app/` | You review the diff, commit |
| 5 Verify | external framework | tests in the framework repo | Parity matrix artifact |

Cross-cutting decisions are ADRs in `docs/adr/`. You accept them; Claude
drafts one only when you ask, and a role or command that needs one lists
it under Open questions. Features with no
UI (seed data, test support) skip stage 2.

**Tracking.** One GitHub issue per feature (`feature: <name>`) and one PR
per feature, containing that feature's stage commits, with messages
`prd:`, `design:`, `techspec:`, `feat(api):`, `feat(web):`, `feat(app):`.
Record user-visible changes in `CHANGELOG.md` and tag each milestone.

## The per-feature loop

1. **Specify.** Run `/prd <feature>`. Answer every **Open questions** item
   by editing the file, set `Status: approved`, then
   `git commit -m "prd: <feature> v1" docs/prd/<feature>.md`.
2. **Design.** Run `/design <feature>`. It refuses to run without the PRD.
   Check the four states per component, the web-vs-wap trees, and the new
   rows in `docs/design/testids.md`. Identifiers enter the registry **here,
   before any code exists**. Commit (`design: <feature> v1`).
3. **Tech spec.** Run `/techspec <feature>`. Check the endpoints, the
   error codes and the order of validation rules. The order of rules
   decides which error a test sees. Commit (`techspec: <feature> v1`).
4. **Implement.** Backend first, because the clients consume the
   generated contract:
   - Delegation is **automatic**: the main session picks a subagent by
     matching your request against each agent's `description`.
   - To **target a role explicitly**, name it ("Use the backend-dev agent
     to implement docs/tech/<feature>.md") or @-mention it
     (`@agent-backend-dev`). `/agents` lists them. To run a whole session
     as one role: `claude --agent web-dev`.
   - `backend-dev` runs `python api/export_openapi.py`. Then, in both
     `web/` and `app/`, `npm run gen:api` regenerates the TypeScript types
     from `docs/api/openapi.json`. `web-dev` and `mobile-dev` can run in
     parallel after that.
   - Review the diff, run `python3 scripts/check_testids.py --all`, and
     commit. `.githooks/pre-commit` runs the same check on staged lines.
5. **Verify (outside this repo).** You write tests in the automation
   framework against the running SUT (`docker compose up`, plus the
   simulator and emulator). They declare platform support from the PRD's
   table, use identifiers from `docs/design/testids.md`, and use
   `/test/reset`, `X-Test-Session`, the clock and the anchor classes from
   `docs/prd/test-support.md` and `docs/prd/domain-and-seed-data.md`.
   A failure here goes back to stage 1, 2, 3 or 4, whichever is wrong.

## Worked example: `waitlist` (web, wap, android — not ios)

1. `/prd waitlist` produced `docs/prd/waitlist.md` (v1 draft). Resolve its
   six open questions, set `Status: approved`, commit.
2. `/design waitlist` (not yet run) → will write `docs/design/waitlist.md`
   and add the waitlist identifiers to `docs/design/testids.md` with
   `platforms` = `web, wap, android`. Check that ios renders **no**
   waitlist identifier (AC-9, AC-10). Commit.
3. `/techspec waitlist` (not yet run) → will write `docs/tech/waitlist.md`:
   the endpoints, promotion on cancel, the `waitlist` flag in
   `fixtures/feature-flags.json`. Commit.
4. "Use the backend-dev agent to implement docs/tech/waitlist.md", then
   the web-dev agent (modal vs bottom sheet to join) and the mobile-dev
   agent (the control is hidden where the `waitlist` flag is false, i.e.
   on ios). Commit.
5. In the framework: one test marked for `web, wap, android` joins the
   waitlist on `anchor-full` and asserts the position. On ios it is
   auto-skipped with the reason "Waitlist not supported on ios (PRD
   waitlist v1)", and the parity matrix artifact shows `no`.

## Adding a new element — checklist

1. [ ] Add the row to `docs/design/testids.md`, via `/design <feature>`
       or by editing the feature's design spec and the registry together.
2. [ ] Commit the registry change (or stage it with the code).
3. [ ] Write the code with the **literal** string in `data-testid` /
       `testID` / `tabBarButtonTestID`, identical on every platform.
4. [ ] Run `python3 scripts/check_testids.py --all` and get exit 0.
       The write hook (`.claude/hooks/check-testids.sh`) will already
       have blocked any unregistered ID Claude tried to write.

## When the loop breaks

- **Validator rejects an identifier.** The message names the file, the
  line and the reason: not registered, bad format, or not a literal. If
  the element is new, go back to stage 2 and register it. If it's a typo,
  fix the code. Never edit the validator or skip the hook to get past it.
- **Delegation picks the wrong role.** Stop it (Esc) and re-ask, naming
  the agent (`@agent-web-dev`). A role writing outside its directory is
  blocked by `.claude/hooks/enforce_ownership.py` (frontmatter hooks,
  active once the folder is trusted) and by its prompt. If a role says
  "change needed in X", hand that change to X's owner.
- **PRD, design and tech spec disagree.** The PRD wins on behaviour and
  platforms, the design on UI and identifiers, the tech spec on contract.
  Fix the wrong document, bump its `Version`, and re-run the downstream
  commands. Implementation waits until all three agree.
- **Spec is silent.** Roles are told to stop and ask. Answer by editing
  the document, not by giving an answer only in chat.

## Deliberately not automated

- **Review between stages.** The documents are the test oracle for stage
  5. A human signs off on them, because a generated spec nobody reviewed
  would make the tests check whatever the AI assumed.
- **Stage chaining.** No command triggers the next stage. Each commit is
  a checkpoint you can revert.
- **ADRs.** Accepted by you. Architecture is not delegated to a role.
- **Tests in this repo.** None. The SUT is tested only from the outside.
- **Parity decisions.** The matrix in `CLAUDE.md` is fixed by hand. No
  role may add a platform or a feature to it.
