export const camelToSnakeCase = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj

  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeCase)
  }

  return Object.keys(obj).reduce((result: Record<string, any>, key: string) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
    result[snakeKey] = camelToSnakeCase(obj[key])
    return result
  }, {})
}
