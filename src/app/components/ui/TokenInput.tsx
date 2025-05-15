import { CHAINS_CONFIG, USDC_ICON } from "@/app/constants";
import { useUSDCBalances } from "@/app/hooks/useUSDCBalances";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { erc20Abi, formatUnits, parseUnits, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

type Props = {
  value: bigint;
  onChange: { (value: bigint): void };
  chainId: number
};

export default function TokenInput({ chainId, value, onChange }: Props) {
  const { address } = useAccount();
  const [inputValue, setInputValue] = useState(value === 0n ? "" : formatUnits(value, 6));
  const { data: balances } = useUSDCBalances()

  const balance = useMemo(() => balances[chainId] ?? 0n, [balances, chainId])

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
    setInputValue(value === 0n ? "" : formatUnits(value, 6));
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
              src={USDC_ICON}
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
                src={USDC_ICON}
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
            {balance > 0n && (
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
