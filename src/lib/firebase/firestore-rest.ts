/**
 * Firestore REST API client — replaces firebase-admin/firestore on Vercel.
 *
 * Uses jose (already in package.json) to sign service-account JWTs and
 * exchange them for Google OAuth2 access tokens. No native binaries required.
 *
 * Supports:
 *   - get / query / add / set / update / delete
 *   - batch writes
 *   - transactions (beginTransaction / commit)
 *   - count (runAggregationQuery)
 *   - subcollections via "collection/docId/subcollection" path syntax
 */

import 'server-only'
import { importPKCS8, SignJWT } from 'jose'

// ---------------------------------------------------------------------------
// Data accepts any plain object — callers cast as needed
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FSData = Record<string, any>

export interface FirestoreDoc {
  id: string
  data: () => FSData
  exists: boolean
  ref: DocRef
}

export type WhereOp = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains'
export type OrderDir = 'asc' | 'desc'

export interface WhereClause {
  field: string
  op: WhereOp
  value: unknown
}

export interface OrderClause {
  field: string
  dir: OrderDir
}

export interface QuerySnapshot {
  docs: FirestoreDoc[]
  empty: boolean
  size: number
}

// ---------------------------------------------------------------------------
// Firestore REST value encoding / decoding
// ---------------------------------------------------------------------------

type RestValue = Record<string, unknown>

function encodeValue(v: unknown): RestValue {
  if (v === null || v === undefined) return { nullValue: null }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return { integerValue: String(v) }
    return { doubleValue: v }
  }
  if (typeof v === 'string') return { stringValue: v }
  if (v instanceof Date) return { timestampValue: v.toISOString() }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } }
  if (typeof v === 'object') {
    const fields: Record<string, RestValue> = {}
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      fields[k] = encodeValue(val)
    }
    return { mapValue: { fields } }
  }
  return { nullValue: null }
}

function decodeValue(v: RestValue): unknown {
  if ('nullValue' in v) return null
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('stringValue' in v) return v.stringValue
  if ('timestampValue' in v) return new Date(v.timestampValue as string)
  if ('bytesValue' in v) return v.bytesValue
  if ('referenceValue' in v) return v.referenceValue
  if ('arrayValue' in v) {
    const arr = (v.arrayValue as { values?: RestValue[] }).values ?? []
    return arr.map(decodeValue)
  }
  if ('mapValue' in v) {
    const fields = (v.mapValue as { fields?: Record<string, RestValue> }).fields ?? {}
    const result: FSData = {}
    for (const [k, val] of Object.entries(fields)) {
      result[k] = decodeValue(val)
    }
    return result
  }
  return null
}

function encodeDoc(data: FSData): { fields: Record<string, RestValue> } {
  const fields: Record<string, RestValue> = {}
  for (const [k, v] of Object.entries(data)) {
    fields[k] = encodeValue(v)
  }
  return { fields }
}

function decodeDoc(
  restDoc: Record<string, unknown>,
  docRef: DocRef
): FirestoreDoc {
  const name = restDoc.name as string
  const id = name ? name.split('/').pop()! : docRef.id
  const fields = (restDoc.fields as Record<string, RestValue>) ?? {}
  const decoded: FSData = {}
  for (const [k, v] of Object.entries(fields)) {
    decoded[k] = decodeValue(v)
  }
  return {
    id,
    data: () => decoded,
    exists: true,
    ref: docRef,
  }
}

const MISSING_DOC_DATA: FSData = {}

function missingDoc(ref: DocRef): FirestoreDoc {
  return {
    id: ref.id,
    data: () => MISSING_DOC_DATA,
    exists: false,
    ref,
  }
}

// ---------------------------------------------------------------------------
// OAuth2 token cache
// ---------------------------------------------------------------------------

let _cachedToken: string | null = null
let _tokenExpiresAt = 0

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (_cachedToken && now < _tokenExpiresAt - 300_000) {
    return _cachedToken
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      'Firestore REST: Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY env vars.'
    )
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n')
  const nowSec = Math.floor(now / 1000)
  const key = await importPKCS8(privateKey, 'RS256')

  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/datastore',
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: nowSec,
    exp: nowSec + 3600,
  })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(key)

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!tokenRes.ok) {
    const body = await tokenRes.text()
    console.error('[Firestore REST] OAuth2 token exchange failed:', {
      status: tokenRes.status,
      body,
      clientEmail,
      projectId,
      keyPreview: privateKey.slice(0, 80),
    })
    throw new Error(`Firestore REST: OAuth2 token exchange failed (${tokenRes.status}): ${body}`)
  }

  const tokenData = await tokenRes.json()
  _cachedToken = tokenData.access_token as string
  _tokenExpiresAt = now + (tokenData.expires_in as number) * 1000
  return _cachedToken!
}

// ---------------------------------------------------------------------------
// REST helpers
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
}

async function firestoreRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const token = await getAccessToken()
  const url = path.startsWith('https://') ? path : `${getBaseUrl()}${path}`

  const res = await fetch(url, {
    method,
    cache: 'no-store' as RequestCache,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Firestore REST ${method} ${path} failed (${res.status}): ${err}`)
  }

  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}

// ---------------------------------------------------------------------------
// Filter encoding for runQuery
// ---------------------------------------------------------------------------

function encodeFilter(where: WhereClause): Record<string, unknown> {
  // firebase-admin translates `!= null` to IS_NOT_NULL and `== null` to IS_NULL
  // unaryFilter, not fieldFilter. The REST API requires this distinction.
  if (where.value === null || where.value === undefined) {
    if (where.op === '!=') {
      return { unaryFilter: { field: { fieldPath: where.field }, op: 'IS_NOT_NULL' } }
    }
    if (where.op === '==') {
      return { unaryFilter: { field: { fieldPath: where.field }, op: 'IS_NULL' } }
    }
  }

  const opMap: Record<WhereOp, string> = {
    '==': 'EQUAL',
    '!=': 'NOT_EQUAL',
    '<': 'LESS_THAN',
    '<=': 'LESS_THAN_OR_EQUAL',
    '>': 'GREATER_THAN',
    '>=': 'GREATER_THAN_OR_EQUAL',
    'in': 'IN',
    'not-in': 'NOT_IN',
    'array-contains': 'ARRAY_CONTAINS',
  }
  return {
    fieldFilter: {
      field: { fieldPath: where.field },
      op: opMap[where.op],
      value: encodeValue(where.value),
    },
  }
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

function collectionPath(collectionId: string): string {
  return `/${collectionId}`
}

function docPath(collectionId: string, docId: string): string {
  return `/${collectionId}/${docId}`
}

// ---------------------------------------------------------------------------
// Write operation type (shared by batch and transaction)
// ---------------------------------------------------------------------------

interface WriteOp {
  type: 'update' | 'set' | 'delete'
  collection: string
  id: string
  data?: FSData
}

// ---------------------------------------------------------------------------
// DocRef — reference to a specific document
// ---------------------------------------------------------------------------

export class DocRef {
  constructor(
    public readonly collectionId: string,
    public readonly id: string
  ) {}

  async get(): Promise<FirestoreDoc> {
    return firestoreDb.get(this.collectionId, this.id)
  }

  async set(data: FSData, merge = false): Promise<void> {
    return firestoreDb.set(this.collectionId, this.id, data, merge)
  }

  async update(data: FSData): Promise<void> {
    return firestoreDb.update(this.collectionId, this.id, data)
  }

  async delete(): Promise<void> {
    return firestoreDb.delete(this.collectionId, this.id)
  }

  collection(subcollectionId: string): CollectionRef {
    return new CollectionRef(`${this.collectionId}/${this.id}/${subcollectionId}`)
  }
}

// ---------------------------------------------------------------------------
// CollectionRef — fluent query builder
// ---------------------------------------------------------------------------

export class CollectionRef {
  private _where: WhereClause[] = []
  private _order: OrderClause[] = []
  private _limit: number | null = null

  constructor(public readonly collectionId: string) {}

  where(field: string, op: WhereOp, value: unknown): CollectionRef {
    const next = new CollectionRef(this.collectionId)
    next._where = [...this._where, { field, op, value }]
    next._order = [...this._order]
    next._limit = this._limit
    return next
  }

  orderBy(field: string, dir: OrderDir = 'asc'): CollectionRef {
    const next = new CollectionRef(this.collectionId)
    next._where = [...this._where]
    next._order = [...this._order, { field, dir }]
    next._limit = this._limit
    return next
  }

  limit(n: number): CollectionRef {
    const next = new CollectionRef(this.collectionId)
    next._where = [...this._where]
    next._order = [...this._order]
    next._limit = n
    return next
  }

  doc(id?: string): DocRef {
    const docId = id ?? crypto.randomUUID()
    return new DocRef(this.collectionId, docId)
  }

  async get(): Promise<QuerySnapshot> {
    return firestoreDb.query(this.collectionId, this._where, this._order, this._limit)
  }

  async add(data: FSData): Promise<DocRef> {
    return firestoreDb.add(this.collectionId, data)
  }

  async count(): Promise<{ data: () => { count: number } }> {
    const n = await firestoreDb.count(this.collectionId, this._where)
    return { data: () => ({ count: n }) }
  }
}

// ---------------------------------------------------------------------------
// TransactionContext — passed to runTransaction callback
// ---------------------------------------------------------------------------

export class TransactionContext {
  private _reads = new Map<string, FirestoreDoc>()
  private _writes: WriteOp[] = []

  constructor(private readonly _transactionId: string) {}

  get transactionId(): string {
    return this._transactionId
  }

  async get(ref: DocRef): Promise<FirestoreDoc> {
    const key = `${ref.collectionId}/${ref.id}`
    if (this._reads.has(key)) return this._reads.get(key)!
    const doc = await firestoreDb.getInTransaction(ref.collectionId, ref.id, this._transactionId)
    this._reads.set(key, doc)
    return doc
  }

  update(ref: DocRef, data: FSData): void {
    this._writes.push({ type: 'update', collection: ref.collectionId, id: ref.id, data })
  }

  set(ref: DocRef, data: FSData): void {
    this._writes.push({ type: 'set', collection: ref.collectionId, id: ref.id, data })
  }

  delete(ref: DocRef): void {
    this._writes.push({ type: 'delete', collection: ref.collectionId, id: ref.id })
  }

  getWrites(): WriteOp[] {
    return this._writes
  }
}

// ---------------------------------------------------------------------------
// WriteBatch
// ---------------------------------------------------------------------------

export class WriteBatch {
  private _writes: WriteOp[] = []

  set(ref: DocRef, data: FSData): void {
    this._writes.push({ type: 'set', collection: ref.collectionId, id: ref.id, data })
  }

  update(ref: DocRef, data: FSData): void {
    this._writes.push({ type: 'update', collection: ref.collectionId, id: ref.id, data })
  }

  delete(ref: DocRef): void {
    this._writes.push({ type: 'delete', collection: ref.collectionId, id: ref.id })
  }

  async commit(): Promise<void> {
    if (this._writes.length === 0) return
    await firestoreDb.batchWrite(this._writes)
  }
}

// ---------------------------------------------------------------------------
// Encode writes array for batchWrite / commit
// ---------------------------------------------------------------------------

function encodeWrites(writes: WriteOp[], projectId: string): unknown[] {
  const baseDocPath = `projects/${projectId}/databases/(default)/documents`
  return writes.map((w) => {
    const fullPath = `${baseDocPath}/${w.collection}/${w.id}`
    if (w.type === 'delete') {
      return { delete: fullPath }
    }
    if (w.type === 'update') {
      const fields = Object.keys(w.data!)
      return {
        update: { name: fullPath, ...encodeDoc(w.data!) },
        updateMask: { fieldPaths: fields },
      }
    }
    // set (full overwrite)
    return {
      update: { name: fullPath, ...encodeDoc(w.data!) },
    }
  })
}

// ---------------------------------------------------------------------------
// Main firestoreDb object
// ---------------------------------------------------------------------------

export const firestoreDb = {
  collection(collectionId: string): CollectionRef {
    return new CollectionRef(collectionId)
  },

  batch(): WriteBatch {
    return new WriteBatch()
  },

  async get(collectionId: string, docId: string): Promise<FirestoreDoc> {
    const ref = new DocRef(collectionId, docId)
    const res = await firestoreRequest('GET', docPath(collectionId, docId)) as Record<string, unknown> | null
    if (!res) return missingDoc(ref)
    return decodeDoc(res, ref)
  },

  async getInTransaction(collectionId: string, docId: string, txId: string): Promise<FirestoreDoc> {
    const ref = new DocRef(collectionId, docId)
    const encodedTx = encodeURIComponent(txId)
    const res = await firestoreRequest(
      'GET',
      `${docPath(collectionId, docId)}?transaction=${encodedTx}`
    ) as Record<string, unknown> | null
    if (!res) return missingDoc(ref)
    return decodeDoc(res, ref)
  },

  async query(
    collectionId: string,
    where: WhereClause[] = [],
    order: OrderClause[] = [],
    limitN: number | null = null
  ): Promise<QuerySnapshot> {
    const parts = collectionId.split('/')
    let parentPath = ''
    let simpleCollectionId = collectionId

    if (parts.length > 1) {
      simpleCollectionId = parts[parts.length - 1]
      parentPath = `/${parts.slice(0, parts.length - 1).join('/')}`
    }

    const structuredQuery: Record<string, unknown> = {
      from: [{ collectionId: simpleCollectionId }],
    }

    if (where.length === 1) {
      structuredQuery.where = encodeFilter(where[0])
    } else if (where.length > 1) {
      structuredQuery.where = {
        compositeFilter: { op: 'AND', filters: where.map(encodeFilter) },
      }
    }

    if (order.length > 0) {
      structuredQuery.orderBy = order.map((o) => ({
        field: { fieldPath: o.field },
        direction: o.dir === 'asc' ? 'ASCENDING' : 'DESCENDING',
      }))
    }

    if (limitN !== null) {
      structuredQuery.limit = limitN
    }

    const url = `${getBaseUrl()}${parentPath}:runQuery`
    const res = await firestoreRequest('POST', url, { structuredQuery }) as unknown[]

    if (!Array.isArray(res)) return { docs: [], empty: true, size: 0 }

    const docs: FirestoreDoc[] = []
    for (const item of res) {
      const entry = item as Record<string, unknown>
      if (entry.document) {
        const restDoc = entry.document as Record<string, unknown>
        const name = restDoc.name as string
        const id = name.split('/').pop()!
        const ref = new DocRef(collectionId, id)
        docs.push(decodeDoc(restDoc, ref))
      }
    }

    return { docs, empty: docs.length === 0, size: docs.length }
  },

  async add(collectionId: string, data: FSData): Promise<DocRef> {
    const encoded = encodeDoc(data)
    const res = await firestoreRequest('POST', collectionPath(collectionId), encoded) as Record<string, unknown>
    const name = res.name as string
    const id = name.split('/').pop()!
    return new DocRef(collectionId, id)
  },

  async set(collectionId: string, docId: string, data: FSData, merge = false): Promise<void> {
    const encoded = encodeDoc(data)
    if (merge) {
      const fields = Object.keys(data)
      const mask = fields.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&')
      await firestoreRequest('PATCH', `${docPath(collectionId, docId)}?${mask}`, encoded)
    } else {
      await firestoreRequest('PATCH', docPath(collectionId, docId), encoded)
    }
  },

  async update(collectionId: string, docId: string, data: FSData): Promise<void> {
    const encoded = encodeDoc(data)
    const fields = Object.keys(data)
    const mask = fields.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&')
    await firestoreRequest('PATCH', `${docPath(collectionId, docId)}?${mask}`, encoded)
  },

  async delete(collectionId: string, docId: string): Promise<void> {
    await firestoreRequest('DELETE', docPath(collectionId, docId))
  },

  async count(collectionId: string, where: WhereClause[] = []): Promise<number> {
    const parts = collectionId.split('/')
    let parentPath = ''
    let simpleCollectionId = collectionId

    if (parts.length > 1) {
      simpleCollectionId = parts[parts.length - 1]
      parentPath = `/${parts.slice(0, parts.length - 1).join('/')}`
    }

    const structuredQuery: Record<string, unknown> = {
      from: [{ collectionId: simpleCollectionId }],
    }

    if (where.length === 1) {
      structuredQuery.where = encodeFilter(where[0])
    } else if (where.length > 1) {
      structuredQuery.where = {
        compositeFilter: { op: 'AND', filters: where.map(encodeFilter) },
      }
    }

    const url = `${getBaseUrl()}${parentPath}:runAggregationQuery`
    const res = await firestoreRequest('POST', url, {
      structuredAggregationQuery: {
        structuredQuery,
        aggregations: [{ count: {}, alias: 'count' }],
      },
    }) as unknown[]

    if (!Array.isArray(res) || res.length === 0) return 0
    const first = (res[0] as Record<string, unknown>).result as Record<string, unknown>
    if (!first) return 0
    const aggregateFields = first.aggregateFields as Record<string, RestValue> | undefined
    if (!aggregateFields?.count) return 0
    return Number(decodeValue(aggregateFields.count))
  },

  async batchWrite(writes: WriteOp[]): Promise<void> {
    if (writes.length === 0) return
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim()!
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:batchWrite`
    await firestoreRequest('POST', url, { writes: encodeWrites(writes, projectId) })
  },

  async runTransaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim()!
    const txUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:beginTransaction`
    const commitUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`

    const txRes = await firestoreRequest('POST', txUrl, {
      options: { readWrite: {} },
    }) as { transaction: string }
    const txId = txRes.transaction

    const ctx = new TransactionContext(txId)
    const result = await fn(ctx)

    const writes = ctx.getWrites()
    if (writes.length > 0) {
      await firestoreRequest('POST', commitUrl, {
        transaction: txId,
        writes: encodeWrites(writes, projectId),
      })
    } else {
      const rollbackUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:rollbackTransaction`
      await firestoreRequest('POST', rollbackUrl, { transaction: txId }).catch(() => {})
    }

    return result
  },
}

export type FirestoreDatabase = typeof firestoreDb
