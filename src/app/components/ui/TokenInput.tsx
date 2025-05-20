import { USDC_ICON } from "@/app/constants";
import { useUSDCBalance } from "@/app/hooks/useUSDCBalance";
import { findChainById } from "@/app/utils";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";

type Props = {
  value: bigint;
  onChange: { (value: bigint): void };
  chainId: number;
};

export default function TokenInput({ chainId, value, onChange }: Props) {
  const [inputValue, setInputValue] = useState(
    value === 0n ? "" : formatUnits(value, 6),
  );

  const chain = useMemo(() => findChainById(chainId), [chainId]);

  const { data: balance } = useUSDCBalance(chain);

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
    <div className="flex w-full flex-col rounded-2xl border bg-lighter dark:bg-darkest md:flex-row">
      <div className="flex w-full items-center justify-between p-2 flex-col md:flex-row">
        <button className="flex shrink-0 items-center self-start rounded-xl bg-light dark:bg-darker md:hidden">
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
          <div className="whitespace inline-flex h-full w-full items-center border rounded-xl p-3 bg-light dark:bg-darker font-work-sans font-medium">
            <div className="relative flex size-8 items-center justify-center md:size-14">
              <img
                alt="USDC"
                loading="lazy"
                width="40"
                height="40"
                decoding="async"
                data-nimg="1"
                className="rounded-full size- md:size-14"
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
              className="w-full bg-transparent text-3xl font-semibold text-darker dark:text-lighter outline-none placeholder:text-dark dark:placeholder:text-light/20 md:text-4xl text-right"
              value={inputValue}
            />
          </div>
          <div className="flex w-full items-center text-xs md:mt-1 justify-end gap-x-3 translate-y-0.5">
            <span className="font-medium">
              Balance: {formatUnits(balance ?? 0n, 6)}
            </span>
            {balance > 0n && (
              <>
                <div
                  onClick={() => onChange(balance / 2n)}
                  className="font-semibold text-primary-light dark:text-dark-primary cursor-pointer"
                >
                  Half
                </div>
                <div
                  onClick={() => onChange(balance)}
                  className="font-semibold text-primary-light dark:text-dark-primary cursor-pointer"
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
