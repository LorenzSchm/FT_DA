function createServerStorage() {
  const values = new Map();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.has(String(key)) ? values.get(String(key)) : null;
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key) {
      values.delete(String(key));
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
  };
}

function ensureServerStorage(name) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  const hasInvalidAccessor = descriptor?.get && descriptor.configurable;
  const hasInvalidValue =
    descriptor?.value && typeof descriptor.value.getItem !== "function";

  if (!descriptor || hasInvalidAccessor || hasInvalidValue) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: createServerStorage(),
      writable: true,
    });
  }
}

export function register() {
  if (typeof window === "undefined") {
    ensureServerStorage("localStorage");
    ensureServerStorage("sessionStorage");
  }
}
