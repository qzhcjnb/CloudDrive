window.CloudDriveStorage = (() => {
  const prefix = "clouddrive:";
  const get = (key, fallback = null) => { try { const value = localStorage.getItem(prefix + key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } };
  const set = (key, value) => { try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch { /* Storage may be unavailable. */ } };
  const remove = key => { try { localStorage.removeItem(prefix + key); } catch { /* no-op */ } };
  return { get, set, remove };
})();
