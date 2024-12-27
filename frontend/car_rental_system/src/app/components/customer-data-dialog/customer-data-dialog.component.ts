import { Component , Inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule , MatDialogRef , MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-customer-data-dialog',
  standalone: true,
  imports: [ MatButtonModule , MatDialogModule],
  templateUrl: './customer-data-dialog.component.html',
  styleUrl: './customer-data-dialog.component.css'
})
export class CustomerDataDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CustomerDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer:any }
  ) {}
}
