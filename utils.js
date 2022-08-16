//utils

const path = require('path');
require('dotenv').config();

const { inspect }  = require('util');
const { providers, utils } = require("ethers");
const axios = require('axios');

const exec = require('child_process').exec;
const execute = (command, callback) => {
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const checkOp = (codes, op) => {
    let i = 0;
    const cl = codes.length;
    for (i = 0; i < cl; i++) {
        let st = codes[i].split(':');
        let opcode = st[1] ? st[1].trim() : null;
        if(opcode === op) {
            return true;
        } 
    }
    return false;
}


const { INFURA_APIKEY, ARCHIVENODE_APIKEY, ETHERSCAN_APIKEY } = process.env;
const ETHERSCAN_ABI_ENDPOINT = a => `https://api.etherscan.io/api?module=contract&action=getabi&address=${a}&apikey=${ETHERSCAN_APIKEY}`;

// const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
const ETHEREUM_RPC_URL = `https://api.archivenode.io/${ARCHIVENODE_APIKEY}`;
console.log('ETHEREUM_RPC_URL',ETHEREUM_RPC_URL);

const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.getDefaultProvider(ETHEREUM_RPC_URL);

const getBlockNumber = async (n, debug) => {
    const blockNumber = await provider.getBlockNumber();
    // if(debug) console.log('latest block',blockNumber);
    return blockNumber;
}

const getBlock = async (blockNumber, debug) => {
    const block = await provider.getBlockWithTransactions(blockNumber);
    // if(debug) console.log('block',block);
    return block;
}
const getTx = async (hash, debug) => {
    const tx = await provider.getTransaction(hash);
    // if(debug) console.log('tx--',tx);
    return tx;
}

const getABI = async (a, debug) => {
  
  const api_url = ETHERSCAN_ABI_ENDPOINT(a);
  // if(debug) console.log('api -- ',api_url);

  const config = {
    timeout: 30000,
    url: api_url,
    method: 'get',
    responseType: 'json'
  };
  const res = await axios(config);
  const data = res.data;
  // if(debug) console.log('data -- ',api_url, deepLogs(data) );
  if(debug) {
    if(res.status != 200) console.log('res --', deepLogs(data) );
  }
  return data;
}

module.exports = {
  provider,
  execute,
  deepLogs,
  checkOp,
  getBlockNumber,
  getBlock,
  getTx,
  getABI,
}
return;