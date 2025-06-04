import { useBalance } from "wagmi";
import { base } from "wagmi/chains";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export function useUSDCBalance(address: string | undefined) {
  const { data, isLoading, refetch } = useBalance({
    address: address as `0x${string}`, // ✅ Assertion here
    token: USDC_ADDRESS,
    chainId: base.id,
    query: { enabled: !!address },
  });

  return {
    balance: data?.value ?? 0n,
    isLoading,
    refetch,
  };
}
