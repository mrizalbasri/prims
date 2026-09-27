# PRISM Core Quality Repair Design

## Scope

This repair pass focuses on the existing core-quality findings in the PRISM
repository. It does not add product features, change the assessment domain
model, or redesign the application. The target is a consistent, validated
development and build workflow.

Included:

- pnpm and Dockerfile consistency;
- patched versions of vulnerable dependencies;
- explicit AI Engine secret configuration;
- ESLint and React logic errors that currently block quality checks;
- runnable Python AI Engine tests;
- exclusion of generated/worktree files from frontend tests;
- setup documentation aligned with the actual toolchain.

Excluded:

- production hosting architecture;
- distributed rate limiting;
- replacing local audio storage;
- unrelated feature refactors;
- changes to scoring rules or user-facing assessment behavior.

## Design

### Package manager and container

pnpm is the repository package manager and `pnpm-lock.yaml` is the source of
truth. The root Dockerfile will enable Corepack, copy the pnpm manifest and
lockfile, and install with `pnpm install --frozen-lockfile`. The existing
standalone Next.js build remains unchanged unless validation exposes a
compatibility issue.

### Dependency security

Next.js will be upgraded to a patched compatible version, with the lockfile
updated through pnpm. The dependency graph will be revalidated with the
existing audit command. No unrelated major upgrades will be introduced.

### Secret configuration

The AI Engine will no longer use a publicly known default internal key. The
configuration will require `INTERNAL_API_KEY` in non-development environments
and will reject the known placeholder value. `.env.example` files will contain
explicit dummy placeholders only. The Next.js client and FastAPI service must
receive the same configured secret through their respective environments.

### TypeScript and React quality

Lint fixes will preserve behavior and use existing types where possible.
`ReadAlongPlayer` will be reorganized so callbacks are declared before use or
stabilized with appropriate hooks, while cleanup remains safe on unmount.
Synchronous state updates inside effects will be replaced with initializers,
event-driven updates, or external-subscription patterns where appropriate.
Unnecessary `any` casts and unused imports will be removed without weakening
the lint configuration.

### Python test isolation

The AI Engine test suite will not fail during module collection solely because
an optional Piper runtime/model is unavailable. Runtime-dependent behavior will
be isolated behind a testable boundary and mocked or explicitly skipped when
the required model asset is absent. The supported local test runtime will match
the Python version used by the AI Engine Dockerfile.

### Frontend test discovery

Vitest will include repository tests under `tests/` and exclude generated
output, dependencies, coverage output, and `.kilo/worktrees`. Test results must
not count duplicated worktree copies.

### Documentation

README and setup instructions will use pnpm commands and describe the actual
Node/Python prerequisites, required environment variables, AI Engine startup,
and validation commands. Documentation will not contain usable secrets.

## Validation

The repair is complete only when these checks pass, subject to the local
availability of Docker and the documented Python runtime:

```text
pnpm install --frozen-lockfile
pnpm prisma validate
pnpm lint
pnpm test
pnpm exec tsc --noEmit
pnpm build
python -m pytest -q
docker build -t prism .
```

Any command that cannot run because a tool or runtime is unavailable will be
reported explicitly rather than replaced with a weaker proxy.

## Change boundaries

Changes should remain limited to the root Docker/configuration files,
dependency manifests and lockfile, affected lint-blocking source files,
AI Engine configuration/test boundaries, test configuration, and directly
related setup documentation. No commits or pushes are performed by the
assistant; the user will review and commit the resulting branch manually.
