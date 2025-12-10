import React, { MutableRefObject } from "react";

// Define PolymorphicComponentPropWithRef for TypeScript support
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PolymorphicComponentProp<C extends React.ElementType, Props = {}> =
  Props & AsProp<C> & Omit<React.ComponentPropsWithoutRef<C>, keyof Props>;

type PolymorphicComponentPropWithRef<C extends React.ElementType, Props = {}> =
  PolymorphicComponentProp<C, Props> & { ref?: React.Ref<React.ElementType> };

// CKEditor element interface
export interface CkeditorElement extends HTMLDivElement {
  CKEditor: any;
}

// CKEditor props with polymorphic support
export type CkeditorProps<C extends React.ElementType> =
  PolymorphicComponentPropWithRef<
    C,
    {
      value: string;
      config?: any;
      disabled?: boolean;
      onChange: (data: any) => void;
      onFocus?: (evt: any, editor: any) => void;
      onBlur?: (evt: any, editor: any) => void;
      onReady?: (editor: any) => void;
      getRef?: (el: CkeditorElement) => void;
    }
  >;

// Initialize CKEditor instance
const init = async <C extends React.ElementType>(
  el: CkeditorElement,
  editorBuild: any,
  {
    props,
    cacheData,
  }: {
    props: CkeditorProps<C>;
    cacheData: MutableRefObject<string>;
  }
) => {
  if (!el) return;

  // Initial data
  cacheData.current = props.value;
  props.config = { ...props.config, initialData: props.value };

  // Init CKEditor
  const editor = await editorBuild.create(el, props.config);

  // Attach CKEditor instance
  el.CKEditor = editor;

  // Set initial disabled state
  if (props.disabled) {
    editor.enableReadOnlyMode("ckeditor");
  }

  // Handle data changes
  editor.model.document.on("change:data", () => {
    const data = editor.getData();
    cacheData.current = data;
    props.onChange(data);
  });

  // Handle focus event
  editor.editing.view.document.on("focus", (evt: any) => {
    props.onFocus?.(evt, editor);
  });

  // Handle blur event
  editor.editing.view.document.on("blur", (evt: any) => {
    props.onBlur?.(evt, editor);
  });

  // Handle ready event
  props.onReady?.(editor);
};

// Update CKEditor data if it changes externally
const updateData = <C extends React.ElementType>(
  el: CkeditorElement,
  {
    props,
    cacheData,
  }: {
    props: CkeditorProps<C>;
    cacheData: MutableRefObject<string>;
  }
) => {
  if (!el || !el.CKEditor) return;

  if (cacheData.current !== props.value) {
    el.CKEditor.setData(props.value);
  }
};

export { init, updateData };
