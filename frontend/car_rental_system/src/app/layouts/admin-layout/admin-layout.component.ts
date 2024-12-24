import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { HomePageComponent } from '../../components/home-page/home-page.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent , HomePageComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar (changeView)="changeView($event)"></app-admin-sidebar>
      <div class="admin-content">
        <app-home-page [activeView]="activeView" ></app-home-page>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
    }
    .admin-content {
      flex: 1;
      padding: 20px;
      margin-left: 60px; /* Space for the collapsed sidebar */
    }
  `]
})
export class AdminLayoutComponent {
  activeView: string = 'CarList'

  changeView(view: any){
    console.log('Received request to: ' + view)
    this.activeView = view
  }
}
