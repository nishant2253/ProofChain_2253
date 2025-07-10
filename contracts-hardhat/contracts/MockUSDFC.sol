// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDFC
 * @dev Mock USDFC stablecoin for testing on Filecoin Calibration testnet
 * This contract simulates a USDFC stablecoin with 6 decimals (like USDC)
 */
contract MockUSDFC is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("Mock USDFC Stablecoin", "USDFC") {
        _decimals = 6; // USDFC typically uses 6 decimals like USDC
        
        // Mint initial supply to deployer (1 million USDFC for testing)
        _mint(msg.sender, 1000000 * 10**_decimals);
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint new tokens (only owner can mint)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei units)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Faucet function - allows anyone to get 100 USDFC for testing
     * Can only be called once per address per day
     */
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public constant FAUCET_AMOUNT = 100 * 10**6; // 100 USDFC
    uint256 public constant FAUCET_COOLDOWN = 1 days;
    
    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown not met"
        );
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Emergency function to distribute tokens to multiple addresses
     * @param recipients Array of addresses to send tokens to
     * @param amounts Array of amounts to send (must match recipients length)
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
}