import type { StaticVisualization as StaticVisualizationConfig } from '/site/macros/staticVisualization'

const { preview } = __non_webpack_require__('../../parts/staticVisualization/staticVisualization')

const { preview: dividerControllerPreview } = __non_webpack_require__('../../parts/divider/divider')

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

exports.macro = (context: XP.MacroContext): XP.Response => {
  try {
    const divider: XP.Response = dividerControllerPreview(context.request, {
      dark: false,
    })

    const config: StaticVisualizationConfig = context.params
    const staticVisualization: XP.Response = preview(context.request, config.staticVisualizationContent)

    if (staticVisualization.status && staticVisualization.status !== 200)
      throw new Error(`Static Visualization with id ${config.staticVisualizationContent} missing`)
    staticVisualization.body = (divider.body as string) + staticVisualization.body + divider.body

    return staticVisualization
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
