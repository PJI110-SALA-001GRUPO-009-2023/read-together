let totalPages = 0

async function search(e) {
    e?.preventDefault()
    const inputValue = document.querySelector('input[name="termos-pesquisa"]').value
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
        return
    }
    const terms = { searchTerms: inputValue }
    const body = JSON.stringify(terms)
    const result = await fetch('acervo/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body,
    })

    if (!result.ok) {
        console.error(result.status, result.statusText)
    } else {
        const responseData = await result.json()
        paginateResults(responseData)
        setUpPageBar()
        showSearchResults()
    }
}

function setUpPageSwitchClickEvents() {
    document.querySelectorAll('#search-pagination li').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault()
            let classAttributes = e.target.getAttribute('class')
            if (classAttributes.includes('disabled') || classAttributes.includes('active')) {
                return
            }

            let page = Number(e.target.textContent.trim())
            classAttributes = String(classAttributes).replace(/disabled|active/, '')
            e.target.setAttribute('class', classAttributes)
            showSearchResults(page - 1)

        })
    })
}

function showSearchResults(page = 0) {
    const pageBar = document.querySelector('#search-pagination')
    const currentPage = pageBar.querySelector('li.active')
    if (pageBar.style.display !== 'none' &&
        currentPage.dataset['index'] == (page + 1)) {
        return
    }

    pageBar.style.display = ''

    currentPage?.setAttribute('class', 'page-item')
    pageBar.querySelector(`li:nth-child(${page + 1})`)?.setAttribute('class', 'page-item active')

    try {
        const pageWithItems = JSON.parse(sessionStorage.getItem('searchResults'))[page]
        const items = JSON.parse(pageWithItems)
        let html = ''
        items.forEach(info => {
            html += buildSearchResultExibitionCard(info)
        })
        document.getElementById('results').innerHTML = html
    } catch (err) {
        console.error(err)
    }
}

function getBasicInformation(data) {
    const info = data.volumeInfo
    console.log(info)
    const basicInformation = {
        id: data.id,
        title: info?.title || 'Título indisponível',
        pubDate: info?.publishedDate ? new Date(info?.publishedDate).toLocaleDateString('pt-BR') : '',
        authors: info?.authors ? info?.authors?.join(' ').substring(0, 40) : '',
        image: info?.imageLinks?.thumbnail || '',
        description: info?.description ? String(info?.description).substring(0, 200) + '...' : '',
        isbn: getISBN(info),
        accessInfo: data.accessInfo
    }
    return basicInformation
}

function getISBN(volumeInfo) {
    let keys = Object.keys(volumeInfo)
    let hasIndustryIdentifiers = keys.indexOf('industryIdentifiers')
    if (hasIndustryIdentifiers < 0) {
        return
    }

    const isbn = volumeInfo.industryIdentifiers.filter(x => x.type === 'ISBN_10')
    if (isbn.length < 1) {
        return
    }

    return isbn[0].identifier
}

function buildSearchResultExibitionCard(basicInformation) {
    let info = basicInformation
    // eslint-disable-next-line no-control-regex
    let escapedTitle = info.title.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
    let image = info.image
        ? '<img style="height: 250px width: 150px" src=' + info.image + ' />'
        : '<div style="display: flex;justify-content: center;align-items: center;text-align: center;height: 250px;width: 150px;border: 1px solid #282828;font-weight: 400;color: #7e77fe;background-color: #e9ecef;">Imagem<br>não disponível</div>'

    let html = `
        <div class="col-lg-6 col-md-12 d-flex flex-column my-md-4"
            data-rd-title="${escapedTitle}" data-rd-isbn="${info.isbn}"
        >
            <div class="d-flex">
                <figure 
                    class="search-result-item-cover" 
                    onclick="initializeViewer('${escapedTitle}', '${info.isbn}')"
                    data-bs-toggle="modal" data-bs-target="#viewerModal"
                >
                    ${image}
                </figure>
                <div class="ms-3">
                    <h3 class="book-title fs-5 mb-0">${info.title}</h3>
                    <h6 class="mb-0" style="color: #6f6f6f; font-weight:600" > 
                        <i>
                            ${info.authors}
                        </i> 
                    </h6>
                    <small class="book-date mt-0 mb-2 d-inline-block">
                        ${info.pubDate ? 'Publicado em ' + info.pubDate : info.pubDate}
                    </small>
                    <p class="book-sinopsis">${info.description}</p>
                </div>
            </div>
            <aside class="align-self-end h-25">
                <a href="https://www.amazon.com.br/s?k=${encodeURI(info.title.replaceAll(' ', '+'))}" target="_blank">
                    <img src="/midia/imagens/buy-at-amazon.png" style="height:55px"/>
                </a>
            </aside>
        </div>
    `

    console.log(html)

    return html
}

function setUpPageBar() {
    document.querySelector('#search-pagination').style.display = 'none'
    const bar = document.querySelector('#search-pagination ul')
    while (bar.children[0]) {
        bar.children[0].remove()
    }

    let html = ''
    for (let idx = 0; idx < totalPages; idx++) {
        html += `<li class="page-item" data-index="${idx + 1}"><a class="page-link" href="#">${idx + 1}</a></li>`
    }
    bar.innerHTML = html
    bar.querySelector('li:first-child').setAttribute('class', 'page-item active')
    setUpPageSwitchClickEvents()
}

function paginateResults(data) {
    const serializedItem = []
    totalPages = 0

    for (let i = 0; i < data.items.length; i += 10) {
        let pageItems = data.items.slice(i, i + 10)

        for (let j = 0; j < pageItems.length; j++) {
            pageItems[j] = getBasicInformation(pageItems[j])
        }

        totalPages++

        serializedItem.push(JSON.stringify(pageItems))
    }

    sessionStorage.setItem('searchResults', JSON.stringify(serializedItem))
}