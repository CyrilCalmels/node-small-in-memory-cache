// @ts-check

const SmallInMemoryCache = require('.')

const cache = new SmallInMemoryCache({ maxEntries: 13, ttl: 5 * 1000 })

cache.set('a', 1)
cache.set('b', { b: 2 })
cache.set('c', 1564864)
cache.set('d', 'Hello World !')
cache.set('e', { nested: { again: 0 } })
cache.set('f', 70)
cache.set('g', 'Toto')
cache.set('h', 'Truc', 30 * 1000)
cache.set('i', 14)
cache.set('j', 149)
cache.set('k', 'Nothing')
cache.set('l', null)
cache.set('m', undefined)
cache.set('n', 0)

setTimeout(() => {
  console.log('======================================================')
  console.log(cache.get('a'))
  console.log(cache.get('b'))
  console.log(cache.__rawCache)
}, 15)

setTimeout(() => {
  console.log('======================================================')
  console.log(cache.get('b'))
  console.log(cache.__rawCache)
}, 5 * 1000)

setTimeout(() => {
  console.log('======================================================')
  console.log(cache.__rawCache)
}, 5 * 1000 + 15)