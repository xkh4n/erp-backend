class Errors extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }
    getMessage() {
        return this.message
    }
}

module.exports = Errors;