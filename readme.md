Compose Classes! There are many like it, but this one is for _you_.

### Example with simplified Mongo collections

Consider a few basic interfaces into persistent storage:

```js
class Users {

  static get collection() { return db.collection('users') }

  static get schema() {
    return Joi.Object({
      name: Joi.string().required()
    })
  }

  static async findByName(name) { /* ... */ }

}


class Devices {

  static get collection() { return db.collection('devices') }

  static get schema() {
    return Joi.Object({
      started: Joi.bool().default(false)
    })
  }

  static async startAll() { /* ... */ }

}
```

Ok. Nice and lean.
We can keep them that way by encapsulating some common behavior:


```js
class CommonOperations {

  static assertSchema(data) {
    return Joi.attempt(data, this.schema)
  }

  static async create(data) {
    const newThing = CommonOperations.assertSchema(data)

    return this.collection.insertOne(newThing)
  }

  static async findById(id) {
    return this.collection.findOne({ id })
  }

  static async armageddon() {
    console.warn(`Removing all documents from ${this.collection}!`)
    return this.collection.remove({})
  }

}
```

Time to *beef* these up!:

```js
// Compose `CommonOperations` into our interfaces...
const BeefyUsers = compose([ CommonOperations ])(Users)
const BeefyDevices = compose([ CommonOperations ])(Devices)

// ...and we can make use of the common operations
const favoriteUser = await Users.findById(1)
const favoriteDevice = await Device.findById(12)

// For a more useful example:
const maru = { name: 'maru' }
const stemCellReactor = { started: false }

// CommonOperations delegates to the correct Class schema
await Users.create(maru)
await Devices.create(stemCellReactor)
```


### Less creative examples:

```js
class Target {

  static get targetGetter() { return '0' }

  static originalMethod() { return 0 }

}

class FirstSource {

  static get firstSourceGetter() { return '1' }

  static get overwritableGetter() { return 'first compose\'s getter' }

  static firstSourceMethod() { return 1234 }

  static overwritableMethod() { return 'first compose\'s method' }

}

class SecondSource {

  static get secondSourceGetter() { return '2' }

  static get overwritableGetter() { return 'second compose\'s getter' }

  static overwritableMethod() { return 'second compose\'s method' }

  static secondSourceMethod() { return 5678 }

}

// compose a class from multiple sources
const ComposedClass = compose([ FirstSource, SecondSource ])(Target)

// applies the static methods and getters of multiple source classes

Target.targetGetter
// -> '0'

Target.firstSourceGetter
// -> '1'

Target.secondSourceGetter
// -> '2'

Target.originalMethod()
// -> 0

Target.firstSourceMethod()
// -> 1234

Target.secondSourceMethod()
// -> 5678

// composed methods/getters with naming collisions supersede each other according to their position in the array
// the last composed class supersedes the first. à la reduce right:
Target.overwritableMethod()
// -> 'second compose\'s method'

// 'Multiple composed classes do not overwrite each other\'s methods or getters', () => {
FirstSource.overwritableGetter
// -> 'first compose\'s getter'

FirstSource.overwritableMethod()
// -> 'first compose\'s method'

SecondSource.overwritableGetter
// -> 'second compose\'s getter'

SecondSource.overwritableMethod()
// -> 'second compose\'s method'
