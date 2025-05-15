import { useEffect, useState } from "react";

export function useTime() {
    const [time, setTime] = useState(Math.round(Date.now() / 1000))

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Math.round(Date.now() / 1000))
        }, 1000)
        
        return () => {
            clearInterval(interval)
        }
    }, [])
    
    return time
}