# Vue UI Polish Skill

## Purpose

Polish and fix the existing Vue frontend UI while preserving the current project style and behavior. Use this skill for focused UI improvements, not for large refactors, architecture changes, unnecessary rewrites, or replacing working implementations.

## Responsibilities

- Review and improve existing UI components, spacing, alignment, visual hierarchy, and layout consistency.
- Fix modal behavior, including open and close handling, overlay behavior, scrolling, responsive sizing, and unintended interaction issues.
- Improve the mini cart UI and behavior while preserving existing business logic.
- Improve responsive design for mobile, tablet, and desktop using the current styling approach.
- Adjust CSS carefully and only where needed.
- Preserve existing Vue component structure, state management patterns, naming conventions, utility classes, and styling conventions.
- Keep the frontend visually consistent across related components.

## Constraints

- Make minimal, targeted changes only.
- Inspect the existing implementation before editing.
- Do not perform large refactors unless explicitly requested.
- Do not rewrite full components when a small patch is sufficient.
- Do not remove, overwrite, or revert existing working code or user-made changes unless the change is directly required for the requested UI fix.
- Do not delete previously fixed behavior while solving a new issue.
- Do not modify unrelated files or unrelated functionality.
- Preserve current component APIs, props, events, routes, data flow, and business logic unless explicitly requested.
- Reuse existing components, helpers, CSS variables, utility classes, and project patterns before introducing new ones.
- Keep code clean, readable, and consistent with nearby files.
- Avoid duplicated CSS, duplicated logic, unnecessary wrappers, dead code, and commented-out code.
- Never add API keys, secrets, tokens, credentials, or sensitive configuration to frontend code.
- Never expose environment secrets through Vue components, JavaScript, CSS, templates, logs, or client-side configuration.

## Comment Rules

- Add comments only when they are genuinely needed to explain non-obvious behavior.
- Comments must be short, clear, and limited to one line.
- Use plain ASCII characters only in comments.
- Do not use emojis, decorative separators, unusual symbols, or verbose explanations in comments.

## Working Approach

1. Read the relevant Vue components, styles, and related logic before making changes.
2. Identify the smallest set of files required for the UI improvement.
3. Apply focused edits that preserve current behavior outside the requested scope.
4. Compare edited code with surrounding project patterns to keep naming, structure, and styling consistent.
5. Review the final diff and remove accidental, unrelated, duplicated, or unnecessary changes introduced during the task.
6. Confirm that existing user changes and previously fixed behavior have not been unintentionally removed.
7. Run the project's existing build command defined in the repository, such as the build script already present in `package.json`.
8. Report what was changed, what was intentionally preserved, and whether the build passed.

## Validation Steps

- Review the final diff for unrelated edits, duplicate CSS, dead code, and accidental behavior changes.
- Confirm changed components still preserve existing props, events, routes, state flow, and business logic.
- Check responsive behavior for mobile, tablet, and desktop when the task affects layout.
- Run the existing frontend build command from the appropriate project directory:

```bash
npm run build
```

## Success Criteria

- The requested UI issue is visibly improved or fixed.
- Existing Vue patterns and project conventions are preserved.
- The change is minimal, maintainable, and consistent with the rest of the frontend.
- No unrelated behavior is broken or removed.
- No secrets are added to frontend code.
- Comments, when needed, are short one-line ASCII comments only.
- The existing frontend build completes successfully, or any existing unrelated build failure is clearly reported.
