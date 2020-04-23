const compose = require('../index.js')

describe('compose', () => {

  describe('when a single class is composed into another', () => {
    const genTargetClass = () => (
      class Target {

        static get name() { return 'target class name' }

        static originalMethod() { return 'i shouldn\'t change' }

      }
    )

    const genSourceClass = () => (
      class Source {

        static get isComposed() { return true }

        static get name() { return 'Source name' }

        static setComposedProps() { this.composedProp = 'abc' }

        static sourceMethod() { return 'ima compose\'s method' }

        static originalMethod() { return 12345 }
      }
    )

    test('applies the static methods and getters of a source class to a target class', () => {
      const Target = genTargetClass()
      const Source = genSourceClass()
      compose([ Source ])(Target)

      expect(Target.isComposed).toBe(true)
      expect(Target.sourceMethod()).toBe(Source.sourceMethod())
    })

    test('composed methods assign props only to the original class \'this\'', () => {
      const Target = genTargetClass()
      const Source = genSourceClass()
      compose([ Source ])(Target)

      expect(Source.composedProp).toBe(undefined)
      Source.setComposedProps()
      expect(Source.composedProp).toBe('abc')

      expect(Target.composedProp).toBe(undefined)
      Target.setComposedProps()
      expect(Target.composedProp).toBe('abc')
    })

    test('the source class does not overwrite target classes methods or getters', () => {
      const Target = genTargetClass()
      const Source = genSourceClass()
      compose([ Source ])(Target)

      const originalTargetName = Target.name
      const originalSourceAName = Source.name

      const originalTargetMethodReturn = Target.originalMethod()
      const originalSourceAMethodReturn = Source.originalMethod()

      expect(Target.name).not.toBe(originalSourceAName)
      expect(Target.name).toBe(originalTargetName)
      expect(Source.name).toBe(originalSourceAName)

      expect(Target.originalMethod()).not.toBe(Source.originalMethod())
      expect(Target.originalMethod()).toBe(originalTargetMethodReturn)
      expect(Source.originalMethod()).toBe(originalSourceAMethodReturn)
    })
  })

  describe('when composing in multiple classes', () => {
    const genTargetClass = () => (
      class Target {

        static get targetGetter() { return '0' }

        static originalMethod() { return 0 }

      }
    )

    const genFirstSource = () => (
      class FirstSource {

        static get firstSourceGetter() { return '1' }

        static get overwritableGetter() { return 'first compose\'s getter' }

        static firstSourceMethod() { return 1234 }

        static overwritableMethod() { return 'first compose\'s method' }

      }
    )

    const genSecondSource = () => (
      class SecondSource {

        static get secondSourceGetter() { return '2' }

        static get overwritableGetter() { return 'second compose\'s getter' }

        static overwritableMethod() { return 'second compose\'s method' }

        static secondSourceMethod() { return 5678 }

      }
    )


    test('applies the static methods and getters of multiple source classes to a target class', () => {
      const Target = genTargetClass()
      const FirstSource = genFirstSource()
      const SecondSource = genSecondSource()

      compose([ FirstSource, SecondSource ])(Target)

      expect(Target.targetGetter).toBe('0')
      expect(Target.firstSourceGetter).toBe('1')
      expect(Target.secondSourceGetter).toBe('2')

      expect(Target.originalMethod()).toBe(0)
      expect(Target.firstSourceMethod()).toBe(1234)
      expect(Target.secondSourceMethod()).toBe(5678)
    })

    test('composes methods/getters supersede each other according to their position in the array (last compose supersedes first)', () => {
      const Target = genTargetClass()
      const FirstSource = genFirstSource()
      const SecondSource = genSecondSource()

      compose([ FirstSource, SecondSource ])(Target)

      expect(Target.overwritableMethod()).toBe('second compose\'s method')
    })

    test('multiple composes, when being mixed in to a target, do not overwrite each other\'s methods or getters', () => {
      const Target = genTargetClass()
      const FirstSource = genFirstSource()
      const SecondSource = genSecondSource()

      compose([ FirstSource, SecondSource ])(Target)

      expect(FirstSource.overwritableGetter).toBe('first compose\'s getter')
      expect(FirstSource.overwritableMethod()).toBe('first compose\'s method')

      expect(SecondSource.overwritableGetter).toBe('second compose\'s getter')
      expect(SecondSource.overwritableMethod()).toBe('second compose\'s method')
    })
  })

})
