import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservation-status-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatSelectModule, FormsModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Update Reservation Status</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="selectedStatus">
          <mat-option *ngFor="let status of availableStatuses" [value]="status.value">
            {{status.label}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button color="primary" (click)="onConfirm()">Update</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      min-width: 300px;
    }
    mat-dialog-actions {
      justify-content: flex-end;
    }
  `]
})
export class ReservationStatusDialogComponent {
  selectedStatus: string;
  availableStatuses: { value: string, label: string }[] = [];

  constructor(
    public dialogRef: MatDialogRef<ReservationStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStatus: string, startDate: Date }
  ) {
    this.selectedStatus = data.currentStatus;
    this.setAvailableStatuses(data.currentStatus, data.startDate);
  }

  setAvailableStatuses(currentStatus: string, startDate: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationStart = new Date(startDate);
    reservationStart.setHours(0, 0, 0, 0);

    switch (currentStatus) {
      case 'pending':
        this.availableStatuses = [
          { value: 'pending', label: 'Pending' },
          { value: 'active', label: 'Pick Up' }
        ];
        break;
      case 'active':
        if (today >= reservationStart) {
          this.availableStatuses = [
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Drop Off' }
          ];
        } else {
          this.availableStatuses = [
            { value: 'active', label: 'Active' }
          ];
        }
        break;
      default:
        this.availableStatuses = [
          { value: currentStatus, label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) }
        ];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.selectedStatus);
  }
}