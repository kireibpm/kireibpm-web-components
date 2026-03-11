import { css, customElement, html, LitElement, property, PropertyValues } from 'lit-element';
// @ts-ignore
import bootstrapStyles from './style.scss';
import { registerTranslateConfig, translate, use } from 'lit-translate';
import * as i18n_en from './i18n/en.json';
import * as i18n_es from './i18n/es-ES.json';
import * as i18n_fr from './i18n/fr.json';
import * as i18n_ja from './i18n/ja.json';
import * as i18n_pt from './i18n/pt-BR.json';

registerTranslateConfig({
  loader: (lang: string) => Promise.resolve(PaginationSelector.getCatalog(lang)),
});

interface PaginationDetail {
  nbElements: string;
  pageIndex: string;
}

@customElement('pagination-selector')
export class PaginationSelector extends LitElement {
  @property({ attribute: 'lang', type: String, reflect: true })
  lang = 'en';

  @property({ attribute: 'nb-elements', type: String, reflect: true })
  private nbElements = '10';

  @property({ attribute: 'page-index', type: String, reflect: true })
  private pageIndex = '0';

  @property({ type: Boolean })
  private isCollapsed = true;

  connectedCallback() {
    super.connectedCallback();
    this.loadLanguage();
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('lang')) {
      this.loadLanguage();
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
        text-align: left;
        padding: 10px 0;
      }

      .pagination-container {
        display: flex;
        max-height: 100px;
        flex-wrap: wrap;
      }

      .pagination-item {
        padding: 5px;
        flex-grow: 1;
        max-width: 50%;
      }

      .pagination-input {
        font-size: 14px;
      }

      .pagination-item.required .control-label:after {
        content: '*';
        color: red;
      }

      .accordion-close {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.2s ease;
      }

      .accordion-open {
        max-height: 100px;
        overflow: hidden;
        transition: max-height 0.2s ease;
      }
    `;
  }

  render() {
    return html`
      <style>${bootstrapStyles}</style>
      <div class="card">
        <div class="card-header" @click=${this.toggleCollapse}>
          <b>${this.isCollapsed ? '►' : '▼'} ${translate('title')}</b>
        </div>
        <div class="pagination-container ${this.isCollapsed ? 'accordion-close' : 'accordion-open'}">
          ${this.renderInput('elem', 'nbelements', 'nbelementsPlaceholder', this.nbElements, this.handleNbElementsInput)}
          ${this.renderInput('page', 'pageindex', 'pageindexPlaceholder', this.pageIndex, this.handlePageIndexInput)}
        </div>
      </div>
    `;
  }

  private renderInput(
    inputId: string,
    labelKey: string,
    placeholderKey: string,
    value: string,
    handler: (event: Event) => void,
  ) {
    return html`
      <div class="pagination-item required">
        <label class="control-label" for=${inputId}>${translate(labelKey)}</label>
        <div class="input-group pagination-input">
          <input
            id=${inputId}
            type="text"
            class="form-control pagination-input"
            .value=${value}
            placeholder=${translate(placeholderKey)}
            @input=${handler}
          />
          <div class="input-group-append">
            <span class="input-group-text pagination-input">¶</span>
          </div>
        </div>
      </div>
    `;
  }

  private async loadLanguage() {
    await use(this.lang);
  }

  private toggleCollapse = () => {
    this.isCollapsed = !this.isCollapsed;
  };

  private handlePageIndexInput = (event: Event) => {
    this.pageIndex = (event.target as HTMLInputElement).value;
    this.emitPaginationChanged();
  };

  private handleNbElementsInput = (event: Event) => {
    this.nbElements = (event.target as HTMLInputElement).value;
    this.emitPaginationChanged();
  };

  private emitPaginationChanged() {
    const detail: PaginationDetail = {
      nbElements: this.nbElements,
      pageIndex: this.pageIndex,
    };

    this.dispatchEvent(
      new CustomEvent('paginationChanged', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }
}
