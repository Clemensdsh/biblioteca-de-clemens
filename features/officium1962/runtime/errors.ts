export interface OfficiumErrorDetails {
  path?: string
  status?: number
  expected?: string
  actual?: string
  cause?: unknown
}

export class OfficiumRuntimeError extends Error {
  constructor(message: string, public readonly details: OfficiumErrorDetails = {}) {
    super(message)
    this.name = new.target.name
  }
}

export class ManifestLoadError extends OfficiumRuntimeError {}
export class UnsupportedSchemaError extends OfficiumRuntimeError {}
export class UnavailableYearError extends OfficiumRuntimeError {}
export class UnavailableDateError extends OfficiumRuntimeError {}
export class InvalidChecksumError extends OfficiumRuntimeError {}
export class MissingSharedBlockError extends OfficiumRuntimeError {}
export class InvalidDayDocumentError extends OfficiumRuntimeError {}

export function errorMessageZh(error: unknown): string {
  if (error instanceof UnsupportedSchemaError)
    return '数据格式版本不受支持。为避免显示错误礼文，页面已停止加载。'
  if (error instanceof UnavailableYearError)
    return '当前年份尚未发布。请选择已有年份中的日期。'
  if (error instanceof UnavailableDateError)
    return '所选日期没有可用的 Officium 1962 数据；页面不会自动改用其他日期。'
  if (error instanceof InvalidChecksumError)
    return '数据完整性校验失败，可能是部署缓存版本不一致。请稍后刷新；页面不会显示未经验证的礼文。'
  if (error instanceof MissingSharedBlockError)
    return '礼文引用不完整，缺少共享段落。页面已停止重建当前时辰。'
  if (error instanceof InvalidDayDocumentError)
    return '单日数据结构无效，无法安全显示当前时辰。'
  if (error instanceof ManifestLoadError && error.details.status === 404)
    return '部署中找不到所需发布文件（404）。页面不会回退到其他日期，请稍后重试或报告此问题。'
  if (error instanceof ManifestLoadError)
    return '无法加载 Officium 1962 发布数据。请检查网络后重试。'
  return '加载 Officium 1962 时发生未知错误。'
}

export function errorDebugMessage(error: unknown): string {
  if (!(error instanceof Error))
    return String(error)
  if (error instanceof OfficiumRuntimeError)
    return `${error.name}: ${error.message}${Object.keys(error.details).length ? ` ${JSON.stringify(error.details)}` : ''}`
  return `${error.name}: ${error.message}`
}
