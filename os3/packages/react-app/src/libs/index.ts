import React, { ReactChild, ReactNode, Component } from "react";

export const isAddress = (addressCandidate: string) => {
  return (
    typeof addressCandidate == "string" &&
    addressCandidate.startsWith("0x") &&
    addressCandidate.length == 42
  );
};

// export const findByType = (children: Component[], typeName: string) => {
//   return children.filter((child) => {
//     return child.displayName === typeName;
//   })
// };
