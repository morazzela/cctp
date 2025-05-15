import { useMemo } from "react";

const dotSizes = {
  xs: "size-2",
  sm: "size-3",
  default: "size-4",
  lg: "size-4",
};

const textSizes = {
  xs: "text-sm",
  sm: "text-base",
  default: "text-lg",
  lg: "text-xl",
};

type Props = {
  size?: "xs" | "sm" | "lg";
  text?: string;
  className?: string;
};

export default function Loader({ text, size, className }: Props) {
  const dotSizeClass = useMemo(() => {
    return size ? dotSizes[size] : dotSizes.default;
  }, [size]);

  const textSizeClass = useMemo(() => {
    return size ? textSizes[size] : textSizes.default;
  }, [size]);

  return (
    <div className={"inline-flex items-center justify-center " + className}>
      <div className={dotSizeClass + " relative"}>
        <div
          className={
            dotSizeClass + " absolute rounded-full bg-primary-gradient"
          }
        ></div>
        <div
          className={
            dotSizeClass +
            " absolute animate-ping rounded-full bg-primary-gradient"
          }
        ></div>
      </div>
      {text && (
        <div
          className={
            "ml-4 font-satoshi font-medium leading-none text-dark " +
            textSizeClass
          }
        >
          {text}
        </div>
      )}
    </div>
  );
}
