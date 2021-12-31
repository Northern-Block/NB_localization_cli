module.exports = {
  common: {
    actions: {
      // SAME - Will be the same in 'es'
      next: "Next",
      // EXTRA - Will only be set in 'es'
      previous: undefined,
    },
    confirmations: {
      // SAME - Will *intentionally* be the same in 'es'
      no: "No",
      // MISSING - Will be missing in 'es' (single key)
      ok: "OK",
      yes: "Yes",
    },
  },
  // MISSING - Will be missing in 'es' (top-level)
  meta: {
    appName: "My App",
  },
  screens: {
    home: {
      title: "Home",
      // EMPTY - Will be empty in 'es'
      content: "This is some sample content",
    },
    // MISSING - Will be missing in 'es' (nested section)
    settings: {
      title: "Settings",
      logOutButton: "Log Out",
    },
  },
};
