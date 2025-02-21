import { PreparedArticles } from '/lib/ssb/utils/articleUtils'

const { getContent } = __non_webpack_require__('/lib/xp/portal')
const { getChildArticles, prepareArticles } = __non_webpack_require__('/lib/ssb/utils/articleUtils')

let totalCount = 0

exports.get = (req: XP.Request): XP.Response => {
  const currentPath: string = req.params.currentPath ? req.params.currentPath : '/'
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const sort: string = req.params.sort ? req.params.sort : 'DESC'
  const language: string = req.params?.language ? (req.params.language === 'en' ? 'en-gb' : req.params.language) : 'nb'
  const content = getContent()
  if (!content) {
    return {
      status: 404,
    }
  }
  const subTopicId: string = content._id

  const childArticles = getChildArticles(currentPath, subTopicId, start, count, sort)
  const preparedArticles: Array<PreparedArticles> = prepareArticles(childArticles, language)
  totalCount = childArticles.total

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      articles: preparedArticles,
      totalCount: totalCount,
    },
  }
}
