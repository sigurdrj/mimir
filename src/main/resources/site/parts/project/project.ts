import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Project } from '../../content-types/project/project'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent, pageUrl, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req: Request): React4xpResponse {
  const page: Content<Project> = getContent()
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const managerConfig: string | undefined = page.data.manager || undefined

  const props: ProjectProps = {
    projectTitle: page.data.projectTitle,
    manager: getManager(managerConfig),
    projectType: page.data.projectType === 'model' ? 'Modellansvarlig' : 'Prosjektansvarlig',
    projectPeriod: page.data.projectPeriod,
    financier: page.data.financier,
    ingress: page.data.ingress ? processHtml({
      value: page.data.ingress.replace(/&nbsp;/g, '')
    }) : undefined,
    body: page.data.body ? processHtml({
      value: page.data.body.replace(/&nbsp;/g, '')
    }) : undefined,
    participants: page.data.participants ? processHtml({
      value: page.data.participants.replace(/&nbsp;/g, '')
    }) : undefined,
    collaborators: page.data.collaborators ? processHtml({
      value: page.data.collaborators.replace(/&nbsp;/g, '')
    }) : undefined
  }

  return React4xp.render('site/parts/project/project', props, req)
}

function getManager(managerId: string | undefined): ManagerLink | [] {
  if (managerId) {
    const managerContent: Content | null = get({
      key: managerId
    })
    if (managerContent) {
      return {
        text: managerContent.displayName,
        href: pageUrl({
          path: managerContent._path
        })
      }
    }
  }
  return []
}

interface ManagerLink {
  text: string;
  href: string;
}

interface ProjectProps {
    projectTitle: string;
    manager: ManagerLink | [];
    projectType?: string;
    projectPeriod?: string;
    financier?: string;
    ingress: string | undefined;
    body?: string;
    participants?: string;
    collaborators?: string;
}
