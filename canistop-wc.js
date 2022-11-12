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
  </style>
  <div id="data-wrapper">something</div>
  <slot>inner slot content</slot>
  <button id="refresh" type="button">refresh</button>
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

  constructor() {
    super()

    const root = this.attachShadow({
      mode: 'open',
      // delegatesFocus: true,
      // slotAssignment: 'manual',
    })

    root.innerHTML = template
    this.#$dataWrapper = root.getElementById('data-wrapper')
    this.#$refreshBtn = root.getElementById('refresh')
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
      this.#$refreshBtn.innerHTML = label
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

    if (name == 'browser' || name == 'regions') {
      return this.#fetch(true) // @todo: the `force` parameter should cancel any pending request
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
  #fetch(force = false) {
    if (this.#fetching && !force) { return }

    const browser = this.getAttribute('browser')
    this.#fetching = true

    fetch(`https://canistop.net/storage/data/${browser}.json`, this.#fetchOptions)
      .then(data => data.json())
      .then(data => {
        const regions = sortComaSeparated(this.getAttribute('regions'))?.split(',') ?? Object.keys(data.usage)

        const usage = regions
          .map(region =>
              `<li>${region}: ${round(data.usage[region], 2).toFixed(2)}%</li>`
          )
          .join('')

        this.#$dataWrapper.innerHTML = `
          <h2>${data.browser} ${data.version} usage in ${data.date}</h2>
          <ul>${usage}</ul>
        `

        this.dispatchEvent(new Event('canistop:updated'))
      })
      // @todo: consider showing an error status
      .catch((err) => console.error(err))
      .finally(() => (this.#fetching = false))
  }
}

customElements.define('canistop-something', CanIStopElement)
