export interface PendingRecording {
  id: string
  blob: Blob
  fileName: string
  createdAt: number
}

const DB_NAME = 'scribehealth-pending'
const STORE_NAME = 'recordings'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function savePendingRecording(blob: Blob, fileName: string): Promise<string> {
  const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const record: PendingRecording = { id, blob, fileName, createdAt: Date.now() }
    const request = store.put(record)
    request.onsuccess = () => resolve(id)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function getPendingRecordings(): Promise<PendingRecording[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as PendingRecording[])
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function deletePendingRecording(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}
