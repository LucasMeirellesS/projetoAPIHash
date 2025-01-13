import { createServer } from 'node:http';
import url from 'node:url';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { stock }  from './stock.js';
import { URL } from 'node:url';
import  jsonBody  from 'body/json.js';

const server = createServer();

let productStock = [...stock];

// server.on('request', async (request, response) => {
//     const filePath = url.parse(request.url).pathname;
//     const processPath = process.cwd();

//     try{
//         await fs.stat(processPath + filePath);
//         const readStream =  createReadStream(processPath + filePath);
//         response.writeHead(200, {'Content-Type': 'text/html'});
//         readStream.pipe(response);
//     }catch{
//         response.writeHead(404, {'Content-Type': 'text/plain'});
//         response.write('File not found');
//         response.end();
//     }

// });

server.addListener('request', (request, response) => {
    const urlObject = new URL(`http://${request.headers.host}${request.url}`);
    if (urlObject.pathname === '/'){
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify(productStock));
        response.end();

    } else if (urlObject.pathname === '/get-unavaliable-products'){
        if(request.method === 'POST'){
            response.writeHead(405, {'Content-Type': 'text/plain'});
            response.write('Esse endpoint não permite o acesso por meio de uma requisição do tipo post');
            response.end();
        }
        const unavaliableProducts = productStock.filter(p => p.amountLeft === 0);
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify(unavaliableProducts));
        response.end();

    } else if (urlObject.pathname === '/get-avaliable-products'){
        const avaliableProducts = productStock.filter(p => p.amountLeft > 0);
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify(avaliableProducts));
        response.end();

    } else if (urlObject.pathname === '/get-by-id'){
        const idGetted = urlObject.searchParams.get('id');
        if(!idGetted || isNaN(idGetted)){
            response.writeHead(400, {'Content-Type': 'text/plain'});
            if(!idGetted){
                response.write('Id não informado');
            }
            if(isNaN(idGetted)){
                response.write('Informe um id numérico');
            }         
            response.end();
            return;
        }
        const selectedObject = productStock.find(product => product.id === Number(idGetted));
        if(!selectedObject){
            response.writeHead(400, {'Content-Type': 'text/plain'});
            response.write('Id não encontrado.');
            response.end();
            return;
        }
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify(selectedObject));
        response.end();
        return;

    } else if (urlObject.pathname === '/delete-by-id' && request.method === 'DELETE'){
        const idGetted = urlObject.searchParams.get('id');
        if(!idGetted || isNaN(idGetted)){
            response.writeHead(400, {'Content-Type': 'text/plain'});
            if(!idGetted){
                response.write('Id não informado');
            }
            if(isNaN(idGetted)){
                response.write('Informe um id numérico');
            }         
            response.end();
            return;
        }
        const selectedObject = productStock.find(product => product.id === Number(idGetted));
        if(!selectedObject){
            response.writeHead(400, {'Content-Type': 'text/plain'});
            response.write('Id não encontrado.');
            response.end();
            return;
        }

        productStock = productStock.filter( p => p.id !== Number(idGetted));

        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify(selectedObject ?? {}));
        response.end();
        return;
    } else if (urlObject.pathname === '/create' && request.method === 'POST'){
        jsonBody(request, response, (error, body)=> {
            if(error){
                response.writeHead(400, {'Content-Type': 'text/plain'});
                response.write('Erro ao processar a requisição.');
                response.end();
                return;
            }
            const { productName, amountLeft } = body;
            const newProduct = {
                id: productStock.length,
                productName,
                amountLeft,
            };
            productStock.push(newProduct);
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify(newProduct));
            response.end();
            return;
        })
    }

});

server.listen(8000);

