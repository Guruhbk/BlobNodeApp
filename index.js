import express from "express";
import bodyParser from "body-parser";
import {
    fileTypeFromBuffer
} from "file-type";

const blobString = 'DefaultEndpointsProtocol=https;AccountName=blobfordemo123;AccountKey=8DOCWx8i4Bbj4bFQ0am5gqMW4ZO6/+fTmQP9l3oZFdvFty3CKLASTpnHu3LV2jSBMPvkCOd6+PB/+AStqps/FQ==;EndpointSuffix=core.windows.net';
const containerName = 'container1';

const app = express();
app.use(express.static('public'));
import multer from 'multer';
import {
    BlockBlobClient
} from '@azure/storage-blob'
import getStream from 'into-stream';
const inMemoryStorage = multer.memoryStorage();


app.use(bodyParser.json())

const uploadStrategy = multer({
    storage: inMemoryStorage
}).single('image');

const getBlockBlobClient = (blob) => {
    const blobService = new BlockBlobClient(blobString, containerName, blob)

    return blobService
}


app.post('/uploadImage', uploadStrategy, async (req, res) => {
    try {
        const
            blobName = req.file.originalname,
            blobService = getBlockBlobClient(blobName),
            stream = getStream(req.file.buffer),
            streamLength = req.file.buffer.length;

        const resp = await blobService.uploadStream(stream, streamLength);


        res.send({
            message: 'File uploaded to Azure Blob storage.'
        })

    } catch (e) {
        console.log(e)
        res.send(e)
    }
});

app.get('/getImage/:blobName', async (req, res) => {
    try {
        const blobService = getBlockBlobClient(req.params.blobName);
        const resp = await blobService.downloadToBuffer();
        const mimeInfo = await fileTypeFromBuffer(resp);

        res.setHeader("Content-Type", mimeInfo.mime);
        res.send(resp)


    } catch (e) {
        console.log()
        res.send(e.message)
    }
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Listening on port " + port);
});