import { Chain } from "@/app/types";
import Image from "next/image";

type Props = {
  chain?: Chain;
  className?: string;
};

export default function ChainIcon({ chain, className }: Props) {
  if (!chain) {
    return;
  }

  return (
    <Image
      alt={chain.name + " logo"}
      className={"rounded-full " + className}
      quality={100}
      width={500}
      height={500}
      src={chain.icon}
      loading="eager"
    />
  );
}
