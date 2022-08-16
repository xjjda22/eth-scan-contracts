// findVulContracts

const path = require('path');
require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const { providers, utils } = require("ethers");
const { Interface } = require("@ethersproject/abi");
const { addABI, getABIs } = require("abi-decoder");
const { EVM } = require("evm");
const { inspect }  = require('util');
const exec = require('child_process').exec;
const execute = (command, callback) => {
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const { INFURA_APIKEY, ARCHIVENODE_APIKEY, ETHERSCAN_APIKEY } = process.env;
const ETHERSCAN_ABI_ENDPOINT = a => `https://api.etherscan.io/api?module=contract&action=getabi&address=${a}&apikey=${ETHERSCAN_APIKEY}`;

// const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
// const ETHEREUM_RPC_URL = `https://goerli.infura.io/v3/${INFURA_APIKEY}`;
const ETHEREUM_RPC_URL = `https://api.archivenode.io/${ARCHIVENODE_APIKEY}`;

const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.getDefaultProvider(ETHEREUM_RPC_URL);

console.log('start --');
console.log('ETHEREUM_RPC_URL',ETHEREUM_RPC_URL);

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

const getBlockNumber = async (n, debug) => {
    const blockNumber = await provider.getBlockNumber();
    const blocksPerDay = 6600;
    LATEST_BLOCK = blockNumber;
    START_SCANNED_BLOCK = blockNumber - (n * blocksPerDay);
    if(debug) console.log('latest block',blockNumber);
    if(debug) console.log('blocks not scanned',START_SCANNED_BLOCK);
    readNumOfBlocks(START_SCANNED_BLOCK, 0, PENDING_BLOCK_SCANNED, 2000, true);
    return blockNumber;
}

const getBlock = async (blockNumber, debug) => {
    const block = await provider.getBlockWithTransactions(blockNumber);
    // if(debug) console.log('block',block);
    return block;
}
const getTx = async (hash, debug) => {
    const tx = await provider.getTransaction(hash);
    if(debug) console.log('tx--',tx);
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

const readBlock = async (blockNumber, debug) => {
    
    let contract_trs = [];
    if(debug) console.log('block',blockNumber);

    let block = await getBlock(blockNumber, true);
    let txs = block.transactions;
    let j=0;
    for(j=0;j<txs.length;j++){
        let t = txs[j];
        // if(debug) console.log('j',j);
        if(t.to == null || t.to == 0){
            let a = t.creates ? utils.getAddress(t.creates) : null;

            // if(debug) console.log('contract trx',t);
            // if(debug) console.log('contract add',a);    

            await execute(`myth analyze -c ${t.data} --execution-timeout 150 `, async (res) => {
                t.analyze = res;
                // if(res.length <= 67) return;

                if(debug) console.log('myth analyze contract ',res);
                // if(debug) console.log('myth analyze contract ',typeof res, res.length);
                if(debug) console.log('contract address',t.creates);

                let cobj = {
                    "block":t.blockNumber,
                    "hash": t.hash, 
                    "address": t.creates,
                    "byteCode": t.data,
                    // "opCodes": t.opCodes,
                    // "jumpDestinations": t.jumpDestinations,
                    // "interpretedCodes": t.interpretedCodes,
                    // "solCodes": t.interpretedCodes,
                    // "selfDestruct": t.selfDestruct,
                    "analyze": t.analyze

                }
                // let vulContractsArr = await require(`./json/vul-contracts-clones.json`);
                // vulContractsArr.push(cobj);
                // if(debug) console.log('vulContractsArr ',vulContractsArr);

                // // save vul contracts
                // await fs.writeFile(`${__dirname}/json/vul-contracts-clones.json`, JSON.stringify(vulContractsArr), console.error);

                // // save vul contract abi
                // await fs.writeFile(`${__dirname}/json/${t.blockNumber}-${t.creates}-vul.json`, JSON.stringify(t), console.error);
            })
        }
    }
}

const readTx = async (hash, debug) => {
    
    let contract_trs = [];
    if(debug) console.log('tx',hash);

    let t = await getTx(hash, true);
    if(t.to == null || t.to == 0){
        let a = t.creates ? utils.getAddress(t.creates) : null;

        // if(debug) console.log('contract trx',t);
        // if(debug) console.log('contract add',a);    

        await execute(`myth analyze -c ${t.data} --execution-timeout 150 `, async (res) => {
            t.analyze = res;
            // if(res.length <= 67) return;

            if(debug) console.log('myth analyze contract ',res);
            // if(debug) console.log('myth analyze contract ',typeof res, res.length);
            if(debug) console.log('contract address',t.creates);

            let cobj = {
                "block":t.blockNumber,
                "hash": t.hash, 
                "address": t.creates,
                "byteCode": t.data,
                // "opCodes": t.opCodes,
                // "jumpDestinations": t.jumpDestinations,
                // "interpretedCodes": t.interpretedCodes,
                // "solCodes": t.interpretedCodes,
                // "selfDestruct": t.selfDestruct,
                "analyze": t.analyze

            }
            // let vulContractsArr = await require(`./json/vul-contracts-clones.json`);
            // vulContractsArr.push(cobj);
            // if(debug) console.log('vulContractsArr ',vulContractsArr);

            // // save vul contracts
            // await fs.writeFile(`${__dirname}/json/vul-contracts-clones.json`, JSON.stringify(vulContractsArr), console.error);

            // // save vul contract abi
            // await fs.writeFile(`${__dirname}/json/${t.blockNumber}-${t.creates}-vul.json`, JSON.stringify(t), console.error);
        })
    }
    
}

const readNumOfBlocks = async (blockNumber, inc, num, inter, debug) => {
    setTimeout(() => {
        inc++;
        // if(debug) console.log('blockNumber' ,blockNumber+inc);
        blockNumber+inc < blockNumber+num ? readNumOfBlocks(blockNumber, inc, num, inter, debug) : null;
        readBlock(blockNumber+inc, true);
    },inter);
}

let LATEST_BLOCK = 0, START_SCANNED_BLOCK = 0, PENDING_BLOCK_SCANNED = 20000;

getBlockNumber(3, true);
// readNumOfBlocks(7298514-1, 0, 1, 2000, true);
// execute("echo -n 608060405260043610603f57600035 | evmasm -d", (o)=>{
//     console.log(o);
// })

//goerli
// readTx('0xd0595c674cdbec1f70645c10a6655f2651b0acce4e81b76857cb82a6022fd6e9', true)

module.exports = {
  readNumOfBlocks
}
return;

