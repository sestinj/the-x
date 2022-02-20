import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { primaryHighlight, secondaryDark } from "..";
import { baseDiv, generateHighlightGradient } from "../classes";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function geoBrownianMockData(n: number) {
  const fakeX = [];
  const fakeY = [];
  let last = 1.0;
  for (let i = 0; i < n; i++) {
    fakeX.push(i);
    last = last * (0.99 + Math.random() / 49);
    fakeY.push(last);
  }
  return [fakeX, fakeY];
}

export function LineChart(props: {
  labels: string[];
  width: string;
  height: string;
  x: number[];
  y: number[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
}) {
  //   const [x, y] = geoBrownianMockData(10);
  return (
    <div
      style={{
        backgroundColor: secondaryDark,
        ...baseDiv,
        textAlign: "center",
      }}
    >
      <h3 style={{ margin: "0" }}>{props.title}</h3>
      <Line
        plugins={
          {
            title: {
              text: props.title,
            },
            legend: {
              display: false,
            },
          } as any
        }
        width={props.width}
        title={props.title}
        height={props.height}
        options={{
          elements: { point: { radius: 0, hitRadius: 20 } },
          scales: {
            x: {
              title: {
                text: props.xLabel,
                display: props.xLabel ? true : false,
              },
            },
            y: {
              title: {
                text: props.yLabel,
                display: props.yLabel ? true : false,
              },
            },
          },
        }}
        data={{
          labels: props.x,
          datasets: [
            {
              label: "Price",
              data: props.y,
              fill: true,
              borderColor: primaryHighlight,
              backgroundColor: "#0004",
              tension: 0.2,
            },
          ],
        }}
      ></Line>
    </div>
  );
}

export function PieChart(props: { data: { label: string; value: number }[] }) {
  const dataConfig = {
    labels: props.data.map((datum) => datum.label),
    datasets: [
      {
        label: "Portfolio Breakdown",
        data: props.data.map((datum) => datum.value),
        backgroundColor: generateHighlightGradient(props.data.length),
        hoverOffset: 4,
      },
    ],
  };
  return (
    <Pie
      data={dataConfig}
      options={{ responsive: true, maintainAspectRatio: true }}
    ></Pie>
  );
}

// function barChart(data, options: {width?: string, height?: string} = {}) {
//     const id = "barchart" + Math.random().toString();
//     const ctx = new CanvasRenderingContext2D();
//     const chart = new Chart(ctx,{
//         type: 'bar',
//         data: {
//             labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
//             datasets: [{
//                 label: '# of Votes',
//                 data: [12, 19, 3, 5, 2, 3],
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.2)',
//                     'rgba(54, 162, 235, 0.2)',
//                     'rgba(255, 206, 86, 0.2)',
//                     'rgba(75, 192, 192, 0.2)',
//                     'rgba(153, 102, 255, 0.2)',
//                     'rgba(255, 159, 64, 0.2)'
//                 ],
//                 borderColor: [
//                     'rgba(255, 99, 132, 1)',
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)',
//                     'rgba(75, 192, 192, 1)',
//                     'rgba(153, 102, 255, 1)',
//                     'rgba(255, 159, 64, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             scales: {
//                 y: {
//                     beginAtZero: true
//                 }
//             }
//         }
//     }
// )
// }
