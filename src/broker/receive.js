const amqp = require("amqplib");
const { searchMovsCase } = require("../services/pupetter.service");

const queueNames = ['Broker1', 'Broker2', 'Broker3', 'Broker4'];


async function subscriber() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        for (let i = 0; i < queueNames.length; i++) {
            let queue = queueNames[i];
            await channel.assertQueue(queue, {
                // durable: false,
            });
            console.log("Esperando mensajes...", queue);
            channel.prefetch(1);
            channel.consume(queue, async (message) => {
                const data = JSON.parse(message.content.toString());
                try {
                    const result = await searchMovsCase(data);
                    console.log(result);
                } catch (error) {
                    console.error("Error en searchMovsCase:", error);
                } finally {
                    channel.ack(message);
                }
            });
        }
    } catch (error) {

    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

subscriber()