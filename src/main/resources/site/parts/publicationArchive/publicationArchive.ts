import { Request } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { PublicationArchivePartConfig } from './publicationArchive-part-config'
import { PublicationResult } from '../../../lib/ssb/parts/publicationArchive'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'

const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getContent, serviceUrl, getComponent
} = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getPublications
} = __non_webpack_require__( '/lib/ssb/parts/publicationArchive')
const {
  getMainSubjects
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const part: Component<PublicationArchivePartConfig> = getComponent()
  const phrases: {[key: string]: string} = getPhrases(content)
  const language: string = content.language ? content.language : 'nb'
  const publicationArchiveServiceUrl: string = serviceUrl({
    service: 'publicationArchive'
  })
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const start: number = 0
  const count: number = 10

  const mainSubjectDropdown: Array<Dropdown> = mainSubjects.map((subject) => {
    return {
      id: subject.name,
      title: subject.title
    }
  })

  const articleTypeDropdown: Array<Dropdown> = [
    {
      id: 'article',
      title: phrases['articleType.default']
    },
    {
      id: 'report',
      title: phrases['articleType.report']
    },
    {
      id: 'note',
      title: phrases['articleType.note']
    },
    {
      id: 'statistic',
      title: phrases['articleType.statistics']
    }
  ]

  const props: PartProperties = {
    title: content.displayName,
    ingress: part.config.ingress || '',
    buttonTitle: phrases['button.showMore'],
    showingPhrase: phrases['publicationArchive.showing'],
    language,
    publicationArchiveServiceUrl,
    publicationAndArticles: getPublications(req, start, count, language),
    articleTypePhrases: {
      default: phrases['articleType.default'],
      report: phrases['articleType.report'],
      note: phrases['articleType.note'],
      analysis: phrases['articleType.analysis'],
      economicTrends: phrases['articleType.economicTrends'],
      discussionPaper: phrases['articleType.discussionPaper'],
      statistics: phrases['articleType.statistics']
    },
    mainSubjects: mainSubjectDropdown,
    articleType: articleTypeDropdown
  }

  return React4xp.render('site/parts/publicationArchive/publicationArchive', props, req)
}

interface PartProperties {
  title: string;
  ingress: string;
  buttonTitle: string;
  showingPhrase: string;
  language: string;
  publicationArchiveServiceUrl: string;
  publicationAndArticles: PublicationResult;
  articleTypePhrases: {
    [key: string]: string;
  };
  mainSubjects: Array<Dropdown>;
  articleType: Array<Dropdown>;
}

interface Dropdown {
  id: string;
  title: string;
}
