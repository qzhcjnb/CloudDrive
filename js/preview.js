window.CloudDrivePreview = (() => {
  const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
  return { canPreview: item => item.type === "file" && imageExtensions.has(item.extension) };
})();
