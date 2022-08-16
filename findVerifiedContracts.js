// findVerifiedContracts
const path = require('path');
require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const { utils } = require("ethers");

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

const getLastestBlockNumber = async (n, debug) => {
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

    let block = await getBlock(blockNumber);
    let txs = block.transactions;
    let j=0;
    for(j=0;j<txs.length;j++){
        let t = txs[j];
        // if(debug) console.log('j',j);
        if(t.to == null || t.to == 0){
            // if(debug) console.log('contract trx',t);
            let a = t.creates ? utils.getAddress(t.creates) : null;
            if(debug) console.log('contract add',a);
            if(a) {
                let abi_res = await getABI(a, true);
                if(abi_res.status == '1'){
                    let ABI = JSON.parse(abi_res.result);
                    t.ABI = ABI;
                    // if(debug) console.log('contract etherscan abi', ABI);
                    contract_trs.push(t);
                } 
            }
        }
    }
    if(debug) console.log('contract creation trxs', deepLogs(contract_trs));
    if(contract_trs.length > 0){
        contract_trs.map( async c => {
            let cobj = {
                "block":c.blockNumber,
                "hash": c.hash, 
                "address": c.creates
            }
            // let verifiedContractsArr = await require(`./json/verified-contracts-clones.json`);
            // verifiedContractsArr.push(cobj);
            // if(debug) console.log('verifiedContractsArr ',verifiedContractsArr);

            // save verified contracts
            // await fs.writeFile(`${__dirname}/json/verified-contracts-clones.json`, JSON.stringify(verifiedContractsArr), console.error);

            // save verified contract abi
            // await fs.writeFile(`${__dirname}/json/${c.blockNumber}-${c.creates}.json`, JSON.stringify(c.ABI), console.error);

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

getLastestBlockNumber(3, true);
// readNumOfBlocks(14203083-1, 0, 1, 2000, true);

module.exports = {
  readNumOfBlocks
}
return;

