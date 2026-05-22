import { HttpError } from "./httpError.js";
export function requireStringParam(value, name) {
    if (typeof value !== "string" || !value.trim()) {
        throw new HttpError(400, `Missing or invalid route parameter: ${name}`);
    }
    return value.trim();
}
//# sourceMappingURL=request.js.map