/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import "@/assets/css/vendors/litepicker.css";
import { createRef, useEffect, useRef } from "react";
import { setValue, init, reInit } from "./litepicker";
import LitepickerJs from "litepicker";
import { FormInput } from "@/components/Base/Form";
import { ILPConfiguration } from "litepicker/dist/types/interfaces";
import dayjs from "dayjs";

export interface LitepickerElement extends HTMLInputElement {
  litePickerInstance: LitepickerJs;
}

type LitepickerConfig = Partial<ILPConfiguration>;

export interface LitepickerProps
  extends React.PropsWithChildren,
  Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  options: {
    format?: string | undefined;
  } & LitepickerConfig;
  onChange: (e: { target: { value: string } }) => void;
  value?: string;
  getRef?: (el: LitepickerElement) => void;
  enforceRange?: boolean; // New flag to enable/disable range restriction
}

function Litepicker({
  options = {},
  value,
  onChange = () => { },
  getRef = () => { },
  enforceRange = true,
  ...computedProps
}: LitepickerProps) {
   const today = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  // const past15Days = new Date();
  // past15Days.setDate(today.getDate() - 14);


  const defaultValue = options?.singleMode ? today : `${today} - ${today}`;

  const props = {
    options: {
      singleMode: false,
      format: "YYYY-MM-DD",
      autoApply: true,
      numberOfMonths: 1, //show only one calender
      numberOfColumns: 1,
      splitView: false,
      maxDate: today, // Ensure maxDate is today
      ...(enforceRange
        ? { maxDays: 15, startDate: today, endDate: today }
        : {}),
      ...options,
    },
    value: value ?? defaultValue,
    onChange: onChange,
    getRef: getRef,
  };

  const litepickerRef = createRef<LitepickerElement>();
  const tempValue = useRef(props.value);
  const initialRender = useRef(true);

  useEffect(() => {
    if (litepickerRef.current) {
      props.getRef(litepickerRef.current);
    }

    if (initialRender.current) {
      setValue(props);
      if (litepickerRef.current) {
        init(litepickerRef.current, props);
      }

      if (props.onChange) {
        props.onChange({
          target: {
            value: props.value,
          },
        });
      }

      initialRender.current = false;
    } else {
      if (tempValue.current !== props.value && litepickerRef.current) {
        reInit(litepickerRef.current, props);
      }
    }

    tempValue.current = props.value;
  }, [props.value]);

  return (
    <FormInput
      ref={litepickerRef}
      type="text"
      value={props.value}
      onChange={(e) => props.onChange?.(e)}
      onKeyDown={(e) => e.preventDefault()}
      {...computedProps}
    />
  );
}

export default Litepicker;
