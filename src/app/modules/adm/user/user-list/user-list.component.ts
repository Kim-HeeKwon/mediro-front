import {AfterViewInit, Component, OnDestroy, OnInit} from "@angular/core";

@Component({
    selector: 'app-admin-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit{
    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }


}
