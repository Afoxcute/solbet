import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { CustomChainConfig, IProvider } from "@web3auth/base";
import { SolanaWallet } from "@web3auth/solana-provider";

export class PersonalWallet {
  private provider: IProvider;
  constructor(
    provider: IProvider
  ) {
    this.provider = provider
  }

  public async getAccount() {
    const solanaWallet = new SolanaWallet(this.provider)
    const accounts = await solanaWallet.requestAccounts()

    return accounts[0];
  }

  public async getBalance() {
    const solanaWallet = new SolanaWallet(this.provider)
    const accounts = await solanaWallet.requestAccounts()
    const connectionConfig = await solanaWallet.request<string[], CustomChainConfig>({
            method: "solana_provider_config",
            params: [],
          })
    const connection = new Connection(connectionConfig.rpcTarget);
    const balance = await connection.getBalance(new PublicKey(accounts[0]))

    return balance / LAMPORTS_PER_SOL;
  }



}
