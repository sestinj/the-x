import React from "react";

interface FormPageProps {
  children: React.ReactChild[] | React.ReactChild | string;
  //   nextStep: () => void;
  //   previousStep: () => void;
}

const FormPage = (props: FormPageProps) => {
  return <div>{props.children}</div>;
};

export default FormPage;
