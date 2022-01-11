# Documentation

This file is a home for the documentation of this repo's tech stack.

## React Router

Currently used to routes URL paths. Eventual move to Next.js is an option.

https://reactrouter.com/docs/en/v6/getting-started/tutorial

## styled-components

Used for base-layer CSS

## Hardhat

Used for testing Ethereum smart contracts

## The Graph

Not used yet, but might be useful for indexing some of the CentralDex functions, like getting all available exchanges. We'll not want to call this directly from the contract each time, but will want to refresh at least daily. I think The Graph helps with this.

https://thegraph.com/docs/en/developer/quick-start/

## Testing The Graph

### Unit Tests

Find tests in the packages/subgraph/tests

These use mocha and can be run with `graph test <PATH_TO_TEST_FILE>.js`

### Running a Local graph-node

https://github.com/graphprotocol/graph-node/blob/master/docs/getting-started.md

**Prerequisites**

1. Install IPFS: https://docs.ipfs.io/install/command-line/#official-distributions
2. Install PostgreSQL: https://www.postgresql.org/download/
3. Run a local Ethereum node (same you use to test with Hardhat, can use Ganache, geth, or parity)

**To Start Local Node**

1. `ipfs init`
2. `ipfs daemon`
3. (Pick a directory to keep the database, desktop suggested. This is also where the graph-node clone and cargo file will be installed.)
   ````
   cd ~/Desktop
   initdb -D .postgres
   pg_ctl -D .postgres -l logfile start
   createdb <POSTGRES_DB_NAME>```
   ````
   \*Note: If you get an error upon the `pg_ctl` command saying port 5432 is in use, DO NOT `kill -9 <PID>`. This can lead to data corruption. Look for the postgres instance that is running and shut it down properly. This may for example be done by `brew services stop postgres` if you had previously run `brew services start postgres`.
4. `git clone https://github.com/graphprotocol/graph-node && cd graph-node && cargo build`
5. ```
   cargo run -p graph-node --release -- \
   --postgres-url postgresql://<USERNAME><:PASSWORD>@localhost:5432/<POSTGRES_DB_NAME> \
   --ethereum-rpc <ETHEREUM_NETWORK_NAME>:127.0.0.1:8545 \
   --ipfs 127.0.0.1:5001 \
   --debug
   ```
   \*Notes: If you are using Ganache, 7545 is likely the host port instead of 8545. Username and password will likely default to your desktop username and password. ETHEREUM_NETWORK_NAME usually mainnet.
6. Create subgraph: `npx graph create --node http://localhost:8020 <SUBGRAPH_NAME>`
7. Deploy subgraph to locally running Graph node: `npx graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 <SUBGRAPH_NAME>`
8. Or, just use the provided Docker container (`cd graph-node/docker && docker-compose up`) to replace steps 1-3 and 5.

## Ethers Project

Client-side library for interacting with smart contracts. Purposefully chosen over web3.

## React Hook Forms

https://react-hook-form.com/get-started#Quickstart
