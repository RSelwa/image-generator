export type ConstantValues<T extends Record<string, string>> = T[keyof T]
