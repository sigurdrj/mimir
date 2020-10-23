const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent, pageUrl, assetUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  parseTable
} = __non_webpack_require__( '/lib/ssb/table')
const {
  getSources
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  getLanguage
} = __non_webpack_require__( '/lib/language')
const {
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
} = __non_webpack_require__('/lib/repo/dataset')

const moment = require('moment/min/moment-with-locales')
const view = resolve('./table.html')

exports.get = function(req) {
  try {
    const tableId = getContent().data.mainTable

    return renderPart(req, tableId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, tableId) {
  const page = getContent()
  const language = getLanguage(page)
  const phrases = language.phrases

  if (!tableId) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          label: phrases.table
        })
      }
    } else {
      return {
        body: null
      }
    }
  }

  const tableContent = get({
    key: tableId
  })
  const table = parseTable(req, tableContent, DATASET_BRANCH)
  const tableDraft = parseTable(req, tableContent, UNPUBLISHED_DATASET_BRANCH)
  const showDraft = tableDraft.thead && req.mode === 'preview'

  moment.locale(tableContent.language ? tableContent.language : 'nb')

  // sources
  const sourceConfig = tableContent.data.sources ? forceArray(tableContent.data.sources) : []
  const sourceLabel = phrases.source
  const sources = getSources(sourceConfig)
  const iconUrl = assetUrl({
    path: 'swipe-icon.svg'
  })

  const standardSymbol = getStandardSymbolPage(language.standardSymbolPage, phrases.tableStandardSymbols)

  const tableReact = new React4xp('Table')
    .setProps({
      downloadTableLabel: phrases.tableDownloadAs,
      downloadTableTitle: {
        title: phrases.tableDownloadAs
      },
      downloadTableOptions: getDownloadTableOptions(phrases),
      displayName: tableContent.displayName,
      table: {
        caption: table.caption,
        thead: table.thead,
        tbody: table.tbody,
        tfoot: table.tfoot,
        tableClass: table.tableClass,
        language: language.code,
        noteRefs: table.noteRefs
      },
      tableDraft: {
        caption: showDraft ? tableDraft.caption : undefined,
        thead: showDraft ? tableDraft.thead : undefined,
        tbody: showDraft ? tableDraft.tbody : undefined,
        tfoot: showDraft ? tableDraft.tfoot : undefined,
        tableClass: showDraft ? tableDraft.tableClass : undefined,
        language: language.code,
        noteRefs: showDraft ? tableDraft.noteRefs : undefined
      },
      standardSymbol: standardSymbol,
      sources,
      sourceLabel,
      iconUrl: iconUrl,
      preview: req.mode === 'preview' ? true : false,
      paramShowDraft: req.params.showDraft ? true : false
    })
    .uniqueId()

  const body = render(view, {
    tableId: tableReact.react4xpId
  })

  return {
    body: tableReact.renderBody({
      body,
      clientRender: true
    }),
    pageContributions: tableReact.renderPageContributions({
      clientRender: true
    }),
    contentType: 'text/html'
  }
}

const getDownloadTableOptions = () => {
  const downloadTable = []

  const XLS = {
    title: '.xlsx (Excel)',
    id: 'downloadTableAsXLSX'
  }
  downloadTable.push(XLS)

  const CSV = {
    title: '.CSV',
    id: 'downloadTableAsCSV'
  }
  downloadTable.push(CSV)

  return downloadTable
}

const getStandardSymbolPage = (standardSymbolPage, standardSymbolText) => {
  if (standardSymbolPage) {
    const standardSymbolHref = standardSymbolPage ? pageUrl({
      id: standardSymbolPage
    }) : ''

    return {
      href: standardSymbolHref,
      text: standardSymbolText
    }
  }
  return null
}
