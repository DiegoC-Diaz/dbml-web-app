import type { Project } from '../types'

/**
 * Common semantic synonyms mapping (English & Spanish)
 * Expands search terms to related technical concepts.
 */
const SEMANTIC_CLUSTERS: Record<string, string[]> = {
  auth: ['login', 'seguridad', 'autenticacion', 'oauth', 'jwt', 'security', 'usuarios', 'users', 'access', 'acceso'],
  login: ['auth', 'seguridad', 'autenticacion', 'oauth', 'jwt', 'password', 'credenciales'],
  database: ['db', 'dbml', 'sql', 'postgres', 'schema', 'esquema', 'tablas', 'modelos', 'relaciones', 'datos'],
  datos: ['data', 'analytics', 'database', 'db', 'sql', 'almacenamiento', 'estadisticas'],
  analytics: ['metricas', 'reportes', 'dashboard', 'estadisticas', 'graficos', 'kpi', 'bi', 'insights'],
  facturacion: ['billing', 'pagos', 'checkout', 'stripe', 'finanzas', 'suscripciones', 'money', 'invoicing'],
  billing: ['facturacion', 'pagos', 'checkout', 'stripe', 'finance', 'invoicing', 'subscriptions'],
  api: ['backend', 'microservices', 'graphql', 'rest', 'endpoints', 'servidor', 'server', 'gateway'],
  frontend: ['ui', 'ux', 'web', 'componentes', 'cliente', 'react', 'interfaz', 'diseno'],
  ecommerce: ['tienda', 'shop', 'compras', 'ventas', 'productos', 'catalogo', 'carrito', 'cart'],
  mobile: ['app', 'android', 'ios', 'movil', 'telefono', 'responsive'],
}

/**
 * Normalizes text: lowercases, trims, and strips diacritics/accents.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Splits string into alphanumeric word tokens.
 */
function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s,._\-/]+/)
    .filter((token) => token.length > 1)
}

/**
 * Computes Dice / bigram similarity between two strings (0.0 to 1.0).
 */
function diceSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1)
  const s2 = normalizeText(str2)
  if (s1 === s2) return 1.0
  if (s1.length < 2 || s2.length < 2) return s1.includes(s2) || s2.includes(s1) ? 0.7 : 0.0

  const getBigrams = (str: string) => {
    const bigrams = new Set<string>()
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2))
    }
    return bigrams
  }

  const bigrams1 = getBigrams(s1)
  const bigrams2 = getBigrams(s2)
  let intersection = 0

  for (const bg of bigrams1) {
    if (bigrams2.has(bg)) intersection++
  }

  return (2.0 * intersection) / (bigrams1.size + bigrams2.size)
}

/**
 * Calculates a semantic similarity score (0.0 to 1.0) between a user search term
 * and a Project's title, description, DBML content, semantic keywords, tags, and category.
 */
export function calculateSemanticSimilarity(query: string, project: Project): number {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return 1.0

  const queryTokens = tokenize(normalizedQuery)
  if (queryTokens.length === 0) return 1.0

  const normalizedTitle = normalizeText(project.title)
  const normalizedDescription = normalizeText(project.description ?? '')

  // 1. Direct title or description match
  if (normalizedTitle === normalizedQuery) return 1.0
  if (normalizedTitle.includes(normalizedQuery)) return 0.95
  if (normalizedDescription.includes(normalizedQuery)) return 0.85

  // 2. Expand query tokens using semantic clusters
  const expandedQuerySet = new Set<string>(queryTokens)
  for (const token of queryTokens) {
    if (SEMANTIC_CLUSTERS[token]) {
      SEMANTIC_CLUSTERS[token].forEach((synonym) => expandedQuerySet.add(synonym))
    }
    for (const [key, synonyms] of Object.entries(SEMANTIC_CLUSTERS)) {
      if (synonyms.includes(token)) {
        expandedQuerySet.add(key)
        synonyms.forEach((s) => expandedQuerySet.add(s))
      }
    }
  }

  // 3. Pool of project semantic targets (title tokens, description tokens, DBML tokens, tags, keywords, category)
  const titleTokens = tokenize(project.title)
  const descriptionTokens = tokenize(project.description ?? '')
  const dbmlTokens = tokenize(project.currentDbml ?? '')
  const keywordTokens = (project.semanticKeywords ?? []).map(normalizeText)
  const tagTokens = (project.tags ?? []).map(normalizeText)
  const categoryToken = normalizeText(project.category ?? '')

  let matchedWeight = 0
  const totalWeight = queryTokens.length

  for (const qToken of queryTokens) {
    let bestTokenScore = 0

    // Compare with title tokens
    for (const tToken of titleTokens) {
      if (tToken === qToken) {
        bestTokenScore = Math.max(bestTokenScore, 0.9)
      } else if (tToken.includes(qToken) || qToken.includes(tToken)) {
        bestTokenScore = Math.max(bestTokenScore, 0.75)
      } else {
        const dice = diceSimilarity(tToken, qToken)
        if (dice > 0.6) {
          bestTokenScore = Math.max(bestTokenScore, dice * 0.7)
        }
      }
    }

    // Compare with description tokens
    for (const dToken of descriptionTokens) {
      if (dToken === qToken || expandedQuerySet.has(dToken)) {
        bestTokenScore = Math.max(bestTokenScore, 0.75)
      } else if (dToken.includes(qToken)) {
        bestTokenScore = Math.max(bestTokenScore, 0.65)
      }
    }

    // Compare with DBML tokens (e.g. table or column names)
    for (const dbmlToken of dbmlTokens) {
      if (dbmlToken === qToken || expandedQuerySet.has(dbmlToken)) {
        bestTokenScore = Math.max(bestTokenScore, 0.7)
      }
    }

    // Compare with category and tags
    if (categoryToken && categoryToken.includes(qToken)) {
      bestTokenScore = Math.max(bestTokenScore, 0.7)
    }
    for (const tag of tagTokens) {
      if (tag.includes(qToken)) {
        bestTokenScore = Math.max(bestTokenScore, 0.65)
      }
    }

    // Compare with semantic keywords
    for (const kw of keywordTokens) {
      if (kw.includes(qToken) || expandedQuerySet.has(kw)) {
        bestTokenScore = Math.max(bestTokenScore, 0.8)
      }
    }

    matchedWeight += bestTokenScore
  }

  return Math.min(1.0, matchedWeight / totalWeight)
}
