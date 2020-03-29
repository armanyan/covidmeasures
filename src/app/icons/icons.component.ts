import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

const lockdown_stats = {
  "values": [
    {
      "country": "USA", "total_cases": 123781, "new_cases": 203, "total_deaths": 2229, "new_deaths": 8, "recovered": 3238
    },
    {
      "country": "Italy", "total_cases": 92472, "new_cases": "N/A", "total_deaths": 10023, "new_deaths": "N/A", "recovered": 12384
    },
    {
      "country": "China", "total_cases": 81439, "new_cases": 45, "total_deaths": 3300, "new_deaths": 5, "recovered": 75448
    }
  ]
}

@Component({
  selector: 'app-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.css']
})
export class IconsComponent implements OnInit {
  displayedColumns: string[] = ['country', 'total_cases', 'new_cases', 'total_deaths', 'new_deaths', 'recovered'];
  dataSource: any;

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor() {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(lockdown_stats.values);
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
