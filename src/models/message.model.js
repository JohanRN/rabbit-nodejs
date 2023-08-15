class Message {
    constructor(status, message, data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
    send(res) {
        res.status(this.status).json(this);
    }
}

module.exports = Message;