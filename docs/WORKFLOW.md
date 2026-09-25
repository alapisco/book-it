# Development workflow

Every feature goes through four stages. Stages 1–3 happen in this repo
with Claude Code. Stage 4 happens in the external test automation
framework, and it is the reason this repo exists.

| Stage | Tool | Writes | Review gate |
|---|---|---|---|
| 1 Specify | `/prd <feature>` (`.claude/commands/prd.md`) | `docs/prd/<feature>.md` | You edit, resolve open questions, commit |
| 2 Design | `/design <feature>` (`.claude/commands/design.md`) | `docs/design/<feature>.md`, `docs/design/testids.md` | You edit, commit |
| 3 Implement | subagents `backend-dev`, `web-dev`, `mobile-dev` (`.claude/agents/`) | `api/` + `docs/api/openapi.json` (generated on first backend run), `web/`, `app/` | You review the diff, commit |
| 4 Verify | external framework | tests in the framework repo | Parity matrix artifact |

## The per-feature loop

1. **Specify.** Run `/prd <feature>` in Claude Code. Read the output.
   Answer every **Open questions** item by editing the file, set
   `Status: approved`, then
   `git add docs/prd/<feature>.md && git commit -m "prd: <feature> v1"`.
2. **Design.** Run `/design <feature>`. It refuses to run without the PRD.
   Check the four states per component, the web-vs-wap trees, and the new
   rows in `docs/design/testids.md`. Identifiers enter the registry **here,
   before any code exists**. Then
   `git add docs/design && git commit -m "design: <feature> v1"`.
3. **Implement.** Backend first, because the clients consume the
   generated contract:
   - Delegation is **automatic**: the main session picks a subagent by
     matching your request against each agent's `description`.
   - To **target a role explicitly**, name it: "Use the backend-dev agent
     to implement docs/prd/<feature>.md", or @-mention it
     (`@agent-backend-dev`). `/agents` lists them. To run a whole session
     as one role: `claude --agent web-dev`.
   - Order: `backend-dev` (regenerates `docs/api/openapi.json`), then
     `web-dev` and `mobile-dev`, which can run in parallel.
   - Review the diff, run `python3 scripts/check_testids.py --all`, and
     commit. `.githooks/pre-commit` runs the same check on staged lines.
4. **Verify (outside this repo).** You write tests in the automation
   framework against the running SUT (`docker compose up`, plus the
   simulator and emulator). They declare platform support from the PRD's
   table, use the identifiers from `docs/design/testids.md`, and use
   `/test/reset`, `X-Test-Session` and the clock for deterministic state.
   A failure here goes back to stage 1, 2 or 3, whichever is wrong.

## Worked example: `waitlist` (web, wap, android — not ios)

1. `/prd waitlist` produced `docs/prd/waitlist.md` (v1 draft, already in
   the repo). Resolve its six open questions, set `Status: approved`, commit.
2. `/design waitlist` (not yet run) → will write `docs/design/waitlist.md`
   and append identifiers (illustratively `class.waitlist.join`,
   `bookings.waitlist.item`; the command chooses the real ones) to
   `docs/design/testids.md` with `platforms` = `web, wap, android`. Check
   that ios renders **no** waitlist identifier (AC-9, AC-10), and that
   the full-class indicator is registered for all four platforms. Commit.
3. "Use the backend-dev agent to implement docs/prd/waitlist.md". It adds
   the endpoints, promotion on cancel and seed entries, and regenerates
   `docs/api/openapi.json`. Then "Use the web-dev agent…" (modal vs
   bottom sheet for join) and "Use the mobile-dev agent…" (hides the
   control with `Platform.OS === 'ios'` or the `waitlist` flag). Commit.
4. In the framework: a single test marked for `web, wap, android` joins
   the waitlist on the full anchor class and asserts the position. On ios
   it is auto-skipped with the reason "Waitlist not supported on ios (PRD
   waitlist v1)", and the parity matrix artifact shows `no`.

## Adding a new element — checklist

1. [ ] Add the row to `docs/design/testids.md`, via `/design <feature>`
       or by editing the feature's design spec and the registry together.
2. [ ] Commit the registry change (or stage it with the code).
3. [ ] Write the code with the **literal** string in `data-testid` /
       `testID`, identical on every platform that renders it.
4. [ ] Run `python3 scripts/check_testids.py --all` and get exit 0.
       The write hook (`.claude/hooks/check-testids.sh`) will already
       have blocked any unregistered ID Claude tried to write.

## When the loop breaks

- **Validator rejects an identifier.** The message names the file, the
  line and the reason: not registered, bad format, or not a literal. If
  the element is new, go back to stage 2 and register it. If it's a typo,
  fix the code. Never edit the validator or skip the hook to get past it.
- **Delegation picks the wrong role.** Stop it (Esc) and re-ask, naming
  the agent explicitly (`@agent-web-dev`). A role that tries to write
  outside its directory is blocked by `.claude/hooks/enforce_ownership.py`
  (frontmatter hooks, active once the folder is trusted) and by its prompt.
  If a role says "change needed in X", hand that change to X's owner.
- **PRD and design spec disagree.** The PRD wins on behaviour and platform
  support; the design wins on UI and identifiers. Fix the wrong document,
  bump its `Version`, and re-run `/design <feature>` if the PRD changed.
  Implementation waits until both agree.
- **Spec is silent.** Roles are told to stop and ask. Answer by editing
  the PRD or design, not by giving an answer only in chat.

## Deliberately not automated

- **Review between stages.** The PRD and design are the test oracle for
  stage 4. A human signs off on them, because a generated spec that nobody
  reviewed would make the tests check whatever the AI assumed.
- **Stage chaining.** `/prd` does not trigger `/design`, and neither
  triggers implementation. Each commit is a checkpoint you can revert.
- **Commits.** You commit; roles don't. The commit is where you accept the
  work.
- **Tests in this repo.** None. The SUT is tested only from the outside,
  so the framework's view is the only one that counts.
- **Parity decisions.** The matrix in `CLAUDE.md` is fixed by hand. No
  role may add a platform or a feature to it.
