const brands: Array<[RegExp, string]> = [
  [/\bAQUAKIT\b/i, "Aquakit"],
  [/\bBOSCH\b/i, "Bosch"],
  [/\bDIMAFLOW\b/i, "Dimaflow"],
  [/\bHOFFENS\b/i, "Hoffens"],
  [/\bREX\b/i, "Rex"],
  [/\bROMERAL\b/i, "Romeral"],
  [/\bSTRETTO\b/i, "Stretto"],
  [/\bVALKOLOR\b/i, "Valkolor"],
  [/\bWEBER\b/i, "Weber"],
  [/\bWELLOO?\b/i, "Wello"],
];

export function brandOf(name: string) {
  return brands.find(([pattern]) => pattern.test(name))?.[1] ?? null;
}
