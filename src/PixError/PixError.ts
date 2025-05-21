export class PixError<T = unknown> extends Error {
    parent?: T;

    constructor(message: string, parent?: T) {
        if (parent instanceof Error) {
            message += '\n' + parent.message;
        }

        super(message);

        if (parent) this.parent = parent;
    }
}