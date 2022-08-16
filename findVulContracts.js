// findVulContracts

const path = require('path');
require('dotenv').config();

const { utils } = require("ethers");
const fs = require('fs');
const axios = require('axios');
const { Interface } = require("@ethersproject/abi");
const { addABI, getABIs } = require("abi-decoder");
const { EVM } = require("evm");

const { 
    provider, 
    deepLogs, 
    execute, 
    checkOp,
    getBlockNumber,
    getBlock,
    getTx,
    getABI,
}  = require('./utils');

console.log('start --');

let LATEST_BLOCK = 0, START_SCANNED_BLOCK = 0, PENDING_BLOCK_SCANNED = 20000;
const getlastestBlockNumber = async (n, debug) => {
    const blockNumber = await getBlockNumber();
    const blocksPerDay = 6600;
    LATEST_BLOCK = blockNumber;
    START_SCANNED_BLOCK = blockNumber - (n * blocksPerDay);
    if(debug) console.log('latest block',blockNumber);
    if(debug) console.log('blocks not scanned',START_SCANNED_BLOCK);
    readNumOfBlocks(START_SCANNED_BLOCK, 0, PENDING_BLOCK_SCANNED, 2000, true);
    return blockNumber;
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

getlastestBlockNumber(3, true);
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

