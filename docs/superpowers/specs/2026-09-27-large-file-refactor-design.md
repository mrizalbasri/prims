# Large File Refactor Design

## Goal

Improve maintainability of the largest student and admin modules without changing
routes, API contracts, database behavior, or user-facing behavior.

## Scope

The refactor covers:

- Student speaking, writing, and vocabulary pages.
- Large admin result, question form, and questions components.
- Small cleanup directly related to those files, such as unused imports,
  duplicated local helpers, and redundant state wiring.

The refactor does not cover:

- New product features.
- Database or Prisma schema changes.
- API response changes.
- Authentication or authorization changes.
- Visual redesign.
- Changes to the exam security behavior recently implemented.

## Architecture

Each page remains responsible for route-level coordination, authentication
guards, data loading, and navigation. Complex UI sections move into focused
components under the existing domain folders:

- `components/student/speaking/`
- `components/student/writing/`
- `components/student/vocabulary/`
- `components/admin/`

Stateful or reusable behavior moves into focused hooks where that makes the
component boundary clearer. Pure transformations and validation helpers remain
in domain-specific helpers or `lib/` when they are shared by multiple callers.

The existing public component contracts should be preserved unless a narrower
internal prop contract is required to isolate a section.

## Implementation Order

1. Extract student speaking sections and session logic.
2. Validate the speaking flow.
3. Extract student writing sections and submission logic.
4. Extract student vocabulary sections and review/session logic.
5. Validate both learning flows.
6. Extract admin result drawer sections.
7. Extract admin question form sections.
8. Extract admin questions table/filter sections.
9. Run the complete test, lint, build, and diff checks.

Each step should leave the application buildable and should be kept as a small
commit when the changes are eventually committed by the repository owner.

## Behavior and Error Handling

Existing loading, empty, error, and submission states must remain visible and
must not be replaced with silent fallbacks. Existing API errors should continue
to surface through the current UI notification patterns. Refactoring must not
move secrets or server-only logic into client components.

## Testing Decisions

Validation is required after every domain group:

- Existing Vitest suite.
- ESLint.
- Next.js production build.
- `git diff --check`.

Tests should assert externally observable behavior rather than component
implementation details. Existing tests in `tests/` are the prior art for
behavioral validation. New tests are only needed where an extraction exposes a
stable pure helper or protects a behavior that was previously untested.

## Success Criteria

- No targeted source file remains a monolithic page or component when its
  sections can be independently understood.
- Routes and API contracts are unchanged.
- The UI behaves the same for loading, success, empty, error, and submit flows.
- Test, lint, and production build validation pass after each phase.
- No unrelated files or generated artifacts are added to the feature branch.

## Related Notes

- [[codebase_analysis]]
- [[2026-09-23-core-quality-repair-design]]
