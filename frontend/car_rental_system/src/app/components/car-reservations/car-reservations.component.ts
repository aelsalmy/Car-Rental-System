import { Component , OnInit , inject} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { ReservationService } from '../../services/reservation.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog , MatDialogModule } from '@angular/material/dialog';
import { CustomerDataDialogComponent } from '../customer-data-dialog/customer-data-dialog.component';

@Component({
  selector: 'app-car-reservations',
  standalone: true,
  imports: [MatListModule , MatCardModule , CommonModule , MatIconModule , MatButtonModule , MatDialogModule],
  templateUrl: './car-reservations.component.html',
  styleUrl: './car-reservations.component.css'
})
export class CarReservationsComponent {
    reservations: any[] = [];
    readonly dialog = inject(MatDialog);

    constructor(private reservationService: ReservationService){}

    ngOnInit() {
      this.loadReservations();
    }

    loadReservations(){
      this.reservationService.getAllReservations().subscribe({
          next: (reservations) => {
              console.log('Reservations: ');
              console.log(reservations);
              this.reservations = reservations;
          }
      });
    }

    openCustomerDialog(currCustomer: any){
      const dialogRef = this.dialog.open(CustomerDataDialogComponent , {
        data: {
          customer: currCustomer
        }
      });
    }

    onDelete(reservationId: any){
      this.reservationService.deleteReservation(reservationId).subscribe({
        next:() => {
          console.log('reservation deleted');
          this.reservations = this.reservations.filter(reservation => reservation.id == reservationId); 
        }
      })
    }
}
