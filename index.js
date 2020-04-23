/* compose facilitator for class static methods/getters/properties
 * this WILL mutate the target class.
 * TODO: do not mutate the target class? test coverage.
 *
 * use: compose([ SourceClassA, SourceClassB ])(ClassToBeComposed)
 *
 * see test coverage for documentation
 */

const {
  defineProperty,
  getOwnPropertyNames,
  getOwnPropertySymbols,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  objectPrototype,
} = Object

function addProperty(receiver, provider, key) {
  const descriptor = getOwnPropertyDescriptor(provider, key)

  try { // Avoid failures from read-only properties
    defineProperty(receiver, key, descriptor)
  } catch (e) { /* silently ignore */ }
}

function getObjectKeys(object) {
  return [
    ...getOwnPropertyNames(object),
    ...getOwnPropertySymbols(object),
  ]
}

function composeStatics(targetClass, sourceClass) {

  if (typeof targetClass !== 'function' || typeof sourceClass !== 'function') {
    console.warn('compose requires functions as arguments')
    return targetClass
  }

  if (objectPrototype) {
    const inheritedClass = getPrototypeOf(sourceClass)
    if (inheritedClass && inheritedClass !== objectPrototype) {
      composeStatics(targetClass, inheritedClass)
    }
  }

  const targetKeys = new Set(getObjectKeys(targetClass))
  const composeableKeys = new Set(getObjectKeys(sourceClass))
  const composableKeys = new Set([...composeableKeys].filter((key) => !targetKeys.has(key)))

  composableKeys.forEach((key) => addProperty(targetClass, sourceClass, key))

  return targetClass
}


module.exports = (sourceClasses) => (
  (targetClass) => (
    sourceClasses.reduceRight((composedClass, sourceClass) => (
      composeStatics(composedClass, sourceClass)
    ), targetClass)
  )
)
