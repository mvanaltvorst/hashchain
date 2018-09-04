# Hashchain
Hashchain is a web client that saves file hashes on the Ethereum blockchain. 
You can insert files with the web interface and you can also test whether you've already uploaded a file into
the blockchain.

## Web interface

<img src="https://github.com/mvanaltvorst/hashchain/blob/master/demo.png?raw=true" width=500>

## Building
```
git clone https://github.com/mvanaltvorst/hashchain.git
cd hashchain
npm install
truffle compile
```
You should change `truffle.js` if you want to deploy this to the main network. In this guide, we will continue using a local ganache blockchain. You can start a local ganache blockchain by opening a second terminal and running `ganache-cli`.
```
truffle migrate --network=ganache
webpack --mode=production
```
The resulting files will be located in the `build/` directory.
