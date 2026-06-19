<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git Commits & Push Rule
- Do NOT run `git commit` or `git push` commands. The user prefers to commit and push changes manually. Only modify the necessary code files and list them for the user to commit.

# Component Modularization Rule
- Split large files/pages (e.g., more than 500 lines or files containing multiple complex sections/tabs like dashboard forms and tables) into modular sub-components inside the `components/` folder. Avoid writing large chunks of inline JSX for multiple tabs inside a single page component to keep the codebase clean, readable, and maintainable.


