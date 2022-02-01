import React from "react";
import { useController, UseControllerProps } from "react-hook-form";
import { TextInput } from ".";

type FormValues = {
  FirstName: string;
};

function UIntInput(props: UseControllerProps<FormValues>) {
  const DECIMALS = 18;

  const validate = (value: string): number => {
    const float = parseFloat(value);
    if (!float) {
      return -1;
    }
    if (float <= 0) {
      return -1;
    }
    const integer = Math.round(float * 10 ** DECIMALS);
    if (integer == 0) {
      return -1;
    }
    return integer;
  };

  const { field, fieldState } = useController(props);

  return (
    <div>
      <TextInput
        {...field}
        placeholder={props.name}
        onChange={(ev) => {
          ev.target.value;
        }}
      ></TextInput>
    </div>
  );
}
