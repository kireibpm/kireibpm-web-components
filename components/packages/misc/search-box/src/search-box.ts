import { css, customElement, html, LitElement, property, PropertyValues } from 'lit-element';
// @ts-ignore
import bootstrapStyle from './style.scss';
import { get, listenForLangChanged, registerTranslateConfig, use } from 'lit-translate';
import * as i18n_en from './i18n/en.json';
import * as i18n_es from './i18n/es-ES.json';
import * as i18n_fr from './i18n/fr.json';
import * as i18n_ja from './i18n/ja.json';
import * as i18n_pt from './i18n/pt-BR.json';

registerTranslateConfig({
  loader: (lang: string) => Promise.resolve(SearchBox.getCatalog(lang)),
});

@customElement('search-box')
export class SearchBox extends LitElement {
  @property({ attribute: 'placeholder', type: String, reflect: true })
  placeholder = '';

  @property({ attribute: 'lang', type: String, reflect: true })
  lang = 'en';

  private translatedPlaceholder = '';

  constructor() {
    super();
    listenForLangChanged(() => {
      this.translatedPlaceholder = get('placeholder');
      this.requestUpdate();
    });
  }

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
        padding: 10px 10px 10px 0;
        max-width: var(--max-width, 50%);
      }

      .search-input {
        font-size: 14px;
      }
    `;
  }

  render() {
    return html`
      <style>${bootstrapStyle}</style>
      <input
        class="form-control search-input"
        type="search"
        autocomplete="off"
        placeholder="&#x1F50D;${this.effectivePlaceholder}"
        @input=${this.handleInput}
      />
    `;
  }

  private get effectivePlaceholder() {
    return this.placeholder || this.translatedPlaceholder;
  }

  private async loadLanguage() {
    await use(this.lang);
    if (!this.placeholder) {
      this.translatedPlaceholder = get('placeholder');
    }
  }

  private handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent('valueChange', {
        detail: input.value,
        bubbles: true,
        composed: true,
      }),
    );
  }
}
