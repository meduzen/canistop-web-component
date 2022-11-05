class CanIStop extends HTMLElement {
    #fetching = false
    #$dataWrapper

    constructor() {
        console.log('canistop constructor')
        super()
    }

    connectedCallback() {
        console.log('canistop connectedCallback')
        this.#fetchData()

        this.#$dataWrapper = document.createElement('div')
        this.appendChild(this.#$dataWrapper)

        const refreshButton = document.createElement('button')
        refreshButton.type = 'button'
        refreshButton.textContent = this.getAttribute('refresh-button') || 'refresh'
        this.appendChild(refreshButton)

        refreshButton.addEventListener('click', this.#fetchData.bind(this))
    }

    disconnectedCallback() {
        console.log('canistop disconnectedCallback')
    }

    attributeChangedCallback() {
        console.log('canistop attributeChangedCallback')
    }

    #fetchData() {
        console.log('fetchData')
        if (this.#fetching) { return }
        const browser = this.getAttribute('browser')
        this.#fetching = true
        fetch(`https://canistop.net/storage/data/${browser}.json`)
            .then(data => data.json())
            .then(data => {
                console.log(data)
                const regions = this.getAttribute('regions')
                    .split(',')
                    .map(region => ({
                        region: region,
                        usage: data.usage[region],
                    }))

                const date = data.date
                const list = regions
                    .map(region => `<li>${region.region}: ${region.usage * 100}%</li>`)
                    .join('')

                this.#$dataWrapper.innerHTML = `
                    <h2>${data.browser} ${data.version} in ${date}</h2>
                    <ul>${list}</ul>
                `
            })
            // Should we kill the whole component, including its surrounding DOM?
            .catch(() => console.error('erf'))
            .finally(() => this.#fetching = false)
    }
}

customElements.define('canistop-something', CanIStop)