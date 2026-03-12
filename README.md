# Introduction

This repository contains a set of web components used in KireiBPM UIs.

# Content

The `components` folder contents the latest web components, using the lit-element library and written in TypeScript.

The `legacy-elements` folder contains the initial web components, using no additional library and written in JavaScript.
It contains the web components used by the UI Designer Switch feature.

# npm

Temporary npm TLS workaround files are committed in the repository for environments with a corporate proxy or self-signed root CA.

The preferred secure setup is documented in [docs/npm-publishing.md](docs/npm-publishing.md) and can be applied with:

```bash
./components/infrastructure/configure-npm-ca.sh --cafile=/absolute/path/to/company-root-ca.pem
```

The same document also describes the release workflow and the publish order for:

- `@kireibpm/search-box`
- `@kireibpm/pagination-selector`
- `@kireibpm/query-selector`

# License

This repository is distributed as Open Source software under the GNU General Public License, version 2 or any later version. See the root [LICENSE](LICENSE) file for details.