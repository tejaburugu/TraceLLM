import { randomUUID } from "node:crypto";
export function createId(prefix) {
    return `${prefix}_${randomUUID()}`;
}
//# sourceMappingURL=ids.js.map