import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NewItemComponent} from "../../../basic-info/items/new-item/new-item.component";
import {MatDialog} from "@angular/material/dialog";
import {NewTeamComponent} from "./new-team/new-team/new-team.component";
import {SessionStore} from "../../../../../core/session/state/session.store";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {Common} from "@teamplat/providers/common/common";
import {User} from "../../../../../core/user/user.model";

@Component({
    selector       : 'settings-team',
    templateUrl    : './team.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsTeamComponent implements OnInit
{
    members: any[];
    teamMembers: User[];
    roles: any[];
    teamEmail: string = '';

    /**
     * Constructor
     */
    constructor( private _matDialog: MatDialog,
                 private _sessionStore: SessionStore,
                 private _codeStore: CodeStore,
                 private _changeDetectorRef: ChangeDetectorRef,
                 private _common: Common)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.memberList();
        // Setup the team members
        this.members = [
            {
                avatar: 'assets/images/avatars/male-01.jpg',
                name  : 'Dejesus Michael',
                email : 'dejesusmichael@mail.org',
                role  : 'admin'
            },
            {
                avatar: 'assets/images/avatars/male-03.jpg',
                name  : 'Mclaughlin Steele',
                email : 'mclaughlinsteele@mail.me',
                role  : 'admin'
            },
            {
                avatar: 'assets/images/avatars/female-02.jpg',
                name  : 'Laverne Dodson',
                email : 'lavernedodson@mail.ca',
                role  : 'write'
            },
            {
                avatar: 'assets/images/avatars/female-03.jpg',
                name  : 'Trudy Berg',
                email : 'trudyberg@mail.us',
                role  : 'read'
            },
            {
                avatar: 'assets/images/avatars/male-07.jpg',
                name  : 'Lamb Underwood',
                email : 'lambunderwood@mail.me',
                role  : 'read'
            },
            {
                avatar: 'assets/images/avatars/male-08.jpg',
                name  : 'Mcleod Wagner',
                email : 'mcleodwagner@mail.biz',
                role  : 'read'
            },
            {
                avatar: 'assets/images/avatars/female-07.jpg',
                name  : 'Shannon Kennedy',
                email : 'shannonkennedy@mail.ca',
                role  : 'read'
            }
        ];

        // Setup the roles
        this.roles = [
            {
                label      : 'ADMIN',
                value      : 'UG10',
                description: '멤버를 추가,삭제 할 수 있으며, UDI 정보를 셋팅할 수 있습니다.'
            },
            {
                label      : 'MEMBER',
                value      : 'UG20',
                description: '멤버를 추가,삭제 할수 없으며, UDI 정보를 셋팅할 수 없습니다.'
            }
        ];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    openAddTeam(): void{
        this._matDialog.open(NewTeamComponent, {
            autoFocus: false,
            data     : {
                teamData: {'id':this.teamEmail}
            },
            maxHeight: '90vh',
            //width: '90vw',
            disableClose: true
        });
    }
    memberList(): void{
        this._common.sendData(this._sessionStore.getValue(),' /v1/api/auth/member-list')
            .subscribe((response: any) => {
                this.teamMembers = response.data;
                this._changeDetectorRef.markForCheck();
            });
    }
}
