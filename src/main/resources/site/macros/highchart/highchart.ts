import type { Highchart as HighchartConfig } from '/site/macros/highchart'

const { preview: highchartControllerPreview } = __non_webpack_require__('../../parts/highchart/highchart')
const { preview: dividerControllerPreview } = __non_webpack_require__('../../parts/divider/divider')

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

exports.macro = function (context: XP.MacroContext): XP.Response {
  try {
    const divider: XP.Response = dividerControllerPreview(context.request, {
      dark: false,
    })

    const config: HighchartConfig = context.params
    const highchart: XP.Response = highchartControllerPreview(context.request, config.highchart)

    if (highchart.status && highchart.status !== 200) throw new Error(`Highchart with id ${config.highchart} missing`)
    highchart.body = (divider.body as string) + highchart.body + divider.body

    return highchart
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
