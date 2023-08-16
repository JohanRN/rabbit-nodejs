const amqp = require('amqplib');
const { runQuery } = require("../services/mysql.service")
const queueNames = ['Broker1', 'Broker2', 'Broker3', 'Broker4'];

var nameMonths = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
var date = new Date()

let chunkSize = 0
let arrayGeneralCase = []

function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
async function createArrayAllCases() {
    try {
        const params = [null, null, null]
        let arraySubscription = await runQuery("Call sp_suscripciones_Listar(?)", params);
        arraySubscription = arraySubscription.filter(e => e.cSsi_Estado == 'ED01');
        for (let i = 0; i < arraySubscription.length; i++) {
            let cSsi_BD = arraySubscription[i].cSsi_BD;
            let cSsi_Cuenta = 'http://' + arraySubscription[i].cSsi_Cuenta + ".gpslegal.pe";
            let arrayCases = await runQuery("Call " + cSsi_BD + ".ca_sp_Listar_Casos(?)", [null]);
            if (typeof arrayCases == 'object') {
                for (let e = 0; e < arrayCases.length; e++) {
                    let boddyData = {
                        NameDB: cSsi_BD,
                        fullUrl: cSsi_Cuenta,
                        CodigoExterno: arrayCases[e].cCas_Cod_Externo,
                        cFecha: date.getDate() + " de " + nameMonths[date.getMonth()] + " de " + date.getFullYear(),
                        nCas_Id: arrayCases[e].nCas_Id
                    }
                    arrayGeneralCase.push(boddyData)
                }
            }
        }
        chunkSize = Math.ceil(arrayGeneralCase.length / 4);
    } catch (error) {
        return error.message;
    }
}
async function runSendBrokers() {
    try {
        await createArrayAllCases()
        console.log(arrayGeneralCase.length)
        console.log(chunkSize)
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel();
        for (let i = 0; i < queueNames.length; i++) {
            const queue = queueNames[i];
            await channel.assertQueue(queue, {
                durable: true
            })
            channel.prefetch(1);
            const chunkedArrays = chunkArray(arrayGeneralCase, chunkSize);
            for (let e = 0; e < chunkedArrays[i].length; e++) {
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(chunkedArrays[i][e])))
                console.log(queue, i, `Send Menssage: ${new Date().toISOString()}`)
            }
        }

    } catch (error) {
        return error.message;
    } finally {
        setTimeout(() => {
            process.exit()
        }, 1000);
    }
}


runSendBrokers()
