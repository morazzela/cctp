import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/16/solid";
import { ReactNode, useMemo } from "react";

type Props = {
  type: "warning" | "error";
  children: ReactNode;
};

export default function Alert({ type, children }: Props) {
  const infos = useMemo(() => {
    if (type === "warning") {
      return {
        icon: <InformationCircleIcon className="size-6" />,
        classes:
          "font-medium bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-100 border-2 border-orange-500 dark:border-orange-800 rounded-xl px-4 py-3 flex items-center gap-x-3",
      };
    }

    if (type === "error") {
      return {
        icon: <ExclamationTriangleIcon className="size-6" />,
        classes:
          "font-medium bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-100 border-2 border-red-500 dark:border-red-800 rounded-xl px-4 py-3 flex items-center gap-x-3",
      };
    }
  }, [type]);

  return (
    <div className={infos?.classes}>
      {infos?.icon}
      <div>{children}</div>
    </div>
  );
}
