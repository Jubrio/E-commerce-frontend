export const slugify = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève accents
    .replace(/[^a-z0-9\s-]/g, '')                    // enlève caractères spéciaux
    .replace(/\s+/g, '-')                            // remplace espaces par -
    .replace(/-+/g, '-');                            // supprime tirets multiples
};