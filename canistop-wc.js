class CanIStop extends HTMLElement {
    #fetching = false
    #$dataWrapper

    constructor() {
        super()

        this.attachShadow({
            mode: 'open',
            // delegatesFocus: true,
            // slotAssignment: 'manual',
        })

        this.shadowRoot.innerHTML = `
            <style>
                * { color: green; }
            </style>
            <slot>default slot content</slot>
        `
    }

    connectedCallback() {
        this.#fetch()

        this.#$dataWrapper = document.createElement('div')
        this.shadowRoot.appendChild(this.#$dataWrapper)

        const refreshButton = document.createElement('button')
        refreshButton.type = 'button'
        refreshButton.textContent = this.getAttribute('refresh-button') || 'refresh'
        refreshButton.addEventListener('click', this.#fetch.bind(this))
        this.shadowRoot.appendChild(refreshButton)

        const footer = document.createElement('div')
        footer.innerHTML = `data: <a href="https://canistop.net">canistop.net</a>`
        this.shadowRoot.appendChild(footer)
    }

    // disconnectedCallback() {
    //     console.log('canistop disconnectedCallback')
    // }

    // attributeChangedCallback() {
    //     console.log('canistop attributeChangedCallback')
    // }

    #fetch() {
        if (this.#fetching) { return }

        const browser = this.getAttribute('browser')
        this.#fetching = true
        fetch(`https://canistop.net/storage/data/${browser}.json`)
            .then(data => data.json())
            .then(data => {
                var regions =
                    (this.getAttribute('regions'))?.split(',')
                    ?? Object.keys(data.usage)

                const usage = regions
                    .map(region => `<li>${region}: ${data.usage[region] * 100}%</li>`)
                    .join('')

                this.#$dataWrapper.innerHTML = `
                    <h2>${data.browser} ${data.version} in ${data.date}</h2>
                    <ul>${usage}</ul>
                `
            })
            // Should we kill the whole component, including its surrounding DOM?
            .catch(err => console.error(err))
            .finally(() => this.#fetching = false)
    }
}

customElements.define('canistop-something', CanIStop)