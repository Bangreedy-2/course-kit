=== oop | py | 1 | Classes, objects, inheritance and polymorphism | d-student
@@ About 30 min reading · Handbook chapter 2 · Homework: used in every from-scratch model
## Why this comes first

Every model in the Sigmoid handbook is written as a Python **class**: `LinearRegression`, `LogisticRegression`, `myPCA`, `GMM`, `SVM`. scikit-learn, the library you will use in every homework notebook, is built the same way: you create an object, call `fit(X, y)` on it, then call `predict(X)`. If you can read and write a class, you can open the handbook's implementations and see exactly what each algorithm does. If you can't, they look like a wall of `self.` and underscores.

This lesson builds the four ideas the handbook names (classes and objects, encapsulation, inheritance, polymorphism) on its own running example: a school that stores students.

## The problem classes solve

Suppose you store, for each student, a name, a surname, grades per subject and a teacher's comment. Without classes you might write:

```
student_1_name = 'James'
student_1_surname = 'Rock'
student_1_grades = {'Math': [6, 7, 8], 'Science': [9, 8, 9]}
student_2_name = 'Emma'
...
```

With 1,000 students and 4 facts each, that is 4,000 loose variables. Nothing ties `student_1_name` to `student_1_grades` except the spelling, and nothing stops you from mistyping one. A **class** fixes this: it is a blueprint that says "a student has these pieces of data and can do these things". An **object** (also called an **instance**) is one concrete student built from that blueprint.

## Defining a class

```
class Student:
    def __init__(self, name, surname, grades, comments):
        self.name = name
        self.surname = surname
        self.grades = grades
        self.comments = comments
```

Read it symbol by symbol:

- `class` is the keyword that starts a class definition, and `Student` is its name. By convention class names use CapitalisedWords.
- The colon `:` and the indentation below it mark the class body. Everything indented under `class Student:` belongs to the class.
- `def __init__(...)` defines a method, a function that lives inside a class. The name `__init__` (two underscores on each side, said "dunder init") is special: Python calls it automatically every time you create a new object. It is called the **constructor**.
- `self` is the first parameter of every ordinary method. It is the object being built or used. You never pass it yourself; Python fills it in.
- `self.name = name` creates an **attribute** called `name` on this particular object and stores the argument in it. The `name` on the left (after `self.`) belongs to the object and lives as long as the object. The `name` on the right is the local parameter, which disappears when `__init__` finishes. They happen to share a spelling; they are different variables.

Creating objects:

```
grades = {'Informatics': [7, 9, 8], 'Math': [7, 8, 9]}
student1 = Student('Alex', 'Pierce', grades, 'Good student')
print(student1.name)      # Alex
student1.name = 'Richard' # attributes can be changed
print(student1.name)      # Richard
```

`Student(...)` with brackets calls the class. Python creates an empty object, calls `__init__(that_object, 'Alex', 'Pierce', grades, 'Good student')`, and hands the object back. The **dot** in `student1.name` means "look inside this object for the attribute called name".

## Methods: giving the object behaviour

Data alone is not much use. A method lets the object compute something from its own data:

```
class Student:
    def __init__(self, name, surname, grades, comments):
        self.name = name
        self.surname = surname
        self.grades = grades          # dict: subject -> list of marks
        self.comments = comments

    def average_grade(self):
        total = 0
        for marks in self.grades.values():
            total += sum(marks) / len(marks)   # average of one subject
        return total / len(self.grades)        # average of the subject averages
```

Trace `student1.average_grade()` with `{'Informatics': [7, 9, 8], 'Math': [7, 8, 9]}`:

1. Python turns `student1.average_grade()` into `Student.average_grade(student1)`, so `self` is `student1`.
2. `self.grades.values()` yields `[7, 9, 8]` then `[7, 8, 9]`.
3. First loop: `sum([7, 9, 8]) / 3` is `24 / 3 = 8.0`, so `total` becomes `8.0`. Second: `24 / 3 = 8.0`, so `total` becomes `16.0`.
4. `len(self.grades)` is 2 (two keys), so the method returns `16.0 / 2 = 8.0`.

Two operators worth naming: `+=` means "add to the variable and store the result back" (`total = total + ...`), and `/` is true division, which always gives a float in Python 3, even `24 / 3`. If you want whole-number division use `//`.

## Encapsulation: keep the inside inside

**Encapsulation** means bundling data with the methods that use it, and hiding the details that outside code should not touch. Python has no hard "private" keyword; it uses naming conventions:

- One leading underscore, `self._cache`, says "internal, please don't use from outside". Nothing enforces it.
- Two leading underscores, `self.__learning_rate`, trigger **name mangling**: inside class `LogisticRegression` Python silently renames it to `self._LogisticRegression__learning_rate`. Code outside the class that writes `model.__learning_rate` gets an `AttributeError`.

You will see exactly this in the handbook's logistic regression:

```
class LogisticRegression:
    def __init__(self, learning_rate=0.05, max_iter=100000):
        self.__learning_rate = learning_rate
        self.__max_iter = max_iter
```

The model's settings are hidden; you set them once in the constructor and the `fit` method uses them. The learned weights, though, are stored as `self.coef_`, a public attribute with a trailing underscore. That trailing underscore is a scikit-learn convention meaning "this was learned by `fit`", and the handbook follows it.

## Inheritance: reuse a parent class

Students and teachers are both humans. Instead of writing name-handling code twice, put it in a parent class and let the children **inherit** it:

```
class Human:
    def __init__(self, name, surname):
        self.name = name
        self.surname = surname

    def sleeping(self):
        print("I'm sleeping")


class Student(Human):
    def __init__(self, name, surname, grades, comments):
        super().__init__(name, surname)
        self.grades = grades
        self.comments = comments
```

- `class Student(Human):` the name in brackets is the **parent** (also called base class or superclass). `Student` is the **child** (subclass). Every method of `Human` is now available on a `Student`.
- `super().__init__(name, surname)` calls the parent's constructor so that `name` and `surname` are set the same way as for any human. `super()` means "the parent class, bound to this same object". Forgetting this line is the most common inheritance bug: the child's `__init__` replaces the parent's, so without the call `self.name` is never created.

Now `Student('Ana', 'Rusu', {}, '').sleeping()` prints `I'm sleeping` even though `Student` never defined `sleeping`. Python looks for the method on `Student` first, does not find it, then looks on `Human`. That search order is called the **method resolution order**, and you can see it with `Student.__mro__`.

`isinstance(obj, Human)` returns `True` for a `Student` object too, because a student *is a* human. That "is a" test is the right way to check whether inheritance fits: a student is a human, so inherit; a student *has* grades, so grades are an attribute, not a parent class.

## Polymorphism: same call, different behaviour

**Polymorphism** ("many forms") means different classes answer the same method call in their own way. A child can **override** a parent method by defining one with the same name:

```
class Student(Human):
    ...
    def sleeping(self):
        print("I'm sleeping in class")

class Teacher(Human):
    def sleeping(self):
        print("I'm sleeping in the staff room")

for person in [Human('A', 'B'), Student('C', 'D', {}, ''), Teacher('E', 'F')]:
    person.sleeping()
```

The loop does not care which class each object is. It calls `.sleeping()` and each object runs its own version. This is exactly why scikit-learn is pleasant to use: `LinearRegression`, `DecisionTreeClassifier` and `SVC` are different classes, but all have `fit` and `predict`, so this works for any of them:

```
for model in [LogisticRegression(), DecisionTreeClassifier(), SVC()]:
    model.fit(X_train, y_train)
    print(type(model).__name__, model.score(X_test, y_test))
```

You will write loops like this in homework 6, 10 and 18 to build comparison tables.

## The shape of every model class

Here is the skeleton the handbook's models share. Learn its shape; you will fill it in many times:

```
class MyModel:
    def __init__(self, learning_rate=0.01):   # settings (hyperparameters)
        self.learning_rate = learning_rate

    def fit(self, X, y):                      # learn from data
        self.coef_ = ...                      # store what was learned
        return self                           # lets you write MyModel().fit(X, y).predict(X)

    def predict(self, X):                     # use what was learned
        return ...
```

`return self` at the end of `fit` is a small but useful habit: because `fit` returns the object itself, you can chain calls on one line.

## Common mistakes

> **Forgetting `self`.** Writing `def average_grade():` and then calling `s.average_grade()` raises `TypeError: average_grade() takes 0 positional arguments but 1 was given`. Python always passes the object as the first argument, so the method must accept it.

> **Using a bare name instead of `self.name` inside a method.** Inside `average_grade`, the name `grades` alone means a local or global variable, not the object's attribute. Use `self.grades`.

> **A mutable default argument.** `def __init__(self, grades=[])` creates one list shared by every object that uses the default. Append to one student's grades and every other default student changes too. Use `grades=None` and then `self.grades = grades if grades is not None else []`.

## Summary

A class is a blueprint; an object is one thing built from it. `__init__` runs on creation and stores attributes on `self`. Methods are functions that receive the object as `self`. Encapsulation hides internals (one underscore by convention, two for name mangling). Inheritance (`class Child(Parent)` plus `super().__init__`) reuses code for "is a" relationships. Polymorphism lets one call, like `fit` or `sleeping`, run different code depending on the object's class.

--- practice
@predict
What does this print?
```python
class Counter:
    def __init__(self, start):
        self.value = start

    def add(self, n):
        self.value += n
        return self

c = Counter(5)
c.add(3).add(2)
print(c.value)
```
= 10
! `add` changes `self.value` and returns the same object, so the second `.add(2)` runs on the same counter: 5 + 3 + 2 = 10. This is the `return self` chaining pattern from `fit`.

@choice
Inside `class Student(Human)`, the child's `__init__` does not call `super().__init__(name, surname)`. What happens when you later read `student.name`?
- It works, because Python always runs the parent constructor first
* `AttributeError`, because the parent's constructor never ran and `self.name` was never set
- It returns `None`
- It returns the class name
! Defining `__init__` in the child replaces the parent's. Python only runs the parent's version if you call it with `super().__init__(...)`.

@predict
What does this print?
```python
class Human:
    def speak(self):
        return "hello"

class Student(Human):
    def speak(self):
        return "hi, " + super().speak()

class Teacher(Human):
    pass

print(Student().speak(), Teacher().speak())
```
= hi, hello hello
! `Student` overrides `speak` but still calls the parent's version through `super()`. `Teacher` defines nothing, so Python finds `Human.speak`. `print` puts a space between its two arguments.

@run
Write a class `BankAccount` whose constructor takes `owner` and an optional `balance` (default 0). Add `deposit(amount)` and `withdraw(amount)`. `withdraw` must raise `ValueError` if the amount is larger than the balance. Both methods return the new balance.
```starter
class BankAccount:
    pass
```
```test
a = BankAccount("Ana")
print(a.owner, a.balance)
print(a.deposit(100))
print(a.withdraw(30))
try:
    a.withdraw(500)
except ValueError:
    print("refused")
print(a.balance)
b = BankAccount("Ion", 50)
print(b.balance)
```
= Ana 0
= 100
= 70
= refused
= 70
= 50
```solution
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount
        return self.balance
```
! Default arguments (`balance=0`) make a parameter optional. `raise ValueError(...)` stops the method before the balance changes, so a refused withdrawal leaves 70.

@predict
What does this print?
```python
class Model:
    def __init__(self, lr):
        self.__lr = lr

m = Model(0.1)
print(hasattr(m, "__lr"), hasattr(m, "_Model__lr"))
```
= False True
! Two leading underscores trigger name mangling: inside `Model`, `self.__lr` is stored as `_Model__lr`. That is why outside code cannot reach `m.__lr`.

@run
Polymorphism in practice. Write a parent class `Shape` with a method `area()` that returns 0, and two children: `Rectangle(w, h)` and `Circle(r)` (use `3.14159` for pi). Then write a function `total_area(shapes)` that returns the sum of the areas of a list of shapes, rounded to 2 decimals, without checking the type of any shape.
```starter
class Shape:
    def area(self):
        return 0


def total_area(shapes):
    pass
```
```test
print(Rectangle(2, 3).area())
print(round(Circle(1).area(), 4))
print(total_area([Rectangle(2, 3), Circle(1), Shape()]))
print(isinstance(Circle(2), Shape))
```
= 6
= 3.1416
= 9.14
= True
```solution
class Shape:
    def area(self):
        return 0


class Rectangle(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h


class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return 3.14159 * self.r ** 2


def total_area(shapes):
    return round(sum(s.area() for s in shapes), 2)
```
! `total_area` never asks what each shape is; it just calls `.area()`. That is the same reason one loop can call `.fit()` on any scikit-learn model.

@write
Without scrolling up, explain the difference between a class and an object, what `self` is, and what `super().__init__(...)` does in a child class. Use the Student and Human example.
min: 70
```solution
A class is a blueprint that describes what data and behaviour a kind of thing has; Student is a class. An object (instance) is one concrete thing built from it, such as student1 = Student('Alex', 'Pierce', grades, 'Good student'). self is the object a method is working on: Python passes it automatically as the first argument, so self.name means "the name stored on this particular student". When Student inherits from Human and defines its own __init__, that replaces Human's constructor, so the child calls super().__init__(name, surname) to run the parent's constructor on the same object and set name and surname, then sets its own extra attributes such as grades.
```
! Check that you said the child's `__init__` replaces the parent's, which is why the `super()` call is needed.

--- recall
Q: What does Python do, step by step, when you write `Student('Ana', 'Rusu', g, 'ok')`?
A: Creates a new empty object, calls `Student.__init__(obj, 'Ana', 'Rusu', g, 'ok')` with the object as `self`, and returns the object.
Q: What does a double leading underscore (`self.__lr`) do inside a class called `Model`?
A: Name mangling: it is stored as `_Model__lr`, so `obj.__lr` from outside raises AttributeError.
Q: Why do the handbook's and scikit-learn's `fit` methods end with `return self`?
A: So calls can be chained: `Model().fit(X, y).predict(X)`.
Q: What is polymorphism, in one sentence with an ML example?
A: Different classes respond to the same method call in their own way, e.g. one loop calling `.fit()` and `.score()` on LogisticRegression, DecisionTreeClassifier and SVC.
