# npm TLS and Publishing

## TLS setup

The repository currently includes a temporary fallback `.npmrc` with `strict-ssl=false` so npm can work in environments where TLS is intercepted by a corporate proxy.

The preferred setup is to trust the company CA and re-enable TLS verification:

```bash
./components/infrastructure/configure-npm-ca.sh --cafile=/absolute/path/to/company-root-ca.pem
```

This updates the project-level npm configuration in:

- repository root
- `components/`
- `legacy-elements/`

You can target only one scope with `--scope=repo`, `--scope=components`, or `--scope=legacy-elements`.

## Required GitHub secrets

The release workflow expects:

- `NPM_TOKEN`: npm automation token with publish permission for the `@kireibpm` scope
- `KIREIBPM_CI_PAT`: GitHub PAT used to push the release commit and tag when `github.token` is not sufficient

## Release workflow

Use the `Release npm package` workflow and choose one component directory:

- `search-box`
- `pagination-selector`
- `query-selector`

Recommended first publication order:

1. `search-box`
2. `pagination-selector`
3. `query-selector`

`query-selector` references the other two packages in development, so publishing it last keeps the release path straightforward.

The workflow:

1. bumps the selected package version,
2. creates a release commit and tag,
3. pushes `master` and the tag,
4. optionally publishes the package to npm.

## Local validation

Before publishing a package manually, validate what will be shipped:

```bash
cd components/packages/misc/search-box
npm pack --dry-run
```