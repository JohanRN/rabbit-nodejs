const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } = require('../config/environments');
const { general } = require("../models/general.model");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

const clienteS3 = new S3Client({
    region: AWS_REGION.toString(),
    credentials: {
        accessKeyId: AWS_ACCESS_KEY.toString(),
        secretAccessKey: AWS_SECRET_KEY.toString()
    }
});

async function uploadFile(Bucket, Key, Body) {
    try {
        const parametrosSubida = {
            Bucket: Bucket,
            Key: Key,
            Body: fs.createReadStream(Body)
        };
        const comandoSubida = new PutObjectCommand(parametrosSubida);
        await clienteS3.send(comandoSubida);
        return new general(200, 'Upload file successfully', Key);
    } catch (error) {
        console.log(error);
        return new general(500, error.message);
    }
}

async function generateUrl(bucketName, objectKey, expirationInSeconds) {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });

        const url = await getSignedUrl(clienteS3, command, { expiresIn: expirationInSeconds });
        return new general(200, 'Generate file from URL successfully', url);
    } catch (error) {
        return new general(500, error.message);
    }
}




// async function run() {
//     const result = await uploadFile('s3-gps-files', 'senatiAlumnos/00340-2010-0-1802-JP-FC-01/1/res_2010003400180946000113583.doc', 'F:/Proyectos/Dotnet/rabbitmq-brokers/src/services/downloadFileTemp/senatiAlumnos/00340-2010-0-1802-JP-FC-01/1/res_2010003400180946000113583.doc')
//     // const result2 = await generateUrl('s3-gps-files', 'carpeta/subcarpeta/test.js', 5000)
//     console.log(result)
//     // console.log(result2)
// }

// run()
module.exports = {
    uploadFile,
    generateUrl,
};
