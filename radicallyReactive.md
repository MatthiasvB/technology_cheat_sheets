# A radically reactive philosophy
...and how to avoid the pitfalls of hyperreactivity, forced composability, and perhaps other issues.

**This is the first article-like document I wrote about RxJS. It's net exactly beginner friendly (or complete, for that matter). You should check out my articles on [medium](https://medium.com/@matthias.vombruch/radical-reactivity-in-angular-1-5d2de632b38e).**

## What is reactivity
When I speak of reactivity here, I mean that in the context of the Javascript library RxJS. RxJS provides it's core artifact, the Observable, which is to Promises what an Array is to an individual item. It is a stream of (potentially) asynchronously arriving pieces of data.

So what can we do with that?

This is not an easy question to answer. What we can be sure about is that *programming the RxJS way* or *reactively* for the purpose of this text, is less about knowing Observables, Subjects and all of RxJS' operators, but more about adopting an entirely new way to think about how to connect events with their desired outcome. This is no easy task, and in the following I will attempt to shed some light on it.

Read the following code carefully. It takes a long time and is easy to skip, but each snippet introduces a new aspect of RxJS philosophy in condensed form.

## Handle your subscription
To <q>handle your subscriptions</q> is the single most important imperative when using RxJS. For simplicity, assume that any time you don't, you produce a memory leak. In the beginner examples, handling subscriptions does not teach you much. Yet I will (almost) always include this aspect in the snippets, simply because it is so damn important to never forget it! 

## Connecting an event with it's execution logic
The simplest way to use RxJS is in the form of an event-emitter. Consider the following code, perhaps part of an Angular component
```typescript
// ...
class SomeComponent implements OnDestroy {
    // never forget this!
    const subscriptions = new Subscription();

    const buttonClicked$$ = new Subject<void>();
    
    onClickButton() {
        this.buttonClicked$$.next();
    }

    constructor() {
        this subscriptions.add(
            this.buttonClicked$$.subscribe(
                () => console.log('The button was clicked')
            )
        );
    }
    
    ngOnDestroy(): void {
        // Un-register you callbacks, so they don't run indefinetly
        this.subscriptions.unsubscribe()
    }
}
```
Here, we are using a subject, which is an extension of an Observable and functions like an event emitter. That means you can not only listen to the data coming out of it (as with an Observable), you can also instruct it to send data.

Of course, we're not doing anything useful, yet. We might as well just have logged the event directly in the event handler. The point is that the subject *broadcasts* its messages, which allows us to expand the constructor to do multiple things, like
```typescript
constructor() {
    this.subscriptions.add(
        this.buttonClicked$$.subscribe(
            () => console.log('The button was clicked')
        )
    );

    // NEW
    this.subscriptions.add(
        this.buttonClicked$$.subscribe(
            () => alert('You clicked the button!')
        )
    );
}
```
This isn't very useful, either. We could have done both the logging and the alert within the same subscribe block. See this more elaborate example, though:
```typescript
// ...
class SomeComponent implements OnDestroy {
    const subscriptions = new Subscription();

    const buttonClicked$$ = new Subject<number>();

    onClickButton1() {
        this.buttonClicked$$.next(1);
    }

    onClickButton2() {
        this.buttonClicked$$.next(2);
    }

    buttonClickCount = {
        1: 0,
        2: 0
    };


    constructor() {
        this.subscriptions.add(
            this.buttonClicked$$.subscribe(
                () => console.log('A button was clicked')
            )
        );

        this.subscriptions.add(
            this.buttonClicked$$.pipe(
                filter(num => num === 1)
            ).subscribe(
                () => console.log('The button was the first one')
            )
        );

        this.subscriptions.add(
            this.buttonClicked$$.pipe(
                filter(num => num === 2)
            ).subscribe(
                () => console.log('Now it was the second button!')
            )
        );

        this.subscriptions.add(
            this.buttonClicked$$.pipe(
                map(id => (counts: { 1: number, 2: number }) => { ...counts, [id]: counts[id] + 1 }),
                scan(fn, buttonClickCount)
            ).subscribe(
                clickCount => console.log(`In total, button 1 was clicked ${clickCount[1]} times` +
                ` and button 2 was clicked ${clickCount[2]} times`)
            )
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }
}
```
This is a lot to take in. Firstly, we can pass data into our subject. Here, this effectively unified two separate events into one, which are broadcast and can be acted upon by anyone who has access to the subject. Here, four consumers are interested in the event: The first one just loggs when any button was clicked, the second only if it was button 1, and the third when it was button 2. The fourth subscriber is a great deal more interesting, and takes us directly to the next big topic: Flux with pure RxJS.

## Flux home-brewed
Flux is a pattern aimed to centralizing your application state. It works by defining that the source of all truth and the destination of all truth be a central store, and that any event sources and event targets do not communicate directly, but only by means of the store, typically implemented with a single large Javascript object embedded into all kinds of accessor and modification logic. I'm not a Flux guru, but to my understanding the reason one goes through the trouble of setting this up (and one really should) is that the artificial layer of the store provides structure to your project, which makes it more easily understandable, and that it decouples event source and event target, making subsequent modifications to their interactions extremely straightforward: You'll know exactly where to make the change without affecting other parts of your application, and you'll be able to so easily, because now you have multiple layers between source and target, where your modification logic can reside.

Reduced to its essence, this construct may look very similar to what we've already glimpsed at in the previous chapter. I'll extend that a little to make it more clear:
```typescript
// ...

interface State {
    buttonClickCount: {
        1: number,
        2: number
    },
    otherData: any,
    // ...
}

const initialState: State = {
    buttonClickCount: {
        1: 0,
        2: 0,
    },
    otherData: '',
    // ...
}

export class Store {
    // get all source observables

    public readonly state$ = merge(
        this.buttonClicked$$.pipe(
            map(id => (state: State) => {
                ...state,
                buttonClickCount: { ...state.buttonClickCount, [id]: counts[id] + 1 }
            }),
        ),
        this.someOtherEvent$.pipe(someOtherLogic(), map(otherData => (state: State) => {
            ...state,
            otherData
        })),
        // ...
    ).pipe(
        // process the state using the logic attached to each registered event
        scan((oldState, fn) => fn(oldState), initialState),

        // data should be available immediately, not just after the first event
        startWith(initialState),

        // don't run all logic for each subscriber, share the store!
        shareReplay(1)
    );
}
```
There are a few important patterns used in this Store.

The first pattern is that each incoming event is mapped to a higher order function that can modify the current state according to the data the event receives. This function is always of the form 
```typescript
type StateModifier<T> = (data: T) => (state: State) => State
```
The first stage is executed by the RxJS `map()` operator. It creates a new function that uses Closure to encapsulate the event data, passing on a function
```typescript
type StateMapper = (state: State) => State
```
which takes `State` and returns `State`, but the new state is modified using the data encapsulated in that function.

The second pattern is immutability. Never, never, never just modify the state. Replace it, and any of its nested objects that have been modified by new objects. This is crucial if you use a Javascript framework that has a change detection mechanism based on object identity. Which as far as I know is the defacto approach of how to do this. Also, adhering to this pattern may allow you to easily optimize how data is read from the Store, later on. Plus it simply is a functional programming best practice.

Immutability is hard to enforce, but all other patterns shown here can be encapsulated in the following Store factory function:
```typescript
export function createStore$<T>(initialState: T, observables$: Observable<(state: T) => T>[]): Observable<T> {
  const store$ =  merge(
    ...observables$
  ).pipe(
    scan((state: T, fn: (oldState: T) => T) => fn(state), initialState),
    startWith(initialState),
    shareReplay(1)
  );
  return store$;
}
```
Nothing should go wrong when you use this factory to create your Stores and never forget the immutability imperative.

We have created the heart of our Store. How do we connect the organs?

## Composition
First, let us consider how we connect the eyes and ears, meaning the events our application fires, to the store.
### When it works
Consider the case when you have a Service, perhaps an AuthService that handles your app's login functionality. If you're using a framework like Angular, which povides dependency injection (DI) functionality, there are two distinct approaches of how to do this:
#### Approach 1: Not so good
You can package your Store into an injectable StoreService. For every distinct functionality that may alter the Store, you provide a Subject with a distinct signature. Any other Service or Component that wants to alter the store has it injected. An event that occurs is `.pipe(map(...))`ed to an Observable of the same type as one of the Subjects provided by the Store, and this Subject subscribes to the Observable. This could look like this:
```typescript
// StoreService.ts
// ...

export interface State {
    isLoggedIn: boolean,
    otherData: OtherType,
    // ...
}

const initialState: State = {
    isLoggedIn: false,
    otherData: { bla: 'blu' },
    // ...
}

@Injectable({
  providedIn: 'root'
})
class StoreService {
    public readonly isLoggedInInput$$ = new Subject<boolean>();
    public readonly otherInput$$ = new Subject<OtherType>();
    // ...

    public readonly store$ = merge(
        this.isLoggedInInput$$.pipe(
            map(isLoggedIn => (state: State) => {
                ...state,
                isLoggedIn
            }),
        ),
        this.otherInput$$.pipe(someOtherLogic(), map(otherData => (state: State) => {
            ...state,
            otherData
        })),
        // ...
    ).pipe(
        scan((oldState, fn) => fn(oldState), initialState),
        startWith(initialState),
        shareReplay(1)
    );
}
```
```typescript
// AuthService.ts
// ...
@Injectable({
  providedIn: 'root'
})
class AuthService {
    private readonly login$: Observable<void> = getSomethingThatFiresUponLogin();
    private readonly logout$: Observable<void> = getSomethingThatFiresUponLogout();

    constructor(
        private readonly storeService: StoreService
    ) {
        const storeIsLoggedInInput$$: Subject<boolean> = this.storeService.isLoggedInInput$$;
        merge(
            this.login$.pipe(map(() => true)),
            this.logout$.pipe(map(() => false))
        ).subscribe(storeIsLoggedInInput$$);
    }
}
```
Undeniably, this will work just fine. But there are some downsides:

**Hard to know what affects the Store**  
Imagine you are the new guy coming into this project. You'll see that there is a Flux-like Store. Cool! You know what kind of things can affect the Store. Cool! But you'll have a difficult time figuring out what *actually* does affect the store. You'll have to use your IDE (which, luckily, you have) to find all usages for the `isLoggedInInput$$`, if there ever is a bug regarding this property. Then you have to check out all these other things that use the input, inspect the logic they have to prepare the data that goes into the input, and do your debugging there, spread out across potentially many files (hopefully, you won't have to do this when login is actually the point of concern...).

Not only is not immediately clear who and what alters the store, no, your debugging will be spread out across many files making the process a lot more tedious, as well.

**Newbies may do newbie stuff**  
So, you're providing a lot of subjects. Which conveniently fire when certain things happen. Newbie, who has recently joined your team, immediately sees the potential in this setup! No need to actually try and understand how this ugly Store works for the small gadget he's going to implement. Quite obviously, there is this handy event source called `isLoggedInInput$$` which will probably fire whenever the login status changes. Newbie decides to just use that, and to do login state management in his own component, cutting the Store out of the loop. 3 months later, you decide to add another input, `isAdminInput$$`. Obviously, if your app recognizes an admin, he must be logged in, so your Store is configured to also set the user to logged in when he is an admin. That really works well across your application, except for this component that Newbie wrote 3 months ago and forgot about 2.5 months ago. Somehow, it doesn't behave as expected when an admin is logged in, just for everyone else.

#### Approach 2: Better
Let's reverse the situation. Instead of using the StoreService in the AuthService, we'll use the AuthService in the StoreService!
```typescript
// AuthService.ts
// ...
@Injectable({
  providedIn: 'root'
})
class AuthService {
    // ...

    public readonly login$: Observable<void> = getSomethingThatFiresUponLogin();
    public readonly logout$: Observable<void> = getSomethingThatFiresUponLogout();
}
```
```typescript
// StoreService.ts
// ...

export interface State {
    isLoggedIn: boolean,
    otherData: OtherType,
    // ...
}

initialState: State = {
    isLoggedIn: false,
    otherData: { bla: 'blu' },
    // ...
}

@Injectable({
  providedIn: 'root'
})
class StoreService {
    constructor (
        private readonly authService: AuthService,
        private readonly otherService: OtherService,
        // ...
    )

    public readonly store$ = merge(
        this.authService.login$.pipe(() => (state: State) => {
            ...state,
            isLoggedIn: true
        }),
        this.authService.logout$.pipe(() => (state: State) => {
            ...state,
            isLoggedIn: false
        }),
        this.otherService.otherInput$$.pipe(someOtherLogic(), map(otherData => (state: State) => {
            ...state,
            otherData
        })),
        // ...
    ).pipe(
        scan((oldState, fn) => fn(oldState), initialState),
        startWith(initialState),
        shareReplay(1)
    );
}
```
Voilà, not only is immediately clear who and what affects the store, there is also no opportunity to abuse dangling false event sources! And as an added bonus, you can alter any mapping logic from event sources to Store input right here right now: A debuggers heaven!

Unfortunately, this pattern quickly reaches its limits when your event sources are not part of an injectable service. Read on to learn more.

### When it does not work
The essence of the pattern above is "take your event source to the Store and map data to the correct format right there". It breakes in two cases:
1. The event source is not injectable. You'll have a hard time injecting a click event of your component's button into the StoreService. That's a nah-uh.
2. The event is generic. Taking things to the store immediately only works when the purpose of the event is well defined. Mapping button clicks of generic components to the Store would be useless even if it was possible: Such events only aquire meaning from the context in which they are used and thus cannot be mapped to the Store in their generic form.

The question is, then, can we find a way to reconcile this pattern with non-injectable events, and, if so, how radical is it useful to be if the goal is to keep your application *as reactive as possible*?

### Approaches to make it work
The first thing that comes to mind when thinking about this challenge is that events that do not originate in a service may still be "placed into a service", and then we can have this service injected in the StoreService. But does that really improve the situation? Or does it only cause more problems. Let's consider some of the mechanisms that could be used, here:

#### Approach 1: Service provides Subjects that can be nexted into
The easiest way would be for a service to have a few public Subjects that the Store can listen to and that Components, which can have the service injected, can `next()` into. However, apart from introducting an additional layer of abstraction, we win nothing with this approach. The StoreService could have provided these Subjects itself, which would have been much clearer. With the service, we first have to go into its file for debugging, again figure out who's using its Subjects, and search there. These subjects will probably be fairly generic, so, again, unless we define one service per component, we'll have mapping logic back at the event source's origin. Also, as before, the Service's subjects could be abused as event sources. Nothing has become better, everything has become worse. Not good.

#### Approach 2: Service has internal Subjects that are made public as Observables and an API to input events
Even more abstraction that wins nothing

#### Approach 3: A centralized register of events
How does Angular's `@Output()` decorator work? Let's analyze what it does, for a minute:

When you decorate a property with `@Output()`, this property becomes available - under the same name - to the current component's parent. Sure, not directly, but anything it emits will trigger the callback you register. In fact, the callback becomes the `next` `observer` of that EventEmitter, which is an extended Subject, for now. For this purpose, Angular must keep a record of this EventEmitter somewhere outside the component, which it can use to provide the emitted events to the parent.

It may be possible to define a similar `@OutputGlobal()` or `@OutputStore()` decorator. I have worked towards this, and have a seriously limited, yet working version of such a thing. Unfortunately, I'm not deep enough into decorators to make it work really well, and I can't find the proper source files for Angular's decorators. At any rate, here's what I have:
```typescript
// decorators/event-enum.ts
export enum eventNames {
  TEST_EVENT
}
```
```typescript
// decorators/event-register.ts
import {Observable, Subject, Subscription} from "rxjs";
import {eventNames} from "./event-enum";

const registeredEvents: { [key: number]: Observable<any> } = {};
const registeredTargets: { [key: number]: Subject<any> } = {};
const registeredSubscriptions: { [key: number]: Subscription } = {};

export function eventForStore(tag: eventNames) {
  return function <T>(source: any, name: PropertyKey) {
    let observable$$: Observable<T> | null;
    const descriptor: { get: () => Observable<T> | null, set: (obs$$: Observable<T>) => void } = {
      get: () => {
        return observable$$;
      },
      set: (obs$$: Observable<T>) => {
        observable$$ = obs$$;
        registeredEvents[tag] = observable$$;
        if (registeredTargets[tag]) {
          if (registeredSubscriptions[tag]) {
            registeredSubscriptions[tag].unsubscribe();
          }
          registeredSubscriptions[tag] = observable$$.subscribe(registeredTargets[tag]);
        }
      }
    }
    Object.defineProperty(source, name, descriptor);
  }
}

export function getEventForStore<T>(tag: eventNames) {
  return function<T>(target: any, name: PropertyKey) {
    const subject$$ = new Subject<T>();
    const descriptor: { get: () => Observable<T> } = {
      get: () => {
        return subject$$.asObservable();
      }
    }
    registeredTargets[tag] = subject$$;
    if (registeredEvents[tag]) {
      if (registeredSubscriptions[tag]) {
        registeredSubscriptions[tag].unsubscribe();
      }
      registeredSubscriptions[tag] = registeredEvents[tag].subscribe(subject$$);
    }
    Object.defineProperty(target, name, descriptor);
  }
}
```
which allows you to do
```typescript
// some.component.ts
// ...

class SomeComponent {
    // ...
    import { eventNames } from '...'

    @eventForStore(eventNames.TEST_EVENT)
    public readonly someEvent$: Observable<void> = getSomethingThatFires();
}
```
```typescript
// StoreService.ts
// ...

export interface State {
    isLoggedIn: boolean,
    otherData: OtherType,
    // ...
}

initialState: State = {
    isLoggedIn: false,
    otherData: { bla: 'blu' },
    // ...
}

// NEW
@getEventForStore(eventNames.TEST_EVENT)
private readonly testObservable$!: Observable<void>;

@Injectable({
  providedIn: 'root'
})
class StoreService {
    constructor (
        private readonly authService: AuthService,
        private readonly otherService: OtherService,
        // ...
    )

    public readonly store$ = merge(
        this.testObservable$.pipe(() => (state: State) => {
            ...state,
            // do something with event
        }),
        this.authService.login$.pipe(() => (state: State) => {
            ...state,
            isLoggedIn: true
        }),
        this.authService.logout$.pipe(() => (state: State) => {
            ...state,
            isLoggedIn: false
        }),
        this.otherService.otherInput$$.pipe(someOtherLogic(), map(otherData => (state: State) => {
            ...state,
            otherData
        })),
        // ...
    ).pipe(
        scan((oldState, fn) => fn(oldState), initialState),
        startWith(initialState),
        shareReplay(1)
    );
}
```
Here's what's **cool** about it: The two decorators establish a 1:1 connection between event source and target. It is impossible to register more than one source, or more than one target at a time. The way it is set up now, a new source or new target will simply take over and destroy the previous connection. Using an enum for allowed inputs to the decorator helps avoid typos and associate the right things. New types of events must be registered in the `eventNames` enum, which means that other developers have it easy to find all types of possible events. The name of the decorators is pretty descriptive and makes it unlikely that someone will use them incorrectly. Perhaps an `@eventForStore()` could even hard code the name of the class in which this event can be used, causing errors when used incorrectly, but that seems overkill. This way, if a developer wants to know where a particular `@getEventForStore()` originates, he can simply do a project-wide search for the string '@eventForStore()' and should be able to locate the source quickly. Mapping logic remains in the StoreService.

Here's what's **not cool**: Typescript decorators seem to not be able to provide type safety, especially for this use-case. Google somehow managed to make the output of `@Output()` type safe, but hey, they are Google. I haven't cracked that yet. But this is a serious limitation. Not only do you have to provide the type for the event you're expecting, you also have to assert that the property will magically appear from somewhere, because Typescript doesn't get it on its own.
From a computational perspective, this approach requires 1 to 2, depending on use-case and app state, additional Subjects/Observables that live in the realm of the decorators, which is quite uncool. I don't think that much can be done about it, though.

Let's see what we really have achieved:
- (Strict) 1:1 mapping of event source and target
- Mapping to target type done near the Store
- Abuse unlikely due to explicit naming
- Very concise syntax with decorators

This is what we lack:
- Type safety
- Computational efficiency

Of course, there is not really a need to do this with decorators. A similar logic could have been implemented more easily with a service. But hey, if you can, you can...


#### Approach 4: Fixing remaining issues
We can fix the remaining issues by doing things more explicitly. Currently, we can identify the event source, but not its type, with the argument of the decorators. If, on the other hand, we could make the type a part of the event itself, we would have no more issues. We would place the actual event data within a wrapper that can identify the type of the message. Then, we could in fact run all our events down the same pipeline, which will become more of a highway, and unpack near the Store by filtering for only those wrappers which we're interested in.

Unfortunately, I'm not the first one to come up with this idea. In fact, I have stolen it. This wrapper is commonly called an Action, which is heavily used by libraries like NgRx. What does that mean for us? It means that putting together your own Flux Store from the basic building blocks of reactive programming can be useful if it is used only for a limited scope, or in very specific use-cases (events coming only from injectable services). It will also certainly teach you much and help understand the Flux idea. However, as you try and harden this concept to allow more general setups, you'll inevitably end up copying existing libraries like NgRx, which were build for exactly this purpose. So, if you can, just use those.

Having a generic highway of self-identifying events instead of many typed pipelines of identical events has further advantages:
- Never search for the right Observable: Everything comes from one spot. If your naming is good, your IDE will be a skillfull assistant in searching for the right filter.
- Combine or transform actions to new actions: You have an operation that requires data from two separate events? Not to worry. `combineLatest()` the streams of all events that you need, do your thing with the data, and map that to a new Action, which will be explicitly listed "near" your Store. Perfectly explicit.
- Complex logic spread out through your App?: No need! Your Component needs to fetch data from an API? No need to make that call in the Component. Just dispatch an Action that requests the data and wait for it to appear in the Store. Effects will handle it for you!
- Weird things happen in your Store and you need to know what's causing them?: Popular libraries like NgRx have their own tab in the DevTools, making debugging a pleasure!
- You want your form content to survive, even if the user hits the reload button?: Just sync your store with LocalStorage and never loose your App's state ever again.

## Reactive Issues
- Two-way binding `[(ngModel)] = 'something'` requires subsription to `something$` in the component, as `[(ngModel)] = 'something$ | async'` can hardly work. Question: Can two-way binding be avoided reliably?
- Reactive forms, contrary to their name, don't take observables as inputs. It is necessary to subscribe to the observables and call the forms `setValue()` and `patchValue()` methods.

### Crossing component borders
A major issue when attempting to code radically reactively is when it becomes necessary to cross component borders, especially with an `*ngFor` property binding. When we code radically reactively, the goal is to pass only observables to child components. However, `*ngFor` can't operate on the observable level. It needs an Iterable (like an array) to work. Imagine our parent component has an observable of an array
```typescript
const records$: Observable<Record[]> = this.store.select(getRecords);
```
which it would like to pass to a number of `RecordViewComponent`s. The straightforward thing would be to just pass the data, not in `Observable` form
```html
<app-record-view *ngFor='let record of (records$ | async)' [record]='record'></app-record-view>
```
which works like a charm. We could say that our parent component, which could be called `RecordListComponent` is a _smart component_ handling the reactivity of things, and delegating other tasks to _dumb components_ like the `RecordViewComponent`. But, would this be _radically reactive_? Could there be cases where we run into trouble with this programming style?

At this point, I'm not sure. But, for the sake of completeness, let's consider how we might achieve a truly reactive flow of data here.

#### Reactive attempt 1
Convert `Observable<T[]>` to `Observable<Observable<T>[]>`.

The way this could be done is simple:
```typescript
const recordsInput$: Observable<Record[]> = this.store.select(getRecords);
const records$: Observable<Observable<Record>[]> = recordsInput$.pipe(
    map(array => array.map(element => of(element)))
);
```
and then we could
```html
<app-record-view *ngFor='let record$ of (records$ | async)' [record$]='record$'></app-record-view>
```
et voilà, we are passing an Observable instead of "raw data".

But really, I think we're just kidding ourselves with this construct. Nothing is gained by this approach in terms of reactivity. Why? Well, what is it that is to be gained with Observable input in any case?

The advantage of having a long lived Observable as an input is that we could use it in complex Observable chains in our components. Maybe the child component also receives data from the store, but we want to be able to overwite this occasionally with other data. No problem
```typescript
@Input() record$!: Observable<Record>;
data$!: Observable<Record>

ngOnInit() {
    this.data$ = merge(
        this.store.select(getRecordByProperty(someProperty)),
        record$
    );
}
```
Such a construct, and I think pretty much only constructs similar to this, which utilize the input-Observable in some kind of long-standing Observable chain, would benefit from an Observable input. However, the construction of the observable chain happens only once, in `ngOnInit()`. If `record$` changes during the lifetime of the component, we have to distinguish two cases:

In our case, `record$` will be a newly created Object. Because it is new, `*ngFor` has no way of knowing which of the initialized components it belongs to, and it will re-initialize them all. This will have a detrimental effect on the performance of our app, particularly, if the child component is a complex one.

If, on the other hand, `record$` would have been constructed differently, and still point to the same memory address, *Angular* would be able to match it to an already initialized component and only update its value. But we can't do that. There is no (straightforward) way to switch out an Observable's inner logic while keeping the same memory address. But this might be an avenue for closer investigation.

By enforcing an "only observables as inputs" policy, we actually significantly deteriorated the performance of our app. This is what I would call "hyperreactivity", as it mimics reactivity but actually is not reactive at all.

Compare this to an approach where we use old-fashioned Objects as inputs. Imagine our data has changed, the parent's `records$` fires and delivers a new array of `Record`s. This array now contains a new `Record`, and also points to a different memory address, because we keep our data immutable. But, notably, all other `Record`s did not change, they are still the same objects. `*ngFor` will have an easy time figuring out that all it needs to do is initialize one new component, everything else remaining as it is.

The problem that remains is that an individual `Record` might change. If everything is done immutably, `*ngFor` can't match the updated `Record` to an existing component, and will have to destroy an existing one while initializing a new one. If we had a way to generate a *long-lived* `Observable` of each `Record`, we could update each component instance as the `Record` is updated. But this will likely not be possible by simply splitting `Observable<Record>` into `Observable<Observable<Record>[]>`.

One approach that might work is to only pass IDs of Records, which could be primitive strings. `*ngFor` can match those to initialized components. So even if you pass an entirely new array of IDs, *Angular* will be able to handle this efficiently by adding or removing instances, without recreating existing ones. But then our `RecordViewComponent` has to be smart and know where to get an `Observable<Record>` from just an ID. This is where radical reactivity will come into conflict with separation of concerns and will leave us unable to produce distinct smart and dumb components. Are we willing to make this deal?

#### Reactive attempt 2
This attempt will be concerned with making Observables re-settable, in the sense that what we pass to `<my-component [obs$]="someObservable$" />` might change over time. As demonstrated by previous examples, it would be very difficult to enforce a programming style that would guarantee that this never happens. Every library we use, and every developer we hire, would have to respect this implicit requirement of our app. Not good.

Additionally, components that are explicitly embedded in our templates might behave differently to those generated by a structural directive like `*ngFor`, because in the first case there is an explicit 1:1 relationship between the data we pass to the component and that component. This is not the case with `*ngFor`: Here, the data can only find "its" component by object reference. If the data changes, the component needs to be re-initialized.

This attempt can't solve the `*ngFor` problem, but it will introduce truly reactive behavior otherwise, albeit at the expense of a lot of boilerplate, for now.

Going back to our records example, imagine our parent component has a reference to an Observable of record-IDs and a method to obtain an `Observable<Record>` from such an ID.

```typescript
// ...
class Parent {
    private readonly recordIds$: Observable<string> = this.store.select(recordIds);
    public readonly records$: Observable<Observable<Record>[]> = this.recordIds$.pipe(
        map(recordIds => recordIds.map(id => this.store.select(getRecordById(id))))
    );
}
```
In this special case, we are also able to fix the `*ngFor` issue, but that may not always be possible.

```html
<app-record-view *ngFor='let _ of recordIds$ | async; let i=index' [record$]='(records$ | async)?[i]' />
```

For this to work well in the component, we have to make sure that a change in what's passed to `record$` does not break the component's logic:

```typescript
// ...
export class RecordViewComponent implements OnDestroy {
    private readonly subscriptions: { [key: string]: Subscription } = {};

    private readonly _record$$ = new ReplaySubject<Record>(1); // TODO: Explain
    @Input() set record$(obs$: Observable<Record>) {
        this.subscriptions.recordSubscription?.unsubscribe();
        this.subscriptions.recordSubscription = obs$.subscribe({
            next: val => this._record$$.next(val),
            error: err => this._record$$.error(err)
        });
    }
    get record$(): Observable<Record> {
        return this._record$$;
    }

    // NEVER forget this
    ngOnDestroy() {
        Object.values(this.subscriptions).forEach(subscription => subscription.unsubscribe());
    }
}
```
Unfortunately, this is a lot more code than just `@Input() record: Record;`, but it does give us an important ability:

We can build complex reactive pipelines that depend on `record$`, because while we pretend that `record$` is just an Observable, it really is a Subject that we can `next()` into behind the scenes. The observable that is passed into the component is not used directly, but acts as a data source for this subject, which never changes itself. Should the source be replaced during the component's lifetime, we make sure to dispose of the old instance/subscription and create a new one.

This is a working method to cross component borders with Observables. Crossing that border by method of property binding is an inherently imperative approach, to which reactivity can only be retrofitted.

We might be able to encapsulate this logic using a new decorator, along the lines of `ReactiveInput()`, which would make this the usual 1-liner, but this would require very in-depth knowledge of *Angular*`s internals, which I don't currently possess. Perhabs I could post a feature request?!

Nonetheless, this approach introduces a lot of boilerplate, and passing in an Observable to only use it to `next()` into a Subject is effort wasted. Also, it requires creating - and handling - a subscription, which should be avoided if at all possible. The following two approaches show two alternatives, which optimize these aspects.

*Addon:*  
**I this particular case**, I mentioned that we have also fixed the issue of `*ngFor` re-initializing components when the input-Observables change. That is the case because `*ngFor` does not operate on an array of (possibly changing) object references. Instead, it operates on an array of primitive ID strings, which are far less likely to change than the object references themselves. This should be a significant improvement and one should attempt to use such a construct whenever possible.  
I have not tested this exact type of code, but a simpler version operating on an array like
```typescript
test_array: { id: string }[];
```
I have then modified this array by appending more elements with different IDs in an immutable fashion like
```typescript
ngOnInit(): void {
    setInterval(() => {
      this.test_array.unshift({ id: this.test_array[0].id + 'a' });
      this.test_array = this.test_array.map(el => ({ ...el }));
    }, 1000);
  }
```
and passing this to a child component
```html
<app-test-child *ngFor="let s of test_array" [input]="s"></app-test-child>
```
where, in the constructor, I logged the `input` parameter.

As expected, when naively iterating over the elements, each modification lead to re-initialization of all components. 

As soon as I adjusted this to
```typescript
test_array: { id: string }[] = [{ id: 'a' }];
get test_ids() {
    return this.test_array.map(obj => obj.id);
}

ngOnInit(): void {
    setInterval(() => {
        this.test_array.unshift({ id: this.test_array[0].id + 'a' });
        this.test_array = this.test_array.map(el => ({ ...el }));
    }, 1000);
}
```
```html
<app-test-child *ngFor="let s of test_ids; let i=index" [input]="test_array[i]"></app-test-child>
```
only *truly* new elements logged their `input`.

To my surprise, this method was even more stable than I had anticipated. I assumed that two identical IDs must confuse `*ngFor`, because I expected it to only be able to distinguish unique strings. However, this was not the case. No matter how hard I tried replacing references and duplicating things, `*ngFor` continued to do an amazing job:
```typescript
// not even this got *ngFor off balance
ngOnInit(): void {
    let flip = false;
    setInterval(() => {
        this.test_array.unshift({ id: `${this.test_array[0].id + (flip ? 'a' : '')}` });
        flip = !flip;
        this.test_array = this.test_array.map(el => ({ id: `${el.id}` + '' }));
    }, 1000);
}
```
So I'm not 100 % sure how `*ngFor` does it, only that you have to do surprisingly little to help it do a great job!

### Reactive attempt 3
The previous method already worked well and was truly reactive. The downsides were that it forces us to handle an additional subscription (per input) and the amount of boilerplate code necessary to set it up. This approach also relies on passing an Observable as an input, but uses a fairly advanced trick to avoid an explicit Subscription: Here goes!
```typescript
// ...
export class RecordViewComponent {
    private readonly _record$$ = new ReplaySubject<Observable<Record>>(1);
    private readonly _record$ = this._record$$.pipe(switchMap(obs$ => obs$));
    @Input() set record$(obs$: Observable<Record>) {
        this._record$$.next(obs$);
    }

    get record$(): Observable<Record> {
        return this._record$
    }
}
```
Okay, now, take a minute and appreciate what we are doing here.

Remember, the goal with respect to the previous approach is to avoid a subscription. We do this by not subscribing to the Observable and `next()`ing its output, but instead to next the entire Observable! So we have a reactive source of a reactive source. Since we can't use this directly, we cleverly use a `switchMap` to actually listen to the data coming from the inner source. `_record$` once again is just an `Observable<Record>`, which we can use as before.

We have to use a `ReplaySubject`, because an input is kinda like a state, and state needs to be available at all times, not just when it changes. A late subscriber should immediately get a value, which would not be the case with a simple `Subject`.

This still is a lot of boilerplate, but it brings us another step closer to an ideal solution. The next step is to re-evaluate our premises. We want something that is *radically reactive*, or at least *as reactive as possible in the Angular context*. Is passing observables into components really the closest thing to that? Or may simpler approaches lead to the same (semi-optimal) results?

#### Reactive attempt 4
This is the point that will make you question why you had to read the previous three attempts. The answer is, it was not necessary, unless you understood some of the advanced RxJS magic we used there, so you'll be able to use it elsewhere. Here, we'll go back to the basics, and it turns out that those are just as effective, since *Angular* will simply not allow us to cross component borders in a truly reactive fashion. So here the simple truth of the matter:

```typescript
// ...
export class RecordViewComponent {
    private readonly _record$$ = new ReplaySubject<Record>(1);
    @Input() set record(record: Record) {
        this._record$$.next(record);
    }

    get record$(): Observable<Record> {
        return this._record$;
    }
}
```
That's it. We won't get closer without extending *Angular* itself.