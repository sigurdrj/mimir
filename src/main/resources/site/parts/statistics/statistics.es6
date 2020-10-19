const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  preview: keyFigurePreview
} = __non_webpack_require__('../keyFigure/keyFigure')

const React4xp = require('/lib/enonic/react4xp')
const moment = require('moment/min/moment-with-locales')
const view = resolve('./statistics.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const page = getContent()
  const phrases = getPhrases(page)
  moment.locale(page.language ? page.language : 'nb')
  const statistic = page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)

  let title = page.displayName
  const updated = phrases.updated + ': '
  const nextUpdate = phrases.nextUpdate + ': '
  const changed = phrases.modified + ': '
  const modifiedText = page.data.modifiedText
  let previousRelease = phrases.notAvailable
  let nextRelease = phrases.notYetDetermined
  let statisticsKeyFigure
  let changeDate

  if (statistic) {
    title = statistic.name

    if (statistic.variants.previousRelease && statistic.variants.previousRelease !== '') {
      previousRelease = moment(statistic.variants.previousRelease).format('DD. MMMM YYYY')
    }

    if (statistic.variants.nextRelease && statistic.variants.nextRelease !== '') {
      nextRelease = moment(statistic.variants.nextRelease).format('DD. MMMM YYYY')
    }
  }

  if (page.data.statisticsKeyFigure) {
    statisticsKeyFigure = keyFigurePreview(req, page.data.statisticsKeyFigure)
  }

  if (page.data.lastModified && statistic.variants.previousRelease) {
    if (moment(page.data.lastModified).isAfter(statistic.variants.previousRelease)) {
      changeDate = moment(page.data.lastModified).format('DD. MMMM YYYY, HH:MM')
    }
  }

  const modifiedDateComponent = new React4xp('ModifiedDate')
    .setProps({
      explanation: modifiedText,
      className: '',
      children: changeDate
    })
    .setId('modifiedDate')
    .uniqueId()

  const model = {
    title,
    updated,
    nextUpdate,
    changed,
    changeDate,
    modifiedText,
    previousRelease,
    nextRelease,
    modifiedDateId: modifiedDateComponent.react4xpId,
    statisticsKeyFigure: statisticsKeyFigure ? statisticsKeyFigure.body : null
  }

  let body = render(view, model)
  if (changeDate) {
    body = modifiedDateComponent.renderBody({
      body
    })
  }
  const pageContributions = modifiedDateComponent.renderPageContributions({
    pageContributions: {
      bodyEnd: statisticsKeyFigure ? statisticsKeyFigure.pageContributions.bodyEnd : []
    },
    clientRender: true
  })
  return {
    body,
    pageContributions,
    contentType: 'text/html'
  }
}
