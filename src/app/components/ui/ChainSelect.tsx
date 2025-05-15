import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { Chain } from "viem";
import { useChains } from "wagmi";

type Props = {
  chains: Chain[];
  value: Chain | undefined;
  onChange: { (value: Chain): void };
};

export default function ChainSelect({ value, onChange, chains }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="form-control flex items-center justify-between"
      >
        <span className={value === undefined ? "text-dark" : ""}>
          {value === undefined ? "Select a chain..." : value.name}
        </span>
        <ChevronDownIcon
          className={`size-6 text-dark ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="z-10 absolute top-full translate-y-1 left-0 w-full bg-dark rounded-lg border overflow-hidden">
          {chains.map((chain) => (
            <div
              onClick={() => {
                setOpen(false);
                onChange(chain);
              }}
              key={chain.id}
              className="form-control border-none rounded-none bg-transparent hover:bg-darker cursor-pointer"
            >
              {chain.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
