import Image from "next/image";
import { CHAINS_CONFIG } from "../../constants";

type Props = {
  chainId: number;
  className?: string;
};

export default function ChainIcon({ chainId, className }: Props) {
  if (CHAINS_CONFIG[chainId].iconUri === undefined) {
    return;
  }

  return (
    <Image
      alt={chainId.toFixed()}
      className={"rounded-lg " + className}
      quality={100}
      width={500}
      height={500}
      src={CHAINS_CONFIG[chainId].iconUri}
      loading="eager"
    />
  );
}
