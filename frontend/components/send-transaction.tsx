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

// Add type definition for window.tron
declare global {
  interface Window {
    tron?: {
      tronWeb: {
        contract: (abi: any, address: string) => Promise<any>;
      };
    };
  }
}

// Add Merchant Moe contract addresses
const MOE_CONTRACTS = {
  ROUTER: "0xeaEE7EE68874218c3558b40063c42B82D3E7232a",
  FACTORY: "0x5bef015ca9424a7c07b68490616a4c1f094bedec",
  MOE_TOKEN: "0x4515A45337F461A11Ff0FE8aBF3c606AE5dC00c9"
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
    text: "Swap {amount} MOE for MNT",
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
  }
]

const filterOptions = ['All', 'MOE']

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

    if (command.type === 'moeSwap') {
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

  const sunswapQuote = async ({
    fromToken,
    toToken,
    amountIn
  }: {
    fromToken: string,
    toToken: string,
    amountIn: number
  }) => {
    try {
      const res = await fetch(`https://rot.endjgfsv.link/swap/router?fromToken=${fromToken}&toToken=${toToken}&amountIn=${amountIn}&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3`, {
        method: 'GET',
      })

      const response = await res.json()
      console.log("Response", response);

      const { data } = response
      return data[0];

    } catch (error) {
      console.log("Error in fetching quote", error);

    }

  }

  const handleSunSwap = async (command: Command) => {
    const [fromToken, toToken] = command.text.match(/(\w+) to (\w+)/i)?.slice(1) || [];
    if (!fromToken || !toToken) {
      console.error("Invalid swap command format");
      return;
    }

    const fromTokenAddress = getTokenAddress(fromToken);
    const toTokenAddress = getTokenAddress(toToken);
    const amountIn = parseInt(command.amount) * 1e6; // Assuming 6 decimal places, adjust if needed

    const amountOutResponse = await sunswapQuote({
      fromToken: fromTokenAddress,
      toToken: toTokenAddress,
      amountIn
    })

    const tron = window.tron;

    try {
      if (tron) {
        const tronweb = tron.tronWeb;
        console.log("Amount Out >>>", amountOutResponse);
        let contract = await tronweb.contract(SunSwapABI, 'TJ4NNy8xZEqsowCBhLvZ45LCqPdGjkET5j')
        console.log("Contract", contract);

        const { tokens, poolFees, poolVersions } = amountOutResponse

        const date = new Date();
        date.setHours(date.getHours() + 3);
        const timestamp = date.getTime();
        console.log(timestamp);

        const tx = await contract.swapExactInput(
          tokens,
          poolVersions,
          [poolVersions.length],
          poolFees,
          [amountIn, '1', address, timestamp]
        ).send({ feeLimit: 10000 * 1e6, shouldPollResponse: true });

        console.log("Tx", tx);
      }
    } catch (error) {
      console.log("Error in the swapping contract", error);
    }
  }

  // Helper function to get token addresses (you'll need to implement this)
  const getTokenAddress = (tokenSymbol: string): string => {
    // Implement a mapping of token symbols to their addresses
    const tokenAddresses: { [key: string]: string } = {
      'sTRX': 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
      'USDD': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      'USDT': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      'APENFT': 'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq',
      'SUN': 'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S',
      'BTC': 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
      'WTRX': 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
      'WETH': 'TXWkP3jLBqRGojUih1ShzNyDaN5Csnebok',
      'HTX': 'TUPM7K8REVzD2UdV4R5fe5M8XbnR2DdoJ6',
      // Add more token mappings as needed
    };
    return tokenAddresses[tokenSymbol] || '';
  }

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