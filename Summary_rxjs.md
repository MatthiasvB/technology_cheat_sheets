## Patterns and Recipes
This is mostly stolen from Dominic Elm and Kwinten Pisman's talk [RxJS Recipes](https://www.youtube.com/watch?v=W8T3eqUEOSI) from the Uphill Conf 2019

**These are the basics for RxJS that you should learn to get used to using operators**

So, if you have a requirement, try to define the **what**, the **when** and the **how** of that requirement. Just a good place to start. Examples for such an analysis are given with each pattern. 

### Repeater
Work that needs to be executed `n` times (`n > 1`).  
Example:  
<q>The list of jokes should be updated every 5 seconds</q>
- **What**: *Result*: `cachedJokes$` that updates every 5 seconds
- **When**: *Trigger*: every 5 seconds
- **How**: *Pattern*: when the trigger fires, send HTTP request to fetch the list of jokes
```typescript
const result$ = trigger$.pipe(
    <flatteningOperator>(_ => work$)
);
```

### Enricher
Lazily enrich a stream with data when the trigger fires  
Example:  
<q>When new data is available, the user has to manually request the latest version of the jokes to be shown on the screen</q>
- **What**: *Result*: `jokes$` that is updated on demand when the trigger fires
- **When**: *Trigger*: when the user manually requests the data
- **How**: *Pattern*: extracting the most recent version of the data from the cache
```typescript
const result$ = trigger$.pipe(
    withLatestFrom(enricherSource$),
    map(([trigger, data] => <data>))
);
```

### Group Aggregator
Whenever the result is an `Observable<boolean>`  
Example:  
<q>If an  update is available, the user should see a notification to update the list of jokes</q>
- **What**: *Result*: `showNotification$` that hides or shews a notification
- **When**: *Trigger*: when an update is available (or none is available)
- **How**: *Pattern*: create two triggers (show and hide) and merge them
```typescript
const FT$ = falseTrigger$.pipe(mapTo(false));
const TT$ = trueTrigger$.pipe(mapTo(true));

const result$ = merge(FT$, TT$);
```

### State Manager
State that needs to be reactively managed  
Example:  
<q>The user should be able to manage settings, that can be updated in a dialog</q>
- **What**: *Result*: `settings$` that encapsulates state
- **When**: *Trigger*: when the user changes one of the settings
- **How**: *Pattern*: keep and update state when the trigger fires
```typescript
const result$ = trigger$.pipe(
    scan((prevState, updates) => {
        return { ...prevState, ...updates };
    })
);
```

### Work Decider
Work that needs to be stoppend and restarted when some trigger fires  
Example:  
<q>It should be possibe to toggle the notifications and polling</q>
- **What**: *Result*: `jokes$` and `showNotifications$`
- **When**: *Trigger*: `showNotification` or `enablePolling` changes
- **How**: *Pattern*: conditionally stopping and starting the notifications and polling
```typescript
const result$ = trigger$.pipe(
    <flatteningOporator>(condition => {
        if (condition) workA$;
        else workB$;
    })
);
```

### Error Decider (recipe)
Work that needs to be stoppend and restarted when some trigger fires  
Example:  
1. <q>If fetching the list fails we want to retry fetching it.  </q>
2. <q>If we are offline, we only want to retry if we are back online. Otherwise, retry every 1 seconds with max of 5.</q>

1 is easy, use `retryWhen`. Let's discuss 2.

- **What**: *Result*: `cachedJokes$`
- **When**: *Trigger*: when an error occurs (call to backend fails)
- **How**: *Pattern*: if we are offline, do 1. (retry when online)  
otherwise do 2 (retry every second, max 5)
```typescript
const result$ = trigger$.pipe(
    retryWhen(error$ => {
        return error$.pipe(switchMap(_ => {
            if (condition) workA$;
            else workB$;
        }))
    })
);
```

### ???
???  
Example:  
<q></q>
- **What**: *Result*: 
- **When**: *Trigger*: 
- **How**: *Pattern*: 
```typescript

```