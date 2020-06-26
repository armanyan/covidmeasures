import { Component, OnInit, Input } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

    public pieChart: Chart;
    // REQUIRED
    @Input() data: Array<number> = []; // holds data to be display
    @Input() labels: Array<string> = []; // labels for data
    // OPTIONAL
    @Input() backgroundColor?: Array<string>; // background color for pie
    @Input() labelFontColor?: string = '#333';
    @Input() responsive?: boolean = true; // responsivness
    @Input() maintainAspectRatio?: boolean = true; // aspect ratio
    @Input() legendDisplay?: boolean = true; 
    @Input() lagendPosition?: string = 'top';
    @Input() legendAlign?: string = 'center';

    constructor() { }

    ngOnInit(): void {
        const ctx = (document.getElementById('pie_chart') as any).getContext('2d');
        this.pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                datasets: [{
                    backgroundColor: this.backgroundColor,
                    data: this.data
                }],
                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: this.labels
            },
            options: {
                responsive: this.responsive,
                maintainAspectRatio: this.maintainAspectRatio,
                scales: {},
                legend: {
                    display: this.legendDisplay,
                    position: this.lagendPosition,
                    align: this.legendAlign,
                    labels: {
                        fontColor: this.labelFontColor
                    }
                }
            }
        });
    }
}
