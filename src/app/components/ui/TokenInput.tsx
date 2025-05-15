import { CHAINS_CONFIG } from "@/app/constants";
import { FormEvent, useEffect, useState } from "react";
import { erc20Abi, formatUnits, parseUnits, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

type Props = {
  value: bigint;
  onChange: { (value: bigint): void };
};

export default function TokenInput({ value, onChange }: Props) {
  const { chainId, address } = useAccount();
  const [inputValue, setInputValue] = useState(formatUnits(value, 6));

  const { data: balance } = useReadContract({
    address: CHAINS_CONFIG[chainId ?? 1].usdc,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: {
      enabled: address !== undefined && chainId !== undefined,
    },
  });

  const onInput = (event: FormEvent<HTMLInputElement>) => {
    const val = event.currentTarget.value
      .trim()
      .replace(",", ".")
      .replace(/[^[0-9.]/g, "");

    setInputValue(val);

    if (!isNaN(Number(val))) {
      onChange(parseUnits(val, 6));
    }
  };

  useEffect(() => {
    setInputValue(formatUnits(value, 6));
  }, [value]);

  return (
    <div className="flex w-full flex-col rounded-2xl border border-dark bg-darker md:flex-row">
      <div className="flex w-full items-center justify-between p-2 flex-col md:flex-row">
        <button className="flex shrink-0 items-center self-start rounded-xl bg-dark md:hidden">
          <div className="relative flex size-9 items-center justify-center">
            <img
              alt="USDC"
              loading="lazy"
              width="40"
              height="40"
              decoding="async"
              data-nimg="1"
              className="rounded-full size-6"
              src="https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main/blockchains/sonic/assets/0x29219dd400f2Bf60E5a23d13Be72B486D4038894/logo.png"
            />
          </div>
          <div className="whitespace-break-spaces pl-0 pr-2.5 text-left text-xl font-bold">
            USDC
          </div>
        </button>
        <div className="w-[28rem] max-md:hidden">
          <div className="whitespace inline-flex h-full w-full items-center rounded-lg p-3 border-dark  bg-dark font-work-sans font-medium">
            <div className="relative flex size-8 items-center justify-center md:size-14">
              <img
                alt="USDC"
                loading="lazy"
                width="40"
                height="40"
                decoding="async"
                data-nimg="1"
                className="rounded-full size- md:size-12"
                src="https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main/blockchains/sonic/assets/0x29219dd400f2Bf60E5a23d13Be72B486D4038894/logo.png"
              />
            </div>
            <div className="ml-2">
              <div className="flex items-center text-3xl font-medium">USDC</div>
            </div>
          </div>
        </div>
        <div className="relative flex items-end justify-center px-1 font-bold text-dark md:px-2 w-full flex-col">
          <div className="flex w-full items-center">
            <input
              onInput={onInput}
              placeholder="0.0"
              className="w-full bg-transparent text-3xl font-semibold text-light outline-none placeholder:text-dark md:text-4xl text-right"
              value={inputValue}
            />
          </div>
          <div className="flex w-full items-center text-base md:mt-1 justify-end gap-x-3">
            <span>Balance: {formatUnits(balance ?? 0n, 6)}</span>
            {balance !== undefined && (
              <>
                <div
                  onClick={() => onChange(balance / 2n)}
                  className="font-semibold text-primary-gradient cursor-pointer hover:bg-none hover:text-primary-light"
                >
                  Half
                </div>
                <div
                  onClick={() => onChange(balance)}
                  className="font-semibold text-primary-gradient cursor-pointer hover:bg-none hover:text-primary-light"
                >
                  Max
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
