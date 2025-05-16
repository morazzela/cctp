"use client";

import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(true)}
        className="form-control flex items-center justify-between w-full rounded-xl cursor-pointer"
      >
        <span
          className={`flex items-center font-medium  gap-x-2 ${value === undefined ? "text-dark" : ""}`}
        >
          {value !== undefined && (
            <ChainIcon chainId={value.id} className="size-4" />
          )}
          {value === undefined ? "Select a chain..." : value.name}
        </span>
        {value !== undefined && !balancesLoading && isConnected && (
          <span className="ml-auto text-dark text-base mr-4">
            {formatUnits(balances[value.id], 6)} USDC
          </span>
        )}
        <ChevronDownIcon
          className={`size-6 text-dark ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="z-10 absolute top-full translate-y-1 left-0 w-full bg-dark rounded-xl overflow-hidden divide-y divide-light">
          {chains.map((chain) => (
            <div
              onClick={() => {
                setOpen(false);
                onChange(chain);
              }}
              key={chain.id}
              className="border-none rounded-none cursor-pointer flex items-center gap-x-2 bg-lighter p-4 hover:bg-light"
            >
              <ChainIcon chainId={chain.id} className="size-4" />
              <span className="font-medium">{chain.name}</span>
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
