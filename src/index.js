//@ts-check

class SmallInMemoryCache {
  #cache = /** @type {Record<string, { value: any, dateOfLeave?: number, createdAt: number }>} */({})
  #numberOfEntries = 0
  #maxEntries = /** @type {number | null} */(null)
  #ttl = /** @type {number | null} */(null)
  #cleaning = false
  #cleaningIntervalInMilliseconds = 500
  #lastClean = Date.now()

  /**
   * @param {object} parameters
   * @param {number=} parameters.maxEntries Maximum number of entries, there is no limit by default. If the maximum number of entries is reached, the oldest entry will be deleted.
   * @param {number=} parameters.ttl Duration in milliseconds before an entry is not valid anymore and so deleted, there is no ttl by default. If set all entries will have this ttl by default.
   */
  constructor({ maxEntries, ttl } = {}) {
    const sanitizedMaxEntries = Number(maxEntries)
    const sanitizedTtl = Number(ttl)
    this.#maxEntries = sanitizedMaxEntries > 0 ? sanitizedMaxEntries : null
    this.#ttl = sanitizedTtl > 0 ? sanitizedTtl : null
    this.#cleaningIntervalInMilliseconds = sanitizedTtl > 0 ? Math.min(this.#cleaningIntervalInMilliseconds, sanitizedTtl) : this.#cleaningIntervalInMilliseconds
  }

  get __rawCache() {
    return this.#cache
  }

  #cleanCache() {
    const now = Date.now()
    if (this.#cleaning) {
      return
    }
    this.#cleaning = true
    let numberToRemove = this.#maxEntries && this.#numberOfEntries > this.#maxEntries ? this.#numberOfEntries - this.#maxEntries : 0
    const elementsToRemove = /** @type {{ key: String, createdAt: number }[]} */([])
    for (let [key, { dateOfLeave, createdAt }] of Object.entries(this.#cache)) {
      if (!this.#cleaning) {
        return
      }
      if (dateOfLeave && now > dateOfLeave) {
        delete this.#cache[key]
        this.#numberOfEntries -= 1
        numberToRemove -= 1
      } else if (numberToRemove > 0) {
        if (elementsToRemove.length < numberToRemove) {
          elementsToRemove.push({ key, createdAt })
        } else {
          elementsToRemove.push({ key, createdAt })
          elementsToRemove.sort((a, b) => a.createdAt - b.createdAt)
          const numberOfElementsToRemove = elementsToRemove.length - numberToRemove
          if (numberOfElementsToRemove > 0) {
            elementsToRemove.splice(-numberOfElementsToRemove)
          }
        }
      }
    }
    if (numberToRemove > 0) {
      elementsToRemove.forEach(({ key }) => {
        delete this.#cache[key]
      })
      this.#numberOfEntries -= elementsToRemove.length
    }
    this.#lastClean = now
    this.#cleaning = false
  }

  #startCleaningIfNecessary() {
    if (Date.now() > this.#lastClean + this.#cleaningIntervalInMilliseconds || (this.#maxEntries && this.#numberOfEntries > this.#maxEntries)) {
      setTimeout(() => this.#cleanCache(), 0)
    }
  }

  /**
   * @param {string} key
   * @param {any} value
   * @param {number=} ttl Overwrite the default ttl, set 0 to have no ttl.
   * @returns {void}
   */
  set(key, value, ttl) {
    const now = Date.now()
    this.#cache[key] = { value, createdAt: now }
    this.#numberOfEntries += 1
    const sanitizedTtl = Number(ttl || this.#ttl)
    if (sanitizedTtl > 0) {
      this.#cache[key].dateOfLeave = now + sanitizedTtl
    }
    this.#startCleaningIfNecessary()
  }

  /**
   * @param {string} key
   * @returns {void}
   */
  delete(key) {
    if (this.#cache[key]) {
      this.#cleaning = false
      delete this.#cache[key]
      this.#numberOfEntries -= 1
    }
    this.#startCleaningIfNecessary()
  }

  /**
   * @param {string} key
   * @returns {any | undefined}
   */
  get(key) {
    const result = this.#cache[key]
    this.#startCleaningIfNecessary()
    if (!result || (result.dateOfLeave && result.dateOfLeave < Date.now())) {
      return undefined
    }
    return result.value
  }

  /**
   * @returns {void}
   */
  flush() {
    this.#cache = {}
  }
}

module.exports = SmallInMemoryCache