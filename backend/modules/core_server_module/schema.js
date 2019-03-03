module.exports = {
    type: "object",
    properties: {
        id: {
            type: "number"
        },
        jsonrpc: {
            type: "string"
        },
        method: {
            type: "string"
        },
        params: {
            type: "object"
        }
    },
    required: ["id", "jsonrpc", "method"]
};
