export abstract class SequencerBase<Item, Result> {
  /**
   *
   */
  constructor(emitter: any) {}

  run(
    _items: Item[],
    _callback: (item: Item) => Promise<Result>
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export class SequentialSequencer<Item, Result> extends SequencerBase<
  Item,
  Result
> {
  constructor(emitter: any) {
    super(emitter)
  }

  async run(
    items: Item[],
    callback: (item: Item) => Promise<Result>
  ): Promise<void> {
    for (const item of items) {
      await callback(item)
    }
  }
}

export class BinarySearchSequencer<Item, Result> extends SequencerBase<
  Item,
  Result
> {
  readonly isValid: (result: Result) => boolean

  constructor(emitter: any, isValid: (result: Result) => boolean) {
    super(emitter)
    this.isValid = isValid
  }

  async run(
    items: Item[],
    callback: (item: Item) => Promise<Result>
  ): Promise<void> {
    let left = 0
    let right = items.length - 1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const item = items[mid]
      if (!item) {
        break
      }
      const result = await callback(item)
      if (this.isValid(result)) {
        // Go left
        right = mid - 1
      } else {
        // Go right
        left = mid + 1
      }
    }
  }
}
