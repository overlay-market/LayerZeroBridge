// SPDX-License-Identifier: MIT

/**
 * Created on 2022-11-20 06:20
 * @title A contract used to bridge tokens to different bridge using LayerZero protocol.
 * @author: Overlay - c-n-o-t-e
 */
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/security/Pausable.sol";
import "./types/BaseNonblockingLzApp.sol";
import "./interfaces/IToken.sol";

contract LzApp is Pausable, BaseNonblockingLzApp {
    event SendToChain(address indexed _sender, uint16 _dstChainId, address _toAddress, uint _amount, uint64 _nonce, bytes payload);
    event Mint(address indexed _toAddress, bytes _dstChainId,  uint _amount, uint64 _nonce);

    IToken iToken;

    constructor(address _lzEndpoint, address _token) BaseNonblockingLzApp(_lzEndpoint) {
        iToken = IToken(_token);
    }

    function _nonblockingLzReceive(
        uint16,
        bytes memory _srcAddress,
        uint64 nonce,
        bytes memory _payload
    ) internal override {
        (address toAddress, uint256 amount) = abi.decode(_payload, (address, uint256));

        iToken.mint(toAddress, amount);
        emit Mint(toAddress, _srcAddress,  amount, nonce);
    }

    function bridgeToken(uint16 _dstChainId, uint256 _amount) public payable whenNotPaused {
        iToken.burn(msg.sender, _amount);
        bytes memory payload = abi.encode(msg.sender, _amount);

        bytes memory adapterParams = abi.encodePacked(lzEndpoint.getSendVersion(address(this)), minDstGasLookup[_dstChainId]);

        (uint256 messageFee, ) = lzEndpoint.estimateFees(
            _dstChainId,
            address(this),
            payload,
            false,
            adapterParams
        );

        require(msg.value >= messageFee, "Must send enough value to cover messageFee");
        _lzSend(_dstChainId, payload, payable(msg.sender), address(0x0), adapterParams);

        uint64 nonce = lzEndpoint.getOutboundNonce(_dstChainId, address(this));
        emit SendToChain(msg.sender, _dstChainId, msg.sender, _amount, nonce, payload);
    }

    // disable bridging token
    function enable(bool en) external {
        if (en) {
            _pause();
        } else {
            _unpause();
        }
    }
}