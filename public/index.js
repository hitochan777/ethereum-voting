// @format
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const abi = JSON.parse(
  '[{"constant":true,"inputs":[],"name":"getVoterLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"i","type":"uint32"}],"name":"getCandidate","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chairperson","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidates","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"delegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_voters","type":"address[]"}],"name":"giveRightToVote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"voters","outputs":[{"name":"weight","type":"uint256"},{"name":"voted","type":"bool"},{"name":"delegate","type":"address"},{"name":"vote","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"voterAddresses","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_bytes32","type":"bytes32"}],"name":"bytes32ToStr","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCandidateLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]',
);

const BallotContract = web3.eth.contract(abi);

const contractInstance = BallotContract.at(
  '0xa751f8014ff6f54DcFf37861e86BAC02F1A8de17',
);

let candidates = [];

function voteForCandidate() {
  const candidateName = $('#vote-to').val();
  console.log(candidateName);
  contractInstance.vote(candidateName, {from: $('#vote-as').val()}, () => {
    $('#voteNum-' + candidateName).html(
      contractInstance.votesReceived.call(candidateName).toString(),
    );
  });
}

function delegate() {
  const delegateSource = $('#delegate-source').val();
  const delegateTarget = $('#delegate-target').val();
  contractInstance.delegate(delegateTarget, {from: delegateSource}, err => {
    if (err) {
      alert('Could not delegate');
    }
  });
}

$(document).ready(function() {
  const voterLen = Number(contractInstance.getVoterLength.call().toString());
  let addresses = [];
  for (let i = 0; i < voterLen; ++i) {
    addresses.push(contractInstance.voterAddresses.call(i).toString());
  }

  addresses.forEach(addr => {
    $('#vote-as').append("<option value='" + addr + "'>" + addr + '</option>');
    $('#delegate-source').append(
      "<option value='" + addr + "'>" + addr + '</option>',
    );
    $('#delegate-target').append(
      "<option value='" + addr + "'>" + addr + '</option>',
    );
  });

  const candidateLen = Number(
    contractInstance.getCandidateLength.call().toString(),
  );
  for (let i = 0; i < candidateLen; ++i) {
    candidates.push(contractInstance.getCandidate.call(i).toString());
  }

  candidates.forEach(candidate => {
    $('#vote-to').append(
      "<option value='" + candidate + "'>" + candidate + '</option>',
    );
    $('#report').append(
      '<tr><td>' +
        candidate +
        '</td><td id="voteNum-' +
        candidate +
        '">' +
        contractInstance.votesReceived.call(candidate).toString() +
        '</td></tr>',
    );
  });
});
