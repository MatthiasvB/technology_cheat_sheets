//-----------------------------------------------------------------------

// Possible up to RxJS v6
const event$$ = new Subject<string>();

// value seems to be a string, but really is string | undefined
const subscription = event$$.subscribe(value => {
  console.log(value.toUpperCase()) // 💣 BOOM!
});

event$$.next("You can pass a string"); // ♥
event$$.next(); // 🦴 Submitting undefined, leading to BOOM!
subscription.unsubscribe();

// Solution
class SafeSubject<T> extends Subject<T> {
  next(value: T) { // no undefined allowed!
    super.next(value);
  }
}
const safeEvent$$ = new SafeSubject<string>();
safeEvent$$.next("Still works"); // ♥
safeEvent$$.next(); // ♥ Compile time error

// Also applies to BehaviorSubject, ReplaySubject, AsyncSubject, EventEmitter

//-----------------------------------------------------------------------

interface WithOptional {
  optional?: string;
}

const withOptional: WithOptional | undefined = Math.random() > 0.5 ? { optional: 'foo' } : undefined;

// Type guard
function isNullOrUndefined<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined;
}

if (!isNullOrUndefined(withOptional?.optional)) {
  let x: string;
  x = withOptional.optional; // 🦴 Does not know that withOptional is not undefined
  x = withOptional!.optional; // 🥴 But knows that property exists
}

// "Solution"
if (!isNullOrUndefined(withOptional?.optional)) {
  const noOptional = { // only for TS type flow
    ...withOptional,
    optional: withOptional!.optional,
  };
  let x: string;
  x = noOptional.optional; // works
}

//-----------------------------------------------------------------------

class X {
  getCarColor(v: string) {
    return "blue";
  }
}
const colorService = new X();
class CarService {
  http = new HttpClient('' as any);
  updateCar(car: Car) {
    this.http.post('' as any, car);
  }
  createCar(car: NewCar) {
    this.http.post('' as any, car);
  }
}
const carService = new CarService();


interface Car {
  id: string;
  make: string;
  max_speed: number;
  color: string;
}

function getBreakingDistance(car: Car): number {
  return car.max_speed * 2;
}

const car = <Car>{};
car.max_speed = 250;
car.color = colorService.getCarColor('Porsche');
const breakingDistance = getBreakingDistance(car);
car.make = "Ferrari";
carService.updateCar(car); // 💣 BOOM! 500 Internal Server Error. ID is missing

// Solution
interface NewCar {
  make: string;
  max_speed: number;
  color: string;
}

function getBreakingDistanceSafe(car: Pick<Car, 'max_speed'>): number {
  return car.max_speed * 2;
}

const newCar: NewCar = {
  max_speed: 250,
  color: colorService.getCarColor('Porsche'),
  make: "Ferrari",
};
const breakDistanceAgain = getBreakingDistanceSafe(newCar);

//carService.updateCar(newCar); // Upsi, TS tells me I can't do that
carService.createCar(newCar); // Works
