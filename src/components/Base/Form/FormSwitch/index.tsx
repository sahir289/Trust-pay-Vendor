import FormCheck, { FormCheckProps, LabelProps } from "../FormCheck";
import { twMerge } from "tailwind-merge";

function FormSwitch(props: FormCheckProps) {
  return <FormCheck {...props}>{props.children}</FormCheck>;
}

FormSwitch.Label = (props: LabelProps) => {
  return <FormCheck.Label {...props}>{props.children}</FormCheck.Label>;
};

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  type: "checkbox";
}

FormSwitch.Input = (props: InputProps) => {
  return (
    <FormCheck.Input
      {...props}
      className={twMerge([
        "w-[38px] h-[24px] p-px rounded-full relative",
        "before:w-[20px] before:h-[20px] before:shadow-[1px_1px_3px_rgba(0,0,0,0.25)] before:transition-[margin-left] before:duration-200 before:ease-in-out before:absolute before:inset-y-0 before:my-auto before:rounded-full",
        props.disabled ? "before:bg-gray-300" : "before:bg-red-500",
        props.disabled ? "bg-gray-200" : "bg-white",
        props.disabled
          ? [
              "checked:border-green-500 checked:bg-gray-500 checked:bg-none",
              "before:checked:ml-[14px] before:checked:bg-gray-300 checked:gray-500",
            ]
          : [
              "checked:border-green-500 checked:bg-none",
              "before:checked:ml-[14px] before:checked:bg-green-500",
            ],
        props.className,
      ])}
    />
  );
};

export default FormSwitch;