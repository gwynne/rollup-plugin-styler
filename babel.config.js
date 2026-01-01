export default api => {
  api.cache.invalidate(() => process.env.NODE_ENV === "production");

  const presets = [["@babel/preset-env", { targets: { node: "current" } }]];
  const plugins = [];

  return { presets, plugins };
};
