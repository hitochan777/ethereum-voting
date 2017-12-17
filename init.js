// @format

const ganache = require('ganache-cli');
const solc = require('solc');
const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3('http://localhost:8545');

web3.eth.getAccounts().then(accs => {
  // ブロックチェーン上のアカウント(アドレス)をすべて取得
  const accounts = accs;
  const code = fs.readFileSync('Ballot.sol').toString();
  const compiledCode = solc.compile(code); // Ballot.solをコンパイル
  console.log(compiledCode.contracts[':Ballot'].interface); //
  const abiDefinition = JSON.parse(compiledCode.contracts[':Ballot'].interface); // コントラクトにどういうメソッドが存在するか
  const BallotContract = new web3.eth.Contract(abiDefinition); // コントラクトに関する情報やメソッドを含む
  const byteCode = compiledCode.contracts[':Ballot'].bytecode; // ブロックチェーンに実際にデプロイされるバイトコード

  // ブロックチェーンにコントラクトをデプロイする
  // デプロイする際にコンストラクタが呼ばれるので引数をargumentsで渡す
  BallotContract.deploy({
    data: byteCode, // ここでバイトコードが必要になる
    arguments: [
      [
        // 文字列は16進数に変換してあげないといけないらしい
        web3.utils.asciiToHex('Bulbasaur'),
        web3.utils.asciiToHex('Charmander'),
        web3.utils.asciiToHex('Squirtle'),
      ],
    ],
  })
    .send({from: accounts[0], gas: 10000000}) // sendして初めてブロックチェーンにコードが送られる
    .then(instance => {
      console.log('Contract Address:', instance._address);
      return instance.methods
        .giveRightToVote(accounts) // ブロックチェーン上のアカウントすべてに投票権を与える (管理者は除く)
        .send({from: accounts[0], gas: 1000000});
    });
});
