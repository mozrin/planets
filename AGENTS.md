# Project conventions

## Styling

- Use Tailwind CSS 4 utility classes exclusively for all application styling.
- Do not write raw CSS rules, CSS modules, styled components, inline `style` props, or other authored stylesheet code.
- The only permitted stylesheet content is Tailwind CSS 4's required `@import "tailwindcss";` entry point.

## Node workspaces

- This repository is an npm workspace monorepo. Keep the root `package.json`, root `package-lock.json`, and root `node_modules` as the single dependency-resolution location.
- Do not create `server/node_modules` or `website/node_modules` directories.
