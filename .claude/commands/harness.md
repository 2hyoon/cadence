This project uses the Harness framework. Proceed according to the workflow below.

---

## Workflow

### A. Exploration

Read the documents under `/docs/` (PRD, ARCHITECTURE, ADR, etc.) and understand the project's planning, architecture, and design intent. Use Explore agents in parallel when needed.

### B. Discussion

If there is anything that needs to be fleshed out or decided technically before implementation, present it to the user and discuss.

### C. Step Design

When the user instructs you to write an implementation plan, draft it as multiple steps and request feedback.

Design principles:

1. **Minimize scope** — Each step handles only one layer or module. If multiple modules must be modified at once, split the step.
2. **Self-contained** — Each step file runs in an independent Claude session. External references like "as discussed in the previous conversation" are forbidden. Write all the information you need inside the file.
3. **Force preparation** — Specify the paths of related documents and of files created/modified in previous steps. Guide the session to read the code and grasp the context before working.
4. **Signature-level instructions** — Present only the interface of functions/classes and leave the internal implementation to the agent's discretion. However, you must explicitly state core rules that must not deviate from the design intent (idempotency, security, data integrity, etc.).
5. **AC as executable commands** — Include actual runnable verification commands like `npm run build && npm test`, not abstract descriptions like "X should work".
6. **Be specific with cautions** — Instead of "be careful", write in the form "Don't do X. Reason: Y".
7. **Naming** — A step name is a kebab-case slug expressing that step's core module/task in one or two words (e.g. `project-setup`, `api-layer`, `auth-flow`).

### D. File Creation

Once the user approves, create the following files.

#### D-1. `phases/index.json` (overall status)

A top-level index managing multiple tasks. If it already exists, add a new entry to the `phases` array.

```json
{
  "phases": [
    {
      "dir": "0-mvp",
      "status": "pending"
    }
  ]
}
```

- `dir`: task directory name.
- `status`: `"pending"` | `"completed"` | `"error"` | `"blocked"`. execute.py updates this automatically during execution.
- Timestamps (`completed_at`, `failed_at`, `blocked_at`) are recorded automatically by execute.py on status changes. Do not include them at creation time.

#### D-2. `phases/{task-name}/index.json` (task details)

```json
{
  "project": "<project name>",
  "phase": "<task-name>",
  "steps": [
    { "step": 0, "name": "project-setup", "status": "pending" },
    { "step": 1, "name": "core-types", "status": "pending" },
    { "step": 2, "name": "api-layer", "status": "pending" }
  ]
}
```

Field rules:

- `project`: project name (see CLAUDE.md).
- `phase`: task name. Keep it consistent with the directory name.
- `steps[].step`: sequence number starting from 0.
- `steps[].name`: kebab-case slug.
- `steps[].status`: initial value is `"pending"` for all.

State transitions and auto-recorded fields:

| Transition | Recorded fields | Recorded by |
|------|-------------|----------|
| → `completed` | `completed_at`, `summary` | Claude session (summary), execute.py (timestamp) |
| → `error` | `failed_at`, `error_message` | Claude session (message), execute.py (timestamp) |
| → `blocked` | `blocked_at`, `blocked_reason` | Claude session (reason), execute.py (timestamp) |

`summary` is a one-line summary of the step's deliverables on completion; execute.py accumulates and passes it as context into the next step's prompt. Therefore it should contain information useful for the next step (created files, key decisions, etc.).

`created_at` is recorded once at the task level by execute.py on the first run. The step-level `started_at` is also recorded automatically by execute.py at the start of each step. Do not include them at creation time.

#### D-3. `phases/{task-name}/step{N}.md` (one per step)

```markdown
# Step {N}: {Name}

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- {paths of files created/modified in previous steps}

Read the code produced in previous steps carefully, understand the design intent, and then work.

## Task

{Specific implementation instructions. Include file paths, class/function signatures, and logic descriptions.
Present code snippets only at the interface/signature level, and leave the implementation to the agent.
However, clearly nail down core rules that must not deviate from the design intent.}

## Acceptance Criteria

```bash
npm run build   # No compile errors
npm test        # Tests pass
```

## Verification Procedure

1. Run the AC commands above.
2. Check the architecture checklist:
   - Does it follow the directory structure in ARCHITECTURE.md?
   - Did it stay within the tech stack in the ADR?
   - Did it avoid violating the CRITICAL rules in CLAUDE.md?
3. Update the corresponding step in `phases/{task-name}/index.json` based on the result:
   - Success → `"status": "completed"`, `"summary": "one-line summary of deliverables"`
   - Still failing after 3 fix attempts → `"status": "error"`, `"error_message": "specific error details"`
   - User intervention needed (API keys, external auth, manual setup, etc.) → `"status": "blocked"`, `"blocked_reason": "specific reason"`, then stop immediately

## Prohibitions

- {Things not to do in this step. Use the form "Don't do X. Reason: Y"}
- Don't break existing tests
```

### E. Execution

```bash
python3 scripts/execute.py {task-name}        # Sequential execution
python3 scripts/execute.py {task-name} --push  # Push after execution
```

What execute.py handles automatically:

- Create/checkout the `feat-{task-name}` branch
- Guardrail injection — include the contents of CLAUDE.md + docs/*.md in every step prompt
- Context accumulation — pass completed steps' summaries into the next step's prompt
- Self-correction — retry up to 3 times on failure, feeding the previous error message back into the prompt
- Two-stage commit — commit code changes (`feat`) and metadata (`chore`) separately
- Timestamps — auto-record started_at, completed_at, failed_at, blocked_at

Error recovery:

- **On error**: in `phases/{task-name}/index.json`, change the step's `status` to `"pending"`, delete `error_message`, and rerun.
- **On blocked**: resolve the reason noted in `blocked_reason`, then change `status` to `"pending"`, delete `blocked_reason`, and rerun.
