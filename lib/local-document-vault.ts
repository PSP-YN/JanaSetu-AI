const DB_NAME = "janasetu-local-documents";
const STORE = "files";
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Local document store unavailable."));
  });
}
export async function saveLocalDocument(id: string, file: File | Blob, name: string, type: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ id, name, type, blob: file });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Could not save document locally."));
  });
  db.close();
}
export async function getLocalDocuments(): Promise<Array<{id:string;name:string;type:string;blob:Blob}>> {
  const db = await openDb();
  const records = await new Promise<Array<{id:string;name:string;type:string;blob:Blob}>>((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("Could not read local documents."));
  });
  db.close();
  return records;
}
export async function deleteLocalDocument(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error || new Error("Could not remove local document."));
  });
  db.close();
}
export async function replaceLocalDocuments(items: Array<{id:string;name:string;type:string;data:string}>): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"), store = tx.objectStore(STORE);
    store.clear();
    for (const item of items) {
      const binary = atob(item.data), bytes = new Uint8Array(binary.length);
      for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
      store.put({ id:item.id, name:item.name, type:item.type, blob:new Blob([bytes],{type:item.type}) });
    }
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error || new Error("Could not restore local documents."));
  });
  db.close();
}
export async function clearLocalDocuments(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error || new Error("Could not clear local documents."));
  });
  db.close();
}
