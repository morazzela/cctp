import { CHAINS_CONFIG } from "../constants"

type Props = {
    chainId: number
    className?: string
}

export default function ChainIcon({ chainId, className }: Props) {
    if (CHAINS_CONFIG[chainId].iconUri === undefined) {
        return
    }

    return <img className={className} src={CHAINS_CONFIG[chainId].iconUri}/>
}