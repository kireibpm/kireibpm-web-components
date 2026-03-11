import { css, customElement, html, LitElement, property, PropertyValues } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import '@kireibpm/search-box';
import '@kireibpm/pagination-selector';
// @ts-ignore
import bootstrapStyles from './style.scss';
import { registerTranslateConfig, translate, use } from 'lit-translate';
import * as i18n_en from './i18n/en.json';
import * as i18n_es from './i18n/es-ES.json';
import * as i18n_fr from './i18n/fr.json';
import * as i18n_ja from './i18n/ja.json';
import * as i18n_pt from './i18n/pt-BR.json';

registerTranslateConfig({
  loader: (lang: string) => Promise.resolve(QuerySelector.getCatalog(lang)),
});

interface QueryFilter {
  name: string;
  type: string;
  value?: string;
}

interface QueryDefinition {
  displayName?: string;
  name?: string;
  query?: string;
  filters?: QueryFilter[];
}

interface QueryCollection {
  defaultQuery: QueryDefinition[];
  additionalQuery: QueryDefinition[];
}

interface QueryInit {
  query?: { name?: string };
  filters?: QueryFilter[];
  pagination?: { c?: string; p?: string };
}

interface PaginationElement {
  pageIndex: string;
  nbElements: string;
}

@customElement('query-selector')
export class QuerySelector extends LitElement {
  @property({ attribute: 'lang', type: String, reflect: true })
  lang = 'en';

  @property({ attribute: 'queries', type: Object, reflect: true })
  private queries: QueryCollection = { defaultQuery: [], additionalQuery: [] };

  @property({ attribute: 'init', type: Object, reflect: true })
  private init: QueryInit | null = null;

  @property({ type: String })
  private selectedQuery = '';

  @property({ type: Array })
  private filterArgs: QueryFilter[] = [];

  @property({ type: String })
  private queryFilter = '';

  @property({ attribute: false })
  private paginationElement: PaginationElement = { pageIndex: '0', nbElements: '10' };

  connectedCallback() {
    super.connectedCallback();
    this.loadLanguage();
    this.syncStateFromInput();
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('lang')) {
      this.loadLanguage();
    }
    if (changedProperties.has('queries') || changedProperties.has('init')) {
      this.syncStateFromInput();
    }
  }

  static getCatalog(lang: string) {
    switch (lang) {
      case 'es':
      case 'es-ES':
        return i18n_es;
      case 'fr':
        return i18n_fr;
      case 'ja':
        return i18n_ja;
      case 'pt':
      case 'pt-BR':
        return i18n_pt;
      default:
        return i18n_en;
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: sans-serif;
        font-size: 14px;
        text-align: left;
      }

      .filter-container {
        display: flex;
        flex-wrap: wrap;
      }

      .filter-item {
        padding: 5px;
        flex-grow: 1;
        max-width: 50%;
      }

      .list-group-item.active {
        background-color: grey;
        border-color: lightgrey;
      }

      .scroll {
        max-height: 15em;
        overflow-y: auto;
      }

      .filter-input {
        font-size: 14px;
      }

      .filter-item.required .control-label:after {
        content: '*';
        color: red;
      }

      .tip {
        padding-left: 10px;
      }

      .guide {
        color: grey;
        text-align: center;
        font-style: italic;
      }

      search-box {
        --max-width: 100%;
      }

      .card-deck {
        margin-bottom: 15px;
      }
    `;
  }

  render() {
    const normalizedQueries = this.normalizeQueries(this.queries);

    return html`
      <style>${bootstrapStyles}</style>
      <div class="guide">${translate('help')}</div>
      <search-box lang=${this.lang} id="searchbox" @valueChange=${this.handleSearchChange}></search-box>
      <div class="card-deck">
        ${this.renderQueryCard('defaultQueries', 'defaultQueriesTitle', normalizedQueries.defaultQuery, true)}
        ${this.renderQueryCard('additionalQueries', 'additionalQueriesTitle', normalizedQueries.additionalQuery, false)}
      </div>

      ${this.filterArgs.length > 0
        ? html`
            <div id="filter" class="card">
              <div class="card-header">
                <b>${translate('filterTitlePrefix')} </b>
                <b>${this.selectedQuery} </b>
              </div>
              <div class="filter-container">${this.filterArgs.map((filter) => this.renderFilterField(filter))}</div>
            </div>
          `
        : html``}

      <pagination-selector
        lang=${this.lang}
        nb-elements=${this.paginationElement.nbElements}
        page-index=${this.paginationElement.pageIndex}
        @paginationChanged=${this.handlePaginationChange}
      ></pagination-selector>
      <br />
      <div class="tip">
        <p>💡 ${translate('tip1')}</p>
        <p>💡 ${translate('tip2')}</p>
      </div>
    `;
  }

  private renderQueryCard(
    id: string,
    titleKey: string,
    queryList: QueryDefinition[],
    useDisplayName: boolean,
  ) {
    return html`
      <div id=${id} class="card">
        <div class="card-header">
          <b>${translate(titleKey)}</b>
        </div>
        <ul class="list-group scroll" id="queries">
          ${queryList.filter((query) => this.matchesSearch(query)).map((query) => this.renderQueryItem(query, useDisplayName))}
        </ul>
      </div>
    `;
  }

  private renderQueryItem(query: QueryDefinition, useDisplayName: boolean) {
    const queryName = this.getQueryName(query);
    const label = useDisplayName ? query.displayName || queryName : query.query || queryName;

    return html`
      <li
        class="list-group-item list-group-item-action ${classMap({ active: this.selectedQuery === queryName })}"
        @click=${() => this.selectQuery(query)}
      >
        ${label}
      </li>
    `;
  }

  private renderFilterField(filter: QueryFilter) {
    return html`
      <div class="filter-item required">
        <label class="control-label" for=${filter.name}>${filter.name}</label>
        <div class="input-group filter-input">
          <input
            id=${filter.name}
            type="text"
            class="form-control filter-input"
            .value=${filter.value || ''}
            placeholder=${QuerySelector.getFilterPlaceholder(filter.type)}
            @input=${(event: Event) => this.updateFilterValue(filter.name, (event.target as HTMLInputElement).value)}
          />
          <div class="input-group-append">
            <span class="input-group-text filter-input">¶</span>
          </div>
        </div>
      </div>
    `;
  }

  private normalizeQueries(value: QueryCollection | null | undefined): QueryCollection {
    return {
      defaultQuery: Array.isArray(value?.defaultQuery) ? value!.defaultQuery : [],
      additionalQuery: Array.isArray(value?.additionalQuery) ? value!.additionalQuery : [],
    };
  }

  private syncStateFromInput() {
    const normalizedQueries = this.normalizeQueries(this.queries);
    this.queries = normalizedQueries;

    const init = this.init;
    const selectedQuery = init?.query?.name || '';
    const selectedDefinition = this.findQueryDefinition(selectedQuery, normalizedQueries);

    this.selectedQuery = selectedQuery;
    this.filterArgs = this.mergeFilters(selectedDefinition?.filters || [], init?.filters || []);
    this.paginationElement = {
      nbElements: init?.pagination?.c || '10',
      pageIndex: init?.pagination?.p || '0',
    };
  }

  private findQueryDefinition(queryName: string, queries: QueryCollection = this.queries) {
    return [...queries.defaultQuery, ...queries.additionalQuery].find((query) => this.getQueryName(query) === queryName);
  }

  private mergeFilters(sourceFilters: QueryFilter[], initFilters: QueryFilter[]) {
    return sourceFilters.map((filter) => {
      const initialValue = initFilters.find((candidate) => candidate.name === filter.name);
      return {
        ...filter,
        value: initialValue?.value || '',
      };
    });
  }

  private getQueryName(query: QueryDefinition) {
    return query.query || query.name || '';
  }

  private matchesSearch(query: QueryDefinition) {
    const searchValue = this.queryFilter.trim().toLowerCase();
    if (!searchValue) {
      return true;
    }

    return (query.displayName || '').toLowerCase().includes(searchValue);
  }

  private async loadLanguage() {
    await use(this.lang);
  }

  private handleSearchChange = (event: CustomEvent<string>) => {
    this.queryFilter = (event.detail || '').toLowerCase();
  };

  private selectQuery(query: QueryDefinition) {
    this.selectedQuery = this.getQueryName(query);
    this.filterArgs = this.mergeFilters(query.filters || [], []);
    this.emitQueryChanged();
  }

  private updateFilterValue(filterName: string, value: string) {
    this.filterArgs = this.filterArgs.map((filter) =>
      filter.name === filterName
        ? {
            ...filter,
            value,
          }
        : filter,
    );
    this.emitQueryChanged();
  }

  private handlePaginationChange = (event: CustomEvent<PaginationElement>) => {
    this.paginationElement = {
      nbElements: event.detail.nbElements,
      pageIndex: event.detail.pageIndex,
    };
    this.emitQueryChanged();
  };

  private static getFilterPlaceholder(type: string) {
    return `Type a ${QuerySelector.capitalizeFirstLetter((type || 'value').toLowerCase())}`;
  }

  private static capitalizeFirstLetter(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private emitQueryChanged() {
    const validity = Boolean(this.selectedQuery)
      && this.filterArgs.every((filter) => Boolean(filter.value))
      && Boolean(this.paginationElement.nbElements)
      && Boolean(this.paginationElement.pageIndex);

    this.dispatchEvent(
      new CustomEvent('queryChanged', {
        detail: {
          validity,
          query: this.selectedQuery,
          filters: this.filterArgs,
          pagination: this.paginationElement,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

