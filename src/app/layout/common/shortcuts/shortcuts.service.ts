import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';
import { Shortcut } from 'app/layout/common/shortcuts/shortcuts.types';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class ShortcutsService
{
    private _shortcuts: ReplaySubject<Shortcut[]> = new ReplaySubject<Shortcut[]>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _route: Router,)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for shortcuts
     */
    get shortcuts$(): Observable<Shortcut[]>
    {
        return this._shortcuts.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Store shortcuts on the service
     *
     * @param shortcuts
     */
    store(shortcuts: Shortcut[]): Observable<Shortcut[]>
    {
        // Load the shortcuts
        this._shortcuts.next(shortcuts);

        // Return the shortcuts
        return this.shortcuts$;
    }

    /**
     * Create a shortcut
     *
     * @param shortcut
     */
    create(shortcut: Shortcut): Observable<Shortcut>
    {
        return this.shortcuts$.pipe(
            take(1),
            switchMap(shortcuts => this._httpClient.post<Shortcut>('api/common/shortcuts', {shortcut}).pipe(
                map((newShortcut) => {

                    //기존에 있는지 확인
                    // Find the index of the updated shortcut
                    this._shortcuts.subscribe((items: any)=>{
                        const index = items.findIndex(item => item.link === shortcut.link);

                        if(index === -1){
                            //console.log(newShortcut.link);

                            // this._route.events
                            //     .pipe(filter(event => event instanceof NavigationEnd))
                            //     .subscribe((event: NavigationEnd) => {
                            //         console.log('prev:', event.url);
                            //         newShortcut.link = event.url;
                            //
                            //         // Update the shortcut
                            //         this._shortcuts.next([...shortcuts, newShortcut]);
                            //     });

                            // Update the shortcut
                            this._shortcuts.next([...shortcuts, newShortcut]);
                        }
                    });

                    // Return the new shortcut from observable
                    return newShortcut;
                })
            ))
        );
    }

    /**
     * Update the shortcut
     *
     * @param id
     * @param shortcut
     */
    update(id: string, shortcut: Shortcut): Observable<Shortcut>
    {
        return this.shortcuts$.pipe(
            take(1),
            switchMap(shortcuts => this._httpClient.patch<Shortcut>('api/common/shortcuts', {
                id,
                shortcut
            }).pipe(
                map((updatedShortcut: Shortcut) => {

                    // Find the index of the updated shortcut
                    const index = shortcuts.findIndex(item => item.id === id);

                    // Update the shortcut
                    shortcuts[index] = updatedShortcut;

                    // Update the shortcuts
                    this._shortcuts.next(shortcuts);

                    // Return the updated shortcut
                    return updatedShortcut;
                })
            ))
        );
    }

    /**
     * Delete the shortcut
     *
     * @param id
     */
    delete(id: string): Observable<boolean>
    {
        return this.shortcuts$.pipe(
            take(1),
            switchMap(shortcuts => this._httpClient.delete<boolean>('api/common/shortcuts', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted shortcut
                    const index = shortcuts.findIndex(item => item.id === id);

                    // Delete the shortcut
                    shortcuts.splice(index, 1);

                    // Update the shortcuts
                    this._shortcuts.next(shortcuts);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }
}
