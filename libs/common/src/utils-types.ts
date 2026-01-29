export type ConstantValues<T extends Record<string, string>> = T[keyof T]
export type ConstantKeys<T extends Record<string, string>> = keyof T
