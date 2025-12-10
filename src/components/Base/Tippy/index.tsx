import React, { createRef, useEffect } from "react";
import "@/assets/css/vendors/tippy.css";
import tippy, {
  PopperElement,
  Props,
  roundArrow,
  animateFill as animateFillPlugin,
} from "tippy.js";
import clsx from "clsx";

// Define PolymorphicComponentPropWithRef for polymorphic component support
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PolymorphicComponentProp<C extends React.ElementType, Props = {}> = 
  Props & AsProp<C> & Omit<React.ComponentPropsWithoutRef<C>, keyof Props>;

type PolymorphicComponentPropWithRef<C extends React.ElementType, Props = {}> = 
  PolymorphicComponentProp<C, Props> & { ref?: React.Ref<React.ElementType> };

// Define props for Tippy component
type TippyProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<
  C,
  {
    getRef?: (el: PopperElement | null) => void;
    content: string;
    options?: Partial<Props>;
  }
>;

const init = <C extends React.ElementType>(
  el: PopperElement,
  props: TippyProps<C>
) => {
  tippy(el, {
    plugins: [animateFillPlugin],
    content: props.content,
    arrow: roundArrow,
    popperOptions: {
      modifiers: [
        {
          name: "preventOverflow",
          options: {
            rootBoundary: "viewport",
          },
        },
      ],
    },
    animateFill: false,
    animation: "shift-away",
    ...props.options,
  });
};

const Tippy = <C extends React.ElementType = "span">(props: TippyProps<C>) => {
  const tippyRef = createRef<PopperElement>();
  const Component = props.as || "span";

  useEffect(() => {
    if (props.getRef) {
      props.getRef(tippyRef.current);
    }

    if (tippyRef.current !== null) {
      init<C>(tippyRef.current, props);
    }
  }, [props.content]);

  const { className, ...computedProps } = props;
  return (
    <Component
      ref={tippyRef}
      className={clsx(["cursor-pointer", className])}
      {...computedProps}
    >
      {props.children}
    </Component>
  );
};

export default Tippy;
