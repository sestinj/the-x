import React from "react";
import { BaseTable } from "..";

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

function Table<RowDataType>(props: TableProps<RowDataType>) {
  return (
    <BaseTable style={props.style}>
      <tbody>
        {props.rowHeaders && (
          <tr style={props.headStyle}>
            {props.rowHeaders.map((rowHeader, index) => {
              return <th key={index}>{rowHeader}</th>;
            })}
          </tr>
        )}
        {props.rowData.map((data: RowDataType, index: number) => {
          return (
            <tr
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
                  <div>{td}</div>
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </BaseTable>
  );
}

export default Table;
