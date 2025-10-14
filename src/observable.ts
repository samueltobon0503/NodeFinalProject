import { Observable } from "rxjs";

const observable$ = new Observable<number>(
    suscriber => {
        suscriber.next(1);
        suscriber.next(2);
        suscriber.next(3);
        suscriber.complete();
    }
);

export default observable$;