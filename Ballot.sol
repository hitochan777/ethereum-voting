pragma solidity ^0.4.16;

contract Ballot {
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        bytes32 vote;   // name of the voted candidate
    }

    address public chairperson;

    mapping(address => Voter) public voters;

    address[] public voterAddresses;

    mapping (bytes32 => uint) public votesReceived;
    bytes32[] public candidates;

    function Ballot(bytes32[] candidateNames) public {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint i = 0; i < candidateNames.length; i++) {
            candidates.push(candidateNames[i]);
            votesReceived[candidateNames[i]] = 0;
        }

    }

    function giveRightToVote(address[] _voters) public {
        for (uint i = 0; i < _voters.length; i++) {
            address voter = _voters[i];
            if (voter == chairperson) {
                continue;
            }
            require((msg.sender == chairperson) && !voters[voter].voted && (voters[voter].weight == 0));
            voters[voter].weight = 1;
            voterAddresses.push(voter);
        }
    }

    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted);
        require(to != msg.sender);
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender);
        }
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate = voters[to];
        if (delegate.voted) {
            votesReceived[delegate.vote] += sender.weight;
        } else {
            delegate.weight += sender.weight;
        }
    }

    function vote(bytes32 candidate) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted);
        sender.voted = true;
        sender.vote = candidate;

        votesReceived[candidate] += sender.weight;
    }

    function getVoterLength() public constant returns (uint) {
        return voterAddresses.length;
    }

    function getCandidateLength() public constant returns (uint) {
        return candidates.length;
    }

    function getCandidate(uint32 i) public constant returns (string) {
        return bytes32ToStr(candidates[i]); 
    }

    function bytes32ToStr(bytes32 _bytes32) public constant returns (string) {

        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

}

