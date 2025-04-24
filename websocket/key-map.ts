export class KeyMap<K, V> {
    private map = new Map<string, V>();

    private serializeKey(key: K): string {
        return JSON.stringify(key);
    }

    set(key: K, value: V): void {
        this.map.set(this.serializeKey(key), value);
    }

    get(key: K): V | undefined {
        return this.map.get(this.serializeKey(key));
    }

    has(key: K): boolean {
        return this.map.has(this.serializeKey(key));
    }

    delete(key: K): boolean {
        return this.map.delete(this.serializeKey(key));
    }
}
