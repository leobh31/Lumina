const DB_NAME = 'lumina_reader_db';
const STORE_NAME = 'book_passages';
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function savePassagesToIndexedDB(bookId: string, passages: any[]): Promise<void> {
  try {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(passages, bookId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn("IndexedDB block or failure, falling back to LocalStorage:", err);
    try {
      localStorage.setItem(`lumina_passages_${bookId}`, JSON.stringify(passages));
    } catch (localErr) {
      console.error("Failed to save to LocalStorage fallback:", localErr);
    }
  }
}

export async function getPassagesFromIndexedDB(bookId: string): Promise<any[] | null> {
  try {
    const db = await initDB();
    const passages = await new Promise<any[] | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(bookId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
    if (passages && passages.length > 0) {
      return passages;
    }
  } catch (err) {
    console.warn("IndexedDB read failed, trying LocalStorage fallback:", err);
  }

  // LocalStorage Fallback
  try {
    const localData = localStorage.getItem(`lumina_passages_${bookId}`);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (localErr) {
    console.error("LocalStorage fallback read failed:", localErr);
  }
  return null;
}

export async function deletePassagesFromIndexedDB(bookId: string): Promise<void> {
  try {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(bookId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn("IndexedDB delete failed, trying LocalStorage:", err);
  }

  try {
    localStorage.removeItem(`lumina_passages_${bookId}`);
  } catch (localErr) {
    console.error("LocalStorage delete failed:", localErr);
  }
}
