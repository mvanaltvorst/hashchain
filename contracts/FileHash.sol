pragma solidity ^0.4.24;

contract FileHash {
  mapping (address => mapping (bytes32 => bool)) public hashRegistry;

  function addHash(bytes32 hash) public {
    hashRegistry[msg.sender][hash] = true;
  }
}
