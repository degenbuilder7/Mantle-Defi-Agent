import { siteConfig } from "@/config/site"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { ConnectButton, lightTheme } from "thirdweb/react";;
import { createThirdwebClient, defineChain, ThirdwebClient } from "thirdweb";
import { avalanche, avalancheFuji, ethereum, modeTestnet, bsc, base , } from "thirdweb/chains";

export function SiteHeader() {

  const client = createThirdwebClient({ clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_KEY! });


  const mantle = defineChain({
    id: 5000,
    name: "Mantle",
    nativeCurrency: {
      name: "Ether",
      symbol: "MNT",
      decimals: 18,
    },
    rpc: "https://rpc.mantle.xyz",
    blockExplorers: [
      {
        name: "MantleExplorer",
        url: "https://explorer.mantle.xyz/",
      },
    ],
  });

  const mantletestnet = defineChain({
    id: 5003,
    name: "Mantle Sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "MNT",
      decimals: 18,
    },
    rpc: "https://endpoints.omniatech.io/v1/mantle/sepolia/public",
    blockExplorers: [
      {
        name: "MantleExplorer",
        url: "https://explorer.sepolia.mantle.xyz/",
      },
    ],
  });
  
  
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ConnectButton
              client={client}
              theme={lightTheme()}
              chains={[ mantletestnet , mantle]}
              connectButton={{
                style: {
                  fontSize: '0.75rem !important',
                  height: '2.5rem !important',
                },
                label: 'Sign In',
              }}
            // accountAbstraction={{
            //   chain: avalancheFuji,
            //   sponsorGas: true,
            // }}
            />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
