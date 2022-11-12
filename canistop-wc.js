const template = `
  <style>
      :host {
        color: var(--canistop-primary-light, var(--canistop-primary, inherit));
      }

      @media (prefers-color-scheme: dark) {
        :host {
          color: var(--canistop-primary-dark, var(--canistop-primary, inherit));
        }
      }

      :host(.big) {
        font-size: 130%;
      }

      .slot-outside-style { background-color: gray; }

      ::slotted(.slot-outside-style) {
        background-color: olive;
      }

      .refresh {
        padding: .4rem;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: .5rem;
      }
  </style>
  <div id="data-wrapper">something</div>
  <slot>inner slot content</slot>
  <button class="refresh" id="refresh" type="button">
      <span id="refresh-label">refresh</span>
      <svg class="refresh-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 50" width="22" height="19">
          <path fill="none" stroke="currentColor" stroke-width="5.983" stroke-linecap="round" stroke-linejoin="round" d="M54.038 21.949l-8.74 11.122-10.392-9.818"/>
          <path fill="currentColor" d="M41.127 42.89a2.992 2.992 0 0 0-4.23-4.23l4.23 4.23zM3.114 28.809l-2.977.297.01.098.016.096 2.95-.491zM30.037 4.877l-.86 2.865.86-2.865zm11.966 20.94a2.991 2.991 0 1 0 5.983 0h-5.983zM36.897 38.66C26.625 48.931 8.65 43.83 6.065 28.317L.163 29.3c3.398 20.386 27.304 27.25 40.964 13.59l-4.23-4.23zM6.09 28.511C4.765 15.255 16.647 3.983 29.178 7.742l1.719-5.73C13.513-3.205-1.529 12.446.137 29.105l5.954-.595zM29.178 7.742c6.508 1.952 12.825 8.986 12.825 18.075h5.983c0-11.85-8.166-21.129-17.089-23.806l-1.72 5.731z"/>
      </svg>
  </button>

  <div>data: <a href="https://canistop.net">canistop.net</a></div>
`

const round = (number, precision = 0) => {
  precision = 10 ** precision
  return Math.round(number * precision) / precision
}

/**
 * Sort a coma-separated list while removing duplicates.
 * @param {string} str Coma-separated list
 * @returns {(string | any)}
 */
const sortComaSeparated = str => [...new Set(str?.split(','))].sort().join(',') || str

class CanIStopElement extends HTMLElement {

  // Network

  #fetching = false

  /**
   * @type {RequestInit}
   */
  #fetchOptions = {
    cache: 'reload', // https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
  }

  get isFetching() {
    return this.#fetching
  }

  // DOM

  #$dataWrapper
  #$refreshBtn
  #$refreshBtnLabel

  constructor() {
    super()

    const root = this.attachShadow({
      mode: 'open',
      // slotAssignment: 'manual',
    })

    root.innerHTML = template
    this.#$dataWrapper = root.getElementById('data-wrapper')
    this.#$refreshBtn = root.getElementById('refresh')
    this.#$refreshBtnLabel = root.getElementById('refresh-label')
    this.#$refreshBtn.addEventListener('click', this.#fetch.bind(this))
  }

  // Lifecycle

  connectedCallback() {

    // handle `network-cache` attribute

    this.#setCacheModeFromAttr(this.getAttribute('network-cache'))

    this.#fetch()

    // handle `refresh-label` attribute

    const label = this.getAttribute('refresh-label')
    if (label) {
      this.#$refreshBtnLabel.innerHTML = label
    }
  }

  disconnectedCallback() {
    // should cancel a pending request?
    console.log('canistop disconnectedCallback')
  }

  static get observedAttributes() {
    return ['network-cache', 'browser', 'regions']
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name == 'network-cache') {
      return this.#setCacheModeFromAttr(newVal)
    }

    // `browser` or `regions` attribute, and value has changed
    if (
      (name == 'browser' && newVal != oldVal)
      || (name == 'regions' && sortComaSeparated(oldVal) != sortComaSeparated(newVal))
    ) {
      return this.#fetch(true)
    }
  }

  // Methods

  // handle `network-cache` attribute
  #setCacheModeFromAttr(value) {
    this.#fetchOptions.cache = value === 'false' ? 'reload' : 'default'
  }

  update() {
    this.#fetch()
  }

  // Should it return something?
  #fetch(force = false) { // @todo: the `force` parameter should cancel any pending request
    if (this.#fetching && !force) { return }

    const browser = this.getAttribute('browser')
    this.#fetching = true

    fetch(`https://canistop.net/storage/data/${browser}.json`, this.#fetchOptions)
      .then(data => data.json())
      .then(data => {
        const regions = sortComaSeparated(this.getAttribute('regions'))?.split(',') ?? Object.keys(data.usage)

        const usage = regions
          .map(region =>
              `<tr>
                  <th>${region}</th>
                  <td>${round(data.usage[region], 2).toFixed(2)}%</td>
              </tr>`
          )
          .join('')

        this.#$dataWrapper.innerHTML = `
          <table>
              <thead>
                  <tr><th colspan="2">${data.browser} ${data.version} usage in ${data.date}</th></tr>
              </thead>
              <tbody>${usage}</tbody>
          </table>
        `

        this.dispatchEvent(new Event('canistop:updated'))
      })
      // @todo: consider showing an error status
      .catch((err) => console.error(err))
      .finally(() => (this.#fetching = false))
  }
}

customElements.define('canistop-something', CanIStopElement)
