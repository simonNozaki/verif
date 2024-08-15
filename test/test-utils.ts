import type { ComponentDictionary, ComponentKey, ComponentRegistry } from '../src/registry'
import type { VueFileName } from '../src/util';

export class MockComponentRegistry implements ComponentRegistry {
  private readonly components: ComponentDictionary
  constructor(props: Record<string, VueFileName>) {
    this.components = props
  }

  get(key: ComponentKey): VueFileName {
    return this.components[key]
  }

  set(key: string, value: VueFileName): void {
    this.components[key] = value
  }

  setAll(entries: ComponentDictionary): void {
    Object.assign(this.components, entries)
  }
}
