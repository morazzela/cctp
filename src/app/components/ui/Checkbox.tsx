type Props = {
  checked: boolean;
  setChecked: { (val: boolean): void };
  disabled?: boolean;
};

export default function Checkbox({ checked, setChecked, disabled }: Props) {
  return (
    <div
      onClick={() => {
        if (!disabled) {
          setChecked(!checked);
        }
      }}
      className={`relative h-6 w-12 cursor-pointer overflow-hidden rounded-full`}
    >
      <div
        className={`absolute inset-0 rounded-full ${disabled ? "bg-text-dark" : "bg-primary-gradient"}`}
      ></div>
      <div
        className={`absolute inset-[2px] rounded-full transition-colors ${checked ? "bg-primary-gradient" : disabled ? "bg-darker" : "bg-dark"}`}
      ></div>
      <div className="absolute inset-0 flex items-center px-1">
        <div
          className={
            `relative size-4 rounded-full transition-all ` +
            (checked
              ? `translate-x-6 bg-dark`
              : disabled
                ? "bg-text-dark"
                : "bg-primary-gradient")
          }
        ></div>
      </div>
    </div>
  );
}
