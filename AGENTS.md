# Project Agents

## Available Agent / Skill Metadata

This project can use agent metadata to describe focused coding assistants for specific parts of the codebase. Agents should respect the existing project structure, naming conventions, Vue Composition API style, Bootstrap-based UI patterns, and current SORA/ThinkHub visual language.

Related metadata files:

- `.agent.md` defines the Vue UI Polish Agent manifest.
- `.instructions.md` defines behavior rules for the agent.
- `.prompt.md` provides reusable prompt templates.
- `TECHNOLOGY_AND_STYLE.md` documents project technologies, admin/user structure, colors, and CSS conventions.
- `.agents/skills/vue-ui-polish/SKILL.md` defines the Vue UI polish skill.

## Vue UI Polish Agent

- **Agent name:** Vue UI Polish Agent
- **Purpose:** Improve frontend UI quality while preserving the existing project style.
- **Target folder:** `frontend/src`
- **Focus areas:** Vue components, modal behavior, mini cart UI, responsive layout, spacing, visual polish, and CSS refinements.

This agent is intended for frontend-facing polish work only. It should improve usability, responsiveness, component presentation, modal interactions, mini cart behavior, and CSS consistency without changing backend APIs, database schema, business logic, or unrelated application behavior.

When working in this project, the agent should prefer existing UI patterns, reusable components, Bootstrap utilities, and established SORA/ThinkHub styling before introducing new abstractions or visual systems.
