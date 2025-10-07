import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/16/solid";
import { ReactNode, useMemo } from "react";

type Props = {
  type: "warning" | "error" | "info";
  children: ReactNode;
  className?: string;
};

export default function Alert({ type, children, className }: Props) {
  const infos = useMemo(() => {
    if (type === "warning") {
      return {
        icon: <ExclamationCircleIcon className="size-6 shrink-0" />,
        classes:
          "font-medium bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-100 border-2 border-orange-500 dark:border-orange-800 rounded-xl px-4 py-3 flex items-center gap-x-3 overflow-x-auto",
      };
    }

    if (type === "error") {
      return {
        icon: <ExclamationTriangleIcon className="size-6 shrink-0" />,
        classes:
          "font-medium bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-100 border-2 border-red-500 dark:border-red-800 rounded-xl px-4 py-3 flex items-center gap-x-3 overflow-x-auto",
      };
    }

    if (type === "info") {
      return {
        icon: <InformationCircleIcon className="size-6 shrink-0" />,
        classes:
          "font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-100 border-2 border-blue-500 dark:border-blue-800 rounded-xl px-4 py-3 flex items-center gap-x-3 overflow-x-auto",
      };
    }
  }, [type]);

  return (
    <div className={`${infos?.classes} ${className}`}>
      {infos?.icon}
      <div>{children}</div>
    </div>
  );
}
