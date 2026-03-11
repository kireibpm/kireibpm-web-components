# `query-selector`

![npmVersion](https://img.shields.io/npm/v/@kireibpm/query-selector?color=blue&style=plastic)

Query selector web component. Display, filter, select queries. Provide values if arguments are required.
Depends on `@kireibpm/search-box` and `@kireibpm/pagination-selector` web components.

## Events
Generates a `queryChanged` event at each change in the query selector.

## Attributes
- `queries`     (default: empty)
- `lang`        (default: en)

## Usage
Run:

    npm install @kireibpm/query-selector

Then import `node_modules/@kireibpm/query-selector/lib/query-selector.es5.min.js`

And you can use new html tag, for example:
 
 `<query-selector lang="fr" queries='{"defaultQuery": [{"displayName": "name", "query": "findByName", "filters": [{"name": "name", "type": "String"}]}], "additionalQuery": [{"displayName": "find", "query": "find", "filters": []}]}'></query-selector>`


