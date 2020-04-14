import Chart from 'chart.js';

import * as countriesData from './data/countries';
import * as closureData from './data/school_closure';
import * as alpha2 from './data/alpha2';
import * as alpha3 from './data/alpha3';

export const insertToArray = (arr, element, index) => {
  arr.splice(index, 0, element);
}

export const ageRanges = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'];

export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const getRegionByAlpha = (alpha: string) => {
  const country = alpha.length === 2 ? alpha2.default[alpha] : alpha3.default[alpha];
  return country.region === "Americas" ? country["sub-region"] : country["region"];
}

export const getAlpha3FromAlpha2 = (alpha: string) => {
  return alpha2.default[alpha]['alpha-3'];
}

export const getCountryNameByAlpha = (alpha: string) => {
  const country = alpha.length === 2 ? alpha2.default[alpha] : alpha3.default[alpha];
  return country.name;
}

export const getChildrenNoSchoolByAlpha3 = (alpha3: string) => {
  for (const country of countriesData.default) {
    if (country["alpha3"] === alpha3) {
      return country.population["0-9"] + country.population["10-19"]
    }
  }
}

export const getSchoolPopulationByAlpha3 = (alpha3: string) => {
  for (const country of closureData.default.countries) {
    if (country["alpha3"] === alpha3) {
      return country.children_no_school;
    }
  }
}

const standardTooltip = (tooltipItem: any, values: any) => {
  return Math.floor(tooltipItem.xLabel).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const createPieChart = (
  ctx: CanvasRenderingContext2D, labels: string[], dataset: number[], backgroundColor: string[]
) => {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        backgroundColor,
        data: dataset
      }]
    },
    options: {
      legend: {
        display: true
      },
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        callbacks: {
          label: function(tooltipItem, data) {
            // get the data label and data value to display
            // convert the data value to local string so it uses a comma separated number
            var dataLabel = data.labels[tooltipItem.index];
            var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
  
            // make this isn't a multi-line label (e.g. [["label 1 - line 1, "line 2, ], [etc...]])
            if (Chart.helpers.isArray(dataLabel)) {
              // show value on first line of multiline label
              // need to clone because we are changing the value
              dataLabel = dataLabel.slice();
              dataLabel[0] += value;
            } else {
              dataLabel += value;
            }
  
            // return the text to display on the tooltip
            return dataLabel;
          }
        }
      },
    }
  })
}

export const createVerticalBarChart = (
  ctx: CanvasRenderingContext2D, labels: string[], dataset: number[], backgroundColor: string[]
) => {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        backgroundColor,
        data: dataset
      }]
    },
    options: {
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        mode: "nearest",
        intersect: false,
        position: "nearest",
        callbacks: {
          label: function(tooltipItem: any) {
            return tooltipItem.yLabel+"%";
          }
        }
      },
    }
  });
}

export const createBarChart = (
  ctx: CanvasRenderingContext2D, labels: string[], dataset: number[], backgroundColor: string[], customTooltip = standardTooltip
) => {
  return new Chart(ctx, {
    type: 'horizontalBar',
    responsive: true,
    legend: {
      display: false
    },
    data: {
      labels,
      datasets: [{
        backgroundColor,
        data: dataset,
      }]
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      showAllTooltips: true,
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        callbacks: {
          label: function(tooltipItem, values) {
            return customTooltip(tooltipItem, values);
          }
        }
      },
      responsive: true,
      scales: {
        yAxes: [{
    
          gridLines: {
            color: 'rgba(29,140,248,0.1)',
          },
          ticks: {
            padding: 0,
            fontColor: "#9e9e9e"
          }
        }],
    
        xAxes: [{
    
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            userCallback: function(value) {
              value = value.toString();
              value = value.split(/(?=(?:...)*$)/);
              value = value.join(',');
              return value;
            },
            padding: 0,
            fontColor: "#9e9e9e"
          }
        }]
      }
    }
  });
}

export const createStackedBarChart = (
  ctx: CanvasRenderingContext2D, labels: string[],
  dataset1: number[], backgroundColor1: string[], label1: string,
  dataset2: number[], backgroundColor2: string[], label2: string
) => {
  return new Chart(ctx, {
    type: 'horizontalBar',
    responsive: true,
    data: {
      labels,
      datasets: [{
        label: label1,
        backgroundColor: backgroundColor1,
        data: dataset1,
      },
      {
        label: label2,
        backgroundColor: backgroundColor2,
        data: dataset2,
      }]
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        display: true
      },
      showAllTooltips: true,
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        callbacks: {
          label: function(tooltipItem: any) {
            return Math.floor(tooltipItem.xLabel).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        }
      },
      responsive: true,
      scales: {
        yAxes: [{
          stacked: true,
          gridLines: {
            color: 'rgba(29,140,248,0.1)',
          },
          ticks: {
            padding: 0,
            fontColor: "#9e9e9e"
          }
        }],
    
        xAxes: [{
          stacked: true,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            userCallback: function(value) {
              value = value.toString();
              value = value.split(/(?=(?:...)*$)/);
              value = value.join(',');
              return value;
            },
            padding: 0,
            fontColor: "#9e9e9e"
          }
        }]
      }
    }
  });
}

export const createLineChart = (ctx: CanvasRenderingContext2D, labels: string[], dataset: number[]) => {
  const data = {
    labels,
    datasets: [{
        borderColor: "#3399FF",
        data: dataset
      },
    ]
  };

  const options = {
    legend: {
      display: false
    },

    tooltips: {
      callbacks: {
        label: function(tooltipItem: any) {
          return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      }
    },

    scales: {
      yAxes: [{

        ticks: {
          userCallback: function(value, index, values) {
            value = value.toString();
            value = value.split(/(?=(?:...)*$)/);
            value = value.join(',');
            return value;
          },
          fontColor: "#9f9f9f",
          beginAtZero: false
        },
        gridLines: {
          drawBorder: false,
          zeroLineColor: "#ccc",
          color: 'rgba(0,0,0,0.05)'
        }

      }],

      xAxes: [{
        barPercentage: 1.6,
        gridLines: {
          drawBorder: false,
          color: 'rgba(255,255,255,0.1)',
          zeroLineColor: "transparent",
          display: true,
        },
        // label format
        ticks: {
          padding: 20,
          fontColor: "#9f9f9f"
        }
      }]
    },
  }

  return new Chart(ctx, { type: 'line', data, options});
}