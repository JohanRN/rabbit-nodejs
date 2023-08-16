const amqp = require("amqplib");
const { searchMovsCase } = require("../services/pupetter.service");

async function subscriber() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        let queue = "Broker4";
        await channel.assertQueue(queue, {
            // durable: false,
        });
        console.log("Esperando mensajes...");
        channel.prefetch(1);
        channel.consume(queue, async (message) => {
            const data = JSON.parse(message.content.toString());
            try {
                const result = await searchMovsCase(data);
                console.log("OK", result);
            } catch (error) {
                console.error("Error en searchMovsCase:", error);
            } finally {
                channel.ack(message);
            }
        });
    } catch (error) {

    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

subscriber()