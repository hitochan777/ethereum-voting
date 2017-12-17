pragma solidity ^0.4.16;

contract Ballot {
    struct Voter {
        uint weight; // 重みは投票権の委任によって加算されていく
        bool voted;  // 既に投票したかどうか
        address delegate; // 投票権の委任先
        bytes32 vote;   // 投票した候補者
    }

    address public chairperson; // 投票の管理者

    mapping(address => Voter) public voters; // 投票者へのマッピングをする

    address[] public voterAddresses; // 投票者のリスト

    mapping (bytes32 => uint) public votesReceived; // 候補者の獲得投票数
    bytes32[] public candidates; // 候補者のリスト

    function Ballot(bytes32[] candidateNames) public {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint i = 0; i < candidateNames.length; i++) {
            candidates.push(candidateNames[i]);
            votesReceived[candidateNames[i]] = 0;
        }

    }

    // _votersで表されるアドレス全てに投票権を与える
    // 管理者に投票権は与えない
    function giveRightToVote(address[] _voters) public {
        for (uint i = 0; i < _voters.length; i++) {
            address voter = _voters[i];
            if (voter == chairperson) {
                continue;
            }

            require((msg.sender == chairperson) && !voters[voter].voted && (voters[voter].weight == 0));
            voters[voter].weight = 1; // 重みを与える
            voterAddresses.push(voter);
        }
    }

    // toで表される投票者に投票権を委任する
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted); // 委任元が投票していないことが条件
        require(to != msg.sender);
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender);
        }
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate = voters[to];
        
        // 委任先が既に投票していれば委任先の投票先に委任元の重みを加算
        // そうでなければ、委任先の重みに委任元との重みを加算 
        if (delegate.voted) {
            votesReceived[delegate.vote] += sender.weight;
        } else {
            delegate.weight += sender.weight;
        }
    }

    // candidatesで表される候補者に投票する
    function vote(bytes32 candidate) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted); // 投票していないことが条件
        sender.voted = true;
        sender.vote = candidate;

        votesReceived[candidate] += sender.weight; // 候補者の獲得投票数を加算
    }

    // 投票者数を返す  
    function getVoterLength() public constant returns (uint) {
        return voterAddresses.length;
    }

    // 候補者数を返す
    function getCandidateLength() public constant returns (uint) {
        return candidates.length;
    }

    // candiatesのi番目の候補者名をstring型に変換して返す
    function getCandidate(uint32 i) public constant returns (string) {
        return bytes32ToStr(candidates[i]); 
    }

    // bytes32をstringに変換する
    function bytes32ToStr(bytes32 _bytes32) public constant returns (string) {

        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

}

