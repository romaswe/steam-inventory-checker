module.exports = {
  pwa: {
    name: "My App",
    themeColor: "#4DBA87",
    msTileColor: "#000000",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    workboxOptions: {
      // Skip waiting and take control of the page immediately
      skipWaiting: true,
      clientsClaim: true,
    },
    manifestOptions: {
      short_name: "MyApp",
      start_url: ".",
      display: "standalone",
      background_color: "#ffffff",
    },
  },
};
