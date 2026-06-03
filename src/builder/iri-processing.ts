export function computeIRI(namespace: string, userInput: string) {
  return namespace.concat(userInput.replace(/\s/g, "_"))
}

export function isIRIValid(namespace: string, remainder = '') {
  try {
    new URL(namespace) // force namespace to be a valid URL
  } catch {
    return false
  }
  const iri = computeIRI(namespace, remainder)
  return new RegExp('^[^<>"`|{}^\\\x00-\x20]*$', 'g').test(iri)
}