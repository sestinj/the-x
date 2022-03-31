import React from "react";
import { Button } from "..";

interface LoginButtonProps {
  modalRef: any;
}

const LoginButton = (props: LoginButtonProps) => {
  return (
    <>
      <Button
        onClick={() => {
          props.modalRef.current.hidden = false;
        }}
      >
        Login
      </Button>
    </>
  );
};

export default LoginButton;
