const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  parseKeyFigure
} = __non_webpack_require__( '/lib/ssb/keyFigure')
const {
  DATASET_BRANCH
} = __non_webpack_require__('/lib/repo/dataset')

const view = resolve('./frontpageKeyfigures.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const part = getComponent()
  const keyFiguresPart = data.forceArray(part.config.keyfiguresFrontpage)

  const frontpageKeyfigures = keyFiguresPart.map((keyFigure) => {
    const keyFigureContent = get({
      key: keyFigure.keyfigure
    })
    const keyFigureData = parseKeyFigure(keyFigureContent, undefined, DATASET_BRANCH)
    return {
      id: keyFigureData._id,
      title: keyFigure.urlText,
      href: keyFigure.url,
      number: keyFigureData.number,
      numberDescription: keyFigureData.numberDescription,
      noNumberText: keyFigureData.noNumberText
    }
  })

  return frontpageKeyfigures && frontpageKeyfigures.length > 0 ? renderFrontpageKeyfigures(frontpageKeyfigures) : {
    body: '',
    contentType: 'text/html'
  }
}

function renderFrontpageKeyfigures(frontpageKeyfigures) {
  const frontpageKeyfiguresReact = new React4xp('FrontpageKeyfigures')
    .setProps({
      keyFigures: frontpageKeyfigures.map((frontpageKeyfigure) => {
        return {
          ...frontpageKeyfigure
        }
      })
    })
    .uniqueId()

  const body = render(view, {
    frontpageKeyfiguresId: frontpageKeyfiguresReact.react4xpId
  })

  return {
    body: frontpageKeyfiguresReact.renderBody({
      body,
      clientRender: true
    }),
    pageContributions: frontpageKeyfiguresReact.renderPageContributions({
      clientRender: true
    }),
    contentType: 'text/html'
  }
}

