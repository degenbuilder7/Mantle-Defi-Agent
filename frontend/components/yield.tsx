"use client";
import React, { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useActiveAccount } from 'thirdweb/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Types for Pendle assets and markets
interface PendleAsset {
  name: string;
  decimals: number;
  address: string;
  symbol: string;
  tags: string[];
  expiry: string;
}

interface Command {
  id: number;
  type: string;
  amount: string;
  text: string;
  marketAddress: string;
}

// Market data
const MarketAsset: { [key: string]: PendleAsset[] } = {
  "0x2ddd4808fbb2e08b563af99b8f340433c32c8cc2": [
    {
      name: "PT USDe",
      decimals: 18,
      address: "0x8be66a48ea1f4aff89cd2beb50b02d901dfb9584",
      symbol: "PT-USDe-26DEC2024",
      tags: ["PT"],
      expiry: "2024-12-26T00:00:00.000Z",
    },
    {
      name: "YT USDe",
      decimals: 18,
      address: "0x119de9edbaf4565d7cb6a1b7e5c7f9d1f03de5c0",
      symbol: "YT-USDe-26DEC2024",
      tags: ["YT"],
      expiry: "2024-12-26T00:00:00.000Z",
    },
    {
      name: "USDe (Dec 2024)",
      decimals: 18,
      address: "0x9660ac0cb085f8fb39a6f383cf2067785364f924",
      symbol: "SY-USDe",
      tags: ["SY"],
      expiry: "",
    }
  ]
};

const initialCommands: Command[] = [
  { 
    id: 1, 
    type: "addLiquidity", 
    amount: "1", 
    text: "Add {amount} USDe liquidity to Pendle market",
    marketAddress: "0x2ddd4808fbb2e08b563af99b8f340433c32c8cc2"
  },
  { 
    id: 2, 
    type: "swapExactPtForToken", 
    amount: "1", 
    text: "Swap {amount} PT-USDe for USDe",
    marketAddress: "0x2ddd4808fbb2e08b563af99b8f340433c32c8cc2"
  },
  { 
    id: 3, 
    type: "swapExactTokenForPt", 
    amount: "1", 
    text: "Swap {amount} USDe for PT-USDe",
    marketAddress: "0x2ddd4808fbb2e08b563af99b8f340433c32c8cc2"
  }
];

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

export default function Yield() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commands, setCommands] = useState(initialCommands)
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null)
  
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const handleAmountChange = useCallback((id: number, newAmount: string) => {
    setCommands(prevCommands =>
      prevCommands.map(cmd =>
        cmd.id === id ? { ...cmd, amount: newAmount } : cmd
      )
    )
  }, [])

  const executeCommand = useCallback(async (command: Command) => {
    console.log(`Executing command: ${command.text.replace('{amount}', command.amount)}`)

    if (!activeAccount) {
      console.error('No active account')
      return
    }

    try {
      switch (command.type) {
        case 'addLiquidity':
          await handleAddLiquidity(command)
          break
        case 'swapExactPtForToken':
          await handleSwapPtForToken(command)
          break
        case 'swapExactTokenForPt':
          await handleSwapTokenForPt(command)
          break
        default:
          console.error('Unknown command type:', command.type)
      }
    } catch (error) {
      console.error('Error executing command:', error)
    }
  }, [activeAccount])

  const handleAddLiquidity = async (command: Command) => {
    const assets = MarketAsset[command.marketAddress]
    const syAsset = assets.find(a => a.tags.includes('SY'))
    
    if (!syAsset) {
      console.error('SY asset not found')
      return
    }

    // TODO: Implement Pendle SDK integration
    console.log('Adding liquidity:', {
      marketAddress: command.marketAddress,
      syAsset,
      amount: command.amount
    })
  }

  const handleSwapPtForToken = async (command: Command) => {
    // TODO: Implement PT to Token swap
    console.log('Swapping PT for Token:', command)
  }

  const handleSwapTokenForPt = async (command: Command) => {
    // TODO: Implement Token to PT swap
    console.log('Swapping Token for PT:', command)
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">Pendle Yield Markets</h2>

      <Button onClick={() => setIsModalOpen(true)} className="w-full mb-4">
        Yield Commands
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-fit bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Yield Commands</DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            {commands.map((command) => (
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
