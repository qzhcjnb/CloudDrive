window.CloudDriveDownload = (() => {
  function proxied(url, proxy) { return proxy.prefix.replace(/\/?$/, "/") + String(url).replace(/^https?:\/\//, ""); }
  function open(url) { window.open(url, "_blank", "noopener,noreferrer"); }
  function official(item) { if (item.downloadUrl) open(item.downloadUrl); }
  function accelerated(item) {
    const proxies = (CONFIG.downloadProxies || []).filter(proxy => proxy.name && proxy.prefix);
    if (!item.downloadUrl) return;
    if (proxies.length === 1) open(proxied(item.downloadUrl, proxies[0]));
    else if (proxies.length > 1) document.dispatchEvent(new CustomEvent("clouddrive:proxy-choice", { detail: { item, proxies } }));
    else document.dispatchEvent(new CustomEvent("clouddrive:notice", { detail: "尚未配置加速线路，已为你保留官方下载。" }));
  }
  return { official, accelerated, proxied, open };
})();
