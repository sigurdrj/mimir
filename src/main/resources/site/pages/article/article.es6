const moment = require('/lib/moment-with-locales')

import * as i18n from '/lib/xp/i18n'
import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

const version = '%%VERSION%%'

function getBreadcrumbs(c, a) {
  const key = c._path.replace(/\/[^\/]+$/, '')
  c = key && content.get({ key })
  c && c.type.match(/:page$/) && a.unshift(c) && getBreadcrumbs(c, a)
}

moment.locale('nb')

exports.get = function(req) {
  const ts = new Date().getTime()
  const page = portal.getContent()
  const isFragment = page.type === 'portal:fragment'
  const mainRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.main
  const config = {}
  const view = resolve('article.html')

  // Phrases
  const phrases = i18n.getPhrases(page.language === 'en' && page.language || '', ['site/i18n/phrases'])

  // Create preview
  if (page.type === `${app.name}:accordion` || page.type === `${app.name}:menu-box` || page.type === `${app.name}:button` || page.type === `${app.name}:highchart`) {
    const name = page.type.replace(/^.*:/, '')
    const controller = require(`../../parts/${name}/${name}`)
    page.preview = controller.get({ config: { [name]: [page._id] }})
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  const published = page.publish && page.publish.from && moment(page.publish.from).format('DD. MMMM YYYY').toLowerCase()
  const publishedDatetime = page.publish && page.publish.from && moment(page.publish.from).format('YYYY-MM-DD HH:MM')

  const modified = moment(page.modifiedTime).format('DD. MMMM YYYY').toLowerCase()
  const modifiedDatetime = moment(page.modifiedTime).format('YYYY-MM-DD HH:MM')

  page.displayNameURLencoded = encodeURI(page.displayName)
  page.url = encodeURI(portal.pageUrl({ type: 'absolute', id: page._id }))

  const model = { version, ts, config, page, breadcrumbs, mainRegion, published, publishedDatetime, modified, modifiedDatetime, phrases }
  const body = thymeleaf.render(view, model)

  return { body }
}
