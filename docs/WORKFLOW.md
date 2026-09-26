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

This is how waitlist was actually built.

1. `/prd waitlist` → `docs/prd/waitlist.md` v1 draft, with six open
   questions. The QA lead answered them, giving v2 `approved`. One answer
   (the API refuses ios) changed a cross-cutting contract, so
   `docs/prd/feature-flags.md` went to v2 (`X-Platform`) in the same
   commit.
2. `/design waitlist` → `docs/design/waitlist.md` plus 14 rows in
   `docs/design/testids.md`, with `platforms` = `web, wap, android`. On
   ios, no waitlist identifier exists (AC-10, AC-11).
3. `/techspec waitlist` → `docs/tech/waitlist.md`: the join rule order,
   promotion on cancel (skipping users at the limit), `require_flag`
   placed after authentication, and the seed guests in
   `fixtures/waitlist.json`.
4. Implementation:
   - backend-dev: the endpoints and promotion, then
     `python api/export_openapi.py`.
   - web-dev: the join button on class detail, and the waitlist table
     (web) or list (wap).
   - mobile-dev: the same UI, gated by `flags.waitlist`, so ios renders
     none of it.
   - One commit per role.
5. In the framework:
   - One test marked for `web, wap, android` joins `anchor-full` and
     asserts "You're #3 on the waitlist".
   - On ios it is auto-skipped with the reason "Waitlist not supported on
     ios (PRD waitlist v2)".
   - An API test sends `X-Platform: ios` and asserts
     `403 FEATURE_UNAVAILABLE`.
   - The parity matrix artifact shows `no`.

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
