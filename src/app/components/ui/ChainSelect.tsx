"use client";

import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chain, formatUnits } from "viem";
import { useAccount } from "wagmi";
import ChainIcon from "../ChainIcon";
import { useUSDCBalances } from "@/app/hooks/useUSDCBalances";

type Props = {
  chains: Chain[];
  value: Chain | undefined;
  onChange: { (value: Chain): void };
};

export default function ChainSelect({ value, onChange, chains }: Props) {
  const { data: balances, isLoading: balancesLoading } = useUSDCBalances();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.target &&
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const chainsWithoutValue = useMemo(() => {
    if (value === undefined) {
      return chains;
    }

    return chains.filter((c) => c.id !== value.id);
  }, [chains, value]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(true)}
        className="form-control flex items-center justify-between w-full rounded-xl cursor-pointer"
      >
        <span
          className={`flex items-center font-medium text-base gap-x-2 ${value === undefined ? "text-dark" : ""}`}
        >
          {value !== undefined && (
            <ChainIcon chainId={value.id} className="size-6" />
          )}
          {value === undefined ? "Select a chain..." : value.name}
        </span>
        {value !== undefined && !balancesLoading && isConnected && (
          <span className="ml-auto text-dark text-base mr-4">
            {formatUnits(balances[value.id], 6)} USDC
          </span>
        )}
        <ChevronDownIcon
          className={`size-6 text-dark dark:text-light transition-transform duration-100 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="animate-fade-in-scale z-10 absolute border top-full translate-y-1 left-0 w-full rounded-xl overflow-hidden">
          {chainsWithoutValue.map((chain) => (
            <div
              onClick={() => {
                setOpen(false);
                onChange(chain);
              }}
              key={chain.id}
              className="rounded-none cursor-pointer flex items-center gap-x-2 bg-lighter dark:bg-darker dark:hover:bg-dark px-4 py-3 hover:bg-light"
            >
              <ChainIcon chainId={chain.id} className="size-6" />
              <span className="font-medium text-base">{chain.name}</span>
              {!balancesLoading && isConnected && (
                <span className="ml-auto text-dark text-base">
                  {formatUnits(balances[chain.id], 6)} USDC
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
