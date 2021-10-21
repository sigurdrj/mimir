const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  attachmentUrl,
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const xmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const page = getContent()
  const part = getComponent()
  const language = page.language ? page.language === 'en' ? 'en-gb' : page.language : 'nb'

  log.info('highmap content type id %s', JSON.stringify(part.config.highmapId, null, 2))
  const highmapContent = get({
    key: part.config.highmapId
  })

  log.info('highmap attachment name %s', JSON.stringify(highmapContent.data.mapFile, null, 2))
  log.info('highmap attachment url %s', JSON.stringify(attachmentUrl({
    id: highmapContent.data.mapFile
  }), null, 2))

  const tableData = []
  if (highmapContent.data.htmlTable) {
    const stringJson = highmapContent.data.htmlTable ? __.toNativeObject(xmlParser.parse(highmapContent.data.htmlTable)) : undefined
    const result = stringJson ? JSON.parse(stringJson) : undefined
    log.info('result %s', JSON.stringify(result, null))

    tableData.push(result)
  }

  // TODO: Add if check for highmapContent
  const props = {
    title: highmapContent.displayName,
    subtitle: highmapContent.data.subtitle,
    description: highmapContent.data.description,
    mapFile: highmapContent.data.mapFile ? attachmentUrl({
      id: highmapContent.data.mapFile
    }) : undefined,
    tableData,
    thresholdValues: highmapContent.data.thresholdValues,
    hideTitle: highmapContent.data.hideTitle,
    colorPalette: highmapContent.data.colorPalette,
    numberDecimals: highmapContent.data.numberDecimals,
    heightAspectRatio: highmapContent.data.heightAspectRatio,
    seriesTitle: highmapContent.data.seriesTitle,
    legendTitle: highmapContent.data.legendTitle,
    legendAlign: highmapContent.data.legendAlign,
    footnoteText: highmapContent.data.footnoteText ? forceArray(highmapContent.data.footnoteText) : []
  }

  return React4xp.render('site/parts/highmap/Highmap', props, req)
}
