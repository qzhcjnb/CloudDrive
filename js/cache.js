/* CloudDrive index cache — IndexedDB instead of localStorage.
   Release asset indexes for large repositories exceed the ~5 MB localStorage
   quota, and localStorage writes fail silently. IndexedDB has a far larger
   quota and structured-clones objects without a JSON string round-trip. */

window.CloudDriveCache = (() => {
  const DB_NAME = "clouddrive";
  const DB_VERSION = 1;
  const STORE = "index";
  let dbPromise = null;

  function supported() { return typeof indexedDB !== "undefined"; }

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!supported()) { reject(new Error("此浏览器不支持 IndexedDB。")); return; }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("无法打开本地索引库。"));
      request.onblocked = () => reject(new Error("本地索引库被其他标签页占用。"));
    }).catch(error => {
      dbPromise = null;
      throw error;
    });
    return dbPromise;
  }

  function run(mode, work) {
    return open().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      let result;
      try { result = work(store); } catch (error) { reject(error); return; }
      tx.oncomplete = () => resolve(result && result.result !== undefined ? result.result : undefined);
      tx.onerror = () => reject(tx.error || new Error("本地索引库事务失败。"));
      tx.onabort = () => reject(tx.error || new Error("本地索引库事务中止。"));
    }));
  }

  async function read(key) {
    try {
      return (await run("readonly", store => store.get(key))) || null;
    } catch {
      return null; // Cache misses and unavailable storage are both non-fatal.
    }
  }

  async function write(key, value) {
    try {
      await run("readwrite", store => store.put(value, key));
      return { ok: true, message: "" };
    } catch (error) {
      const quota = error && (error.name === "QuotaExceededError" || error.name === "QUOTA_EXCEEDED_ERR");
      return {
        ok: false,
        message: quota
          ? "本地索引空间不足，本次结果未缓存（不影响浏览）。"
          : "本地索引写入失败，本次结果未缓存（不影响浏览）。"
      };
    }
  }

  async function remove(key) {
    try { await run("readwrite", store => store.delete(key)); return true; } catch { return false; }
  }

  async function estimate() {
    try {
      if (!navigator.storage || !navigator.storage.estimate) return null;
      const { usage, quota } = await navigator.storage.estimate();
      return { usageBytes: usage, quotaBytes: quota };
    } catch {
      return null;
    }
  }

  return { read, write, remove, estimate, supported };
})();
