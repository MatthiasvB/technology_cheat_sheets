# Angular modernization steps
In the past, I have often worked on non-optimal Angular code bases that needed a lot of fixing. Here are the things that are likely to have gone wrong, and how I would fix them.

1. Fix your type system
   - Write _correct_ type definitions for DTOs. Take no shortcuts. If this is messed up, everything is messed up. Time consumption: Medium
   - Enable `strict` mode and fix all the errors (at least superficially, everything else will be a rewrite). Time consumption: High
   - Remove all `any` and type assertions. Especially also stuff like `const user: User = {} as User;`. Time consumption: Medium
2. Rewrite services to use Flux, so _they_ do state management. Or at least write new ones in that style. But careful: Often beginners don't know how to write RxJS without memory leaks. Not an issue with stupid services that just prepare HTTP calls. But a huge issue if you use Flux, and now your Observables don't auto-complete anymore. Consider supporting a legacy syntax using the `first()` operator, and only pass true Flux Observables if a flag is explicitly passed
    ```typescript
    @Injectable()
    export class SomeService {
        // ...
        getSome(id: string, autoUpdate = false) {
            const some$ = this.state.pipe(mapToSomeId(id));
            return autoUpdate ? some$ : some$.pipe(first());
        }
    }
    ```
