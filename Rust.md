# Rust

## Get started / Commands

- `cargo new <name>` creates a new project
- `cargo run` executes it

## Printing stuff

```rust
let _dec = 255;
println!("dec: {}", _dec); // This is a makro, shown by "!"
```

## Mutability

Rust is very strict about what you can mutate, and when. That makes it difficult to start, but is a huge advantage later on.

By default every variable (created with the `let` keyword) is constant.

```rust
let variable = 4; // can't change this
```

If you want to have a mutable variable, you have to make it explicit by using `let mut`). That's opposite to most other languages.

```rust
let mut variable = 4;
variable = 5; // works
```

## Datatypes

### Primitives

- Integers: `i8 i16 i32 i64 i128`. Default: `i32`.
- Unsigned integers: `u8 u16 u32 u64 u128`. Default: No default.
- Variable size integer: `usize isize`. `u32 i32` on 32 bit machines, `u64 i64` on 64 bit machines.
- Floats: `f32 f64`. Default: `f64`.
- Boolean: `bool`, can be `true` or `false`.
- Chars `char`.

### Strings

Strings aren't that simple. There's not just "a string".

```rust
let s = "Hello world!"; // type: &str
```

```rust
let name = "Daniel"; // &str
let greeting = format!("Hello {name} nice to meed you"); // String
println!("{}", greeting); // print it like that
```

Okay, here more details:

- `String` is like what we usually know. Variable size. Just something in memory (the heap)
- String literals like "Hello": Immutable, with fixed size. They are written into the binary and live as long as your program runs.
- `&str` is a string slice (hint: &rarr; borrowing)

Something good to know: String indexing is byte and not char based! Strings are UTF-8 based. UTF-8 characters take between 1 and 4 bytes. So to get the `x`th character, it's probably not `&myString[x]`! Sucks. But what do we win? Well, UTF-8 support!

So, how _do_ we index strings? Not with numbers!

```rust
for b in myString.bytes() {
    // do something with the i8 that is b
}

for c in myString.chars() {
    // do something with the char that is c
}
```

How to make a `String`? Many methods. One is

```rust
let hi = String::from("Hi");
hi.push('i'); // Krrrck, error, immutable!

let mut ho = String::from("Ho");
ho.push('o'); // works


let byeBye = "Bye bye".to_owned(); // type: String
```

When writing functions that deal with strings, we may not care if we have `String` or a string literal. `&str` works for both.

```rust
fn work_with_string(myStr: &str) {
    myStr
}

fn main() {
    work_with_string(String::from("hoho")); // fine
    work_with_string("hihi"); // also fine ;)
}
```

### Arrays

Arrays can be created using literals

```rust
let myArray = [1, 2, 3, 4, 5]; // type: [i32; 5]
```

There's a special syntax to create arrays with arbitrary length, containing a given value

```rust
let myArr = [1337; 100]; // type: [i32; 100]
```

You access elements as usual: `let element = myArr[3];`. There's magic happening here! The way we defined the arrays above, you can see that the length is part of the type. Means: Try indexing with an index that's too high, and the compiler will scream at you. How powerful this is with dynamically created arrays I have yet to find out.

If you want to log arrays to the console, it's not as straightforward as with strings. There are two ways:

```rust
println!("{:?}", myArray); // put the entire array into one line
println!("{:#?}", myArray); // put every element on its own line
```

You can _slice_ arrays, as in extract a certain portion of it. You'll know it if you know numpy ;)

```rust
let sliceA = &myArr[1..4]; // elements 1 through 3 of myArr
let sliceB = &myArr[1..=4]; // elements 1 through 4 of myArr
```

To accept an array slice in a function, do

```rust
fn print_slice(slice: &[i32]) {
    println!("Slice: {:?}", slice);
}
```

### Tuples

Fixed length, different data types.

```rust
let tuple = (500, "hi", true);
let element = tuple.1 // "hi"
```

Destructuring works

```rust
let tuple = (500, "hi", true);
let (myNum, myString, myBool) = tuple;
```

### Structs

Structs are constructs that hold collections of well defined data. Like Python dictionaries, or Javascript Objects, only much stricter. Maybe like Java dataclasses?

```rust
#[derive(Debug)] // <- optional, to make it printable
struct User {
    is_admin: bool,
    username: String,
    password: String,
}

fn build_admin(username: String, password: String) -> User {
    User {
        is_admin: true,
        username, // variable name same as key? Make it simple!
        password,
    }
}
```

Keys are accessed like `myUser.is_admin`.

You can add functionality to structs. Like methods. But their more loosely attached. This makes the language _like_ object oriented, but not quite. For example, there is no inheritance.

// ?? What is the scope of these functions?

```rust
#[derive(Debug)]
struct Circle {
    radius: f32,
}

impl Circle {
    fn compute_area(&self) -> f32 {
        std::f32::consts::PI * self.radius * self.radius
    }

    fn compute_circumference(&self) -> f32 {
        2.0 * std::f32::consts::PI * self.radius
    }

    fn smaller(&self, other: &Self) ->bool { // &self is own value, &Self is own type
        self.radius < other.radius
    }
}

fn main() {
    let c1 = Circle { radius: 1.0 };
    let c2 = Circle { radius: 2.0 };

    println!("Area: {}", c1.compute_area());
    println!("Circumference: {}", c1.compute_circumference());
    println!("c1 < c2: {}", c1.smaller(&c2));
}
```

### Enums

An enum is a data type that defines a set of named values that represent a collection of distinct elements or members (~~copyright~~ ChatGPT). This how to define them in Rust. Pretty standard.

```rust
#[derive(Debug)] // <- optional. To be able to print them. PremissionLevel::Admin prints "Admin"
enum PermissionLevel {
    Admin,
    User,
    Instructor
}

let user = PermissionLevel::User;
println!("{:?}", user);
```

Now to the whacky stuff. We can attach logic to enums. Aka sort of object oriented programming.

```rust
enum PermissionLevel {
    Admin,
    User,
    Instructor
}

impl PermissionLevel {
    fn description(&self) -> String {
        match self {
            PermissionLevel::Admin => String::from("I am an Admin"),
            PermissionLevel::User => String::from("I am a User"),
            PermissionLevel::Instructor => String::from("I am an Instructor"),
        }
    }
}
```

That ain't whacky enough? No worries! Your enum keys need not be integers. They can be anything. And you can even mix types. And assign values to enum keys. Yeah. Brainfuck

```rust
#[derive(Debug)]
enum LoginData {
    None,
    Username(String),
}

fn main() {
    let none_user = LoginData::None;
    println!("{:?}", none_user); // -> None

    let admin = LoginData::Username(String::from("Matthias"));
    println!("{:?}", admin); // -> Username("Matthias")
}
```

### Vectors

A vector is ... uhm ... a list, I believe.

```rust
let mut nums: Vec<i32> = vec![]; // need to specify type cause initially empty - nothing to infer
nums.push(1);
nums.push(2);
nums.push(3); // [1, 2, 3]

let popped = nums.pop(); // Option(i32) <- [1, 2]

nums.insert(1, 7); // [1, 7, 2] // panicks if index too high!

let fromIndex = nums[1]; // 7 // panicks if index invalid!
let fromGet = nums.get(1); // 7 // returns Optional
```

### HashMap

So that's a map. Python: Dictionary. JS: Object or Map.

```rust
let mut map = HashMap::new(); // default type: HashMap<i32, i32>

map.insert(1, -1) // key, value
map.insert(5, 3)

let oldValueOfFiveOption = map.insert(5, 10);

let contains5 = map.contains_key(&5); // true

let removed_value_option = map.remove(&5); // Some(10)

for k in map.keys() {
    // do something with key
}
```

### Iterators

They are not really data types, but they work on them. Well, an collections, in general. Most collections allow you to create an iterator, which will iterate over all elements of the collection. Useful: No matter the source collection type, the iterator will always do the same, and provide the same API. So I will show its capabilities only from a vector

```rust
let mapped = vec![1, 2, 3].iter().map(|val| val * 2).collect(); // [2, 4, 6]
let filtered = vec![1, 2, 3].iter().filter(|val| val > 1).collect(); // [2, 3]
let skipped = vec![1, 2, 3, 4, 5, 6, 7, 8, 9].iter().skip(2).take(4).collect(); // [3, 4, 5, 6]
```

Also check out `enumerate`, `zip`, `flatten` and `for_each`.

And because it is so great, I'll copy a more elaborate example of mapping, filtering and error handlng from franneck94's Udemy course:

```rust
let students = vec![
    "Jan 77",
    "Marie 65",
    "Deqan 49",
    "Pascal 100",
    "Lisa 80",
    "Malte 56"
];

let good_students: Vec<Student> = students.
    .iter()
    .map(|val| {
        let mut s = val.split(' ');
        let name = s.next()?.to_string();
        let grade = s.next()?.parse::<u32>()?.to_string()?.ok()?;

        Some(Student { name, grade })
    })
    .filter(|val| match val {
        Some(v) => v.grade >= 70,
        None => false,
    })
    .flatten()
    .collect();
```

## Control flow

How to decide which path your program will take?

### If-Else

Works pretty much standard

```rust
let num = 1;

if num > 10 {
    println!("Greater");
} else if num < 10 {
    println!("Smaller");
} else {
    println!("Equal");
}
```

### Loops

#### While loop

```rust
let mut counter = 0;

while counter < 10 {
    counter += 1;
    println!("Whiler: {}", counter);
}
```

#### For loop

```rust
let nums = 0..11; // [0, ..., 10] // type: Range<i32>

for num in nums {
    println!("Forer: {}", num);
}
```

#### Manually broken loop

```rust
'loop_name: loop {
    counter += 1;
    println!("Looper: {}", counter);

    if counter == 10 {
        break 'loop_name; // 'loop_name is a loop's label
    }
}
```

What's cool about the labelling of loops is that in nested loops it allows you to _break out of outer loops_. Awesome!

### Match

This is something like switch-case.

```rust
let number = 13;

// ?? Commas needed or not to separate arms?
match number {
    1 => println!("One!"),
    2 | 3 | 5 | 7 | 11 => println!("This is a prime"), // match multiple cases
    26 => {
        // code blocks work
        let x = 5;
        println!("{}", x);
    },
    _ => println!("None!"), // default
}
```

This can be combined with assignment. Neat!

```rust
let boolean = true;

let binary = match boolean {
    false => 0,
    true => 1,
};
```

Just make sure that in this case all arms return the same datatype. Or Optionals. Optionals can hold different data types (according to ChatGPT).

### Option

Not strictly control flow, but heavily used as such. In fact, it's just an enum!

This is how you would implement it yourself. Yes, (in Rust,) it's that easy:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

And here's how to use it

```rust
fn add(x: u32, y: Option<u32>) -> u32 {
    match y {
        Some(z) => x + z, // <- it _like_ inferring the value of z from inside the Option
        None => x,
    }
}
```

### If-Let

Now call me crazy, but ain't that just a ternary operator like we know? `const var = Math.random() > 0.5 ? true : false;` Well, maybe not exactly, but similar. You check whether a pattern equals an expression. Our example allows an enum to self-check if it's an admin:

```rust
enum PermissionLevel {
    Admin,
    User,
    Instructor,
}

impl PermissionLevel {
    fn is_admin(&self) -> bool {
        let ret = if let PermissionLevel::Admin = self {
            true
        } else {
            false
        };
        ret
    }
}
```

## Language constructs

### Functions

In Rust, functions are first class citizens, so they can exist on their own. And can be passed as arguments, assigned to variables etc. This is how you defined them:

```rust
fn times_two(inp: i32) -> i32 {
    inp * 2
}
```

### Closures

Known in other languages as lambda functions or anonymous functions, closures allow us to quickly defined "throw away" functions that are used only once (or a few times).

Instead of defining the function using the `fn` keyword you can just say

```rust
let times_two = |inp: i32| -> i32 { inp * 2 };
```

This is used especially often when you have to pass a function as an argument to some other function.

### Casting

As always, it's dangerous. Know what you do. It's done with `as`.

```rust
let decimal_flt = 65.4321_f32;
let decimal_int = decimal_flt as u8;
```

## Concepts


### Constants and Statics

```rust
// Constants

const THRESHOLD: i32 = 10;

fn is_above_threshold(num: i32) -> bool {
    num > THRESHOLD // <- at compile time, const will be replaced with 10_i32. High memory, fast access
}
```

```rust
// Statics

static THERSHOLD: i32 = 10;

fn is_obove_threshold(num: i32) -> bool {
    num > THERSHOLD // <- refers to global variable, saves memory, but not _quite_ as fast
}
```

Why would you use `const`? No idea.

### Ownership

Sooooo. This is the real Rust deal, I guess.

What does a variable contain? Really? On the "metal" level? It contains a pointer to RAM, where it's data starts, and the length of that data. We know the process of 

1. declaring the variable: It exists, but has no data
2. initializing the data: Now it has pointer and length

Now in Rust, we have a third step, which is

3. moving the value, wich means our variable will pass it's data on to another one _and loose it itself_

This prevents all kinds of bugs where multiple parts of your program try to do things with the same data at the same time. 

**The Rust compiler will make sure that every variable always points to a valid location in RAM! That's a big deal to other low level programming languages.**

```rust
fn main() {
    let s = "Matthias".to_owned(); // type: String

    // now, our variable s has pointer and length to "Matthias" on the heap

    take_reference1(&s); // immutable ref

    // s still got the data, but inside the function we also have a mutable reference

    take_reference2(&s);

    // this process can be repeated

    take_ownership1(s);

    // here, we don't pass a reference, we pass the value. s loses its data!

    //take_ownership2(s); // would not work!
}

fn take_ownership1(s: String) {
    println!("s: {}", s);
}

fn take_ownership2(s: String) {
    println!("s: {}", s);
}

fn take_reference1(s: &String) {
    println!("s: {}", s);
}

fn take_reference2(s: &String) {
    println!("s: {}", s);
}
```

These are the borrowing rules (change of ownership) (they refer to the current scope):

- As many immutable references as you want, but then no mutable reference
- One mutable reference, but then no immutable references

### Stack vs Heap

Stack is very small, simple and efficient. It's managed automatically by the operating system (or by _something_)

Heap is the rest of RAM. You have to manage it yourself: Reserve storage, use it, release it. But Rust has many rules that mean you can't make mistakes. Unless you try hard.

// ?? Check this  
In general, variables end up on the stack. Primitives, at least. Objects that need to be constructed only keep a reference _to_ a location on the heap on the stack. Reference on stack, value on heap.

Usually, there will only be a single reference to a location on the heap. When that is destroyed, the RAM location will be released. But there are times when we may want multiple references. For that, we need a "reference count variable", wich only releases storage when the last reference is destroyed.

Let's see this in code

```rust
use std::rc::Rc;

#[derive(Debug)]
struct Car {
    name: String,
    year: u32,
    hp: u32,
    mileage: u32,
}

// Drop is a trait. This one acts like a lifecycle hook. Called when object is destroyed
impl Drop for Car {
    fn drop(&mut self) {
        println!("Called drop for vehicle: {}", self.name);
    }
}

fn stack_example() {
    let car = Car {
        name: String::from("Audi RS3"),
        year: 2022,
        hp: 400,
        mileage: 0,
    };
}

fn heap_example() {
    let car1 = Box::new(Car {
        name: String::from("Audi RS3"),
        year: 2022,
        hp: 400,
        mileage: 0,
    });

    let car2 = car1; // this is a MOVE. car1 loses its value!

    println!("{:?}", car1);
    println!("{:?}", car2);
}

fn rc_example() {
    let car1 = Rc::new(Car {
        name: String::from("Audi RS3"),
        year: 2022,
        hp: 400,
        mileage: 0,
    });

    let car2 = car1; // creates another reference

    println!("{:?}", car1); // works
    println!("{:?}", car2);
}
```

And why does this shit work? Apparently, because `Rc` implements the `clone` trait (??) and, instead of actually copying, it just creates a new reference.

### Lifetime

This important for memory safety. If a value is declared in an inner scope, it only exists in an inner scope. Means that we cannot safe a reference to it's value in a variable declared in an outer scope. As soon as the inner scope is left, the value is no longer valid, and the outer reference would point to an invalid memory address. So the following does not work:

```rust
fn main() {
    let outer: &str;

    { // <- We create a nested scope. Variables declared inside are only valid inside
        let inner = String::from("test");
        outer = &inner; // <- Error: Borrowed value does not live long enough
    }

    println!("{}", outer);
}
```

Lifetime is actually a thing we can express using the `'` (tick) syntax. Consider this:

```rust
fn main() {
    let string1 = String::from("test1");
    let string2 = String::from("test2");
    let result = get_longest_str(&string1, &string2);
}

fn get_longer_string(x: &String, y: &String) -> &String { // Error: Expected named lifetime parameter
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

The code above is actually fine, because both `string1` and `string2` have the same lifetime. But what if `string2` was declared in an inner scope? The result of the `get_longest_string` function would have a lifetime of either `string1` or `string2`, but the compiler has no way to know which! For Rust, that's not okay. How would it analyze the program for memory safety, if it was?

To make it work, we have to use lifetime parameters. They work a bit like generics, but for this new concept that is pretty specific to Rust! Cause in other low level languages, this just errors at runtime.

Here's how to fix it:

```rust
fn main() {
    let string1 = String::from("test1");
    let string2 = String::from("test2");
    let result = get_longest_str(&string1, &string2);
}

//                    | Lifetime variable. Typically start with a, but anything works
//                    V
fn get_longer_string<'a>(x: &'a String, y: &'a String) -> &'a String {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

Now, we're memory safe. But this does not work anymore:

```rust
fn main() {
    let string1 = String::from("test1");

    {
        let string2 = String::from("test2");

        // Error: Strings have different lifetimes, so cannot be used as args
        let result = get_longest_str(&string1, &string2);
    }
}

fn get_longer_string<'a>(x: &'a String, y: &'a String) -> &'a String {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

### Generics

What if your function just does not care if it adds two `i8` or two `f64` on top of each other? Write two functions? Noooo! Use generics:

```rust
fn add<T>(a: T, b: T) -> T {
    a + b
}
```

```rust
#[derive(Debug)]
struct Data<T> {
    value: T,
}

impl<T> Data<T> 
where
    T: Debug + Display // <- make sure we can print this thing! (Type constraint)
{
    fn print_me(&self) {
        println!("Me: {:?}", self.value);
    }
}
```

Sometimes, we want a function to be generic, but still limit the types that are compatible.

```rust
fn print_me<T: Debug>(item: &T) { // <- limit T to have to implement the Debug trait
    println!("My value: {:?}", item);
}
```

And sometimes we may want to refer to a type only by a type constraint. I didn't fully get this, yet. So here's just an example:

```rust
pub trait Area {
    fn area(&self) -> f32;
}

#[derive(Debug)]
pub struct Circle {
    radius: f32,
}

#[derive(Debug)]
pub struct Square {
    length: f32,
}

impl Area for Circle {
    fn area(&self) -> f32 {
        self.radius * self.radius * 3.14159
    }
}

impl Area for Square {
    fn area(&self) -> f32 {
        self.length * self.length
    }
}

pub struct GeometricFormsList {
    forms: Ve<Box<dyn Area>>,
}
```

### Traits

Traits are like interfaces.

```rust
trait Summary {
    fn summarize(&self) -> String;
}

// trait Summary {
//     fn summarize(&self) -> String {
//         format!("Empty...") // <- Default implementation
//     }
// }

struct FacebookPost {
    author: String,
    content: String,
}

struct InstagramPost {
    author: String,
    description: String,
}

impl Summary for FacebookPost {
    fn summarize(&self) -> String {
        format!("{}: {}", self.author, self.content)
    }
}

impl Summary for InstagramPost {
    fn summarize(&self) -> String {
        format!("{}: {}", self.author, self.description)
    }
}

fn notify(element: &impl Summary) {
    println!("{}", element.summarize());
}

fn main() {
    let fb_post = FacebookPost {
        author: String::from("Matthias");
        content: String::from("Go learn Rust!");
    }
    notify(fb_post);
}
```

And you can have super traits. That's a trait that lists a bunch of other traits that all have to be implemented.

```rust
pub trait Area {
    fn area(&self) -> f32;
}

pub trait Circumference {
    fn circumference(&self) -> f32;
}

pub train GeoProperties: Area + Circumference {
    // optionally add more functions
}
```

### Error handling

When an error occurs in a Rust program, it "panicks".

You can make the program panick manually. It's like throwing an Exception or Error in other languages.

```rust
panic!("Something went terribly wrong!");
```

Of course, that's a last resort. There are smarter ways to deal with (anticipatable) problems. It's all based on a built-in enum, like `Option`. Written by ourselves, that enum would look like

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

So what to do with this?

```rust
use std::fs::File;
use std::io::{Error, ErrorKind};

fn main() {
    let f = File::open("file.txt"); // <- assume this does not exist

    // f is type io::Result<File, Error>

    let file = match f {
        Ok(okFile) => okFile, // return the file
        Err(error) => match error.kind() { // <- nested match. Often seen in Rust
            ErrorKind::NotFound => panic!("File not found!"), // okay, here we panic too, but you get it
            _ => panic!("Unknown error"),
        }
    }
}
```

Let's talk about some more details on using `Result`, but also `Option`. They do kind of similar things, after all.

```rust
fn my_option(val: i32) -> Option<i32> {
    if val >= 0 {
        return Some(val * 2);
    }
    None
}

fn my_result(val: i32) -> Result<i32, String> {
    if val >= 0 {
        return Ok(val * 2);
    }
    Err("Error message")
}

fn main() {
    let input = 1;
    let output = match my_option(input) {
        Some(v) => v,
        None => panic!("Aaaahhhhhhh....!!!!"),
    }

    let input2 = 1;
    let output2 = match my_result(input2) {
        Ok(v) => v,
        Err(e) => panic!("{}", e),
    }
}
```

So that was pretty standard. There are a variety of other methods to unwrap values from these artefacts. Some are safe, some less...

```rust
fn my_option(val: i32) -> Option<i32> {
    if val >= 0 {
        return Some(val * 2);
    }
    None
}

fn my_result(val: i32) -> Result<i32, String> {
    if val >= 0 {
        return Ok(val * 2);
    }
    Err("Error message")
}

fn main() {
    let input = 1;
    let output = my_option(input).unwrap(); // the dumb or evil brother of match. Will panic on Err value

    let input2 = 1;
    let output2 = my_result(input2).unwrap(); // same

    let output3 = my_option(1).expect("I am the panic message"); // unwraps _or_ panicks with this message

    let output4 = my_option(1).unwrap_or(8); // pass alternative value used in Err case

    // default value in error case, must be defined for given datatype
    let output5 = my_option(1).unwrap_or_default(); // "", 0, false, ...
}


fn times_three_pass_err_up(val: i32) -> Result<i32, String> {
    let output = my_option(val)?; // Unwrap value. Err is early returned to caller
    Ok(output * 3)
}
```

### Function pointers

So, you can pass funcions as arguments. It's straightforward, if you know the concept already.

```rust
fn apply(operand: i32, operator: fn(i32) -> i32) -> i32 {
    operator(operand)
}

fn square(x: i32) -> i32 {
    x * x
}

fn main() {
    let squared = apply(4, square); // 16
}
```

## How to build a library

You don't want to create an executable from a library. Create it with `cargo new <lib-name> --lib`.

Decide your public API. In Rust, everything is private. Unless you make it public.

```rust
// make stuff public
pub fn will_be_public() {
    // do some
}
```

Tests can be built right into the code

```rust
pub fn add(a: i32, b: i32) {
    a + b
}

#[cfg(test)]
mod tests { // <- tests go into their own module
    #[test]
    fn it_works() {
        assert_eq!(super::add(4 + 7), 1); // <- add is defined in parent module. Reference it with super
    }
}
```

Instead of `super::xx` all the time, just add a line `use super::*;` at the beginning of your module.

Typically, we pack our stuff into a module

```rust
pub mod my_mod{ 
    pub fn add(a: i32, b: i32) {
        a + b
    }

    pub mod my_mod_nested {
        pub fn public_nested_function {
            // noop
        }
    }

    #[cfg(test)]
    mod tests { // <- tests go into their own module
        #[test]
        fn it_works() {
            assert_eq!(super::add(4 + 7), 1); // <- add is defined in parent module. Reference it with super
        }
    }
}
```

There are specific conventions how you organized a library made up of many files. Tricks with specific filenames and stuff. Too complicated to get into here. Look it up.

### Threading

Rust is awesome with mulitthreading. Let's see why.

Let's write a simple multi-threaded program:

```rust
use std::{thread, time::Duration};

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("{}", i);

            thread::sleep(Duration::from_millis(100));
        }

        thread::sleep(Duration::from_millis(2000));
    });

    handle.join().unwrap();

    for i in 1..10 {
        println!("{}", i);

        thread::sleep(Duration::from_millis(100));
    }

    let vec = vec![1, 2, 3];

    let handle2 = thread::spawn(|| {
        for i in vec {
            println!("{}", i);

            thread::sleep(Duration::from_millis(100));
        }

        thread::sleep(Duration::from_millis(2000));
    });

    handle.join().unwrap();

    println!("{:?}", vec); // <- Error: vec has been moved to thread!
}
```

So far, so good. What if you have to communicate with the thread while it's running?

#### Channels

use std::sync::mpsc;
use std::thread;

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    // two transmitters, one receiver
     let (transmitter, receiver) = mpsc::channel();
     let transmitter2 = transmitter.clone();

     thread::spawn(move || {
        let msg = String::from("My name is ");
        transmitter.send(msg).unwrap();
     });

     thread::spawn(move || {
        let msg = String::from("Matthias ");
        transmitter2.send(msg).unwrap();
     });

     let received_msg1 = receiver.recv().unwrap();
     let received_msg2 = receiver.recv().unwrap();

     println!("Received: {}{}", received_msg1, received_msg2);
}
```

When you `recv` a value, the program will actually wait until one is available. If none arrives, because nobody can send a message anymore, this will panic!

If you want to receive a value only if one is _already_ availabe, use `try_recv`.

Now, what if your threads manipulate data. Multiple threads mutating the same data. You have to make sure this does not happen. Introducing: Arc and Mutex (atomic reference cound and mutual exclusion).

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));

    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter); // <- needed to use counter in each thread
        let handle = thread::spawn(move || {
            let mut counter = counter.lock().unwrap();

            *counter += 1;
        });

        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Counter: {}", counter.lock().unwrap());
}

## Tooling

### `cargo test`

Runs all tests defined across your project. Naming of your test functions is important! `cargo test test_integration_` will only run test functions that start with "test_integration_".

### `cargo check`

Tests whether `cargo build` _would_ succeed.

### `cargo doc`

Generates documentation. Documetation comments start with `///`.

```rust
/// This function prints out the input values
/// 
/// ```rust
/// print_out("hoho".to_string());
/// ```
pub fn print_out(in: &str) {
    println!("{}", in);
}
```
