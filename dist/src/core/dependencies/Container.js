"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Container {
    static register(key, instance) {
        this.instances.set(key, instance);
    }
    static resolve(key) {
        const instance = this.instances.get(key);
        if (!instance)
            throw new Error(`Dependency ${key} not found!`);
        return instance;
    }
    static clear() {
        this.instances.clear();
    }
}
Container.instances = new Map();
exports.default = Container;
