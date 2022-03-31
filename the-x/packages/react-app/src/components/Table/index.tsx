import React from "react";
import styled from "styled-components";
import { BaseTable } from "..";
import { rounded } from "../classes";

interface TableProps<RowDataType> {
  rowCell: (data: RowDataType) => React.ReactNode[];
  rowData: RowDataType[];
  style?: React.CSSProperties;
  rowStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
  headStyle?: React.CSSProperties;
  rowHeaders?: string[];
  rowAction?: (data: RowDataType) => void;
}

const Hoverable = styled.tr`
  :hover {
    filter: brightness(0.85);
  }
`;

function Table<RowDataType>(props: TableProps<RowDataType>) {
  return (
    <BaseTable style={{ ...props.style, ...rounded }}>
      <tbody>
        {props.rowHeaders && (
          <tr style={props.headStyle}>
            {props.rowHeaders.map((rowHeader, index) => {
              return (
                <th style={{ padding: "8px" }} key={index}>
                  {rowHeader}
                </th>
              );
            })}
          </tr>
        )}
        {props.rowData.map((data: RowDataType, index: number) => {
          return (
            <Hoverable
              onClick={() => {
                props.rowAction && props.rowAction(data);
              }}
              style={{
                ...props.rowStyle,
                cursor: props.rowAction ? "pointer" : "",
              }}
              key={index}
            >
              {props.rowCell(data).map((td, tdIndex) => (
                <td style={props.cellStyle} key={tdIndex}>
                  <div style={{ textAlign: "center" }}>{td}</div>
                </td>
              ))}
            </Hoverable>
          );
        })}
      </tbody>
    </BaseTable>
  );
}

export default Table;
