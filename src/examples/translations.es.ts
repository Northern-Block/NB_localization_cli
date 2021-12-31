module.exports = {
  common: {
    actions: {
      // SAME - Will be the same in 'en'
      next: "Next",
      // EXTRA - Not present in 'en'
      previous: "Previo",
    },
    confirmations: {
      // SAME - Will *intentionally* be the same in 'en'
      no: "No",
      // MISSING - Will be present in 'en' (single key)
      ok: undefined,
      yes: "Sí",
    },
  },
  // MISSING - Will be present in 'en' (top-level)
  meta: undefined,
  screens: {
    home: {
      title: "Casa",
      // EMPTY - Will be filled in 'en'
      content: "",
    },
    // MISSING - Will be present in 'en' (nested section)
    settings: undefined,
  },
};
