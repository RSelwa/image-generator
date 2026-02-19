const win = {
    search: () => (typeof window !== "undefined" ? window.location.search : ""),
    isBrowser: () => typeof window !== "undefined",
    innerWidth: () => (typeof window !== "undefined" ? window.innerWidth : 0),
    origin: () => (typeof window !== "undefined" ? window.location.origin : ""),
    protocol: () =>
        typeof window !== "undefined" ? window.location.protocol : ""
}

export const getItemFromLocalStorage = <T>(key: string, fallback?: T): T => {
    if (!win.isBrowser())
        return fallback as T

    const item = localStorage.getItem(key)
    if (item)
        return JSON.parse(item) as T

    return fallback as T
}


export const setItemInLocalStorage = <T>(key: string, value: T) => {
    if (!win.isBrowser())
        return
    localStorage.setItem(key, JSON.stringify(value))
}
