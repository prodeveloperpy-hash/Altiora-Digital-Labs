# Frontend folder structure

This document explains the main directories in the React, TypeScript, and Vite
frontend. Generated folders such as `node_modules/` and `dist/` are omitted.

```text
frontend/
├── docs/                     Project documentation
│   ├── FOLDER_STRUCTURE.md   This folder reference
│   └── LOCAL_DEVELOPMENT.md  Local setup and commands
├── public/                   Static files copied directly into the build
├── src/                      Frontend application source
│   ├── app/                  Router, providers, and application bootstrap
│   ├── components/           Shared UI, layout, and feedback components
│   ├── config/               Environment, route, and constant configuration
│   ├── context/              Cross-application React contexts
│   ├── features/             Feature-based domain modules
│   ├── hooks/                Reusable React hooks
│   ├── lib/                  API client, utilities, and shared helpers
│   ├── pages/                Route-level page components
│   ├── styles/               Global styles and design tokens
│   └── types/                Shared TypeScript types
├── uploads/                  Local uploaded/static assets
├── .env.example              Safe environment-variable template
├── index.html                Vite HTML entry point
├── package.json              Dependencies and npm scripts
├── tailwind.config.ts        Tailwind CSS configuration
├── tsconfig.json             TypeScript project configuration
├── vite.config.ts            Vite server, proxy, and build configuration
└── README.md                 Frontend overview and API contract
```

## Organization rules

- Put business-specific code in the matching `src/features/<feature>/` module.
- Put reusable presentational elements in `src/components/`.
- Put route-level screens in `src/pages/` and route configuration in `src/app/`.
- Put shared API and utility code in `src/lib/`.
- Put public, unprocessed assets in `public/`; imported assets may live near the
  component or feature that owns them.
- Keep secrets out of `.env.example` and source control.

See [Local development](LOCAL_DEVELOPMENT.md) for installation and run commands.
