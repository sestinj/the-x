import React from "react";
import { BaseTable } from "..";

interface TableProps<RowDataType> {
  rowCell: (data: RowDataType) => React.ReactNode[];
  rowData: RowDataType[];
  style?: any;
}

function Table<RowDataType>(props: TableProps<RowDataType>) {
  return (
    <BaseTable style={props.style}>
      <tbody>
        {props.rowData.map((data: RowDataType, index: number) => {
          return (
            <tr key={index}>
              {props.rowCell(data).map((td, tdIndex) => (
                <td key={tdIndex}>
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
