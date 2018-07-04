
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const REST_API = 'http://127.0.0.1:8008';
const IPFS_API = 'http://127.0.0.1:8080';
const axios = require('axios');
const retry = require('async/retry');

app.use(cors());
app.use(bodyParser.raw({type: 'application/octet-stream', limit: '50MB'}));

const PORT = 3010;

const doRetry = async (times, method, args, done) => {
    const exponential = (retryCount) => {return 50 * Math.pow(2, retryCount)}
    const opts = {times, interval: exponential};
    const retryMethod = async () => {return await method(...args)};
    retry(opts, retryMethod, done);
}

app.get('/state', (req, res) => {
        const uri = `${REST_API}${req.originalUrl}`;
        console.log("STATE QUERY: ", uri)
        const done = (err, response) => {
            if(err) {
                console.log(err)
                res.status(500).json({error: err.message});
            } 
            res.status(response.status).json(response.data)
        }
        doRetry(10, axios, [{method: 'get', url: uri, headers: {'Content-Type': 'application/json'}}], done);
})

app.get('/ipfs/:hash', (req, res) => {
    const uri = `${IPFS_API}${req.originalUrl}`;
    console.log("IPFS QUERY: ", uri)
    const done = (err, response) => {
        if(err) {
            console.log(err)
            res.status(500).json({error: err.message});
        } 
        res.status(response.status).json(response.data)
    }

    doRetry(10, axios, [{method: 'get', url: uri, headers: {'Content-Type': 'application/json'}}], done);
})

app.get('/batch_statuses', (req, res) => {
    const uri = `${REST_API}${req.originalUrl}`;
    console.log(uri)
    const done = (err, response) => {
        if(err) {
            res.status(500).json({error: err.message});
        } 
        res.status(response.status).json(response.data)
    }

    doRetry(10, axios, [{method: 'get', url: uri, headers: {'Content-Type': 'application/json'}}], done);
})

app.post('/batches', (req, res) => {
    const done = (err, response) => {
        if(err) res.status(500).json({error: err.message});
        let {link} = response.data;
        res.status(200).json({link: link.toString().replace('127.0.0.1:8008', `127.0.0.1:${PORT}`)});
    }

    doRetry(5, axios, [{method: 'post', url: `${REST_API}${req.originalUrl}`, data: req.body, headers: {'Content-Type': 'application/octet-stream'}}], done);
})

app.listen(PORT, () => console.log('Proxy Server Listening on Port 3010'));

// alias docker-start="sudo systemctl start docker"
// ubuntu@ip-172-31-95-236:~$ alias start-chain="sudo make network_up"
// ubuntu@ip-172-31-95-236:~$ alias build-chain="sudo make docker_build"
// ubuntu@ip-172-31-95-236:~$ alias stop-chain="sudo make network_down"
// ubuntu@ip-172-31-95-236:~$ alias docker-stop="sudo systemctl stop docker"
