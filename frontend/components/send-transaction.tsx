"use client";
import React, { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { ethers } from 'ethers'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import JustlendABI from '../config/JustlendABI.json';
import { SunSwapABI } from '../config/SunSwapABI';
import { useActiveAccount } from 'thirdweb/react';
import { MOE_TOKENS } from '@/config/moetokens';

// Add Merchant Moe contract addresses
const MOE_CONTRACTS = {
  ROUTER: "0xeaEE7EE68874218c3558b40063c42B82D3E7232a",
  FACTORY: "0x5bef015ca9424a7c07b68490616a4c1f094bedec",
  MOE_TOKEN: "0x4515A45337F461A11Ff0FE8aBF3c606AE5dC00c9"
} as const;


const AGNI_CONTRACTS = {
  MAINNET: {
    AgniFactory: '0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035',
    SwapRouter: '0x319B69888b0d11cEC22caA5034e25FfFBDc88421',
    WMNT: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
    USDT: '0x201EBa5cC46D216Ce6dC03F6a759e8E766e956aE',
    USDC: '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9',
    NonfungiblePositionManager: '0x218bf598D1453383e2F4AA7b14fFB9BfB102D637'
  },
  TESTNET: {
    AgniFactory: '0x503Ca2ad7C9C70F4157d14CF94D3ef5Fa96D7032',
    SwapRouter: '0xe2DB835566F8677d6889ffFC4F3304e8Df5Fc1df',
    WMNT: '0xEa12Be2389c2254bAaD383c6eD1fa1e15202b52A',
    USDT: '0x3e163F861826C3f7878bD8fa8117A179d80731Ab',
    USDC: '0x82a2eb46a64e4908bbc403854bc8aa699bf058e9',
    NonfungiblePositionManager: '0xb04a19EF7853c52EDe6FBb28F8FfBecb73329eD7'
  }
} as const;

interface Command {
  id: number;
  type: string;
  amount: string;
  text: string;
  tokenIn?: string;
  tokenOut?: string;
}

const initialQueryCommands: Command[] = [
  { 
    id: 1, 
    type: "moeSwap", 
    amount: "1", 
    text: "Swap {amount} {token1} for {token2} on Moe",
    tokenIn: MOE_CONTRACTS.MOE_TOKEN,
    tokenOut: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" // MNT token
  },
  { 
    id: 2, 
    type: "moeAddLiquidity", 
    amount: "1", 
    text: "Add {amount} MOE-MNT LP",
    tokenIn: MOE_CONTRACTS.MOE_TOKEN,
    tokenOut: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"
  },
  { 
    id: 3, 
    type: "moeRemoveLiquidity", 
    amount: "1", 
    text: "Remove {amount} MOE-MNT LP",
    tokenIn: MOE_CONTRACTS.MOE_TOKEN,
    tokenOut: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"
  },
  {
    id: 4,
    type: "agniSwap",
    amount: "1",
    text: "Swap {amount} MNT for USDT on Agni",
    tokenIn: AGNI_CONTRACTS.MAINNET.WMNT,
    tokenOut: AGNI_CONTRACTS.MAINNET.USDT
  },
  {
    id: 5,
    type: "agniAddLiquidity",
    amount: "1",
    text: "Add {amount} MNT-USDT LP on Agni",
    tokenIn: AGNI_CONTRACTS.MAINNET.WMNT,
    tokenOut: AGNI_CONTRACTS.MAINNET.USDT
  },
  {
    id: 6,
    type: "agniRemoveLiquidity",
    amount: "1", 
    text: "Remove {amount} MNT-USDT LP on Agni",
    tokenIn: AGNI_CONTRACTS.MAINNET.WMNT,
    tokenOut: AGNI_CONTRACTS.MAINNET.USDT
  }
]

const filterOptions = ['All', 'MOE', 'Agni', 'Karak', 'pendle', 'Treehouse', 'Ondo Finance', 'Puff Penthouse']

const CommandItem: React.FC<{
  command: Command;
  isSelected: boolean;
  onSelect: () => void;
  onAmountChange: (newAmount: string) => void;
}> = ({ command, isSelected, onSelect, onAmountChange }) => {
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onAmountChange(e.target.value)
    e.stopPropagation()
  }, [onAmountChange])

  return (
    <div
      className={`py-2 px-4 hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-gray-1200' : ''}`}
      onClick={onSelect}
    >
      <span className="text-green-400">❯ </span>
      {command.text.split('{amount}')[0]}
      <Input
        type="number"
        value={command.amount}
        onChange={handleAmountChange}
        className="inline-block w-20 mx-1 bg-gray-800 text-white"
        onClick={(e) => e.stopPropagation()}
      />
      {command.text.split('{amount}')[1]}
    </div>
  )
}

// Add handler functions for Merchant Moe operations
const handleMoeSwap = async (command: Command, activeAccount: any) => {
  if (!activeAccount || !command.tokenIn || !command.tokenOut) return;

  try {
    const router = new ethers.Contract(
      MOE_CONTRACTS.ROUTER,
      [
        "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)"
      ],
      activeAccount
    );

    const amountIn = ethers.parseEther(command.amount);
    const path = [command.tokenIn, command.tokenOut];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0, // amountOutMin - be careful with this in production!
      path,
      activeAccount.address,
      deadline
    );

    console.log("Swap transaction:", tx);
  } catch (error) {
    console.error("Error in Moe swap:", error);
  }
};

const handleMoeAddLiquidity = async (command: Command, activeAccount: any) => {
  if (!activeAccount || !command.tokenIn || !command.tokenOut) return;

  try {
    const router = new ethers.Contract(
      MOE_CONTRACTS.ROUTER,
      [
        "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)"
      ],
      activeAccount
    );

    const amountA = ethers.parseEther(command.amount);
    const amountB = ethers.parseEther(command.amount);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    const tx = await router.addLiquidity(
      command.tokenIn,
      command.tokenOut,
      amountA,
      amountB,
      0, // amountAMin - be careful with this in production!
      0, // amountBMin - be careful with this in production!
      activeAccount.address,
      deadline
    );

    console.log("Add liquidity transaction:", tx);
  } catch (error) {
    console.error("Error in Moe add liquidity:", error);
  }
};

const handleMoeRemoveLiquidity = async (command: Command, activeAccount: any) => {
  if (!activeAccount || !command.tokenIn || !command.tokenOut) return;

  try {
    const router = new ethers.Contract(
      MOE_CONTRACTS.ROUTER,
      [
        "function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB)"
      ],
      activeAccount
    );

    const liquidity = ethers.parseEther(command.amount);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    const tx = await router.removeLiquidity(
      command.tokenIn,
      command.tokenOut,
      liquidity,
      0, // amountAMin - be careful with this in production!
      0, // amountBMin - be careful with this in production!
      activeAccount.address,
      deadline
    );

    console.log("Remove liquidity transaction:", tx);
  } catch (error) {
    console.error("Error in Moe remove liquidity:", error);
  }
};

// Add handler functions for Agni operations
const handleAgniSwap = async (command: Command, activeAccount: any) => {
  if (!activeAccount || !command.tokenIn || !command.tokenOut) return;

  try {
    const router = new ethers.Contract(
      AGNI_CONTRACTS.MAINNET.SwapRouter,
      [
        "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
      ],
      activeAccount
    );

    const amountIn = ethers.parseEther(command.amount);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

    const params = {
      tokenIn: command.tokenIn,
      tokenOut: command.tokenOut,
      fee: 3000, // 0.3%
      recipient: activeAccount.address,
      deadline,
      amountIn,
      amountOutMinimum: 0, // Be careful with this in production!
      sqrtPriceLimitX96: 0
    };

    const tx = await router.exactInputSingle(params);
    console.log("Swap transaction:", tx);
  } catch (error) {
    console.error("Error in Agni swap:", error);
  }
};

const handleAgniAddLiquidity = async (command: Command, activeAccount: any) => {
  if (!activeAccount || !command.tokenIn || !command.tokenOut) return;

  try {
    const positionManager = new ethers.Contract(
      AGNI_CONTRACTS.MAINNET.NonfungiblePositionManager,
      [
        "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
      ],
      activeAccount
    );

    const amount = ethers.parseEther(command.amount);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    const params = {
      token0: command.tokenIn,
      token1: command.tokenOut,
      fee: 3000,
      tickLower: -887220,  // Example ticks - calculate these based on price range
      tickUpper: 887220,
      amount0Desired: amount,
      amount1Desired: amount,
      amount0Min: 0,
      amount1Min: 0,
      recipient: activeAccount.address,
      deadline
    };

    const tx = await positionManager.mint(params);
    console.log("Add liquidity transaction:", tx);
  } catch (error) {
    console.error("Error in Agni add liquidity:", error);
  }
};

export default function SendTransaction() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState('All')
  const [queryCommands, setQueryCommands] = useState(initialQueryCommands)
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null)
  
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const filteredCommands = filter === 'All'
    ? queryCommands
    : queryCommands.filter(cmd => cmd.text.toLowerCase().includes(filter.toLowerCase()))

  const handleAmountChange = useCallback((id: number, newAmount: string) => {
    setQueryCommands(prevCommands =>
      prevCommands.map(cmd =>
        cmd.id === id ? { ...cmd, amount: newAmount } : cmd
      )
    )
  }, [])

  // Update executeCommand to pass activeAccount
  const executeCommand = useCallback((command: Command) => {
    console.log(`Executing command: ${command.text.replace('{amount}', command.amount)}`);

    if (command.type === 'agniSwap') {
      handleAgniSwap(command, activeAccount);
    } else if (command.type === 'agniAddLiquidity') {
      handleAgniAddLiquidity(command, activeAccount);
    } else if (command.type === 'moeSwap') {
      handleMoeSwap(command, activeAccount);
    } else if (command.type === 'moeAddLiquidity') {
      handleMoeAddLiquidity(command, activeAccount);
    } else if (command.type === 'moeRemoveLiquidity') {
      handleMoeRemoveLiquidity(command, activeAccount);
    } else if (command.type === 'swap' && command.text.toLowerCase().includes('sunswap')) {
      handleSunSwap(command);
    } else {
      handleFunction({ amount: command.amount });
    }
  }, [activeAccount]);

  // Update handleFunction with proper typing
  const handleFunction = async ({
    amount
  }: { 
    amount: string 
  }) => {
    const tron = window.tron;
    try {
      if (tron) {
        const tronWeb = tron.tronWeb;
        const justlendContractAddress = "TE2RzoSV3wFK99w6J9UnnZ4vLfXYoxvRwP";
        let contract = await tronWeb.contract(JustlendABI, justlendContractAddress);

        console.log("Contract", contract);

        let result = await contract.mint().send({
          callValue: amount,
        }).then((output: unknown) => { 
          console.log('- Output:', output, '\n');
          return output;
        });
        console.log('result: ', result);
      }
    } catch (error) {
      console.log("Error in sending txn", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">Send transactions with the Mantle Defi Agent</h2>

      <Button onClick={() => setIsModalOpen(true)} className="w-full mb-4">
        Query Commands
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-fit bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Query Commands</DialogTitle>
          </DialogHeader>
          <div className="flex space-x-2 mb-4">
            {filterOptions.map((option) => (
              <Button
                key={option}
                onClick={() => setFilter(option)}
                variant={filter === option ? "default" : "outline"}
                size="sm"
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredCommands.map((command) => (
              <CommandItem
                key={command.id}
                command={command}
                isSelected={selectedCommand?.id === command.id}
                onSelect={() => setSelectedCommand(command)}
                onAmountChange={(newAmount) => handleAmountChange(command.id, newAmount)}
              />
            ))}
          </div>
          {selectedCommand && (
            <Button
              onClick={() => {
                executeCommand(selectedCommand)
                setIsModalOpen(false)
              }}
              className="mt-4"
            >
              Execute Command
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-auto">
        <Input
          placeholder="Send a message..."
          className="bg-gray-700 text-white"
        />
      </div>
    </div>
  )
}