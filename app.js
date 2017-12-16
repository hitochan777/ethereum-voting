// @format

const ganache = require('ganache-cli');
const solc = require('solc');
const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3('http://localhost:8545');

web3.eth.getAccounts().then(accs => {
  const accounts = accs;
  const code = fs.readFileSync('Voting.sol').toString();
  const compiledCode = solc.compile(code);
  console.log(compiledCode.contracts[':Ballot'].interface);
  const abiDefinition = JSON.parse(compiledCode.contracts[':Ballot'].interface);
  const BallotContract = new web3.eth.Contract(abiDefinition);
  const byteCode = compiledCode.contracts[':Ballot'].bytecode;

  BallotContract.deploy({
    data: byteCode,
    arguments: [
      [
        web3.utils.asciiToHex('Bulbasaur'),
        web3.utils.asciiToHex('Charmander'),
        web3.utils.asciiToHex('Squirtle'),
      ],
    ],
  })
    .send({from: accounts[0], gas: 10000000})
    .then(instance => {
      console.log('Contract Address:', instance._address);
      return instance.methods
        .giveRightToVote(accounts)
        .send({from: accounts[0], gas: 1000000})
        .then(() => {
          return instance;
        });
    });
});
