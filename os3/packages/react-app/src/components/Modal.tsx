import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { Fragment, ReactNode } from "react";
import { baseDiv } from "./classes";

// TODO - instead of using props, you should use subcomponents. <Modal.Content>, <Modal.Title>, etc...
export default function Modal(props: {
  open: boolean;
  children: ReactNode[] | ReactNode | string;
  closeModal: () => void;
}) {
  return (
    <Transition appear show={props.open} as={Fragment}>
      <Dialog
        as="div"
        style={{
          position: "fixed",
          inset: "0",
          zIndex: "10",
          overflowY: "auto",
        }}
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => {
          props.closeModal();
        }}
      >
        <div
          className="min-h-screen px-4 text-center"
          style={{
            minHeight: "100vh",
            paddingLeft: "4px",
            paddingRight: "4px",
            textAlign: "center",
          }}
        >
          <Dialog.Overlay
            className="fixed inset-0"
            style={{
              position: "fixed",
              inset: "0",
              backgroundColor: "#00000099",
              zIndex: "-1", // TODO (issue rn is you can't exit by clicking on overlay. This might be solved with just onClick)
            }}
            onClick={() => {
              props.closeModal();
            }}
          />
          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            style={{
              display: "inline-block",
              height: "100vh",
              verticalAlign: "middle",
            }}
            aria-hidden="true"
          >
            &#8203;
          </span>

          <div
            className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            style={{
              display: "inline-block",
              width: "100%",
              maxWidth: "28rem",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "8px",
              overflow: "hidden",
              textAlign: "left",
              verticalAlign: "middle",
              transitionProperty: "all",
              transitionDuration: "150ms",
              transitionTimingFunction: "linear",
              backgroundColor: "white",
              boxShadow: "2px 2px black",
              borderRadius: "18px",
            }}
          >
            <XIcon
              width="30px"
              height="30px"
              onClick={() => {
                props.closeModal();
              }}
              style={{
                float: "right",
                cursor: "pointer",
              }}
            ></XIcon>
            <div
              style={{
                ...baseDiv,
                maxHeight: "75vh",
              }}
            >
              {props.children}
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
