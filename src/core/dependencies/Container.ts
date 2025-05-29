export default class Container {
  private static instances = new Map<string, unknown>();

  static register<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  static resolve<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) throw new Error(`Dependency ${key} not found!`);
    return instance as T;
  }

  static clear(): void {
    this.instances.clear();
  }
}