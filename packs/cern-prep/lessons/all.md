=== py1 | py | 1 | Strings, lists and slicing | p1,p25
## Two kinds of sequence

A **string** is a sequence of characters, written in quotes: `"muon"`. A **list** is a sequence of any values, written in square brackets: `[3, 1, 4]`. Because both are sequences, the same tools work on both: `len()` gives the number of elements, `for x in seq` visits each one, and square brackets pick elements out.

## Indexing: picking one element

Every element has a position number called an **index**. Indexes start at 0, not 1, so the last index is always `len(seq) - 1`.

```
s = "muon"
len(s)    # 4
s[0]      # 'm'   first element
s[3]      # 'n'   last element, because 4 - 1 = 3
s[-1]     # 'n'   negative indexes count from the end
s[-2]     # 'o'
s[4]      # IndexError: string index out of range
```

`s[-1]` is shorthand for `s[len(s) - 1]`. Asking for an index that doesn't exist raises an `IndexError` and stops the program.

## Slicing: picking a range

A **slice** takes several elements at once: `seq[start:stop]`. The easiest way to read a slice is to imagine the index numbers sitting **between** the elements, like marks on a ruler:

```
  m   u   o   n
0   1   2   3   4
```

`s[1:3]` cuts at mark 1 and mark 3 and keeps what is in between: `'uo'`. That is why the element at `stop` itself is not included, and why the length of a slice is simply `stop - start`.

```
s[1:3]    # 'uo'
s[:2]     # 'mu'    leaving out start means "from the beginning"
s[2:]     # 'on'    leaving out stop means "to the end"
s[:]      # 'muon'  a full copy
s[1:100]  # 'uon'   slices never raise IndexError, they just stop at the end
```

A third number is the **step**: `seq[start:stop:step]`. `s[::2]` takes every second element (`'mo'`). A step of `-1` walks backwards, so `s[::-1]` is the standard way to reverse a sequence (`'noum'`).

A slice always builds a **new** string or list. The original is untouched.

## split and join: between strings and lists

`split` cuts a string into a list of pieces. `join` glues a list of strings back into one string.

```
"hello big world".split()      # ['hello', 'big', 'world']
"  hello   big world ".split() # same result: extra spaces are ignored
"a,b,,c".split(",")            # ['a', 'b', '', 'c']  one cut per comma, so empty pieces appear
" ".join(["hello", "big"])     # 'hello big'
"-".join(["a", "b", "c"])      # 'a-b-c'
```

With no argument, `split()` cuts on any run of whitespace (spaces, tabs, newlines) and never produces empty pieces. With an argument, it cuts at every single occurrence of that text.

`join` looks backwards at first: you call it on the **separator**, and pass the list. Read `" ".join(words)` as "space, join these words". Every element must already be a string, so `"-".join([1, 2])` is a `TypeError`.

## Strings can't change, lists can

A string is **immutable**: once made, it never changes. `s[0] = "M"` is a `TypeError`. Every string method (`upper()`, `strip()`, `replace()`) leaves the original alone and returns a new string, so you must keep the result:

```
s = "  muon "
s.strip()        # returns 'muon', but s is still '  muon '
s = s.strip()    # now s is 'muon'
```

A list is **mutable**: it can be changed in place. `append`, `sort` and `reverse` modify the list itself and return `None`.

```
nums = [3, 1, 2]
nums.append(5)     # nums is now [3, 1, 2, 5]
nums.sort()        # nums is now [1, 2, 3, 5]
x = nums.sort()    # x is None! sort() has nothing to return
y = sorted(nums)   # sorted() builds and returns a NEW list
```

## Two names, one list

Assignment never copies a list. `b = a` gives the same list a second name, so a change made through one name is visible through the other.

```
a = [1, 2]
b = a          # the same list
c = a[:]       # a copy (a full slice)
b.append(3)
print(a)       # [1, 2, 3]
print(c)       # [1, 2]
```

This is the source of many surprising bugs, especially when a function modifies a list that was passed to it.
--- practice
@predict
Use the ruler picture: where do marks 2 and 5 fall?
```
s = "detector"
print(s[2:5])
```
= tec
! Mark 2 is before the first `t` and mark 5 is after the `c`, so you get 5 − 2 = 3 characters.

@predict
```
nums = [5, 3, 8]
x = nums.sort()
print(x, nums)
```
= None [3, 5, 8]
! `sort()` changes the list in place and returns `None`. Use `sorted(nums)` when you want the result as a value.

@predict
```
a = [1, 2, 3]
b = a
b.append(4)
c = a[:]
c.append(5)
print(len(a), len(c))
```
= 4 5
! `b` is another name for the same list, so the append shows up in `a`. `c` is a copy, so its append doesn't.

@run
Write `initials(name)`. It returns the first letter of each word in upper case, joined with dots. `initials("large hadron collider")` gives `"L.H.C"`.
```starter
def initials(name):
    # split into words, collect each first letter, join with "."
    pass
```
```test
print(initials("large hadron collider"))
print(initials("  compact   muon solenoid "))
```
= L.H.C
= C.M.S
```solution
def initials(name):
    letters = []
    for word in name.split():
        letters.append(word[0].upper())
    return ".".join(letters)
```
! `split()` with no argument handles the extra spaces for you. `word[0]` is the first character, and `join` is called on the separator.

@run
Write `is_palindrome(s)`. It returns `True` if `s` reads the same in both directions, ignoring upper/lower case and spaces. Use a slice to reverse.
```starter
def is_palindrome(s):
    pass
```
```test
print(is_palindrome("Never odd or even"))
print(is_palindrome("muon"))
print(is_palindrome(""))
```
= True
= False
= True
```solution
def is_palindrome(s):
    t = s.lower().replace(" ", "")
    return t == t[::-1]
```
! String methods return new strings, so they can be chained. `t[::-1]` is the reversed copy.
--- recall
Q: What does "a b  c".split() return, and how is it different from .split(" ")?
A: ['a', 'b', 'c']. With no argument it splits on runs of whitespace and drops empty strings. .split(" ") would give ['a', 'b', '', 'c'].
Q: How do you reverse a list or a string with a slice?
A: seq[::-1], a step of -1. It returns a new object.
Q: What does x = my_list.sort() leave in x, and what should you use instead?
A: None, because sort() sorts in place. Use sorted(my_list) to get a new sorted list.
Q: After a = [1, 2] and b = a, what does b.append(3) do to a, and how do you avoid it?
A: a becomes [1, 2, 3], because b is the same list. Copy it first with b = a[:] or list(a).

=== sh0 | linux | 1 | Shell basics: moving around and handling files | 
## What the shell is

The **shell** is a program that reads commands you type and runs them. The window it runs in is the **terminal**. At CERN you will work on remote machines, clusters and containers that have no desktop at all, so the shell is how everything gets done. The standard shell on Linux is called **bash**.

On Linux and macOS, open the Terminal application. On Windows, install WSL (run `wsl --install` in PowerShell and restart), which gives you a real Linux shell. Git Bash also works for this lesson.

The shell shows a **prompt**, often ending in `$`, and waits. You type a command and press Enter. In the examples below, text after `#` is a comment and is not typed.

## The shape of a command

```
ls -l /home
```

A command has up to three parts, separated by spaces: the **program** to run (`ls`), **options** that change its behaviour (they start with a dash, like `-l`), and **arguments** that say what to act on (`/home`). Because spaces separate the parts, a file name containing a space must be put in quotes: `"my file.txt"`.

## Where am I?

Files are organised in **directories** (folders) that contain files and other directories, forming a tree. The top of the tree is called the **root** and is written as a single `/`. Your shell is always "in" one directory, the **working directory**.

```
pwd                 # print working directory: where you are now
ls                  # list what is here
ls -l               # long format: permissions, size, date
ls -a               # also show hidden files (names starting with a dot)
ls -la data         # options can be combined; lists the directory "data"
```

## Paths

A **path** says where a file or directory is. There are two kinds:

- An **absolute path** starts with `/` and describes the route from the root: `/home/andrei/cern-prep/sum.cpp`. It means the same thing wherever you are.
- A **relative path** doesn't start with `/` and is followed from your working directory: `cern-prep/sum.cpp`.

Three shortcuts are used constantly: `.` is the current directory, `..` is the one above it (the parent), and `~` is your home directory.

```
cd cern-prep        # change directory: go into cern-prep
cd ..               # go up one level
cd ../data          # up one level, then into data
cd ~                # go home (plain "cd" does the same)
cd -                # go back to where you were before
```

## Creating, copying, moving, deleting

```
mkdir data                 # make a directory
mkdir -p data/raw/2026     # -p creates all the missing levels and doesn't complain if they exist
touch notes.txt            # create an empty file
cp notes.txt backup.txt    # copy: source first, then destination
cp -r data data_copy       # -r ("recursive") is needed to copy a directory with its contents
mv backup.txt old.txt      # move, which is also how you rename
mv old.txt data/           # move into a directory
rm data/old.txt            # remove a file
rm -r data_copy            # remove a directory and everything in it
```

There is no recycle bin. `rm` deletes immediately and permanently, and `rm -r` on the wrong directory can destroy a lot of work. Read the command once more before pressing Enter.

## Looking inside files

```
cat notes.txt       # print the whole file
less big.log        # view a long file a page at a time: space = next page, q = quit
head -n 5 data.csv  # the first 5 lines
tail -n 5 data.csv  # the last 5 lines
wc -l data.csv      # count the lines
```

`echo` prints its arguments, and `>` sends a command's output into a file instead of the screen. Together they make a quick way to create a small file:

```
echo "hello" > notes.txt      # > overwrites the file
echo "again" >> notes.txt     # >> adds to the end
```

## Wildcards

The shell expands certain characters into lists of matching file names **before** the command runs. `*` matches any run of characters and `?` matches exactly one.

```
ls *.cpp            # every name ending in .cpp
rm run_?.log        # run_1.log, run_2.log, ... but not run_10.log
```

The command never sees the star. If you have `a.cpp` and `b.cpp`, typing `ls *.cpp` runs `ls a.cpp b.cpp`.

## Working faster

- **Tab** completes file and command names. Press it twice to see the choices. Use it constantly: it also prevents typos.
- **Up arrow** brings back earlier commands.
- **Ctrl+C** stops a running command. **Ctrl+R** searches your command history.
- `man ls` opens the manual for a command (`q` to quit). Most commands also accept `--help`.
- `history` lists the commands you have typed.
--- practice
@choice
You are in `/home/andrei/cern-prep/drills`. Where does `cd ../../data` take you?
- `/home/andrei/cern-prep/data`
* `/home/andrei/data`
- `/data`
- `/home/data`
! Each `..` goes up one level: first to `cern-prep`, then to `andrei`. Then `data` is entered from there.

@predict
A directory contains exactly these files: `a.cpp`, `b.cpp`, `notes.txt`, `run.sh`. What does this print?
```
ls *.cpp | wc -l
```
= 2
! The shell expands `*.cpp` to `a.cpp b.cpp`. `ls` prints them one per line when its output goes to another program, and `wc -l` counts the lines.

@local
In your terminal, run these commands one at a time, typing each yourself. Paste everything the terminal shows for the last two commands.
```
mkdir -p shell-practice/data/raw
cd shell-practice
echo "first line" > notes.txt
echo "second line" >> notes.txt
cp notes.txt data/raw/copy.txt
mv notes.txt data/
cat data/raw/copy.txt
ls data
```
min: 3
= first line
= second line
= notes.txt
= raw
! `ls data` shows `notes.txt` (which you moved there) and `raw` (the directory made by `mkdir -p`).

@choice
What is the difference between `>` and `>>`?
- `>` reads from a file and `>>` writes to it
* `>` replaces the file's contents and `>>` adds to the end
- `>>` is twice as fast
- There is no difference
! One arrow overwrites, two arrows append. Using `>` on a file you meant to keep is a classic way to lose data.

@local
Still inside `shell-practice`, make three empty files `run_1.log`, `run_2.log` and `run_10.log` with `touch`, then run `ls run_?.log` and paste the output.
= run_1.log
= run_2.log
! `?` matches exactly one character, so `run_10.log` is left out. `ls run_*.log` would list all three.
--- recall
Q: What is the difference between an absolute and a relative path?
A: An absolute path starts with / and is read from the root. A relative path is read from the current folder.
Q: What does mkdir -p a/b/c do that plain mkdir doesn't?
A: It creates the missing parent folders too, and doesn't fail if they already exist.
Q: Which key combinations stop a running command and search your command history?
A: Ctrl+C stops it. Ctrl+R searches the history.
Q: What do ., .. and ~ mean in a path?
A: . is the current directory, .. is its parent, and ~ is your home directory.

=== ph1 | phys | 1 | The Standard Model on one page | 
## Why a software engineer should know this

At CERN the code you write processes particle collisions. You don't need a physics degree, but you do need the vocabulary: when a supervisor says "we select events with two opposite-sign muons near the Z mass", every word should mean something to you. This lesson gives you the map.

## What is being studied

Everything around you is made of atoms. An atom is a nucleus surrounded by **electrons**. The nucleus is made of **protons** and **neutrons**, and those in turn are made of smaller particles called **quarks**. As far as anyone can tell, electrons and quarks are not made of anything smaller. They are **elementary particles**.

The **Standard Model** is the theory that lists all known elementary particles and describes how they interact. It has been tested for fifty years and has passed almost every test.

## The matter particles

There are twelve matter particles, in two families of six.

**Quarks** feel the strong force. There are six kinds: **up, down, charm, strange, top, bottom**, usually written u, d, c, s, t, b.

**Leptons** don't feel the strong force. There are three charged ones, the **electron**, the **muon** and the **tau**, and three **neutrinos**, one partnered with each. Neutrinos have no charge and almost no mass, and pass through matter nearly undisturbed.

These twelve are arranged in three **generations**. Each generation has two quarks and two leptons, and is a heavier copy of the previous one:

```
              1st            2nd            3rd
quarks        up             charm          top          (charge +2/3)
              down           strange        bottom       (charge -1/3)
leptons       electron       muon           tau          (charge -1)
              e-neutrino     mu-neutrino    tau-neutrino (charge  0)
```

Charge is measured in units of the proton's charge. Ordinary matter uses only the first generation. The heavier particles are unstable: they exist for a fraction of a second after a collision and then **decay**, turning into lighter particles.

## Building protons and neutrons

Quarks are never found alone. The strong force binds them into composite particles called **hadrons**. The two that matter most:

- a **proton** is two up quarks and one down: **uud**. Its charge is 2/3 + 2/3 − 1/3 = **+1**.
- a **neutron** is one up and two downs: **udd**. Its charge is 2/3 − 1/3 − 1/3 = **0**.

The LHC, the Large Hadron Collider, is named for this: it collides protons, which are hadrons.

## The forces and their carriers

In the Standard Model, a force acts when particles exchange another kind of particle, called a **boson**. Each force has its own:

- **electromagnetism** is carried by the **photon** (the particle of light). It acts on anything with electric charge.
- the **strong force** is carried by **gluons**. It acts on quarks and holds protons and nuclei together.
- the **weak force** is carried by the **W+**, **W−** and **Z** bosons. It lets one kind of particle turn into another, and is behind radioactive decay. The W and Z are heavy: about 80 and 91 GeV.

The fourth force, **gravity**, is not part of the Standard Model.

## The Higgs boson

The theory only works mathematically if particles start out massless. They acquire mass by interacting with a field that fills all of space, the **Higgs field**. The **Higgs boson** is the particle associated with that field. It was found at CERN in 2012 by the ATLAS and CMS experiments, with a mass of about 125 GeV.

## Antimatter

Every particle has an **antiparticle** with the same mass and the opposite charge. The electron's is the **positron**. The muon (charge −1) has the antimuon (charge +1). When a neutral particle such as a Z decays to muons, it must produce one of each, so that the total charge stays zero. That is why analyses ask for "opposite-sign" muon pairs.

## Why muons are everywhere at the LHC

The muon is a heavy copy of the electron, with a mass of 0.106 GeV, about 200 times the electron's. It lives 2.2 microseconds on average. That sounds short, but at nearly the speed of light it is enough to fly through the whole detector. Muons also pass through dense material that stops almost everything else. So they are easy to identify and measure, which makes them a favourite tool for finding other particles.

## What is still unknown

The Standard Model doesn't include gravity. It has no particle that could be **dark matter**, which astronomers find to be about five times more abundant than normal matter. It doesn't explain why the universe contains matter but hardly any antimatter. Much of the LHC's work is a search for the first crack in the theory.
--- practice
@choice
Which list contains only leptons?
- up, down, electron
* electron, muon, tau-neutrino
- photon, gluon, Z
- proton, neutron, electron
! Leptons are the electron, muon and tau and their three neutrinos. Up and down are quarks, the photon, gluon and Z are force carriers, and protons and neutrons are made of quarks.

@predict
Work out the charge. A particle called the Δ++ ("delta plus plus") is made of three up quarks: uuu. What is its electric charge? Type a number.
= 2
=| +2
! Each up quark carries +2/3, and three of them make +2.

@choice
A Z boson has charge 0 and decays into two muons. What must their charges be?
- Both −1
- Both +1
* One −1 and one +1
- Both 0
! Charge is conserved: the total after the decay must equal the total before, which is zero. The pair is a muon and an antimuon.

@choice
Which force is carried by gluons, and what does it do?
- The weak force, causing radioactive decay
- Electromagnetism, acting on charged particles
* The strong force, binding quarks into protons and neutrons
- Gravity
! The photon carries electromagnetism and the W and Z carry the weak force.

@write
Without looking back, write the whole picture in your own words: the two families of matter particles and what is in them, the three forces of the Standard Model with their carriers, what a proton is made of, and what the Higgs boson is.
min: 70
```solution
Matter is made of quarks and leptons. There are six quarks (up, down, charm, strange, top, bottom) and six leptons (electron, muon, tau and a neutrino for each), arranged in three generations of increasing mass. Quarks are bound into hadrons: a proton is uud and a neutron is udd.

Forces are carried by bosons: the photon for electromagnetism, gluons for the strong force that holds quarks together, and the W and Z bosons for the weak force that lets particles change type and decay. Gravity is not included.

The Higgs boson is the particle of the Higgs field, which gives the other particles their mass. It was discovered at CERN in 2012 at about 125 GeV.
```
! Compare yours against the example for anything missing or mixed up, then reread only that part of the lesson.
--- recall
Q: What are the three generations of quarks?
A: up and down, charm and strange, top and bottom.
Q: Which bosons carry the electromagnetic, strong and weak forces?
A: The photon, gluons, and the W+, W− and Z bosons.
Q: What are a proton and a neutron made of, and how do the charges add up?
A: Proton uud: 2/3 + 2/3 − 1/3 = +1. Neutron udd: 2/3 − 1/3 − 1/3 = 0.
Q: Why do analyses look for opposite-sign muon pairs?
A: A neutral parent such as the Z must decay to a muon and an antimuon so that the total charge stays zero.

=== py2 | py | 1 | Dictionaries and counting | p2,p7,p26
## What a dictionary is

A list finds values by position. A **dictionary** (`dict`) finds values by **key**: you store a value under a name and get it back with that name. Each key appears once.

```
mass = {"electron": 0.000511, "muon": 0.106}   # key: value pairs in curly braces
mass["muon"]            # 0.106   look up by key
mass["tau"] = 1.777     # add a new pair
mass["muon"] = 0.1057   # the key exists, so this replaces its value
len(mass)               # 3
del mass["tau"]         # remove a pair
```

Lookups are fast no matter how big the dict is, which is why dicts are used everywhere. Keys must be values that can't change, such as strings, numbers or tuples. A list can't be a key.

## When the key is missing

`d[key]` on a missing key raises a `KeyError` and stops the program. There are three ways to handle that:

```
"tau" in mass           # False: "in" tests whether a KEY exists
mass.get("tau")         # None: get never raises
mass.get("tau", 0)      # 0: the second argument is the value to use when the key is missing
```

`get` does **not** add the key to the dict. It only answers the question "what is stored here, or else this default?".

## Looping

```
for name in mass:                  # loops over the keys
    print(name, mass[name])
for name, m in mass.items():       # loops over (key, value) pairs
    print(name, m)
list(mass.keys()); list(mass.values())
```

`items()` hands you each pair as a tuple, and `for name, m in ...` unpacks the tuple into two variables. Dicts keep the order in which keys were first added.

## The counting pattern

Counting how often each thing appears is the most common dict job. The idea is: for each item, read its current count (0 if we have never seen it), add 1, and store it back.

```
counts = {}
for w in ["mu", "jet", "mu"]:
    counts[w] = counts.get(w, 0) + 1
```

Trace it by hand once:

- `w = "mu"`: `counts.get("mu", 0)` is 0, so `counts` becomes `{"mu": 1}`
- `w = "jet"`: get gives 0, so `{"mu": 1, "jet": 1}`
- `w = "mu"`: get gives 1 this time, so `{"mu": 2, "jet": 1}`

## The grouping pattern

Grouping is the same idea, except each key holds a list of items instead of a number. `collections.defaultdict` saves you the "is the key there yet?" check: you give it a function that builds the starting value, and it calls that function the first time a key is used.

```
from collections import defaultdict
by_len = defaultdict(list)          # missing keys start as list(), an empty list
for w in ["mu", "jet", "tau", "e"]:
    by_len[len(w)].append(w)
# {2: ['mu'], 3: ['jet', 'tau'], 1: ['e']}
```

`defaultdict(int)` starts missing keys at `int()`, which is 0, so `counts[w] += 1` just works.

## Sorting by value

`sorted` can sort anything if you tell it what to compare. The `key=` argument is a function that is called on each element and returns the thing to sort by.

```
pairs = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
# [('mu', 2), ('jet', 1)]
```

Reading it piece by piece: `counts.items()` gives pairs like `("mu", 2)`. `lambda kv: kv[1]` is a tiny unnamed function. It means exactly the same as

```
def second(kv):
    return kv[1]
```

so each pair is sorted by its second element, the count. `reverse=True` puts the largest first. Slicing the result with `[:3]` gives the top three.

`collections.Counter(words).most_common(3)` does all of this in one line. Use it in real code, but make sure you can write the loop yourself first.
--- practice
@predict
```
d = {"a": 1}
x = d.get("b", 0)
print(x, len(d))
```
= 0 1
! `get` returns the default but doesn't store it, so the dict still has one key.

@predict
Trace the loop by hand before you answer.
```
counts = {}
for ch in "banana":
    counts[ch] = counts.get(ch, 0) + 1
print(counts["a"], counts["n"], len(counts))
```
= 3 2 3
! Three different letters appear, so the dict has three keys: b once, a three times, n twice.

@run
Write `count_charges(charges)`. It takes a list like `[1, -1, 1]` and returns a dict mapping each charge to how many times it appears. Write the loop yourself; don't use `Counter`.
```starter
def count_charges(charges):
    pass
```
```test
r = count_charges([1, -1, 1, 1, 0])
print(r[1], r[-1], r[0], len(r))
print(count_charges([]))
```
= 3 1 1 3
= {}
```solution
def count_charges(charges):
    counts = {}
    for q in charges:
        counts[q] = counts.get(q, 0) + 1
    return counts
```
! The same three steps every time: read the old count with a default, add one, store it back.

@run
Write `invert(d)`. Given a dict such as `{"mu": "lepton", "u": "quark", "e": "lepton"}`, it returns a dict from each value to the list of keys that had it: `{"lepton": ["mu", "e"], "quark": ["u"]}`. Use `defaultdict(list)` and return a normal dict.
```starter
from collections import defaultdict

def invert(d):
    pass
```
```test
r = invert({"mu": "lepton", "u": "quark", "e": "lepton"})
print(r["lepton"], r["quark"])
print(type(r) == dict)
```
= ['mu', 'e'] ['u']
= True
```solution
from collections import defaultdict

def invert(d):
    groups = defaultdict(list)
    for key, value in d.items():
        groups[value].append(key)
    return dict(groups)
```
! This is the grouping pattern: the old value becomes the new key, and each new key collects a list.

@run
Write `top_two(counts)`. Given a dict of counts, it returns a list with the two keys that have the highest counts, highest first.
```starter
def top_two(counts):
    pass
```
```test
print(top_two({"mu": 5, "e": 9, "tau": 1, "jet": 7}))
```
= ['e', 'jet']
```solution
def top_two(counts):
    pairs = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
    return [pairs[0][0], pairs[1][0]]
```
! Sort the `(key, count)` pairs by the count, then take the key (`[0]`) of the first two pairs.
--- recall
Q: What is the difference between d[k] and d.get(k, 0) when k is missing?
A: d[k] raises KeyError. d.get(k, 0) returns 0.
Q: What do you pass to defaultdict to group items into lists, and what to count?
A: defaultdict(list) for grouping, defaultdict(int) for counting.
Q: Write the expression that sorts dict items by value, largest first.
A: sorted(d.items(), key=lambda kv: kv[1], reverse=True)
Q: What does lambda kv: kv[1] mean in plain words?
A: An unnamed function that takes one argument kv and returns its second element. It is used as the sort key.

=== ap3 | app | 1 | Asking for a reference letter | 
## Why this comes first

Both programmes ask for one **academic reference letter**: a letter from someone at your university who can vouch for you. It has to be dated less than 12 months before you apply, and you upload it yourself as a PDF. It is the only document in the application that you can't produce alone. A professor may take weeks to write it, so this letter, not the application form, decides your real deadline.

## What the letter is for

Your CV says what you claim. The letter is somebody else confirming it. A selector reading it wants answers to three questions: does this person know the student well, how good is the student compared with others, and is there a concrete example that proves it?

That tells you who to ask. A good referee is someone who has **seen your work closely**: a professor who supervised a project, a thesis or a lab, or a lecturer whose course you did well in and who you actually talked to. A specific letter from a lecturer who knows you beats a vague one from a famous name. "Andrei was in my class of 200 and received a good grade" is a weak letter no matter who signs it.

Pick a backup as well. People travel, get ill or simply forget.

## Timing

Work backwards from the deadline:

- **21 January**: applications close.
- **7 January**: the date you ask the referee to deliver by. That leaves two weeks of buffer for delays and corrections.
- **at least 6 weeks earlier**: when you ask. Six weeks before 7 January is 26 November. The holidays fall in the middle, when nobody writes letters, so earlier is better.

## What to put in the request

Your referee is busy. The easier you make the task, the better the letter and the faster it arrives. Send one email that contains everything:

- **what you are applying for**, with links to both programmes
- **the date** you need it by
- that **one letter can serve both** applications if it is addressed generically, for example "To the CERN selection committee"
- your **CV** as an attachment, and a few lines reminding them what you did with them: the course, your grade, the project
- **what you would like them to mention**, such as a programming project or how you work. This isn't rude. Referees ask for it, because it gives them material.
- the format: a **signed PDF on university letterhead**, with a date

Keep the email short and offer to meet in person. An email that needs three follow-up questions will sink in their inbox.

## An example

```
Subject: Reference letter for CERN summer programmes (by 7 January)

Dear Professor Ionescu,

I took your Operating Systems course last year (grade 9.5) and built the
scheduler simulator as my project. I am applying to the CERN Summer Student
and CERN openlab Summer Student programmes for 2027, and both ask for one
academic reference letter. Would you be willing to write one for me?

The applications close on 21 January, so I would be grateful to have the
letter by 7 January. One letter addressed "To the CERN selection committee"
works for both. It should be a signed and dated PDF on university letterhead.

I have attached my CV and a short summary of the project. If it helps, it
would be useful to mention the project and how I work independently.
Links to the programmes are below. I am happy to come by your office.

Thank you for considering it.
Andrei
```

Notice what it does: reminds them who you are in the first line, asks a clear question, gives the date twice, and states the format.

## If things go wrong

No reply after a week: send **one** polite reminder, replying to your own email so the details are still there. Still nothing a few days later, or the answer is no: go to your backup immediately. Don't wait and hope.

## When the letter arrives

Check it before you file it away: your name is spelled correctly, it is dated and signed, it is a PDF, and it opens. Thank them. In April, tell them how it went. They put their name behind you, and you may need them again.
--- practice
@choice
Who would write the strongest letter for you?
- The dean, who has never met you
- A well-known professor whose 200-person lecture you attended without ever speaking to them
* A lecturer who supervised your course project and saw how you worked
- A friend who works in software
! The letter must be academic, and its strength comes from specific things the writer saw you do.

@choice
The deadline is 21 January. Why ask the referee to deliver by 7 January and not by the 20th?
- CERN requires letters two weeks early
* It leaves a buffer for a late letter, a wrong name or a missing signature, all of which need time to fix
- Professors only work in the first week of January
- The letter expires after two weeks
! Anything that depends on another person needs slack. Two weeks covers a delay and one round of corrections.

@choice
Which of these would make a reference letter unusable for the application?
- It is addressed "To the CERN selection committee"
- It mentions a specific project
* It is dated 14 months before you apply
- It is one page long
! The letter must be less than 12 months old. A generic address is fine, and is what lets one letter serve both programmes.

@choice
You asked a week ago and have heard nothing. What now?
- Wait: asking again would be rude
- Email every professor in the department
* Send one polite reminder as a reply to your original email, and contact your backup if there is still no answer after a few days
- Write the letter yourself
! One reminder is normal and expected. After that, your backup is the plan.

@write
Write the email to your actual referee, using your real course, grade and project. It should say what you are applying for, ask the question, give the date, state the format, and say what you attach.
min: 90
```solution
Subject: Reference letter for CERN summer programmes (by 7 January)

Dear Professor [name],

I took your [course] course in [year] (grade [grade]) and built [project] as my project. I am applying to the CERN Summer Student and CERN openlab Summer Student programmes for 2027, and both ask for one academic reference letter. Would you be willing to write one for me?

The applications close on 21 January, so I would be grateful to have the letter by 7 January. One letter addressed "To the CERN selection committee" works for both. It should be a signed and dated PDF on university letterhead.

I have attached my CV and a short summary of the project. It would help if you could mention [what you want mentioned]. I am happy to come by your office to talk about it.

Thank you for considering it.
[your name]
```
! Check yours against this list: who you are, what for, a clear question, the date, the format, the attachments. Then send it. The Plan tab has a task for this with a place to keep the final text.
--- recall
Q: By when should you ask your referee to send the letter, and why that date?
A: By 7 January, which leaves two weeks before the 21 January deadline in case of delays.
Q: Name four things to include when asking for a reference.
A: The programmes and links, the deadline, your CV and what you did with them, what to mention, and that it should be a signed PDF.
Q: What do you do if there's no reply after a week?
A: Send one polite reminder, and move to a backup referee if there's still no answer.
Q: What makes someone a good referee?
A: They have seen your work closely, such as a project supervisor, so they can give specific examples.

=== py3 | py | 1 | Files, with, and csv | p3,p5
## Opening a file

`open(path)` asks the operating system for a file and gives you a **file object** to read from or write to. The second argument is the **mode**:

- `"r"` read (the default). The file must exist, or you get `FileNotFoundError`.
- `"w"` write. Creates the file, and **empties it first** if it already exists.
- `"a"` append. Writes are added at the end.

An open file uses a resource of the operating system, and written data may sit in memory until the file is closed. So every file must be closed, even if the program crashes halfway. The `with` statement guarantees that:

```
with open("events.txt") as f:
    text = f.read()
# here the file is already closed, whatever happened inside the block
```

Read it as "with this open file, called `f`, do the indented block, then close it".

## Reading

```
with open("events.txt") as f:
    for line in f:                 # one line at a time: works for huge files
        line = line.rstrip("\n")   # each line still ends with its newline character
        print(line)
```

`"\n"` is the **newline character**: a single character that means "start a new line". Lines read from a file keep it at the end, which is why you strip it. `line.strip()` removes all whitespace from both ends, and gives an empty string for a blank line.

Other ways to read: `f.read()` returns the whole file as one string, and `f.readlines()` returns a list of lines. Both load everything into memory, so prefer the loop for large files.

## Text is not numbers

Everything read from a file is a string. `"45.3" + "1.0"` is `"45.31.0"`, not 46.3. Convert explicitly:

```
float("45.3")     # 45.3
int("12")         # 12
int("12.5")       # ValueError: int() wants a whole number in the text
```

## Writing

```
with open("out.txt", "w") as f:
    f.write("energy\n")            # write does not add a newline for you
    f.write(str(45.3) + "\n")      # write only accepts strings
    print("muon", 0.106, file=f)   # print can write to a file and adds the newline
```

## Parsing a simple table by hand

A CSV file ("comma-separated values") is a table stored as text: one row per line, columns separated by commas, usually with a header line first.

```
name,energy
muon,45.3
jet,120.0
```

For a simple file you can parse each line with `split`:

```
rows = []
with open("events.csv") as f:
    next(f)                               # skip the header line
    for line in f:
        name, energy = line.strip().split(",")
        rows.append((name, float(energy)))
```

`next(f)` reads one line and moves on, which is how you skip a header. `name, energy = ...` unpacks the two pieces into two variables. It raises `ValueError` if a line doesn't have exactly two pieces.

## Why the csv module exists

`split(",")` breaks as soon as a value contains a comma, as in `"Geneva, CH",12`. The `csv` module understands quoting and other details:

```
import csv
with open("events.csv", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)             # ['name', 'energy']
    for row in reader:                # each row is a list of strings
        print(row[0], float(row[1]))
```

`csv.DictReader(f)` uses the header for you and gives each row as a dict, so you can write `row["energy"]` instead of remembering column numbers. Passing `newline=""` to `open` is what the csv documentation asks for, so the module can handle line endings itself.

## A counting shortcut

`sum(1 for line in f if line.strip())` counts the non-blank lines. It adds up a 1 for each line that passes the test, without building a list.
--- practice
@predict
```
line = "muon,45.3\n"
parts = line.strip().split(",")
print(parts, len(parts[1]))
```
= ['muon', '45.3'] 4
! `strip()` removes the newline, `split(",")` cuts at the comma, and `"45.3"` is still a string of 4 characters.

@choice
A file `results.txt` already contains 100 lines. What does `open("results.txt", "w")` do to it?
- It opens the file and keeps the 100 lines, ready to add more
* It empties the file immediately, before you write anything
- It raises an error because the file exists
- It makes a backup copy first
! Mode `"w"` truncates the file as soon as it is opened. Use `"a"` to add to the end.

@run
The page can't open files, so here the lines are already in a list. Write `parse(lines)`. The first line is a header to skip. Every other line looks like `"name,energy"`. Return a list of `(name, energy)` tuples with the energy as a float, skipping blank lines.
```starter
def parse(lines):
    pass
```
```test
rows = parse(["name,energy\n", "muon,45.3\n", "\n", "jet,120\n"])
print(rows)
print(rows[0][1] + rows[1][1])
```
= [('muon', 45.3), ('jet', 120.0)]
= 165.3
```solution
def parse(lines):
    rows = []
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        name, energy = line.split(",")
        rows.append((name, float(energy)))
    return rows
```
! `lines[1:]` skips the header, an empty string counts as false so `if not line` catches blank lines, and `float()` turns the text into a number.

@local
Now with a real file. In a new folder, create `events.csv` containing the four lines below, then write `read_events.py` that opens it with `with`, uses `csv.reader`, skips the header and prints the name of the event with the highest energy and the total energy. Run it and paste the output.
```
name,energy
muon,45.3
jet,120.0
electron,30.2
```
= jet
= 195.5
! If the total printed as something like 45.3120.030.2, the energies were still strings when you added them.

@write
From memory, write the lines that open `log.txt` for appending and add one line saying `run 42 ok`.
```solution
with open("log.txt", "a") as f:
    f.write("run 42 ok\n")
```
! Mode `"a"` keeps what is there. `write` needs the `\n` because it doesn't add one.
--- recall
Q: Why open files with a with block?
A: The file is closed automatically when the block ends, even if an exception is raised.
Q: What does next(reader) do in a csv loop?
A: It reads one row and moves on, so it is used to skip or grab the header.
Q: What type are the values csv.reader gives you?
A: Always strings. Convert them with float() or int().
Q: What is the difference between open modes "w" and "a"?
A: "w" empties the file first. "a" keeps it and adds at the end.

=== s1 | linux | 1 | Everyday Git | s1
## What Git is for

Git records the history of a project as a series of **snapshots**. Each snapshot is called a **commit**: the complete state of all your files at one moment, with a message saying what changed and why. You can go back to any commit, see exactly what changed between two, and work on several ideas in parallel without them interfering. All collaborative software at CERN runs on it.

Install it (`sudo apt install git`, or from git-scm.com), then tell it who you are, once:

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## A repository

A **repository** ("repo") is a project folder that Git tracks. `git init` turns the current folder into one by creating a hidden `.git` directory, where the whole history is stored.

```
mkdir cern-prep
cd cern-prep
git init
```

## The three places

This is the part that confuses everyone at first. A change passes through three places:

- the **working directory**: the files as you see and edit them
- the **staging area**: a waiting room holding the changes that will go into the next commit
- the **history**: the commits already made

```
git status               # what has changed, and what is staged
git add sum.cpp          # copy this file's changes into the staging area
git add -A               # stage every change in the project
git commit -m "Add sum program"     # turn what is staged into a commit
```

Why two steps? The staging area lets you pick what belongs together. If you fixed a bug and also reformatted a file, you can commit them separately, each with its own message.

`git status` is safe and tells you what to do next. Run it constantly.

## Looking at history and changes

```
git log --oneline        # one line per commit: a short ID and the message
git diff                 # changes you have made but not staged
git diff --staged        # changes that are staged and will go into the next commit
```

Each commit has an ID, a long string of letters and digits (a **hash**). The first seven characters are usually enough to refer to it.

A good commit message says what the change does, in the imperative: "Add binary search drill", "Fix off-by-one in histogram".

## Branches

A **branch** is a movable label that points to a commit. The default branch is called `main`. Creating a branch gives you a separate line of work: commits you make there don't affect `main` until you choose to combine them.

```
git switch -c drills-week1     # create a branch and switch to it (-c = create)
git switch main                # switch back
git branch                     # list branches; the star marks the current one
git merge drills-week1         # bring that branch's commits into the current branch
```

Older tutorials use `git checkout -b name` and `git checkout name`. They do the same thing.

If two branches changed the same lines, a merge stops with a **conflict**. Git marks the conflicting sections in the file with `<<<<<<<`, `=======` and `>>>>>>>`. You edit the file to what it should be, remove the markers, then `git add` it and `git commit`.

## Remotes: GitHub

So far everything is on your machine. A **remote** is a copy of the repository on a server such as GitHub. By convention the main remote is named `origin`.

```
git clone https://github.com/you/cern-prep.git    # download a repo, history included
git push -u origin main        # upload your commits; -u remembers the link for next time
git push                       # afterwards this is enough
git pull                       # download and merge what others pushed
```

The first push of a new branch needs `-u origin branch-name`, which sets its **upstream**: the remote branch it is tied to.

To connect an existing local repo to a new empty GitHub repo, GitHub shows you the two lines to run: `git remote add origin <url>` and then the push.

## Undoing

```
git restore sum.cpp             # throw away unstaged edits to this file
git restore --staged sum.cpp    # unstage it, keeping your edits
git commit --amend              # replace the last commit (only before you have pushed it)
git revert <id>                 # make a new commit that undoes an old one
```

Stay away from `git reset --hard` until you know exactly what it does. It discards uncommitted work for good.

## .gitignore

Compiled programs, data files and editor settings don't belong in the history. List patterns for them in a file named `.gitignore`, one per line (`a.out`, `*.o`, `data/`), and Git will leave them alone.
--- practice
@choice
You edited `sum.cpp` and ran `git commit -m "Fix sum"` without anything else. Git says "no changes added to commit". Why?
- The file has a syntax error
* The change is only in the working directory. It has to be staged with `git add` before it can be committed
- You are on the wrong branch
- The commit message is too short
! A commit contains what is in the staging area. `git add sum.cpp` puts the change there.

@local
Create a practice repository and make two commits. Run these, then paste the output of the last command.
```
mkdir git-practice
cd git-practice
git init
echo "energy" > notes.txt
git add notes.txt
git commit -m "Add notes"
echo "momentum" >> notes.txt
git add -A
git commit -m "Add momentum line"
git log --oneline
```
min: 2
= Add notes
= Add momentum line
! The newest commit is listed first. Each line starts with the short ID of the commit.

@local
In the same repository: create and switch to a branch called `experiment`, add a line to `notes.txt`, commit it, switch back to `main`, and run `cat notes.txt`. Then merge `experiment` and run `git log --oneline`. Paste the output of the final `git log --oneline`.
min: 3
= Add notes
= Add momentum line
! Before the merge, `main`'s `notes.txt` doesn't have your new line, because the commit lives on the other branch. After the merge the log shows three commits.

@predict
A repository has one commit. You edit `a.txt` and `b.txt`, then run `git add a.txt` and `git commit -m "Update a"`. How many of the two files does `git status` still show as modified?
```
git status
```
= 1
! Only `a.txt` was staged, so only it went into the commit. `b.txt` is still modified in the working directory.

@write
From memory, write the commands to: create and switch to a branch `drills/day1`, stage every change, commit with a message, and push the branch to `origin` for the first time.
min: 4
```solution
git switch -c drills/day1
git add -A
git commit -m "Day 1 drills"
git push -u origin drills/day1
```
! `-c` creates the branch and `-u` sets the upstream, so later a plain `git push` is enough.
--- recall
Q: What are the three places a change passes through in Git?
A: The working folder, the staging area (index), and the commit history.
Q: How do you create a branch and switch to it in one command?
A: git switch -c name (or git checkout -b name).
Q: Why does the first push of a new branch use -u?
A: It sets the upstream, so later git push and git pull know which remote branch to use.
Q: What is a commit?
A: A snapshot of all tracked files at one moment, with a message and a unique ID.

=== c1 | cpp | 1 | A C++ program from scratch | c1
## From text to a running program

Python reads your file and runs it line by line. C++ works in two steps. First a **compiler** translates your whole text file (the **source code**) into a file of machine instructions (the **executable**). Then you run that executable. The compiler checks the entire program before anything runs, so many mistakes are caught early, and the result runs fast. That is why CERN's heavy data processing is written in C++.

You need a compiler on your machine. On Linux or WSL: `sudo apt install g++`. On macOS: `xcode-select --install`. On Windows, the simplest route is WSL (run `wsl --install` in PowerShell, then use the Linux command). If you can't install anything yet, you can run small programs in the browser at [Compiler Explorer](https://godbolt.org/) or [OnlineGDB](https://www.onlinegdb.com/online_c++_compiler).

## The smallest useful program

```
#include <iostream>

int main() {
    std::cout << "Hello, CERN!\n";
    return 0;
}
```

Line by line:

- `#include <iostream>` pulls in a **header**: a file that declares things other people wrote. `iostream` ("input/output stream") declares the tools for reading and printing. Without it, the compiler doesn't know what `std::cout` is.
- `int main() { ... }` defines the function named `main`. Every program starts running at `main`. The `int` in front says it returns a whole number.
- The curly braces `{ }` mark where the function's body begins and ends. C++ uses braces where Python uses indentation. Indentation is only for human readers.
- Every statement ends with a semicolon `;`. Forgetting one is the most common beginner error.
- `return 0;` ends the program and reports "success" to the operating system. Any other number means an error.

## std:: and the :: operator

The C++ **standard library** puts all its names in a **namespace** called `std`. A namespace is like a surname: it keeps the library's `cout` apart from anything you might name `cout` yourself. The `::` operator means "inside", so `std::cout` reads as "`cout`, the one inside `std`".

## Printing: std::cout and <<

`std::cout` ("character output") is an object that represents the terminal's output. It is a **stream**: a place that characters flow into, one after another.

`<<` is the **insertion operator**. `std::cout << x` means "send `x` into the output stream". The arrows point in the direction the data moves: from the value, into `cout`.

```
std::cout << "Mass: " << 91.2 << " GeV" << '\n';
// prints: Mass: 91.2 GeV
```

You can chain several `<<` because each one hands the stream back as its result, ready for the next. Nothing is added for you: no spaces between items and no line break at the end. To end the line you send a newline character, `'\n'`.

## Reading: std::cin and >>

`std::cin` ("character input") is the stream of what the user types, or of a file fed into the program. `>>` is the **extraction operator**: `std::cin >> x` means "take the next value out of the input and store it in `x`". Again the arrows show the direction: from `cin`, into the variable.

```
int x;
std::cin >> x;     // waits for input, skips spaces and line breaks, reads one number
```

`>>` looks at the type of the variable to decide how to read. For an `int` it reads digits and converts them to a number. If the input doesn't fit, such as letters where a number is expected, the read **fails**.

A way to remember the pair: `cout <<` pushes out, `cin >>` pulls in.

(You may later see `<<` and `>>` between two whole numbers, as in `1 << 3`. There they shift bits, which is their original meaning. C++ lets the same operator do different jobs for different types, and streams reuse these two.)

## Variables and types

Unlike Python, every variable has a fixed **type** that you write when you create it, and it can never hold anything else.

```
int count = 0;          // whole number, usually up to about ±2.1 billion
long long big = 0;      // whole number, at least up to about ±9 × 10^18
double energy = 45.3;   // number with decimals; the default choice for those
char c = 'x';           // one character, in single quotes
bool ok = true;         // true or false
```

`'x'` in single quotes is one character. `"x"` in double quotes is a string of text. They are different types.

A local variable you don't give a value holds whatever happened to be in memory: garbage. Always initialise. Division of two whole numbers throws away the remainder: `7 / 2` is `3`. If either side is a `double` you get `3.5`: write `7 / 2.0`.

## Reading until the input ends

```
#include <iostream>

int main() {
    int x;
    long long sum = 0;
    while (std::cin >> x) {
        sum += x;              // short for: sum = sum + x
    }
    std::cout << sum << '\n';
    return 0;
}
```

`while (condition) { ... }` repeats the body as long as the condition is true. Here the condition is the read itself. `std::cin >> x` hands back the stream, and a stream used as a condition counts as true if the last read worked and false if it failed. So the loop reads numbers one at a time and stops at the end of the input, or at the first thing that isn't a number.

Prefer `'\n'` to `std::endl`. Both end the line, but `endl` also forces the output to be written out immediately, which is slow inside loops.

## Compiling and running

```
g++ -std=c++17 -Wall -Wextra -O2 sum.cpp -o sum
./sum
```

- `g++` is the compiler, and `sum.cpp` is your source file.
- `-std=c++17` selects the 2017 version of the language.
- `-Wall -Wextra` turn on warnings. Warnings point at code that is legal but probably wrong. Read them and fix them.
- `-O2` asks the compiler to optimise for speed.
- `-o sum` names the executable. Without it the file is called `a.out`.
- `./sum` runs it. `./` means "in the current folder".

When run like this, the program waits for you to type numbers. Press Ctrl+D on an empty line (Ctrl+Z then Enter on Windows) to signal the end of the input. Or feed it input from the shell: `echo "1 2 3" | ./sum` sends that text in, and `./sum < numbers.txt` sends in a file.
--- practice
@choice
In `std::cout << x;`, what does `<<` do?
- It compares `cout` and `x`
- It reads a value from the keyboard into `x`
* It sends the value of `x` into the output stream, so it is printed
- It shifts `x` to the left
! The arrows point the way the data moves: from `x` into `cout`. `>>` with `cin` goes the other way.

@predict
Nothing is added between items unless you send it.
```
#include <iostream>

int main() {
    std::cout << "a" << 1 + 2 << "b" << '\n';
    std::cout << 7 / 2 << " " << 7 / 2.0 << '\n';
    return 0;
}
```
= a3b
= 3 3.5
! `1 + 2` is computed before it is printed. Two whole numbers divide to a whole number, and one `double` is enough to get decimals.

@local
Type the hello program from the lesson into `hello.cpp` (type it, don't paste), compile it with the full `g++` command including `-Wall -Wextra`, run it, and paste what it prints.
= Hello, CERN!
! If the compiler complained, read the first error only. It names a line number, and the cause is usually on that line or the one above, often a missing semicolon.

@local
Write `sum.cpp` from the lesson without looking at it, compile it, then run `echo "10 20 30 abc 5" | ./sum` and paste the output.
= 60
! The loop stops at `abc` because reading an `int` fails there, so the 5 after it is never read.

@write
From memory: a complete program that reads two whole numbers from input and prints their product followed by a newline.
min: 6
```solution
#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;
    std::cout << a * b << '\n';
    return 0;
}
```
! `>>` chains just like `<<`: the first number goes into `a` and the second into `b`.
--- recall
Q: Why does while (std::cin >> x) stop at the end of the input?
A: The >> expression returns the stream, which converts to false when a read fails (end of input or bad data).
Q: Which g++ flags turn on C++17 and the standard warnings?
A: -std=c++17 -Wall -Wextra
Q: What is 7 / 2 in C++, and how do you get 3.5?
A: 3, because integer division truncates. Make one side a double: 7 / 2.0.
Q: What do << and >> mean with std::cout and std::cin?
A: << sends a value into the output stream (prints it). >> takes the next value from the input stream and stores it in a variable.
Q: What does std:: mean in std::cout?
A: cout lives in the namespace std, the standard library. :: means "inside".

=== c2 | cpp | 2 | References, pointers and const | c2,c4
## Variables live in memory

Every variable occupies a spot in the computer's memory, and every spot has a number called its **address**. Normally you use a variable by name and never think about its address. References and pointers are the two tools for working with **where a variable is** instead of copying its value. You need them because C++ copies by default:

```
int a = 1;
int b = a;    // b is a separate copy
b = 5;        // a is still 1
```

This is the opposite of Python lists, where a second name refers to the same object.

## Functions copy their arguments

```
void add_one(int x) { x = x + 1; }

int n = 5;
add_one(n);     // n is still 5: the function changed its own copy
```

`void` means the function returns nothing. `x` is a new variable that starts as a copy of `n`. This is called **pass by value**.

## References: a second name

A **reference** is another name for an existing variable. You declare one by putting `&` after the type.

```
int a = 1;
int& r = a;   // r is not a new int. It is a second name for a.
r = 5;        // a is now 5
```

A reference must be attached to something when it is created, and it stays attached to that same variable for its whole life.

Used as a function parameter, a reference lets the function work on the caller's variable:

```
void add_one(int& x) { x = x + 1; }

int n = 5;
add_one(n);     // n is now 6
```

The call looks the same. Only the `&` in the parameter list changed. This is **pass by reference**.

## Pointers: a variable that holds an address

A **pointer** is a variable whose value is the address of another variable. Two operators go with it:

- `&x` in an expression means "the address of `x`"
- `*p` means "the thing that `p` points to". Using it is called **dereferencing**.

```
int a = 1;
int* p = &a;    // p holds the address of a. Read int* as "pointer to int".
*p = 7;         // follow the pointer and assign: a is now 7
std::cout << *p << '\n';   // prints 7
std::cout << p << '\n';    // prints the address itself, something like 0x7ffd5e8c
```

The symbols are confusing at first because they mean different things in different places. In a **declaration**, `int& r` makes a reference and `int* p` makes a pointer. In an **expression**, `&a` takes an address and `*p` follows a pointer.

Unlike a reference, a pointer can be changed to point somewhere else, and it can point at nothing:

```
int b = 2;
p = &b;          // now points to b
p = nullptr;     // points to nothing
*p = 3;          // crash: there is nothing there to assign to
```

Following a null or invalid pointer is **undefined behaviour**: the language makes no promise about what happens. Usually the program crashes, but it may also silently corrupt data.

When a pointer points to an object with members, `p->name` is shorthand for `(*p).name`.

## Which to use

Prefer a reference when there is always an object and it never changes. Use a pointer when "no object" is a possible state or when it must be re-pointed.

## const: a promise the compiler checks

`const` means "this may not be modified through this name". The compiler rejects code that tries.

```
const double PI = 3.14159;
PI = 3;                        // compile error
```

Its most important use is in parameters. Copying a large object like a string or a vector of a million numbers is slow. Passing by reference avoids the copy, and adding `const` promises the function will only read it:

```
bool is_empty(const std::string& s) { return s.empty(); }
```

The standard guideline for parameters:

- small, simple types (`int`, `double`, `char`, `bool`): pass by value
- something the function must modify: pass by reference, `T&`
- something big that is only read: pass by const reference, `const T&`

`T` here stands for any type.

## Dangling references

A local variable is destroyed when its function returns. Returning a reference or pointer to it hands the caller the address of something that no longer exists:

```
int& bad() {
    int x = 5;
    return x;      // x dies here: the caller gets a dangling reference
}
```

The compiler warns about this simple case with `-Wall`, which is one reason to always turn warnings on.
--- practice
@predict
```
#include <iostream>

void by_value(int x) { x = x * 2; }
void by_ref(int& x) { x = x * 2; }

int main() {
    int a = 5;
    by_value(a);
    std::cout << a << ' ';
    by_ref(a);
    std::cout << a << '\n';
}
```
= 5 10
! `by_value` doubles its own copy. `by_ref` doubles the caller's variable.

@predict
Follow each line and keep track of what `a` and `b` hold.
```
#include <iostream>

int main() {
    int a = 1, b = 2;
    int* p = &a;
    *p = 10;
    p = &b;
    *p = 20;
    int& r = a;
    r = r + 1;
    std::cout << a << ' ' << b << '\n';
}
```
= 11 20
! `*p = 10` writes to `a`. After `p = &b`, `*p = 20` writes to `b`. `r` is another name for `a`, so `a` becomes 11.

@choice
A function receives a `std::vector<double>` with a million entries and only computes their average. How should it take the parameter?
- `std::vector<double> v`
- `std::vector<double>& v`
* `const std::vector<double>& v`
- `std::vector<double>* v`
! By value would copy a million numbers. The const reference avoids the copy and promises not to modify the caller's data.

@local
Write `swap.cpp`: a function `void swap_ints(int& a, int& b)` that exchanges two values using a temporary variable, and a `main` that sets `x = 3`, `y = 8`, calls it, and prints `x` then `y` separated by a space. Compile with warnings, run it, paste the output.
= 8 3
! If it printed `3 8`, the parameters are probably missing their `&`, so the function swapped copies.

@write
From memory, write a function `count_char` that takes a string by const reference and a `char`, and returns how many times that character appears. Loop with an index from 0 to `s.size()`.
min: 6
```solution
#include <string>

int count_char(const std::string& s, char c) {
    int n = 0;
    for (std::size_t i = 0; i < s.size(); ++i) {
        if (s[i] == c) ++n;
    }
    return n;
}
```
! `for (start; condition; step)` is the classic counting loop. `++n` adds one. `std::size_t` is the unsigned whole-number type that `size()` returns.
--- recall
Q: Name two differences between a reference and a pointer.
A: A reference must be initialised and can't be null or re-bound. A pointer can be null, can be re-pointed, and needs * to reach the value.
Q: How should a function take a std::vector it only reads?
A: By const reference, const std::vector<T>& v, which avoids a copy.
Q: What is a dangling reference?
A: A reference or pointer to an object that no longer exists, such as a local variable returned from a function.
Q: What do &x and *p mean in an expression?
A: &x is the address of x. *p is the value that the pointer p points to.

=== g1 | linux | 2 | Git branches, merging and pull requests | s4,s5
## Why nobody commits straight to main

In every team at CERN, the `main` branch is the version that works. Nobody edits it directly. Each change is made on its own **branch**, pushed, looked at by someone else, tested automatically, and only then merged into `main`. On GitHub this request to merge is called a **pull request** (PR). CERN's own GitLab calls it a merge request. It is the same thing.

You already know commits and `git push` from the first Git lesson. This lesson covers what happens when history splits in two and has to come back together.

## What a branch really is

A commit knows its parent, the commit that came before it. That chain is the history. A **branch** is nothing more than a label stuck on one commit. Creating a branch copies no files. It adds a second label.

```
git switch -c fix-typo      # create the label fix-typo here and move onto it
git branch                  # list branches; the star marks where you are
git switch main             # go back to main
```

`git switch -c` does what `git checkout -b` does in older tutorials. Git also keeps a special label called `HEAD`, which means "the commit I am on now". When you commit, the branch you are on moves forward to the new commit, and the other branches stay where they were.

To see the shape of the history, use:

```
git log --oneline --graph --all
```

`--oneline` prints one line per commit, `--graph` draws the lines between them, and `--all` includes every branch.

## Merging

`git merge fix-typo` means: bring the work from `fix-typo` into the branch I am on. Two things can happen.

If `main` has not moved since you branched, Git only has to slide the `main` label forward to where `fix-typo` is. This is a **fast-forward**, and no new commit is created.

If both branches have new commits, Git creates a **merge commit**, a commit with two parents that joins the two lines:

```
*   016be68 Merge branch 'fix-energy'
|\
| * 9d42fa4 Set energy to 13.6
* | 0170ea5 Set energy to 14
|/
* b39a72c Add config
```

Read the graph from the bottom. Each `*` is a commit. The history splits after "Add config", each side gets one commit, and the top commit joins them.

After a merge the branch label has done its job: `git branch -d fix-typo` deletes the label. The commits stay.

## Conflicts

Git merges changes to different lines by itself. When both branches changed **the same lines**, it can't know which version you want. It stops and tells you:

```
CONFLICT (content): Merge conflict in config.txt
Automatic merge failed; fix conflicts and then commit the result.
```

Inside the file it has written both versions, separated by markers:

```
<<<<<<< HEAD
energy = 14.0
=======
energy = 13.6
>>>>>>> fix-energy
```

Between `<<<<<<< HEAD` and `=======` is the version from the branch you are on. Between `=======` and `>>>>>>> fix-energy` is the version coming in. A conflict is not an error. It is a question, and you answer it in four steps:

- Edit the file so it contains exactly what you want, and delete all three marker lines.
- `git add config.txt` tells Git this file is resolved.
- `git commit` finishes the merge. Git proposes the message for you.
- If you want out instead, `git merge --abort` puts everything back as it was before the merge.

`git status` shows which files are still in conflict at any moment.

## The pull request workflow

This is the loop you will repeat every day on a real project:

```
git switch main
git pull                          # start from the newest main
git switch -c add-readme          # a branch per change
# ... edit, git add, git commit ...
git push -u origin add-readme     # publish the branch
```

Then, on GitHub, open a pull request from `add-readme` into `main`. The page shows your commits and every changed line. Automatic checks run, a reviewer comments, and you answer by pushing more commits to the same branch, which update the pull request. When it is approved, press Merge. Afterwards, tidy up locally:

```
git switch main
git pull
git branch -d add-readme
```

`git pull` is two commands in one: `git fetch` downloads the new commits without touching your files, and `git merge` then merges them into your branch.

You will also hear about `git rebase`. It replays your commits on top of the newest `main`, which gives a straight history without merge commits. It rewrites commits, so the rule is: never rebase commits that other people already have.

## Undoing

```
git restore notes.txt            # throw away uncommitted edits in the file
git restore --staged notes.txt   # un-stage it, keep the edits
git commit --amend               # redo the last commit (adds what is staged, lets you fix the message)
git commit --amend --no-edit     # the same, keeping the message
git revert abc1234               # make a NEW commit that undoes commit abc1234
git stash                        # put uncommitted work aside; git stash pop brings it back
```

`--amend` replaces the last commit with a new one, so use it only before you push. Once a commit is pushed, other people may have it, and the safe way to undo it is `git revert`, which adds to history instead of rewriting it.

## A commit message people can use

The first line says what the commit does, in the imperative and under about 50 characters: "Fix bin edge in histogram", not "fixed stuff". If the reason isn't obvious, leave an empty line and explain why in a sentence or two.
--- practice
@choice
You create a branch, make two commits on it and switch back to `main`. Nobody has committed to `main` in the meantime. What does `git merge` do?
- It creates a merge commit with two parents
* It moves the `main` label forward to the branch's last commit: a fast-forward, with no new commit
- It reports a conflict
- It copies the files and deletes the branch
! With nothing new on `main`, there is nothing to combine. A merge commit is only needed when both sides have moved.

@choice
You are on `main` and run `git merge fix-energy`. Git reports a conflict and the file now contains the lines below. Which value was on `main` before the merge?
```
<<<<<<< HEAD
energy = 14.0
=======
energy = 13.6
>>>>>>> fix-energy
```
* 14.0
- 13.6
- Neither. Git invented both lines
- Both, on different lines of the original file
! The part between `<<<<<<< HEAD` and `=======` is your current branch. The part below `=======` is the branch being merged in.

@local
Create and resolve a real conflict. Run the commands below in a terminal, one at a time, and read what Git answers. The last one stops with a conflict. Open `config.txt`, make it say `energy = 13.6` with no marker lines, then finish the merge with `git add` and `git commit`. Paste the output of `git log --oneline --graph`.
```
mkdir merge-lab && cd merge-lab && git init -b main
echo "energy = 13.0" > config.txt
git add config.txt && git commit -m "Add config"
git switch -c fix-energy
echo "energy = 13.6" > config.txt
git commit -am "Set energy to 13.6"
git switch main
echo "energy = 14.0" > config.txt
git commit -am "Set energy to 14"
git merge fix-energy
```
min: 5
= Merge branch 'fix-energy'
= |/
= Set energy to 14
! `git commit -am` stages every changed tracked file and commits in one step. The graph shows the split after "Add config" and the merge commit that joins both sides again.

@write
From memory: you are on an up-to-date `main`. Write the commands that take you to a published branch `add-readme` containing one commit that adds `README.md`, ready for a pull request.
min: 4
```solution
git switch -c add-readme
git add README.md
git commit -m "Add README"
git push -u origin add-readme
```
! `-u origin add-readme` creates the branch on GitHub and links your local branch to it, so later a plain `git push` is enough.

@choice
Yesterday you pushed a commit to `main` that breaks the build, and your colleagues have already pulled it. What is the right way to undo it?
- `git commit --amend` and push again
- Delete the repository and clone it again
* `git revert` with the commit's ID, then push: a new commit that applies the opposite change
- `git restore` on the changed files
! Pushed history is shared. Rewriting it with `--amend` would leave everyone else's copy out of step, while `revert` only adds a commit.
--- recall
Q: What is a branch in Git?
A: A movable label that points at one commit. Creating a branch copies nothing.
Q: In a conflicted file, what lies between <<<<<<< HEAD and =======, and what lies below =======?
A: Above is the version from the branch you are on. Below, down to >>>>>>>, is the version from the branch being merged in.
Q: How do you finish a merge after fixing a conflict by hand?
A: git add the fixed file, then git commit. To give up instead: git merge --abort.
Q: When do you use git revert instead of git commit --amend?
A: When the commit is already pushed. revert adds a new commit that undoes it; amend rewrites history, which is only safe before pushing.

=== c3 | cpp | 2 | std::vector and range-for | c3,c20
## The default container

`std::vector<T>` is C++'s version of a Python list, with one difference: all elements have the same type, which you name in the angle brackets. `std::vector<double>` holds doubles and nothing else. It lives in the header `<vector>`.

```
#include <vector>

std::vector<double> v;              // empty
std::vector<int> zeros(5, 0);       // five elements, each 0
std::vector<int> u = {3, 1, 4};     // three elements

v.push_back(2.5);                   // add at the end (Python's append)
v.push_back(7.0);
v.size();                           // 2: the number of elements
v.empty();                          // false
v[0];                               // 2.5   indexes start at 0
v.back();                           // 7.0   the last element
v.front();                          // 2.5   the first element
v.pop_back();                       // remove the last element
```

The angle-bracket syntax means `vector` is a **template**: one piece of library code that works for any element type you name.

## Out of range

`v[i]` does **not** check whether `i` is valid. Reading `v[10]` from a vector of 2 elements is undefined behaviour: you may get garbage, or a crash, or nothing visible at all. There is no friendly `IndexError`.

`v.at(i)` does check, and throws an exception (`std::out_of_range`) that stops the program with a message. Use `at()` while learning and wherever speed isn't critical.

Likewise `front()` and `back()` on an empty vector are undefined. Check `empty()` first if that can happen.

## Looping with an index

```
for (std::size_t i = 0; i < v.size(); ++i) {
    std::cout << i << ": " << v[i] << '\n';
}
```

The three parts in the brackets are: where to start, the condition for continuing, and what to do after each round. `++i` adds one to `i`.

`size()` returns a `std::size_t`, an **unsigned** type: it can't be negative. That has a nasty consequence. On an empty vector, `v.size() - 1` is not −1. It wraps around to an enormous positive number. Comparing an `int` with `size()` also triggers a warning. Using `std::size_t` for the index avoids both.

## Range-for: when you don't need the index

```
for (double x : v) {
    std::cout << x << '\n';
}
```

Read the colon as "in": for each `x` in `v`. This is the form to prefer. What you write before the colon decides how each element is handed to you:

```
for (double x : v) { }               // x is a COPY: fine for small types
for (double& x : v) { x *= 2; }      // x is a reference: changes the vector itself
for (const std::string& s : names) { }   // read big elements without copying them
```

`x *= 2` is short for `x = x * 2`. If you write the first form and modify `x`, the vector doesn't change, because you modified a copy.

`auto` asks the compiler to work out the type for you, so `for (const auto& s : names)` is common. It doesn't make the variable dynamic like in Python. The type is still fixed, you just don't spell it.

## Passing vectors to functions

A vector can be big, so the parameter rules from the last lesson matter:

```
double mean(const std::vector<double>& v) {       // read only: const reference
    double sum = 0.0;
    for (double x : v) sum += x;
    return sum / v.size();
}

void scale(std::vector<double>& v, double f) {    // modifies: plain reference
    for (double& x : v) x *= f;
}
```

## Returning several values with a struct

A function returns one thing. To return a few related values, group them in a `struct`: a simple type with named members.

```
struct Stats { double max; double mean; };

Stats s = {9.5, 4.2};
std::cout << s.max << '\n';
```

A function can build one in its return statement: `return {mx, sum / v.size()};`.

## Sorting, square roots and decimals

Three small tools you need as soon as you compute anything from a vector.

`std::sort` from the header `<algorithm>` puts a vector in ascending order. It takes two **iterators**, which are markers for positions in a container: `v.begin()` marks the first element and `v.end()` marks the position just after the last one.

```
#include <algorithm>

std::vector<double> v{3.0, 1.0, 2.0};
std::sort(v.begin(), v.end());        // v is now 1 2 3
```

The header `<cmath>` holds the mathematical functions: `std::sqrt(x)` is the square root, `std::pow(x, 3)` is x to the power 3, and `std::abs(x)` is the absolute value.

By default `std::cout` prints a `double` with at most six significant digits and drops trailing zeros, so 3.5 prints as `3.5` and 2.0 as `2`. To print a fixed number of decimals, include `<iomanip>` and send `std::fixed` and `std::setprecision(3)` to the stream first. They stay in effect for everything printed afterwards:

```
#include <iomanip>

std::cout << std::fixed << std::setprecision(3);
std::cout << 3.5 << ' ' << 2.0 << '\n';     // 3.500 2.000
```

## How it grows

A vector keeps its elements side by side in one block of memory. When the block is full, `push_back` allocates a bigger block and moves everything across. That means any pointer or reference to an element can become invalid after a `push_back`. Don't hold on to them while the vector grows.
--- practice
@predict
```
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    for (int x : v) { x = x * 10; }
    for (int& x : v) { x = x + 1; }
    v.push_back(v.front() + v.back());
    for (int x : v) std::cout << x << ' ';
    std::cout << v.size() << '\n';
}
```
= 2 3 4 6 4
! The first loop changes copies, so nothing happens. The second adds 1 to each real element. Then 2 + 4 = 6 is appended, giving four elements.

@choice
`v` is an empty `std::vector<int>`. What is `v.size() - 1`?
- −1
- 0
* A huge positive number, because `size()` is unsigned and wraps around
- A compile error
! Unsigned numbers can't go below zero. Subtracting from 0 wraps to the largest value the type can hold.

@local
Write `stats.cpp`: a function taking `const std::vector<double>&` that returns a `struct Stats {double max; double mean;}`, using a range-for loop. In `main`, call it on `{4.0, 9.5, 1.5, 5.0}` and print the max and the mean separated by a space. Compile with warnings, run, and paste the output.
= 9.5 5
! The four values add to 20, so the mean is 5. `std::cout` prints a `double` with no decimals when it is a whole number.

@write
From memory, write a function `keep_above` that takes a vector of doubles by const reference and a threshold, and returns a **new** vector with only the elements greater than the threshold.
min: 6
```solution
#include <vector>

std::vector<double> keep_above(const std::vector<double>& v, double cut) {
    std::vector<double> out;
    for (double x : v) {
        if (x > cut) out.push_back(x);
    }
    return out;
}
```
! Returning a vector by value is fine and efficient in modern C++: the result is moved out, not copied.

@choice
Which loop doubles every element of `std::vector<double> v`?
- `for (double x : v) x *= 2;`
* `for (double& x : v) x *= 2;`
- `for (const double& x : v) x *= 2;`
- `for (x in v) x *= 2;`
! Without `&` you change a copy. With `const` the compiler refuses to compile the assignment.

@predict
```
#include <algorithm>
#include <iomanip>
#include <iostream>
#include <vector>

int main() {
    std::vector<double> v{2.5, 0.5, 1.0};
    std::sort(v.begin(), v.end());
    std::cout << std::fixed << std::setprecision(2) << v[0] << ' ' << v[2] << '\n';
}
```
= 0.50 2.50
! `std::sort` puts the smallest value first, so `v[0]` is 0.5 and `v[2]` is 2.5. `std::fixed` with `std::setprecision(2)` prints exactly two decimals.
--- recall
Q: What is the difference between v[i] and v.at(i)?
A: at() checks bounds and throws std::out_of_range. [] doesn't check, so going out of range is undefined behaviour.
Q: Which range-for form changes elements in place?
A: for (auto& x : v)
Q: Why is v.size() - 1 dangerous?
A: size() is unsigned, so on an empty vector the result wraps around to a huge number.
Q: What does auto do in for (const auto& s : names)?
A: It tells the compiler to deduce the element type. The type is still fixed at compile time.
Q: Which header provides std::sort, and what are its two arguments?
A: <algorithm>. It takes v.begin() and v.end(): the start of the range and the position just past its end.

=== ph3 | phys | 2 | The LHC: beams, energy and luminosity | 
## The machine

The **Large Hadron Collider** (LHC) is a ring 26.7 km around, in a tunnel about 100 m under the French-Swiss border near Geneva. Two beams of protons travel through it in opposite directions, in two separate pipes, and are brought together at four points where the big detectors sit. A **hadron** is a particle made of quarks, such as the proton, which explains the name.

The protons are kept on their circular path by 1,232 superconducting magnets, each 15 m long, with a field of about 8 tesla. To stay superconducting they are cooled with liquid helium to 1.9 kelvin, which is colder than outer space.

## Energy and its units

Particle physics measures energy in **electronvolts** (eV): the energy one electron gains when it crosses a voltage of one volt. That is a tiny amount, so the usual prefixes are used: keV (thousand), MeV (million), GeV (billion, 10⁹) and TeV (10¹² eV). A proton at rest has a mass equivalent to 0.938 GeV, close to 1 GeV, which makes the GeV the natural unit of the field.

In the running period called Run 3 (2022 to 2026), each proton had an energy of 6.8 TeV, about 7,000 times its own mass. Two beams head-on give a **centre-of-mass energy** of 13.6 TeV, written √s = 13.6 TeV. This is the energy available for creating new particles, through E = mc².

The LHC can't accelerate protons from rest. A chain of older machines hands them on, each raising the energy: Linac4 (to 160 MeV), the PS Booster (2 GeV), the Proton Synchrotron (26 GeV) and the Super Proton Synchrotron (450 GeV). The LHC then takes them to 6.8 TeV in about twenty minutes.

## Bunches

A beam is not a continuous stream. The protons travel in **bunches**: about 2,400 packets per beam, each holding more than 100 billion protons. Bunches follow each other 25 nanoseconds apart, so at each detector two bunches can cross up to **40 million times per second**.

When two bunches cross, almost all the protons miss each other. In Run 3 about 50 to 60 pairs collided in each crossing. These simultaneous collisions are called **pile-up**. A detector therefore sees dozens of collisions overlaid in one picture, usually with at most one of them interesting, and separating them is a large part of the software effort.

A proton is a bag of quarks and gluons, and what actually collides is one quark or gluon from each proton, carrying only a fraction of the proton's energy. So the energy of each individual collision is unknown and usually far below 13.6 TeV.

## The four experiments

- **ATLAS** and **CMS** are general-purpose detectors, built differently on purpose so that each can check the other's results. Both discovered the Higgs boson.
- **LHCb** studies particles containing b quarks, to learn why the universe holds matter and almost no antimatter.
- **ALICE** studies collisions of lead nuclei, which the LHC provides for about a month each year. They recreate the quark-gluon plasma that filled the universe just after the Big Bang.

## Cross-section: how likely a process is

The probability that a collision produces a given outcome is expressed as a **cross-section**, written σ (sigma). Think of it as the size of the target: the bigger the area, the more often it is hit. Its unit is the **barn** (b), 10⁻²⁸ m², roughly the cross-sectional area of a uranium nucleus. Interesting processes are far rarer, so you will mostly meet millibarn (mb, 10⁻³), nanobarn (nb, 10⁻⁹), picobarn (pb, 10⁻¹²) and femtobarn (fb, 10⁻¹⁵). One picobarn is 1,000 femtobarn.

At 13.6 TeV, two protons interact with a cross-section of about 80 mb. Producing a Z boson that decays to two muons has about 2 nb. Producing a Higgs boson has about 60 pb, over a billion times smaller than the total. That ratio is the whole challenge of the LHC: a billion ordinary collisions for each Higgs boson.

## Luminosity: how much data

**Luminosity** measures how many collisions the machine delivers. The **integrated luminosity**, written L, is the total over a period of data-taking. It is counted in inverse femtobarns, fb⁻¹, a unit chosen so that one formula does everything:

```
N = σ × L
```

The expected number of events N of a process is its cross-section times the integrated luminosity. With σ in fb and L in fb⁻¹, the units cancel and a plain number is left. For example, Higgs bosons produced in 100 fb⁻¹:

```
σ = 60 pb = 60,000 fb
N = 60,000 fb × 100 fb⁻¹ = 6,000,000
```

Six million sounds like a lot. But only about one Higgs boson in 8,000 decays into four electrons or muons, the cleanest signature, and the detector catches only part of those. In practice you also multiply by an **efficiency**, the fraction of events that your detector and selection keep.

Run 2 (2015 to 2018) gave ATLAS and CMS about 140 fb⁻¹ each. In 2024 alone the LHC delivered more than 120 fb⁻¹.

## What comes next

Run 3 ended in the summer of 2026. The LHC is now in a long shutdown while it is rebuilt as the **High-Luminosity LHC** (HL-LHC), planned to start around 2030 and to deliver roughly ten times more data than the LHC so far, with up to 200 collisions per bunch crossing. Dates like these move, so check them before you quote one. The consequence for you is certain, though: in the summer of 2027 there will be no beam. Students will work on analysing the recorded data, on detector upgrades, and above all on the software and computing that the HL-LHC needs. The computing side is where openlab projects sit.
--- practice
@predict
Run 3 collided two proton beams with 6.8 TeV each. What is the centre-of-mass energy in TeV?
= 13.6
=| 13.6 TeV
=| 13,6
! Two beams head-on: 6.8 + 6.8. This is the number written as √s.

@predict
The cross-section for producing a Z boson that decays to two muons is about 2 nb, which is 2,000,000 fb. How many such events are produced in 1 fb⁻¹ of data? Type the number.
= 2000000
=| 2,000,000
=| 2 million
=| 2e6
=| 2.0e6
! N = σ × L = 2,000,000 fb × 1 fb⁻¹. That is why Z → μμ is the standard candle of every experiment: there are millions of them.

@choice
Bunches follow each other 25 nanoseconds apart. How often can bunches cross at a detector?
- 25 times per second
- 40,000 times per second
* 40 million times per second
- 25 billion times per second
! One second divided by 25 billionths of a second is 40 million. Every one of those crossings holds dozens of collisions.

@choice
Which experiment is built to study the quark-gluon plasma in collisions of lead nuclei?
- ATLAS
- CMS
- LHCb
* ALICE
! ATLAS and CMS are the general-purpose detectors, and LHCb specialises in b quarks.

@run
Write `expected_events(sigma_pb, lumi_fb, efficiency)`. It returns the expected number of events for a cross-section given in picobarn, an integrated luminosity in fb⁻¹, and the fraction of events that are kept. Remember that 1 pb is 1,000 fb.
```starter
def expected_events(sigma_pb, lumi_fb, efficiency):
    pass
```
```test
print(round(expected_events(60, 100, 1.0)))
print(round(expected_events(0.5, 2, 0.1)))
print(round(expected_events(60, 140, 0.000125 * 0.3)))
```
= 6000000
= 100
= 315
```solution
def expected_events(sigma_pb, lumi_fb, efficiency):
    return sigma_pb * 1000 * lumi_fb * efficiency
```
! The last line of the check is a real estimate: 60 pb, the 140 fb⁻¹ of Run 2, one decay in 8,000 to four leptons, and a detector that keeps about 30% of them. A few hundred events is what the Higgs measurements in that channel had to work with.
--- recall
Q: What does the LHC collide, and at what energy in Run 3?
A: Two beams of protons with 6.8 TeV each, 13.6 TeV in total. For about a month a year it collides lead nuclei instead.
Q: How do you get the expected number of events of a process?
A: Cross-section times integrated luminosity, times the fraction of events your selection keeps.
Q: How often do bunches cross, and what is pile-up?
A: Every 25 ns, up to 40 million times a second. Pile-up is the dozens of proton-proton collisions that happen in the same crossing.
Q: What is a barn, and what is counted in inverse femtobarns?
A: A barn is a unit of area, 10⁻²⁸ m², used for cross-sections. Integrated luminosity, the amount of data collected, is counted in inverse femtobarns.

=== py4 | py | 2 | Classes and special methods | p4,p14,p28
## Why classes

A **class** lets you define your own type: a bundle of data together with the functions that work on that data. Instead of passing a name and a mass around separately, you make one `Particle` value that carries both and knows what it can do.

The class is the blueprint. Each value built from it is an **object**, also called an **instance**.

```
class Particle:
    def __init__(self, name, mass):
        self.name = name
        self.mass = mass

    def heavier_than(self, other):
        return self.mass > other.mass

mu = Particle("muon", 0.106)       # build an instance
e = Particle("electron", 0.000511)
mu.mass                             # 0.106   read an attribute
mu.heavier_than(e)                  # True    call a method
```

## __init__ and self

`__init__` is the **initialiser**. Python calls it automatically right after creating a new object, to fill it in. Writing `Particle("muon", 0.106)` makes an empty object and then runs `__init__` with `name="muon"` and `mass=0.106`.

`self` is the object being worked on. `self.name = name` means "store the value of the parameter `name` inside this object, under the attribute `name`". Without the `self.` prefix it would be a normal local variable that disappears when the function ends.

A **method** is a function defined inside a class. Its first parameter is always the object it was called on. You never pass it yourself; Python fills it in:

```
mu.heavier_than(e)             # what you write
Particle.heavier_than(mu, e)   # what Python does
```

That is why forgetting `self` in the definition gives the confusing error "takes 1 positional argument but 2 were given".

## Special methods

Methods with double underscores on both sides plug your class into Python's built-in syntax. Python calls them for you.

```
class Particle:
    ...
    def __repr__(self):
        return f"Particle({self.name!r}, {self.mass})"

    def __eq__(self, other):
        return self.name == other.name and self.mass == other.mass

    def __lt__(self, other):
        return self.mass < other.mass
```

- `__repr__` returns the text shown when you print the object or look at it in a list. Without it you get something like `<__main__.Particle object at 0x7f...>`.
- `__eq__` decides what `==` means. Without it, two objects are equal only if they are the very same object, even when all their attributes match.
- `__lt__` decides what `<` means, which is also what `sorted()` uses.

Inside the f-string, `{self.name!r}` inserts the value the way `repr()` would show it, with quotes around strings. So the output looks like code you could paste back in: `Particle('muon', 0.106)`.

## Attributes that belong to the class

A variable defined directly in the class body, outside any method, is shared by all instances:

```
class Particle:
    count = 0                 # one value shared by the class
    def __init__(self, name):
        self.name = name      # one value per object
        Particle.count += 1
```

Never put a mutable default such as `hits = []` in the class body expecting each object to get its own list. All objects would share the one list. Create it in `__init__` instead: `self.hits = []`.

## Operators are methods too

`a + b` is shorthand for a method call: Python runs `a.__add__(b)`. The other operators work the same way, so a class can decide what they mean for its objects:

```
class Vec2:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):          # v + w
        return Vec2(self.x + other.x, self.y + other.y)

    def __mul__(self, k):              # v * 3
        return Vec2(self.x * k, self.y * k)

    def __abs__(self):                 # abs(v)
        return (self.x ** 2 + self.y ** 2) ** 0.5
```

`__sub__` handles `-`, `__truediv__` handles `/`, and `__len__` is what `len(obj)` calls. An arithmetic method should return a **new** object and leave `self` and `other` unchanged, the way `3 + 4` doesn't change 3.

`**` is the power operator, so `x ** 0.5` is the square root of `x`.

## dataclasses: less typing

For classes that mainly hold data, the `dataclasses` module writes `__init__`, `__repr__` and `__eq__` for you from a list of fields with type hints:

```
from dataclasses import dataclass

@dataclass(frozen=True)
class Muon:
    pt: float
    eta: float
    charge: int

m = Muon(25.0, 0.4, -1)
print(m)            # Muon(pt=25.0, eta=0.4, charge=-1)
```

`frozen=True` makes instances immutable: assigning `m.pt = 3` raises an error. Frozen instances can also be used as dict keys.
--- practice
@predict
There is no `__eq__` in this class.
```
class P:
    def __init__(self, m):
        self.m = m

a = P(1)
b = P(1)
c = a
print(a == b, a == c)
```
= False True
! Without `__eq__`, `==` only checks whether both names refer to the same object. `a` and `b` are two separate objects with equal contents.

@run
Write a class `Vec2` with attributes `x` and `y`. Give it a method `add(other)` that returns a **new** `Vec2`, a method `length()`, and a `__repr__` that prints like `Vec2(3, 4)`.
```starter
class Vec2:
    def __init__(self, x, y):
        pass
```
```test
v = Vec2(1, 2).add(Vec2(2, 2))
print(v)
print(v.length())
print([Vec2(0, 1)])
```
= Vec2(3, 4)
= 5.0
= [Vec2(0, 1)]
```solution
class Vec2:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def add(self, other):
        return Vec2(self.x + other.x, self.y + other.y)

    def length(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __repr__(self):
        return f"Vec2({self.x}, {self.y})"
```
! `add` builds and returns a new object instead of changing `self`. `__repr__` is what `print` and lists use.

@run
Write a class `Track` with a `pt` attribute. Add `__eq__` (equal when the `pt` values are equal) and `__lt__` (smaller `pt` comes first), plus a `__repr__` like `Track(5)`. Then `sorted()` and `==` will work on your objects.
```starter
class Track:
    def __init__(self, pt):
        self.pt = pt
```
```test
print(Track(3) == Track(3))
print(sorted([Track(9), Track(2), Track(5)]))
print(max([Track(9), Track(2)]))
```
= True
= [Track(2), Track(5), Track(9)]
= Track(9)
```solution
class Track:
    def __init__(self, pt):
        self.pt = pt

    def __eq__(self, other):
        return self.pt == other.pt

    def __lt__(self, other):
        return self.pt < other.pt

    def __repr__(self):
        return f"Track({self.pt})"
```
! `sorted` and `max` only need `<`, which is `__lt__`.

@choice
What is wrong with this method definition inside a class: `def energy(): return self.e`?
- Nothing, it works
* It is missing the `self` parameter, so calling `obj.energy()` fails with "takes 0 positional arguments but 1 was given"
- Methods can't return values
- `self` must be written as `this`
! Python always passes the object as the first argument, so the method must accept it.

@write
Rewrite this as a frozen dataclass, from memory: a class `Jet` with fields `pt` (float), `eta` (float) and `ntracks` (int).
```solution
from dataclasses import dataclass

@dataclass(frozen=True)
class Jet:
    pt: float
    eta: float
    ntracks: int
```
! The decorator generates `__init__`, `__repr__` and `__eq__` from the three annotated fields.

@run
Write a class `Pt2` with attributes `px` and `py`. Make `a + b` return a new `Pt2` with the components added, make `abs(a)` return the length sqrt(px² + py²), and add a `__repr__` so that it prints as `Pt2(3.0, 4.0)`.
```starter
class Pt2:
    def __init__(self, px, py):
        self.px = px
        self.py = py
```
```test
a = Pt2(3.0, 0.0)
b = Pt2(0.0, 4.0)
print(a + b)
print(abs(a + b))
print(a, b)
```
= Pt2(3.0, 4.0)
= 5.0
= Pt2(3.0, 0.0) Pt2(0.0, 4.0)
```solution
class Pt2:
    def __init__(self, px, py):
        self.px = px
        self.py = py

    def __add__(self, other):
        return Pt2(self.px + other.px, self.py + other.py)

    def __abs__(self):
        return (self.px ** 2 + self.py ** 2) ** 0.5

    def __repr__(self):
        return f"Pt2({self.px}, {self.py})"
```
! `a + b` calls `a.__add__(b)`, which builds a new object. The last line of the check shows that `a` and `b` themselves are unchanged.
--- recall
Q: What is self in a method?
A: The object the method was called on, passed automatically as the first argument.
Q: Which method controls how an object is shown in the REPL or inside a printed list?
A: __repr__
Q: What does @dataclass(frozen=True) give you?
A: Generated __init__, __repr__ and __eq__, and immutable, hashable instances.
Q: Without __eq__, when are two objects of your class equal with ==?
A: Only when they are the same object. Equal attributes are not enough.
Q: Which method does Python call for a + b, and what should it return?
A: a.__add__(b). It should return a new object and leave both operands unchanged.

=== s2 | linux | 2 | grep, find and pipes | s2,s6
## Small tools, connected

Unix has a toolbox of small programs that each do one job. The power comes from connecting them. Every program has an **input** it reads from and an **output** it writes to. Normally the input is your keyboard and the output is the screen.

The **pipe**, written `|`, connects the output of one program to the input of the next:

```
ls | wc -l          # ls writes file names; wc -l counts the lines it receives
```

Read it left to right as "and then". Data flows through like water through joined pipes, and you can chain as many as you like.

## Redirection

Redirection connects a program to a **file** instead of the screen or keyboard:

```
ls > files.txt          # write output to a file (overwriting it)
ls >> files.txt         # append to a file
./sum < numbers.txt     # read input from a file
./prog 2> errors.txt    # error messages have their own channel, number 2
```

Keep the difference clear: `|` connects a program to another **program**, while `>` and `<` connect a program to a **file**.

## grep: find lines that match

`grep` prints the lines of its input that contain a pattern.

```
grep "TH1F" plot.cpp            # lines of plot.cpp containing TH1F
grep -n "TH1F" plot.cpp         # -n: show line numbers too
grep -i "error" run.log         # -i: ignore upper/lower case
grep -v "DEBUG" run.log         # -v: invert, print lines that DON'T match
grep -c "muon" events.txt       # -c: just count the matching lines
grep -r "TH1F" src/             # -r: search every file under src/, recursively
grep -rl "TH1F" src/            # -l: print only the names of files that contain it
grep -r --include='*.cpp' "TH1F" .     # only look inside files ending in .cpp
```

"Recursively" means: this directory, the directories inside it, the ones inside those, and so on.

`grep` reads from a pipe when you give it no file, which makes it a filter: `history | grep git` shows only the commands you typed that mention git.

Patterns can be **regular expressions**, a small language for describing text. Three pieces cover most needs: `^` anchors to the start of a line, `$` to the end, and `.` matches any single character. So `grep "^#include"` finds lines that begin with `#include`.

## find: search for files

`grep` searches inside files. `find` searches for the files themselves, by name, type, size or age. Its first argument is where to start.

```
find . -name '*.root'           # all files ending in .root, here and below
find . -type d -name build      # only directories (d) named build
find . -type f -size +100M      # only files (f) bigger than 100 megabytes
find . -name '*.log' -mtime -1  # .log files modified within the last day
```

Put the pattern in **single quotes**. Without them the shell would expand `*.root` itself, using only the files in the current directory, before `find` ever ran. With quotes, the star reaches `find` untouched, and `find` matches it at every level.

## Filters for pipelines

```
wc -l               # count lines
sort                # sort lines alphabetically (sort -n: numerically, -r: reversed)
uniq                # collapse identical lines that are next to each other
uniq -c             # the same, with a count in front of each
head -n 5           # keep the first 5 lines
tail -n 5           # keep the last 5
cut -d, -f1         # keep column 1, where columns are separated by commas
```

`uniq` only compares neighbouring lines, so it is almost always used right after `sort`.

## Building a pipeline step by step

Question: in `events.csv`, where the first column is a particle name, which names appear most often?

```
cut -d, -f1 events.csv | sort | uniq -c | sort -rn | head -n 3
```

Step by step: `cut` keeps the name column. `sort` puts identical names next to each other. `uniq -c` collapses each group into one line with its count in front. `sort -rn` orders those lines by the count, largest first. `head -n 3` keeps the top three.

Build pipelines the same way you read them: run the first command alone, look at the output, add the next stage, look again.
--- practice
@predict
`run.log` contains the five lines below. What does `grep -ic error run.log` print?
```
INFO start
ERROR bad channel
INFO event 1
error timeout
INFO done
```
= 2
! With `-i`, both `ERROR` and `error` match, and `-c` prints the number of matching lines instead of the lines themselves.

@choice
Why is the pattern quoted in `find . -name '*.cpp'`?
- Because find needs strings in quotes
* So the shell passes the star to find unchanged, instead of expanding it using the files in the current directory
- To make the search case-insensitive
- Quotes make it search faster
! Wildcard expansion is done by the shell before the command starts. Quotes switch it off.

@local
Create a small data file and run a pipeline on it. Run these and paste the output of the last command.
```
printf "muon,45\njet,120\nmuon,30\nelectron,12\njet,80\nmuon,61\n" > events.csv
cut -d, -f1 events.csv | sort | uniq -c | sort -rn
```
min: 3
= 3 muon
= 2 jet
= 1 electron
! `printf` prints text and turns each `\n` into a line break. If you remove the first `sort`, the counts are wrong, because `uniq` only merges lines that are next to each other.

@local
Go to any folder that has code in it, for example your `cern-prep` repository. Run a command that lists every `.cpp` or `.py` file below it using `find`, piped into `wc -l` to count them. Paste the command you ran and its output.
min: 2
= find
= wc -l
! For both extensions at once: `find . -name '*.cpp' -o -name '*.py' | wc -l`. The `-o` means "or".

@write
From memory, write one command that lists the names of all `.cpp` files under the current directory that contain the text `TH1F`, and a second that counts them.
min: 2
```solution
grep -rl --include='*.cpp' 'TH1F' .
grep -rl --include='*.cpp' 'TH1F' . | wc -l
```
! `-r` searches below the current directory, `-l` prints file names only, and the pipe into `wc -l` counts them.
--- recall
Q: Which grep flags search recursively and print only file names?
A: -r and -l, as in grep -rl.
Q: Why quote '*.cpp' in find . -name '*.cpp'?
A: So the shell doesn't expand the * itself before find sees it.
Q: What does sort | uniq -c do?
A: It groups identical lines and counts each one. uniq only merges neighbours, so it needs sorted input.
Q: What is the difference between | and >?
A: | sends a program's output to another program. > sends it to a file.

=== ph2 | phys | 2 | Inside a particle detector | 
## The job of a detector

When two protons collide at the LHC, the energy of the collision turns into new particles that fly out in all directions. Many of them decay within a tiny fraction of a millimetre. A detector such as **ATLAS** or **CMS** is a machine the size of a building, wrapped around the collision point, that records what comes out: which particles, in which directions, with how much energy. From those records, physicists work backwards to what happened in the collision.

No single device can measure every kind of particle. So a detector is built in layers, like an onion, and each layer is designed to catch something different. A particle is identified by the **pattern** it leaves: which layers it shows up in and which it doesn't.

## Layer 1: the tracker

Closest to the collision is the **tracker**, made of thin layers of silicon sensors. When a particle with electric charge passes through a sensor, it leaves a small signal called a **hit**. Connecting the hits gives the particle's path, its **track**. The tracker is built to disturb the particle as little as possible.

The whole tracker sits inside a strong magnetic field. A magnetic field bends the path of a moving charged particle. Two things can be read off the curve:

- **which way it bends** tells you whether the charge is positive or negative
- **how much it bends** tells you the momentum. A slow particle curls tightly, and a fast one is almost straight.

A particle with no charge leaves no hits. It is invisible to the tracker.

## Layer 2: the electromagnetic calorimeter

A **calorimeter** measures energy by stopping the particle. It is made of dense material in which an incoming particle hits atoms and produces a spray of secondary particles, called a **shower**. The total signal from the shower is proportional to the energy of the original particle.

The first calorimeter is the **electromagnetic calorimeter**, or **ECAL**. Electrons and photons interact electromagnetically and shower quickly, so the ECAL stops them completely. Heavier particles mostly pass through.

## Layer 3: the hadronic calorimeter

Next is the **hadronic calorimeter**, or **HCAL**: thicker and denser, built to stop hadrons such as protons, neutrons and pions. They interact through the strong force with the nuclei of the material and shower here.

## Layer 4: the muon chambers

Muons don't feel the strong force, and they are too heavy to shower in the ECAL the way electrons do. They pass through both calorimeters, leaving only a faint trace. So the outermost layer is a second set of tracking detectors, the **muon chambers**. Almost nothing else gets that far, so a track out there is almost certainly a muon.

## Reading the signatures

Putting the layers together:

```
particle          tracker    ECAL        HCAL        muon chambers
electron          track      stops here
photon            nothing    stops here
charged hadron    track      a little    stops here
neutral hadron    nothing    a little    stops here
muon              track      faint       faint       track
neutrino          nothing    nothing     nothing     nothing
```

An electron and a photon look the same in the ECAL. The difference is that the electron, being charged, has a track pointing at its ECAL deposit, and the photon doesn't.

## Jets

Quarks and gluons can't exist alone. When one is knocked out of a collision, it immediately turns into a narrow spray of hadrons all flying in roughly the same direction. This spray is called a **jet**. In the detector it shows up as a bundle of tracks plus energy in both calorimeters.

## Neutrinos and missing momentum

Neutrinos pass through the entire detector without a trace. They are detected by what is absent. Before the collision, the protons travel along the beam line, so there is no momentum sideways. Momentum is conserved, so the sideways momenta of everything that comes out must add up to zero. If the visible particles don't balance, something invisible carried the difference away. This imbalance is called **missing transverse momentum**, and it is the signature of neutrinos, or possibly of new particles such as dark matter.

## The trigger

The LHC brings proton bunches together 40 million times per second. Recording everything would mean writing tens of terabytes every second, which is impossible. A system called the **trigger** looks at each collision as it happens and decides, within microseconds and then milliseconds, whether it is interesting enough to keep. Only around a thousand per second are stored. An event the trigger rejects is gone forever, so the trigger has to be fast and right.

Trigger and reconstruction software is one of the largest computing efforts at CERN, and a common home for summer student and openlab projects.
--- practice
@choice
A particle leaves a track in the tracker, almost nothing in either calorimeter, and a track in the outermost layer. What is it?
- An electron
- A photon
* A muon
- A neutron
! Only muons get through both calorimeters and still leave a track in the muon chambers.

@choice
Two particles each leave a compact energy deposit in the ECAL and nothing beyond. One has a track pointing at the deposit and the other has none. What are they?
- Two electrons
* An electron (with the track) and a photon (without)
- A muon and a neutrino
- Two jets
! Both shower in the ECAL, but only the charged electron is seen by the tracker.

@choice
In the tracker's magnetic field, particle A's track is nearly straight and particle B's is tightly curled. What can you say?
* A has much higher momentum than B
- B has much higher momentum than A
- A is neutral
- B is heavier
! The faster the particle, the less the field bends it. A neutral particle would leave no track at all.

@choice
Why can't the LHC experiments simply record every collision?
- Most collisions are identical
- The detectors need time to cool down
* There are 40 million bunch crossings per second, far more data than can be stored, so a trigger keeps only the interesting ones
- It would be dangerous
! The trigger's decision is final: rejected events are never written anywhere.

@write
From memory: name the four detector layers from the inside out and say what each one measures. Then explain how a neutrino is detected.
min: 60
```solution
From the inside out: the tracker records the paths of charged particles in a magnetic field, and the curvature gives their momentum and charge. The electromagnetic calorimeter stops electrons and photons and measures their energy. The hadronic calorimeter stops hadrons such as protons, neutrons and pions and measures their energy. The muon chambers on the outside record muons, which pass through everything else.

A neutrino leaves no signal anywhere. It is inferred from missing transverse momentum: the sideways momenta of all visible particles should add up to zero, and an imbalance means something invisible carried momentum away.
```
! Check that you had the order right and that your neutrino explanation mentions momentum balance.
--- recall
Q: List the main detector layers from the inside out.
A: Tracker, electromagnetic calorimeter, hadronic calorimeter, muon chambers.
Q: How do you tell an electron from a photon in a detector?
A: Both deposit energy in the ECAL, but only the electron leaves a track in the tracker.
Q: How are neutrinos detected?
A: Indirectly, as missing transverse momentum, because the momentum across the beam should balance to zero.
Q: What does the curvature of a track in the magnetic field tell you?
A: The direction of bending gives the sign of the charge, and the amount of bending gives the momentum.

=== c4 | cpp | 3 | Strings, maps and streams | c5,c9,c21
## std::string

`std::string` (header `<string>`) holds text and manages its own memory, growing as needed. Unlike Python strings, C++ strings can be modified in place.

```
#include <string>

std::string s = "muon";
s.size();                  // 4
s[0];                      // 'm'   a single char
s += " pair";              // append: "muon pair"
s + "!";                   // a new string: "muon pair!"
s.substr(0, 4);            // "muon": start position, then length
s.find("pair");            // 5: the position where it starts
s == "muon pair";          // true: == compares the contents
```

`find` returns the special value `std::string::npos` when the text isn't there, so the usual test is `if (s.find("x") != std::string::npos)`.

Text in double quotes written directly in code is not a `std::string`. It is an older, simpler kind of string from C, which converts to `std::string` automatically when needed. One trap follows from that: `"a" + "b"` doesn't compile, because neither side is a `std::string`. Start with a real string: `std::string("a") + "b"`.

To convert: `std::to_string(42)` gives `"42"`, `std::stoi("42")` gives the int 42, and `std::stod("4.5")` gives the double 4.5.

## std::map: values by key

`std::map<K, V>` (header `<map>`) is C++'s dictionary: it stores values of type `V` under keys of type `K`.

```
#include <map>

std::map<std::string, int> counts;
counts["muon"] = 2;           // insert or overwrite
counts["jet"]++;              // see below
counts.size();                // 2
```

The `[]` operator behaves differently from Python. If the key is missing, `counts[key]` **creates it** with a zero value (0 for numbers, an empty string for strings) and gives you that. This makes counting a one-liner, `counts[word]++`, with no need for `get`.

The same behaviour is a trap when you only want to look. Reading `counts["tau"]` to check for a tau silently adds a tau with count 0. To test without inserting:

```
if (counts.count("tau") > 0) { }                 // count is 1 if the key exists, else 0
auto it = counts.find("tau");
if (it != counts.end()) { /* found: it->second is the value */ }
```

`find` returns an **iterator**, a small object that marks a position in a container. `counts.end()` is the position just past the last element, and getting it back means "not found".

A map keeps its keys **sorted**. Looping visits them in order. Each element is a pair, and C++17 lets you unpack it into two names:

```
for (const auto& [name, n] : counts) {
    std::cout << name << " " << n << '\n';       // jet 1, then muon 2
}
```

`std::unordered_map` has the same interface but uses a hash table like Python's dict: faster lookups on average, no ordering.

## Reading text with streams

`std::cin` is one kind of input stream. There are two more, and all three are used in exactly the same way.

A file, with `<fstream>`:

```
#include <fstream>

std::ifstream in("data.txt");      // ifstream = input file stream
if (!in) {                         // the stream is "false" if opening failed
    std::cerr << "cannot open file\n";
    return 1;
}
```

`std::cerr` is the error output stream, used for messages that are not results. The file closes by itself when `in` goes out of scope, so there is no `with` block and no `close()` call.

A string treated as input, with `<sstream>`:

```
#include <sstream>

std::istringstream words("three little quarks");
std::string w;
while (words >> w) { }             // w is "three", then "little", then "quarks"
```

## >> versus getline

`in >> w` skips whitespace and reads **one word** (or one number, depending on the variable's type). `std::getline(in, line)` reads **a whole line**, spaces included, and throws away the newline at its end. Both can be used as a loop condition, and both are false once the input runs out.

The standard way to process a file line by line and then word by word combines them:

```
std::string line;
while (std::getline(in, line)) {
    std::istringstream words(line);
    std::string w;
    while (words >> w) {
        ++counts[w];
    }
}
```

For output files use `std::ofstream out("result.txt");` and then `out << value << '\n';`, exactly like `std::cout`.

## Splitting at other characters

`std::getline` accepts an optional third argument: the character to stop at instead of the end of the line. Together with a string stream, that splits text at commas, which is how CSV files are read:

```
std::istringstream in("mu,25.3,-1");
std::string piece;
while (std::getline(in, piece, ',')) {
    std::cout << piece << '\n';        // mu, then 25.3, then -1
}
```

The pieces are strings. `std::stod(piece)` converts one to a `double` ("string to double") and `std::stoi(piece)` converts one to an `int`.
--- practice
@predict
```
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> m;
    m["b"] = 2;
    m["a"]++;
    if (m["c"] == 0) std::cout << "empty ";
    std::cout << m.size() << ' ';
    for (const auto& [k, v] : m) std::cout << k << v;
    std::cout << '\n';
}
```
= empty 3 a1b2c0
! `m["a"]++` creates a at 0 and makes it 1. Merely reading `m["c"]` in the `if` inserts c with 0. Keys come out sorted.

@predict
```
#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream in("12 muon 3.5\nsecond line");
    int n; std::string w; double d; std::string rest;
    in >> n >> w >> d;
    std::getline(in, rest);
    std::getline(in, rest);
    std::cout << n + 1 << w.size() << d * 2 << '|' << rest << '\n';
}
```
= 1347|second line
! `>>` converts each token to the variable's type. The first `getline` reads the empty remainder of line one, and the second reads the whole second line.

@choice
You want to know whether a `std::map<std::string, int> m` contains `"tau"` without changing the map. Which is right?
- `if (m["tau"])`
* `if (m.count("tau") > 0)`
- `if (m.get("tau"))`
- `if ("tau" in m)`
! `m["tau"]` would insert the key. `count` only looks.

@local
Write `wc.cpp`: read all words from standard input with `while (std::cin >> word)`, count each in a `std::map<std::string, int>`, then print each word and its count on its own line as `word count`. Run it with `echo "mu jet mu tau mu jet" | ./wc` and paste the output.
= jet 2
= mu 3
= tau 1
! The lines come out in alphabetical order because a map keeps its keys sorted.

@write
From memory, write a function `count_lines` that takes a file path as `const std::string&`, returns the number of lines in the file, and returns -1 if the file can't be opened.
min: 7
```solution
#include <fstream>
#include <string>

int count_lines(const std::string& path) {
    std::ifstream in(path);
    if (!in) return -1;
    std::string line;
    int n = 0;
    while (std::getline(in, line)) ++n;
    return n;
}
```
! `if (!in)` checks whether the file opened. The `getline` loop ends by itself at the end of the file.

@predict
```
#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream in("a,bb,,c");
    std::string piece;
    int pieces = 0, empty = 0;
    while (std::getline(in, piece, ',')) {
        ++pieces;
        if (piece.empty()) ++empty;
    }
    std::cout << pieces << ' ' << empty << '\n';
}
```
= 4 1
! The text between the two neighbouring commas is an empty piece, and it still counts as one. That is what you want for CSV, where an empty field is still a column.
--- recall
Q: What happens when you read m["x"] on a std::map that has no "x"?
A: It inserts "x" with a default value (0 for int) and returns that.
Q: What is the difference between std::map and std::unordered_map?
A: map is sorted by key (a tree, O(log n)). unordered_map is a hash table (O(1) on average, no order).
Q: What is the difference between in >> s and std::getline(in, s)?
A: >> reads one whitespace-separated token. getline reads the whole line.
Q: How do you check that a file opened successfully with std::ifstream in(path)?
A: if (!in) is true when opening failed.
Q: How do you split a string at commas in C++?
A: Put it in a std::istringstream and call std::getline(in, piece, ',') in a loop. std::stod or std::stoi then convert a piece to a number.

=== py10 | py | 3 | Testing Python with pytest | p15,p27
## Why test at all

Code that ran once on one input is a guess. A **test** is a small piece of code that calls your code and checks the result. Once it exists, it checks again every time you change something, in a fraction of a second. In physics this matters twice: a wrong number looks exactly as convincing as a right one, and a bug can sit inside a published result. Every serious CERN repository runs its tests automatically on each change, and from now on your repositories will too.

## assert

`assert` checks that something is true. If it is, nothing happens. If it isn't, Python stops with an `AssertionError`:

```
assert 2 + 2 == 4            # passes silently
assert 2 + 2 == 5            # AssertionError
```

A test is a function made of such checks.

## When things go wrong: exceptions

An **exception** is how Python reports that something can't continue. You have seen them as red error messages: `float("abc")` raises a `ValueError`, `d["missing"]` raises a `KeyError`, `xs[10]` on a short list raises an `IndexError`, and `1 / 0` raises a `ZeroDivisionError`. An exception stops the current function and travels up to its caller, then to that function's caller, until something catches it. If nothing does, the program ends with the message.

You catch one with `try` and `except`:

```
def to_float(text):
    try:
        return float(text)
    except ValueError:
        return None
```

Python runs the `try` block. If a `ValueError` happens inside it, Python jumps to the `except` block. Any other kind of exception is not caught and travels on. Always name the exception you expect. A bare `except:` catches everything, including the typo you made in the `try` block, and hides it.

Your own functions report problems the same way, with `raise`:

```
def mean(xs):
    if not xs:
        raise ValueError("mean of an empty list")
    return sum(xs) / len(xs)
```

`not xs` is true for an empty list. Raising is better than returning 0 or `None`, because the caller can't overlook it.

## pytest

**pytest** is the standard test runner for Python. Install it with `pip install pytest`. It looks for files named `test_*.py` and runs every function in them whose name starts with `test_`. Put the tests in a folder next to your code:

```
cern-prep/
    stats.py
    tests/
        test_stats.py
```

```
# tests/test_stats.py
from stats import mean

def test_mean_of_integers():
    assert mean([1, 2, 3, 4]) == 2.5

def test_mean_of_one_value():
    assert mean([7]) == 7
```

Run it from the top folder of the repository:

```
python -m pytest -q
```

`python -m pytest` runs pytest as a module, which also puts the current folder on Python's search path, so that `from stats import mean` finds `stats.py`. `-q` means quiet. Each dot is a passed test:

```
..                                                    [100%]
2 passed in 0.01s
```

When a test fails, pytest shows the line and the values on both sides, which is usually all you need to find the bug:

```
>       assert mean([1, 2, 3]) == 3
E       assert 2.0 == 3
E        +  where 2.0 = mean([1, 2, 3])
```

## Three tools you will use constantly

**Comparing floats.** Computers store decimals in binary, and most decimals don't fit exactly: `0.1 + 0.2` is `0.30000000000000004`. So `==` between floats fails for values that are equal for every practical purpose. `pytest.approx` compares with a small tolerance:

```
import pytest

def test_mean_of_floats():
    assert mean([0.1, 0.2]) == pytest.approx(0.15)
```

**Checking that an error is raised.** The test passes only if the block raises that exception:

```
def test_empty_list_raises():
    with pytest.raises(ValueError):
        mean([])
```

**One test, many inputs.** `parametrize` runs the same test once per row:

```
@pytest.mark.parametrize("xs, expected", [([2, 4], 3), ([-1, 1], 0), ([5], 5)])
def test_mean_table(xs, expected):
    assert mean(xs) == expected
```

The line starting with `@` is a decorator, a way of wrapping a function that a later lesson explains. For now, read it as "run this test for each of these pairs".

## What to test

A good set of tests for one function covers a normal case with a result **you worked out by hand**, the edges (empty input, one element, zero, negative numbers, the exact boundary of a condition), and the error case. Give each test a name that says what it checks, because the name is what you see when it fails. A test that can't fail is worthless, so now and then break the code on purpose and check that a test notices.
--- practice
@predict
```
def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

print(safe_div(6, 3), safe_div(1, 0))
```
= 2.0 None
! `6 / 3` is the float 2.0. `1 / 0` raises `ZeroDivisionError`, which the `except` block catches, so the function returns `None`.

@run
Write `mean(xs)`. It returns the average of a list of numbers and raises `ValueError` when the list is empty.
```starter
def mean(xs):
    pass
```
```test
print(mean([1, 2, 3, 4]))
try:
    mean([])
    print("no error")
except ValueError:
    print("ValueError")
```
= 2.5
= ValueError
```solution
def mean(xs):
    if not xs:
        raise ValueError("mean of an empty list")
    return sum(xs) / len(xs)
```
! Without the check, an empty list would end in a `ZeroDivisionError`, which tells the caller much less about what went wrong.

@run
`count_above(xs, cut)` should return how many values are strictly greater than `cut`. Write three tests for it with plain `assert`. The check runs your tests twice: against a correct `count_above`, where all three must pass, and against a buggy one that uses `>=`, where at least one of your tests must fail.
```starter
def test_basic():
    pass

def test_empty():
    pass

def test_boundary():
    pass
```
```test
def count_above(xs, cut):
    return len([x for x in xs if x > cut])

test_basic(); test_empty(); test_boundary()
print("correct version: all pass")

def count_above(xs, cut):
    return len([x for x in xs if x >= cut])

caught = 0
for t in (test_basic, test_empty, test_boundary):
    try:
        t()
    except AssertionError:
        caught += 1
print("bug caught:", caught > 0)
```
= correct version: all pass
= bug caught: True
```solution
def test_basic():
    assert count_above([1, 5, 10], 4) == 2

def test_empty():
    assert count_above([], 0) == 0

def test_boundary():
    assert count_above([4, 4, 5], 4) == 1
```
! Only a test with a value exactly equal to the cut can tell `>` from `>=`. Boundaries are where bugs live, so always test them.

@local
On your machine, in your `cern-prep` repository: create `stats.py` with the `mean` function from above and `tests/test_stats.py` with at least four tests. One must use `pytest.approx` and one `pytest.raises`. Run `python -m pytest -q` from the top folder of the repository and paste the output.
min: 2
= passed
! If you see `ModuleNotFoundError: No module named 'stats'`, you ran plain `pytest` or you were inside the `tests` folder. Run `python -m pytest -q` from the top folder.

@choice
Why write `assert total == pytest.approx(0.3)` instead of `assert total == 0.3` when `total` is `0.1 + 0.2`?
- `==` is not allowed between floats
* Floats carry tiny rounding errors, so `0.1 + 0.2` is `0.30000000000000004` and an exact comparison fails
- `approx` makes the test run faster
- Because 0.3 is not a number Python can print
! Binary floating point can't store most decimals exactly. Compare floats with a tolerance, in tests and everywhere else.
--- recall
Q: How does pytest find your tests?
A: It collects files named test_*.py and runs every function in them whose name starts with test_.
Q: How do you test that a function raises ValueError?
A: with pytest.raises(ValueError): and call the function inside the block.
Q: Why compare floats with pytest.approx?
A: Floats carry tiny rounding errors (0.1 + 0.2 is not exactly 0.3), so == can fail for values that are equal in practice.
Q: What do raise and except do?
A: raise signals an error and leaves the function at once. except catches a named kind of error from the try block so the program can deal with it.

=== ph4 | phys | 3 | Kinematics: pT, η, φ and ΔR | p16,p17
## The coordinate system

Every analysis at the LHC is written in four variables: pT, η, φ and ΔR. They are in your dimuon file as the columns `pt1`, `eta1` and `phi1`. This lesson explains what they mean and why physicists chose them over plain x, y and z.

ATLAS and CMS put the origin at the collision point. The **z axis** runs along the beam. The **x axis** points to the centre of the LHC ring and the **y axis** points up. The x-y plane, at right angles to the beam, is called the **transverse plane**.

Momentum is a vector with components (px, py, pz). All energies, momenta and masses are given in GeV. Strictly, momentum is in GeV/c and mass in GeV/c², but the field sets c = 1 and drops it.

## Transverse momentum

The **transverse momentum** is the part of the momentum that points away from the beam:

```
pT = sqrt(px² + py²)
```

It is the most used quantity in the field, and for a good reason. What collides is one quark or gluon from each proton, each carrying an unknown share of its proton's momentum. So along the beam, the total momentum of a collision is unknown. Across the beam it is known: the protons were moving along z, so the transverse momentum before the collision was essentially zero, and everything produced must add up to zero in the transverse plane.

This gives a way to see invisible particles. Add up the transverse momentum vectors of everything the detector saw. If the sum is far from zero, something carried the rest away unseen: a neutrino, or something new. The imbalance is called **missing transverse momentum**, or MET.

A high pT is also the mark of an interesting collision. Ordinary collisions spray particles mostly along the beam, with pT below a GeV or so. Decays of heavy particles such as the Z throw their products out sideways with tens of GeV.

## The angle φ

**φ** (phi) is the direction in the transverse plane, measured from the x axis:

```
phi = atan2(py, px)
```

`atan2` is the two-argument arctangent, found in every maths library. Unlike `atan(py / px)`, it looks at the signs of both arguments and returns the correct angle anywhere on the full circle, from −π to π, and it doesn't fail when px is zero. Angles are in radians: π radians is 180 degrees.

## Pseudorapidity η

The angle between a particle and the beam axis is called θ (theta). Instead of θ, the field uses **pseudorapidity**, η (eta):

```
eta = -ln(tan(theta / 2))
```

`ln` is the natural logarithm. Some values to remember:

- η = 0 is at right angles to the beam (θ = 90°).
- |η| = 1 is about 40° from the beam.
- |η| = 2.5 is about 9° from the beam. This is where the tracking detectors of ATLAS and CMS end. In your dimuon file no muon has |η| above 2.4, the edge of the CMS muon system.
- Along the beam, η goes to infinity. The sign says which way: positive η is the +z side.

Why such an odd definition? Because the collision as a whole moves along z with an unknown speed, and a difference in η between two particles is unaffected by that motion, while a difference in θ is not. Particle production is also roughly even per unit of η, so detectors are divided into cells of equal size in η.

In code you rarely need θ. This formula gives η directly from the momentum, where `asinh` is the inverse hyperbolic sine:

```
eta = asinh(pz / pT)
```

Going the other way, from (pT, η, φ) back to components:

```
px = pT * cos(phi)
py = pT * sin(phi)
pz = pT * sinh(eta)
```

The total momentum is p = pT · cosh(η), and the energy follows from E² = p² + m². `sinh` and `cosh` are the hyperbolic sine and cosine. Python has all of these in the `math` module, and NumPy has them for whole arrays.

## ΔR: how far apart two particles are

The distance between two directions is measured in the plane of η and φ:

```
ΔR = sqrt(Δη² + Δφ²)
```

There is one trap. φ runs from −π to π and then wraps around, so two particles at φ = 3.0 and φ = −3.0 are close together, about 0.28 radians apart, and not 6.0. Before using Δφ, bring it into the range −π to π:

```
dphi = (phi1 - phi2 + math.pi) % (2 * math.pi) - math.pi
```

`%` is the remainder, and in Python its result is never negative when the divisor is positive, which is what makes this one-liner work.

You will meet ΔR everywhere. A **jet**, the spray of particles from a quark or gluon, is defined as everything within a cone of ΔR = 0.4. A lepton is called **isolated** when little else lies within a cone around it, which is how a muon from a Z decay is told from a muon inside a jet. And a reconstructed particle is matched to a simulated one when their ΔR is small, typically below 0.1.
--- practice
@predict
```
import math
px, py = 3.0, -4.0
print(math.sqrt(px**2 + py**2), round(math.atan2(py, px), 2))
```
= 5.0 -0.93
! pT is the length of (3, −4), which is 5. The vector points right and down, so φ is negative: about −0.93 radians, or −53°.

@choice
A particle leaves the collision exactly along the beam axis. What are its pT and its pseudorapidity?
- pT is at its maximum and η = 0
* pT = 0, and |η| goes to infinity
- pT = 0 and η = 0
- Both are undefined
! Along the beam there is no sideways component, so pT is zero. η = 0 is the opposite case: at right angles to the beam.

@run
Write `to_cartesian(pt, eta, phi)` that returns the tuple `(px, py, pz)`.
```starter
import math

def to_cartesian(pt, eta, phi):
    pass
```
```test
px, py, pz = to_cartesian(10.0, 0.0, 0.0)
print(round(px, 3), round(py, 3), round(pz, 3))
px, py, pz = to_cartesian(2.0, 1.0, math.pi / 2)
print(round(px, 3), round(py, 3), round(pz, 3))
```
= 10.0 0.0 0.0
= 0.0 2.0 2.35
```solution
import math

def to_cartesian(pt, eta, phi):
    return pt * math.cos(phi), pt * math.sin(phi), pt * math.sinh(eta)
```
! At φ = π/2 the particle points along y, so px is zero. With η = 1, pz is pT · sinh(1), about 1.18 times pT.

@predict
Two muons have φ = 3.0 and φ = −3.0. What is the size of Δφ between them after wrapping it into the range −π to π? Give two decimals.
= 0.28
=| 0.283
=| 0.2832
=| -0.28
! The raw difference is 6.0, which is more than π. Subtracting 2π (6.2832) leaves −0.2832, so the two muons are 0.28 radians apart.

@choice
Why do analyses at a proton collider use the transverse momentum instead of the full momentum?
- The detectors can't measure pz at all
- The transverse momentum is always the larger part
* The colliding quarks and gluons carry unknown momentum along the beam, but almost none across it, so only the transverse sum is known to be zero before the collision
- Because the beam pipe is round
! Knowing that the transverse momenta must balance is what makes missing transverse momentum, and therefore neutrinos, measurable.
--- recall
Q: How do you compute pT and φ from px and py?
A: pT = sqrt(px² + py²) and φ = atan2(py, px).
Q: What is pseudorapidity, and what are its values at 90° to the beam and along it?
A: η = −ln tan(θ/2), or asinh(pz / pT). It is 0 at right angles to the beam and goes to infinity along it.
Q: What is ΔR, and what must be done to Δφ first?
A: ΔR = sqrt(Δη² + Δφ²), the angular distance between two particles. Δφ must first be wrapped into the range −π to π.
Q: Why is the transverse plane special at a proton collider?
A: The colliding quarks and gluons carry unknown momentum along the beam but almost none across it, so the transverse momenta of everything produced must add up to zero.

=== c5 | cpp | 3 | Lambdas and <algorithm> | c6,c14,c22
## Iterators: positions in a container

The standard library's algorithms don't take a container. They take a **range**: a start position and an end position. Positions are represented by **iterators**. Every container can give you two:

- `v.begin()` marks the first element
- `v.end()` marks the position just **after** the last element

So `v.begin(), v.end()` means "the whole container". The end marker is not an element. It is also what search functions return to say "not found".

An iterator behaves like a pointer: `*it` is the element it marks, and `++it` moves it to the next.

## Ready-made algorithms

The headers `<algorithm>` and `<numeric>` contain dozens of tested loops, so you don't write them again:

```
#include <algorithm>
#include <numeric>

std::vector<int> v = {5, 2, 8, 1};

std::sort(v.begin(), v.end());                        // v is now 1 2 5 8
auto it = std::find(v.begin(), v.end(), 8);           // iterator to the 8, or v.end()
int n = std::count(v.begin(), v.end(), 2);            // how many 2s
int total = std::accumulate(v.begin(), v.end(), 0);   // sum, starting from 0
auto mx = std::max_element(v.begin(), v.end());       // iterator to the largest: use *mx
std::reverse(v.begin(), v.end());
```

To turn an iterator into an index, subtract the start: `it - v.begin()`.

## Customising with a function

Many algorithms accept a function to customise what they do. `std::sort` takes a function that answers "should `a` come before `b`?". `std::count_if` and `std::find_if` take a function that answers "does this element qualify?". The clean way to supply such a small function right where it is needed is a lambda.

## Lambdas

A **lambda** is a function without a name, written in place:

```
auto is_big = [](double e) { return e > 20.0; };
is_big(45.0);    // true
```

It has three parts:

- `[]` is the **capture list**, explained below
- `(double e)` is the parameter list, as for any function
- `{ return e > 20.0; }` is the body

The compiler works out the return type from the `return` statement. A lambda's own type has no name you can write, so it is stored with `auto`.

## Captures

A lambda's body can't see the local variables around it unless you list them in the capture list.

```
double cut = 20.0;
double total = 0.0;

auto above = [cut](double e) { return e > cut; };     // gets its own COPY of cut
auto add   = [&total](double e) { total += e; };      // refers to the real total
```

`[cut]` copies the value at the moment the lambda is created. `[&total]` captures by reference, so the lambda can modify the original. `[=]` copies everything the body uses and `[&]` references everything, but naming the variables is clearer.

## Putting them together

```
struct Event { int id; double energy; };
std::vector<Event> ev = {{1, 30.0}, {2, 95.5}, {3, 12.1}};

// highest energy first
std::sort(ev.begin(), ev.end(),
          [](const Event& a, const Event& b) { return a.energy > b.energy; });

// how many above the cut
auto n = std::count_if(ev.begin(), ev.end(),
                       [cut](const Event& e) { return e.energy > cut; });

// first event above 90, if any
auto it = std::find_if(ev.begin(), ev.end(),
                       [](const Event& e) { return e.energy > 90.0; });
if (it != ev.end()) std::cout << it->id << '\n';
```

The comparison function for `sort` must return true only when `a` should come **strictly** before `b`. Use `<` or `>`. With `<=` or `>=`, two equal elements would each claim to come before the other, and `sort` can crash.

`std::transform` applies a function to every element and writes the results to another range. The output must already have room:

```
std::vector<double> sq(v.size());
std::transform(v.begin(), v.end(), sq.begin(), [](double x) { return x * x; });
```

## The accumulate trap

`std::accumulate` adds everything onto its third argument, and the **type of that argument decides the type of the sum**. With `0` the sum is an `int`, and every double is chopped to a whole number as it is added. For doubles, always write `0.0`.

## Removing elements: remove_if and erase

Deleting every element that matches a condition takes two steps, together known as the **erase-remove idiom**.

`std::remove_if` does not shrink the vector. It moves the elements you want to keep to the front, in their original order, and returns an iterator to the first position after them. Whatever lies beyond that position is leftover. `v.erase(first, last)` then cuts that tail off:

```
std::vector<double> v{3.0, -1.0, 4.0, -5.0};

auto tail = std::remove_if(v.begin(), v.end(),
                           [](double x) { return x < 0; });
v.erase(tail, v.end());               // v is now 3 4
```

The two steps are usually written as one statement: `v.erase(std::remove_if(v.begin(), v.end(), pred), v.end());`. From C++20 on, `std::erase_if(v, pred)` does both.
--- practice
@predict
```
#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<double> v = {1.5, 2.5, 3.5};
    std::cout << std::accumulate(v.begin(), v.end(), 0) << ' '
              << std::accumulate(v.begin(), v.end(), 0.0) << '\n';
}
```
= 6 7.5
! Starting from the int `0`, each partial sum is cut to a whole number: 1, then 3, then 6. Starting from `0.0` gives the real sum.

@predict
```
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {4, 9, 1, 7};
    int cut = 5;
    auto n = std::count_if(v.begin(), v.end(), [cut](int x) { return x > cut; });
    std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
    auto it = std::find(v.begin(), v.end(), 4);
    std::cout << n << ' ' << v[0] << ' ' << (it - v.begin()) << '\n';
}
```
= 2 9 2
! Two elements exceed 5. Sorted from high to low the vector is 9 7 4 1, so 4 sits at index 2.

@choice
What is the difference between `[x]` and `[&x]` in a lambda's capture list?
* `[x]` gives the lambda its own copy of `x`. `[&x]` lets it use, and change, the original `x`
- `[x]` captures by reference and `[&x]` by value
- `[&x]` takes the address of `x` as a pointer
- There is no difference
! In a capture list, `&` means "by reference", as it does in a parameter list.

@local
Write `sortev.cpp`: define `struct Event { int id; double energy; };`, make a vector with `{1, 30.0}, {2, 95.5}, {3, 12.1}, {4, 60.0}`, sort it by energy from highest to lowest with `std::sort` and a lambda, then print the ids in order separated by spaces. Paste the output.
= 2 4 1 3
! If the order is reversed, the lambda uses `<` where it should use `>`.

@write
From memory, write `sum_squares`: it takes `const std::vector<double>&` and returns the sum of the squares, using `std::transform` into a second vector and then `std::accumulate`.
min: 7
```solution
#include <algorithm>
#include <numeric>
#include <vector>

double sum_squares(const std::vector<double>& v) {
    std::vector<double> sq(v.size());
    std::transform(v.begin(), v.end(), sq.begin(),
                   [](double x) { return x * x; });
    return std::accumulate(sq.begin(), sq.end(), 0.0);
}
```
! `sq` is created with the right size before `transform` writes into it, and the sum starts from `0.0`.

@predict
```
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{4, 7, 10, 3, 8};
    v.erase(std::remove_if(v.begin(), v.end(), [](int x) { return x % 2 == 1; }), v.end());
    std::cout << v.size() << ' ' << v[0] << ' ' << v[2] << '\n';
}
```
= 3 4 8
! The odd values 7 and 3 are removed. The even ones keep their order: 4, 10, 8.
--- recall
Q: What is the difference between [cut] and [&cut] in a lambda?
A: [cut] captures a copy. [&cut] captures a reference to the original variable.
Q: Why is <= wrong in a std::sort comparator?
A: The comparator must be a strict ordering. <= breaks that, and sort can misbehave or crash.
Q: Why write std::accumulate(v.begin(), v.end(), 0.0) rather than 0?
A: The start value sets the type. With 0 the sum is an int and the doubles get truncated.
Q: What does v.end() refer to?
A: The position just past the last element. It is not an element, and search functions return it to mean "not found".
Q: What does std::remove_if return, and why is erase needed afterwards?
A: An iterator to the end of the elements that are kept. remove_if only moves elements around; erase is what shortens the vector.

=== py5 | py | 3 | Comprehensions and generators | p6,p8,p29
## From a loop to a comprehension

Building a list with a loop takes three lines: make an empty list, loop, append.

```
squares = []
for x in range(5):
    squares.append(x * x)
```

A **list comprehension** says the same thing in one expression. Read it left to right as "the value I want, for each item, from this source":

```
squares = [x * x for x in range(5)]            # [0, 1, 4, 9, 16]
```

`range(5)` produces the numbers 0, 1, 2, 3, 4. It stops **before** 5, just like a slice.

Add `if` at the end to keep only some items:

```
evens = [x for x in range(10) if x % 2 == 0]   # [0, 2, 4, 6, 8]
```

`%` is the remainder operator: `7 % 2` is 1, `8 % 2` is 0. So `x % 2 == 0` is true for even numbers.

The pieces map onto the loop like this: the first part (`x * x`) is what you would `append`, the `for` part is the loop line, and the `if` part is a condition inside the loop.

The same syntax builds dicts and sets:

```
lengths = {w: len(w) for w in ["mu", "tau"]}   # {'mu': 2, 'tau': 3}
unique = {w.lower() for w in words}            # a set: no duplicates
```

Use a comprehension when the result is a new collection. Keep a normal loop when the body is long or does something other than building a list.

## Generator expressions: values on demand

Swap the square brackets for parentheses and you get a **generator expression**. It doesn't build a list. It produces one value each time something asks for the next one.

```
total = sum(x * x for x in range(1000000))     # no million-element list in memory
```

When a generator expression is the only argument of a function, you don't need a second pair of parentheses.

## Generator functions and yield

A function with `yield` in it is a **generator function**. Calling it doesn't run the body. It returns a generator object, and the body runs piece by piece as values are requested.

```
def countdown(n):
    while n > 0:
        yield n        # hand out n and pause here
        n -= 1         # continue from here on the next request

for x in countdown(3):
    print(x)           # 3, then 2, then 1
```

Each `yield` hands one value to the caller and **pauses** the function with all its local variables intact. The next request resumes on the line after the `yield`. When the function ends, the generator is finished.

`n -= 1` is short for `n = n - 1`.

A classic example needs two variables updated together:

```
def fib(limit):
    a, b = 0, 1
    while a <= limit:
        yield a
        a, b = b, a + b
```

`a, b = b, a + b` works because Python computes the whole right-hand side first, using the old values, and only then assigns.

## One pass only

A generator can be consumed once. After the last value it is empty for good:

```
g = (x for x in range(3))
list(g)     # [0, 1, 2]
list(g)     # []   nothing left
```

If you need the values twice, make a list.

## Helpers that work with any loop

```
for i, w in enumerate(["a", "b"]):   # (0, 'a'), (1, 'b'): index and item together
for n, m in zip(names, masses):      # pairs from two sequences, side by side
any(x > 5 for x in xs)               # True if at least one is
all(x > 5 for x in xs)               # True if every one is
```
--- practice
@predict
```
print([x * 2 for x in range(6) if x % 3 == 0])
```
= [0, 6]
! `range(6)` is 0 to 5. Only 0 and 3 leave remainder 0 when divided by 3, and each is doubled.

@predict
```
g = (x for x in range(4))
print(sum(g), sum(g))
```
= 6 0
! The first `sum` uses up the generator. The second finds nothing left and returns 0.

@run
Write `charged(particles)` as a single list comprehension. `particles` is a list of `(name, charge)` tuples. Return the names of those whose charge is not 0, in upper case.
```starter
def charged(particles):
    return []
```
```test
print(charged([("mu", -1), ("photon", 0), ("pi", 1), ("z", 0)]))
```
= ['MU', 'PI']
```solution
def charged(particles):
    return [name.upper() for name, q in particles if q != 0]
```
! `for name, q in particles` unpacks each tuple, the `if` filters, and the first part is the value to keep.

@run
Write a generator function `evens(limit)` that yields 0, 2, 4, … up to and including `limit`. Use `yield`.
```starter
def evens(limit):
    pass
```
```test
print(list(evens(7)))
g = evens(100)
print(next(g), next(g), next(g))
```
= [0, 2, 4, 6]
= 0 2 4
```solution
def evens(limit):
    n = 0
    while n <= limit:
        yield n
        n += 2
```
! `next(g)` asks for one value. The function runs to the next `yield` and pauses there.

@run
Write `mean_sq(xs)` that returns the average of the squares of `xs`, using `sum` with a generator expression and no list.
```starter
def mean_sq(xs):
    pass
```
```test
print(mean_sq([1, 2, 3]))
print(mean_sq([3]))
```
= 4.666666666666667
= 9.0
```solution
def mean_sq(xs):
    return sum(x * x for x in xs) / len(xs)
```
! The generator expression feeds `sum` one square at a time.
--- recall
Q: What is the difference between [x*x for x in d] and (x*x for x in d)?
A: The first builds a whole list in memory. The second is a lazy generator that hands out values one at a time.
Q: What does yield do?
A: It gives a value to the caller and pauses the function until the next value is asked for.
Q: What happens if you loop over the same generator twice?
A: The second loop gets nothing, because a generator is used up after one pass.
Q: Read aloud what [x for x in xs if x % 2 == 0] builds.
A: A new list with every x from xs whose remainder after dividing by 2 is 0, so the even numbers.

=== c11 | cpp | 3 | Building with CMake | c15
## Why typing g++ stops working

So far every program was one file and one command. Real C++ projects have hundreds of files, several programs and libraries, tests, and users on different machines with different compilers. Nobody builds that by hand. A **build system** knows which files make up which program, compiles them in the right order, and recompiles only what changed. In high-energy physics the build system is almost always **CMake**: ROOT, Geant4 and the experiments' software are all built with it.

## From one file to several

Building a C++ program has two stages. The compiler turns each `.cpp` file, on its own, into an **object file** of machine code. The **linker** then joins the object files into one executable. Because each `.cpp` is compiled alone, it needs to be told about functions that live in other files. That is the job of a **header file**.

A header (`.h`) holds **declarations**: the name and types of a function, without its body. A source file (`.cpp`) holds the **definition**, the body.

```
// include/stats.h
#pragma once
#include <vector>

double mean(const std::vector<double>& v);
```

```
// src/stats.cpp
#include "stats.h"

double mean(const std::vector<double>& v) {
    double sum = 0.0;
    for (double x : v) sum += x;
    return sum / v.size();
}
```

```
// src/main.cpp
#include "stats.h"
#include <iostream>

int main() {
    std::vector<double> v{1.0, 2.0, 3.0, 4.0};
    std::cout << "mean = " << mean(v) << '\n';
}
```

`#include "stats.h"` pastes the header's text into the file. Quotes are for your own headers and angle brackets for the standard library's. `#pragma once` makes sure a header is pasted only once per file, even if several other headers include it. A group of object files packed together for other programs to use is a **library**.

## CMakeLists.txt, line by line

You describe the project in a file called `CMakeLists.txt` in its top folder:

```
cmake_minimum_required(VERSION 3.16)
project(stats LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(stats src/stats.cpp)
target_include_directories(stats PUBLIC include)
target_compile_options(stats PRIVATE -Wall -Wextra)

add_executable(stats_app src/main.cpp)
target_link_libraries(stats_app PRIVATE stats)
```

- `cmake_minimum_required` states the oldest CMake version the file works with. It must be the first line.
- `project` names the project. `CXX` is CMake's name for C++.
- The two `set` lines ask for C++17 and refuse to fall back to an older standard.
- `add_library(stats src/stats.cpp)` defines a library called `stats`, built from that source file.
- `target_include_directories(stats PUBLIC include)` says the headers are in the folder `include`.
- `add_executable(stats_app src/main.cpp)` defines a program.
- `target_link_libraries(stats_app PRIVATE stats)` says the program uses the library.

Things you can build, like `stats` and `stats_app`, are called **targets**, and modern CMake is all about attaching properties to targets. The keyword says who a property applies to. `PRIVATE` means "only when building this target". `PUBLIC` means "for this target and for everything that links to it". The include folder is `PUBLIC` because `main.cpp` needs to find `stats.h` too, and it gets that folder automatically by linking to `stats`. The warning flags are `PRIVATE` because they concern only the library's own code.

## Configure, build, run

CMake does not compile anything itself. It **generates** the files for a lower-level build tool (Make or Ninja), which does. So there are two commands:

```
cmake -S . -B build        # configure: read CMakeLists.txt here (.), write build files into build/
cmake --build build        # build: compile and link whatever is out of date
./build/stats_app
```

`-S` is the source folder and `-B` the build folder. Everything generated lands in `build/`, away from your code. This is called an **out-of-source build**. You can delete `build/` at any time and regenerate it, and it must never be committed, so add `build/` to `.gitignore`.

Change `main.cpp` and run `cmake --build build` again: only `main.cpp` is recompiled and the program re-linked. In a big project that turns minutes into seconds.

## Build types

```
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
```

`-D` sets a CMake variable. `Debug` builds without optimisation and with information for the debugger. `Release` builds optimised code. For timing anything you need `Release`, and for hunting bugs `Debug`.
--- practice
@choice
What does `cmake -S . -B build` do?
- It compiles and links the project
* It reads `CMakeLists.txt` in the current folder and writes the files for the build tool into `build/`. Nothing is compiled yet
- It deletes the `build` folder
- It runs the tests
! Configuring and building are separate steps. `cmake --build build` is the one that compiles.

@choice
`target_include_directories(stats PUBLIC include)`: what does `PUBLIC` mean here?
- The folder is uploaded to GitHub
- Only the library itself can use the folder
* The folder is used when compiling `stats` and also when compiling every target that links to `stats`
- The headers can be read by other users on the computer
! That is why `main.cpp` finds `stats.h` without `stats_app` mentioning the `include` folder anywhere.

@local
Build the project from this lesson. Create a folder `stats` with `include/stats.h`, `src/stats.cpp` and `src/main.cpp` exactly as shown above, and write the `CMakeLists.txt` yourself, looking at the lesson as little as you can. Configure, build and run it, and paste the output of the last two commands:
```
cmake -S . -B build
cmake --build build
./build/stats_app
```
min: 3
= stats_app
= mean = 2.5
! If CMake is missing: `sudo apt install cmake` on Ubuntu or WSL, `brew install cmake` on macOS. The build output names each file as it is compiled, then "Linking CXX executable stats_app".

@predict
After a successful build you change one line in `src/main.cpp` and run `cmake --build build` again. How many of the two `.cpp` files are compiled this time?
= 1
=| one
! `stats.cpp` hasn't changed, so its object file is still valid. Only `main.cpp` is recompiled, and then the program is linked again.

@write
From memory, write the `CMakeLists.txt` for a project called `hist`: C++17, a library `hist` built from `src/hist.cpp` with headers in `include/`, and a program `fill` built from `src/fill.cpp` that uses the library.
min: 7
```solution
cmake_minimum_required(VERSION 3.16)
project(hist LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(hist src/hist.cpp)
target_include_directories(hist PUBLIC include)

add_executable(fill src/fill.cpp)
target_link_libraries(fill PRIVATE hist)
```
! Five ideas: the version line, the project, the standard, the two targets, and the link between them.
--- recall
Q: Which two commands configure and build a CMake project out of source?
A: cmake -S . -B build, then cmake --build build.
Q: What do add_library, add_executable and target_link_libraries do?
A: The first two define targets, a library and a program, from source files. The third says that a target uses a library.
Q: What is the difference between PUBLIC and PRIVATE in a target_ command?
A: PRIVATE applies only when building that target. PUBLIC also applies to every target that links to it.
Q: What goes in a header file and what in a source file?
A: The header holds declarations, which other files include. The source file holds the definitions, which are compiled once.

=== sy1 | sys | 3 | Containers and Docker | 
## The problem: "it works on my machine"

Your analysis runs on your laptop. On a colleague's machine it crashes, because they have a different version of Python, or a library is missing, or a setting differs. Multiply that by thousands of physicists and hundreds of thousands of computers in the computing grid, and you have a real problem.

A **container** solves it by packaging a program together with everything it needs to run: the right versions of libraries and tools, configuration files, and a minimal copy of an operating system's files. The package runs the same way on any machine that can run containers.

## Containers and virtual machines

A **virtual machine** simulates an entire computer, including its own operating system core (the **kernel**). It is fully separated but heavy: gigabytes in size, and it takes a minute to start.

A container is lighter. It uses the kernel of the machine it runs on, the **host**, and only isolates what the program can see: its own files, its own list of running programs, its own network. It starts in about a second and adds almost no overhead. **Docker** is the most widely used tool for building and running containers.

## Three words to keep apart

- A **Dockerfile** is a text file of instructions for building the package. It is the recipe.
- An **image** is the result of following the recipe: a read-only bundle of files. It is the finished dish, frozen.
- A **container** is a running copy of an image. You can start many containers from one image, and each has its own private scratch space.

The relation between image and container is like that between a program on disk and a running process, or a class and its objects.

## Writing a Dockerfile

```
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "analysis.py"]
```

Each line is one instruction:

- `FROM` names the image to start from. Nobody builds from nothing. `python:3.12-slim` is a small official image with Python 3.12 already installed. The part after the colon is a **tag**, usually a version.
- `WORKDIR /app` sets the directory inside the image where the following instructions run, creating it if needed.
- `COPY requirements.txt .` copies a file from your machine into the image. The final `.` means "into the current directory", which is `/app`.
- `RUN` executes a command while the image is being **built**. Here it installs your Python packages, so they become part of the image.
- `COPY . .` copies the rest of your project in.
- `CMD` gives the command that runs when a container **starts**. It doesn't run during the build.

The difference between `RUN` and `CMD` trips everyone up once: `RUN` happens at build time and its result is stored in the image. `CMD` happens each time you start a container.

## Building and running

```
docker build -t dimuon .                 # build an image from the Dockerfile in this directory, named dimuon
docker run --rm dimuon                   # start a container from it; --rm deletes the container when it stops
docker run -it --rm python:3.12 bash     # -it gives you an interactive shell inside a container
docker images                            # list the images on your machine
docker ps                                # list running containers (add -a for stopped ones too)
```

## Layers and the build cache

Each instruction in a Dockerfile adds a **layer** on top of the previous ones, and Docker caches every layer. When you rebuild, it reuses layers from the cache until it reaches the first instruction whose inputs have changed. From there on, everything is rebuilt.

That explains the order in the example. Installing packages is slow, and your code changes far more often than your list of packages. By copying `requirements.txt` and installing **before** copying the code, a code change only invalidates the last `COPY`. The slow install layer comes straight from the cache. If you copied everything first, every edit would trigger a full reinstall.

## Data that must survive

A container's private scratch space is deleted with the container. Anything you want to keep, such as output files, has to live outside it. A **volume** or **bind mount** makes a directory of the host appear inside the container:

```
docker run --rm -v "$PWD/data:/app/data" dimuon
```

`-v host_path:container_path` connects the two. `$PWD` is the shell variable holding your current directory. Whatever the program writes to `/app/data` lands in `data/` on your machine.

A second flag you will use often is `-p 8080:80`, which connects port 8080 on your machine to port 80 inside the container, for programs that serve web pages.

## At CERN

Experiments publish their software as container images so that an analysis can be rerun years later with exactly the same environment. Jobs on the computing grid and on Kubernetes clusters run in containers. Several openlab projects deal with containers, cloud and high-performance computing.

If you can't install Docker, you can practise in the browser at [Play with Docker](https://labs.play-with-docker.com/).
--- practice
@choice
What is the relationship between an image and a container?
- They are two names for the same thing
* An image is a read-only package. A container is a running instance started from an image
- A container is used to build an image
- An image runs inside a container
! One image can be the source of many containers, like one program can be started many times.

@choice
In a Dockerfile, what is the difference between `RUN` and `CMD`?
- `RUN` is for Linux and `CMD` for Windows
- `CMD` runs during the build and `RUN` when the container starts
* `RUN` executes while the image is built and its result is stored in the image. `CMD` is the command executed when a container starts
- There is no difference
! Installing software belongs in `RUN`. Starting your program belongs in `CMD`.

@choice
Why does the example copy `requirements.txt` and run `pip install` before `COPY . .`?
- Docker requires files to be copied in alphabetical order
* Layers are cached, so editing your code doesn't force the slow package install to run again
- Because `pip` can't see files copied by `COPY . .`
- To make the image smaller
! Docker rebuilds from the first changed layer onwards. Putting rarely changing steps first keeps rebuilds fast.

@local
In an empty folder, create `hello.py` containing `print("hello from a container")` and a Dockerfile that starts from `python:3.12-slim`, sets a working directory, copies the file in, and runs it with `CMD`. Then run the two commands below and paste the output of the second.
```
docker build -t hello .
docker run --rm hello
```
= hello from a container
! If you get "permission denied" talking to Docker on Linux, your user needs to be in the `docker` group, or prefix the commands with `sudo`.

@write
From memory, write a Dockerfile for a Python project: start from Python 3.12, work in `/app`, install the packages listed in `requirements.txt` in a way that makes good use of the cache, copy the code, and run `main.py`.
min: 5
```solution
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```
! The order matters: requirements and install first, the rest of the code afterwards.
--- recall
Q: What is the difference between a Docker image and a container?
A: An image is the built, read-only template. A container is a running instance of an image.
Q: Why copy requirements.txt and install it before copying the rest of the code?
A: Layers are cached, so code changes don't force a reinstall of every package.
Q: Where should data you want to keep live when using containers?
A: In a mounted volume or host folder, because the container can be thrown away.
Q: What is the difference between RUN and CMD in a Dockerfile?
A: RUN executes at build time and is stored in the image. CMD is the command run when a container starts.

=== ap1 | app | 3 | Writing a CV for CERN | 
## What a CV has to do

A selector goes through a large pile of CVs and gives each one a minute or less on the first pass. In that minute yours has to answer one question: **can this student do useful work on a technical project for a summer?** For you that means showing two things: you can program, and you finish what you start.

Everything on the page should support that. Anything that doesn't is taking attention away from what does.

## Layout

- **One page.** Two at most, and only if the second is as strong as the first.
- **One plain column**, a readable font, clear section headings, consistent dates.
- **No skill bars, star ratings or percentages.** "Python: 4 of 5 stars" means nothing, because nobody knows what 5 stars is.
- A photo isn't needed.

Plain is good. The selector should find each section where they expect it.

## Sections, in order

- **Header**: name, email, phone, city and country, and links to GitHub and LinkedIn.
- **Education**: degree, university, expected graduation date, grade average if it is good, and a few relevant courses.
- **Projects**: two to four. For a student without much work experience this is the most important section.
- **Experience**: jobs, internships, teaching assistant roles, student teams.
- **Skills**: programming languages and tools, grouped honestly.
- **Languages**: your English level, and any others.

## How to write a project entry

Each project gets one or two lines that say three things: **what you built, with which tools, and a concrete result**. Then a link.

```
Dimuon mass spectrum from CMS Open Data (Python, pandas, NumPy)
Computed invariant masses for 100,000 collision events and identified
the J/psi, Upsilon and Z peaks. github.com/you/cern-prep
```

Compare that with "Worked on a physics data project using Python". The second tells the reader nothing they can picture or check.

Three habits make entries strong:

- **Start with a verb** that says what you did: built, implemented, analysed, automated, reduced, tested. Avoid "worked on", "helped with", "was responsible for", which hide what you actually did.
- **Use numbers** wherever you honestly can: number of events, users, tests, how much faster, your grade.
- **Say what was yours.** In a team project, name your part.

## The skills section

List what you could answer questions about in an interview, and group it by how well you know it:

```
Languages: C++ (good), Python (good), Java (basic)
Tools: Linux, Git, Docker (basic), ROOT (basic)
```

Being honest about "basic" makes your "good" believable. Anything you list is fair game for an interviewer.

## What to cut

School achievements once you are in your third year of university, lists of soft skills ("team player, hard-working"), every course you ever took, and hobbies unless they show something relevant. If a line doesn't support "can program, learns fast, finishes things", remove it.

## Before you export

- run a spell-check, and read it once backwards, line by line, to catch what the spell-checker misses
- click every link. A broken GitHub link is worse than none.
- make sure the GitHub profile behind the link has a README on each project you mention
- name the file clearly: `Firstname_Lastname_CV.pdf`
- open the PDF on a phone and check it is readable
--- practice
@choice
Which project entry is the strongest?
- Worked on a group project about databases
- Responsible for the backend of a web application
* Built a REST API for a library system in Java and PostgreSQL, with 40 unit tests, used by 3 teammates' front ends. github.com/you/library-api
- Passionate about backend development and databases
! It names what was built, the tools, and results the reader can picture and check. The others could describe anything.

@write
Rewrite this weak entry as a strong one, inventing plausible details if you need to: "Helped with a website for a student organisation."
min: 18
```solution
Built the event registration page for the faculty student association's website (JavaScript, Node.js, SQLite). Handled 300 sign-ups for the autumn hackathon and replaced a manual spreadsheet.
```
! Check yours for the three parts: what you built, with which tools, and a result with a number in it. It should start with a verb that says what you did.

@choice
Which skills section is best?
- Python ★★★★☆, C++ ★★★☆☆, Docker ★★☆☆☆
- Python, C++, Java, Rust, Go, Haskell, Kubernetes, TensorFlow, Spark, Hadoop
* Languages: C++ (good), Python (good), Java (basic). Tools: Linux, Git, Docker (basic)
- Expert in all major programming languages
! Grouped, honest and short. A long list of everything you have ever touched invites interview questions you can't answer.

@choice
You are in your third year of university and need to get the CV down to one page. What goes first?
- The projects section
- The link to your GitHub
* The high-school prizes and the list of soft skills
- Your expected graduation date
! Cut whatever doesn't support "can program and finishes things". Projects and the GitHub link are exactly what does.

@write
Write the entry for one real project of yours, as it will appear on your CV: what you built, the tools, a concrete result, and the link.
min: 22
```solution
Dimuon mass spectrum from CMS Open Data (Python, pandas, NumPy, matplotlib)
Computed invariant masses for 100,000 collision events, selected opposite-charge pairs and identified the J/psi, Upsilon and Z peaks. github.com/you/cern-prep
```
! Compare the shape, not the content. If your result has no number in it, look for one: lines of code are weak, but data size, tests, users, speed or a grade are good.
--- recall
Q: What is the most important CV section for a student without much work experience?
A: Projects: 2 to 4 of them, each saying what you built, with what, and the result, plus a link.
Q: What three things should each project line say?
A: What you built, which tools you used, and a concrete result.
Q: Name three checks to do before exporting the CV.
A: Spell-check it, click every link, give the file a clear name, and look at it on a small screen.
Q: Why avoid skill bars and star ratings?
A: They have no defined scale, so they tell the reader nothing. Honest groups such as "good" and "basic" do.

=== c6 | cpp | 4 | Classes and encapsulation | c7,c23
## What a class is for

A class defines a new type that bundles data with the functions allowed to touch that data. The point is **encapsulation**: the data is hidden, and the outside world can only use it through functions you chose to offer. Then the class can guarantee its data is always in a sensible state, because nobody else can reach in and break it.

A histogram is a good example. It has a range and a list of bin counts. If any code could modify the counts or the range directly, a bug anywhere could corrupt it. As a class, the only way to change it is `fill()`.

```
#include <vector>

class Histogram {
public:
    Histogram(int nbins, double lo, double hi)
        : lo_(lo), hi_(hi), counts_(nbins, 0) {}

    void fill(double x) {
        if (x < lo_ || x >= hi_) return;
        int bin = static_cast<int>((x - lo_) / (hi_ - lo_) * counts_.size());
        ++counts_[bin];
    }

    int count(int bin) const { return counts_.at(bin); }

private:
    double lo_, hi_;
    std::vector<int> counts_;
};
```

Note the semicolon after the closing brace of a class. Leaving it out produces confusing errors on the following lines.

## public and private

Everything after `public:` can be used by any code. Everything after `private:` can only be used inside the class's own member functions. Trying `h.counts_` from outside is a compile error.

`class` and `struct` are the same thing with one difference: members of a `class` are private until you say otherwise, and members of a `struct` are public. By convention, `struct` is used for plain bundles of data and `class` when there is something to protect.

The trailing underscore in `lo_` is just a naming habit that marks member variables. It has no meaning to the compiler.

## Constructors

A **constructor** is a special function with the same name as the class and no return type. It runs when an object is created, and its job is to put the object in a valid starting state.

```
Histogram h(10, 0.0, 100.0);     // calls the constructor
```

The part after the colon is the **member initialiser list**:

```
: lo_(lo), hi_(hi), counts_(nbins, 0)
```

It says "construct `lo_` from `lo`, `hi_` from `hi`, and `counts_` as a vector of `nbins` zeros". This creates each member directly with its final value. Assigning inside the body would first create them empty and then overwrite them, and for some members (`const` ones, references) assignment isn't possible at all. So use the list.

One subtlety: members are always initialised in the order they are **declared** in the class, not the order you write in the list. Keep the two orders the same so one member can safely depend on an earlier one.

## Member functions

Functions inside the class can use the member variables directly. Call them on an object with a dot: `h.fill(42.0)`.

`||` means "or" and `&&` means "and". The first line of `fill` ignores values outside the range. `return;` on its own leaves a `void` function early.

## const member functions

The `const` after the parameter list of `count` is a promise that calling this function doesn't change the object:

```
int count(int bin) const { ... }
```

This matters because of const references. If a function receives `const Histogram& h`, the compiler only allows calls to member functions marked `const`. A function that merely reads but lacks the `const` can't be used there. The rule is simple: every member function that doesn't modify the object gets `const`.

## static_cast: converting on purpose

`(x - lo_) / (hi_ - lo_) * counts_.size()` is a `double`, such as 4.73. A bin index must be a whole number. `static_cast<int>(4.73)` converts it to `4` by dropping the decimals. Writing the conversion explicitly shows it is intended, and is easy to search for. The older C style `(int)x` does the same but is discouraged.

## Declaration and definition apart

In real projects the class goes in a header file (`Histogram.h`) with only the function declarations, and the bodies go in a source file (`Histogram.cpp`). Outside the class, a member function's name is prefixed with the class name and `::`:

```
void Histogram::fill(double x) {
    ...
}
```

## explicit

A constructor that can be called with one argument also acts as an automatic conversion: with `Circle(double r)`, C++ would silently turn `3.0` into a `Circle` wherever one is expected. Writing `explicit Circle(double r)` turns that off. Make single-argument constructors `explicit` by default.
--- practice
@predict
```
#include <iostream>

class Counter {
public:
    explicit Counter(int start) : n_(start) {}
    void tick() { ++n_; }
    int value() const { return n_; }
private:
    int n_;
};

int main() {
    Counter a(5);
    Counter b = a;
    a.tick();
    a.tick();
    b.tick();
    std::cout << a.value() << ' ' << b.value() << '\n';
}
```
= 7 6
! `Counter b = a` makes a separate copy holding 5. Each object then counts on its own.

@choice
A function has the parameter `const Histogram& h`. Which member functions of `Histogram` may it call on `h`?
- All of them
- None of them
* Only those marked `const` after their parameter list
- Only the constructor
! A const reference promises not to modify the object, so the compiler only allows member functions that make the same promise.

@predict
`static_cast<int>` drops the decimals.
```
#include <iostream>

int main() {
    double lo = 0.0, hi = 100.0;
    int nbins = 4;
    double x = 62.0;
    int bin = static_cast<int>((x - lo) / (hi - lo) * nbins);
    std::cout << bin << '\n';
}
```
= 2
! 62 / 100 × 4 = 2.48, which becomes 2. With bins numbered from 0, bin 2 covers 50 to 75.

@local
Write `account.cpp`: a class `Account` with a private `double balance_`, a constructor taking the starting balance, `void deposit(double)`, `bool withdraw(double)` that refuses (returns `false` and changes nothing) if the balance would go negative, and `double balance() const`. In `main`: start with 100, deposit 50, try to withdraw 500, withdraw 30, then print the balance. Paste the output.
= 120
! The failed withdrawal must leave the balance alone. That guarantee is what `private` buys you: no other code can make the balance negative.

@write
From memory, write the class `Histogram` from the lesson: constructor `(nbins, lo, hi)` with an initialiser list, `fill(double)` ignoring values outside `[lo, hi)`, and `count(int) const`.
min: 12
```solution
#include <vector>

class Histogram {
public:
    Histogram(int nbins, double lo, double hi)
        : lo_(lo), hi_(hi), counts_(nbins, 0) {}

    void fill(double x) {
        if (x < lo_ || x >= hi_) return;
        int bin = static_cast<int>((x - lo_) / (hi_ - lo_) * counts_.size());
        ++counts_[bin];
    }

    int count(int bin) const { return counts_.at(bin); }

private:
    double lo_, hi_;
    std::vector<int> counts_;
};
```
! Check yours for: the semicolon after the closing brace, `const` on `count`, and the range check before computing the bin.
--- recall
Q: What is the default access in a class, and in a struct?
A: class members are private by default. struct members are public.
Q: What does const after a member function mean?
A: It promises not to change the object, so the function can be called on const objects and references.
Q: In what order are members initialised?
A: In the order they are declared in the class, whatever order the initialiser list uses.
Q: What does static_cast<int>(4.73) give, and why write it that way?
A: 4. It drops the decimals, and the explicit cast shows the conversion is intended.

=== py6 | py | 4 | NumPy arrays and masks | p9
## Why NumPy

A Python list can hold anything, which makes every operation slow: Python must check the type of each element as it goes. A NumPy **array** holds numbers of one single type in one block of memory, and its operations run in compiled C code. For a million numbers the difference is often a factor of 50 or more. Physics analysis in Python is built on this.

NumPy is not part of Python itself. Install it once with `pip install numpy`. By convention it is imported under the short name `np`.

```
import numpy as np
e = np.array([12.0, 45.3, 80.1, 5.2])   # make an array from a list
e.shape     # (4,)      the size along each dimension
e.dtype     # float64   the type of every element
len(e)      # 4
```

## Whole-array arithmetic

Operators work on every element at once. This is called **vectorisation**, and it replaces loops.

```
e * 2           # array([ 24. ,  90.6, 160.2,  10.4])
e + e           # element by element
e ** 2          # every element squared
np.sqrt(e)      # NumPy functions also work element by element
e.sum(), e.mean(), e.std(), e.min(), e.max()
```

With a list, `[1, 2] * 2` repeats the list (`[1, 2, 1, 2]`). With an array, `* 2` doubles the numbers. Keep in mind which one you are holding.

## Masks: selecting with a condition

Comparing an array with a number compares every element and gives an array of `True`/`False` values, called a **mask**:

```
mask = e > 20
# array([False,  True,  True, False])
```

Put a mask inside the square brackets and you get only the elements where it is `True`:

```
e[mask]             # array([45.3, 80.1])
e[e > 20]           # the same thing in one step
mask.sum()          # 2   True counts as 1, so this is "how many passed"
np.count_nonzero(mask)
```

In physics this is called applying a **cut**: keep the events that pass a condition.

To combine conditions use `&` (and), `|` (or) and `~` (not). These work element by element. The words `and`, `or` and `not` do **not** work on arrays and raise an error.

```
e[(e > 20) & (e < 70)]     # array([45.3])
```

The brackets around each comparison are required. `&` is applied before `>` and `<`, so without brackets Python would try to compute `20 & e` first.

## Making arrays

```
np.zeros(5)                 # five 0.0 values
np.arange(0, 10, 2)         # array([0, 2, 4, 6, 8])   like range, stop excluded
np.linspace(0, 1, 5)        # array([0., 0.25, 0.5, 0.75, 1.])   5 points, both ends included
```

## Histograms

A **histogram** counts how many values fall into each of a set of intervals called **bins**.

```
counts, edges = np.histogram(e, bins=4, range=(0, 100))
# counts: array([2, 1, 0, 1])                  how many values in each bin
# edges:  array([  0.,  25.,  50.,  75., 100.])   where the bins start and end
```

`np.histogram` returns two arrays, which is why there are two names on the left. Four bins need five edges, because each bin has a left and a right side. To get the middle of each bin for plotting:

```
centres = (edges[:-1] + edges[1:]) / 2      # array([12.5, 37.5, 62.5, 87.5])
```

`edges[:-1]` is all the left sides and `edges[1:]` is all the right sides. Adding them element by element and halving gives the midpoints.

## Views and copies

A slice of an array (`e[1:3]`) is a **view**: it shares memory with the original, so changing it changes the original. Indexing with a mask gives a **copy**. When you need an independent slice, write `e[1:3].copy()`.
--- practice
@predict
```
import numpy as np
a = np.array([1, 2, 3, 4])
print((a * 2).sum(), (a > 2).sum())
```
= 20 2
! `a * 2` is `[2, 4, 6, 8]`, which sums to 20. `a > 2` is `[False, False, True, True]`, and `True` counts as 1.

@predict
```
import numpy as np
pt = np.array([5.0, 25.0, 40.0, 12.0, 60.0])
sel = pt[(pt > 10) & (pt < 50)]
print(len(sel), sel.max())
```
= 3 40.0
! 25, 40 and 12 pass both conditions. 5 fails the first and 60 fails the second.

@choice
Why does `e[e > 20 and e < 70]` raise an error?
- Because the brackets are missing
* Because `and` tries to turn a whole array into one True/False value. For element-by-element logic you need `&`
- Because masks can only hold one condition
- Because 20 and 70 should be floats
! `and` works on single truth values. `&` works element by element, and each comparison then needs its own brackets.

@predict
```
import numpy as np
counts, edges = np.histogram([1, 2, 2, 9], bins=2, range=(0, 10))
print(counts, len(edges))
```
= [3 1] 3
! Two bins: 0 to 5 holds 1, 2, 2 and 5 to 10 holds 9. Two bins need three edges. NumPy prints arrays without commas.

@local
On your machine, write `cut.py`: make an array of the energies `[12.0, 45.0, 80.0, 5.0, 35.0, 150.0]`, keep those above 20, and print how many passed, their mean, and the result of `np.histogram(sel, bins=3, range=(0, 150))[0]`. Run it and paste the output.
= 4
= 77.5
= [2 1 1]
! Four values pass the cut. If `import numpy` fails, run `pip install numpy` first.
--- recall
Q: How do you keep only the energies above 20 in a NumPy array e?
A: e[e > 20], which indexes with a boolean mask.
Q: Why does (e > 20) & (e < 70) need the brackets?
A: & binds more tightly than the comparisons, so without brackets it would compute 20 & e first.
Q: np.histogram with 30 bins returns how many edges?
A: 31 edges and 30 counts.
Q: What is the difference between [1, 2] * 2 and np.array([1, 2]) * 2?
A: The list is repeated: [1, 2, 1, 2]. The array is multiplied element by element: [2, 4].

=== ph5 | phys | 4 | Counting statistics: Poisson, √N and error bars | p18
## Every count is a random number

Suppose theory says a selection should find 100 events in your data. You run it and find 93. Is something wrong? No. Collisions are random, and repeating the same experiment gives a different count each time: 93, 108, 101. A measured number means nothing until you know how much it would scatter. That scatter is the **statistical uncertainty**, and this lesson is about where it comes from.

## The Poisson distribution

When events happen independently at a fixed average rate, the number counted follows the **Poisson distribution**. If the average is λ (lambda), the probability of counting exactly n is:

```
P(n) = λⁿ · e^(−λ) / n!
```

`n!` is the factorial, n · (n−1) · … · 1, and `e` is Euler's number, 2.718. You rarely need the formula itself. You need its two properties: the average count is λ, and the typical scatter around it, the **standard deviation**, is **√λ**.

So if you count N events, your best estimate of the uncertainty is **√N**:

- 100 events: ±10, a relative uncertainty of 10%.
- 10,000 events: ±100, which is 1%.
- 1,000,000 events: ±1,000, which is 0.1%.

The relative uncertainty is √N / N = 1/√N. To halve it you need **four times** the data. This slow improvement is the reason the LHC runs for decades and is being upgraded for higher luminosity.

## What an error bar says

In a histogram, each bin is its own counting experiment, so each bin gets an error bar of ±√N. The bar marks one standard deviation, also called **one sigma** (1σ). For counts that aren't tiny, the Poisson distribution has the bell shape of a **Gaussian**, for which:

- 68% of repeated measurements land within ±1σ of the true value,
- 95% within ±2σ,
- 99.7% within ±3σ.

A consequence that surprises people: about one point in three **should** miss the true curve by more than its error bar. A plot where every point sits exactly on the line is suspicious, because it means the errors are too large or the data have been tuned.

For very small counts, below about ten, √N is a poor estimate, and a bin with zero events doesn't have zero uncertainty. Proper intervals exist for that case. Remember that the simple rule has a limit.

## Statistical and systematic

The **statistical** uncertainty comes from the random scatter of a finite count, and it shrinks as you collect more data. A **systematic** uncertainty comes from imperfect knowledge of the experiment: the energy calibration, the alignment of the detector, the luminosity, the simulation. More data doesn't reduce it. Results quote both, for example 91.19 ± 0.02 (stat) ± 0.03 (syst) GeV.

## Combining uncertainties

Independent uncertainties add **in quadrature**: square them, add, take the square root. They don't simply add, because it is unlikely that both go the same way by their full amount.

```
for a sum or a difference:    σ = sqrt(σa² + σb²)
for a product or a ratio:     the relative uncertainties add in quadrature
```

For example, a signal count obtained by subtracting a background, S = N − B with N = 130 ± 11.4 and B = 100 ± 5, has σ = sqrt(11.4² + 5²) = 12.4.

Two more rules you will need. If you scale a count by a constant, the uncertainty scales with it: a bin with 400 simulated events, each weighted by 0.5, holds 200 ± 10, not 200 ± 14. And an efficiency ε = k/n, where k of n events pass, has the binomial uncertainty sqrt(ε(1−ε)/n).

## Is it a signal? Significance

You expect B background events and observe N. Is the excess real or a fluctuation? The background alone scatters by √B, so the excess is measured in units of that:

```
significance ≈ (N − B) / √B
```

With B = 100 and N = 130, that is 30/10 = 3 sigma. Particle physics uses two conventional thresholds. **Three sigma** is called "evidence": background alone would fluctuate that high about once in 740 tries. **Five sigma** is required to claim a discovery: about once in 3.5 million. The bar is that high because the field makes thousands of measurements, and some three-sigma effects are bound to appear by chance. Most of them have indeed gone away with more data.
--- practice
@predict
A histogram bin holds 2,500 events. What is its statistical uncertainty?
= 50
=| ±50
=| 50 events
! √2500 = 50, a relative uncertainty of 2%.

@predict
You expect 100 background events and observe 130. What is the significance of the excess, (N − B) / √B, in sigma?
= 3
=| 3.0
=| 3 sigma
=| 3σ
! The excess is 30 events and the background scatters by √100 = 10, so 30 / 10 = 3. Interesting, and not a discovery.

@choice
A measurement has a relative statistical uncertainty of 2%. How much data is needed to bring it down to 1%?
- Twice as much
* Four times as much
- Ten times as much
- 1% more
! The relative uncertainty goes as 1/√N. Halving it means doubling √N, which means four times N.

@run
Write `signif(n_obs, b)`, which returns (n_obs − b) / √b, and `combine(a_err, b_err)`, which adds two independent uncertainties in quadrature.
```starter
import math

def signif(n_obs, b):
    pass

def combine(a_err, b_err):
    pass
```
```test
print(round(signif(130, 100), 3))
print(round(signif(25, 16), 3))
print(round(combine(3.0, 4.0), 3))
```
= 3.0
= 2.25
= 5.0
```solution
import math

def signif(n_obs, b):
    return (n_obs - b) / math.sqrt(b)

def combine(a_err, b_err):
    return math.sqrt(a_err ** 2 + b_err ** 2)
```
! Uncertainties of 3 and 4 combine to 5 and not 7, the same way the sides of a right triangle do.

@run
Write `poisson(n, lam)`: the probability of counting exactly `n` events when the average is `lam`. `math.exp(x)` gives e to the power x and `math.factorial(n)` gives n!.
```starter
import math

def poisson(n, lam):
    pass
```
```test
print(round(poisson(0, 3.0), 4))
print(round(poisson(3, 3.0), 4))
print(round(sum(poisson(n, 3.0) for n in range(40)), 4))
```
= 0.0498
= 0.224
= 1.0
```solution
import math

def poisson(n, lam):
    return lam ** n * math.exp(-lam) / math.factorial(n)
```
! With an average of 3 you still count zero events 5% of the time, and exactly 3 only 22% of the time. The probabilities of all possible counts add up to 1.

@choice
Which uncertainty gets smaller when the experiment collects more data?
* The statistical uncertainty
- The systematic uncertainty
- Both, equally
- Neither
! Statistical scatter averages out as 1/√N. A miscalibrated detector is just as miscalibrated after ten times more events.
--- recall
Q: What is the statistical uncertainty on a count of N events, and the relative uncertainty?
A: √N, so the relative uncertainty is 1/√N.
Q: What does a one-sigma error bar mean?
A: If the measurement were repeated many times, about 68% of the results would fall within the bar. Roughly one point in three should miss.
Q: How do independent uncertainties combine when two quantities are added or subtracted?
A: In quadrature: the square root of the sum of their squares.
Q: What is the difference between a statistical and a systematic uncertainty?
A: Statistical comes from the random scatter of a finite count and shrinks with more data. Systematic comes from imperfect knowledge of the detector or the method and does not.

=== c7 | cpp | 4 | Inheritance, virtual and unique_ptr | c8
## One interface, many types

Suppose a program handles circles and squares and needs the area of each. You want to keep them in one list and call `area()` on every element, without checking which kind it is. **Inheritance** makes that possible: you define a general type, `Shape`, that says what every shape can do, and specific types that each do it their own way.

```
struct Shape {
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

struct Circle : Shape {
    double r;
    explicit Circle(double r) : r(r) {}
    double area() const override { return 3.14159265 * r * r; }
};

struct Square : Shape {
    double s;
    explicit Square(double s) : s(s) {}
    double area() const override { return s * s; }
};
```

`struct Circle : Shape` means "a `Circle` is a kind of `Shape`". `Shape` is the **base class** and `Circle` is a **derived class**. A `Circle` can be used anywhere a `Shape` is expected.

## virtual: decide at run time

Normally the compiler decides which function a call refers to by looking at the type written in the code. With a `Shape&` in hand, it would always call `Shape`'s version.

Marking a function `virtual` changes that: the call is looked up **while the program runs**, using the real type of the object.

```
void print_area(const Shape& s) {
    std::cout << s.area() << '\n';     // Circle's or Square's, depending on what s really is
}
```

This is called **polymorphism**: one piece of code, many behaviours.

The `= 0` at the end makes `area` a **pure virtual** function: `Shape` declares it but provides no body. A class with a pure virtual function is **abstract**. You can't create a plain `Shape`, only the derived types, and each must supply `area` to be usable.

## override

`override` in a derived class says "this is meant to replace a virtual function of the base". The compiler then checks that it really does. Without it, a small difference such as forgetting `const` would silently create a brand-new, unrelated function, and the base version would still be the one called. Always write `override`.

## The virtual destructor

A **destructor** is the function that runs when an object is destroyed. Its name is the class name with `~` in front. `= default` asks the compiler to write the usual one.

If you destroy a `Circle` through a pointer to `Shape`, the program needs to run `Circle`'s clean-up, and it can only find it if the base destructor is `virtual`. Without that, the behaviour is undefined. The rule: any class with virtual functions gets a virtual destructor.

## Why pointers and references are required

Polymorphism only works through a pointer or a reference. If you copy a `Circle` into a variable of type `Shape`, only the `Shape` part is copied and the rest is cut off. This is called **slicing**.

So a vector of mixed shapes can't be a `std::vector<Shape>`. It has to hold pointers.

## Objects on the heap

Local variables are destroyed automatically at the end of their block. An object created with `new` lives on the **heap** instead: it stays alive until someone calls `delete` on it.

```
Shape* p = new Circle(1.0);
delete p;
```

Forgetting the `delete` leaks memory, and deleting twice crashes. Doing this correctly by hand is so error-prone that modern C++ avoids raw `new` and `delete`.

## std::unique_ptr

`std::unique_ptr<T>` (header `<memory>`) is a **smart pointer**: an object that holds a pointer and automatically deletes what it points to when it is itself destroyed. Create one with `std::make_unique`:

```
#include <memory>

std::unique_ptr<Shape> p = std::make_unique<Circle>(1.0);
p->area();          // use it like a pointer
```

"Unique" means exactly one owner. A `unique_ptr` can't be copied, because then two owners would both try to delete. It can be **moved**, which hands the ownership over and leaves the source empty:

```
auto q = std::move(p);     // q owns the circle now; p is null
```

Now the mixed list works, and everything is cleaned up when the vector goes away:

```
std::vector<std::unique_ptr<Shape>> shapes;
shapes.push_back(std::make_unique<Circle>(1.0));
shapes.push_back(std::make_unique<Square>(2.0));

double total = 0;
for (const auto& s : shapes) total += s->area();
```

The loop variable must be a reference (`const auto&`), since a `unique_ptr` can't be copied.

`std::shared_ptr` is the alternative for when several owners truly share one object. It counts its owners and deletes when the last one goes. It costs more, so `unique_ptr` is the default.
--- practice
@predict
```
#include <iostream>

struct Animal {
    virtual ~Animal() = default;
    virtual const char* sound() const { return "..."; }
    const char* kind() const { return "animal"; }
};

struct Dog : Animal {
    const char* sound() const override { return "woof"; }
    const char* kind() const { return "dog"; }
};

int main() {
    Dog d;
    const Animal& a = d;
    std::cout << a.sound() << ' ' << a.kind() << '\n';
}
```
= woof animal
! `sound` is virtual, so the real type (Dog) decides. `kind` is not virtual, so the type written in the code (Animal) decides.

@choice
Why can't you store circles and squares in a `std::vector<Shape>`?
- Vectors can only hold numbers
* Copying a derived object into a `Shape` keeps only the `Shape` part (slicing), and `Shape` is abstract anyway
- Because `Shape` has no constructor
- You can, it works fine
! Polymorphism needs pointers or references, which is why the vector holds `std::unique_ptr<Shape>`.

@predict
```
#include <iostream>
#include <memory>

int main() {
    auto p = std::make_unique<int>(42);
    auto q = std::move(p);
    std::cout << (p ? "p owns" : "p empty") << ", " << *q << '\n';
}
```
= p empty, 42
! Moving hands ownership to `q` and leaves `p` null. A smart pointer used as a condition is true when it holds something.

@local
Write `shapes.cpp` with the `Shape`, `Circle` and `Square` types from the lesson. In `main`, fill a `std::vector<std::unique_ptr<Shape>>` with a `Square(2.0)`, a `Square(3.0)` and a `Circle(1.0)`, then print the total area. Paste the output.
= 16.14
! 4 + 9 + 3.14159 = 16.1416, and `std::cout` shows six significant digits by default.

@write
From memory: an abstract base `Detector` with a pure virtual `std::string name() const` and a virtual destructor, and one derived class `Tracker` that overrides `name` to return `"tracker"`.
min: 8
```solution
#include <string>

struct Detector {
    virtual ~Detector() = default;
    virtual std::string name() const = 0;
};

struct Tracker : Detector {
    std::string name() const override { return "tracker"; }
};
```
! Three things to check: the virtual destructor, `= 0` on the base function, and `override` on the derived one.
--- recall
Q: Why does a polymorphic base class need a virtual destructor?
A: So deleting a derived object through a base pointer also runs the derived destructor.
Q: What does override do?
A: It makes the compiler check that the function really overrides a virtual function in the base.
Q: Can a std::unique_ptr be copied?
A: No. It can only be moved with std::move, so there is always one owner.
Q: What does = 0 after a virtual function declaration mean?
A: The function is pure virtual: the base class gives no body, the class is abstract, and derived classes must implement it.

=== py11 | py | 4 | matplotlib: plots fit for a paper | p21
## A figure is a result

In physics a result is a plot. A figure with unlabeled axes, or one that only exists because someone clicked through a notebook in the right order, is not a result yet. This lesson is about making figures the way papers do: from a script, with labels, units and error bars, saved to a file.

Install the library with `pip install matplotlib`. The examples also use NumPy.

## fig and ax

```
import numpy as np
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
```

`plt.subplots()` creates two objects. `fig` is the **figure**: the whole image, which you save at the end. `ax` is the **axes**: one plotting area with its x and y axis, where you draw and set labels. Many tutorials call functions on `plt` directly, such as `plt.plot(...)`. That works for a quick look, but the version with `fig` and `ax` stays readable when a figure has several panels, so use it from the start.

```
x = np.linspace(0, 10, 200)        # 200 evenly spaced numbers from 0 to 10
ax.plot(x, np.sin(x), label="sin(x)")
ax.set_xlabel("x [rad]")
ax.set_ylabel("Amplitude")
ax.legend()
fig.savefig("sine.png", dpi=150)
```

`ax.plot` draws a line through the points. The `label` text is what `ax.legend()` puts in the legend box. `dpi` (dots per inch) sets the resolution of the saved image, and 150 is enough for a README. A script that saves a file needs no window. If you want one while experimenting, call `plt.show()`.

## Histograms, three ways

`ax.hist` computes the histogram and draws it in one go:

```
ax.hist(masses, bins=50, range=(2, 4), histtype="step")
```

`histtype="step"` draws only the outline, the usual style in physics.

Often you have computed the counts already, because you need them for a fit. Then draw them with `ax.stairs`, which takes the counts and the bin edges:

```
counts, edges = np.histogram(masses, bins=50, range=(2, 4))
ax.stairs(counts, edges)
```

Don't pass counts to `ax.hist`. It would treat the counts themselves as data and make a histogram of them.

Measured data are normally shown as points with error bars. Points belong at the bin **centres**, and `np.histogram` returns the **edges**, one more than there are bins:

```
centres = (edges[:-1] + edges[1:]) / 2
ax.errorbar(centres, counts, yerr=np.sqrt(counts), fmt="o", markersize=3, label="Data")
```

`edges[:-1]` is every edge except the last, so all the left edges. `edges[1:]` is every edge except the first, so all the right edges. Adding the two arrays and halving gives the middle of each bin. `yerr` is the length of each error bar, here the √N of the last lesson, and `fmt="o"` draws round markers without a line between them.

## Labels and units

```
ax.set_xlabel("Dimuon mass [GeV]")
ax.set_ylabel("Events / 0.04 GeV")
ax.set_title("CMS Open Data, 2011")
```

Every axis gets a label, and every quantity with a unit shows it. The y label of a histogram states the bin width, because a count per bin means nothing without it: 50 bins from 2 to 4 GeV are each 0.04 GeV wide, and with wider bins every count would be higher.

## Logarithmic axes

When values span several powers of ten, as in a mass spectrum from 0.3 to 300 GeV, a linear axis squeezes most of the picture into one corner. A logarithmic axis gives each factor of ten the same length:

```
ax.set_xscale("log")
ax.set_yscale("log")
```

With a logarithmic x axis the bins should be logarithmic as well, or they look wider and wider towards the left: `bins = np.logspace(np.log10(0.3), np.log10(300), 301)`.

## Several panels

```
fig, (top, bottom) = plt.subplots(2, 1, sharex=True)
```

This gives two plotting areas, one above the other, with a shared x axis. A common use is the data and a fitted curve on top, and below it the pulls, (data − fit) / error, which show at a glance where the fit fails.

## Rules for a figure you will show to someone

- It comes out of a script, from the data file to the PNG, with no manual steps. Commit the script, not only the picture.
- Both axes are labelled, with units.
- Data points carry error bars.
- If there is more than one curve, there is a legend.
- The text is readable at the size the figure will be shown.
- Anything random uses a fixed seed, so that the figure is the same on every run.
--- practice
@predict
```
edges = [0, 2, 4, 6]
centres = [(a + b) / 2 for a, b in zip(edges[:-1], edges[1:])]
print(centres)
```
= [1.0, 3.0, 5.0]
! `edges[:-1]` is `[0, 2, 4]` and `edges[1:]` is `[2, 4, 6]`. `zip` pairs each left edge with its right edge. NumPy does the same without a loop.

@choice
You already have `counts` and `edges` from `np.histogram`. Which call draws that histogram?
- `ax.hist(counts)`
* `ax.stairs(counts, edges)`
- `ax.plot(edges)`
- `ax.histogram(counts, edges)`
! `ax.hist(counts)` would histogram the counts themselves: how many bins have a count between 0 and 10, and so on. `ax.stairs` draws values you have already computed.

@write
Write a script that makes 5,000 random values with `rng = np.random.default_rng(1)` and `x = rng.normal(91, 3, 5000)`, histograms them in 40 bins from 80 to 100, draws the counts as points with √N error bars, labels both axes (pretend the values are masses in GeV), saves the figure as `z.png`, and ends by printing `"bins:", len(counts), "events in range:", int(counts.sum())`.
min: 10
```solution
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)
x = rng.normal(91, 3, 5000)

counts, edges = np.histogram(x, bins=40, range=(80, 100))
centres = (edges[:-1] + edges[1:]) / 2

fig, ax = plt.subplots()
ax.errorbar(centres, counts, yerr=np.sqrt(counts), fmt="o", markersize=3, label="Toy data")
ax.set_xlabel("Mass [GeV]")
ax.set_ylabel("Events / 0.5 GeV")
ax.legend()
fig.savefig("z.png", dpi=150)

print("bins:", len(counts), "events in range:", int(counts.sum()))
```
! `rng.normal(91, 3, 5000)` draws 5,000 values from a Gaussian centred at 91 with a width of 3. The seed, 1, makes it the same 5,000 values every time.

@local
Run your script on your machine, open `z.png` and check it against the list of rules at the end of the lesson. Paste what the script printed.
min: 1
= bins: 40
! Nearly all 5,000 values fall between 80 and 100, because that range covers three widths on either side of the centre. The bell shape should peak near 91 with roughly 330 to 350 events in the highest bins.

@choice
The y axis of a histogram is labelled "Events / 0.5 GeV". Why does the label include the 0.5 GeV?
- It is the uncertainty of each bin
- It is the mass of the particle
* The count in a bin depends on the bin width, so without it the numbers can't be interpreted or compared with another plot
- matplotlib requires it
! Double the bin width and every count roughly doubles. The label is what makes the vertical scale meaningful.
--- recall
Q: After fig, ax = plt.subplots(), what are fig and ax?
A: fig is the whole figure, the image you save. ax is one plotting area with its axes, where you draw and set labels.
Q: How do you get the bin centres from the edges that np.histogram returns?
A: (edges[:-1] + edges[1:]) / 2: the average of each left edge and its right neighbour.
Q: Which call draws points with error bars?
A: ax.errorbar(x, y, yerr=errors, fmt="o").
Q: When is a logarithmic axis the right choice?
A: When the values span several powers of ten, so that small and large features are visible in the same picture.

=== c8 | cpp | 4 | ROOT macros and histograms | c10
## What ROOT is

ROOT is the data analysis framework developed at CERN and used by practically every LHC experiment. It is a large C++ library with three things you will meet immediately: **histograms**, a file format for storing billions of events (`.root` files), and **fitting** of functions to data. It also includes an interpreter that runs C++ line by line, so you can try things without compiling.

Install it with conda (`conda install -c conda-forge root`) or from [root.cern](https://root.cern/install/). Typing `root` in a terminal starts the interactive prompt. `.q` quits.

## Macros

A **macro** is a C++ file that ROOT runs directly. It needs no `main` and no `#include` lines for ROOT classes. By convention it contains one function with the same name as the file:

```
// file: gaus_hist.C
void gaus_hist() {
    TH1F* h = new TH1F("h", "Gaussian;x;Entries", 100, -5, 5);
    for (int i = 0; i < 10000; ++i) {
        h->Fill(gRandom->Gaus(0, 1));
    }
    h->Fit("gaus");
    h->Draw();
}
```

Run it with `root -l gaus_hist.C`. The `-l` skips the splash screen. Add `-q` to quit when it finishes, and `-b` to run without opening windows.

## Reading the macro

`TH1F` is ROOT's class for a **1**-dimensional **H**istogram whose bin contents are **F**loats. All ROOT classes start with `T`. `TH1D` stores doubles and `TH2F` is the 2-dimensional version.

The constructor takes five arguments:

- `"h"` is the object's **name**. ROOT keeps a global list of objects by name, so names must be unique.
- `"Gaussian;x;Entries"` is the title. Text after each semicolon labels the x axis and the y axis.
- `100` is the number of bins.
- `-5, 5` are the lower and upper edge of the range.

`new TH1F(...)` creates the histogram on the heap and gives back a pointer, which is why `h` has type `TH1F*` and its functions are called with `->`. In the last lesson you learned to avoid raw `new`. ROOT is the exception: it was designed before smart pointers and manages many objects itself. A histogram must also outlive the macro's function, otherwise it would vanish from the window as soon as the macro ended. Using `new` in macros is normal ROOT style.

`gRandom` is a global pointer to a random number generator. `gRandom->Gaus(0, 1)` returns a random number from a Gaussian (bell curve) distribution with mean 0 and width (sigma) 1. `Uniform(a, b)` and `Exp(tau)` are also available.

`h->Fill(x)` adds one entry: it finds the bin containing `x` and increases its content by one.

`h->Fit("gaus")` adjusts ROOT's built-in Gaussian function to match the histogram and prints the fitted mean and sigma with their uncertainties. `h->Draw()` opens a window, called a **canvas**, and draws.

## Bins, underflow and overflow

ROOT numbers bins from **1** to `nbins`. Bin 0 is the **underflow**: it counts every entry below the range. Bin `nbins + 1` is the **overflow**. So values outside the range aren't lost, they are counted separately.

```
h->GetEntries();           // total number of Fill calls
h->GetMean();  h->GetStdDev();
h->GetBinContent(50);      // content of bin 50
h->GetBinCenter(50);       // x value at the middle of bin 50
h->GetNbinsX();            // 100
```

## Saving a plot

```
TCanvas* c = new TCanvas("c", "c", 800, 600);
h->Draw();
c->SaveAs("gaus.png");
```

## Files and trees

A `TFile` is a ROOT file. A `TTree` is a table stored inside one: each row is an event, and each column, called a **branch**, is one variable.

```
void write_tree() {
    TFile f("events.root", "RECREATE");      // create or overwrite
    TTree t("events", "My events");
    double e;
    t.Branch("e", &e);                       // the branch reads from the variable e
    for (int i = 0; i < 1000; ++i) {
        e = gRandom->Exp(20.0);
        t.Fill();                            // store the current value of every branch
    }
    t.Write();
}
```

`t.Branch("e", &e)` hands the tree the **address** of `e`. Each `t.Fill()` then copies whatever `e` holds at that moment into a new row.

Reading goes the other way:

```
void read_tree() {
    TFile f("events.root");
    TTree* t = (TTree*)f.Get("events");
    double e;
    t->SetBranchAddress("e", &e);
    TH1F* h = new TH1F("h", ";E [GeV];Events", 50, 0, 100);
    for (Long64_t i = 0; i < t->GetEntries(); ++i) {
        t->GetEntry(i);                      // loads row i into e
        h->Fill(e);
    }
    h->Draw();
}
```

In Python, the `uproot` package reads the same files into NumPy arrays without installing ROOT.
--- practice
@choice
In `new TH1F("h", "Mass;m [GeV];Events", 60, 70, 110)`, how wide is each bin?
- 60 GeV
- 1.83 GeV
* About 0.67 GeV
- 40 GeV
! The range is 110 − 70 = 40 GeV, split into 60 bins: 40 / 60 ≈ 0.67.

@choice
A histogram is booked with 100 bins from −5 to 5. Where does `h->Fill(7.2)` go?
- Nowhere: the value is thrown away
- Bin 100
* The overflow bin, number 101
- Bin 0
! Values above the range are counted in bin `nbins + 1`. Bin 0 is the underflow, for values below the range.

@local
Save the `gaus_hist` macro from the lesson as `gaus_hist.C`, add a line `std::cout << "entries " << h->GetEntries() << std::endl;` before the fit, and run it with `root -l -b -q gaus_hist.C`. Paste everything it prints, including the fit result.
```
void gaus_hist() {
    TH1F* h = new TH1F("h", "Gaussian;x;Entries", 100, -5, 5);
    for (int i = 0; i < 10000; ++i) {
        h->Fill(gRandom->Gaus(0, 1));
    }
    std::cout << "entries " << h->GetEntries() << std::endl;
    h->Fit("gaus");
    h->Draw();
}
```
min: 4
= entries 10000
= Sigma
! The fit should report a mean close to 0 and a sigma close to 1, because that is what you generated.

@write
From memory, write a macro `expo_hist()` that books a `TH1F` named `"he"` with 50 bins from 0 to 100, fills it with 5000 numbers from `gRandom->Exp(20.0)`, and draws it.
min: 6
```solution
void expo_hist() {
    TH1F* h = new TH1F("he", "Exponential;x;Entries", 50, 0, 100);
    for (int i = 0; i < 5000; ++i) {
        h->Fill(gRandom->Exp(20.0));
    }
    h->Draw();
}
```
! The five constructor arguments in order: name, title, number of bins, low edge, high edge.

@choice
What does `t.Branch("e", &e)` do?
- It copies the current value of `e` into the tree once
* It tells the tree where the variable `e` lives, so every later `t.Fill()` stores whatever `e` holds at that moment
- It creates a new variable called `e`
- It reads the branch `e` from a file
! The tree keeps the address. That is why you set `e` and then call `Fill()` inside the loop.
--- recall
Q: What are the five arguments of the TH1F constructor?
A: Name, title (with ;x;y axis labels), number of bins, low edge, high edge.
Q: What are bin 0 and bin nbins+1 in a ROOT histogram?
A: The underflow and the overflow.
Q: How do you fit a histogram with a Gaussian in ROOT?
A: h->Fit("gaus");
Q: What are a TTree and a branch?
A: A TTree is a table of events stored in a ROOT file. Each branch is one column, one variable per event.

=== s3 | linux | 4 | Writing bash scripts | s3
## A script is commands in a file

When you find yourself typing the same commands again and again, put them in a file. A **script** is a text file of shell commands that run top to bottom, as if you had typed them.

```
#!/usr/bin/env bash
set -euo pipefail

src="$1"
out="${2:-a.out}"

g++ -std=c++17 -Wall -Wextra "$src" -o "$out"
./"$out"
```

Save that as `run.sh`. To run it, the file needs **execute permission**, which you give once:

```
chmod +x run.sh        # change mode: add (+) execute (x) permission
./run.sh sum.cpp       # run it, passing one argument
```

## The first line

`#!/usr/bin/env bash` is called the **shebang**. It tells the system which program should interpret the file: here, bash. It must be the very first line.

## Variables

```
name="muon"            # assign: NO spaces around the =
echo "$name"           # use: a dollar sign in front
echo "${name}s"        # braces mark where the name ends: prints muons
```

`name = "muon"` with spaces is an error: the shell would try to run a program called `name`.

Always write variables inside double quotes: `"$name"`. Unquoted, a value with a space in it splits into separate arguments. A file called `my data.txt` would become two arguments, `my` and `data.txt`. Double quotes keep it as one. Single quotes go further and switch off `$` altogether: `'$name'` is the literal text `$name`.

To capture the output of a command in a variable, wrap the command in `$( )`:

```
n=$(ls | wc -l)
echo "There are $n files"
```

## Arguments

Words after the script name are available inside it as numbered variables:

- `$1`, `$2`, … are the first, second, … argument
- `$#` is how many arguments were given
- `$@` is all of them
- `$0` is the script's own name

`${2:-a.out}` means "the second argument, or `a.out` if there isn't one". It is how you give an argument a default value.

## Exit codes

Every command reports a number when it finishes, its **exit code**. Zero means success and anything else means failure. This is the same number as the `return 0;` at the end of a C++ `main`. The variable `$?` holds the exit code of the command that just ran.

Two operators use it:

```
g++ sum.cpp -o sum && ./sum        # && : run the second only if the first succeeded
cd build || echo "no build dir"    # || : run the second only if the first failed
```

## Safety settings

By default a script carries on after a failing command. If the compile fails, the next line would happily run an old executable and you would be looking at stale results. `set -euo pipefail` changes three things:

- `-e`: stop the script as soon as any command fails
- `-u`: treat the use of an undefined variable as an error, which catches typos in names
- `-o pipefail`: a pipeline fails if any command in it fails, not only the last

Put it at the top of every script.

## Conditions

```
if [[ $# -lt 1 ]]; then
    echo "usage: $0 file.cpp"
    exit 1
fi

if [[ -f "$src" ]]; then
    echo "found $src"
else
    echo "no such file: $src"
fi
```

`[[ ... ]]` evaluates a test. The spaces just inside the brackets are required. The statement ends with `fi` ("if" backwards). `exit 1` stops the script and reports failure.

Common tests: `-f path` (a file exists), `-d path` (a directory exists), `-z "$s"` (the string is empty), `"$a" == "$b"` (strings are equal), and for numbers `-eq`, `-ne`, `-lt`, `-gt` (equal, not equal, less than, greater than).

## Loops

```
for f in *.cpp; do
    echo "compiling $f"
    g++ -std=c++17 "$f" -o "${f%.cpp}"
done
```

The loop runs once per matching file, with `f` set to each name in turn. `${f%.cpp}` is the value of `f` with `.cpp` removed from the end, so `sum.cpp` is compiled to `sum`.
--- practice
@predict
The script is run as `./args.sh alpha "beta gamma" delta`.
```
#!/usr/bin/env bash
echo "$# $2"
```
= 3 beta gamma
! The quotes on the command line make `beta gamma` a single argument, so there are three in total and the second contains a space.

@choice
What does `set -e` do in a script?
- It prints every command before running it
* It stops the script as soon as a command fails
- It makes all variables read-only
- It runs the script faster
! Without it, a script keeps going after errors and can act on stale or missing results.

@predict
`false` is a command that does nothing and fails. `true` does nothing and succeeds.
```
false && echo "A"
true && echo "B"
false || echo "C"
```
= B
= C
! `&&` continues only after success, so A is skipped. `||` continues only after failure, so C is printed.

@local
Write `count.sh`: it takes a directory as its first argument (defaulting to `.`), exits with a message and code 1 if that isn't a directory, and otherwise prints `N files` where N is the number of entries `ls` shows there. Start it with the shebang and `set -euo pipefail`. Then run these two commands and paste the output of both.
```
./count.sh /etc
./count.sh /no/such/place
```
min: 2
= files
! For the second call your own error message should appear. Test `[[ -d "$dir" ]]` before counting, and use `dir="${1:-.}"` for the default.

@write
From memory, write `run.sh`: it takes a `.cpp` file as its first argument, compiles it with C++17 and warnings into `a.out`, and runs it only if the compile succeeded. It must stop on any error.
min: 4
```solution
#!/usr/bin/env bash
set -euo pipefail

g++ -std=c++17 -Wall -Wextra -O2 "$1" -o a.out
./a.out
```
! With `set -e` the script stops at the compile line if it fails, so the last line can never run an old executable.
--- recall
Q: What does set -euo pipefail do?
A: -e exits on any error, -u makes unset variables an error, and -o pipefail makes a pipe fail if any command in it fails.
Q: Why write "$1" with quotes?
A: So a value with spaces or wildcards stays one argument.
Q: What does cmd1 && cmd2 do?
A: It runs cmd2 only if cmd1 exits with 0, which means success.
Q: What does an exit code of 0 mean, and where do you read the last one?
A: 0 means success. The variable $? holds the exit code of the last command.

=== ap2 | app | 4 | The motivation letter | 
## What it is for

openlab recommends a **motivation letter** and wants you to name your preferred area of work in it. The Summer Student call doesn't require one, but accepts any document you consider relevant, so the same letter, adapted, can go to both.

The CV is a list. The letter is the one place where you connect the items into a reason: why you, why this programme, why now. A selector should finish it knowing what you have done, what you want to work on, and that you have understood what the programme is.

Keep it to **one page**, around **300 to 400 words**. A longer letter doesn't get more attention. It gets skimmed.

## The one rule: every claim needs evidence

Compare two sentences.

"I am passionate about computing and a fast learner."

"When my histogram code took 40 seconds for 100,000 events, I learned NumPy vectorisation in a weekend and brought it down to under a second."

Anyone can write the first. Only you can write the second, and the reader concludes "fast learner" on their own, which is far more convincing than being told. Go through your draft and, for every adjective you apply to yourself, either put a fact behind it or delete it.

## A structure that works

**1. Opening, two or three sentences.** Who you are (degree, year, university) and what you are applying for. Start with that. Skip childhood stories and quotes: "Since I was a child I have been fascinated by the universe" is in every second letter.

**2. Evidence, the longest paragraph.** One or two concrete things you did that show you can do the work. For each: the project, the tools, a problem you ran into, and how you solved it. The problem is the important part, because it shows how you think. Link to the code.

**3. Fit.** The area you want to work in, for example machine learning for physics, cloud and containers, or high-performance computing, and how it connects to what you have done or want to learn. This is where you show you have read what openlab actually works on. Name something specific.

**4. What you bring and what you take away.** How you work, and what this summer means for your next step, such as a thesis topic or a master's direction.

**5. Close.** One line of thanks. No "I hope you will consider my humble application".

## An example evidence paragraph

```
To prepare, I reproduced the dimuon mass spectrum from CMS Open Data in
Python. My first version looped over 100,000 events and took 40 seconds;
rewriting it with NumPy arrays brought that under one second and taught me
why analysis code is written column by column. The result shows the J/psi,
Upsilon and Z peaks at the expected masses, and the code and plot are at
github.com/you/cern-prep.
```

It names a project, tools, a number, a problem and what was learned. Nothing in it is an adjective about the writer.

## Style

- Short sentences. If a sentence needs to be read twice, split it.
- Write it for this programme. A letter that could be sent to any company reads that way.
- Don't repeat your CV line by line. Pick the one or two best things and go deeper.
- Read it aloud once. Rewrite anything you stumble over.
- Ask one person to read it and tell you, without looking back, what they remember. That is what the selector will remember too.

## One letter, two versions

Write the core once. For openlab, the fit paragraph names a computing area. For the Summer Student call, it can talk about the experiment or computing fields you ticked. Everything else stays.
--- practice
@choice
Which is the best opening for the letter?
- Since I was a child, I have been fascinated by the mysteries of the universe.
- "The important thing is not to stop questioning." These words of Einstein have always inspired me.
* I am a third-year software engineering student at [university], applying for the CERN openlab Summer Student Programme 2027.
- To whom it may concern, I am writing this letter to express my deep interest.
! It tells the reader who you are and what you want in one sentence. The others spend the most-read lines of the letter on nothing.

@choice
Which sentence gives evidence instead of a claim?
- I am a highly motivated and hard-working student.
- I have excellent problem-solving skills.
* I found that my simulation spent 80% of its time copying vectors, and passing them by reference made it four times faster.
- I am passionate about high-performance computing.
! It describes something that happened, with numbers. The reader can work out the adjectives for themselves.

@write
Write your evidence paragraph about one real project: what it was, the tools, one problem you ran into, how you solved it, and where the code is. No adjectives about yourself.
min: 60
```solution
To prepare, I reproduced the dimuon mass spectrum from CMS Open Data in Python. My first version looped over 100,000 events and took 40 seconds; rewriting it with NumPy arrays brought that under one second and taught me why analysis code is written column by column. The result shows the J/psi, Upsilon and Z peaks at the expected masses, and the code and plot are at github.com/you/cern-prep.
```
! Check yours: is there a named project, at least one tool, a specific problem, what you did about it, and a link? Underline every adjective that describes you and replace it with a fact or cut it.

@write
Write your fit paragraph for openlab: name the area you want to work in and connect it to something you have done or are learning.
min: 40
```solution
I would most like to work on machine learning for physics data. After building the dimuon analysis I trained a first classifier with scikit-learn, and I want to learn how such models are trained and deployed at the scale of an LHC experiment. openlab's work on accelerating ML workloads with industry partners is where I would learn the most and where my C++ and Python background would be useful from the first week.
```
! A good fit paragraph names a specific area and gives a reason that comes from your own work. If yours could be sent unchanged to another organisation, make it more specific.

@choice
Your draft is 650 words. What do you do?
- Shrink the font and the margins so it fits on one page
- Leave it: more detail shows more motivation
* Cut it to about 350 words by keeping the one or two strongest pieces of evidence and deleting the general statements
- Split it into two letters
! The letter is read quickly. Length doesn't get you more attention, and the strongest material is easier to see when the rest is gone.
--- recall
Q: What goes in the longest paragraph of the motivation letter?
A: Concrete evidence: one or two projects, the tools, a problem you hit and how you solved it.
Q: How long should the letter be?
A: One page, roughly 300 to 400 words.
Q: What must the openlab letter name?
A: Your preferred area of work, and why it fits you.
Q: What is the one rule for every claim you make about yourself?
A: Back it with evidence, a concrete thing you did, or delete it.

=== x1 | exam | 4 | Checkpoint 1: Python, the shell and Git from memory | 75,9
This checkpoint answers one question: after four weeks, what can you write without looking anything up? It covers the Python lessons of weeks 1 to 4, the shell, bash scripts and Git.

There are twelve tasks. Five are Python functions that you write here and that are checked by running them. Two are done in your own terminal, and you paste what they print. Five are questions with one answer.

Before you start the clock: open a terminal in an empty folder, and check that `python3 --version` and `git --version` both work there. Then close everything else.

--- practice
@run
Write `initials(name)`. It returns the first letter of every word in upper case, each followed by a dot. Extra spaces between or around the words must not matter.
```starter
def initials(name):
    pass
```
```test
print(initials("ada lovelace"))
print(initials("  marie   sklodowska curie "))
print(initials("x"))
```
= A.L.
= M.S.C.
= X.
```solution
def initials(name):
    return "".join(word[0].upper() + "." for word in name.split())
```
! `split()` without an argument splits at any run of whitespace and ignores it at the ends. `join` glues the pieces together.

@run
Write `tally(words)`. It returns a dictionary that maps each word, in lower case, to the number of times it occurs. `Mu` and `mu` count as the same word.
```starter
def tally(words):
    pass
```
```test
print(sorted(tally(["Mu", "e", "mu", "E", "tau"]).items()))
print(tally([]))
```
= [('e', 2), ('mu', 2), ('tau', 1)]
= {}
```solution
def tally(words):
    counts = {}
    for word in words:
        key = word.lower()
        counts[key] = counts.get(key, 0) + 1
    return counts
```
! The counting pattern: `counts.get(key, 0) + 1` reads the old count, or 0 for a word seen for the first time.

@run
Write a class `Bin` for one bin of a histogram. `Bin(low, high)` stores the two edges and starts with a count of 0. `fill()` adds one to the count. `width()` returns high minus low. Printing a bin with edges 2.0 and 3.0 and a count of 2 must give `Bin(2.0, 3.0: 2)`, also when the bin is inside a list.
```starter
class Bin:
    pass
```
```test
b = Bin(2.0, 3.0)
b.fill()
b.fill()
print(b)
print(b.width())
print([Bin(0, 1)])
```
= Bin(2.0, 3.0: 2)
= 1.0
= [Bin(0, 1: 0)]
```solution
class Bin:
    def __init__(self, low, high):
        self.low = low
        self.high = high
        self.count = 0

    def fill(self):
        self.count += 1

    def width(self):
        return self.high - self.low

    def __repr__(self):
        return f"Bin({self.low}, {self.high}: {self.count})"
```
! Inside a list, Python shows each element with `__repr__`. A class that defines only `__str__` would fail the last line.

@run
Write a generator function `pairs(items)`. It yields every pair `(items[i], items[j])` with i smaller than j, as a tuple, in order of i and then j. Use `yield`.
```starter
def pairs(items):
    pass
```
```test
print(list(pairs(["a", "b", "c"])))
print(len(list(pairs(list(range(10))))))
print(next(pairs([1, 2, 3])))
print(list(pairs([])))
```
= [('a', 'b'), ('a', 'c'), ('b', 'c')]
= 45
= (1, 2)
= []
```solution
def pairs(items):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            yield items[i], items[j]
```
! Starting the inner loop at `i + 1` gives each pair once. This is the loop behind "every pair of muons in the event". The third line of the check calls `next`, which works only on a generator.

@run
Write `clean(values)`. It takes a list of strings and returns a tuple: the list of those that could be converted to `float`, in order, and the number of strings that could not.
```starter
def clean(values):
    pass
```
```test
print(clean(["1.5", "abc", "2", "", "-3e2"]))
print(clean([]))
```
= ([1.5, 2.0, -300.0], 2)
= ([], 0)
```solution
def clean(values):
    good = []
    bad = 0
    for text in values:
        try:
            good.append(float(text))
        except ValueError:
            bad += 1
    return good, bad
```
! `float` raises `ValueError` for text that isn't a number, the empty string included. Catching exactly that exception, and counting what you skip, is how real data is read.

@predict
```
import numpy as np

a = np.array([4, 12, 7, 20, 3, 17])
print(a[a > 6].sum(), (a > 6).sum())
```
= 56 4
! `a > 6` is a mask of True and False. Indexing with it keeps 12, 7, 20 and 17, which add up to 56. Summing the mask itself counts the True values: 4.

@predict
```
a = [1, 2, 3]
b = a
c = a[:]
b.append(4)
s = "invariant mass"
print(len(a), len(c), s[-4:], s.split()[0][:3])
```
= 4 3 mass inv
! `b` is a second name for the same list, so the append is visible through `a`. `c` is a copy made before the append. `s[-4:]` is the last four characters, and `s.split()[0][:3]` is the first three characters of the first word.

@predict
What does this pipeline print?
```
printf 'b\na\nb\nc\nb\n' | sort | uniq -c | sort -rn | head -n 1
```
= 3 b
! `sort` brings equal lines together, `uniq -c` collapses them with a count in front, `sort -rn` puts the largest count first, and `head -n 1` keeps that line.

@local
Write a bash script `count.sh`. It takes a directory as its first argument, with the current directory as the default. It prints the number of files ending in `.csv` in that directory and everything below it, in the form `3 csv files`. If the directory doesn't exist, it prints a message and exits with code 1. Then run these three commands and paste the output.
```
mkdir -p t/sub && touch t/a.csv t/b.csv t/c.txt t/sub/d.csv
./count.sh t
./count.sh nothere; echo "exit $?"
```
min: 3
= 3 csv files
= exit 1
```solution
#!/usr/bin/env bash
set -euo pipefail

dir="${1:-.}"
if [[ -d "$dir" ]]; then
    n=$(find "$dir" -name '*.csv' | wc -l)
    echo "$n csv files"
else
    echo "no such directory: $dir"
    exit 1
fi
```
! The pieces: a default for the argument with `${1:-.}`, a directory test with `[[ -d ... ]]`, `find` with a quoted pattern, `$( )` to capture a count, and `exit 1` for the failure. Don't forget `chmod +x count.sh`.

@choice
A commit that you pushed to the shared `main` branch yesterday turns out to be wrong. Others have already pulled it. How do you undo it?
- `git reset --hard HEAD~1`, followed by a forced push
* `git revert` with the commit's id, which adds a new commit that undoes the change
- `git restore .`
- Delete the repository and create it again
! History that others already have must not be rewritten. `git revert` leaves the old commit in place and records the undo as a new commit that everyone can pull.

@choice
You run `git add notes.txt`, then edit `notes.txt` again, then run `git commit -m "Update notes"`. What does the commit contain?
- The latest version of the file
* The version of the file as it was when you ran `git add`
- Both versions
- Nothing, because the file changed after it was staged
! `git add` copies the file's current state into the staging area, and a commit records the staging area. The later edit is still an unstaged change in your working folder.

@local
In a new, empty folder: create a repository and commit a file. Create a branch called `feature`, switch to it, and commit a change there. Switch back to the first branch and commit a change to a different file. Merge `feature` into it. Then paste the output of the command below.
```
git log --oneline --graph --all
```
min: 5
= Merge branch 'feature'
= |/
! Because both branches have a commit of their own, Git can't fast-forward and creates a merge commit with two parents. In the graph you see the two lines split and join again.

=== py7 | py | 5 | Four-vectors and invariant mass | p10,c13
## Units first

Particle physics measures energy in **electronvolts**. A GeV is a billion electronvolts, roughly the energy locked in the mass of one proton. Physicists set the speed of light to 1, which lets energy, momentum and mass all be given in GeV. That is why you will see "the Z boson has a mass of 91 GeV".

## What a detector gives you

For each particle in a collision, a detector measures its **energy** `E` and its **momentum**, which has a direction and so needs three numbers: `px`, `py` and `pz`. Together `(E, px, py, pz)` is called the particle's **four-vector** or four-momentum.

## Mass from energy and momentum

Einstein's relation connects the three quantities. With c = 1 it reads:

```
E² = p² + m²        where p² = px² + py² + pz²
```

Turned around, it gives the mass:

```
m² = E² − (px² + py² + pz²)
```

A particle at rest has no momentum, so `m = E`. A fast particle has large `E` and large `p`, but the difference of their squares always comes out as the same `m²`. That is the key property: the mass computed this way is the same for every observer, however fast the particle is moving. It is called the **invariant mass**.

## The mass of a pair

Here is the trick that makes discoveries possible. A heavy particle such as a Z boson lives far too briefly to be seen. It decays almost immediately, for example into a muon and an antimuon, and only those are detected.

Energy and momentum are conserved in the decay. So the sum of the two muons' four-vectors equals the four-vector the Z had:

```
E  = E1 + E2
px = px1 + px2      (and the same for py and pz)
m² = E² − (px² + py² + pz²)
```

Add first, then take the mass of the sum. The result is the mass of whatever the two muons came from.

A common mistake is to compute the two masses separately and add them. That gives twice the muon mass, about 0.2 GeV, and tells you nothing.

## Peaks

If you compute the pair mass for millions of events and make a histogram, pairs that came from a real particle pile up at that particle's mass and form a **peak**. Pairs that just happened to be in the same event have random masses and form a smooth background. The dimuon spectrum shows the J/ψ near 3.1 GeV, the Υ ("upsilon") near 9.5 GeV and the Z near 91 GeV. The Higgs boson was found the same way, as a small peak near 125 GeV.

## In code

```
import math

def inv_mass(p1, p2):
    E  = p1[0] + p2[0]
    px = p1[1] + p2[1]
    py = p1[2] + p2[2]
    pz = p1[3] + p2[3]
    m2 = E**2 - (px**2 + py**2 + pz**2)
    return math.sqrt(max(m2, 0.0))
```

`**` is the power operator, so `E**2` is E squared.

Why `max(m2, 0.0)`? Computers store decimals with limited precision. For a nearly massless particle, `E²` and `p²` are almost equal, and rounding can make the difference come out as something like `-0.0000001`. The square root of a negative number raises an error, so the code clamps it to zero.

A shorter way to add two tuples component by component uses `zip`, which pairs up the elements:

```
E, px, py, pz = (a + b for a, b in zip(p1, p2))
```

## What detectors really report

Experiments usually store `pt`, `eta` and `phi` instead of `px, py, pz`. `pt` is the momentum across the beam direction, `phi` is the angle around the beam, and `eta` (pseudorapidity) describes the angle away from the beam. They convert like this:

```
px = pt * cos(phi)      py = pt * sin(phi)      pz = pt * sinh(eta)
```
--- practice
@predict
A particle at rest has no momentum.
```
E, px, py, pz = 0.106, 0.0, 0.0, 0.0
print((E**2 - (px**2 + py**2 + pz**2)) ** 0.5)
```
= 0.106
! With no momentum, the mass equals the energy. This is a muon at rest.

@run
Write `mass(p)` for a single particle given as a tuple `(E, px, py, pz)`. Protect the square root against tiny negative values.
```starter
import math

def mass(p):
    pass
```
```test
print(mass((5.0, 3.0, 0.0, 4.0)))
print(mass((13.0, 0.0, 12.0, 0.0)))
print(mass((1.0, 1.0, 0.0, 0.0000001)))
```
= 0.0
= 5.0
= 0.0
```solution
import math

def mass(p):
    E, px, py, pz = p
    m2 = E**2 - (px**2 + py**2 + pz**2)
    return math.sqrt(max(m2, 0.0))
```
! In the first case E² = 25 and p² = 9 + 16 = 25, so the particle is massless. The third case would give a slightly negative m² without `max`.

@run
Write `inv_mass(p1, p2)`: add the two four-vectors, then take the mass of the sum. The test uses two muons flying in opposite directions with 45.6 GeV each, which is what a Z boson at rest produces.
```starter
import math

def inv_mass(p1, p2):
    pass
```
```test
mu1 = (45.6, 45.6, 0.0, 0.0)
mu2 = (45.6, -45.6, 0.0, 0.0)
print(round(inv_mass(mu1, mu2), 1))
print(round(inv_mass(mu1, mu1), 1))
```
= 91.2
= 0.0
```solution
import math

def inv_mass(p1, p2):
    E, px, py, pz = (a + b for a, b in zip(p1, p2))
    m2 = E**2 - (px**2 + py**2 + pz**2)
    return math.sqrt(max(m2, 0.0))
```
! Back to back, the momenta cancel and all 91.2 GeV of energy shows up as mass. Two particles flying the same way have no mass between them.

@choice
You compute the pair mass for a million dimuon events and histogram it. Why does a peak appear at 91 GeV?
- Because muons weigh 91 GeV
- Because the detector is tuned to that energy
* Because pairs that came from a Z decay always add up to the Z's mass, while unrelated pairs are spread out smoothly
- Because of rounding errors
! Conservation of energy and momentum means the pair's four-vector equals the parent's.

@run
Detectors give `pt`, `eta`, `phi`. Write `to_cartesian(pt, eta, phi)` returning `(px, py, pz)` using `math.cos`, `math.sin` and `math.sinh`.
```starter
import math

def to_cartesian(pt, eta, phi):
    pass
```
```test
px, py, pz = to_cartesian(10.0, 0.0, 0.0)
print(round(px, 3), round(py, 3), round(pz, 3))
px, py, pz = to_cartesian(2.0, 1.0, math.pi / 2)
print(round(px, 3), round(py, 3), round(pz, 3))
```
= 10.0 0.0 0.0
= 0.0 2.0 2.35
```solution
import math

def to_cartesian(pt, eta, phi):
    px = pt * math.cos(phi)
    py = pt * math.sin(phi)
    pz = pt * math.sinh(eta)
    return px, py, pz
```
! `eta = 0` means the particle flies straight out sideways, so `pz` is 0.
--- recall
Q: Write the invariant mass formula for a pair of particles.
A: m² = (E1+E2)² − |p1+p2|². Add the four-vectors first, then take E² − p².
Q: Roughly where are the J/ψ and Z peaks in the dimuon mass spectrum?
A: The J/ψ at about 3.1 GeV and the Z at about 91 GeV. The Υ sits near 9.5 GeV.
Q: Why take max(m2, 0) before the square root?
A: Floating-point rounding can make m² slightly negative for light particles.
Q: Why does the mass of a muon pair tell you about a particle nobody detected?
A: Energy and momentum are conserved in a decay, so the summed four-vector of the pair equals the parent's, and its mass is the parent's mass.

=== pj1 | proj | 5 | Project 1, part 1: the dimuon mass spectrum | 
## What you are going to build

You will reproduce one of the best-known plots in particle physics from real LHC data: the **dimuon invariant mass spectrum**. You take collisions in which the CMS detector saw two muons, compute the invariant mass of each pair, and histogram the results. Particles that decay into two muons appear as peaks at their mass. Everything from the lessons on four-vectors, NumPy and files comes together here.

This is the first of the projects for your CV. It shows you can get real data, process it with the standard tools, and explain what you found. Each exercise below is one step. Do them in order, in a new repository of its own (call it `dimuon-spectrum`), and commit after each one. Part 2 of this guide, next week, turns the plot into a measurement with fits, tests and continuous integration.

## Setup

```
pip install numpy pandas matplotlib
```

**pandas** is a library for tables of data. Its main type, the **DataFrame**, is a table with named columns, where each column behaves like a NumPy array.

## Step 1: get the data

CMS has published several educational datasets on the [CERN Open Data portal](https://opendata.cern.ch/) as CSV files: tables with one row per collision event, holding the energy and momentum components of two muons. Use [record 545](https://opendata.cern.ch/record/545), which has 100,000 events recorded in 2011. Download its file `Dimuon_DoubleMu.csv` (14 MB) from the record page, or from a terminal:

```
curl -L -O https://opendata.cern.ch/record/545/files/Dimuon_DoubleMu.csv
```

Keep the record's web address, because you will cite it in your README.

Don't commit the data file. Add its name to `.gitignore` and say in the README where to download it.

## Step 2: look before you compute

```
import pandas as pd

df = pd.read_csv("Dimuon_DoubleMu.csv")
print(df.shape)              # (number of rows, number of columns)
print(df.columns.tolist())   # the column names
print(df.head())             # the first five rows
```

Always look at what you loaded. Find the columns for the two muons. In these datasets they are typically named `E1, px1, py1, pz1` and `E2, px2, py2, pz2`, with charges `Q1` and `Q2`. If your file uses different names, adapt the code.

A column is selected with `df["E1"]` or `df.E1`.

## Step 3: compute the mass for every row at once

Don't write a loop over the rows. A Python loop over 100,000 rows takes seconds, and the vectorised version takes milliseconds. Columns add element by element, like NumPy arrays:

```
import numpy as np

E  = df.E1 + df.E2
px = df.px1 + df.px2
py = df.py1 + df.py2
pz = df.pz1 + df.pz2
m2 = E**2 - (px**2 + py**2 + pz**2)
df["mass"] = np.sqrt(np.maximum(m2, 0))
```

`np.maximum(m2, 0)` replaces any slightly negative value with 0, element by element, before the square root. The last line adds your result to the table as a new column.

The file already contains a mass column, `M`, computed by the people who published it. Compute your own anyway and compare: `(df.mass - df.M).abs().median()` should be around 0.0001 GeV. A check like this is what convinces a reader that your code is right.

The agreement isn't exact, and the reason is worth understanding. The file stores four decimals. For a pair with a very high energy and a very low mass, E² and p² are two enormous numbers that are almost equal, and subtracting them leaves only the last few digits, where the rounding lives. A handful of such pairs differ from `M` by 0.1 GeV or more. This loss of precision when subtracting nearly equal numbers has a name, **catastrophic cancellation**, and you will meet it again in every numerical field.

## Step 4: select opposite-charge pairs

A neutral particle decays to a muon and an antimuon. Pairs with the same charge can't come from such a decay, so they are background.

```
sel = df[df.Q1 != df.Q2]
print(len(df), len(sel))
```

`df.Q1 != df.Q2` is a mask, as in the NumPy lesson, and indexing with it keeps the rows where it is true.

In record 545 the two numbers are equal: whoever prepared the file already kept only opposite-charge pairs. Leave the selection in. It states an assumption of your analysis in code, and it will do real work on other files, such as the 2010 data in record 700, where about a third of the pairs have the same charge.

## Step 5: plot on logarithmic axes

The interesting masses range from below 1 GeV to about 100 GeV, and the event counts differ by factors of thousands. On ordinary axes you would see only the largest feature. **Logarithmic** axes give every factor of ten the same space, so everything is visible at once. The bins must be log-spaced too:

```
import matplotlib.pyplot as plt

bins = np.logspace(np.log10(0.3), np.log10(200), 300)
plt.hist(sel.mass, bins=bins, histtype="step")
plt.xscale("log")
plt.yscale("log")
plt.xlabel("Dimuon invariant mass [GeV]")
plt.ylabel("Events per bin")
plt.title("CMS Open Data dimuon spectrum")
plt.savefig("dimuon.png", dpi=150)
```

`np.logspace(a, b, n)` gives `n` numbers evenly spaced on a log scale from 10 to the power `a` up to 10 to the power `b`, which is why the limits are passed through `np.log10`. A plot without axis labels and units is not finished.

## Step 6: read the peaks

On your plot you should find some of these, depending on the dataset: the ρ and ω near 0.78 GeV, the φ at 1.02, the J/ψ at 3.10, the ψ(2S) at 3.69, the Υ family between 9.5 and 10.4, and the Z at 91.2 GeV. To locate a peak numerically, histogram a narrow window around it and find the bin with the most entries:

```
counts, edges = np.histogram(sel.mass, bins=100, range=(2.8, 3.4))
i = counts.argmax()
print((edges[i] + edges[i + 1]) / 2)
```

`argmax()` returns the position of the largest value.

## Step 7: write it up

A README with: one paragraph on what the project does, the data source with its link, the exact commands to run it, the plot, and two or three sentences on what you see. Then commit and push.
--- practice
@choice
Why is the invariant mass computed with whole columns (`df.E1 + df.E2`) instead of a `for` loop over the rows?
- Loops are not allowed in pandas
- The results would be different
* Column operations run in compiled code over all rows at once, which is hundreds of times faster than a Python loop
- It uses less disk space
! The same idea as NumPy vectorisation. For millions of events it is the difference between seconds and hours.

@local
Do steps 1 and 2. Paste the output of your script: the shape, the list of column names and the first rows.
min: 4
! If your dataset uses other column names, that is fine: make sure you have found the energy and three momentum components of both muons.

@local
Do steps 3 and 4. Print three numbers and paste the output: the number of rows before the charge selection, the number after, and the largest mass in the selected rows.
min: 1
! In record 545 every pair already has opposite charges, so both counts are 100000, and the largest mass is close to 299 GeV. If the largest mass is `nan`, there was a negative value under the square root: check the `np.maximum`.

@choice
Why does the plot use logarithmic axes and log-spaced bins?
- Because masses can't be negative
* The peaks span from under 1 GeV to 91 GeV and the counts vary by factors of thousands, so only a log scale shows them all in one picture
- Linear plots are not supported for histograms
- To hide the background
! On linear axes the low-mass region would be squeezed into the first few pixels.

@local
Do steps 5 and 6. Paste the positions of the peaks you found, in GeV, one per line with the particle's name, as printed by your own code or read from your plot.
min: 2
! Compare with the known values: J/ψ 3.10, Υ about 9.46, Z 91.2. Being off by more than a few percent means a mistake in the mass formula or the units.

@write
Write the first paragraph of your README: what the project does, what data it uses, and what the result shows. Aim for something a selector could read in 20 seconds.
min: 40
```solution
# Dimuon mass spectrum from CMS Open Data

This project computes the invariant mass of muon pairs in about 100,000 proton-proton collision events recorded by the CMS experiment and published on the CERN Open Data portal (record link below). Using pandas and NumPy, it selects opposite-charge pairs and histograms their mass on logarithmic axes. The resulting spectrum shows clear peaks from the J/psi, the Upsilon and the Z boson at 3.1, 9.5 and 91 GeV.
```
! A good opening names the data, the tools, and a concrete result.
--- recall
Q: Why keep only opposite-charge muon pairs?
A: A neutral parent decays into a muon and an antimuon, so same-charge pairs are background.
Q: Why use log-spaced bins and log axes for the dimuon plot?
A: The peaks span from below 1 GeV to 91 GeV and the counts vary hugely, so a log scale shows them all.
Q: How do you compute the mass for every event without a Python loop?
A: Add the columns as whole arrays and apply np.sqrt to E² − p² element by element.
Q: What should a project README contain?
A: What the project does, the data source with a link, the exact commands to run it, the result (plot), and what you learned.

=== ph6 | phys | 5 | Fitting a peak: least squares, χ² and uncertainties | p19
## From "there is a peak" to a measurement

Your dimuon plot shows a peak near 3.1 GeV. Reading "about 3.1" off the picture is not a measurement. A measurement is a number with an uncertainty, obtained by a method someone else can repeat. The method is a **fit**: you choose a mathematical curve with a few adjustable numbers, and let the computer find the values of those numbers that make the curve match the data best. Next week you will run fits with one line of SciPy. This lesson is about what that line does, so that you can tell a good fit from a meaningless one.

## The model

A resonance peak sitting on a smooth background is commonly described by a bell curve on top of a straight line:

```
f(x) = A · exp(−(x − μ)² / (2σ²)) + a + b·x
```

`exp` is e to the power of its argument. The first term is a **Gaussian**: A is its height, μ (mu) is the position of its centre, and σ (sigma) is its width. The rest, a + b·x, is a straight line for the background under the peak. The five numbers A, μ, σ, a and b are the **parameters**. For a mass peak, μ is the measured mass, and σ tells you how well the detector measures mass, its **resolution**.

## What "best" means: chi-square

For any choice of parameters, compare the curve with each data point. The measure of disagreement is **chi-square**, written χ²:

```
χ² = sum over all points of ((y − f(x)) / err)²
```

For each bin, y is the count, f(x) is the curve's value at the bin centre, and err is the bin's uncertainty, √y. The fraction (y − f(x)) / err asks: by how many error bars does the curve miss this point? It is called the **pull**. Squaring makes misses in both directions count, and dividing by the error makes precise points count more than vague ones.

The fit searches for the parameter values that make χ² as small as possible, which is why the method is called **least squares**.

## Is the fit any good?

The smallest χ² is itself informative. If the model is right and the error bars are right, each point misses by about one error bar, so each contributes about 1. More precisely, χ² should be close to the number of **degrees of freedom**:

```
ndf = number of points − number of fitted parameters
```

So look at χ²/ndf:

- Near 1: the curve describes the data as well as the uncertainties allow.
- Much larger than 1: the model has the wrong shape, or the error bars are too small.
- Much smaller than 1: the error bars are too large.

A fit program always returns numbers, even when the curve looks nothing like the data. χ²/ndf, together with a look at the plot, is how you find out whether those numbers mean anything.

## How the computer finds the minimum

The minimiser starts from **starting values** that you supply, computes χ², changes the parameters a little in the direction that lowers it, and repeats until nothing improves. It walks downhill until it reaches a valley floor. Two consequences follow. It finds the valley nearest to where it starts, and that may not be the deepest one. And from a hopeless start, such as a peak position far outside the plotted range, it can wander off or give up. Always read sensible starting values off your plot: the height and position of the peak, a rough width, the level of the background.

## Where the uncertainties come from

Near the minimum, χ² rises as a parameter moves away from its best value. If it rises steeply, the data pin that parameter down tightly. The uncertainty of a parameter is defined as the distance you can move it before χ² rises by 1.

Fit programs compute this from the curvature of χ² and return it as a **covariance matrix**, a table with one row and one column per parameter. The numbers on its diagonal are the squares of the parameters' uncertainties, so the uncertainties are the square roots of the diagonal.

One result is worth knowing by heart. For a peak of width σ containing N events, the uncertainty of its position is roughly

```
σ / √N
```

A J/ψ peak 0.03 GeV wide with 9,000 events is located to about 0.03 / √9000 ≈ 0.0003 GeV. The centre of a peak is known far more precisely than its width suggests.

## What the width means

Every unstable particle has a **natural width**, written Γ (Gamma): the shorter its lifetime, the less sharply its mass is defined. The J/ψ has a natural width of 0.00009 GeV. The peak in your data is about 0.03 GeV wide, 300 times more, so everything you see is detector resolution, and a Gaussian is a reasonable description.

The Z boson is different. Its natural width is 2.5 GeV, comparable to the resolution, and its true shape, called a Breit-Wigner, has longer tails than a Gaussian. On top of that, muons sometimes radiate a photon, which lowers the mass of the pair and adds a tail on the low side. A plain Gaussian fitted to the Z gives a poor χ² and a centre a few tenths of a GeV below the true mass. That is not a bug in your code. Recognising it, and saying so, is the difference between running a fit and understanding one.
--- practice
@predict
A fit uses 60 data points and has 5 free parameters. How many degrees of freedom does it have?
= 55
! Points minus parameters: 60 − 5. A good fit would then have a χ² somewhere around 55.

@run
Write `pulls(ys, errs, model)`: for each point, how many error bars the measured value `y` lies from the model value `m`, that is (y − m) / err. Return them as a list.
```starter
def pulls(ys, errs, model):
    pass
```
```test
p = pulls([10.0, 12.0, 9.0], [1.0, 2.0, 0.5], [11.0, 10.0, 9.0])
print(p)
print(sum(x * x for x in p))
```
= [-1.0, 1.0, 0.0]
= 2.0
```solution
def pulls(ys, errs, model):
    return [(y - m) / e for y, e, m in zip(ys, errs, model)]
```
! The second line of the check is χ²: the sum of the squared pulls. `zip` walks the three lists side by side.

@run
See what a minimiser does by doing its job with brute force. The height `A` and the width `sigma` are known. Try every centre from 2.90 to 3.30 in steps of 0.01, compute χ² for each, and return the centre with the smallest χ².
```starter
import math

def gauss(x, A, mu, sigma):
    return A * math.exp(-(x - mu) ** 2 / (2 * sigma ** 2))

def best_mu(xs, ys, errs, A, sigma):
    pass
```
```test
xs = [2.9, 3.0, 3.1, 3.2, 3.3]
ys = [14.0, 61.0, 100.0, 60.0, 13.0]
errs = [4.0, 8.0, 10.0, 8.0, 4.0]
print(best_mu(xs, ys, errs, 100.0, 0.1))
```
= 3.1
```solution
import math

def gauss(x, A, mu, sigma):
    return A * math.exp(-(x - mu) ** 2 / (2 * sigma ** 2))

def best_mu(xs, ys, errs, A, sigma):
    best, best_chi2 = None, None
    for i in range(41):
        mu = round(2.90 + 0.01 * i, 2)
        chi2 = sum(((y - gauss(x, A, mu, sigma)) / e) ** 2
                   for x, y, e in zip(xs, ys, errs))
        if best_chi2 is None or chi2 < best_chi2:
            best, best_chi2 = mu, chi2
    return best
```
! A real minimiser is smarter than trying every value: it follows the slope downhill, and it adjusts all parameters at once. The idea is the same. `round(..., 2)` removes the tiny floating-point noise from adding 0.01 many times.

@choice
A fit returns χ²/ndf = 12. What is the most likely explanation?
- The fit is excellent
* The model does not have the right shape for the data, or the error bars are too small
- The error bars are too large
- There are too few data points
! On average the points miss the curve by about three and a half error bars each, since √12 ≈ 3.5. Either the curve is the wrong shape or the errors are underestimated.

@predict
A peak has a width of σ = 0.03 GeV and contains 10,000 events. Roughly what is the statistical uncertainty of its position, in GeV?
= 0.0003
=| 3e-4
=| 0.0003 GeV
=| .0003
! σ / √N = 0.03 / 100. The more events in the peak, the better its centre is known.

@choice
The J/ψ has a natural width of 0.00009 GeV. Why is the peak in CMS data about 0.03 GeV wide?
- The particle is heavier in the detector
- The bins of the histogram are too narrow
* The detector measures each muon's momentum with a limited precision, and that smears the reconstructed mass
- Background events make the peak wider
! The width you see is the detector's resolution, about 1% of the mass here. For the Z, the natural width of 2.5 GeV matters as well.
--- recall
Q: What does a least-squares fit minimise?
A: χ²: the sum over all points of ((data − model) / uncertainty)².
Q: What χ² do you expect from a good fit?
A: About the number of degrees of freedom, which is the number of points minus the number of fitted parameters. So χ²/ndf is near 1.
Q: Where do the uncertainties of fitted parameters come from?
A: From how steeply χ² rises around its minimum. The fit returns a covariance matrix, and the square roots of its diagonal are the uncertainties.
Q: How precisely can you locate a peak of width σ that contains N events?
A: To about σ/√N, far better than the width itself.

=== c9 | cpp | 5 | Templates | c11
## The problem templates solve

Say you write a function that returns the largest element of a `std::vector<int>`. Tomorrow you need the same for `double`, then for `std::string`. The code is identical each time. Only the type changes. Copying it three times means three places to fix every bug.

A **template** lets you write the code once with the type left open:

```
#include <vector>

template <typename T>
T max_of(const std::vector<T>& v) {
    T best = v.front();
    for (const T& x : v) {
        if (best < x) best = x;
    }
    return best;
}
```

`template <typename T>` announces that what follows is a pattern, and that `T` stands for "some type, to be filled in later". Inside, `T` is used like any type name.

## How it is used

```
std::vector<int> a = {3, 9, 2};
std::vector<std::string> b = {"mu", "tau", "e"};

max_of(a);      // T is int
max_of(b);      // T is std::string: compares alphabetically, gives "tau"
```

You don't have to say what `T` is. The compiler looks at the argument, sees a `std::vector<int>`, and concludes that `T` must be `int`. This is **template argument deduction**. You can also say it explicitly: `max_of<double>(v)`.

For each different `T` you use, the compiler generates a separate, complete function, as if you had written it by hand. This is called **instantiation**. It happens at compile time, so templates cost nothing at run time. This is different from Python, where one function handles any type by checking as it runs.

## What T must be able to do

The template never says what `T` has to support. The requirements are implied by the code: `max_of` copies a `T` (`T best = ...`) and compares two with `<`. Any type that can do both will work.

If you call it with a type that has no `<`, the compiler fails while generating that version, and the error message points deep inside the template. When a template error looks enormous, scroll to the first line that mentions your own code: that is where the offending call is.

To make your own type work, give it the operator:

```
struct Track {
    double pt;
    bool operator<(const Track& o) const { return pt < o.pt; }
};
```

`operator<` is a member function with a special name. Defining it gives `a < b` a meaning for two `Track` objects. This is **operator overloading**, the same mechanism that lets `<<` print things.

## Class templates

Classes can be templates too. That is exactly what `std::vector<T>` and `std::map<K, V>` are.

```
template <typename T>
class Stack {
public:
    void push(const T& x) { data_.push_back(x); }
    T pop() {
        T x = data_.back();
        data_.pop_back();
        return x;
    }
    bool empty() const { return data_.empty(); }
private:
    std::vector<T> data_;
};

Stack<int> s;            // for a class you must name the type
s.push(4);
```

A stack is a pile: the last item pushed is the first one popped.

A template can have several parameters, and they can be values as well as types: `template <typename K, typename V>`, or `std::array<double, 3>` where 3 is the size.

## Templates live in headers

The compiler can only generate a version of a template where it can see the template's full code. So template functions and classes are written entirely in header files, bodies included. This is the one case where you don't split declaration and definition between `.h` and `.cpp`.
--- practice
@predict
```
#include <iostream>
#include <string>
#include <vector>

template <typename T>
T max_of(const std::vector<T>& v) {
    T best = v.front();
    for (const T& x : v) {
        if (best < x) best = x;
    }
    return best;
}

int main() {
    std::vector<int> a = {3, 9, 2};
    std::vector<std::string> b = {"mu", "tau", "e"};
    std::cout << max_of(a) << ' ' << max_of(b) << '\n';
}
```
= 9 tau
! The same template is instantiated twice: once with `T = int` and once with `T = std::string`, which compares alphabetically.

@choice
When does the compiler produce actual machine code for a function template?
- When it reads the template definition
* Each time the template is used with a new type: one version per type
- While the program is running
- Never; templates are interpreted
! Instantiation happens at compile time, per type. That is why the full template code must be visible, so it lives in headers.

@predict
A stack gives back the most recent item first.
```
#include <iostream>
#include <vector>

template <typename T>
class Stack {
public:
    void push(const T& x) { data_.push_back(x); }
    T pop() { T x = data_.back(); data_.pop_back(); return x; }
    bool empty() const { return data_.empty(); }
private:
    std::vector<T> data_;
};

int main() {
    Stack<char> s;
    for (char c : {'C', 'E', 'R', 'N'}) s.push(c);
    while (!s.empty()) std::cout << s.pop();
    std::cout << '\n';
}
```
= NREC
! `!` means "not". The letters come back out in reverse order.

@local
Write `pair_max.cpp`: a function template `template <typename T> T larger(const T& a, const T& b)` that returns the larger of two values using `<`. In `main`, print `larger(3, 8)`, `larger(2.5, 1.5)` and `larger(std::string("jet"), std::string("muon"))` separated by spaces. Paste the output.
= 8 2.5 muon
! One template, three instantiations. Try `larger(3, 2.5)` afterwards and read the error: the compiler can't decide whether `T` is `int` or `double`.

@write
From memory, write a function template `contains` that takes `const std::vector<T>&` and a `const T&`, and returns `true` if the value is in the vector. Use a range-for and `==`.
min: 6
```solution
#include <vector>

template <typename T>
bool contains(const std::vector<T>& v, const T& value) {
    for (const T& x : v) {
        if (x == value) return true;
    }
    return false;
}
```
! This template requires only that `T` supports `==`.
--- recall
Q: When does the compiler generate code for a template?
A: When the template is used with a specific type. It makes one version per type.
Q: What does max_of<T> require of T?
A: Only what it uses: T must be copyable and support operator<.
Q: Why is template code usually written in headers?
A: The compiler needs the full definition wherever the template is used.
Q: What does defining operator< in your struct do?
A: It gives a < b a meaning for your type, so templates and algorithms that compare with < can use it.

=== py8 | py | 5 | Decorators and context managers | p11,p13,p32
## Functions are values

In Python a function is a value like any other. You can store it in a variable, pass it to another function, and return it from a function.

```
def shout(text):
    return text.upper()

f = shout          # no brackets: this is the function itself, not a call
f("hi")            # 'HI'
```

`shout` is the function. `shout("hi")` calls it. That difference is the whole basis of this lesson.

## A function that wraps another

Suppose you want to print a message every time some function is called, without editing that function. You can write a function that takes the original and returns a new one that does the extra work and then calls the original:

```
def logged(fn):
    def wrapper(*args, **kwargs):
        print("calling", fn.__name__)
        result = fn(*args, **kwargs)
        return result
    return wrapper
```

Three things are new here:

- A function is defined **inside** another. `wrapper` can use `fn` from the enclosing function, even after `logged` has returned. A function that remembers variables this way is called a **closure**.
- `*args` collects any positional arguments into a tuple, and `**kwargs` collects any keyword arguments into a dict. Writing `fn(*args, **kwargs)` passes them all on unchanged. This lets `wrapper` work for functions with any parameters.
- `logged` returns `wrapper` without calling it.

Use it like this:

```
def add(a, b):
    return a + b

add = logged(add)     # replace add with the wrapped version
add(2, 3)             # prints "calling add", returns 5
```

## The @ syntax

Replacing a function with a wrapped version of itself is so common that Python has a shorthand. These two are exactly the same:

```
@logged
def add(a, b):
    return a + b
```

```
def add(a, b):
    return a + b
add = logged(add)
```

A function used this way is called a **decorator**. You have already met one: `@dataclass`.

Two mistakes to avoid: forgetting `return result` in the wrapper (the decorated function then always returns `None`), and forgetting `return wrapper` at the end.

After decoration, `add` is really `wrapper`, so `add.__name__` would say `"wrapper"`. Put `@functools.wraps(fn)` on the line above `def wrapper` to copy the original name and documentation across:

```
import time
from functools import wraps

def timed(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        result = fn(*args, **kwargs)
        print(f"{fn.__name__} took {time.perf_counter() - t0:.4f}s")
        return result
    return wrapper
```

`time.perf_counter()` returns a precise clock reading in seconds. The difference of two readings is the elapsed time. `:.4f` in the f-string formats the number with 4 decimals.

## Decorators with arguments

Sometimes the decorator itself needs a setting, as in `@repeat(3)`. Then `repeat(3)` runs first and must **return a decorator**. That makes three levels of functions:

```
def repeat(times):                 # takes the setting
    def decorator(fn):             # takes the function, as before
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(times):
                result = fn(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def ping():
    print("ping")

ping()        # prints ping three times
```

Read `@repeat(3)` in two steps: `repeat(3)` returns `decorator`, and `decorator` is then applied to `ping`. The name `_` is the usual name for a loop variable that is never used.

## Context managers

A **context manager** is an object that runs some code when a `with` block starts and some code when it ends, **even if an error happens inside**. Files are the usual example: the block ends, the file is closed.

You can write your own with two special methods:

```
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self                  # this becomes the name after "as"

    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.start
        return False                 # False: let any exception continue

with Timer() as t:
    do_work()
print(t.elapsed)
```

The order is: `Timer()` builds the object, `__enter__` runs and its return value is bound to `t`, the block runs, then `__exit__` runs. The three extra parameters of `__exit__` describe the exception if one happened, and are all `None` otherwise. Returning `True` would swallow the exception, which is rarely what you want.

Typical uses are anything that comes in pairs: open and close, lock and unlock, start a timer and stop it.
--- practice
@predict
Decoration happens when the function is defined. The wrapper runs when it is called.
```
def deco(fn):
    print("A")
    def wrapper():
        print("B")
        fn()
    return wrapper

@deco
def hello():
    print("C")

print("D")
hello()
```
= A
= D
= B
= C
! `@deco` calls `deco(hello)` straight away, which prints A. Calling `hello()` later runs the wrapper: B, then the original prints C.

@run
Write a decorator `double` that makes a function return twice its normal result.
```starter
def double(fn):
    pass
```
```test
@double
def add(a, b):
    return a + b

@double
def word():
    return "ab"

print(add(2, 3), word())
```
= 10 abab
```solution
def double(fn):
    def wrapper(*args, **kwargs):
        return 2 * fn(*args, **kwargs)
    return wrapper
```
! `*args, **kwargs` let the same wrapper serve a function with two parameters and one with none.

@run
Write a decorator `count_calls` that counts how often the function is called. Store the count on the wrapper as an attribute named `calls` (functions can have attributes: `wrapper.calls = 0`).
```starter
def count_calls(fn):
    pass
```
```test
@count_calls
def ping():
    return "pong"

ping(); ping()
print(ping(), ping.calls)
```
= pong 3
```solution
def count_calls(fn):
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return fn(*args, **kwargs)
    wrapper.calls = 0
    return wrapper
```
! The name `ping` refers to the wrapper after decoration, so `ping.calls` is the wrapper's counter.

@run
Write a context manager class `Section` that takes a name. It prints `start NAME` when the block begins and `end NAME` when it ends, and lets exceptions through.
```starter
class Section:
    def __init__(self, name):
        self.name = name
```
```test
with Section("fit") as s:
    print("working", s.name)
try:
    with Section("bad"):
        raise ValueError("oops")
except ValueError:
    print("caught")
```
= start fit
= working fit
= end fit
= start bad
= end bad
= caught
```solution
class Section:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print("start", self.name)
        return self

    def __exit__(self, exc_type, exc, tb):
        print("end", self.name)
        return False
```
! `end bad` is printed even though the block raised, and returning `False` lets the error reach the `except`.

@write
From memory, write the `timed` decorator: it prints how long the function took and returns its result. Use `functools.wraps` and `time.perf_counter`.
min: 8
```solution
import time
from functools import wraps

def timed(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        result = fn(*args, **kwargs)
        print(f"{fn.__name__} took {time.perf_counter() - t0:.4f}s")
        return result
    return wrapper
```
! Check three things in yours: the wrapper passes all arguments on, it returns the result, and the decorator returns the wrapper.

@run
Write `scale(factor)`, a decorator with an argument: the decorated function's return value is multiplied by `factor`.
```starter
def scale(factor):
    pass
```
```test
@scale(10)
def add(a, b):
    return a + b

@scale(0.5)
def one():
    return 1

print(add(1, 2), one())
```
= 30 0.5
```solution
def scale(factor):
    def decorator(fn):
        def wrapper(*args, **kwargs):
            return fn(*args, **kwargs) * factor
        return wrapper
    return decorator
```
! `scale(10)` returns `decorator`, which receives `add` and returns `wrapper`. From then on the name `add` refers to `wrapper`.
--- recall
Q: What does @timed above def f(...) do?
A: It rebinds f = timed(f), replacing f with the wrapper the decorator returns.
Q: Why use functools.wraps in a decorator?
A: To keep the original function's name and docstring on the wrapper.
Q: What does __enter__ return, and where does it go?
A: Whatever it returns is bound to the name after "as" in the with statement.
Q: What do *args and **kwargs do in a wrapper?
A: They collect all positional and keyword arguments so the wrapper can pass them on to any function unchanged.
Q: A decorator with an argument, like @repeat(3), needs three nested functions. What does each one receive?
A: The outer one receives the argument, the middle one receives the function, and the inner wrapper receives the arguments of each call.

=== py9 | py | 5 | Binary search and complexity | p12,p30,p31
## How fast is fast?

Two programs can both be correct while one takes a second and the other takes a day. **Complexity** describes how the number of steps grows as the input grows. We write it with **big-O notation**, where `n` is the size of the input.

- **O(1)**, constant: the same number of steps whatever the size. Looking up a key in a dict, or reading `xs[5]`.
- **O(log n)**, logarithmic: each step throws away half of what is left. Binary search.
- **O(n)**, linear: look at every element once. A single loop, `sum(xs)`, `x in some_list`.
- **O(n log n)**: sorting.
- **O(n²)**, quadratic: for every element, look at every element. A loop inside a loop.

Big-O ignores constant factors and small terms, because for large inputs only the growth matters. For a million elements, O(n) is about a million steps, O(n²) is a million million, and O(log n) is about 20.

`log n` here means "how many times can you halve n before reaching 1". A million halves to 1 in about 20 steps, a billion in about 30.

## Linear search

To find a value in an unsorted list, you have no choice but to check each element:

```
def linear_search(xs, target):
    for i, x in enumerate(xs):
        if x == target:
            return i
    return -1
```

This is what `target in xs` and `xs.index(target)` do. Returning `-1` is a common way to say "not found", since it is never a valid position.

## Binary search

If the list is **sorted**, you can do far better. Look at the middle element. If it is the target, you are done. If it is too small, the target can only be in the right half. If it is too big, only in the left half. Either way, half the list is gone after one comparison.

```
def binary_search(xs, target):
    lo, hi = 0, len(xs) - 1          # the range still worth searching, both ends included
    while lo <= hi:                  # while that range is not empty
        mid = (lo + hi) // 2         # middle index, rounded down
        if xs[mid] == target:
            return mid
        if xs[mid] < target:
            lo = mid + 1             # target is right of mid
        else:
            hi = mid - 1             # target is left of mid
    return -1
```

`//` is integer division: `7 // 2` is 3. An index must be a whole number.

Trace it for `xs = [2, 5, 8, 12, 16, 23, 38]` and `target = 23`:

- `lo=0, hi=6`, `mid=3`, `xs[3]=12` is too small, so `lo=4`
- `lo=4, hi=6`, `mid=5`, `xs[5]=23` is the target: return 5

Two comparisons instead of six.

## The bugs everyone writes

Binary search is famous for off-by-one mistakes. Each line of the version above is chosen to match the others:

- `hi = len(xs) - 1` goes with `while lo <= hi`. The range includes both ends, so it is empty only when `lo > hi`. Writing `lo < hi` would skip the last remaining element.
- `lo = mid + 1` and `hi = mid - 1` exclude `mid`, which has already been checked. Writing `lo = mid` can leave the range unchanged, and the loop never ends.

Whenever you write one, test it on an empty list, a list of one element, the first element, the last element, and a value that isn't there.

## In practice

Python has this built in: `bisect.bisect_left(xs, x)` returns the first position where `x` could be inserted to keep `xs` sorted. Interviewers still ask you to write it by hand, because it shows whether you can reason about a loop precisely.

A related everyday trick: `x in some_list` is O(n), but `x in some_set` is O(1). If you test membership many times, convert the list to a set once first.

## Two more patterns: two pointers and a stack

Many interview problems come down to one of a few patterns. Two are worth knowing by name.

**Two pointers.** Keep one index into each of two sorted lists and always advance the one that points at the smaller value. Merging two sorted lists this way takes a single pass, O(n), where sorting the combined list would cost O(n log n):

```
def merge(a, b):
    out = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    out.extend(a[i:])        # whatever is left of a
    out.extend(b[j:])        # whatever is left of b
    return out
```

`i = j = 0` sets both variables to 0, and `out.extend(xs)` appends every element of `xs`.

**A stack** is a pile: you add to the top and take from the top, so the last item in is the first one out. A Python list is a stack as long as you only use `append` (put on top) and `pop()` (remove and return the top). Stacks fit anything nested, such as matching brackets: push each opening bracket, and when a closing bracket arrives, the one on top of the stack must be its partner.
--- practice
@choice
A sorted list has 1,000,000 elements. About how many elements does binary search look at in the worst case?
- 1,000,000
- 500,000
- 1,000
* 20
! Each step halves the range, and a million can be halved about 20 times.

@predict
How many times does the loop body run? The code counts for you.
```
xs = [2, 5, 8, 12, 16, 23, 38]
target = 5
lo, hi, steps = 0, len(xs) - 1, 0
while lo <= hi:
    steps += 1
    mid = (lo + hi) // 2
    if xs[mid] == target:
        break
    if xs[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
print(steps, mid)
```
= 2 1
! First `mid=3` (12, too big, so `hi=2`), then `mid=1`, which holds 5.

@run
Write `contains(xs, target)` for a **sorted** list, using binary search. Return `True` or `False`. Don't use `in`.
```starter
def contains(xs, target):
    pass
```
```test
xs = [1, 4, 4, 9, 15, 22]
print(contains(xs, 1), contains(xs, 22), contains(xs, 9))
print(contains(xs, 5), contains(xs, 100), contains([], 3), contains([7], 7))
```
= True True True
= False False False True
```solution
def contains(xs, target):
    lo, hi = 0, len(xs) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if xs[mid] == target:
            return True
        if xs[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False
```
! The tests cover the first and last element, a missing value, an empty list and a single element. Those are the cases where off-by-one bugs show up.

@run
Write `first_at_least(xs, x)`: the index of the first element of sorted `xs` that is greater than or equal to `x`, or `len(xs)` if there is none. This is what `bisect_left` does. Hint: keep a range `lo` to `hi` where `hi` starts at `len(xs)` and loop while `lo < hi`.
```starter
def first_at_least(xs, x):
    pass
```
```test
xs = [10, 20, 20, 30]
print(first_at_least(xs, 20), first_at_least(xs, 25), first_at_least(xs, 5), first_at_least(xs, 99))
```
= 1 3 0 4
```solution
def first_at_least(xs, x):
    lo, hi = 0, len(xs)
    while lo < hi:
        mid = (lo + hi) // 2
        if xs[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo
```
! Here `hi` is excluded from the range, so the loop condition is `lo < hi` and the "too big" branch uses `hi = mid`. The pieces have to match each other.

@choice
You need to check 100,000 times whether an ID is in a collection of 1,000,000 IDs. Which is the best choice?
- Keep them in a list and use `in`
* Put them in a set once and use `in`
- Sort the list every time, then use binary search
- Use nested loops
! A set lookup is O(1). The list would need up to a million comparisons per lookup.

@run
Write `common(a, b)` for two sorted lists without duplicates. Return the sorted list of the values that appear in both, using one index into each list and a single pass. Don't use `in`, sets or sorting.
```starter
def common(a, b):
    pass
```
```test
print(common([1, 3, 5, 7], [3, 4, 5, 8]))
print(common([], [1]))
print(common([2, 9], [2, 9]))
```
= [3, 5]
= []
= [2, 9]
```solution
def common(a, b):
    out = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            out.append(a[i])
            i += 1
            j += 1
        elif a[i] < b[j]:
            i += 1
        else:
            j += 1
    return out
```
! Whichever index points at the smaller value can't have a partner any more, so it moves on. Equal values are a match, and both indices move.
--- recall
Q: What is the time complexity of binary search, and why?
A: O(log n), because each step halves the remaining range.
Q: In binary search, why lo = mid + 1 and not lo = mid?
A: mid has already been checked, and lo = mid can stop the range shrinking so the loop never ends.
Q: How fast is x in list compared with x in set?
A: O(n) for a list and O(1) on average for a set.
Q: What must be true of the list before you can use binary search?
A: It must be sorted.
Q: How do you merge two sorted lists in one pass?
A: Keep an index into each list, repeatedly append the smaller of the two current values and advance that index, then append whatever is left.

=== c10 | cpp | 5 | Owning resources: the rule of three and five | c12
## Who cleans up?

A **resource** is anything that must be given back when you are done: memory from `new`, an open file, a network connection, a lock. C++'s central idea for managing resources is that an object should acquire a resource in its constructor and release it in its **destructor**. The destructor runs automatically when the object goes out of scope, so the release can't be forgotten, not even when an error occurs. This idea has the unhelpful name **RAII** ("resource acquisition is initialisation"). `std::vector`, `std::string`, `std::ifstream` and `std::unique_ptr` all work this way, which is why you never clean up after them.

This lesson is about what happens when you write such a class yourself.

## A class that owns memory

```
class Buffer {
public:
    explicit Buffer(std::size_t n) : n_(n), data_(new double[n]()) {}
    ~Buffer() { delete[] data_; }
private:
    std::size_t n_;
    double* data_;
};
```

`new double[n]()` allocates an array of `n` doubles on the heap, set to zero, and returns a pointer to the first. `~Buffer()` is the destructor. An array made with `new[]` must be released with `delete[]`, with the brackets.

## The copy problem

This class looks complete and has a serious bug.

```
Buffer a(100);
Buffer b = a;      // copy
```

If you don't write a copy operation, the compiler generates one that copies each member. Here that copies the **pointer**, not the array. Now `a.data_` and `b.data_` hold the same address. When both objects are destroyed, the same array is deleted twice, which crashes or corrupts memory. Before that, writing through `b` changes `a`.

This member-by-member copy is called a **shallow copy**. What you need is a **deep copy**: a new array with the same contents.

## The rule of three

If a class needs a custom destructor, it almost certainly needs custom versions of the two copy operations too. That is the **rule of three**: destructor, copy constructor, copy assignment operator. Write all three or none.

The **copy constructor** builds a new object from an existing one (`Buffer b = a;`):

```
Buffer(const Buffer& other) : n_(other.n_), data_(new double[other.n_]) {
    std::copy(other.data_, other.data_ + n_, data_);
}
```

`std::copy(first, last, destination)` copies a range of elements. Adding a number to a pointer moves it along the array, so `other.data_ + n_` marks one past the last element.

The **copy assignment operator** overwrites an object that already exists (`b = a;`):

```
Buffer& operator=(const Buffer& other) {
    if (this == &other) return *this;          // a = a: nothing to do
    double* fresh = new double[other.n_];      // 1. get the new memory first
    std::copy(other.data_, other.data_ + other.n_, fresh);
    delete[] data_;                            // 2. only then free the old
    data_ = fresh;
    n_ = other.n_;
    return *this;
}
```

`this` is a pointer to the object the function was called on (like Python's `self`), so `*this` is the object itself. Returning it allows `a = b = c`.

Two details matter. The first line guards against assigning an object to itself. Without it you would delete your own data and then try to copy from it. And the new memory is allocated **before** the old is deleted, so that if `new` fails, the object still holds its old, valid data.

## The rule of five: moving

Copying a big buffer is expensive, and often the source is about to be destroyed anyway, for example when returning from a function. C++11 added **move** operations, which steal the resource instead of copying it:

```
Buffer(Buffer&& other) noexcept : n_(other.n_), data_(other.data_) {
    other.n_ = 0;
    other.data_ = nullptr;        // the source no longer owns anything
}
```

`Buffer&&` is an **rvalue reference**: it binds to objects that are temporary or that the caller has explicitly given up with `std::move`. The move constructor takes the pointer and leaves the other object empty, so its destructor deletes nothing. `noexcept` promises it can't fail, which lets containers such as `std::vector` use it.

With the matching move assignment operator, that makes five special functions: the **rule of five**.

## The rule of zero

The best version of this class writes none of them:

```
class Buffer {
public:
    explicit Buffer(std::size_t n) : data_(n, 0.0) {}
private:
    std::vector<double> data_;
};
```

`std::vector` already implements all five correctly, and the compiler-generated versions for `Buffer` simply use them. This is the **rule of zero**: build your classes out of members that manage themselves, and you rarely need to write a destructor at all. You still need to understand the rule of three, because interviewers ask about it and because older code is full of it.
--- practice
@choice
A class has a raw pointer member, a constructor that calls `new`, and a destructor that calls `delete`, but no copy operations. What happens after `Buffer b = a;`?
- The compiler refuses to compile it
- `b` gets its own copy of the data
* Both objects point to the same memory, which is then deleted twice when they are destroyed
- `a` becomes empty
! The generated copy is shallow: it copies the pointer, not what it points to.

@predict
This class uses `std::vector`, so the generated copy is a deep copy.
```
#include <iostream>
#include <vector>

class Buffer {
public:
    explicit Buffer(std::size_t n) : data_(n, 0.0) {}
    void set(std::size_t i, double x) { data_.at(i) = x; }
    double get(std::size_t i) const { return data_.at(i); }
private:
    std::vector<double> data_;
};

int main() {
    Buffer a(3);
    a.set(0, 1.5);
    Buffer b = a;
    b.set(0, 9.0);
    std::cout << a.get(0) << ' ' << b.get(0) << '\n';
}
```
= 1.5 9
! The vector copies its elements, so `a` and `b` are independent. This is the rule of zero at work.

@choice
In a copy assignment operator, why allocate the new array before deleting the old one?
- It is faster
* If the allocation fails, the object still has its old, valid data
- `delete` must always come last in a function
- It makes no difference
! Deleting first and then failing would leave the object holding a pointer to freed memory.

@local
Write `buffer.cpp` with the raw-pointer `Buffer` and all of the rule of three, plus `set` and `get` functions. In `main`: make `a` of size 3, set element 0 to 1.5, copy-construct `b` from `a`, set `b`'s element 0 to 9, then make `c` of size 1 and assign `c = a`. Print `a.get(0)`, `b.get(0)` and `c.get(0)` separated by spaces. Compile with `-Wall -Wextra -fsanitize=address`, run, and paste the output.
= 1.5 9 1.5
! `-fsanitize=address` makes the program report memory errors such as double deletes when it runs. A clean run with it is good evidence your three functions are right.

@write
From memory, write the copy constructor and the copy assignment operator for the raw-pointer `Buffer` (members `std::size_t n_` and `double* data_`).
min: 10
```solution
Buffer(const Buffer& other) : n_(other.n_), data_(new double[other.n_]) {
    std::copy(other.data_, other.data_ + n_, data_);
}

Buffer& operator=(const Buffer& other) {
    if (this == &other) return *this;
    double* fresh = new double[other.n_];
    std::copy(other.data_, other.data_ + other.n_, fresh);
    delete[] data_;
    data_ = fresh;
    n_ = other.n_;
    return *this;
}
```
! Check yours for the self-assignment guard, allocating before deleting, `delete[]` with brackets, and `return *this`.
--- recall
Q: What goes wrong with the default copy of a class that owns a raw pointer?
A: Both copies hold the same pointer, so the memory is deleted twice or one copy is left dangling.
Q: Name the three functions in the rule of three.
A: The destructor, the copy constructor and the copy assignment operator.
Q: What is the rule of zero?
A: Use members that manage themselves, like std::vector or std::unique_ptr, so you don't write any of the five.
Q: What does RAII mean in practice?
A: An object acquires a resource in its constructor and releases it in its destructor, so clean-up happens automatically when it goes out of scope.

=== c12 | cpp | 5 | Unit tests for C++ with doctest | c16
## The same idea, a different tool

You test C++ for the same reason you test Python, and the tests look much the same: call a function, compare the result with what you worked out by hand. C++ has no built-in test runner, so you use a framework. The big ones are GoogleTest and Catch2. This course uses **doctest**, which works the same way and is a single header file, so you can start in two minutes. Whichever one your future group uses, the ideas carry over.

Get the header into a `tests` folder of the project:

```
curl -L -o tests/doctest.h https://raw.githubusercontent.com/doctest/doctest/master/doctest/doctest.h
```

## A test file

```
#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#include "doctest.h"
#include "stats.h"

#include <vector>

TEST_CASE("mean of four numbers") {
    std::vector<double> v{1.0, 2.0, 3.0, 4.0};
    CHECK(mean(v) == doctest::Approx(2.5));
}
```

The words in capitals are **macros**. A macro is a piece of text that the preprocessor replaces with other code before the compiler runs, the same stage that handles `#include`. By convention macros are written in capitals so you can tell them from functions.

- `#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN` asks the header to generate the `main` function that runs all the tests. It must appear in exactly one `.cpp` file, before the include.
- `TEST_CASE("name") { ... }` defines one test. The name is what you see when it fails.
- `CHECK(expression)` records a failure if the expression is false and carries on with the rest of the test.
- `REQUIRE(expression)` does the same but stops the test case at once. Use it when continuing would make no sense, for example after a file failed to open.
- `doctest::Approx(2.5)` compares floating-point numbers with a small tolerance, like `pytest.approx`. Never compare computed doubles with a bare `==`.

## Exceptions in C++

A function that can't do its job reports it by **throwing an exception**, as in Python. The standard exception types live in the header `<stdexcept>`:

```
#include <stdexcept>

double mean(const std::vector<double>& v) {
    if (v.empty()) throw std::invalid_argument("mean of an empty vector");
    double sum = 0.0;
    for (double x : v) sum += x;
    return sum / v.size();
}
```

`throw` leaves the function immediately. The exception travels up through the callers until a matching `catch` is found. If there is none, the program is terminated.

```
try {
    double m = mean(values);
    std::cout << m << '\n';
} catch (const std::invalid_argument& e) {
    std::cerr << "error: " << e.what() << '\n';
}
```

Catch by `const` reference. `e.what()` returns the message. `std::cerr` is the error output stream, used like `std::cout` but meant for messages rather than results.

Without the check, dividing by `v.size()` when it is zero would give `nan` ("not a number"), which then quietly spreads through every later calculation. An exception can't be overlooked.

A test can check that the exception really is thrown:

```
TEST_CASE("mean of an empty vector throws") {
    std::vector<double> empty;
    CHECK_THROWS_AS(mean(empty), std::invalid_argument);
}
```

## Running the tests through CMake

The test file is one more program, linked to the library it tests. CMake's test tool, **CTest**, runs it. Add to `CMakeLists.txt`:

```
enable_testing()
add_executable(stats_test tests/test_stats.cpp)
target_link_libraries(stats_test PRIVATE stats)
add_test(NAME stats_test COMMAND stats_test)
```

`enable_testing()` switches CTest on, and `add_test` registers the program as a test. Then:

```
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

```
1/1 Test #1: stats_test .......................   Passed    0.00 sec

100% tests passed, 0 tests failed out of 1
```

CTest counts test programs, so it says "1". Run `./build/stats_test` directly to see doctest's own summary, which counts test cases and assertions. `--output-on-failure` prints a test's output only when it fails. If your CMake is older than 3.20 and doesn't know `--test-dir`, run `cd build && ctest --output-on-failure` instead.

This is also why the logic lives in a library: both the real program and the test program link to it. Code that sits inside `main.cpp` can't be tested.
--- practice
@choice
What is the difference between `CHECK` and `REQUIRE`?
- `CHECK` is for integers and `REQUIRE` for doubles
* Both record a failure, but `REQUIRE` stops the current test case, while `CHECK` continues with the next line
- `REQUIRE` only works in the `main` function
- There is none
! Use `CHECK` by default, so that one run shows every failure. Use `REQUIRE` when the lines after it depend on it.

@predict
```
#include <iostream>
#include <stdexcept>
#include <vector>

double mean(const std::vector<double>& v) {
    if (v.empty()) throw std::invalid_argument("empty");
    double sum = 0.0;
    for (double x : v) sum += x;
    return sum / v.size();
}

int main() {
    try {
        std::cout << mean({2.0, 4.0}) << ' ';
        std::cout << mean({}) << ' ';
        std::cout << "done";
    } catch (const std::invalid_argument& e) {
        std::cout << "caught " << e.what();
    }
    std::cout << '\n';
}
```
= 3 caught empty
! The first call prints 3. The second throws, so the rest of the `try` block, including "done", is skipped and the `catch` block runs.

@choice
Why does the test use `CHECK(mean(v) == doctest::Approx(2.5))` and not `CHECK(mean(v) == 2.5)`?
- `Approx` is required for every `CHECK`
- Because 2.5 is an `int`
* Floating-point results carry tiny rounding errors, so an exact comparison can fail for a correct result
- To make the test faster
! Here the numbers happen to be exact, but for most inputs they are not. Make the habit of `Approx` for every computed double.

@local
Add tests to the `stats` project from the CMake lesson. Make `mean` throw `std::invalid_argument` for an empty vector, download `doctest.h` into `tests/`, and write `tests/test_stats.cpp` with at least three test cases: one with a result you worked out by hand, one for a single value, and one with `CHECK_THROWS_AS`. Add the four CMake lines, build, and paste the output of:
```
ctest --test-dir build --output-on-failure
```
min: 3
= 100% tests passed
! If a test fails, CTest prints doctest's report with the file, the line and the two values that were compared.

@write
From memory, write a complete doctest file for `int clamp(int x, int lo, int hi)`, declared in `clamp.h`, which limits `x` to the range from `lo` to `hi`. Use one test case with three checks: a value inside the range, one below it and one above it.
min: 8
```solution
#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#include "doctest.h"
#include "clamp.h"

TEST_CASE("clamp limits a value to the range") {
    CHECK(clamp(5, 0, 10) == 5);
    CHECK(clamp(-3, 0, 10) == 0);
    CHECK(clamp(42, 0, 10) == 10);
}
```
! Integers compare exactly, so no `Approx` is needed here.
--- recall
Q: What does #define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN do?
A: It makes doctest.h generate the main function that runs every test case. It goes in exactly one .cpp file, before the include.
Q: What is the difference between CHECK and REQUIRE?
A: CHECK records a failure and continues. REQUIRE stops the current test case at the first failure.
Q: Which CMake commands turn a test program into a test that ctest runs?
A: enable_testing(), then add_executable and target_link_libraries for the test program, then add_test(NAME ... COMMAND ...).
Q: How does a C++ function report an error, and how does the caller handle it?
A: It throws an exception, such as std::invalid_argument. The caller wraps the call in try { } and handles it in catch (const std::invalid_argument& e) { }.

=== py12 | py | 6 | Fitting with SciPy curve_fit | p20
## One function does the fit

The lesson on fitting explained what a fit is: choose a model, and find the parameter values that minimise χ². In Python the standard tool is `curve_fit` from SciPy, a library of scientific algorithms built on NumPy. Install it with `pip install scipy`.

## The model is a Python function

Its first argument is x, and the parameters follow:

```
import numpy as np
from scipy.optimize import curve_fit

def gauss_line(x, A, mu, sigma, a, b):
    return A * np.exp(-(x - mu) ** 2 / (2 * sigma ** 2)) + a + b * x
```

This is the Gaussian on a straight line from the fitting lesson. Because it uses `np.exp`, it works on a whole array of x values at once.

## The data: bin centres, counts, errors

```
counts, edges = np.histogram(mass, bins=60, range=(2.8, 3.4))
centres = (edges[:-1] + edges[1:]) / 2
errors = np.sqrt(np.maximum(counts, 1))
```

`mass` is your array of dimuon masses. The uncertainty of each bin is √N. An empty bin would get an error of zero and a division by zero inside χ², so `np.maximum(counts, 1)` replaces any 0 by 1 first.

## Running the fit

```
p0 = [counts.max(), 3.1, 0.03, counts.min(), 0]
popt, pcov = curve_fit(gauss_line, centres, counts, p0=p0,
                       sigma=errors, absolute_sigma=True)
perr = np.sqrt(np.diag(pcov))
```

- `p0` is the list of **starting values**, in the same order as the function's parameters after x. Read them off your plot: the height of the peak, its position, a rough width, the background level, and a slope of zero.
- `sigma=errors` passes the uncertainty of each point.
- `absolute_sigma=True` says those are real one-sigma uncertainties. Without it, SciPy assumes you only know them up to a common factor and rescales them until χ²/ndf is exactly 1. That quietly hides a bad fit, so always set it when your errors are real.
- `popt` ("optimal parameters") holds the best-fit values, in the same order as `p0`.
- `pcov` is the covariance matrix. `np.diag` takes its diagonal, and the square roots are the uncertainties of the parameters.

## Check the quality yourself

`curve_fit` does not report χ², so compute it:

```
pulls = (counts - gauss_line(centres, *popt)) / errors
chi2 = np.sum(pulls ** 2)
ndf = len(centres) - len(popt)
```

The star in `*popt` **unpacks** the array: `gauss_line(centres, *popt)` is the same as `gauss_line(centres, popt[0], popt[1], popt[2], popt[3], popt[4])`.

## Report it

```
print(f"mass  = {popt[1]:.4f} ± {perr[1]:.4f} GeV")
print(f"width = {abs(popt[2]):.4f} ± {perr[2]:.4f} GeV")
print(f"chi2/ndf = {chi2:.1f}/{ndf}")
```

Inside an f-string, `:.4f` formats a number with four decimals. The Gaussian contains sigma only as sigma², so the fit can return a negative width with the same meaning, and `abs` takes care of that. Quote an uncertainty with one or two significant digits and round the value to the same decimal place: 3.0931 ± 0.0004, not 3.093127 ± 0.000418.

To draw the result, evaluate the model on a fine grid, so that the curve is smooth:

```
xs = np.linspace(2.8, 3.4, 400)
ax.plot(xs, gauss_line(xs, *popt), label="Fit")
```

## When it goes wrong

`curve_fit` always tries to hand back numbers. Whether they mean anything is yours to check.

- **No `p0`.** SciPy then starts every parameter at 1. For a peak at 3.1 GeV that is 100 counts high, the result is typically nonsense, such as a "peak" at 33 GeV with a width of 45, returned without any warning. Always pass `p0`.
- **A start far from the peak.** With the centre started at 5.0, outside the fitted window, the minimiser can't feel the peak at all. It returns your starting values and warns: `OptimizeWarning: Covariance of the parameters could not be estimated`.
- **`RuntimeError: Optimal parameters not found`.** The minimiser gave up. Improve the starting values.
- **A large χ²/ndf.** The fit converged, but the model has the wrong shape. Plot the curve over the data and look at where it misses.

The defence is always the same three steps: sensible starting values, a look at the plot, and χ²/ndf.
--- practice
@predict
```
def line(x, a, b):
    return a + b * x

popt = [1.0, 2.0]
print(line(3.0, *popt))
```
= 7.0
! `*popt` spreads the list over the remaining parameters, so the call is `line(3.0, 1.0, 2.0)`: 1 + 2 × 3.

@choice
After `popt, pcov = curve_fit(...)`, what is `np.sqrt(np.diag(pcov))`?
- The χ² of the fit
- The pulls of each data point
* The one-sigma uncertainty of each fitted parameter
- The starting values
! The diagonal of the covariance matrix holds the variances of the parameters, and an uncertainty is the square root of a variance.

@choice
Your error bars are real √N uncertainties. Why pass `absolute_sigma=True`?
- It makes the fit faster
* Without it, SciPy rescales the errors so that χ²/ndf becomes 1, which gives wrong parameter uncertainties whenever the fit is poor or the errors are right
- It switches from a Gaussian to a Poisson model
- It is required whenever `p0` is given
! The default treats the errors as relative weights only. With real uncertainties you want them taken at face value.

@local
Write `fit_demo.py`. Make toy data with `rng = np.random.default_rng(7)` and `data = np.concatenate([rng.normal(3.1, 0.03, 4000), rng.uniform(2.8, 3.4, 6000)])`, which is a peak of 4,000 events on a flat background of 6,000. Histogram it in 60 bins from 2.8 to 3.4, fit the Gaussian on a line, and print four lines: `mu = ` with two decimals, then the mass, the width and χ²/ndf as in the lesson. Paste the output.
min: 4
= mu = 3.10
= chi2
! The fit should recover a mass within about 0.001 of 3.1, a width near 0.030 and a χ²/ndf close to 1, because here the model has exactly the shape of the data. `np.concatenate` joins arrays end to end.

@write
From memory: the arrays `centres` and `counts` and the function `gauss_line(x, A, mu, sigma, a, b)` exist. Write the lines that compute √N errors, run the fit with starting values for a peak near 9.46 GeV that is about 0.1 wide, and print the mass with its uncertainty to four decimals.
min: 5
```solution
errors = np.sqrt(np.maximum(counts, 1))
p0 = [counts.max(), 9.46, 0.1, counts.min(), 0]
popt, pcov = curve_fit(gauss_line, centres, counts, p0=p0,
                       sigma=errors, absolute_sigma=True)
perr = np.sqrt(np.diag(pcov))
print(f"mass = {popt[1]:.4f} ± {perr[1]:.4f} GeV")
```
! Errors, starting values, the fit, the uncertainties, the report. You will type these five steps for every peak in the project.
--- recall
Q: What does curve_fit return?
A: popt, the best-fit parameter values, and pcov, their covariance matrix.
Q: How do you get the parameter uncertainties from pcov?
A: np.sqrt(np.diag(pcov)).
Q: What are p0 and sigma in a call to curve_fit?
A: p0 is the list of starting values for the parameters, and sigma is the uncertainty of each data point.
Q: How do you compute χ² after a fit?
A: Sum ((y − model(x, *popt)) / errors) ** 2 over all points, and compare it with the number of points minus the number of parameters.

=== pj2 | proj | 6 | Project 1, part 2: measure the J/ψ, Υ and Z | 
## From a picture to a measurement

Part 1 ended with a plot and three peak positions read off by eye. That is a picture. A measurement is a number with an uncertainty, produced by a method that someone else can repeat, together with evidence that the method works. This part turns the one into the other. When it is finished, your repository holds fitted masses and widths for three particles, a comparison with the world averages that you can explain, tests that run on GitHub at every push, and a README from which a stranger can reproduce every number.

## Step 1: give the code a shape

One long script is fine for exploring and impossible to test. Split it into a small package of functions and thin scripts that call them:

```
dimuon-spectrum/
    dimuon/
        __init__.py
        physics.py          invariant_mass(...)
        fit.py              gauss_line(...), fit_peak(...)
    tests/
        test_physics.py
        test_fit.py
    make_spectrum.py        the plot from part 1
    fit_peaks.py            the three fits
    plots/
    data/                   the CSV file, ignored by Git
    requirements.txt
    .gitignore
    .github/workflows/tests.yml
    README.md
```

A folder that contains a file called `__init__.py` is a **package**: Python lets you import from it by name. The file can be empty. With this layout, a script in the top folder and the tests can both write:

```
from dimuon.physics import invariant_mass
from dimuon.fit import fit_peak
```

Run the scripts from the top folder, as `python fit_peaks.py data/Dimuon_DoubleMu.csv`, and the tests as `python -m pytest -q`. Both put the top folder on Python's search path, which is how `dimuon` is found.

`requirements.txt` lists what the project needs, one name per line: `numpy`, `pandas`, `matplotlib`, `scipy`, `pytest`. `.gitignore` contains at least `data/` and `__pycache__/`.

## Step 2: one function for the mass

Move the mass formula from part 1 into `dimuon/physics.py` as a function with eight arguments, the E, px, py and pz of the two particles. Written with NumPy operations, the same function works on single numbers and on whole columns.

Then test it with cases you can work out on paper:

- Two massless particles of 45.6 GeV flying apart back to back. The momenta cancel, the energies add, and the mass must be 2 × 45.6 = 91.2.
- Two massless particles flying in the same direction. Their combined energy equals their combined momentum, and the mass must be 0.
- Arrays as input: the result must be an array with one mass per pair.
- A pair whose E² − p² comes out slightly negative because of rounding: the result must be 0 and not NaN.

Compare floating-point results with `pytest.approx`, as in the testing lesson.

## Step 3: one function for the fit

In `dimuon/fit.py`, wrap the steps from the fitting lesson into `fit_peak(mass, lo, hi, bins, mu0, sigma0)`: histogram the masses between `lo` and `hi`, compute the √N errors, call `curve_fit` with the Gaussian on a line, and return the fitted mass, the width, their uncertainties, χ² and the number of degrees of freedom. A dictionary is a convenient thing to return:

```
return {"mu": popt[1], "mu_err": perr[1], "sigma": abs(popt[2]),
        "sigma_err": perr[2], "chi2": chi2, "ndf": bins - len(popt)}
```

Use these windows and starting values:

- J/ψ: 2.8 to 3.4 GeV, 60 bins, starting at a mass of 3.1 and a width of 0.03.
- Υ(1S): 9.0 to 9.9 GeV, 45 bins, starting at 9.46 and 0.1. The window ends below the Υ(2S) at 10.02 GeV on purpose.
- Z: 80 to 100 GeV, 40 bins, starting at 91 and 2.5.

How do you test a fit without the data file? With data whose answer you know. Generate a **toy** sample with a fixed seed, for example 4,000 values from a Gaussian at 3.1 with a width of 0.03 on top of 6,000 uniformly spread ones, fit it, and assert that the fitted mass lies within three of its own uncertainties of 3.1 and that χ²/ndf is between 0.5 and 2. A test like this checks the whole chain, and it runs in a fraction of a second on GitHub, where your 14 MB data file doesn't exist.

## Step 4: run the fits and report them

`fit_peaks.py` loads the file, computes the masses, loops over the three peaks, prints the results and draws one figure with three panels:

```
fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))
for ax, (name, lo, hi, bins, mu0, sigma0) in zip(axes, PEAKS):
    ...
```

`plt.subplots(1, 3)` makes one row of three plots and returns them as an array, and `zip` pairs each plot with one peak. In every panel draw the data as points with error bars, the fitted curve on a fine grid, an x axis in GeV, and the result in the title. Save the figure into `plots/` and commit it, so that the README can show it.

## Step 5: compare with the world averages

The Particle Data Group lists 3.0969 GeV for the J/ψ, 9.4604 GeV for the Υ(1S) and 91.188 GeV for the Z. Your values will be close, within about half a percent, and all three will be a little **low**. Your J/ψ will also sit many of its own uncertainties away from 3.0969. Nothing is broken. You have just met the difference between two kinds of uncertainty.

The number that `curve_fit` gives you is the **statistical** uncertainty. It says how much the result would scatter if the experiment were repeated with a fresh set of collisions, and it shrinks as you collect more events.

A **systematic** uncertainty is a bias in the instrument or the method. It moves the result the same way every time, and more data doesn't reduce it. The usual suspects here:

- **The momentum scale.** The mass is computed from measured momenta. If the detector's calibration, its alignment or the map of its magnetic field is off by one part in a thousand, every mass is off by one part in a thousand. The experiments use these very peaks to calibrate their muon measurement, and this educational file comes from early 2011 data without the final corrections.
- **Radiation.** A muon sometimes emits a photon on its way out. The photon carries energy off, so the pair's mass comes out below the parent's. This puts a tail on the low side of every peak, and a symmetric Gaussian fitted to a lopsided peak is pulled downwards.
- **The model.** The Gaussian is only an approximation of the peak's shape. Muons that go through the central part of the detector are measured more precisely than muons in the endcaps, so the J/ψ peak is a mixture of narrow and wide Gaussians, and one Gaussian can't follow it. That is why its χ²/ndf comes out well above 1. The Z is worse: it has a natural width of 2.5 GeV with long tails on both sides, a shape called a Breit-Wigner, and no Gaussian fits it well.

Which of these matters most in this file? One fit can't tell you, and an honest write-up says so. What you can do is estimate how much your own choices matter: repeat a fit with a different window, a different number of bins, or only muons with |η| below 1, and see how far the mass moves. The size of that movement is a first estimate of the systematic uncertainty of your method.

A full result names both parts, the way papers do: 9.455 ± 0.003 (stat) ± 0.004 (syst) GeV. Those numbers are invented to show the form. Yours come from your fits.

## Step 6: tests and CI

Add the workflow from the lesson on continuous integration. The run installs `requirements.txt` and calls `python -m pytest -q`. It never sees your data file, and it doesn't need to: the mass function is tested with hand-computed cases and the fit with a toy sample. Put the status badge at the top of the README.

## Step 7: the README

It is the only thing most visitors will read. In this order:

- A summary of two or three sentences with the main result.
- A table of the three particles: your mass with its uncertainty, the PDG value, and χ²/ndf.
- The figure.
- How to reproduce it: where to download the data, and the exact commands.
- A discussion: why the values differ from the PDG, and what you checked.
- What you would do next.

Selectors and supervisors look at the discussion. Anyone can run `curve_fit`. Explaining why the answer is 0.1% low shows that you understand what you ran.
--- practice
@predict
Two muons fly apart back to back, each with an energy of 45.6 GeV. Treat them as massless. What invariant mass, in GeV, must your function return for this pair?
= 91.2
=| 91.2 GeV
=| 91.20
! The momenta cancel, so m = E1 + E2 = 91.2. A case like this, worked out on paper, is the best kind of test: if the function returns anything else, the function is wrong.

@run
Two helpers for step 5. `n_sigma(value, error, reference)` returns how many uncertainties the value lies from the reference, as a positive number. `shift_percent(value, reference)` returns the difference as a percentage of the reference, negative when the value is below it.
```starter
def n_sigma(value, error, reference):
    pass

def shift_percent(value, reference):
    pass
```
```test
print(round(n_sigma(3.0930, 0.0005, 3.0969), 1))
print(round(shift_percent(3.0930, 3.0969), 2))
print(round(n_sigma(91.0, 0.5, 91.188), 1))
```
= 7.8
= -0.13
= 0.4
```solution
def n_sigma(value, error, reference):
    return abs(value - reference) / error

def shift_percent(value, reference):
    return 100 * (value - reference) / reference
```
! The first result is almost eight uncertainties from the reference, although it differs by only 0.13%. A tiny statistical uncertainty makes even a small bias stand out, and the more data you have, the more the systematic effects decide your accuracy.

@choice
The CI machine doesn't have `Dimuon_DoubleMu.csv`, because the file is ignored by Git. What should the tests use?
- Download the file from the Open Data portal at the start of every run
- Commit the 14 MB file after all
* Cases worked out by hand for the mass function and a small generated toy sample for the fit
- Skip the tests when the file is missing
! Tests should be fast and depend on nothing outside the repository. A hand-computed case and a toy sample with a fixed seed give the same answer on every machine.

@local
Do steps 1 to 4. Run `python -m pytest -q` first, and then your `fit_peaks.py`. Paste what the script prints for the J/ψ: the mass and the width with their uncertainties, and χ² with the degrees of freedom.
min: 3
= 3.09
! With the window and binning from this lesson, expect a mass close to 3.093 GeV with an uncertainty of about 0.0004, a width near 0.031 GeV, and a χ²/ndf between 2 and 3.

@local
Estimate a systematic uncertainty. Fit the J/ψ three times: with the window 2.8 to 3.4, with 2.9 to 3.3, and once more with only the events in which both muons have |η| below 1, using the columns `eta1` and `eta2`. Paste the three masses and widths, one fit per line.
min: 3
! The two windows should agree to a few tenths of an MeV, so the choice of window is not what pulls your mass below the PDG value. The central muons give a clearly narrower peak, about 24 MeV instead of 31: the resolution depends on where in the detector the muons went.

@choice
Your Z fit has a χ²/ndf of 2.3. What do you write in the README?
- Nothing, and leave χ² out of the table
- You multiply the error bars by 1.5 until χ²/ndf is 1
* The value as it is, with the explanation that a Gaussian is not the right shape for the Z, which has a natural width and tails, and what a better model would be
- You change the window until χ²/ndf looks good, without mentioning it
! A poor χ² that you report and explain shows more understanding than a good one you can't account for. Hiding it or tuning it away is what reviewers are trained to catch.

@choice
Your J/ψ mass comes out about 0.004 GeV below the PDG value, with a statistical uncertainty of 0.0004 GeV. You repeat the analysis with ten times more events from the same detector and the same code. What do you expect?
- The value moves up to the PDG value
* The uncertainty shrinks to about 0.0001, and the value stays where it is, because the difference is systematic
- The uncertainty stays the same
- The peak disappears
! Statistical uncertainties fall like 1/√N, so ten times the data gives about a third of the uncertainty. A bias of the calibration or of the fit model is the same in every event and doesn't average away.
--- recall
Q: How can you estimate a systematic uncertainty of your own fit?
A: Repeat the fit with other reasonable choices, such as a different window, binning or selection, and see how far the result moves.
Q: Why can a fitted mass lie many uncertainties away from the PDG value without the fit being wrong?
A: The fit's uncertainty is only statistical. The momentum calibration, radiation and the shape of the model can shift the result by more than that.
Q: How do you test a fitting function without the real data file?
A: Generate a toy sample with known true values and a fixed seed, fit it, and assert that the true values are recovered within a few uncertainties.
Q: Why is a Gaussian a poor model for the Z peak?
A: The Z has a natural width of 2.5 GeV with long Breit-Wigner tails, plus a low-side tail from radiated photons.

=== sy3 | sys | 6 | Continuous integration with GitHub Actions | s7
## Tests that run themselves

Tests only help if they are run. **Continuous integration** (CI) means a server builds your project and runs its tests on every push, on a clean machine that has nothing but what your repository tells it to install. It answers the question every reviewer asks: does this work from a fresh copy, or only on the author's laptop? A green tick next to a commit says it does.

GitHub's CI system is **GitHub Actions**. CERN's GitLab has GitLab CI. The file format differs and the ideas are identical, so what you learn here transfers directly.

## YAML in two minutes

CI is configured in **YAML**, a text format for structured data.

```
name: tests                  # key: value
on: [push, pull_request]     # a list, written inline
jobs:
  test:                      # indentation means "inside jobs"
    runs-on: ubuntu-latest
    steps:
      - run: echo hello      # a dash starts a list item
      - run: echo again
```

Nesting is shown by indentation, as in Python, and it must be made of spaces, never tabs. A `#` starts a comment. One trap: YAML guesses types, so an unquoted `3.10` is read as the number 3.1. Version numbers always go in quotes: `"3.10"`.

## A workflow, line by line

A **workflow** is a file in the folder `.github/workflows/` of your repository. This one tests a Python project:

```
name: tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: python -m pytest -q
```

- `name` is the label shown on GitHub.
- `on` lists the events that start the workflow: every push, and every pull request.
- `jobs` holds one or more jobs. This one is called `test`. Each job gets its own fresh virtual machine.
- `runs-on: ubuntu-latest` picks the machine: Ubuntu Linux, which comes with Git, Python, a C++ compiler and CMake already installed.
- `steps` run in order. A step is one of two things. `uses:` runs a packaged, reusable **action** written by someone else, and `with:` passes it settings. `run:` runs a shell command, exactly as you would type it.
- `actions/checkout` copies your repository onto the machine. Without it the machine is empty. `actions/setup-python` installs the Python version you ask for. The number after `@` is the version of the action.

`requirements.txt` is a plain list of the packages your project needs, one per line, such as `numpy`, `pandas` and `pytest`. `pip install -r requirements.txt` installs them all.

## How it decides pass or fail

Every command ends with an **exit code**, a number it hands back to whoever started it. Zero means success and anything else means failure. `pytest` exits with a non-zero code when a test fails, and so does a compiler on an error. If any step exits non-zero, the job stops and is marked failed: a red cross on the commit. In your own terminal, `echo $?` prints the exit code of the last command.

To see what happened, open the **Actions** tab of the repository, click the run, then the job, and read the log of each step.

## Building C++ in CI

A C++ job needs no setup step, because the compiler and CMake are already there:

```
  cpp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cmake -S . -B build
      - run: cmake --build build
      - run: ctest --test-dir build --output-on-failure
```

Add that under `jobs:` next to another job, and both run side by side.

## Habits that come with it

- Put a status badge at the top of the README. It shows at a glance that the tests pass: `![tests](https://github.com/USER/REPO/actions/workflows/tests.yml/badge.svg)`, with your user and repository names filled in.
- A red `main` is fixed before anything else is done.
- Keep the run fast. Tests must not need large data files that aren't in the repository: use small samples and cases worked out by hand.
- Never put passwords or tokens in a workflow file. GitHub has encrypted "secrets" for that.

On GitLab the same job is written in a file called `.gitlab-ci.yml`:

```
test:
  image: python:3.12
  script:
    - pip install -r requirements.txt
    - python -m pytest -q
```

You will read files like this one from your first week at CERN.
--- practice
@choice
How does the CI server know that a step such as `python -m pytest -q` failed?
- It reads the output and looks for the word "failed"
* The command ends with a non-zero exit code
- pytest sends an email to GitHub
- It compares the output with the previous run
! Exit code 0 means success, anything else failure. That convention is what lets tools be chained without understanding each other's output.

@choice
Why is the Python version written as `"3.10"` in quotes?
- Quotes make the workflow run faster
- GitHub only accepts strings
* Without quotes YAML reads it as the number 3.1, and you get the wrong Python version
- Because of the dot
! `3.10` as a number is the same as 3.1. This mistake is common enough that the official documentation warns about it.

@choice
What is the difference between a `uses:` step and a `run:` step?
* `uses:` runs a packaged action that someone published, and `run:` runs a shell command
- `uses:` is for Python and `run:` is for C++
- `run:` steps happen before `uses:` steps
- There is none
! Checking out the code and installing Python are done by actions. Your own build and test commands are `run:` steps.

@write
From memory, write `.github/workflows/ci.yml` for a C++ project: on every push, on Ubuntu, check out the code, configure with CMake into `build`, build, and run the tests with CTest.
min: 8
```solution
name: ci
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cmake -S . -B build
      - run: cmake --build build
      - run: ctest --test-dir build --output-on-failure
```
! Three levels: the trigger, the job with its machine, and the steps. Check your indentation against the model answer, because in YAML it is part of the meaning.

@local
Add the Python workflow from this lesson to your `cern-prep` repository as `.github/workflows/tests.yml`, together with a `requirements.txt` that lists `pytest` and anything else your tests import. Commit and push. Open the Actions tab on GitHub, wait for the run, open the step that runs pytest, and paste its last lines.
min: 1
= passed
! If the run is red, read the log of the first failing step. The usual causes are a missing package in `requirements.txt` and wrong indentation in the YAML.
--- recall
Q: What is continuous integration?
A: A server builds and tests the project automatically on every push, on a clean machine, so a broken change is noticed at once.
Q: In a GitHub Actions workflow, what do on:, runs-on: and steps: say?
A: on: lists the events that start it, runs-on: picks the machine, and steps: are the actions and commands run in order.
Q: How does a CI job decide that a step failed?
A: By the command's exit code: 0 is success, anything else fails the job.
Q: Where does a workflow file live?
A: In the folder .github/workflows/ of the repository, as a .yml file.

=== c13 | cpp | 6 | Reading files and parsing text in C++ | c17
## What a real program needs

Your C++ programs so far read from the keyboard. Project 2 has to open a CSV file with 100,000 events, take the file name from the command line, cope with a line that is broken, and say clearly what went wrong when something does. This lesson covers those four things.

## Arguments from the command line

When you run `./colsum data.csv 3`, the shell hands the words to your program. To receive them, `main` takes two parameters:

```
int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "usage: colsum FILE COLUMN\n";
        return 1;
    }
    std::string path = argv[1];
    int column = std::stoi(argv[2]);
}
```

`argc` ("argument count") is the number of words, **including the program's own name**. `argv` ("argument values") is an array of C-style strings: `argv[0]` is the program name, `argv[1]` the first argument, and so on. So a program that expects two arguments checks for `argc == 3`. The arguments are always text. `std::stoi` ("string to int") and `std::stod` ("string to double") convert them to numbers.

`std::cerr` is the stream for error messages. It appears on the screen like `std::cout`, but it is a separate channel, so when someone redirects your program's output into a file, the errors still show up in the terminal.

The value that `main` returns is the program's **exit code**: 0 for success, anything else for failure. Returning 1 on an error is what allows a script or a CI job to notice that your program failed.

## Opening a file

```
#include <fstream>

std::ifstream in(path);
if (!in) {
    std::cerr << "cannot open " << path << '\n';
    return 1;
}
```

`std::ifstream` ("input file stream") opens the file when the variable is created and closes it automatically when the variable goes out of scope. If the file doesn't exist, **nothing visible happens**. There is no crash and no message. The stream is simply in a failed state, and every read from it fails quietly. That is why the check `if (!in)` directly after opening is not optional. Without it, a mistyped file name gives you a program that happily reports zero events.

## Line by line, field by field

A file stream is used exactly like `std::cin`. The standard pattern for a CSV file has two loops: the outer one takes lines from the file, and the inner one takes fields from the line.

```
std::string line;
std::getline(in, line);                  // read and ignore the header line

while (std::getline(in, line)) {         // one line per turn, until the file ends
    std::istringstream ss(line);         // a stream that reads from this line
    std::string field;
    std::vector<double> row;
    while (std::getline(ss, field, ',')) {
        row.push_back(std::stod(field));
    }
    // row now holds the numbers of this line
}
```

The loop condition works because `std::getline` returns the stream, and a stream counts as true only while the last read succeeded. At the end of the file the read fails and the loop ends.

## Bad input

`std::stod("abc")` doesn't return a number. It throws `std::invalid_argument`. An empty field does the same. In a file of 100,000 lines you should expect a few broken ones, and decide what to do about them:

```
int bad = 0;
try {
    row.push_back(std::stod(field));
} catch (const std::invalid_argument&) {
    ++bad;
}
```

Count the lines you skip and report the number at the end. Never drop data silently, and never let one bad line stop the whole run. A physicist reading your output must be able to see how many events went in and how many were used.

## A second way: let >> do the conversion

When every field is a number, you can skip `stod` and read the numbers and the commas straight from the string stream:

```
std::istringstream ss("25.3,-1.2,1");
double pt, eta;
int charge;
char c1, c2;
if (ss >> pt >> c1 >> eta >> c2 >> charge) {
    // all five reads worked
}
```

`>>` into a `double` takes as many characters as form a number and stops in front of the comma. `>>` into a `char` takes exactly one character, here the comma. If any of the reads fails, for instance because a field holds letters, the stream goes into its failed state and the whole chain counts as false in the `if`. Nothing is thrown, so this style needs no `try`. A strict parser also checks that `c1` and `c2` really are commas.

## One struct per event

Loose vectors of numbers are easy to mix up. Give each row a type:

```
struct DimuonEvent {
    double E1, px1, py1, pz1;
    double E2, px2, py2, pz2;
};

std::vector<DimuonEvent> events;
events.reserve(100000);
```

`reserve` tells the vector how many elements are coming, so it allocates its memory once instead of growing step by step.

In the CMS dimuon file, counting from 0, the columns `E1, px1, py1, pz1` are numbers 3 to 6 and `E2, px2, py2, pz2` are numbers 12 to 15. Columns 2 and 11 contain letters, which is one reason not to convert every field blindly. A sturdier program reads the header line, finds each column by its name, and so keeps working if the column order ever changes.

## Writing a file

Output works the same way with `std::ofstream`:

```
std::ofstream out("hist.csv");
out << "bin_low,count\n";
out << 2.8 << ',' << 153 << '\n';
```

## Why not CSV for everything

Parsing text is slow, because every number has to be converted from characters, and text files are large. For 100,000 events it doesn't matter. For the billions of events of a real analysis it does, which is why the field stores data in binary, compressed, column-wise ROOT files.
--- practice
@predict
```
#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream ss("12.5,-3,muon");
    std::string field;
    int n = 0;
    double sum = 0.0;
    while (std::getline(ss, field, ',')) {
        ++n;
        if (n <= 2) sum += std::stod(field);
    }
    std::cout << n << ' ' << sum << ' ' << field << '\n';
}
```
= 3 9.5 muon
! Three fields are read. Only the first two are converted and added: 12.5 − 3 = 9.5. After the loop, `field` still holds the last field that was read.

@choice
`std::ifstream in("data.csv");` is executed, but there is no file called `data.csv`. What happens?
- The program stops with an error message
- An empty file called `data.csv` is created
* Nothing visible. The stream is in a failed state and every read from it fails, so the program must test it with `if (!in)`
- The compiler reports an error
! Opening a file can't fail at compile time, and C++ streams don't throw by default. An unchecked stream is the classic cause of "my program ran and found zero events".

@local
Write `colsum.cpp`. It takes a file name and a column number (counting from 0) on the command line, skips the header line, and prints the number of data rows and the sum of that column. It must print a message to `std::cerr` and return 1 if the arguments are missing or the file can't be opened. Test it with the two commands below and paste the output.
```
printf 'name,pt,eta\nmu1,25.5,0.3\nmu2,40.25,-1.2\nmu3,10.0,2.1\n' > mini.csv
./colsum mini.csv 1
```
min: 1
= 3 75.75
! Three rows, and 25.5 + 40.25 + 10.0 = 75.75. Also try `./colsum nothere.csv 1` followed by `echo $?`, which should print your error message and then 1.

@write
From memory, write `std::vector<double> parse_row(const std::string& line)`. It splits the line at commas and converts every field to a `double`.
min: 8
```solution
#include <sstream>
#include <string>
#include <vector>

std::vector<double> parse_row(const std::string& line) {
    std::vector<double> row;
    std::istringstream ss(line);
    std::string field;
    while (std::getline(ss, field, ',')) {
        row.push_back(std::stod(field));
    }
    return row;
}
```
! A string stream over the line, `getline` with a comma as the separator, and `stod` for each field. This function throws if a field is not a number, which the caller can catch.

@choice
Why should `main` return 1 when the input file can't be opened?
- So that the operating system deletes the output
- Because 1 means "true" in C++
* A non-zero exit code tells the shell, a script or a CI job that the program failed
- It makes the error message appear
! By convention 0 means success. Every tool that chains programs together relies on it.
--- recall
Q: How do you open a file for reading in C++ and check that it worked?
A: std::ifstream in(path); and directly afterwards if (!in) to handle the failure.
Q: What do argc and argv hold?
A: argc is the number of words on the command line, including the program's name. argv[1] is the first argument, as text.
Q: What does std::stod do with text that isn't a number?
A: It throws std::invalid_argument, so catch it or check the input first.
Q: Why print errors to std::cerr and return a non-zero value from main?
A: std::cerr keeps messages apart from the program's real output, and a non-zero exit code tells scripts and CI that the program failed.

=== pj3 | proj | 6 | Project 2 guide: an event processor in C++ | 
## What you are going to build

The same measurement again, in C++: a small library and a command-line program, `dimuon_hist`, that reads the 100,000 events from the CSV file, computes the invariant mass of each pair, fills a histogram and writes it to a file. Around it you build what makes C++ code trustworthy: unit tests, a build that anyone can repeat, sanitizer runs, a comparison with your Python result, an honest benchmark, and CI.

Why do it twice? Because this is CERN software in miniature. The experiments' reconstruction and analysis frameworks are C++ libraries with thin programs on top, built with CMake and tested on every change. A student project there almost always means adding to such a code base. And in phase 2 this program becomes your test bench for making code fast.

The project has three milestones, one per week. Each is a task in the plan with its own evidence.

## The layout

```
dimuon-cpp/
    CMakeLists.txt
    include/dimuon/
        FourVector.h
        Histogram.h
        CsvReader.h
    src/
        Histogram.cpp
        CsvReader.cpp
    apps/
        dimuon_hist.cpp
    tests/
        doctest.h
        test_fourvector.cpp
        test_histogram.cpp
        test_csvreader.cpp
    scripts/
        compare.py
    .github/workflows/build.yml
    README.md
```

Three ideas are behind it.

**A library and a thin program.** Everything that computes lives in the library. `apps/dimuon_hist.cpp` only reads the command line, calls the library and prints. The reason is testing: a test program can link to a library, but it can't call code that is locked inside another program's `main`.

**Headers under `include/dimuon/`.** Code that uses the library writes `#include "dimuon/FourVector.h"`. The folder name in front keeps your `Histogram.h` apart from anybody else's.

**Your own namespace.** Wrap everything in the library like this:

```
namespace dimuon {

struct FourVector {
    // ...
};

}  // namespace dimuon
```

Outside the braces the type is called `dimuon::FourVector`, exactly as `vector` is called `std::vector`. Inside them the short name is enough.

## Milestone 1: a tested four-vector

Start a new repository with only three things in it: `FourVector.h`, a test file, and `CMakeLists.txt`.

`FourVector` is a struct with four doubles, E, px, py and pz, an `operator+` and the functions `mass()` and `pt()`. Short functions like these can be written directly inside the struct in the header.

A library that consists only of headers has nothing to compile. CMake calls that an `INTERFACE` library:

```
add_library(dimuon INTERFACE)
target_include_directories(dimuon INTERFACE include)
```

`INTERFACE` means: nothing to build here, but everything that links to this target gets these settings. The test program links to it as usual with `target_link_libraries(dimuon_tests PRIVATE dimuon)`. When the first `.cpp` file arrives in milestone 2, the line becomes `add_library(dimuon src/Histogram.cpp src/CsvReader.cpp)` and the keyword `PUBLIC`.

The tests, with doctest as in the lesson on unit tests:

- A pair whose mass you computed by hand, such as two back-to-back massless particles of 45.6 GeV, which must give 91.2.
- Two parallel massless particles, which must give 0.
- A single particle at rest, whose mass is its energy.
- A vector whose E² − p² is slightly negative, which must give 0 and not NaN.

The milestone is reached when `ctest` reports that all tests pass and the build with `-Wall -Wextra -Wpedantic` prints no warning.

## Milestone 2: read the events and match Python

Add three pieces.

**A histogram class.** `Histogram(bins, lo, hi)` with `fill(x)`, `count(i)` and `bin_low(i)`. Decide what happens to values outside the range and count them in two extra counters, **underflow** and **overflow**. Never drop them silently: the three numbers together must add up to the number of fills. Test the edges: a value equal to `lo` belongs to the first bin, and a value equal to `hi` is overflow.

**A reader.** A function that takes the file name and returns the events as a `std::vector`, using what you learned in the lesson on reading files. It finds the columns `E1` to `pz2` by their names in the header line, counts the lines it can't parse, and throws `std::runtime_error` when the file can't be opened. Test it with a tiny file that the test writes itself, including one broken line.

**The program.** `dimuon_hist FILE LOW HIGH BINS OUTPUT` reads the events, fills the histogram with their masses, and writes one line per bin, `bin_low,count`, to the output file. It prints how many events were read, how many lines were bad, and how many values fell inside and outside the range. Exceptions from the library are caught in `main`, which prints the message to `std::cerr` and returns 1.

Then prove that it is right. Write `scripts/compare.py`, which reads your output file, makes the same histogram from the same data with NumPy, and prints how many bins agree. One detail: NumPy counts a value exactly equal to the upper edge in the last bin, and your class calls it overflow. The target is that every bin is identical. If one event differs, find it and explain it.

Finally, build with the sanitizers and run both the tests and the program on the full file:

```
cmake -S . -B build-san -DCMAKE_BUILD_TYPE=Debug -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined"
cmake --build build-san
./build-san/dimuon_tests
./build-san/dimuon_hist data/Dimuon_DoubleMu.csv 2.8 3.4 60 hist.csv
```

`CMAKE_CXX_FLAGS` hands extra flags to every compile and link command. The milestone is reached when the bins match and the sanitizers stay silent.

## Milestone 3: benchmark, CI and README

Measure, following the lesson on benchmarks:

- Time the reading and the computing separately. You will find that they differ by a factor of about a hundred.
- The computing takes about a millisecond for 100,000 events, which is too short to measure. Loop over the events a few hundred times, fill a fresh histogram on each pass, use the result, and divide.
- Compare a `Debug` build with a `Release` build, and both with Python: once with the NumPy version from Project 1 and once with a plain `for` loop over the rows.
- Run each five times and report the median, in events per second.

Add a workflow that configures, builds and runs `ctest` on every push. Then write the README: what the program does, how to build and run it, the table of benchmark results with the machine and the compiler flags, the comparison with Python, and what surprised you.

## House rules

These are the habits that reviewers of C++ code look for:

- No `using namespace std;` in a header. It would switch the namespace on for every file that includes it.
- No global variables. Functions get what they need through their parameters.
- No `new` and no `delete`. Use values and `std::vector`.
- `const` on everything that doesn't change, and `const` references for parameters that are expensive to copy.
- Zero warnings.
- The library reports errors by throwing exceptions. It never prints and never exits. Only `main` decides what the user sees.
- One commit per working step, with a message that says what changed and why.
--- practice
@choice
Why does the mass calculation live in the library and not in `dimuon_hist.cpp` next to `main`?
- Libraries run faster than programs
- CMake requires at least one library
* A test program can link to the library and call the function, but it can't reach code inside another program's `main`
- So that the header can be longer
! Putting the logic in a library and keeping `main` thin is what makes C++ code testable. It also lets a second program reuse the same code.

@predict
```
#include <algorithm>
#include <cmath>
#include <iostream>

struct FourVector {
    double E, px, py, pz;

    FourVector operator+(const FourVector& o) const {
        return {E + o.E, px + o.px, py + o.py, pz + o.pz};
    }
    double mass() const {
        double m2 = E * E - (px * px + py * py + pz * pz);
        return std::sqrt(std::max(0.0, m2));
    }
};

int main() {
    FourVector a{5.0, 3.0, 0.0, 4.0};
    FourVector b{5.0, -3.0, 0.0, -4.0};
    std::cout << a.mass() << ' ' << (a + b).mass() << '\n';
}
```
= 0 10
! For `a`, E² is 25 and p² is 9 + 0 + 16 = 25, so its mass is 0. In the sum the momenta cancel and the energies add: 10. Two massless particles flying apart have a combined mass. This program is a ready-made test case.

@choice
Which is the best first test for `FourVector::mass()`?
- Run the program on the real data and look at the plot
- Check that the result is a `double`
* Two back-to-back massless particles of energy E must give a mass of 2E
- Compare with the output of the same function a second time
! A test needs an answer that you know independently of the code. Simple kinematics that you can do on paper gives you one.

@write
From memory, write the complete header `FourVector.h`: the include guard line, the includes, the namespace, and the struct with `operator+`, `mass()` and `pt()`.
min: 15
```solution
#pragma once
#include <algorithm>
#include <cmath>

namespace dimuon {

struct FourVector {
    double E = 0.0;
    double px = 0.0;
    double py = 0.0;
    double pz = 0.0;

    FourVector operator+(const FourVector& o) const {
        return {E + o.E, px + o.px, py + o.py, pz + o.pz};
    }

    double mass() const {
        const double m2 = E * E - (px * px + py * py + pz * pz);
        return std::sqrt(std::max(0.0, m2));
    }

    double pt() const { return std::sqrt(px * px + py * py); }
};

}  // namespace dimuon
```
! Check four things in yours: `#pragma once`, both member functions marked `const`, the parameter of `operator+` taken by `const` reference, and `std::max` guarding the square root against a slightly negative value.

@local
Milestone 1. Create the repository with `FourVector.h`, `tests/test_fourvector.cpp`, `tests/doctest.h` and `CMakeLists.txt`, build it, run `ctest`, and commit. Then paste the output of `git ls-files`.
min: 4
= include/dimuon/FourVector.h
= tests/test_fourvector.cpp
= CMakeLists.txt
! `git ls-files` lists every file that Git tracks. The `build/` folder must not appear in it: put it in `.gitignore`.

@choice
In the J/ψ window your C++ histogram holds 8,629 events and the NumPy one 8,630. What do you do?
- Nothing. One event in 8,630 doesn't matter
- Change the C++ code until the numbers agree, whatever it takes
* Find the event. Print the masses closest to the edges of the window and of the bins, and check how each side treats a value exactly on an edge
- Remove the comparison from the project
! A difference of one usually has a precise cause, such as an edge that one side includes and the other doesn't, or a last-digit rounding difference. Finding it is quick, and it is exactly the habit a supervisor hopes to see.
--- recall
Q: Why put the logic of a C++ project in a library with a thin main program?
A: Tests and other programs can link to a library and call its functions. Code inside main can't be tested or reused.
Q: What are underflow and overflow in a histogram?
A: Counters for the values below and above its range, so that no fill is lost silently.
Q: How do you add sanitizer flags to a CMake build?
A: Configure a separate build folder with -DCMAKE_BUILD_TYPE=Debug -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined".
Q: Why must a header never contain using namespace std?
A: The line would apply to every file that includes the header, and names could clash there without warning.

=== c14 | cpp | 7 | Finding bugs: warnings, sanitizers and gdb | 
## Bugs that don't show

In Python, reading past the end of a list stops the program with a clear message. In C++, the same mistake may print the right answer today, a wrong one tomorrow, and crash next week on another machine. This lesson is about the tools that turn such hidden mistakes into loud ones. Experienced C++ developers use them all the time, and being able to say "I ran it under the sanitizers" is a mark of someone who has written real C++.

## Undefined behaviour

For some mistakes the C++ standard says nothing about what happens. This is called **undefined behaviour** (UB). The most common cases:

- reading or writing past the end of an array or vector with `[]`,
- using a variable that was never given a value,
- using an object after it was destroyed, or memory after it was freed,
- dereferencing a null pointer,
- overflow of a signed integer.

"Undefined" doesn't mean "crashes". The program may crash, compute nonsense, or work perfectly, and which of those can change with the compiler, the optimisation level and the day. The compiler is even allowed to assume that undefined behaviour never happens, and to optimise on that assumption. So a program that gives the right output can still be wrong.

## Layer 1: warnings

The compiler notices many mistakes while compiling, if you ask it to:

```
g++ -std=c++17 -Wall -Wextra -Wpedantic prog.cpp -o prog
```

`-Wall` and `-Wextra` enable two sets of warnings, and `-Wpedantic` warns about code that isn't standard C++. Typical catches are unused variables, comparisons between signed and unsigned numbers, and functions that forget to return a value. Treat every warning as a bug to fix. In CI, add `-Werror`, which turns warnings into errors so that they can't pile up.

## Layer 2: sanitizers

A **sanitizer** makes the compiler add checking code around every memory access and every arithmetic operation. The program runs about half as fast, and the moment it does something illegal, it stops with a report.

```
g++ -std=c++17 -g -fsanitize=address,undefined prog.cpp -o prog
./prog
```

`-fsanitize=address` is **AddressSanitizer** (ASan), which catches out-of-bounds access, use after free and memory leaks. `-fsanitize=undefined` is **UBSan**, which catches integer overflow, null pointers and more. `-g` adds debug information, so that the report can name the file and the line.

A report looks like this:

```
==2018==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x503000000058
READ of size 8 at 0x503000000058 thread T0
    #0 0x55f366c45681 in main off.cpp:7
0x503000000058 is located 0 bytes after 24-byte region
```

Read it from the top. **heap-buffer-overflow** is the kind of error: an access outside a block of memory that was allocated at run time, such as the contents of a vector. **READ of size 8** says the program read 8 bytes, which is one `double`. The line starting with **#0** is where it happened: `main`, in `off.cpp`, line 7. The lines after it are the **stack trace**, the chain of function calls that led there. The last line says the address lies directly after a 24-byte block: a vector of three doubles, read at index 3.

UBSan reports are single lines, such as `runtime error: signed integer overflow: 2147483647 + 1 cannot be represented in type 'int'`.

Run your tests with the sanitizers switched on, on your machine and in CI. When they are silent, a whole class of bugs is ruled out. They don't find mistakes in your logic. A wrong formula is still wrong.

One cheap habit helps as well: `v.at(i)` checks the index and throws `std::out_of_range`, where `v[i]` checks nothing.

## Layer 3: the debugger

When a program crashes or misbehaves and the cause isn't obvious, a **debugger** lets you stop it and look inside. On Linux the debugger is **gdb**. Compile with `-g -O0`, so that the machine code matches your source line by line, then:

```
gdb ./prog
```

You need only a handful of commands:

- `run` starts the program. Arguments go after it: `run data.csv`.
- `bt` ("backtrace") shows the chain of function calls at the point where the program stopped. After a crash this is the first thing to type.
- `break hist.cpp:42` or `break fill` sets a **breakpoint**: the program will pause when it reaches that line or function.
- `next` executes one line. `step` does the same but goes into function calls.
- `print x` shows the value of a variable. `info locals` shows all local variables.
- `continue` runs on to the next breakpoint, and `quit` leaves.

After a crash, `bt` prints something like:

```
#0  0x0000555555555179 in scale (p=0x0) at crash.cpp:4
#1  0x000055555555519f in main () at crash.cpp:9
```

Frame #0 is where it died: in `scale`, at line 4, with `p=0x0`, a null pointer. Frame #1 is the caller. On macOS the debugger is **lldb**, and `run`, `bt`, `next`, `step`, `print` and `continue` work the same way. Editors such as VS Code put buttons on top of the same tools.

## A method, not luck

- Make the failure happen every time, with the smallest input that still shows it.
- State a guess about the cause, and check that one guess. Printing values to `std::cerr` is a perfectly good way to do it.
- Fix the cause and not the symptom.
- Add a test that would have caught it, so the bug can't return unnoticed.
--- practice
@local
Save this as `off.cpp`. First compile it normally with `g++ -std=c++17 off.cpp -o off` and run it: it most likely prints 6 and looks fine. Then compile it with `-g -fsanitize=address,undefined`, run it again, and paste the first four lines of the report.
```
#include <iostream>
#include <vector>

int main() {
    std::vector<double> v{1.0, 2.0, 3.0};
    double sum = 0.0;
    for (std::size_t i = 0; i <= v.size(); ++i) sum += v[i];
    std::cout << sum << '\n';
}
```
min: 3
= heap-buffer-overflow
! The loop condition `i <= v.size()` runs one step too far and reads `v[3]`, which doesn't exist. Without the sanitizer the program reads whatever lies behind the vector, often a zero, and the mistake stays invisible.

@choice
In the sanitizer's report, what does the line `READ of size 8` tell you?
- The program read 8 lines of input
- The vector has 8 elements
* The program tried to read 8 bytes, the size of one `double`, at an address it had no right to use
- The error happened 8 times
! Together with the stack trace below it, this tells you what was accessed and from which line of your code.

@predict
```
#include <iostream>
#include <stdexcept>
#include <vector>

int main() {
    std::vector<int> v{10, 20, 30};
    try {
        std::cout << v.at(2) << ' ';
        std::cout << v.at(3) << ' ';
    } catch (const std::out_of_range&) {
        std::cout << "out of range";
    }
    std::cout << '\n';
}
```
= 30 out of range
! `v.at(2)` is the last element. `v.at(3)` is one past the end, and `at` checks: it throws `std::out_of_range`. With `v[3]` nothing would have been checked.

@local
Save this as `crash.cpp` and compile it with `g++ -std=c++17 -g -O0 crash.cpp -o crash`. Run it under the debugger: type `gdb ./crash`, then `run`, and after the crash `bt`. On macOS use `lldb ./crash` with the same two commands. Paste the backtrace.
```
#include <iostream>

int scale(const int* p) {
    return *p * 2;
}

int main() {
    int* data = nullptr;
    std::cout << scale(data) << '\n';
}
```
min: 2
= scale
= main
! Frame #0 shows `scale` with `p=0x0`: the function was handed a null pointer and tried to read through it. Frame #1 shows who called it. Two lines of backtrace replace a lot of guessing.

@choice
Why don't you measure a program's speed with the sanitizer build?
- The sanitizers change the results
* The checking code makes the program about twice as slow and use much more memory, so the timing says nothing about the real program
- Sanitizer builds can't read files
- It is not allowed by the compiler
! Sanitizers are for testing. Benchmarks use an optimised build without them.
--- recall
Q: What is undefined behaviour?
A: Code whose effect the C++ standard doesn't define, such as reading past the end of an array. It may crash, give wrong results, or seem to work.
Q: Which compiler flags switch on AddressSanitizer and the undefined-behaviour checks?
A: -fsanitize=address,undefined, together with -g so that the report names files and lines.
Q: In gdb, what do run, bt, break and print do?
A: run starts the program, bt shows the chain of function calls at the current point, break sets a place to pause, and print shows a variable's value.
Q: A program prints the right answer. Why run it under the sanitizers anyway?
A: Memory errors often leave the output unchanged on your machine today. They are still bugs, and they can corrupt results somewhere else.

=== ml1 | ml | 7 | Machine learning basics with scikit-learn | 
## What machine learning is

In ordinary programming you write the rules: "if the mass is between 80 and 100 GeV, call it a Z candidate". In **machine learning** you give the computer examples together with the right answers, and an algorithm works out rules that fit them. The result is called a **model**. You use it to predict answers for new examples it hasn't seen.

Learning from examples with known answers is called **supervised learning**. It comes in two kinds:

- **classification** predicts a category: is this event signal or background?
- **regression** predicts a number: what was the true energy of this particle?

## The vocabulary

- A **sample** is one example: one event, one particle, one patient.
- **Features** are the measured inputs that describe a sample, such as the `pt` and `eta` of each muon.
- The **label** (or **target**) is the answer you want to predict.

By convention the features go in a table called `X`, with one row per sample and one column per feature, and the labels go in a list called `y` with one entry per sample.

**Training** (or **fitting**) is the process of adjusting the model so its predictions on the examples match their labels.

## The most important rule: hold out a test set

A model can score perfectly on its training examples simply by memorising them, and still be useless on anything new. So you can't judge a model on the data it learned from.

The solution is to split the data before doing anything else. The **training set** is used to fit the model. The **test set** is locked away and used once, at the end, to measure how well the model does on data it has never seen. That number is your honest estimate of real-world performance.

## The workflow in scikit-learn

**scikit-learn** (imported as `sklearn`) is the standard Python library for classical machine learning. Install it with `pip install scikit-learn`. Every model in it follows the same three steps: create, `fit`, `predict`.

```
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score

X, y = load_breast_cancer(return_X_y=True)      # a small built-in dataset

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

model = GradientBoostingClassifier(random_state=42)
model.fit(X_train, y_train)                     # learn from the training set

pred = model.predict(X_test)                    # predicted classes for the test set
proba = model.predict_proba(X_test)[:, 1]       # predicted probability of class 1

print(accuracy_score(y_test, pred))
print(roc_auc_score(y_test, proba))
```

What the arguments of `train_test_split` do:

- `test_size=0.25` puts a quarter of the samples in the test set.
- `random_state=42` fixes the random shuffle, so you and anyone else get the same split every time. The number itself is arbitrary. Without it, your results change from run to run.
- `stratify=y` keeps the proportion of each class the same in both parts.

`predict_proba` returns one column per class. `[:, 1]` means "all rows, column 1": the probability of the second class.

## Overfitting

A model that has learned the accidental details of its training examples instead of the general pattern is **overfitted**. The symptom is a high score on the training set and a clearly lower score on the test set. The remedies: more training data, a simpler model, fewer features, or **regularisation** (settings that penalise complexity).

The opposite, **underfitting**, is a model too simple to capture the pattern. It scores poorly on both sets.

## Don't tune on the test set

Models have settings you choose, called **hyperparameters**, such as the number of trees. If you try many values and keep the one with the best test score, you have used the test set to make a decision, and its score is no longer an honest estimate. Use a third split, a **validation set**, for such choices, or **cross-validation**, which rotates the validation role through several parts of the training data:

```
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X_train, y_train, cv=5)
```

## Choosing a metric

**Accuracy** is the fraction of predictions that are correct. It misleads when classes are unbalanced. If 99% of events are background, a "model" that always says background has 99% accuracy and finds no signal at all.

Better choices for that case:

- **precision**: of the events the model called signal, how many really were?
- **recall**: of the real signal events, how many did the model find?
- **ROC AUC**: a number between 0.5 (random guessing) and 1.0 (perfect) that measures how well the model ranks signal above background, across all possible thresholds.

## In particle physics

For years the workhorse of LHC analyses was the **boosted decision tree**, which is what `GradientBoostingClassifier` is: many small decision trees, each correcting the errors of the ones before. Neural networks now lead in tasks such as identifying which kind of quark produced a jet, and in fast simulation. Machine learning is one of openlab's main themes.
--- practice
@choice
Why is the data split into a training set and a test set?
- To make training faster
- Because scikit-learn requires two files
* To measure performance on data the model has never seen, which is the only honest estimate of how it will do in real use
- To double the amount of data
! A model can memorise its training data. Only unseen data shows whether it has learned something general.

@choice
A model scores 99.8% on the training set and 71% on the test set. What is the most likely explanation?
- Underfitting
* Overfitting: it learned details of the training examples that don't carry over
- The test set is too large
- A perfect model
! A large gap between training and test performance is the signature of overfitting.

@predict
A dataset has 990 background events and 10 signal events. A model always predicts "background". What is its accuracy, in percent? Type a number.
= 99
=| 99%
=| 99.0
! 990 of 1000 predictions are right, yet it never finds a single signal event. This is why accuracy alone can mislead.

@choice
You try 20 different settings and pick the one with the best score on the test set. What is wrong with reporting that score?
- Nothing
- 20 is too few settings to try
* The test set was used to make a choice, so the score is optimistic. Use a validation set or cross-validation for tuning
- The model should have been trained on the test set too
! Once the test set influences any decision, it no longer tells you about unseen data.

@local
Save the example from the lesson as `first_model.py` (type it yourself), run it, and paste the two numbers it prints.
min: 2
= 0.9
! Both the accuracy and the ROC AUC should be above 0.9 on this dataset. Because of `random_state=42`, you get the same numbers every time you run it.
--- recall
Q: Why must you never tune your model on the test set?
A: The test set must stay unseen to give an honest estimate. Tuning on it leaks information and makes the score too optimistic.
Q: What are the signs of overfitting?
A: A high training score and a much lower test score.
Q: Why can accuracy mislead, and what can you use instead?
A: With unbalanced classes, always guessing the majority scores high. Use ROC AUC, precision and recall.
Q: What are X and y in scikit-learn?
A: X is the table of features, one row per sample. y is the list of labels, one per sample.

=== ml2 | ml | 7 | Judging a classifier: ROC curves, thresholds and overtraining | p22,p23
## One number is not enough

The last lesson ended with a model and an accuracy. In a physics analysis nobody stops there, because a classifier doesn't make one kind of mistake. It can let background through, and it can throw signal away, and how much of each you can afford depends on what you are doing. This lesson gives you the vocabulary in which every machine-learning result at CERN is presented.

## Scores and thresholds

A classifier doesn't really answer "signal" or "background". It gives each event a **score**, a number between 0 and 1, where a high value means "looks like signal". In scikit-learn that is `model.predict_proba(X)[:, 1]`. The method `predict` only compares this score with 0.5 for you.

You are free to draw the line somewhere else. The value you choose is the **threshold**, and events with a score at or above it are **selected**. Physicists call this "cutting on the score".

## Four kinds of outcome

With a threshold set, every event falls into one of four groups:

- **true positive (TP)**: a signal event that is selected,
- **false positive (FP)**: a background event that is selected, a fake,
- **false negative (FN)**: a signal event that is rejected, and so lost,
- **true negative (TN)**: a background event that is rejected.

"Positive" means selected, and "true" or "false" says whether that decision was right. The table of these four counts is the **confusion matrix**. scikit-learn computes it with `confusion_matrix(y_true, y_pred)`, laid out as `[[TN, FP], [FN, TP]]`: one row per true class, one column per predicted class.

## The three rates

The counts depend on the size of your sample, so they are turned into fractions. Physics and machine learning use different names for the same things:

- **Signal efficiency** = TP / (TP + FN). Of all the signal events, the fraction that is kept. In machine learning it is called the true positive rate (TPR) or recall.
- **Background efficiency** = FP / (FP + TN). Of all the background events, the fraction that gets through. In machine learning it is the false positive rate (FPR). Its inverse, 1 / FPR, is the **background rejection**: a rejection of 100 means that one background event in a hundred survives.
- **Purity** = TP / (TP + FP). Of the selected events, the fraction that really is signal. In machine learning it is called precision.

An example. A sample has 1,000 signal events and 100,000 background events. A threshold selects 700 of the signal and 8,600 of the background. The signal efficiency is 700 / 1,000 = 0.70. The background efficiency is 8,600 / 100,000 = 0.086, a rejection of about 12. The purity is 700 / 9,300 = 7.5%.

Look at that last number. The classifier removes 91% of the background and still, more than nine selected events in ten are background, simply because there was a hundred times more background to begin with. The two efficiencies are properties of the classifier. The purity is a property of the classifier **and** of the mixture you feed it. That is why classifiers are described by their efficiencies, and the purity is worked out afterwards for the real mixture of events.

## The ROC curve

Moving the threshold trades one mistake for the other. A lower threshold keeps more signal and lets more background in. The **ROC curve** shows the whole trade at a glance: for every possible threshold, it plots the signal efficiency (vertical axis) against the background efficiency (horizontal axis). The odd name, "receiver operating characteristic", comes from radar engineering in the 1940s.

- A threshold above every score selects nothing: the point (0, 0).
- A threshold of 0 selects everything: the point (1, 1).
- A classifier that guesses at random gives the diagonal between the two.
- A perfect classifier passes through the top left corner, (0, 1): all of the signal and none of the background.

The closer the curve bends towards the top left corner, the better.

```
from sklearn.metrics import roc_curve, roc_auc_score

fpr, tpr, thresholds = roc_curve(y_test, score)

fig, ax = plt.subplots()
ax.plot(fpr, tpr, label=f"BDT (AUC = {roc_auc_score(y_test, score):.3f})")
ax.plot([0, 1], [0, 1], linestyle="--", label="Random guessing")
ax.set_xlabel("Background efficiency")
ax.set_ylabel("Signal efficiency")
ax.legend()
```

`roc_curve` returns three arrays of the same length: for each threshold it tried, the false positive rate and the true positive rate. In physics papers you will often see the same information drawn as background rejection against signal efficiency.

## AUC, the area under the curve

The **AUC** ("area under the curve") squeezes the ROC curve into one number: 0.5 for random guessing, 1.0 for a perfect classifier. It has a meaning you can say in one sentence: the AUC is the probability that a randomly chosen signal event gets a higher score than a randomly chosen background event.

That makes the AUC a judgement of the **ranking** only. It doesn't depend on any threshold, and it doesn't change when the sample has more or less background. An AUC below 0.5 means the scores are upside down.

Its weakness is the same thing. The AUC averages over the whole curve, and an analysis works at one point of it. Two models with the same AUC can differ a lot at the place you care about, for example at a background efficiency of 1%. So quote the AUC **and** the efficiencies at your chosen threshold.

## Choosing the working point

The threshold you finally use is called the **working point**, and the right one depends on the job:

- A trigger or a first loose selection must not lose signal, because a lost event is gone for ever. It runs at a high signal efficiency, such as 95%, and accepts a lot of background.
- A search for a rare signal under a mountain of background needs a tight threshold. The usual recipe is to compute the expected numbers of signal and background events, s and b, after the cut, and to choose the threshold where the expected significance s / √b from the lesson on counting statistics is largest.

Choose the working point on the validation set. The test set is for the final numbers only.

## Checking for overtraining

Physicists say **overtraining** for what the last lesson called overfitting. There are two standard checks, and reviewers ask for both.

The first is to compare the AUC on the training set with the AUC on the test set. A small gap, such as 0.913 against 0.910, is normal. A large one, such as 0.99 against 0.85, means the model has memorised its training events.

The second is to overlay the distributions of the score. Histogram the score separately for signal and background, once for training events and once for test events:

```
bins = np.linspace(0, 1, 41)
ax.hist(score_test[y_test == 1], bins=bins, density=True, histtype="step", label="Signal (test)")
ax.hist(score_test[y_test == 0], bins=bins, density=True, histtype="step", label="Background (test)")
```

`density=True` scales each histogram to an area of 1, so that shapes can be compared although the classes have different sizes. If the training and test shapes lie on top of each other, the model behaves the same on events it has never seen. This plot also shows you directly how well the two classes separate.

## Leakage

**Leakage** means that a feature gives away the answer, in a way that would not work on real data. Simulated events are the usual source: they carry information that real collisions never will, such as which process generated them, an event number that happens to be ordered by process, or a weight that differs between signal and background. A model given such a column gets a spectacular score and is worthless on data.

So treat a result that looks too good as a suspect. Check which features the model relies on, and ask of each one whether it would exist, with the same meaning, for a real collision.

## Events with weights

Simulated samples don't come in the proportions of nature. Rare signal is generated in bulk, because otherwise there would be nothing to train on. Each simulated event therefore carries a **weight**: the number of real events it stands for. The expected number of events in data is the sum of the weights, and it is these weighted numbers that go into s / √b. The scikit-learn metrics accept them through the argument `sample_weight`. You will use this in the next lesson.
--- practice
@predict
A selection keeps 80 signal events and 50 background events. What is its purity? Give two decimals.
= 0.62
=| .62
=| 0.615
=| 62%
=| 61.5%
! Purity is TP / (TP + FP) = 80 / 130. It says what fraction of the selected events is real signal.

@run
Write `confusion(y_true, y_pred)`. Both lists hold 1 for signal and 0 for background: the truth and the decision. Return the four counts as a tuple in the order (TP, FP, TN, FN).
```starter
def confusion(y_true, y_pred):
    tp = fp = tn = fn = 0
    # go through the two lists together and count
    return tp, fp, tn, fn
```
```test
print(confusion([1, 1, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0]))
print(confusion([0, 0], [0, 0]))
```
= (2, 1, 2, 1)
= (0, 0, 2, 0)
```solution
def confusion(y_true, y_pred):
    tp = fp = tn = fn = 0
    for t, p in zip(y_true, y_pred):
        if t == 1 and p == 1:
            tp += 1
        elif t == 0 and p == 1:
            fp += 1
        elif t == 0 and p == 0:
            tn += 1
        else:
            fn += 1
    return tp, fp, tn, fn
```
! `zip` walks the two lists together. The second word of each name is the decision (positive means selected), and the first says whether the decision was right.

@predict
Before the selection there are 1,000 signal and 100,000 background events. At the chosen working point the signal efficiency is 0.70 and the background efficiency is 0.086. How many signal events and how many background events are selected? Type the two numbers.
= 700 8600
=| 700, 8600
=| 700 and 8600
=| 700 signal and 8600 background
=| 700 signal, 8600 background
! Each efficiency multiplies its own class: 0.70 × 1,000 and 0.086 × 100,000. There are still twelve background events for every signal event, which is why rare signals need very tight working points.

@choice
A classifier has an AUC of 0.30. What does that tell you?
- It is right 30% of the time
- It keeps 30% of the signal
* It ranks background above signal more often than not. Turning the score around, 1 − score, gives an AUC of 0.70
- It is useless, like random guessing
! The AUC is the probability that a random signal event scores higher than a random background event. Random guessing gives 0.5. A value far below 0.5 carries just as much information as one far above it, with the sign flipped. In practice it usually means the labels were swapped.

@run
Write `roc_points(y_true, scores, thresholds)`. For each threshold it computes the background efficiency and the signal efficiency of the selection "score at or above the threshold", and it returns the list of (background efficiency, signal efficiency) pairs.
```starter
def roc_points(y_true, scores, thresholds):
    points = []
    # for each threshold: count selected signal and selected background
    return points
```
```test
y = [1, 1, 1, 1, 0, 0, 0, 0]
s = [0.9, 0.8, 0.6, 0.3, 0.7, 0.4, 0.2, 0.1]
for p in roc_points(y, s, [1.0, 0.75, 0.5, 0.25, 0.0]):
    print(p)
```
= (0.0, 0.0)
= (0.0, 0.5)
= (0.25, 0.75)
= (0.5, 1.0)
= (1.0, 1.0)
```solution
def roc_points(y_true, scores, thresholds):
    n_sig = sum(1 for y in y_true if y == 1)
    n_bkg = len(y_true) - n_sig
    points = []
    for t in thresholds:
        tp = sum(1 for y, s in zip(y_true, scores) if y == 1 and s >= t)
        fp = sum(1 for y, s in zip(y_true, scores) if y == 0 and s >= t)
        points.append((fp / n_bkg, tp / n_sig))
    return points
```
! These five points are a ROC curve. It starts at (0, 0) with the highest threshold and ends at (1, 1) with the lowest. `roc_curve` in scikit-learn does this for every threshold that changes the result.

@choice
A model that separates simulated signal from simulated background reaches an AUC of 1.000. One of its features is the event number, and the simulation wrote all signal events to the file first. What is going on?
- The model is perfect and ready for real data
- The model is overtrained
* Leakage: the event number gives away the label in this file, and it means nothing for real collisions
- The test set is too small
! Overtraining would show up as a gap between the training and the test score. Here both are perfect, because the leak is present in both. Remove the column and train again.

@choice
Which working point suits a trigger that decides in real time which collisions are kept at all?
- A tight one with very high purity, even if half of the signal is lost
* A loose one with a signal efficiency close to 100%, even though much background passes
- The threshold 0.5, because it is the default
- The one with the highest accuracy
! An event rejected by the trigger can never be recovered, and later steps can still remove background. A final selection has the opposite priorities.
--- recall
Q: What are signal efficiency and background efficiency?
A: The fraction of all signal events that pass the selection, TP / (TP + FN), and the fraction of all background events that pass, FP / (FP + TN).
Q: What does a ROC curve show, and what does its AUC mean?
A: Signal efficiency against background efficiency for every threshold. The AUC is the probability that a random signal event scores higher than a random background event.
Q: What is purity, and why is it not a property of the classifier alone?
A: TP / (TP + FP), the fraction of selected events that is real signal. It also depends on how much signal and background there was before the selection.
Q: What is leakage?
A: A feature that gives away the label but would not exist, or not mean the same, for real data, such as truth information or the event weight of a simulated sample.
Q: Name two checks for overtraining.
A: Compare the score (for example the AUC) on the training and the test set, and overlay the distributions of the classifier score for both sets.

=== ml3 | ml | 7 | Boosted decision trees on the Higgs dataset | p24
## A real problem

In 2014 the ATLAS experiment ran a public competition, the Higgs Boson Machine Learning Challenge. More than 1,700 teams tried to solve one task: separate simulated events in which a Higgs boson decays into two tau leptons from the background events that look almost the same. The data is now on the CERN Open Data portal as [record 328](https://opendata.cern.ch/record/328), and it is the basis of Project 3.

The physics makes this hard. A **tau** is a heavy cousin of the electron that decays almost at once, and its decay always produces neutrinos, which leave the detector unseen. So the mass of the tau pair can't be computed exactly the way you computed the dimuon mass. And the main background, a Z boson decaying into two taus, sits at 91 GeV, right next to the Higgs at 125 GeV, and is produced far more often.

## Get the data and look at it

```
curl -L -O https://opendata.cern.ch/record/328/files/atlas-higgs-challenge-2014-v2.csv.gz
```

The file is 66 MB, compressed with gzip, and pandas reads it as it is. It holds 818,238 simulated events, one per row, with these columns:

- `EventId`, a running number.
- 30 features. Names starting with `PRI_` ("primitive") are measured directly: the pT, η and φ of the tau, of the lepton and of the jets, and the missing transverse energy. Names starting with `DER_` ("derived") were computed from those by physicists, for example `DER_mass_MMC`, an estimate of the mass of the tau pair, `DER_mass_vis`, the invariant mass of the visible decay products, and `DER_deltar_tau_lep`, the ΔR between the tau and the lepton.
- `Weight`, the number of real events that this simulated event stands for.
- `Label`, which is `s` for signal or `b` for background.
- `KaggleSet` and `KaggleWeight`, bookkeeping from the competition.

Two things need care before any training.

**Missing values.** A feature that can't be computed for an event is stored as −999.0. An event without jets has no jet pT, for instance. Left alone, −999 would be treated as a real, very negative number. Replace it with **NaN** ("not a number"), the standard marker for a missing value:

```
X = df[features].replace(-999.0, np.nan)
```

**Columns that must not be features.** `EventId`, `Weight`, `Label` and the two Kaggle columns. The weight is the dangerous one: signal events have much smaller weights than background events, so a model that sees it can separate the classes almost perfectly without learning any physics. This is the leakage from the last lesson.

## Decision trees

A **decision tree** is a flowchart of yes-or-no questions about the features. "Is `DER_mass_MMC` below 140? If yes: is `DER_mass_transverse_met_lep` below 40?" Each path ends in a **leaf**, which holds a prediction. Training a tree means choosing each question, a feature and a cut value, so that the two groups it creates are as pure as possible.

A single tree is a set of rectangular cuts, which is exactly what physicists did by hand before machine learning. Its weakness: a small tree is too crude, and a tree deep enough to be precise memorises its training events.

## Boosting

**Boosting** gets around this by building many small trees, one after another.

- Start with the same prediction for every event.
- Look at the errors: for each event, the difference between the true label and the current prediction. These differences are called **residuals**.
- Train a small tree to predict the residuals. Where the model is too low, the tree gives a positive correction, and where it is too high, a negative one.
- Add the tree's output to the model, multiplied by a small number called the **learning rate**, such as 0.1, so that no single tree decides too much.
- Repeat a hundred times or more.

At the end, the sum of all the trees is squeezed into the range from 0 to 1, and that is the score. The method is called **gradient boosting**, and the result is the **boosted decision tree**, or BDT, that has been the workhorse of LHC analyses for fifteen years.

Three settings matter most. In scikit-learn they are called `max_iter`, the number of trees (100 unless you say otherwise), `learning_rate` (0.1), and `max_leaf_nodes`, the size of each tree (31). More trees and bigger trees can learn finer detail, and overtrain more easily.

The class you will use is `HistGradientBoostingClassifier`. "Hist" refers to a trick that makes it fast: it first sorts the values of every feature into at most 255 bins and works with the bin numbers, so finding a good cut means going through a small histogram instead of 600,000 values. It also accepts NaN directly: at each question it learns which way the events with a missing value should go. XGBoost and LightGBM are separate libraries built on the same idea, and XGBoost became famous through this very competition.

## The training script

```
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

df = pd.read_csv("atlas-higgs-challenge-2014-v2.csv.gz")
print("events:", len(df), " signal fraction:", round((df["Label"] == "s").mean(), 3))

features = [c for c in df.columns if c.startswith(("DER_", "PRI_"))]
X = df[features].replace(-999.0, np.nan)
y = (df["Label"] == "s").astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

model = HistGradientBoostingClassifier(random_state=42)
model.fit(X_train, y_train)

score_train = model.predict_proba(X_train)[:, 1]
score_test = model.predict_proba(X_test)[:, 1]
print("train AUC:", round(roc_auc_score(y_train, score_train), 4))
print("test AUC: ", round(roc_auc_score(y_test, score_test), 4))
```

New pieces:

- `c.startswith(("DER_", "PRI_"))` is true if the name starts with either of the two. The list comprehension collects exactly the 30 feature columns and leaves out everything else, the weight included.
- `(df["Label"] == "s")` is a column of True and False, and `.astype(int)` turns it into 1 and 0.
- `.mean()` of a True/False column is the fraction of True values.

Training takes about ten seconds on a laptop. Because of `random_state=42`, your numbers should agree with anyone else's to three decimals: a test AUC close to 0.91.

## Is 0.91 good?

A score means nothing until it stands next to something simpler. Such a reference is called a **baseline**.

The simplest one here uses a single feature. Signal should have a mass estimate near 125 GeV, so take the distance from 125 as the score, with a minus sign so that higher means more signal-like:

```
mmc = X_test["DER_mass_MMC"].fillna(0)
print("mass only:", round(roc_auc_score(y_test, -np.abs(mmc - 125)), 4))
```

`roc_auc_score` accepts any number that ranks the events. It need not lie between 0 and 1. `fillna(0)` puts 0 where the value is missing. This baseline reaches about 0.80. A linear model on all 30 features (logistic regression) reaches about 0.82. The boosted trees reach 0.91, so most of what they add comes from combining features in ways that no single cut and no straight line can.

## Which features matter

**Permutation importance** answers this with a simple experiment: shuffle the values of one feature among the test events, which destroys its link with the label, and measure how far the AUC drops. A large drop means the model relies on that feature.

```
from sklearn.inspection import permutation_importance

sub = X_test.sample(50000, random_state=1)
r = permutation_importance(model, sub, y_test.loc[sub.index],
                           scoring="roc_auc", n_repeats=3, random_state=1)
for i in np.argsort(-r.importances_mean)[:5]:
    print(features[i], round(r.importances_mean[i], 4))
```

`.sample(50000, random_state=1)` picks 50,000 random rows, which is enough and keeps it quick. `.loc[sub.index]` picks the labels of the same rows. `np.argsort(-x)` gives the positions that would sort `x` from the largest value to the smallest.

You will find `DER_mass_MMC` far in front, followed by the two other mass-like features. And the five φ angles come out at zero. That is a good sign, with a physical reason: the detector looks the same all the way around the beam, so the absolute direction of a particle in φ says nothing about what kind of event it was. Only the angles between particles matter, and the derived features contain those. A model that found φ important would have learned an accident of the simulation.

## From a score to physics

The file contains 34% signal. Nature doesn't. The sum of the weights says what ATLAS expected in its 2012 data: about 690 signal events among 411,000 background events, one in six hundred. With no selection, s / √b is 690 / √411,000, about 1.1.

To see what the classifier buys, compute the expected numbers after a cut on the score. The test set is a quarter of the events, so multiply by 4:

```
w_test = df.loc[X_test.index, "Weight"]

def expected(selected):
    s = 4 * w_test[selected & (y_test == 1)].sum()
    b = 4 * w_test[selected & (y_test == 0)].sum()
    print(f"s = {s:.0f}  b = {b:.0f}  s/sqrt(b) = {s / np.sqrt(b):.2f}")

expected(score_test >= 0.5)
```

`selected` is a mask over the test events, and `&` combines two masks: selected **and** signal. The sum of the weights of those events, times 4, is the expected number of signal events after the cut.

Then try other thresholds, and compare with the best you can do with a window on the mass alone, such as `(mmc > 100) & (mmc < 150)`. With a well-chosen threshold, the classifier more than doubles the significance of the best mass window. The winning teams of the competition reached values a little higher still, with far more elaborate models. That is the size of the gain that made machine learning standard at the LHC.

## What Project 3 must show

- The script above, extended with the baseline, the importances and the expected yields.
- A ROC plot with the model and the baseline on the same axes.
- The score distributions for signal and background, for training and test events.
- A README that states the numbers and says what each of them means.
--- practice
@choice
Why must the column `Weight` not be given to the model as a feature?
- It contains missing values
- It is a text column
* It differs strongly between signal and background in the simulation, so the model could separate them without physics, and no real collision comes with a weight
- It would make the training too slow
! This is leakage. A feature has to be something you could measure for a real event.

@predict
```
def stump(mass):
    if mass > 120:
        return 0.8
    return 0.1

print([stump(m) for m in [130, 100, 125]])
```
= [0.8, 0.1, 0.8]
! A tree with a single question is called a stump. It has two leaves, and every event gets the value of the leaf it lands in.

@choice
In gradient boosting, what is each new tree trained to predict?
- The labels, exactly like the first tree
- The scores of a random subset of events
* The errors that the model built so far still makes
- The weights of the events
! Each tree corrects what the earlier ones got wrong. Adding it with a small learning rate keeps any single tree from dominating.

@run
One round of boosting with the smallest possible tree. Write `boost_step(pred, y, x, cut, rate)`. The tree asks one question, `x < cut`. Each of its two leaves predicts the mean residual (label minus current prediction) of the events that land in it. Return the new predictions: the old one plus `rate` times the value of the event's leaf.
```starter
def boost_step(pred, y, x, cut, rate):
    # 1. residuals of the events with x < cut, and of the others
    # 2. the mean of each group
    # 3. new prediction = old prediction + rate * mean of the event's group
    pass
```
```test
x = [90, 100, 110, 115, 125, 130]
y = [0, 0, 0, 1, 1, 1]
p1 = boost_step([0.5] * 6, y, x, 120, 0.5)
print(p1)
print(boost_step(p1, y, x, 120, 0.5))
```
= [0.375, 0.375, 0.375, 0.375, 0.75, 0.75]
= [0.3125, 0.3125, 0.3125, 0.3125, 0.875, 0.875]
```solution
def boost_step(pred, y, x, cut, rate):
    left = [t - p for p, t, v in zip(pred, y, x) if v < cut]
    right = [t - p for p, t, v in zip(pred, y, x) if v >= cut]
    step_left = sum(left) / len(left)
    step_right = sum(right) / len(right)
    return [p + rate * (step_left if v < cut else step_right)
            for p, v in zip(pred, x)]
```
! Round by round, the right leaf moves towards 1, and the left leaf towards 0.25, the fraction of signal among its four events. A stump with this cut can't do better than that. The next tree would have to ask a different question, and that is how boosting builds up detail.

@local
Download the dataset and write the training script from the lesson as `train_higgs.py`. Type it, don't paste it. Run it and paste the three lines it prints.
min: 3
= AUC
= 0.9
! Expect 818238 events with a signal fraction of 0.342, a training AUC near 0.913 and a test AUC near 0.910. The small gap between the two says there is no overtraining worth worrying about.

@predict
After a cut on the score you expect 200 signal events and 2,500 background events. What is s / √b?
= 4
=| 4.0
=| 4 sigma
=| 4σ
! √2,500 is 50, and 200 / 50 = 4. The background count fluctuates by about 50 events, and the signal is four times that.

@choice
You shuffle the values of one feature in the test set and the AUC stays the same. What can you conclude?
- The feature has a bug
- The model is overtrained
* The model doesn't rely on that feature: it carries no useful information, or another feature carries the same information
- The feature is the most important one
! This is permutation importance. A drop of zero doesn't prove the feature is useless in principle. Two features that hold the same information can cover for each other.
--- recall
Q: How does gradient boosting build its model?
A: It adds small decision trees one at a time. Each new tree is trained on the errors of the model so far, and its output is added with a small learning rate.
Q: Which columns of the Higgs dataset must not be used as features, and why?
A: EventId, Weight, Label and the Kaggle columns. They are bookkeeping or give away the answer, and they don't exist for real collisions.
Q: What is permutation importance?
A: Shuffle one feature among the test events and measure how much the score drops. A large drop means the model relies on that feature.
Q: Why compare a model with a baseline?
A: A score only means something next to a simple alternative, such as a cut on one variable or a linear model.
Q: What does the weight of a simulated event mean?
A: The number of real events it stands for. The expected number of events in data is the sum of the weights.

=== c15 | cpp | 8 | Measuring speed: chrono, optimisation levels and honest benchmarks | c19
## Measure, don't guess

People choose C++ at CERN for speed: the trigger and the reconstruction have to process events in milliseconds, millions of times over. But programmers, experts included, are bad at guessing where a program spends its time. The rule is to measure, change one thing, and measure again. This lesson shows how to time code and how to avoid the common ways in which a measurement lies.

## Timing with chrono

The header `<chrono>` has clocks. Take the time before and after the work:

```
#include <chrono>

auto t0 = std::chrono::steady_clock::now();
// ... the work ...
auto t1 = std::chrono::steady_clock::now();
double seconds = std::chrono::duration<double>(t1 - t0).count();
```

`steady_clock` is a clock that only moves forward at an even rate, which is what a stopwatch needs. The other common clock, `system_clock`, is the time of day and can jump when the computer corrects it. `t1 - t0` is a duration, and converting it to `std::chrono::duration<double>` and calling `.count()` gives plain seconds as a `double`. `auto` saves you from writing the long type names.

From the shell, `time ./prog` times a whole program. Its line `real` is the time that passed on the wall clock.

## Optimisation levels

By default `g++` translates your code literally and makes no effort to be fast. That is level `-O0`, and it is what you want with a debugger. The flags `-O1`, `-O2` and `-O3` let the compiler rewrite your code into something faster with the same result:

- small functions such as `v[i]` and `v.size()` are pasted in at the place of the call (**inlining**),
- values are kept in the processor's registers instead of being stored to memory and loaded back,
- calculations that are repeated or never used are removed,
- loops are rearranged.

`-O2` is the normal choice for anything that should be fast. The difference from `-O0` is usually a factor of two to ten, depending on the code. With CMake, `-DCMAKE_BUILD_TYPE=Release` switches the optimisation on.

Nobody runs real work at `-O0`. A timing of an unoptimised build is a measurement of the wrong program.

## Four ways a benchmark lies

**The work is optimised away.** If the result of a calculation is never used, the optimiser deletes the calculation. A loop that adds a billion numbers and then throws the sum away "runs" in a fraction of a microsecond, because it doesn't run at all. Always use the result, for example by printing it.

**One run is not a measurement.** Other programs, a cold disk and the processor changing its speed all disturb a single run. Repeat it at least five times and report the **median**, the middle value, which ignores the odd slow run. If the runs differ a lot, say so.

**The input is too small.** A measurement of a few microseconds is mostly noise. Make the work last at least a tenth of a second.

**You time the wrong part.** Reading a CSV file is often slower than the calculation done on it. Time the reading and the computing separately, or you will optimise the part that doesn't matter.

## Throughput

For event processing, the natural figure is events per second:

```
double rate = n_events / seconds;
```

A complete, honest result names what was measured and how: the machine, the compiler and its flags, the input size, the number of runs, and the median.

## What to compare with

For Project 2 you will compare three things on the same 100,000 events: your C++ program built with `-O0`, the same program built with `-O2`, and your Python analysis. Expect two surprises.

First, the physics is the cheap part. Computing 100,000 masses and filling the histogram takes about a millisecond, and reading the text file takes a hundred times longer. So time the two separately, and repeat the fast part a few hundred times, so that there is something to measure.

Second, a Python `for` loop over the events is ten or more times slower than C++, but the NumPy version from Project 1 keeps up with it, because NumPy's loops run in compiled, optimised code too. So the lesson is not that Python is slow. A loop that runs in the Python interpreter is slow, and the cure is to move it into compiled code, with NumPy or with C++. How to make the C++ version pull clearly ahead is where phase 2 begins.
--- practice
@local
Save this as `timing.cpp`. It does 200 million multiply-and-add steps. Compile it twice, with `g++ -std=c++17 -O0 timing.cpp -o t0` and with `-O2` into `t2`. Run each three times and paste all six lines.
```
#include <chrono>
#include <iostream>
#include <vector>

int main() {
    std::vector<double> v(1000);
    for (std::size_t i = 0; i < v.size(); ++i) v[i] = 0.001 * i;

    auto t0 = std::chrono::steady_clock::now();
    double sum = 0.0;
    for (int repeat = 0; repeat < 200000; ++repeat) {
        for (std::size_t i = 0; i < v.size(); ++i) {
            sum += v[i] * v[i];
        }
    }
    auto t1 = std::chrono::steady_clock::now();
    double seconds = std::chrono::duration<double>(t1 - t0).count();
    std::cout << "sum " << sum << "  seconds " << seconds << '\n';
}
```
min: 6
= sum 6.65667e+07
! Both builds print the same sum, as they must. The optimised one is typically two to five times faster on this loop. At `-O0`, every `v[i]` and `v.size()` is a real function call, and at `-O2` they cost nothing.

@choice
A benchmark adds a billion numbers in a loop and reports 0.0000002 seconds at `-O2`. The sum is never printed or used. What happened?
- The computer is extremely fast
- The clock is broken
* The optimiser saw that the result is never used and removed the loop
- The loop overflowed
! A modern processor does a few billion simple operations per second, so a billion additions can't take 0.2 microseconds. Use the result, and be suspicious of timings that are too good.

@predict
A program processes 100,000 events in 0.25 seconds. How many events per second is that?
= 400000
=| 400,000
=| 4e5
=| 400000 events per second
! 100,000 / 0.25. Throughput is the figure people compare, because it doesn't depend on the size of the input.

@choice
Five runs of the same program take 1.92, 1.90, 2.41, 1.91 and 1.93 seconds. Which number do you report?
- The mean, 2.01 s
* The median, 1.92 s. The run of 2.41 s was disturbed by something else on the machine
- The slowest, 2.41 s
- The sum, 10.07 s
! The mean is pulled up by one disturbed run. The median, or the fastest run, describes what the program can do.

@write
From memory: a function `process(events)` exists, and `events` is a vector. Write the lines that time one call to it and print the throughput in events per second.
min: 5
```solution
auto t0 = std::chrono::steady_clock::now();
process(events);
auto t1 = std::chrono::steady_clock::now();
double seconds = std::chrono::duration<double>(t1 - t0).count();
std::cout << events.size() / seconds << " events per second\n";
```
! Clock before, work, clock after, convert to seconds, divide. For a real benchmark you would wrap this in a loop of several runs and report the median.
--- recall
Q: Which clock do you use to time code in C++, and how do you get seconds from it?
A: std::chrono::steady_clock::now() before and after the work. std::chrono::duration<double>(t1 - t0).count() gives the seconds.
Q: What is the difference between -O0 and -O2?
A: -O0 does no optimisation and is for debugging. -O2 is the normal optimised build and is typically several times faster.
Q: Name two ways a benchmark can mislead you.
A: The optimiser removes work whose result is never used, and a single run can be disturbed by other activity on the machine. Use the result, and repeat the run.
Q: How do you compute throughput?
A: The number of events divided by the time in seconds.

=== ph7 | phys | 8 | From collision to plot: trigger, reconstruction, simulation and the Grid | 
## The chain

Your projects started from a tidy table of muons. Between a collision and that table lies a chain of hardware and software that thousands of people build and run, and almost every student project at CERN works on one link of it. This lesson walks along the chain. When you read a project description in spring, you should be able to say where on it the project sits.

## 1. The trigger: deciding what to keep

Bunches cross up to 40 million times a second, and one recorded event takes about a megabyte. Storing everything would mean 40 terabytes per second. It is impossible, and also pointless, since nearly all collisions are ordinary. So each experiment has a **trigger**, a system that decides in real time which collisions to keep. An event that the trigger rejects is gone for good.

ATLAS and CMS do it in two stages. The **Level-1 trigger** is custom electronics built around **FPGAs**, chips whose logic circuits can be reprogrammed. It looks at coarse data from the calorimeters and the muon detectors and decides within a few millionths of a second, keeping about 100,000 events per second out of 40 million. The **high-level trigger** (HLT) is software running on a farm of thousands of processor cores, in recent years with GPUs as well. It reconstructs each surviving event more carefully and keeps a few thousand per second.

LHCb took a radical step for Run 3. It removed the hardware stage and reconstructs every bunch crossing in software, with the first stage running entirely on GPUs.

This is where much of today's computing research at CERN happens: running machine-learning models inside FPGAs within microseconds, moving reconstruction to GPUs, and looking for unusual events without knowing in advance what they look like.

## 2. Reconstruction: from signals to particles

What the detector records is raw electronic signals: which sensors fired, and how much charge each collected. **Reconstruction** turns that into physics. Hits in the tracker are joined into **tracks**, the paths of charged particles. Energy deposits in the calorimeters are grouped into clusters. Tracks and clusters are then combined and identified as electrons, muons, photons, **jets** (the sprays of particles from quarks and gluons) and missing transverse momentum. The result is a list of physics objects, each with pT, η and φ, such as the muons in your CSV file.

The reconstruction software of an experiment is millions of lines of C++: Athena for ATLAS, CMSSW for CMS. The first pass over the data runs within days at CERN's own data centre.

## 3. Data formats: smaller and smaller

Nobody analyses raw data. Each step keeps less per event, so that more events fit on disk. CMS goes from RAW (about 1 MB per event) through AOD and MiniAOD to **NanoAOD**, about 2 kB per event: a flat table of physics objects that fits on a laptop. ATLAS has an equivalent chain ending in a format called PHYSLITE.

These files are **ROOT files**. They store data column by column: all muon pT values together, all η values together, each column compressed. An analysis that needs three quantities reads three columns and skips the rest, which is the main reason it can go through billions of events.

## 4. Simulation: the other half of every analysis

To interpret data you need to know what a given process would look like in the detector. That comes from **Monte Carlo simulation**, named after the casino because it is built on random numbers. It has three steps:

- An **event generator**, such as Pythia or MadGraph, produces the particles that come out of a collision according to the theory.
- **Geant4** tracks every one of those particles through a detailed model of the detector, simulating how each interacts with the material. This is the most expensive computing step in the whole field.
- The simulated signals go through the **same reconstruction software** as real data.

The result looks like data, with one addition: for each simulated event you know the truth. Simulation is used to design selections, to measure how efficient they are, to predict backgrounds, and finally to compare with data. Experiments simulate more events than they record.

## 5. The Grid

All of this needs far more computing than one site can offer. The **Worldwide LHC Computing Grid** connects about 170 computing centres in more than 40 countries, with over a million processor cores and more than an exabyte of storage. An exabyte is a million terabytes. It is organised in tiers. **Tier-0** is CERN, which keeps the raw data on tape and does the first reconstruction. Fifteen large **Tier-1** centres hold copies and reprocess the data. Some 150 **Tier-2** sites at universities and laboratories run simulation and analysis jobs.

Some names you will hear in your first week: **Rucio** keeps track of where every file is. **HTCondor** is the batch system that queues and runs jobs. **CVMFS** delivers the experiments' software to every machine. **EOS** is CERN's disk storage system, and the tape archive behind it is called **CTA**.

## 6. Analysis

The last link is the one your projects imitate: select events, fill histograms, compare data with simulation, fit, and quote a result with its uncertainties.

## Why this needs you

The High-Luminosity LHC will produce several times more data per year, with events that are several times more complex, and computing budgets will not grow to match. The gap has to be closed by better software: faster and parallel C++, GPUs, machine learning in place of slow algorithms, leaner data formats, and smarter storage and scheduling. Each of those is a line of openlab projects, and each is something you will have touched by the end of this programme.
--- practice
@predict
The Level-1 trigger keeps about 100,000 of the 40 million bunch crossings each second. It keeps one crossing in how many?
= 400
=| 1 in 400
=| one in 400
! 40,000,000 / 100,000 = 400. The high-level trigger then reduces what is left by another factor of several tens.

@predict
An experiment records 1,000 events per second, and each event takes 1 MB. How many terabytes is that per day? One terabyte is a million megabytes, and a day has 86,400 seconds.
= 86.4
=| 86
=| 86.4 TB
=| 86,4
! 1,000 MB per second times 86,400 seconds is 86.4 million MB. That is after the trigger has thrown away 99.9975% of the collisions.

@choice
Which order is correct?
- Reconstruction, Level-1 trigger, high-level trigger, analysis
* Level-1 trigger, high-level trigger, reconstruction, analysis
- High-level trigger, Level-1 trigger, analysis, reconstruction
- Analysis, reconstruction, high-level trigger, Level-1 trigger
! The hardware trigger decides first, within microseconds. The software trigger refines the choice, and only what survives is fully reconstructed and analysed.

@choice
Why do simulated events go through the same reconstruction software as real data?
- To save disk space
- Because the generators can't write files
* So that simulation and data can be compared like for like, with every detector effect and every software imperfection included in both
- To make the simulation run faster
! If simulation were reconstructed differently, a difference between data and simulation could come from the software instead of from physics.

@write
Pick one link of the chain: the trigger, reconstruction, simulation, storage or analysis. In your own words, explain why computing is a bottleneck there and name one approach that is being used to deal with it.
min: 50
```solution
Detector simulation with Geant4 is the most expensive computing step: every particle of every simulated event is tracked through the detector material, and the experiments need more simulated events than real ones. With the High-Luminosity LHC the need grows several times while the budget stays flat. One approach is fast simulation, where a machine-learning model trained on Geant4 output generates the response of the calorimeter directly, thousands of times faster. Another is running the particle transport on GPUs.
```
! Any link is a good answer if you can say what makes it expensive and what is being tried. This paragraph is also practice for the motivation letter and for a supervisor's call.
--- recall
Q: What are the two trigger stages at ATLAS and CMS, and what runs them?
A: The Level-1 trigger, in custom electronics with FPGAs, decides within microseconds. The high-level trigger, software on a computer farm, reduces the rate further to a few thousand events per second.
Q: What is reconstruction?
A: Turning raw detector signals into physics objects: hits into tracks, energy deposits into clusters, and those into electrons, muons, photons, jets and missing momentum.
Q: What are the three steps of simulating an event?
A: An event generator produces the particles of a collision, Geant4 simulates their passage through the detector, and the result goes through the same reconstruction as real data.
Q: What is the Worldwide LHC Computing Grid?
A: About 170 computing centres around the world, organised in tiers around CERN's Tier-0, that store, process and simulate LHC data.

=== ap4 | app | 8 | Submitting the applications | 
## Two applications, not one

Both programmes take applications through CERN's careers site. Each programme is its own call there, like a separate job opening. Applying to one does **not** enter you for the other. You fill in and submit two applications, mostly with the same documents.

## Get the documents ready first

Don't open the form until every file is finished and sitting in one folder, as a PDF with a clear name:

```
Firstname_Lastname_CV.pdf
Firstname_Lastname_Transcript.pdf
Firstname_Lastname_Reference.pdf
Firstname_Lastname_Enrolment.pdf
Firstname_Lastname_Motivation.pdf
```

What each one is:

- **CV**: the one from the CV lesson, one page.
- **Transcript**: your most recent official record of courses and grades, in English or French if your university can issue one. It must not be password-protected, or nobody can open it.
- **Reference**: one academic reference letter, dated less than 12 months before you apply.
- **Enrolment**: a certificate from your university stating that you are currently a student. Ask the student office early, because these can take days.
- **Motivation**: the letter, recommended for openlab.

Open every PDF once before you start. Check that it is the final version, the right way up, and readable.

## The process, step by step

- Create **one account** on the careers site and fill in your profile. Use an email address you will still read in April.
- Open the 2027 Summer Student call and start the application.
- Fill in education, languages and fields of interest. Pick the fields that match what your CV shows, for example computing, software development or data analysis. Your choices are used to match you with supervisors, so a field you can't back up doesn't help you.
- Upload the documents. **They can't be added or replaced after you submit.**
- On the summary page, stop. Read it once, slowly, from top to bottom. Check each uploaded file name.
- Submit, and save the confirmation email or a screenshot.
- Repeat for the openlab call, adding the motivation letter and naming your preferred area.

## Why you aim for 15 January

The deadline is 21 January at 23:59, Geneva time. Aim to have both submitted by **15 January**. There are three reasons. Sites slow down or fail in the last hours, when everybody submits at once. A problem you discover, such as an unreadable transcript, needs days to fix, and you can only fix it **before** submitting. And the deadline is in Geneva's time zone, which may not be yours.

Check the exact dates on the careers site when you start. The dates in this plan came from programme listings and the official page is the authority.

## After submitting

Log in again the next day and confirm that both applications show as submitted. Keep your confirmation emails.

Then keep going. Results are expected around early April. Some supervisors contact candidates for a short call before choosing, and the things they ask about are the things on your CV. Your drills and your project are the preparation for that, so don't stop them in January.

Finally, tell your referee that you have applied, and thank them again.
--- practice
@choice
You have submitted the Summer Student application. Are you now also considered for openlab?
- Yes, both are handled together
- Yes, if you ticked computing as a field
* No. They are separate calls and each needs its own application
- Only if your motivation letter mentions openlab
! Two calls, two submissions. Most of the documents are the same.

@predict
Count them. How many PDF files should be in your folder before you start the openlab application? Type a number.
= 5
=| five
! CV, transcript, reference letter, enrolment certificate and motivation letter.

@choice
An hour after submitting, you realise the transcript you uploaded is last year's. What does this lesson tell you about that situation?
- You can simply upload a new one from your account
* Documents can't be replaced after submission, which is why every file is opened and checked before you start and again on the summary page
- CERN will ask you for the right one
- The application is automatically withdrawn
! The check on the summary page exists for exactly this. If it does happen, contacting the recruitment team is the only route, and it is not guaranteed to work.

@choice
Why plan to submit on 15 January when the deadline is the 21st?
- Early applications are scored higher
- The form closes on the 15th for students
* It leaves days to fix a problem with a document, and avoids the last hours when the site is slowest
- Referees need the extra week
! Nothing suggests early applications are favoured. The buffer is for you.

@write
Type the five file names you will use, with your own name in them, one per line. Then create a folder with that name pattern on your computer today, even if it is still empty.
min: 5
```solution
Andrei_Surname_CV.pdf
Andrei_Surname_Transcript.pdf
Andrei_Surname_Reference.pdf
Andrei_Surname_Enrolment.pdf
Andrei_Surname_Motivation.pdf
```
! Five files: CV, transcript, reference, enrolment and motivation. If you missed one, that is the one to chase first.
--- recall
Q: Which five PDFs should be ready before you start the applications?
A: CV, transcript, reference letter, enrolment certificate, and the motivation letter for openlab.
Q: Why submit by 15 January instead of the 21st?
A: The site can slow down near the deadline, and documents can't be added after you submit.
Q: Can one application cover both programmes?
A: No. They are separate calls, so you submit twice.
Q: What do you do on the summary page before pressing submit?
A: Read it once slowly and check every uploaded file name, because nothing can be changed afterwards.

=== x2 | exam | 8 | Checkpoint 2: C++ and physics from memory | 90,10
This checkpoint covers the C++ of weeks 1 to 8 and the physics lessons. There are fourteen tasks.

Three are complete C++ programs. You write each one from an empty file on your own machine, compile it with `g++ -std=c++17 -Wall -Wextra`, run it, and paste what it prints. Give them most of your time: about fifteen minutes each. The other eleven are questions with one answer, and you get one attempt at each.

Before you start the clock: open a terminal in an empty folder and an editor with autocompletion from AI switched off. Check that `g++ --version` works. Then close everything else.

--- practice
@local
Write `numbers.cpp`. The program takes a file name on the command line and reads whole numbers from that file until it ends. It prints three lines: `evens` followed by how many of the numbers are even, `max` followed by the largest, and then the distinct values in ascending order, separated by spaces. If the file can't be opened, it prints a message to `std::cerr` and returns 1. Compile it to `numbers`, run the three commands and paste the output.
```
printf '5 3 8 3 10 5 1\n' > nums.txt
./numbers nums.txt
./numbers nothere.txt; echo "exit $?"
```
min: 4
= evens 2
= max 10
= 1 3 5 8 10
= exit 1
```solution
#include <algorithm>
#include <fstream>
#include <iostream>
#include <vector>

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "usage: numbers FILE\n";
        return 1;
    }
    std::ifstream in(argv[1]);
    if (!in) {
        std::cerr << "cannot open " << argv[1] << '\n';
        return 1;
    }

    std::vector<int> v;
    int x;
    while (in >> x) v.push_back(x);

    int evens = 0;
    for (int n : v) {
        if (n % 2 == 0) ++evens;
    }
    std::sort(v.begin(), v.end());

    std::cout << "evens " << evens << '\n';
    std::cout << "max " << v.back() << '\n';
    for (std::size_t i = 0; i < v.size(); ++i) {
        if (i > 0 && v[i] == v[i - 1]) continue;
        std::cout << v[i] << ' ';
    }
    std::cout << '\n';
}
```
! The parts: `argc` and `argv`, an `ifstream` that is checked, the read loop `while (in >> x)`, and `std::sort`. After sorting, the largest value is at the back and equal values are neighbours, so skipping a value equal to the one before it leaves the distinct ones. A `std::map` or `std::set` works too.

@local
Write `hist.cpp` with a class `Histogram`. Its constructor takes the number of bins and the lower and upper edge. `fill(x)` adds one to the right bin. A value below the range counts as underflow, and a value at or above the upper edge as overflow. In `main`, make a histogram with 10 bins from 0 to 10, fill it with 0.5, 1.2, 1.9, 9.99, -1.0 and 10.0, and print the ten bin counts on one line and `underflow U overflow O` on the next. Paste the output.
min: 2
= 1 2 0 0 0 0 0 0 0 1
= underflow 1 overflow 1
```solution
#include <iostream>
#include <vector>

class Histogram {
public:
    Histogram(int bins, double lo, double hi) : lo_(lo), hi_(hi), counts_(bins, 0) {}

    void fill(double x) {
        if (x < lo_) { ++underflow_; return; }
        if (x >= hi_) { ++overflow_; return; }
        int i = static_cast<int>((x - lo_) / (hi_ - lo_) * counts_.size());
        ++counts_[i];
    }

    void print() const {
        for (int c : counts_) std::cout << c << ' ';
        std::cout << '\n';
        std::cout << "underflow " << underflow_ << " overflow " << overflow_ << '\n';
    }

private:
    double lo_, hi_;
    std::vector<int> counts_;
    int underflow_ = 0;
    int overflow_ = 0;
};

int main() {
    Histogram h(10, 0.0, 10.0);
    for (double x : {0.5, 1.2, 1.9, 9.99, -1.0, 10.0}) h.fill(x);
    h.print();
}
```
! The bin number is the distance from the lower edge, divided by the width of the range, times the number of bins, cut down to a whole number. Checking the two edges first keeps that index inside the vector. Private data with a trailing underscore, a constructor with an initialiser list, and `const` on the function that only reads.

@local
Write `mass.cpp` with a struct `FourVector` that holds E, px, py and pz, has an `operator+` and a function `mass()`. In `main`, print three masses, one per line: of the sum of (45.6, 45.6, 0, 0) and (45.6, -45.6, 0, 0), of the sum of (50, 30, 0, 40) and (50, -30, 0, -40), and of the single vector (50, 30, 0, 40). The numbers are E, px, py, pz in GeV. Paste the output.
min: 3
= 91.2
= 100
```solution
#include <algorithm>
#include <cmath>
#include <iostream>

struct FourVector {
    double E, px, py, pz;

    FourVector operator+(const FourVector& o) const {
        return {E + o.E, px + o.px, py + o.py, pz + o.pz};
    }
    double mass() const {
        double m2 = E * E - (px * px + py * py + pz * pz);
        return std::sqrt(std::max(0.0, m2));
    }
};

int main() {
    FourVector a{45.6, 45.6, 0.0, 0.0};
    FourVector b{45.6, -45.6, 0.0, 0.0};
    FourVector c{50.0, 30.0, 0.0, 40.0};
    FourVector d{50.0, -30.0, 0.0, -40.0};
    std::cout << (a + b).mass() << '\n';
    std::cout << (c + d).mass() << '\n';
    std::cout << c.mass() << '\n';
}
```
! The three lines are 91.2, 100 and 0. In the first two pairs the momenta cancel, so the mass is the sum of the energies. The single vector has E equal to the size of its momentum, which makes it massless.

@predict
```
#include <iostream>

void by_value(int x) { x += 10; }
void by_ref(int& x) { x += 10; }
void by_ptr(int* x) { *x += 90; }

int main() {
    int a = 1;
    by_value(a);
    std::cout << a << ' ';
    by_ref(a);
    std::cout << a << ' ';
    by_ptr(&a);
    std::cout << a << '\n';
}
```
= 1 11 101
! `by_value` changes its own copy, so `a` stays 1. `by_ref` works on `a` itself: 11. `by_ptr` receives the address of `a` and changes what is stored there: 101.

@predict
```
#include <iostream>
#include <string>

struct Shape {
    virtual std::string name() const { return "shape"; }
    virtual ~Shape() = default;
};

struct Circle : Shape {
    std::string name() const override { return "circle"; }
};

void by_ref(const Shape& s) { std::cout << s.name() << ' '; }
void by_val(Shape s) { std::cout << s.name() << '\n'; }

int main() {
    Circle c;
    by_ref(c);
    by_val(c);
}
```
= circle shape
! Through a reference, the virtual call finds the `Circle` version at run time. Passing by value copies only the `Shape` part of the object, which is called slicing, and the copy really is a `Shape`.

@predict
```
#include <iostream>
#include <string>

template <typename T>
T larger(T a, T b) {
    return a > b ? a : b;
}

int main() {
    std::cout << larger(std::string("mu"), std::string("tau")) << ' '
              << larger(2.5, 1.5) << ' ' << larger(7, 3) / 2 << '\n';
}
```
= tau 2.5 3
! Strings compare alphabetically, and "tau" comes after "mu". For the last call T is `int`, so the result 7 is an `int`, and 7 / 2 is integer division: 3.

@choice
A class allocates an array with `new` in its constructor and frees it with `delete[]` in its destructor. What else must it define before objects of it can be copied safely?
- Nothing. The compiler generates correct copies
- A default constructor
* A copy constructor and a copy assignment operator, because the generated ones copy only the pointer, and two objects would then free the same memory
- A virtual destructor
! This is the rule of three: a class that needs its own destructor almost always needs its own copy constructor and copy assignment too. Better still, hold a `std::vector` and need none of them.

@choice
In a `CMakeLists.txt`, what does `target_link_libraries(app PRIVATE stats)` do?
- It builds the library `stats` from the sources of `app`
* It makes the program `app` use the library `stats`: the library is linked in, and `app` gets the include folders that `stats` declared as PUBLIC
- It installs `stats` on the system
- It runs the tests of `stats` before building `app`
! Linking a target passes on its public properties, which is why `app` finds the library's headers without any further line.

@choice
A loop reads `v[v.size()]` once, one element past the end of a vector, and the program still prints the right result. Which statement is true?
- The code is correct, because the output is correct
- `std::vector` checks every index, so nothing was read
* It is undefined behaviour that happened to do no visible harm this time. Building with `-fsanitize=address` would report it
- The compiler would have refused to compile it if it were wrong
! Reading past the end is not checked by `[]`. Whatever lies behind the vector is read, and the result can change with the compiler, the flags or the day.

@choice
Which part of a detector such as ATLAS or CMS measures the energy of electrons and photons?
- The tracker
* The electromagnetic calorimeter
- The hadronic calorimeter
- The muon chambers
! Electrons and photons shower and stop in the electromagnetic calorimeter. The tracker measures the paths of charged particles and doesn't see photons at all.

@choice
You count 10,000 events in a peak. What is the relative statistical uncertainty of that number?
- 0.01%
- 0.1%
* 1%
- 10%
! The uncertainty of a count is √N, here 100, and 100 / 10,000 is 1%. For 0.1% you would need a hundred times more events.

@choice
A fit returns χ²/ndf = 1.1. What does that tell you?
- The fit failed
- The fitted parameters are wrong by 10%
* The model describes the data about as well as the error bars allow
- The uncertainties are 1.1 times too small
! On average each point contributes about 1 to χ² when the model is right and the uncertainties are realistic. Values far above 1 point to a wrong model, and values far below 1 to overestimated errors.

@predict
Two photons fly apart back to back, each with an energy of 62.5 GeV. What is their invariant mass in GeV?
= 125
=| 125.0
=| 125 GeV
! Photons are massless and the momenta cancel, so the mass is the sum of the energies. This is how the Higgs boson shows up in its decay to two photons.

@predict
A process has a cross-section of 50 pb. How many events of it are produced in 20 fb⁻¹ of collisions? Type the number.
= 1000000
=| 1,000,000
=| 1e6
=| 10^6
=| 1 million
=| one million
! N = σ × L. 50 pb is 50,000 fb, and 50,000 fb × 20 fb⁻¹ = 1,000,000.

=== ap5 | app | 9 | The interview: supervisors' calls and how to answer | 
## Why prepare for a call that may not come

There is no fixed interview round for summer students. The supervisors who proposed projects read the applications that match and choose. Some decide from the documents alone. Others first invite a few candidates to a short video call, often no longer than half an hour. Practice differs from team to team, so you can't know which it will be.

Prepare anyway. A call is where a prepared candidate pulls ahead of an equally good CV. And everything in this lesson is the same for any internship interview you will ever have.

## What the supervisor is trying to find out

Behind all the questions there are only three.

- **Is the work on the CV really yours?** Anyone can list projects. Only the person who built one can say why it is built that way, what went wrong, and what they would change.
- **Can you learn and work on your own?** You will get a problem in a field you don't know and nine weeks to make progress. The supervisor has little time. They are looking for someone who reads, tries, narrows the problem down and then asks a precise question.
- **Will you be good to work with?** Do you explain clearly? Do you say when you don't understand? Are you curious about their project?

They are not testing whether you know particle physics. Nobody expects that from a computing student. They do notice if you took the trouble to understand what their group does.

## The questions that come

- **"Tell me about yourself."** Sixty to ninety seconds: what you study, the two things you have built that matter most, and why this project. Don't recite your CV.
- **"Tell me about a project."** This is the pitch you write this week. Start with one sentence that says what it is and what came out, and give the details afterwards.
- **Follow-ups that go deep.** "Why did you choose that approach?" "How do you know the result is right?" "What was the hardest bug?" "What would you do differently?" This is where the call is decided. Your answers are in the work you did: the tests, the comparison between C++ and Python, the mass that came out low.
- **Basics from your CV.** If it says C++, expect something like "what is the difference between a pointer and a reference?" or "what does virtual do?". If it says Git, "what happens in a merge?". If it says machine learning, "what is overtraining and how did you check for it?". Your drills and recall cards are the preparation for these.
- **"What do you know about our project?"**
- **"Do you have questions for us?"**

## Answering questions about your experience

A good answer has four parts, and the second is the longest:

- the **situation**, in one sentence,
- what **you did**, step by step, in the first person,
- the **result**, with a number if there is one,
- what you **learned** or would do differently.

Here is the question "Tell me about a time something didn't work", answered from Project 1:

"In my dimuon analysis, the fitted J/ψ mass came out four MeV below the reference value, about ten times my statistical uncertainty. First I checked for a bug: I tested the mass function against a case I had worked out by hand and against the mass column in the file, and both agreed. Then I varied the fit window and the binning, which moved the result by less than half an MeV. So it wasn't my code or my choices. I concluded that it comes from the momentum calibration of this early data and from the radiative tail, and I wrote that in the README instead of tuning the fit until the number matched. What I took from it is that the uncertainty from a fit is only the statistical part."

It takes forty seconds to say. It shows method, honesty and understanding, and every sentence of it can stand up to a follow-up question, because it happened.

## When you don't know

You will be asked something you don't know. That is intended, because the interviewer wants to see what you do then.

Say it plainly, and then show your reasoning: "I haven't used OpenMP. I know it is for running loops on several threads. I would expect the difficult part to be two threads writing to the same histogram, so I'd look for how it handles shared data." Now the supervisor has learned that you are honest, that you can reason from what you know, and that you see where a problem lies.

Never bluff. You are talking to an expert who will ask one more question, and a bluff that collapses puts everything else you said in doubt. A clear "I don't know, but here is how I would find out" is a good answer.

For a technical problem, think aloud: repeat the question in your own words, state what you assume, give the simple solution first, say what is wrong with it, and then improve it. Silence followed by a perfect answer is worth less than a visible path to a decent one.

## Your questions for them

Have three ready. "No, I think everything is clear" sounds like no interest. Good questions are about the work:

- What would the first two weeks look like?
- What does the team use from day to day: which languages, which tools?
- What would be most useful for me to learn before June?
- What became of last year's student project?

Don't ask what the web page already answers, and don't open with money or holidays.

## The day before and the day itself

- Read your own CV and your READMEs again. Every line is fair game.
- Read the project description and one page about the group's work. Write three sentences on what they do and why it matters.
- Say your pitch aloud with a timer.
- Test the camera and the microphone. Have your repository open in a browser tab, ready to share. Have pen and paper next to you.
- Join five minutes early, from a quiet place.
- Afterwards, send two or three sentences of thanks the same day.
--- practice
@write
Write your answer to "Tell me about a time you were stuck on a problem", using something that really happened to you in a project or in your studies. Use the four parts: the situation, what you did, the result, what you learned.
min: 60
```solution
In my C++ event processor, the histogram had one event fewer than the Python version in the J/psi window. I didn't want to ignore it, so I printed the masses closest to the window edges in both programs. One event had a mass exactly equal to the upper edge. NumPy counts such a value in the last bin, and my class counted it as overflow. I documented the convention, added a test for a value exactly on the edge, and made the comparison script apply the same rule. Since then I write a test for the boundaries of every range before I trust a count.
```
! Check yours against the four parts. Is the situation one sentence? Is most of the answer about what you did, in the first person? Is there a concrete result? Does it end with something you learned?

@choice
A supervisor asks how you would use a GPU to speed up your event loop. You have never programmed a GPU. What is the best response?
- "Yes, I'd use CUDA kernels and tensor cores for that."
- "I don't know."
* "I haven't programmed a GPU. I know they run the same operation on many elements at once, so I'd expect the per-event mass calculation to fit well and the file reading not to. I'd start by measuring which part is slow."
- Change the subject to your Python project.
! The first answer is a bluff, and the next question will expose it. The second is honest and stops there. The third is honest, reasons from what you know and proposes a first step.

@write
Write three questions you would ask a supervisor at the end of a call. They must be about the work, the team or how to prepare, and not answerable from the programme's web page.
min: 30
```solution
What would you expect me to have working after the first two weeks?
Which languages and tools does the team use every day, and is there something I should learn before June?
What happened to the project of last summer's student: is it in use today?
```
! Good questions show that you picture yourself doing the work. Keep the list where you will find it on the day.

@choice
"How good is your C++?" Which answer is strongest?
- "I'd say eight out of ten."
- "Not very good, I'm still a beginner."
* "I have written a small library with CMake, unit tests and sanitizer checks over the last three months. I'm comfortable with classes, references, the standard containers and basic templates. I haven't written multithreaded code yet."
- "I'm an expert, I have used it for years at university."
! A number means nothing without a scale, and both modesty and exaggeration give the listener no information. Evidence and clear limits do. They can check it against your repository, and it tells them where you would need help.

@write
Explain the difference between a pointer and a reference in C++ in three or four sentences, as you would say it in a call. Write it without looking anything up.
min: 30
```solution
Both let you reach an object without copying it. A reference is another name for an existing object: it must be bound when it is created, it can't be null, and it can't be made to refer to something else later. A pointer is a variable that holds an address: it can be null, it can be changed to point elsewhere, and you use * or -> to get at the object. I use references for function parameters by default, and pointers when "no object" has to be a possible value.
```
! A strong answer names the similarity first, then the two or three real differences, and ends with when you would use which. Say it aloud once, because a spoken answer is harder than a written one.
--- recall
Q: What three things is a supervisor trying to find out in a call?
A: Whether the work on your CV is really yours, whether you can learn and work on your own, and whether you would be good to work with.
Q: What are the four parts of a good answer about your experience?
A: The situation in one sentence, what you did, the result with a number, and what you learned.
Q: What do you do when you are asked something you don't know?
A: Say so plainly, then reason aloud from what you do know and say how you would find out. Never bluff.
Q: What should you have ready for the end of a call?
A: Three real questions about the work, the team or how to prepare.

=== py13 | py | 9 | ROOT files in Python: uproot and awkward arrays | p33
## Beyond CSV

The dimuon data came as a CSV file because someone prepared it for teaching. Real LHC data lives in **ROOT files**: a binary, compressed format that holds billions of events and lets you read only the quantities you need. You already met ROOT as a C++ program. In Python you don't need it to read the files. The library **uproot** reads them directly into arrays. Install it together with its companion:

```
pip install uproot awkward
```

For this lesson you will use real ATLAS collision data: events with four leptons, published for education as [record 15005](https://opendata.cern.ch/record/15005) on the CERN Open Data portal. The four data files are tiny. Download them into a new folder:

```
for f in A B C D; do
  curl -L -O https://opendata.cern.ch/eos/opendata/atlas/OutreachDatasets/2020-08-19/4lep/Data/data_$f.4lep.root
done
```

## Opening a file

```
import uproot

f = uproot.open("data_A.4lep.root")
print(f.keys())            # ['mini;1']
tree = f["mini"]
print(tree.num_entries)    # 39
print(tree.keys())         # the names of all branches
```

A ROOT file is like a small file system of named objects. The important one here is a **TTree** called `mini`: a table with one **entry** per collision event. Its columns are called **branches**. The `;1` after the name is a version number that you can ignore.

Reading one branch gives an array with one item per event:

```
pt = tree["lep_pt"].array()
print(pt[:2])
```

```
[[4.91e+04, 4.35e+04, 4.3e+04, 2.74e+04], [1.76e+05, ..., 7.98e+04]]
```

Two things to notice. Each event holds a **list** of values, one per lepton. And the numbers are large because these files store momenta in MeV, where the CMS file used GeV. Always check the units of a new dataset. Dividing by 1000 gives GeV.

## Jagged arrays

In real data, one event has two muons, the next has none, the next has five. A table like that isn't a rectangle, so it doesn't fit in a NumPy array. An array whose rows have different lengths is called **jagged**, and the library **awkward** handles it with the same style of whole-array operations you know from NumPy:

```
import awkward as ak

pt = ak.Array([[30.1, 22.5], [], [45.0], [12.0, 8.0, 5.5]])   # four events
```

The tools you need most:

```
ak.num(pt)                 # [2, 0, 1, 3]      how many values in each event
pt[ak.num(pt) >= 2]        # [[30.1, 22.5], [12, 8, 5.5]]   keep whole events
pt[pt > 10]                # [[30.1, 22.5], [], [45], [12]] keep values inside events
ak.max(pt, axis=1)         # the largest value of each event
ak.sum(pt, axis=1)         # the sum within each event
ak.flatten(pt)             # [30.1, 22.5, 45, 12, 8, 5.5]   one flat list
pt[:, 0]                   # the first value of each event
```

There are two kinds of selection, and telling them apart is the main skill. A mask with **one True or False per event**, such as `ak.num(pt) >= 2`, removes whole events. A mask with the **same jagged shape as the data**, such as `pt > 10`, removes individual values and keeps every event, some of them now empty.

`axis=1` means "inside each event", along the inner lists. `axis=0` would mean across events.

`pt[:, 0]` fails if any event is empty, because there is no first value to take. Select the events with enough entries first. To make a histogram, use `ak.flatten`, or `ak.to_numpy` on an array that has become regular.

## Several branches, several files

`uproot.concatenate` reads the same tree from many files and joins the result. Each file is given as `"file name:tree name"`:

```
files = [f"data_{x}.4lep.root:mini" for x in "ABCD"]
events = uproot.concatenate(files, ["lep_n", "lep_pt", "lep_eta", "lep_phi", "lep_E", "lep_charge"])

print(len(events))             # number of events in all four files
print(events.lep_charge[:3])   # a branch is reached with a dot
```

Selecting events works on all branches at once:

```
four = events[events.lep_n == 4]                        # events with exactly four leptons
neutral = four[ak.sum(four.lep_charge, axis=1) == 0]    # whose charges add up to zero
```

Arithmetic keeps the jagged shape, and NumPy functions work on these arrays directly:

```
import numpy as np

px = neutral.lep_pt * np.cos(neutral.lep_phi)    # one px per lepton, same shape as lep_pt
total_px = ak.sum(px, axis=1)                    # one number per event
```

That is all you need to add up the four-vectors of four leptons and compute their invariant mass. Next week you will do exactly that, and look for the Higgs boson in these four files.

## Reading only what you need

`tree.arrays([...])` and `uproot.concatenate` read only the branches you name. A real analysis file can have a thousand branches and a hundred million events, and reading three branches takes a fraction of a percent of the file. For files too large for memory, `uproot.iterate` hands you the events in chunks. This way of working, on whole columns instead of looping over events, is called **columnar analysis**, and it is how most new analysis code in the field is written.
--- practice
@predict
```
events = [[30.1, 22.5], [], [45.0], [12.0, 8.0, 5.5]]
print([len(ev) for ev in events])
print([max(ev) for ev in events if len(ev) >= 2])
```
= [2, 0, 1, 3]
= [30.1, 12.0]
! The first line is what `ak.num` computes. The second is `ak.max(pt[ak.num(pt) >= 2], axis=1)`. awkward does it without a Python loop, which matters for a hundred million events.

@choice
`pt` is a jagged array with one list of muon pT values per event. What does `pt[pt > 25]` return?
- A flat list of all values above 25
- Only the events in which every muon is above 25
* A jagged array with the same number of events, in which each event keeps only its values above 25. Some events may now be empty
- The number of muons above 25
! A mask with the same jagged shape as the data filters the values and never removes an event. To drop events, the mask must have one True or False per event.

@choice
Why can't the muon pT values of all events be stored in an ordinary two-dimensional NumPy array?
- NumPy can't store decimals
* Events have different numbers of muons, and a NumPy array must be a rectangle
- ROOT files are compressed
- NumPy arrays are limited to a million rows
! A rectangle would need padding with fake values, which wastes memory and invites mistakes. Jagged arrays store exactly what is there.

@local
Download the four ATLAS files as shown in the lesson. Write a script that reads them with `uproot.concatenate` and prints two numbers: the total number of events, and the number of events that have exactly four leptons whose charges add up to zero. Paste the output.
min: 1
= 832
= 644
! 832 collision events with at least four leptons, picked out of the 10 fb⁻¹ of 2016 collisions that ATLAS has released. Requiring exactly four leptons with a total charge of zero leaves 644 of them.

@write
From memory: `pt` is a jagged array of muon pT in GeV. Write the lines that count the events with exactly two muons in which both are above 20 GeV. `ak.all(mask, axis=1)` is True for an event when every value in it is True.
min: 3
```solution
both = pt[ak.num(pt) == 2]
good = both[ak.all(both > 20, axis=1)]
print(len(good))
```
! First an event-level selection with `ak.num`, then a condition on the values inside each event, reduced to one True or False per event with `ak.all`.
--- recall
Q: What is a jagged array, and why does LHC data need one?
A: An array whose inner lists have different lengths. Each event has a different number of muons, jets and so on.
Q: What do ak.num(pt), ak.flatten(pt) and ak.max(pt, axis=1) return?
A: The number of values in each event, all values as one flat list, and the largest value inside each event.
Q: How do you open a ROOT file and read one branch with uproot?
A: f = uproot.open(path), tree = f["name of the tree"], then tree["branch"].array().
Q: What is the difference between pt[ak.num(pt) >= 2] and pt[pt > 25]?
A: The first mask has one value per event and removes whole events. The second has the jagged shape of the data and removes individual values, keeping every event.

=== sy2 | sys | 9 | Kubernetes on one page | 
## What problem it solves

Docker runs containers on one machine. A real service needs more: several copies for reliability and load, spread over many machines, restarted when they crash, updated without downtime, and reachable under one stable address even as copies come and go. Doing that by hand doesn't scale.

**Kubernetes** (often written **k8s**) automates it. You give it a group of machines, called a **cluster**, and a description of what should be running. Kubernetes decides which machine runs what, and keeps it that way.

## Declarative control

This is the central idea. With Docker you give **commands**: "start this container". With Kubernetes you write a **description of the desired state**: "there should be three copies of this container". Programs called **controllers** continuously compare the desired state with reality and act to close any gap. If a machine dies and takes one copy with it, a controller notices that only two are running and starts a third somewhere else. Nobody has to be awake.

This style is called **declarative**: you declare what you want, not the steps to get there.

## The cluster

The machines in a cluster are called **nodes**. Most are **worker nodes**, which run your containers. The **control plane** is the set of components that manage the cluster: an **API server** that every command goes through, a database holding the desired state, a **scheduler** that picks a node for each new piece of work, and the controllers.

## The objects you describe

**Pod.** The smallest unit Kubernetes runs. A pod is one container, or occasionally a few tightly coupled ones, that are placed on the same node and share a network address. Pods are disposable: they are created and destroyed all the time, and each new one gets a new address.

**Deployment.** You rarely create pods directly. A deployment says "keep N identical pods of this kind running". It replaces pods that die, and when you change the image version it replaces old pods with new ones a few at a time, a **rolling update**.

**Service.** Since pods come and go, nothing should talk to a pod's address directly. A service gives a group of pods one stable name and address, and spreads incoming requests across them (**load balancing**).

**Namespace.** A way to divide one cluster into separate areas, for different teams or projects.

**ConfigMap** and **Secret.** Settings and passwords, stored in the cluster and handed to pods, so they aren't baked into images.

## Labels tie things together

How does a service know which pods are its own? Through **labels**: small key/value tags attached to objects, such as `app: web`. A service or deployment has a **selector** that says "everything labelled `app: web` belongs to me".

## A deployment in YAML

Objects are described in **YAML**, a text format where structure is shown by indentation.

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:1.27
        ports:
        - containerPort: 80
```

Reading it from the top: `kind` says what type of object this is. `metadata.name` names it. `spec` is the desired state: `replicas: 3` asks for three pods, `selector` says which pods count as belonging to this deployment, and `template` is the blueprint for each pod, with the same label and one container running the `nginx` web server image.

## kubectl

The command-line tool is `kubectl`.

```
kubectl apply -f web.yaml                  # create or update whatever the file describes
kubectl get pods                           # list pods and their status
kubectl get deployments,services           # list other kinds
kubectl describe pod <name>                # full details and recent events for one pod
kubectl logs <pod>                         # what the container printed
kubectl scale deployment web --replicas=5  # change the desired number
kubectl delete -f web.yaml                 # remove what the file describes
```

When a pod won't start, `kubectl describe pod` is the first place to look: its **Events** section at the bottom usually states the reason, such as an image that can't be found. Then check `kubectl logs`.

## At CERN

CERN's IT department runs large Kubernetes clusters for web services, data processing and machine learning workloads, and several openlab projects are about cloud-native computing. The official tutorial has a free browser-based cluster at [kubernetes.io](https://kubernetes.io/docs/tutorials/kubernetes-basics/), so you can practise without installing anything.
--- practice
@choice
A deployment has `replicas: 3`. One node fails and one of its pods is lost. What happens?
- Nothing, until an administrator restarts it
- The deployment is deleted
* A controller sees two pods where three are wanted, and starts a new one on another node
- The remaining two pods are restarted
! That is declarative control: the system keeps working to make reality match the declared state.

@choice
Why do clients talk to a service instead of directly to a pod?
- Pods can't accept network connections
* Pods are replaced often and get new addresses. A service gives a stable address and spreads requests over the current pods
- Services are faster than pods
- Because services store the data
! The service finds its pods through labels, so it always knows the current set.

@choice
A pod is stuck and never reaches `Running`. Which command do you try first?
- `kubectl delete pod <name>`
* `kubectl describe pod <name>`, and read the Events at the bottom
- `kubectl scale deployment web --replicas=0`
- `docker ps`
! The events usually name the cause directly. `kubectl logs` comes next if the container did start.

@predict
In the YAML from the lesson, the `replicas` line is changed to `replicas: 5` and the file is applied again. How many pods labelled `app: web` will the deployment keep running? Type a number.
= 5
! You changed the desired state. The deployment's controller starts two more pods to match it.

@local
Open the interactive tutorial at kubernetes.io (Kubernetes Basics, "Deploy an app"), or use your own cluster with `minikube` or `kind`. Create a deployment with `kubectl create deployment web --image=nginx`, then run `kubectl get pods` and paste its output.
min: 2
= NAME
= web
! The output has a header line starting with NAME, then one line per pod. The pod's name starts with `web-` followed by generated characters.
--- recall
Q: What is the difference between a pod, a deployment and a service?
A: A pod runs containers. A deployment keeps N identical pods running and manages updates. A service gives pods a stable address with load balancing.
Q: What does "declarative" mean in Kubernetes?
A: You describe the desired state and controllers keep changing reality to match it.
Q: Which kubectl command is the first stop when a pod misbehaves?
A: kubectl describe pod <name>, then kubectl logs <pod>.
Q: How does a service know which pods belong to it?
A: Through labels: its selector matches pods that carry a given label, such as app: web.

=== ph8 | phys | 10 | How a discovery is made: the Higgs in four leptons | 
## 4 July 2012

On 4 July 2012, ATLAS and CMS announced that they had each found a new particle with a mass near 125 GeV: the **Higgs boson**, predicted in 1964 and searched for ever since. This lesson follows one of the two analyses that carried the discovery. It uses everything from the earlier physics lessons: cross-sections, invariant mass, counting statistics and significance. It is the best single story to have ready when someone asks what you know about the physics at CERN.

## Why four leptons

A Higgs boson lives for about 10⁻²² seconds and is only ever seen through its decay products. It decays in several ways, called **channels**, and the probability of each is its **branching ratio**. The most common channels, such as a pair of b quarks, are buried under ordinary collisions that look the same.

One channel is rare but very clean:

```
H → Z Z* → 4 leptons
```

The Higgs decays to two Z bosons, and each Z decays to a pair of electrons or muons. The star on Z* means that one of the two is lighter than a real Z. It has to be, because two full Z bosons weigh 182 GeV, more than the Higgs. Electrons and muons are the particles a detector measures best. So the invariant mass of the four leptons can be computed to within 1 to 2%, and if a Higgs boson is behind them, they pile up in a narrow peak at its mass. Physicists call this the **golden channel**.

## How many events to expect

Use N = σ × L. At the collision energy of 2012, the cross-section for producing a Higgs boson was about 20 pb, and by July each experiment had roughly 10 fb⁻¹ of data from 2011 and 2012 together:

```
N = 20,000 fb × 10 fb⁻¹ = 200,000 Higgs bosons per experiment
```

Now the branching ratios. A Higgs boson decays to ZZ* 2.6% of the time. A Z boson decays to two electrons or two muons 6.7% of the time, and this has to happen twice:

```
0.026 × 0.067 × 0.067 ≈ 0.00012
```

That leaves 200,000 × 0.00012 ≈ 24 decays to four leptons. The detector doesn't catch them all: every one of the four leptons must fall inside its coverage and pass the identification. Roughly a third survive. The expectation was **fewer than ten events** per experiment, selected from about a million billion collisions.

## The background

Other processes also produce four leptons, and a peak only means something on top of an understood background.

The **irreducible background** is the direct production of two Z bosons with no Higgs involved. It has exactly the same particles in the final state, so no selection can remove it. It can only be told apart statistically: it gives a smooth spread of four-lepton masses, where the signal gives a peak. Its size is taken from simulation.

The **reducible background** consists of events in which one or more of the "leptons" is not what it seems: a particle from a jet wrongly identified as an electron, or a real muon from the decay of a b quark. It is suppressed by demanding that each lepton is **isolated**, with little other activity around it, and that it comes from the collision point. What is left is estimated from the data itself.

There is also a welcome peak at 91 GeV, where a single Z boson decays to four leptons. It appears exactly where it should, which shows that the mass scale is right.

## What they saw

In a window a few GeV wide around 125 GeV, each experiment found roughly ten events where about four were expected from background. Ten events sounds like nothing. But a narrow cluster at one mass, in two independent experiments, on a small and well-understood background, is strong evidence. Together with the second clean channel, the decay to two photons, each experiment reached about five sigma.

## Significance, done properly

The question is always the same: if there were no signal, how likely is it that the background alone would produce something at least this striking? That probability is the **p-value**. A small p-value is translated into sigmas: 3σ corresponds to about 1 in 740, and 5σ to about 1 in 3.5 million.

Two cautions are built into every search.

The **look-elsewhere effect**: if you scan a wide range of possible masses, the chance of an upward fluctuation **somewhere** is much higher than at one particular mass. The significance at one mass is called local, and the corrected one, which is smaller, is called global.

**Blinding**: the analysts fix the selection and the method before they look at the data in the region where a signal could appear. Otherwise, choices made while watching the result would be pulled, even unintentionally, towards making a bump bigger.

## After the discovery

A discovery starts the measurements. The mass is now known to be about 125.2 GeV, to a precision of a tenth of a percent. The particle has spin 0, as predicted, and it interacts with other particles in proportion to their mass, which is the signature of the mechanism that gives elementary particles their mass. François Englert and Peter Higgs received the Nobel Prize in 2013. Measuring the Higgs boson's properties ever more precisely, including whether it interacts with itself, is one of the main reasons for building the High-Luminosity LHC.

ATLAS and CMS have both published the four-lepton events as open data. In this week's task you will open the ATLAS files and look for the peak yourself.
--- practice
@predict
A Higgs boson decays to ZZ* 2.6% of the time, and each Z decays to electrons or muons 6.7% of the time. What fraction of Higgs bosons decays to four leptons? Give the answer in units of 10⁻⁴, to one decimal. For example, 0.00035 would be 3.5.
= 1.2
=| 1.17
=| 1.2e-4
=| 0.00012
! 0.026 × 0.067 × 0.067 = 0.000117. About one Higgs boson in 8,500 decays this way.

@run
Write `p_value(n_obs, b)`: the probability that a Poisson process with average `b` gives `n_obs` events or more. That is 1 minus the sum of the Poisson probabilities for 0, 1, …, n_obs − 1.
```starter
import math

def poisson(n, lam):
    return lam ** n * math.exp(-lam) / math.factorial(n)

def p_value(n_obs, b):
    pass
```
```test
print(round(p_value(9, 3.8), 4))
print(round(p_value(1, 3.8), 4))
print(round(p_value(4, 3.8), 4))
```
= 0.016
= 0.9776
= 0.5265
```solution
import math

def poisson(n, lam):
    return lam ** n * math.exp(-lam) / math.factorial(n)

def p_value(n_obs, b):
    return 1 - sum(poisson(n, b) for n in range(n_obs))
```
! Nine events on an expected background of 3.8 happen by chance 1.6% of the time, a little over two sigma. Counting alone was not enough. The real analyses also used the fact that the events cluster at one mass, and combined several channels.

@choice
What makes the direct production of two Z bosons an "irreducible" background to H → ZZ* → 4 leptons?
- It is too rare to be simulated
* It produces exactly the same four genuine leptons, so no identification requirement can remove it. It can only be separated statistically, through the shape of the mass distribution
- The leptons are misidentified jets
- It only happens at the Z mass
! Reducible backgrounds contain fake or non-prompt leptons and can be suppressed by better identification and isolation. Irreducible ones cannot.

@choice
An analysis scans masses from 110 to 600 GeV and finds a 3σ excess at one mass. Why is the global significance lower than 3σ?
- Because the detector resolution is worse at high mass
- Because 3σ is always rounded down
* With so many places to look, an upward fluctuation somewhere is much more likely than at one mass chosen in advance
- Because the background was underestimated
! This is the look-elsewhere effect. Many 3σ bumps in the history of the field were exactly this, and disappeared with more data.

@choice
Why is an analysis "blinded" until the method is fixed?
- To keep the result secret from the other experiment
* So that choices about the selection can't be influenced, even unintentionally, by what they do to the result
- Because the data are not yet reconstructed
- To save computing time
! If you can see the bump while tuning the cuts, you will tune the cuts towards the bump. Fixing the method first keeps the stated significance honest.
--- recall
Q: Why is H → ZZ* → 4 leptons called the golden channel?
A: All four leptons are measured precisely, so the Higgs appears as a narrow peak in the four-lepton mass on a small background, even though the decay is very rare.
Q: What does five sigma mean?
A: The probability that background alone would give a signal at least this strong is about 1 in 3.5 million.
Q: What is the difference between reducible and irreducible background?
A: Irreducible background has the same genuine final-state particles as the signal. Reducible background passes the selection only through misidentified or non-prompt particles.
Q: What is the look-elsewhere effect?
A: When you search over many possible masses, a fluctuation somewhere becomes more likely, so the global significance is lower than the local one.

=== c16 | cpp | 11 | Move semantics in depth: what a copy costs and when it happens | c24,c25
## Why phase 2 starts here

In the sprint you learned to write C++ that is correct. This phase is about C++ that is fast, and the first thing that makes C++ slow is copying data you didn't mean to copy. Here is a measurement of a vector of ten million doubles, 80 megabytes:

```
std::vector<double> big(10'000'000, 1.5);
std::vector<double> copy = big;                 // 59 milliseconds
std::vector<double> moved = std::move(big);     // 0.07 microseconds
```

The copy allocates a second block of 80 MB and writes all of it. The move copies three pointers. That is a factor of almost a million, and which of the two you get depends on a few characters of source code. The apostrophes in `10'000'000` are digit separators. They do nothing except make the number readable.

You met the move constructor in the lesson on the rule of five. This lesson is about when the compiler chooses it.

## Lvalues and rvalues

Every expression in C++ belongs to one of two groups.

An **lvalue** is something with a name that lives on after the current line: a variable, an element `v[3]`, a member `ev.mu1`. You can take its address, and somebody may read it later.

An **rvalue** is a temporary that is about to disappear: the result of `make()`, of `a + b`, or a literal such as `42`. Nobody can refer to it afterwards.

That difference decides what is safe. Stealing the contents of a temporary harms nobody, because nobody can look at it again. Stealing from a named variable would be a nasty surprise for the next line that uses it.

The two reference types follow this split. `const T&` binds to anything. `T&&`, the **rvalue reference**, binds only to rvalues. When both a copy constructor (taking `const T&`) and a move constructor (taking `T&&`) exist, the compiler picks the move constructor for rvalues and the copy constructor for everything else.

## What std::move does

`std::move(x)` moves nothing. It produces no machine code at all. It is a cast: it turns the lvalue `x` into an rvalue, and that is your written permission to steal from `x`. The stealing itself is done by whichever move constructor or move assignment operator receives the result.

After `auto w = std::move(v);` the object `v` still exists and its destructor will still run. Its state is **valid but unspecified**: you may assign a new value to it or let it die, and you should not read it. For a `std::vector` the standard does promise more: after move construction the source is empty.

## When each one happens

Take a class whose copy constructor prints `copy` and whose move constructor prints `move`:

```
Hit a;
Hit b = a;                 // copy: a has a name and lives on
Hit c = std::move(a);      // move: you gave a away
Hit d = make();            // nothing at all
keep(b);                   // copy: keep takes its parameter by value
keep(std::move(b));        // move
keep(make());              // nothing at all
```

Two lines print nothing. When a function returns an object by value, the compiler builds it directly in the place where the caller wants it, so there is nothing to copy and nothing to move. This is **copy elision**, and since C++17 it is guaranteed for a returned temporary such as `return Hit{};`. For a named local variable, `Hit h; ... return h;`, compilers do the same in practice, and if they can't, they move.

So returning a big object by value is cheap, and it is the normal style:

```
std::vector<double> read_masses(const std::string& path);    // good
```

One thing spoils it. Never write `return std::move(local);`. It forces a move where the compiler would have done nothing.

## Sink arguments

A constructor or setter that keeps its argument is called a **sink**. Take the argument by value and move it into the member:

```
class Track {
public:
    explicit Track(std::vector<double> hits) : hits_(std::move(hits)) {}
private:
    std::vector<double> hits_;
};
```

Inside the constructor, `hits` is a named variable, so it is an lvalue, and without `std::move` the member would be copied from it. With this one definition the caller decides the cost:

```
Track t1(mine);                 // one copy: mine is still needed afterwards
Track t2(std::move(mine));      // no copy: mine is given away
Track t3({4.0, 5.0});           // no copy: a temporary
```

For a function that only reads its argument, keep using `const std::vector<double>&`. Pass by value is for sinks.

## noexcept, or why your vector still copies

When a `std::vector` runs out of room, it allocates a bigger block and transfers its elements. If the transfer of element 500 threw an exception halfway, the old block would be half emptied and the vector ruined. So the vector moves its elements only when their move constructor is marked `noexcept`, a promise that it can't throw. Otherwise it copies them, quietly:

```
struct A { A(A&&) { ... } };             // vector<A> grows by copying
struct B { B(B&&) noexcept { ... } };    // vector<B> grows by moving
```

Always mark move constructors and move assignment operators `noexcept`.

## How to lose your move operations without noticing

If you declare none of the five special functions, the compiler writes all of them and they do the right thing member by member. That is the rule of zero. But declaring a destructor, even an empty one, switches off the automatic move operations. The class still compiles and `std::move` still compiles, and every "move" silently becomes a copy:

```
struct Logged {
    std::vector<double> data;
    ~Logged() {}                // now Logged b = std::move(a); copies
};
```

If a class needs a destructor, ask for the others explicitly: `Logged(Logged&&) noexcept = default;` and likewise the move assignment and the two copy operations.

Last, `v.emplace_back(args)` builds the new element in place from constructor arguments, and `v.push_back(x)` copies or moves an existing object in. With `emplace_back` there is nothing to copy or move at all.
--- practice
@predict
`Hit` prints `copy ` in its copy constructor and `move ` in its move constructor. What does this program print?
```
Hit make() { return Hit{}; }
void keep(Hit h) { }

int main() {
    Hit a;
    Hit b = a;
    Hit c = std::move(a);
    Hit d = make();
    keep(b);
    keep(std::move(b));
    keep(make());
    std::cout << "end\n";
}
```
= copy move copy move end
! `Hit b = a` copies and `std::move(a)` moves. `make()` builds its result directly in `d`, so nothing is printed. `keep(b)` copies into the parameter, `keep(std::move(b))` moves into it, and `keep(make())` builds the temporary directly in the parameter.

@choice
What does `std::move(x)` do when the program runs?
- It copies `x` to a new place and deletes the old one
- It swaps `x` with an empty object
* Nothing. It is a cast that marks `x` as something that may be stolen from
- It calls the destructor of `x`
! The cast only changes which constructor or assignment operator is chosen. If the receiving type has no move constructor, the copy constructor is used and nothing is saved.

@local
Save this as `cost.cpp`, compile it with `g++ -std=c++17 -O2 cost.cpp -o cost`, run it and paste the three lines.
```
#include <chrono>
#include <iostream>
#include <utility>
#include <vector>

int main() {
    using clock = std::chrono::steady_clock;
    std::vector<double> big(10'000'000, 1.5);
    auto t0 = clock::now();
    std::vector<double> copy = big;
    auto t1 = clock::now();
    std::vector<double> moved = std::move(big);
    auto t2 = clock::now();
    std::cout << "copy  " << std::chrono::duration<double, std::milli>(t1 - t0).count() << " ms\n";
    std::cout << "move  " << std::chrono::duration<double, std::micro>(t2 - t1).count() << " us\n";
    std::cout << "sizes " << copy.size() << ' ' << moved.size() << ' ' << big.size() << '\n';
}
```
min: 3
= sizes 10000000 10000000 0
! The copy takes tens of milliseconds and the move well under a microsecond. The last number is the size of `big` after it was moved from: empty, as the standard promises for a vector. `std::milli` and `std::micro` make the duration count in milliseconds and microseconds.

@predict
What does this print?
```
struct Plain  { std::vector<double> data; };
struct Logged { std::vector<double> data; ~Logged() {} };

int main() {
    Plain a{{1.0, 2.0, 3.0}};
    Plain b = std::move(a);
    std::cout << a.data.size() << ' ' << b.data.size() << ' ';

    Logged c{{1.0, 2.0, 3.0}};
    Logged d = std::move(c);
    std::cout << c.data.size() << ' ' << d.data.size() << '\n';
}
```
= 0 3 3 3
! `Plain` has compiler-written move operations, so `a` is emptied. The destructor of `Logged` switched them off, so `std::move(c)` falls back to the copy constructor and `c` keeps its three elements. No warning is printed.

@choice
A `std::vector<Particle>` with a million elements grows. `Particle` has a move constructor that is not marked `noexcept`. What happens?
- The program doesn't compile
- The elements are moved, as usual
* The elements are copied, because a move that might throw could leave the vector half transferred
- The vector refuses to grow
! The vector guarantees that a failed growth leaves it unchanged. It can only give that guarantee with a move that can't throw, or with a copy.

@write
From memory: a class `Event` that stores a `std::vector<Muon>` in a member `muons_`. Write the class with a constructor that takes the vector as a sink argument, so that a caller who passes a temporary or uses `std::move` pays for no copy.
min: 6
```solution
class Event {
public:
    explicit Event(std::vector<Muon> muons) : muons_(std::move(muons)) {}
private:
    std::vector<Muon> muons_;
};
```
! By value in the parameter list, `std::move` into the member. Without the `std::move`, the member would be copied from the parameter, because a named parameter is an lvalue.

@choice
Which function signature is the right one for a function that fills and returns a large vector of masses?
- `void masses(std::vector<double>* out)`, because returning a vector copies it
* `std::vector<double> masses(const Columns& c)`, because the result is built directly in the caller's variable
- `std::vector<double>& masses(const Columns& c)`, returning a reference to a local variable
- `std::vector<double>&& masses(const Columns& c)`
! Return by value. Copy elision or, at worst, a move makes it free. A reference to a local variable refers to an object that no longer exists when the function has returned.
--- recall
Q: What is the difference between an lvalue and an rvalue?
A: An lvalue has a name and lives on, so somebody may use it later. An rvalue is a temporary about to disappear, so it is safe to steal its contents.
Q: What does std::move do?
A: Nothing at run time. It casts its argument to an rvalue, which permits a move constructor or move assignment to steal from it.
Q: What may you do with an object after it has been moved from?
A: Assign a new value to it or let it be destroyed. Its state is valid but unspecified, so don't read it.
Q: Why should a move constructor be marked noexcept?
A: std::vector only moves its elements when it grows if their move can't throw. Otherwise it copies them.
Q: How does a constructor take an argument that it will store?
A: By value, and it moves the parameter into the member: explicit Track(std::vector<double> hits) : hits_(std::move(hits)) {}.
Q: Why is return std::move(local); a mistake?
A: It forces a move and blocks copy elision, which would have built the result directly in the caller's variable.

=== c17 | cpp | 11 | How memory is laid out: sizeof, alignment and the cache | c26
## The machine under the language

A program's speed is decided less by how many operations it does than by how it uses memory. To see why, you need a picture of where your variables live and how the processor gets at them.

Memory is a long row of bytes, each with a number called its **address**. `sizeof(T)` tells you how many bytes one object of type `T` occupies. On 64-bit Linux and macOS:

- `char` and `bool`: 1 byte
- `int` and `float`: 4 bytes
- `double`, `long` and every pointer: 8 bytes

## Stack and heap

Local variables live on the **stack**, a region that grows when a function is called and shrinks when it returns. Putting something on the stack costs nothing, but the stack is small, typically 8 MB, and its contents vanish with the function.

Anything big or long-lived comes from the **heap**, through `new`, or far better through a container that calls `new` for you. A `std::vector<double>` is a small object of 24 bytes: three pointers, to the start of its data, to the end of the used part and to the end of the allocated part. The doubles themselves sit in one block on the heap. Printing addresses shows the two regions far apart:

```
address of a local int    0x7ffc64dfdb2c
address of v itself       0x7ffc64dfdb30
address of v's data       0x56529d6cd2c0
```

Each heap allocation costs something like 20 to 100 nanoseconds. That is nothing once, and a great deal when it happens for every field of every line of a file, as it did in your CSV reader.

## Alignment and padding

A `double` must start at an address that is a multiple of 8, and an `int` at a multiple of 4. This is **alignment**, and the processor needs it to load values in one step. To keep every member aligned, the compiler inserts unused bytes called **padding**:

```
struct Loose  { char tag; double pt; int charge; };    // 24 bytes
struct Packed { double pt; int charge; char tag; };    // 16 bytes
```

In `Loose`, `tag` sits at offset 0, then 7 bytes of padding follow so that `pt` can start at 8, `charge` sits at 16, and 4 more bytes of padding round the size up to a multiple of 8. The whole struct must be a multiple of its strictest member, so that the next element of an array is aligned too. In `Packed` the members sit at 0, 8 and 12, and only 3 bytes are wasted.

The rule of thumb is to **order members from largest to smallest**. For a million objects the difference above is 24 MB against 16 MB. `alignof(T)` tells you the alignment a type needs, and `offsetof(T, member)` from `<cstddef>` tells you where a member starts.

## The cache

Main memory is slow compared with the processor. Fetching one value from RAM takes about 100 nanoseconds, time in which the processor could have done several hundred additions. So processors keep recently used memory in small, fast stores called **caches**:

- L1: tens of kilobytes, about 1 ns
- L2: a megabyte or so, about 4 ns
- L3: several megabytes shared by all cores, 10 to 40 ns
- RAM: gigabytes, about 100 ns

Memory moves into the cache in **cache lines** of 64 bytes. Touch one byte and its 63 neighbours come along for free. The processor also watches for patterns: when you walk through memory in order, it fetches the next lines before you ask for them. This is called **prefetching**.

Both mechanisms reward the same thing: data that is used together should sit together, and should be visited in order.

## Three measurements

All three compute the same sums in two ways. They were measured on a 2.3 GHz server with `-O2`, and your numbers will differ.

**A vector against a linked list.** Summing 20 million integers took 15 ms in a `std::vector` and 108 ms in a `std::list`. Both are "linear time". The list stores every element in its own heap block with two pointers attached, so each step follows a pointer to a new address, and a 4-byte integer costs 32 bytes of memory.

**In order against random order.** Reading the same vector through a shuffled list of positions took 135 ms instead of 13 ms. Every access now misses the cache, and the prefetcher can't guess what comes next.

**By rows against by columns.** A matrix of 8192 × 8192 floats is stored row after row in one block. Summing it row by row took 180 ms. Column by column took 570 ms, because each step jumps 8192 floats ahead to a new cache line.

## What to take from this

- Prefer contiguous containers: `std::vector` and `std::array`. A `std::list` or a tree of pointers is almost never the fast choice.
- Think in **bytes per event**. Eight doubles are 64 bytes, exactly one cache line. Ten million such events are 640 MB, and reading them once from RAM takes most of the time of any simple loop over them.
- Keep the data a loop needs small and together. The next performance lesson builds on this.
--- practice
@predict
On 64-bit Linux, what are the four sizes, in this order? Type four numbers.
```
struct A { char c; int i; char d; };
struct B { double x; char c; };
struct C { char a; char b; int i; };
struct D { char c; double d; int i; };

std::cout << sizeof(A) << ' ' << sizeof(B) << ' ' << sizeof(C) << ' ' << sizeof(D) << '\n';
```
= 12 16 8 24
=| 12, 16, 8, 24
! `A`: c at 0, three bytes of padding, i at 4, d at 8, and padding up to 12, a multiple of 4. `B`: 9 bytes rounded up to a multiple of 8. `C`: the two chars share the first four bytes with two bytes of padding. `D` is the worst case: 7 bytes of padding after c and 4 after i.

@local
Save this as `layout.cpp`, compile it with `g++ -std=c++17 -O2 layout.cpp -o layout`, run it and paste the output.
```
#include <cstddef>
#include <iostream>
#include <vector>

struct Loose  { char tag; double pt; int charge; };
struct Packed { double pt; int charge; char tag; };

int main() {
    std::cout << "Loose size " << sizeof(Loose) << " align " << alignof(Loose) << '\n';
    std::cout << "offsets " << offsetof(Loose, tag) << ' ' << offsetof(Loose, pt) << ' ' << offsetof(Loose, charge) << '\n';
    std::cout << "Packed size " << sizeof(Packed) << " align " << alignof(Packed) << '\n';
    std::cout << "offsets " << offsetof(Packed, pt) << ' ' << offsetof(Packed, charge) << ' ' << offsetof(Packed, tag) << '\n';

    int on_stack = 1;
    std::vector<double> v(1000);
    std::cout << "vector object " << sizeof(v) << " bytes\n";
    std::cout << "local int at  " << &on_stack << '\n';
    std::cout << "v itself at   " << &v << '\n';
    std::cout << "v's data at   " << v.data() << '\n';
}
```
min: 8
= Loose size 24 align 8
= offsets 0 8 16
= Packed size 16 align 8
= offsets 0 8 12
= vector object 24 bytes
! The two stack addresses are a few bytes apart and start with the same digits. The data address is somewhere else entirely: that is the heap.

@local
Save this as `cache.cpp`, compile it with `-O2`, run it and paste the two lines. It needs about 500 MB of memory for a few seconds.
```
#include <chrono>
#include <iostream>
#include <list>
#include <vector>

template <typename F>
double ms(F&& f) {
    const auto t0 = std::chrono::steady_clock::now();
    f();
    return std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - t0).count();
}

int main() {
    const std::size_t n = 10'000'000;
    std::vector<int> v(n, 1);
    std::list<int> l(n, 1);
    long s1 = 0, s2 = 0;
    const double tv = ms([&] { for (int x : v) s1 += x; });
    const double tl = ms([&] { for (int x : l) s2 += x; });
    std::cout << "vector " << tv << " ms  list " << tl << " ms  sums " << s1 << ' ' << s2 << '\n';

    const std::size_t N = 4096;
    std::vector<float> m(N * N, 1.0f);
    double a = 0, b = 0;
    const double rows = ms([&] { for (std::size_t i = 0; i < N; ++i) for (std::size_t j = 0; j < N; ++j) a += m[i * N + j]; });
    const double cols = ms([&] { for (std::size_t j = 0; j < N; ++j) for (std::size_t i = 0; i < N; ++i) b += m[i * N + j]; });
    std::cout << "rows " << rows << " ms  columns " << cols << " ms  sums " << a << ' ' << b << '\n';
}
```
min: 2
= sums 10000000 10000000
= 1.67772e+07 1.67772e+07
! The list is typically five to ten times slower than the vector, and the column order two to five times slower than the row order. `ms` is a small template that takes any callable `f`, runs it and returns the time in milliseconds. `[&] { ... }` is a lambda that can use the surrounding variables by reference.

@choice
Summing a `std::list<int>` and a `std::vector<int>` of the same length are both O(n). Why is the list so much slower?
- The list uses a slower addition
- The list is sorted on every access
* Each list element is a separate heap block reached through a pointer, so the processor can't prefetch, and each integer drags 28 bytes of overhead through the cache
- `std::list` is not optimised by `-O2`
! Complexity counts steps and ignores what a step costs. A step that misses the cache costs a hundred times more than one that hits it.

@predict
An event is stored as eight doubles. How many megabytes do ten million events take? Use 1 MB = 1,000,000 bytes.
= 640
=| 640 MB
=| 640MB
! 8 × 8 = 64 bytes per event, times 10,000,000. Stored as floats it would be 320 MB, which is one reason single precision is popular in triggers and on GPUs.

@choice
A struct has four members: `char tag`, `double pt`, `char flag` and `double eta`. Which order gives the smallest struct?
- tag, pt, flag, eta
- pt, tag, eta, flag
* pt, eta, tag, flag
- The order makes no difference to the size
! Largest first. The two doubles take 16 bytes, the two chars sit next to each other in the following 2, and 6 bytes of padding round the size up to 24. In both other orders each char is followed by 7 bytes of padding, and the struct takes 32 bytes.

@write
In your own words: why is summing a big matrix column by column slower than row by row, although both visit every element exactly once?
min: 40
```solution
The matrix is stored row after row in one block of memory. Going along a row, each element is next to the previous one, so one fetched cache line of 64 bytes serves 16 floats, and the processor notices the pattern and prefetches the following lines. Going down a column, each step jumps a whole row ahead in memory, so every access lands on a different cache line and most of them have to come from slower caches or from RAM.
```
! The answer should mention that the storage is row by row, that neighbours in a row share a cache line, and that a step down a column jumps far ahead in memory.
--- recall
Q: What is padding in a struct, and how do you keep it small?
A: Unused bytes the compiler inserts so that every member starts at a multiple of its alignment. Order the members from largest to smallest.
Q: What does a std::vector<double> object itself contain, and where are the doubles?
A: Three pointers, 24 bytes, usually on the stack. The doubles are in one contiguous block on the heap.
Q: What is a cache line?
A: The unit in which memory moves into the cache: 64 bytes. Touching one byte brings its neighbours along.
Q: Why is a std::vector faster to traverse than a std::list?
A: Its elements are contiguous, so they share cache lines and the processor can prefetch. List nodes are separate heap blocks reached through pointers.
Q: Roughly how long does a load from L1 cache take, and one from RAM?
A: About 1 nanosecond from L1 and about 100 nanoseconds from RAM.

=== c18 | cpp | 11 | Reading modern C++: auto, optional, string_view, span and constexpr | c27,c28
## Why a vocabulary lesson

The software you would work on at CERN, such as ROOT, Gaudi, the CMS and ATLAS frameworks or alpaka, is written in C++17 and C++20. It uses a set of small tools that most courses never mention. None of them is hard, and you need to recognise all of them on sight. This lesson goes through the ones you will meet most, and two of them will make your CSV reader several times faster this week.

Compile the examples with `-std=c++20`.

## auto and structured bindings

`auto` lets the compiler work out a type from the value on the right:

```
auto it = counts.find("muon");     // std::map<std::string, int>::iterator
auto n = 3u;                       // unsigned int
```

Use it when the type is obvious from the line or too long to be worth reading. Note that plain `auto` makes a copy. In a loop over a container of big objects write `const auto&`.

A **structured binding** unpacks a pair or a struct into named variables:

```
for (const auto& [name, mass] : masses) {
    std::cout << name << ' ' << mass << '\n';
}
```

Each element of a `std::map` is a pair of key and value. Without the binding you would write `entry.first` and `entry.second`. A map visits its keys in sorted order.

## enum class

```
enum class Flavour { Electron, Muon, Tau };
Flavour f = Flavour::Muon;
```

An `enum class` is a type with a fixed list of named values. Unlike the old plain `enum`, its names don't leak into the surrounding code and it doesn't silently turn into an `int`. To get the number you must ask: `static_cast<int>(Flavour::Tau)` is 2.

## constexpr

```
constexpr double kMuonMass = 0.1056583755;            // GeV
constexpr double square(double x) { return x * x; }
static_assert(square(3.0) == 9.0);
```

`constexpr` means the value can be computed by the compiler, before the program runs. A `constexpr` variable is a true constant. A `constexpr` function can be used in such constants, and `static_assert` checks a condition during compilation, so that a wrong constant stops the build.

## std::optional: maybe a value

What should a function return when it has nothing to return? Old code returns a magic number such as `-999`, and physics data files are full of them. `std::optional<T>` from `<optional>` says it honestly: it holds either a `T` or nothing.

```
std::optional<int> find_index(const std::vector<std::string>& names, std::string_view wanted) {
    for (std::size_t i = 0; i < names.size(); ++i) {
        if (names[i] == wanted) return static_cast<int>(i);
    }
    return std::nullopt;                  // nothing
}

if (const auto i = find_index(header, "E1")) {
    std::cout << "column " << *i << '\n';      // *i is the value
}
```

An optional converts to `true` when it holds a value. `*opt` reads the value, `opt.has_value()` asks, and `opt.value_or(-1)` gives the value or a fallback. Reading `*opt` from an empty optional is undefined behaviour, so check first.

## std::string_view: look, don't copy

A `std::string` owns its characters, and making one usually allocates memory. A `std::string_view` from `<string_view>` owns nothing. It is a pointer to characters that live somewhere else, plus a length: 16 bytes, free to copy.

```
std::string_view line = "165617,74601703,G,9.6987";
const std::size_t comma = line.find(',');
std::string_view first = line.substr(0, comma);     // "165617", no allocation
line.remove_prefix(comma + 1);                      // line now starts after the comma
```

`substr` on a view gives another view into the same characters. Your CSV reader created a new `std::string` for every field of every line, two million allocations for the file. With views it needs none.

The price is that a view must never outlive the string it looks at. Returning a `string_view` of a local `std::string` gives a view of memory that has been freed.

## std::from_chars: fast number parsing

`std::stod` needs a `std::string`, obeys the system's language settings and reports errors with exceptions. `std::from_chars` from `<charconv>` reads straight from a range of characters and does none of that:

```
double value = 0.0;
const auto [ptr, ec] = std::from_chars(text.data(), text.data() + text.size(), value);
if (ec == std::errc{} && ptr == text.data() + text.size()) {
    // success, and the whole text was a number
}
```

It takes a pointer to the first character and one past the last, and writes the result into `value`. It returns a small struct, unpacked here into `ptr`, where parsing stopped, and `ec`, an error code. `std::errc{}` is the value that means no error. On macOS the version for `double` needs a recent Xcode. With g++ it works from version 11.

## std::span: a view of an array

`std::span<const double>` from `<span>` (C++20) is to arrays what `string_view` is to strings: a pointer and a length. A function that takes a span accepts a vector, a `std::array`, a plain array or a part of any of them:

```
double sum(std::span<const double> xs) {
    double s = 0.0;
    for (double x : xs) s += x;
    return s;
}

sum(v);                             // a std::vector<double>
sum(std::span(v).subspan(1, 2));    // elements 1 and 2 only
```

## [[nodiscard]]

`[[nodiscard]]` in front of a function makes the compiler warn when a caller ignores the return value. Put it on functions whose result is the whole point, such as one that returns an error code or an optional.
--- practice
@predict
`header` holds the strings `Run`, `Event`, `E1` and `px1`, and `find_index` is the function from the lesson. What does this print?
```
const auto a = find_index(header, "E1");
const auto b = find_index(header, "pt1");
std::cout << a.has_value() << ' ' << *a << ' ' << b.has_value() << ' ' << b.value_or(-1) << '\n';
```
= 1 2 0 -1
! `E1` is at index 2, so `a` holds 2. `pt1` is not in the header, so `b` is empty and `value_or` gives the fallback. A `bool` prints as 1 or 0.

@predict
What does this print?
```
const std::map<std::string, double> mass{{"Z", 91.19}, {"Jpsi", 3.097}, {"Upsilon", 9.46}};
for (const auto& [name, m] : mass) std::cout << name << ' ';
```
= Jpsi Upsilon Z
! A `std::map` keeps its keys sorted, here alphabetically, with capitals before small letters. The order in which you inserted them is forgotten.

@predict
What does this print?
```
std::string_view line = "165617,74601703,G,9.6987";
const std::size_t comma = line.find(',');
std::string_view first = line.substr(0, comma);
line.remove_prefix(comma + 1);
std::cout << first << ' ' << first.size() << ' ' << line.substr(0, line.find(',')) << '\n';
```
= 165617 6 74601703
! `first` is a view of the six characters before the first comma. After `remove_prefix`, `line` starts at the second field, and the same two steps cut that one out. Not a single character was copied.

@choice
What is wrong with this function?
```
std::string_view run_number(int run) {
    std::string text = std::to_string(run);
    return text;
}
```
- Nothing, a string converts to a string_view
- `std::to_string` can't convert an int
* `text` is destroyed when the function returns, so the returned view points at freed memory
- A string_view can't be returned from a function
! The conversion compiles, which is what makes this dangerous. A view is only safe while the string it looks at is alive. Return a `std::string` here.

@local
Write `parse.cpp` from the pieces in the lesson. It needs a function `std::optional<double> parse_double(std::string_view text)` built on `std::from_chars`, which returns `std::nullopt` unless the whole text is a number. In `main`, call it on the four texts `91.19`, `-3.5e2`, `9x` and an empty one, and for each print the value, or the word `bad`. Compile with `g++ -std=c++20 -Wall -Wextra parse.cpp -o parse` and paste the output.
min: 4
= 91.19
= -350
= bad
```solution
#include <charconv>
#include <iostream>
#include <optional>
#include <string_view>

std::optional<double> parse_double(std::string_view text) {
    double value = 0.0;
    const auto [ptr, ec] = std::from_chars(text.data(), text.data() + text.size(), value);
    if (ec != std::errc{} || ptr != text.data() + text.size()) return std::nullopt;
    return value;
}

int main() {
    for (std::string_view text : {"91.19", "-3.5e2", "9x", ""}) {
        if (const auto v = parse_double(text)) std::cout << *v << '\n';
        else std::cout << "bad\n";
    }
}
```
! `9x` parses the 9 and stops at the x, so `ptr` is not at the end and the function reports failure. The empty text gives an error code straight away.

@choice
A function only needs to read a sequence of doubles. Callers hold them in a `std::vector`, in a `std::array` and in a part of a bigger vector. Which parameter type serves all three without copying?
- `std::vector<double>`
- `const std::vector<double>&`
* `std::span<const double>`
- `double*`
! A const reference to a vector forces the other two callers to build a vector first. A bare pointer loses the length. A span carries both and accepts anything contiguous.

@choice
Why does `std::from_chars` beat `std::stod` in a tight parsing loop?
- It uses the graphics card
- It rounds less precisely
* It reads directly from the characters you point at, with no string to build, no language settings to consult and no exceptions
- It caches earlier results
! Same result, far less work around it. In the reference solution of this week's project, this change and string views made the reader 4.6 times faster.
--- recall
Q: What does std::optional<T> hold, and how do you read it safely?
A: Either a T or nothing. Test it in an if, or with has_value(), then read *opt. value_or(x) gives a fallback.
Q: What is a std::string_view, and what is its danger?
A: A pointer and a length that look at characters owned by someone else. It must not outlive that string, or it points at freed memory.
Q: How do you parse a double with std::from_chars and check that it worked?
A: auto [ptr, ec] = std::from_chars(first, last, value); it worked if ec == std::errc{} and, for a whole field, ptr == last.
Q: What does a structured binding do?
A: It unpacks a pair or struct into named variables, for example for (const auto& [key, value] : map).
Q: What is std::span<const double> for?
A: A function parameter that accepts any contiguous sequence of doubles, such as a vector, an array or a part of one, without copying.
Q: What does constexpr mean?
A: The value or function can be evaluated by the compiler. Constants defined with it cost nothing at run time, and static_assert can check them during the build.

=== pj4 | proj | 11 | Project 2, part 2: from 100,000 events to 20 million a second | c29
## Where the project stands

Your event processor from the sprint is correct: it reproduces the Python histogram bin for bin, it is tested, and the sanitizers are silent. Over the next four weeks you make it fast, and you learn the method that performance work at CERN follows: measure, find the largest cost, remove it, prove that the answer hasn't changed, write the number down, and repeat.

Here is the starting point, measured on the reference solution for the 100,000 events of the CMS file:

```
read 0.157 s    mass and fill 0.0012 s
```

Reading the text file takes 99% of the run. A profiler says where inside the reading the time goes: a quarter in `strtod`, the C function behind `std::stod`, a quarter in `getline` and in building strings, and much of the rest in allocating and freeing memory for two million small strings. The physics is too small to appear in the profile at all.

So the first milestone has nothing to do with physics.

## The five milestones

- **Milestone 4, fast input (week 11).** Store events column by column, parse the text without allocating, and add a binary file format that needs no parsing at all.
- **Milestone 5, a toy Monte Carlo generator (week 12).** Produce as many simulated events as you like, with a known answer built in.
- **Milestone 6, one fast core (week 12).** Lay the data out so that the compiler can vectorise the mass calculation.
- **Milestone 7, every core (week 13).** Generate, reconstruct and histogram in parallel with threads, without a data race and with the same result for any number of threads.
- **Milestone 8, cross-check (week 14).** Do the same analysis with ROOT's RDataFrame and compare.

The reference solution ends at about 22 million events per second on four cores. Yours will differ, and what counts is that every step is measured.

## Columns instead of events

Until now an event was a struct of two four-vectors, and the data was a vector of such structs. From here on the library also offers the events **column by column**:

```
struct Columns {
    std::vector<double> E1, px1, py1, pz1, E2, px2, py2, pz2;
    std::size_t size() const { return E1.size(); }
};
```

Element `i` of each vector belongs to event `i`. This is called a **structure of arrays**, and it is how ROOT files, NumPy, pandas and every GPU framework hold data. The lessons on memory and on vectorisation explain what it buys. For now it is simply the shape that is easiest to write to a file.

## Parsing without allocating

The old reader built a `std::string` for every line and for every field, and gave each to `std::stod`. The new one reads the whole file into one string and walks over it with `std::string_view`, which you met in the vocabulary lesson:

```
std::string_view next_field(std::string_view& line) {
    const std::size_t end = line.find(',');
    const std::string_view field = line.substr(0, end);
    line = (end == std::string_view::npos) ? std::string_view{} : line.substr(end + 1);
    return field;
}
```

The function returns the text before the first comma and shortens `line` to what follows it. `npos` is the value `find` returns when there is no comma left. Then the last field is the whole rest, and `line` becomes empty. The `? :` is the conditional operator: `condition ? a : b` gives `a` if the condition holds and `b` otherwise. Each field goes to `std::from_chars`. Nothing is copied and nothing is allocated except the eight result vectors.

In the reference solution this took reading from 157 ms to 34 ms.

## A binary file

A CSV file stores the number 9.6987 as six characters, and turning characters into a double is slow however you do it. A **binary file** stores the eight bytes of the double exactly as they sit in memory. Reading it back is a single copy, with no parsing.

```
std::ofstream out(path, std::ios::binary);
const std::uint64_t n = c.size();
out.write(reinterpret_cast<const char*>(&n), sizeof n);
out.write(reinterpret_cast<const char*>(c.E1.data()), n * sizeof(double));
```

Three things are new here.

`std::ios::binary` opens the file without any translation of line endings, which matters on Windows.

`out.write(pointer, count)` writes `count` raw bytes starting at `pointer`. It wants a pointer to `char`, because a `char` is one byte.

`reinterpret_cast<const char*>(...)` tells the compiler to treat an address of something else as an address of bytes. It is the bluntest cast in the language and this is one of its few legitimate uses. `std::uint64_t` from `<cstdint>` is an unsigned integer of exactly 64 bits on every machine, where the size of `long` differs between Linux and Windows.

Reading is the mirror image, with `in.read(reinterpret_cast<char*>(...), count)` into a vector that you have resized first.

A good format starts with a few fixed **magic bytes**, so that a reader can refuse a file that is something else. The reference format is: the 8 characters `DIMUON01`, the number of events as a `std::uint64_t`, then the eight columns one after another.

Reading 100,000 events from this file takes 0.7 ms, 218 times faster than the original reader.

Binary formats have a price. You can't read them in an editor. They also depend on the machine: the order of the bytes inside a number (**endianness**) and the layout of a double are the same on all the x86 and ARM machines you will meet, but not everywhere, and a format with no version number is hard to change later. That is why experiments use ROOT files, which solve these problems and add compression. Writing a tiny format yourself is how you learn what they do.

## House rules for performance work

- **One change at a time**, with a measurement before and after.
- **Keep the slow path** until the fast one is proven. A test must show that the old and the new reader produce identical columns.
- **Use an optimised build**, the median of at least five runs, and the same input.
- **Write every number down** in a table in the README: what was changed, the time before and after, the compiler and flags, and the machine.

That table is the result of this project. Anyone can claim that code is fast, and few can show how it got there.
--- practice
@predict
The binary file holds 8 magic bytes, then the number of events as a 64-bit integer, then eight columns of doubles. How many bytes is the file for 100,000 events?
= 6400016
=| 6,400,016
=| 6400016 bytes
! 8 + 8 + 8 columns × 100,000 events × 8 bytes. The CSV file with the same events is 13.9 MB, more than twice as large, and it holds fewer digits.

@local
Save this as `bin.cpp`, compile it with `g++ -std=c++17 -O2 -Wall -Wextra bin.cpp -o bin`, run it and paste the two lines.
```
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <vector>

int main() {
    std::vector<double> out(1000);
    for (std::size_t i = 0; i < out.size(); ++i) out[i] = 0.5 * static_cast<double>(i);

    {
        std::ofstream f("test.bin", std::ios::binary);
        const std::uint64_t n = out.size();
        f.write(reinterpret_cast<const char*>(&n), sizeof n);
        f.write(reinterpret_cast<const char*>(out.data()), static_cast<std::streamsize>(n * sizeof(double)));
    }   // f goes out of scope here, which closes the file

    std::ifstream f("test.bin", std::ios::binary);
    std::uint64_t n = 0;
    f.read(reinterpret_cast<char*>(&n), sizeof n);
    std::vector<double> in(n);
    f.read(reinterpret_cast<char*>(in.data()), static_cast<std::streamsize>(n * sizeof(double)));

    std::cout << "read " << in.size() << " values, last " << in.back() << ", equal " << (in == out) << '\n';
    std::cout << "file size " << std::filesystem::file_size("test.bin") << " bytes\n";
}
```
min: 2
= read 1000 values, last 499.5, equal 1
= file size 8008 bytes
! The inner braces make a scope, so the output file is closed before it is opened again for reading. `std::streamsize` is the integer type that `write` and `read` expect for a count, and the cast avoids a warning. The values come back bit for bit, which a text file with six digits can't promise.

@choice
Why is the binary file so much faster to read than the CSV file?
- It is compressed
- The operating system caches binary files but not text files
* The bytes on disk are already the doubles, so reading is one copy. Text has to be split into fields and every field converted from characters to a number
- `std::ifstream` uses more threads for binary files
! There is nothing to parse. The file is also half the size, so there is less to read in the first place.

@choice
A profile says your program spends 99% of its time reading the input and 1% computing masses. You make the mass calculation ten times faster. How much faster does the program get?
- Ten times
- About twice
* Less than 1%
- It gets slower
! Only the 1% shrinks, to 0.1%, and the total goes from 100 to 99.1. Speeding up the part that doesn't matter is the most common waste of time in performance work, and it is why you measure first.

@write
From memory: the function `void write_column(std::ofstream& out, const std::vector<double>& col)` that writes all doubles of `col` to an open binary file as raw bytes.
min: 3
```solution
void write_column(std::ofstream& out, const std::vector<double>& col) {
    out.write(reinterpret_cast<const char*>(col.data()),
              static_cast<std::streamsize>(col.size() * sizeof(double)));
}
```
! `col.data()` is a pointer to the first double. The cast presents it as a pointer to bytes, and the count is the number of elements times the size of one.

@choice
Why does the reference format begin with the eight characters `DIMUON01`?
- They make the file load faster
- The operating system needs them to recognise a binary file
* So that the reader can refuse a file that is not in this format, and so that a later version of the format can be told apart
- They hold the number of events
! Without such a check, reading a wrong file gives garbage numbers and no error. The `01` leaves room for a format version 02.

@choice
You replace the old reader by the new one. What must be true before you delete the old code?
- The new one is at least twice as fast
* A test shows that both readers return exactly the same values for the same file
- The new one has fewer lines
- It compiles without warnings
! Fast and wrong is worthless. Keep the slow version as the reference until a test has compared the two on real input.
--- recall
Q: What is a structure of arrays?
A: One array per quantity instead of one struct per event: all E1 values together, all px1 values together, and so on. Element i of each array belongs to event i.
Q: How do you write the doubles of a vector v to a binary file?
A: Open the stream with std::ios::binary and call out.write(reinterpret_cast<const char*>(v.data()), v.size() * sizeof(double)).
Q: Why is reading a binary file much faster than reading CSV?
A: The bytes on disk are already the numbers, so there is nothing to split or convert. The file is smaller too.
Q: What are magic bytes in a file format?
A: A fixed sequence at the start that identifies the format, so that a reader can reject other files.
Q: What are the house rules for performance work?
A: Measure first. Change one thing at a time. Prove with a test that the result is unchanged. Use an optimised build and the median of several runs. Write every number down.

=== pf1 | cpp | 11 | Profiling: finding where the time goes | p34
## The question a profiler answers

A stopwatch around `main` tells you that a program is slow. A **profiler** tells you where. Without one you guess, and the guess is usually wrong: in the project lesson, the physics you might have optimised turned out to be 1% of the run.

## Amdahl's law

Suppose a fraction `p` of the run time is spent in the part you improve, and you make that part `s` times faster. The whole program then gets faster by

```
speed-up = 1 / ((1 - p) + p / s)
```

The untouched part, `1 - p`, stays as it is. The improved part shrinks from `p` to `p / s`. This is **Amdahl's law**, and two things follow from it.

If `p` is small, nothing helps. With `p = 0.01`, even an infinitely fast replacement gives a speed-up of 1 / 0.99 = 1.01.

And the speed-up has a ceiling of `1 / (1 - p)`. If 90% of a program can be made faster and 10% can't, it will never run more than ten times faster. You will meet this limit again with threads, where `s` is the number of cores.

## Three kinds of tool

**Timers in the code.** You already print the time for reading and for filling. It is cheap and coarse, and you have to know beforehand where to put the timers.

**A sampling profiler.** It interrupts the program a few thousand times a second and notes which function is running. Functions that take more time are caught more often. The program runs at almost full speed, and you don't change the code. On Linux this tool is `perf`.

**An instrumenting profiler.** It runs the program on a simulated processor and counts every instruction. The counts are exact and repeatable, and the run is 20 to 50 times slower. This is `callgrind`, part of valgrind.

## perf

Build with optimisation and debug information, so that the profile is of the real program and the profiler can name functions and lines. With CMake that is `-DCMAKE_BUILD_TYPE=RelWithDebInfo`, which means `-O2 -g`.

```
perf stat ./dimuon_hist data.csv 0 120 240 hist.csv
```

`perf stat` runs the program and prints totals: the time, and if the machine allows it, the number of instructions, cache misses and mispredicted branches. Inside a virtual machine, which includes WSL, these hardware counters often show `<not supported>`. The sampling below still works.

```
perf record -g ./dimuon_hist data.csv 0 120 240 hist.csv
perf report
```

`perf record` samples the run and writes the file `perf.data`. The option `-g` also records who called whom. `perf report` shows the result, sorted by cost. This is the top of the report for the reference solution of the sprint, with the long type names shortened:

```
20.00%  libc.so.6       ____strtod_l_internal
11.14%  libstdc++.so.6  std::getline<char, ...>
 6.58%  dimuon_hist     std::vector<std::string>::_M_realloc_insert
 5.50%  libc.so.6       str_to_mpn
 5.23%  libc.so.6       __memmove_avx512_unaligned_erms
 3.62%  libc.so.6       __memchr_evex_rtm
 3.62%  libstdc++.so.6  std::istream::sentry::sentry
 3.49%  dimuon_hist     dimuon::read_events
 3.36%  dimuon_hist     dimuon::split_csv
```

Here is how to read it. The percentage is the share of samples in which that function itself was running. The second column is where the function lives: `libc.so.6` is the C library, `libstdc++.so.6` the C++ standard library, and `dimuon_hist` your own program.

`____strtod_l_internal` and `str_to_mpn` are the inside of `std::stod`: a quarter of the run converts text to numbers. `getline` and `sentry` are the stream machinery that splits lines and fields. `_M_realloc_insert` is a `std::vector<std::string>` growing, one `push_back` at a time. `memmove` and `memchr` copy characters and search for commas. Your own functions hold 7%. `FourVector::mass` and `Histogram::fill` are missing, because they are below 1%.

Summed by library, 49% of the time is in the C library, 26% in the C++ library and 18% in your own code. The lesson of this profile is that the reader spends its time making and destroying strings.

The underscores and odd names are normal. Library functions have internal names, and templates show up with their full types. Read for the word you recognise in the middle.

## callgrind

If you can't use `perf`, for example on a university machine without permission, use callgrind:

```
valgrind --tool=callgrind ./dimuon_hist data.csv 0 120 240 hist.csv
callgrind_annotate callgrind.out.12345 | head -30
```

The number in the file name is the process id of your run. For the same program it reports 1.61 billion instructions, 20% of them in `strtod` and 15% in `getline`: the same picture as `perf`, from a different method. Two tools that agree are worth more than either alone.

On macOS, neither tool runs. Use Instruments from Xcode, with the Time Profiler template.

## Flame graphs and Compiler Explorer

A **flame graph** is a picture of a profile. Every function is a box whose width is its share of the time, and callers sit below the functions they call. Wide boxes at the top are where the time goes. The site [speedscope.app](https://www.speedscope.app/) draws one in the browser from the output of `perf script`.

[Compiler Explorer](https://godbolt.org/) shows the machine code that a compiler makes from your C++, side by side and coloured line by line. You don't need to read assembly fluently. It is enough to see whether a loop became five instructions or fifty, and whether a function call is still there.

## A method

1. Build with `-O2 -g`.
2. Run on realistic input for at least a second.
3. Profile, and write down the top five entries.
4. Decide what the largest cost is and why it is there.
5. Change one thing, check that the results are identical, and profile again.

The top of the profile changes after every fix. What was third becomes first, and that is how you know what to do next.
--- practice
@run
Write `amdahl(p, s)`: the speed-up of a whole program when a fraction `p` of its run time is made `s` times faster.
```starter
def amdahl(p, s):
    pass
```
```test
print(round(amdahl(0.5, 2), 3))
print(round(amdahl(0.99, 4.6), 2))
print(round(amdahl(0.01, 1000000), 3))
print(round(amdahl(0.9, 4), 2))
```
= 1.333
= 4.44
= 1.01
= 3.08
```solution
def amdahl(p, s):
    return 1 / ((1 - p) + p / s)
```
! The second line is the project: 99% of the time is reading, and the reader got 4.6 times faster. The third is the physics made a million times faster: 1%. The last is a program that is 90% parallel on 4 cores.

@predict
95% of a program's run time can be spread over many cores, and 5% can't. What is the largest speed-up it can ever reach, with any number of cores?
= 20
=| 20x
=| 20 times
! 1 / (1 − 0.95). With infinitely many cores the parallel part takes no time, and the serial 5% remains.

@choice
Which build do you profile?
- `-O0 -g`, so that every line is visible
* `-O2 -g`: the optimised program, with debug information so that the profiler can name functions
- `-O3` without `-g`, because debug information slows the program down
- It makes no difference
! An unoptimised build has a different profile: small functions that would be inlined show up as hot spots. Debug information does not change the generated code. It only adds tables that tools read.

@choice
In the profile from the lesson, what does the line `6.58%  dimuon_hist  std::vector<std::string>::_M_realloc_insert` tell you?
- The histogram is growing
- 6.58% of the events were skipped
* A vector of strings ran out of room during `push_back` and moved to a bigger block, again and again
- The file was read 6.58 times
! `split_csv` starts every line with an empty vector and pushes about twenty fields into it, so it reallocates several times per line. Reusing one vector, or not building strings at all, removes the cost.

@local
Profile your own event processor on the CMS file, with `perf record` and `perf report`, or with callgrind and `callgrind_annotate`. Paste the top eight lines of the report, the ones with the percentages.
min: 8
= %
! Compare it with the lesson. If your reader uses the stream operator `>>` and not `std::stod`, the names differ, but the conversion from text to numbers and the string handling should still lead.

@choice
A sampling profiler and an instrumenting profiler disagree slightly about the percentages. Why is that expected?
- One of them is broken
* Sampling measures time, with some statistical noise. Instrumentation counts instructions, and not every instruction takes the same time
- They profile different programs
- Sampling ignores library code
! A cache miss costs a hundred times more than an addition, and an instruction count can't see that. Use both: counts for repeatability, samples for the truth about time.

@write
In your own words: your program takes 10 seconds, of which 9 are spent reading and 1 computing. A colleague proposes to rewrite the computation for a GPU. What do you answer, and what would you do first?
min: 40
```solution
The computation is 10% of the run, so even if the GPU made it infinitely fast, the program would take 9 seconds instead of 10. Amdahl's law limits the gain to a factor of 1.11. The reading is 90%, so I would profile the reading first, find what it spends its time on, and make that faster, for example by parsing without allocating strings or by converting the input to a binary format once. After that I would profile again, because the balance will have changed.
```
! A good answer names the share of the computation, the ceiling it puts on the gain, and the larger cost to attack first.
--- recall
Q: State Amdahl's law.
A: If a fraction p of the run time is made s times faster, the whole program speeds up by 1 / ((1 − p) + p / s). The ceiling is 1 / (1 − p).
Q: How does a sampling profiler work?
A: It interrupts the program many times a second and records which function is running. Functions that take more time are caught more often.
Q: Which three perf commands do you need?
A: perf stat prog for totals, perf record -g prog to sample a run, and perf report to read the result.
Q: With which flags do you build for profiling?
A: -O2 -g: optimised, with debug information. In CMake, the build type RelWithDebInfo.
Q: What can callgrind do that perf can't, and what is the cost?
A: It counts every instruction exactly and repeatably, and needs no special permissions. The program runs 20 to 50 times slower.

=== mc1 | phys | 12 | Toy Monte Carlo: random numbers, a two-body decay and the Lorentz boost | p35,c31
## Why generate fake data

So far you have analysed events that CMS and ATLAS recorded. For the rest of this project you make your own. Generating events from random numbers is called **Monte Carlo** simulation, after the casino. A simple, fast generator that models only what you need is a **toy Monte Carlo**, and every analysis at CERN uses them for three things.

- **Testing code against a known truth.** If you generate Z bosons with a mass of exactly 91.19 GeV, your reconstruction must give 91.19 back. With real data you never know the right answer.
- **Estimating uncertainties.** Generate the experiment a thousand times and see how much the result scatters.
- **Scale.** You can make 20 million events, or 20 billion, to test how your program behaves under load.

## Random numbers in C++

The header `<random>` separates two jobs.

An **engine** produces a stream of random bits. `std::mt19937_64` is the standard choice, the Mersenne Twister. It is given a **seed**, a number that selects the stream:

```
std::mt19937_64 rng(2027);
```

The same seed always gives the same stream. That is a feature: a result you can't reproduce can't be debugged.

A **distribution** turns the bits into numbers of the shape you want. You create it once with its parameters and then call it with the engine as its argument:

```
std::normal_distribution<double> mass_dist(91.19, 2.0);        // mean, standard deviation
std::uniform_real_distribution<double> phi_dist(-3.14159, 3.14159);
std::exponential_distribution<double> pt_dist(1.0 / 10.0);     // rate: the mean is 10

const double m = mass_dist(rng);
```

Each call `mass_dist(rng)` draws one number and advances the engine. Never use the old `rand()`: its quality is poor and it has one hidden state shared by the whole program, which is fatal with threads.

## The decay in the rest frame

A particle of mass `m` decays into two muons. In the frame where the parent is at rest, energy and momentum conservation leave no freedom in the sizes:

- each muon gets half the energy: `E* = m / 2`
- the two momenta are equal and opposite, with magnitude `p* = sqrt(m²/4 − mμ²)`

The star marks rest-frame quantities, and `mμ` = 0.1057 GeV is the muon mass. Only the direction is random, and it must be uniform over the sphere. That means drawing `cos θ*` uniformly between −1 and 1 and the angle `φ*` uniformly between −π and π. Drawing θ* itself uniformly would be wrong: it would crowd directions near the poles, because the circles of constant θ get smaller there.

```
sin θ* = sqrt(1 − cos² θ*)
p1* = ( p* sin θ* cos φ*,  p* sin θ* sin φ*,  p* cos θ* )
p2* = −p1*
```

## The parent in the laboratory

The parent is not at rest. Describe its motion by its transverse momentum `pT`, its azimuth `φ` and its **rapidity** `y`, which measures the motion along the beam and is close to the pseudorapidity η you know. With the **transverse mass** `mT = sqrt(m² + pT²)`, the parent's four-vector is

```
E  = mT cosh y        pz = mT sinh y
px = pT cos φ         py = pT sin φ
```

`cosh` and `sinh` are the hyperbolic functions from `<cmath>`. Since cosh² − sinh² = 1, you can check that E² − pz² = mT², and so E² − p² = m², as it must be.

## The Lorentz boost

The muons were built in the rest frame, and the detector sees them in the laboratory. The change of frame is a **Lorentz boost**. The parent moves with velocity β = p / E, a vector with components `βx = px / E` and so on, in units of the speed of light. Its size is always below 1. The factor γ = 1 / sqrt(1 − β²) equals E / m and says how relativistic the motion is.

For a particle with rest-frame energy `E*` and momentum `p*`, the laboratory values are

```
β·p* = βx px* + βy py* + βz pz*
E    = γ (E* + β·p*)
p    = p* + [ (γ − 1) (β·p*) / β² + γ E* ] β
```

The dot is the scalar product. The bracket is a single number, and it multiplies the vector β: the boost only changes the part of the momentum that lies along the direction of motion.

A boost changes energies and momenta and never an invariant mass. Each boosted muon still has mass 0.1057 GeV, and the two together still have the mass of the parent.

## The closure test

That last sentence is your unit test. Generate events with a fixed mass, reconstruct the mass from the two muons, and demand the input back:

```
generate(c, 10000, {91.19, 0.0}, 7);     // sigma 0: every parent has exactly 91.19
masses(c, m);
for (double x : m) CHECK(x == doctest::Approx(91.19).epsilon(1e-9));
```

A wrong sign in the boost or a swapped sine and cosine makes this fail at once. It is called a **closure test**: put a known truth in, run the whole chain, and check that it comes out. Physicists trust an analysis only when it closes.

## One engine per thread

An engine has internal state that every draw changes. Two threads drawing from the same engine is a data race. The rule for parallel code, which you need next week, is one engine per thread, or better, one seed per chunk of events: chunk 0 uses seed 2027, chunk 1 uses 2028, and so on. Then the events of a chunk are the same no matter which thread generates them, and the whole result is the same for 1 thread and for 16.
--- practice
@predict
A parent particle moves with β = 0.6. What is its γ? Give two decimals.
= 1.25
! γ = 1 / sqrt(1 − 0.36) = 1 / 0.8. At β = 0.6 energies and momenta are already a quarter larger than the non-relativistic formulas say.

@run
Write `rest_frame(m, cos_theta, phi)`. A particle of mass `m` decays into two massless particles. Return their two four-vectors in the parent's rest frame, each as a tuple `(E, px, py, pz)`. For massless daughters the momentum is `p = m / 2`.
```starter
import math

def rest_frame(m, cos_theta, phi):
    p = m / 2
    sin_theta = math.sqrt(1 - cos_theta ** 2)
    # first = (E, px, py, pz), second has the opposite momentum
    pass
```
```test
a, b = rest_frame(3.0, 0.6, 0.0)
print([round(x, 6) for x in a])
print(round(a[0] + b[0], 6), round(a[1] + b[1], 6), round(a[3] + b[3], 6))
c, d = rest_frame(10.0, 0.0, math.pi / 2)
print(round(c[2], 6), round(d[2], 6))
```
= [1.5, 1.2, 0.0, 0.9]
= 3.0 0.0 0.0
= 5.0 -5.0
```solution
import math

def rest_frame(m, cos_theta, phi):
    p = m / 2
    sin_theta = math.sqrt(1 - cos_theta ** 2)
    px = p * sin_theta * math.cos(phi)
    py = p * sin_theta * math.sin(phi)
    pz = p * cos_theta
    return (p, px, py, pz), (p, -px, -py, -pz)
```
! The energies add up to the mass and the momenta cancel: that is what "at rest" means. In the last test the decay is along the y axis.

@run
Write `boost(p, parent)`. Both are tuples `(E, px, py, pz)`. `p` is a particle in the rest frame of `parent`. Return the particle's four-vector in the frame where `parent` has the given energy and momentum. Use the formulas from the lesson.
```starter
import math

def boost(p, parent):
    E, px, py, pz = p
    Ep, ppx, ppy, ppz = parent
    bx, by, bz = ppx / Ep, ppy / Ep, ppz / Ep
    # b2 = beta squared, gamma, bp = beta dot p, then the two formulas
    pass
```
```test
parent = (5.0, 0.0, 0.0, 4.0)
a = boost((1.5, 1.2, 0.0, 0.9), parent)
b = boost((1.5, -1.2, 0.0, -0.9), parent)
print([round(x, 6) for x in a])
print([round(x, 6) for x in b])
print(round(a[0] + b[0], 6), round(a[3] + b[3], 6))
```
= [3.7, 1.2, 0.0, 3.5]
= [1.3, -1.2, 0.0, 0.5]
= 5.0 4.0
```solution
import math

def boost(p, parent):
    E, px, py, pz = p
    Ep, ppx, ppy, ppz = parent
    bx, by, bz = ppx / Ep, ppy / Ep, ppz / Ep
    b2 = bx * bx + by * by + bz * bz
    gamma = 1 / math.sqrt(1 - b2)
    bp = bx * px + by * py + bz * pz
    k = (gamma - 1) * bp / b2 + gamma * E
    return (gamma * (E + bp), px + k * bx, py + k * by, pz + k * bz)
```
! The parent has mass 3 (5² − 4² = 9) and moves along z with β = 0.8. The muon emitted forwards gains energy and the one emitted backwards loses it. Together they carry exactly the parent's energy 5 and momentum 4, and the sideways momentum 1.2 is untouched.

@choice
Why is the decay direction generated with `cos θ*` uniform between −1 and 1, and not with θ* uniform between 0 and π?
- The cosine is cheaper to compute
* Equal steps in cos θ cover equal areas on the sphere. Equal steps in θ would put too many directions near the poles
- θ can't be drawn from a uniform distribution
- It makes no difference
! The band of the sphere between θ and θ + dθ has an area proportional to sin θ dθ, which is d(cos θ). Uniform in the cosine is uniform on the sphere.

@run
Write `toy_masses(n, seed)`: a list of `n` masses drawn from a normal distribution with mean 91.19 and standard deviation 2.0. The same seed must always give the same list. Use `random.seed` and `random.gauss`.
```starter
import random

def toy_masses(n, seed):
    pass
```
```test
a = toy_masses(2000, 7)
b = toy_masses(2000, 7)
c = toy_masses(2000, 8)
mean = sum(a) / len(a)
print(len(a), a == b, a == c)
print(abs(mean - 91.19) < 0.2)
```
= 2000 True False
= True
```solution
import random

def toy_masses(n, seed):
    random.seed(seed)
    return [random.gauss(91.19, 2.0) for _ in range(n)]
```
! Seeding inside the function is what makes it reproducible. The mean of 2000 draws scatters around 91.19 with a standard deviation of 2.0 / √2000 = 0.045, so a window of 0.2 is safe.

@choice
What is a closure test?
- A test that the program closes its files
- A test that runs last
* Feeding a known truth through the whole chain and checking that the result reproduces it
- A test of the destructor
! If the generated mass is 91.19 and the reconstructed mass is not, either the generator or the reconstruction is wrong. With real data there is no such reference.

@write
In C++, from memory: create an engine with seed 42 and draw one number from a normal distribution with mean 3.097 and standard deviation 0.03, and one from a uniform distribution between −1 and 1.
min: 4
```solution
std::mt19937_64 rng(42);
std::normal_distribution<double> mass_dist(3.097, 0.03);
std::uniform_real_distribution<double> cos_dist(-1.0, 1.0);
const double m = mass_dist(rng);
const double c = cos_dist(rng);
```
! The engine holds the state, the distribution holds the shape, and calling the distribution with the engine draws a number.
--- recall
Q: What are the two parts of C++'s random number library?
A: An engine such as std::mt19937_64, which produces random bits from a seed, and distributions such as std::normal_distribution, which shape them. You draw with dist(rng).
Q: A particle of mass m at rest decays into two muons. What are their energies and momenta?
A: Each has energy m/2. The momenta are opposite, with magnitude sqrt(m²/4 − mμ²).
Q: How do you draw a direction that is uniform over the sphere?
A: cos θ uniform between −1 and 1, and φ uniform between −π and π.
Q: What are β and γ of a particle with energy E, momentum p and mass m?
A: β = p / E and γ = E / m = 1 / sqrt(1 − β²).
Q: What does a Lorentz boost leave unchanged?
A: Invariant masses: of each particle, and of any group of particles.
Q: How do you make random numbers reproducible in a parallel program?
A: Never share an engine between threads. Give each chunk of events its own seed, so that its events don't depend on which thread makes them.

=== pf2 | cpp | 12 | Data layout for speed: structure of arrays and SIMD | c30
## Two ways to store a million events

An **array of structures** keeps each event together:

```
struct P4 { double E, px, py, pz; };
struct Event { P4 a, b; };
std::vector<Event> events;                 // E px py pz E px py pz | E px py pz ...
```

A **structure of arrays** keeps each quantity together:

```
struct Columns {
    std::vector<double> E1, px1, py1, pz1, E2, px2, py2, pz2;
};                                         // E1 E1 E1 ... | px1 px1 px1 ... | ...
```

The first is the natural way to think and is fine for code that handles one event at a time. The second is what makes loops over millions of events fast, for two reasons.

A loop that needs only some of the quantities touches only those arrays. A cut on `E1` reads 8 bytes per event from a structure of arrays, and drags all 64 through the cache from an array of structures.

The second reason is that the same operation on a row of neighbouring values is exactly what the processor's vector instructions do.

## SIMD

A normal instruction adds two numbers. A **SIMD** instruction (single instruction, multiple data) adds two short rows of numbers at once. The rows live in wide registers:

- SSE2, on every 64-bit Intel and AMD processor: 128 bits, 2 doubles or 4 floats
- AVX2, on most machines since about 2015: 256 bits, 4 doubles or 8 floats
- AVX-512, on some servers and laptops: 512 bits, 8 doubles or 16 floats
- NEON, on ARM processors including Apple's: 128 bits

A loop that the compiler rewrites to use these instructions is **vectorised**, and it can run several times faster on the same core. `g++` attempts this at `-O3`, and for simple loops already at `-O2`.

By default the compiler only uses SSE2, so that the program runs on any machine. `-march=native` allows every instruction your own processor has. The program is then faster and may crash on an older machine, so it is a flag for measurements and for code you build where it runs.

## Asking the compiler what it did

Here is the mass loop over columns:

```
for (std::size_t i = 0; i < n; ++i) {
    const double E = E1[i] + E2[i];
    const double px = px1[i] + px2[i];
    const double py = py1[i] + py2[i];
    const double pz = pz1[i] + pz2[i];
    m[i] = std::sqrt(std::max(0.0, E * E - (px * px + py * py + pz * pz)));
}
```

`g++` can report on its attempts. `-fopt-info-vec-optimized` prints the loops it vectorised and `-fopt-info-vec-missed` the ones it gave up on, with a reason:

```
g++ -O3 -march=native -fopt-info-vec-missed -c kernel.cpp
kernel.cpp:32:31: missed: couldn't vectorize loop
kernel.cpp:32:31: missed: not vectorized: control flow in loop.
```

There is no `if` in that loop, so where is the control flow? It is inside `std::sqrt`. The C standard says that `sqrt` of a negative number must set the global error variable `errno`. The compiler has to keep a hidden branch for that case, and a branch per element blocks vectorisation. Nobody reads `errno` after a square root, so tell the compiler it may skip that:

```
g++ -O3 -march=native -fno-math-errno -fopt-info-vec-optimized -c kernel.cpp
kernel.cpp:32:31: optimized: loop vectorized using 32 byte vectors
kernel.cpp:32:31: optimized:  loop versioned for vectorization because of possible aliasing
```

Thirty-two bytes are four doubles: AVX2. The second line means that the compiler can't prove that the output array `m` doesn't overlap an input array. It made two versions of the loop and checks at run time which one is safe.

On a Mac the loop vectorises without the flag, because macOS never sets `errno` for math functions. With clang the report flag is `-Rpass=loop-vectorize`.

`-fno-math-errno` is harmless. Its big sibling `-ffast-math` is not: it also lets the compiler reorder additions and assume that no value is ever infinite or NaN, which changes results in the last digits and breaks code that checks for NaN. Use it only when you have measured that it helps and tested that the answers are still acceptable.

## The numbers

Nanoseconds per event for the mass calculation, measured on a 2.3 GHz server. First for 10,000 events, which fit into the cache:

- array of structures, `-O2`: 1.94
- columns, `-O2`: 1.94
- columns, `-O3 -march=native -fno-math-errno`: 0.97
- the same with `float` in place of `double`: 0.39

The layout alone changed nothing. Layout plus vectorisation gave a factor of 2, and single precision a factor of 5, because twice as many floats fit into a register.

Now for 10 million events, 640 MB of input:

- array of structures, `-O2`: 8.5
- columns, `-O2`: 5.9
- columns, vectorised: 5.0
- columns of floats, vectorised: 2.5

Everything is slower, and vectorisation hardly helps. The loop is no longer waiting for arithmetic. It waits for memory: 64 bytes per event have to travel from RAM, and one core can pull in something like 10 GB per second. The arithmetic is done long before the next cache line arrives. The only things that help now are fewer bytes per event, which is why the float version is twice as fast, and more cores.

Three things follow.

- Measure at the size you care about. A benchmark that fits into the cache says little about a job that doesn't.
- Work on data while it is in the cache. A pipeline that generates a batch of a few thousand events, computes on it and fills histograms from it before it moves on never pays the price of RAM. You will build exactly this in week 13.
- Single precision is a decision about physics as well as speed. With floats, the masses in this test were off by up to 0.005 GeV, because the calculation subtracts two large, nearly equal numbers. That is fine for a trigger decision and not for a mass measurement. Test before you switch.

## What can't be vectorised

Filling the histogram, `++counts[bin]`, stays scalar. Two events in the same vector register may fall into the same bin, and then the two increments would collide. Any loop where one step depends on the result of the previous one has the same problem. Calls to functions the compiler can't see into, and `if` statements with complicated bodies, also block vectorisation.
--- practice
@predict
A processor has AVX2 registers of 256 bits. How many doubles fit into one, and how many floats? Type the two numbers.
= 4 8
=| 4, 8
=| 4 and 8
! A double is 64 bits and a float 32. This is why single precision can be twice as fast in vectorised code, on top of using half the memory.

@choice
The compiler reports `not vectorized: control flow in loop` for a loop whose only function call is `std::sqrt`. What is the control flow?
- The loop condition `i < n`
* A hidden branch for negative arguments, where `sqrt` must set `errno`
- The call to `std::max`
- An exception that `sqrt` might throw
! `-fno-math-errno` removes the obligation and with it the branch. `std::max` on doubles is a single instruction and vectorises without trouble.

@local
Save the loop from the lesson as a function in `kernel.cpp`:
```
#include <algorithm>
#include <cmath>
#include <cstddef>

void masses(std::size_t n, const double* E1, const double* px1, const double* py1, const double* pz1,
            const double* E2, const double* px2, const double* py2, const double* pz2, double* m) {
    for (std::size_t i = 0; i < n; ++i) {
        const double E = E1[i] + E2[i];
        const double px = px1[i] + px2[i];
        const double py = py1[i] + py2[i];
        const double pz = pz1[i] + pz2[i];
        m[i] = std::sqrt(std::max(0.0, E * E - (px * px + py * py + pz * pz)));
    }
}
```
Compile it twice and paste what the compiler reports both times. First `g++ -std=c++17 -O3 -march=native -fopt-info-vec-missed -c kernel.cpp`, then the same with `-fno-math-errno -fopt-info-vec-optimized` in place of the `-fopt-info` flag. With clang, use `-Rpass=loop-vectorize` and `-Rpass-missed=loop-vectorize`.
min: 2
= vectorized
! The option `-c` compiles without linking, so the file needs no `main`. The number of bytes in the report tells you which instruction set was used: 16 is SSE2 or NEON, 32 is AVX2, 64 is AVX-512.

@choice
For 10 million events the vectorised loop is barely faster than the plain one, although it was twice as fast for 10,000 events. Why?
- Vector instructions overheat the processor
- The compiler switches vectorisation off for big arrays
* The data no longer fits into the cache, so the loop spends its time waiting for memory, and faster arithmetic doesn't shorten the wait
- The loop counter overflows
! The loop is memory-bound. Ways out are fewer bytes per event, working in batches that stay in the cache, and more cores, each with its own share of the memory traffic.

@predict
One core can read about 10 GB per second from RAM, and an event is 64 bytes. Roughly how many nanoseconds per event does the memory traffic alone cost? 1 GB is a billion bytes.
= 6.4
=| 6.4 ns
=| 6
=| 6 ns
=| 6.4 nanoseconds
! 10 billion bytes per second divided by 64 bytes is 156 million events per second, or 6.4 ns each. The measured 5 to 8 ns for the big sample are just that.

@write
From memory: a loop that computes the transverse momentum `pt[i]` from the columns `px[i]` and `py[i]` for `n` events, written so that the compiler can vectorise it. Then name the compiler flags you would use and what each one is for.
min: 5
```solution
for (std::size_t i = 0; i < n; ++i) {
    pt[i] = std::sqrt(px[i] * px[i] + py[i] * py[i]);
}
// -O3: turn the vectoriser on
// -march=native: allow the widest instructions this processor has
// -fno-math-errno: sqrt need not set errno, so no hidden branch
// -fopt-info-vec-optimized: report which loops were vectorised
```
! One simple loop over plain arrays, no function calls the compiler can't see into, and no dependence between iterations.

@choice
Which of these loops can the compiler not vectorise?
- `for (i...) c[i] = a[i] + b[i];`
- `for (i...) m[i] = std::sqrt(x[i]);` with `-fno-math-errno`
* `for (i...) ++counts[bin[i]];`
- `for (i...) y[i] = 2.0 * x[i] + 1.0;`
! Two elements handled in the same instruction might have the same `bin[i]`, and their increments would be lost. In the others every iteration writes to its own element.
--- recall
Q: What is the difference between an array of structures and a structure of arrays?
A: An array of structures stores each event's fields together. A structure of arrays stores each field's values for all events together, which suits caches and vector instructions.
Q: What does SIMD mean, and how many doubles does an AVX2 register hold?
A: Single instruction, multiple data: one instruction works on a short row of values at once. AVX2 registers are 256 bits, so 4 doubles or 8 floats.
Q: Which g++ flags report on vectorisation?
A: -fopt-info-vec-optimized lists the loops that were vectorised, -fopt-info-vec-missed the ones that weren't, with a reason.
Q: Why does std::sqrt block vectorisation, and what fixes it?
A: It must set errno for negative arguments, which needs a branch per element. -fno-math-errno removes that duty.
Q: What does it mean that a loop is memory-bound?
A: Its speed is set by how fast data arrives from RAM, not by the arithmetic. Faster instructions don't help. Fewer bytes per event, cache-sized batches and more cores do.
Q: Why can't a histogram fill be vectorised?
A: Two events in the same vector might fall into the same bin, and their increments would collide.

=== pf3 | cpp | 13 | Threads: std::thread, data races, mutexes and atomics | c32,c33
## Why threads

For twenty years processors have stopped getting much faster per core. They get more cores. A laptop has 8, a server at CERN 64 or more, and a program that uses one of them leaves the rest idle. The experiments' frameworks, CMSSW, Athena and Gaudi, were all rebuilt during the last decade to process several events at once.

A **thread** is an independent flow of execution inside one program. All threads of a program share the same memory. That is what makes them fast to start and easy to feed with data, and it is also the source of the bugs this lesson is about.

## Starting and joining

```
#include <thread>

std::thread worker([] { std::cout << "hello from a thread\n"; });
worker.join();
```

The constructor of `std::thread` takes something callable, usually a lambda, and starts running it at once on a new thread, while `main` continues. `join()` waits until that thread has finished. Every thread must be joined before its `std::thread` object is destroyed, or the program is terminated. With `g++` on Linux, add the flag `-pthread` when you compile and link.

`std::thread::hardware_concurrency()` reports how many threads the machine can run at once.

## Splitting work

To add up `sqrt(i)` for 200 million values of `i`, give each thread its own part of the range and its own place for the result:

```
std::vector<double> partial(threads, 0.0);
std::vector<std::thread> pool;
for (unsigned t = 0; t < threads; ++t) {
    pool.emplace_back([&partial, t, n, threads] {
        partial[t] = sum_range(n * t / threads, n * (t + 1) / threads);
    });
}
for (std::thread& th : pool) th.join();
const double total = std::accumulate(partial.begin(), partial.end(), 0.0);
```

`pool.emplace_back(...)` constructs a thread directly in the vector. The capture list `[&partial, t, n, threads]` takes `partial` by reference, so that the thread can write its result into it, and the other three by value, so that each thread keeps its own copy of `t`. Capturing the loop variable `t` by reference would be a bug: the loop changes it while the threads are reading it. `std::accumulate` from `<numeric>` adds up a range.

Each thread writes only to its own element of `partial`, once, at the end. On a machine with four cores this took 0.107 s against 0.395 s on one thread, a speed-up of 3.7.

One detail: the serial sum was 1885618076092.9043 and the parallel one 1885618076092.9583. Both are right. Floating-point addition rounds after every step, so adding the same numbers in a different order changes the last digits. A parallel program that sums doubles will not reproduce the serial result bit for bit, and tests have to allow for that. Integer counts, such as histogram bins, have no such problem.

## The data race

Now the version that looks simpler: all threads add to one shared variable.

```
long counter = 0;
// four threads, each: for (int i = 0; i < 10'000'000; ++i) ++counter;
```

The result should be 40,000,000. Compiled with `-O1`, two runs printed:

```
counted 18681753  expected 40000000
counted 21636232  expected 40000000
```

`++counter` is three steps: load the value from memory, add one, store it back. Two threads can both load 100, both add one, and both store 101. One increment is lost. With four threads hammering the same variable, half of them are lost.

This is a **data race**: two threads access the same memory at the same time, at least one of them writes, and nothing coordinates them. In C++ a data race is undefined behaviour. The same program compiled with `-O2` printed the correct 40,000,000, because the optimiser replaced each loop by a single addition and the collisions became rare. The bug was still there. That is what makes races so nasty: they depend on timing, they vanish when you add a print statement, and they come back in production.

In the reference solution of the project, four threads filling one shared histogram counted 19,134,155 events out of 20,000,000, and the program finished without any error message.

## ThreadSanitizer

You know AddressSanitizer for memory errors. Its sibling for races is **ThreadSanitizer**. Compile with `-fsanitize=thread -g` and run:

```
WARNING: ThreadSanitizer: data race (pid=8401)
  Read of size 8 at 0x7ffde2f43010 by thread T2:
    #0 operator() race.cpp:10
  Previous write of size 8 at 0x7ffde2f43010 by thread T1:
    #0 operator() race.cpp:10
  Location is stack of main thread.
SUMMARY: ThreadSanitizer: data race race.cpp:10 in operator()
```

It names the two accesses, the threads, the line, and where the memory lives. `operator()` is the body of the lambda. The program runs five to fifteen times slower under ThreadSanitizer, so use a small input. It can't be combined with AddressSanitizer in one build, so make a build of its own for each.

A parallel program is not finished until ThreadSanitizer is silent.

## Three cures and their prices

**A mutex.** A `std::mutex` from `<mutex>` is a lock that one thread can hold at a time. A `std::lock_guard` locks it in its constructor and unlocks it in its destructor, so it can't be forgotten:

```
std::mutex guard;
...
{
    std::lock_guard<std::mutex> lock(guard);
    ++counter;
}       // unlocked here
```

The code between locking and unlocking is the **critical section**, and only one thread at a time can be in it.

**An atomic.** `std::atomic<long> counter{0};` from `<atomic>` makes `++counter` a single indivisible step. It works for single numbers and not for anything larger.

**Don't share.** Give every thread its own variable and combine the results after joining.

The same 40 million increments, measured with four threads:

- mutex around every increment: 2,400 ms
- atomic counter: 700 ms
- a local variable per thread, added up at the end: 5 ms

All three are correct. The first two are slower than a single thread doing all the work alone, because the four threads spend their time passing one piece of memory back and forth. Sharing is expensive even when it is done correctly.

So the best synchronisation is none: partition the work, let each thread fill its own data, and merge at the end. For histograms that means one histogram per thread and an `add` function. ROOT does the same internally. Lock only what really is shared, and as rarely as possible.

## False sharing

There is a trap even when nothing is shared. Four threads each increment their own counter, and the four counters sit side by side in one array. Measured: 3,800 ms. With each counter on its own cache line: 400 ms.

The counters are different variables, but they lie on the same 64-byte cache line. Every write by one core invalidates that line in the caches of the other three, and the line bounces between cores. This is **false sharing**. The cure is to keep per-thread data apart:

```
struct Padded { alignas(64) std::atomic<long> value{0}; };
```

`alignas(64)` makes every object start at a multiple of 64 bytes, on a cache line of its own. Better still, do the work in a local variable and write to the shared array once at the end, as the partial sums above do.

## Deadlock

If thread A holds lock 1 and waits for lock 2, while thread B holds lock 2 and waits for lock 1, both wait forever. This is a **deadlock**. Avoid holding two locks at once. If you must, take both with one `std::scoped_lock lock(m1, m2);`, which acquires them in a safe order.
--- practice
@choice
Which of these is a data race?
- Two threads read the same vector at the same time, and nobody writes
- Two threads each write to their own element of a vector
* One thread appends to a vector while another reads its size
- Two threads write to the same counter, each while holding the same mutex
! A race needs a shared location, at least one writer and no coordination. Reading together is safe. Different elements are different locations, though they may suffer false sharing. `push_back` writes the size and may move the whole buffer under the reader.

@local
Save this as `race.cpp`. Compile it with `g++ -std=c++17 -O1 -pthread race.cpp -o race`, run it three times and paste the three lines.
```
#include <iostream>
#include <thread>
#include <vector>

int main() {
    long counter = 0;
    std::vector<std::thread> pool;
    for (int t = 0; t < 4; ++t) {
        pool.emplace_back([&counter] {
            for (int i = 0; i < 10'000'000; ++i) ++counter;
        });
    }
    for (std::thread& th : pool) th.join();
    std::cout << "counted " << counter << "  expected 40000000\n";
}
```
min: 3
= expected 40000000
! Most runs count far too few, and each run a different number. If you see 40000000, try again, or compile with `-O0`. A race that sometimes gives the right answer is still a race.

@local
Compile the same file with `g++ -std=c++17 -O1 -g -fsanitize=thread -pthread race.cpp -o race_tsan`, run it, and paste the first warning up to and including the line that starts with `SUMMARY`.
min: 4
= ThreadSanitizer: data race
= race.cpp:10
! The report points at line 10, the `++counter`, twice: once for each of the two threads that collided.

@local
Now repair it without a mutex and without an atomic. Write `sum.cpp`: four threads add up the whole numbers from 0 to 99,999,999. Thread `t` handles its quarter of the range in a local variable and stores the result in `partial[t]`. `main` joins the threads, adds the four results and prints the total. Use `long` for the sums. Paste the output.
min: 1
= 4999999950000000
```solution
#include <iostream>
#include <numeric>
#include <thread>
#include <vector>

int main() {
    const long n = 100'000'000;
    const unsigned threads = 4;
    std::vector<long> partial(threads, 0);
    std::vector<std::thread> pool;
    for (unsigned t = 0; t < threads; ++t) {
        pool.emplace_back([&partial, t, n, threads] {
            const long begin = n * t / threads;
            const long end = n * (t + 1) / threads;
            long local = 0;
            for (long i = begin; i < end; ++i) local += i;
            partial[t] = local;
        });
    }
    for (std::thread& th : pool) th.join();
    std::cout << std::accumulate(partial.begin(), partial.end(), 0L) << '\n';
}
```
! The sum of 0 to n − 1 is n(n − 1)/2. With integers the result is exact and the same on every run. Note `0L` in `accumulate`: with a plain `0` the sum would be computed as an `int` and overflow.

@choice
Four threads fill one shared histogram, and every `fill` is protected by a mutex. The result is correct, but the program is slower than with one thread. What is the better design?
- Use a faster mutex
- Use eight threads
* Give every thread its own histogram and add them together after the threads have joined
- Remove the mutex and accept small errors
! Per-thread data needs no lock at all, and the merge happens once. In the reference project the mutex version took 1.27 s and the merged version 0.92 s for the same 20 million events.

@choice
Four threads each increment their own element of a `std::vector<std::atomic<long>>` with four elements. There is no race, yet it runs ten times slower than expected. Why?
- Atomics are always this slow
* The four elements share one cache line, and every write by one core takes that line away from the others
- The vector reallocates
- The threads run on the same core
! False sharing. Padding each element to 64 bytes with `alignas(64)`, or counting in a local variable and storing once, removes it.

@write
From memory: the lines that protect `total += x;` with a mutex named `guard`, so that the lock is released even if an exception is thrown. Then one sentence on why `std::lock_guard` is preferred to calling `guard.lock()` and `guard.unlock()` yourself.
min: 3
```solution
{
    std::lock_guard<std::mutex> lock(guard);
    total += x;
}
// The lock_guard unlocks in its destructor, so the mutex is released on every way out of the block,
// including an early return and an exception. A forgotten unlock() would block all other threads forever.
```
! This is RAII again: the lock is a resource, and an object's lifetime manages it.
--- recall
Q: What is a data race?
A: Two threads access the same memory at the same time, at least one of them writes, and nothing synchronises them. It is undefined behaviour.
Q: How do you find data races?
A: Build with -fsanitize=thread -g and run. ThreadSanitizer reports both accesses, the threads and the source lines.
Q: Name three ways to make a shared counter correct, from slowest to fastest.
A: A mutex with std::lock_guard, a std::atomic, and not sharing at all: one local value per thread, combined after join.
Q: What is false sharing?
A: Threads write to different variables that lie on the same cache line, so the line bounces between cores. Keep per-thread data on separate cache lines, for example with alignas(64).
Q: Why can a parallel sum of doubles differ from the serial sum in the last digits?
A: Floating-point addition rounds at every step, so adding in a different order gives a slightly different result.
Q: What must happen to every std::thread before it is destroyed?
A: It must be joined with join(), which waits for the thread to finish.

=== pf4 | cpp | 13 | OpenMP: parallel loops in one line | c34
## What OpenMP is

Writing thread pools by hand teaches you what happens, and it is a lot of code for the commonest case, a loop whose iterations are independent. **OpenMP** is an extension of C, C++ and Fortran that parallelises such loops with a single line. It is built into `g++` and clang and is the standard tool in scientific computing, including the high-performance computing centres that CERN uses.

You switch it on with the compiler flag `-fopenmp`. The instructions are **pragmas**, lines starting with `#pragma omp`. Without the flag, the compiler ignores them and the program runs on one thread, unchanged. That is by design: the serial program stays intact inside the parallel one.

## A parallel loop

```
#include <omp.h>

double sum = 0.0;
#pragma omp parallel for reduction(+:sum)
for (long i = 0; i < n; ++i) {
    sum += std::sqrt(static_cast<double>(i));
}
```

`parallel for` starts a team of threads and divides the iterations of the following loop among them. That alone would be a data race on `sum`. The clause `reduction(+:sum)` cures it the way you did by hand last lesson: every thread gets a private `sum` starting at zero, and at the end the private copies are added to the original.

For 200 million iterations this took 0.108 s on four cores against 0.402 s on one. The sum again differs in the last digits with the number of threads, for the reason you know.

The loop must have the simple shape `for (i = start; i < end; ++i)`, so that OpenMP can count the iterations before it starts.

## Shared and private

Variables declared outside the parallel region are **shared**: all threads see the same one. Variables declared inside the loop body are **private**: each thread has its own. The loop variable is private automatically.

Most OpenMP bugs are a shared variable that should have been private. The easy fix is to declare variables inside the loop body, where they are used.

## How many threads

By default OpenMP uses as many threads as the machine has logical cores. The environment variable `OMP_NUM_THREADS` changes that without recompiling:

```
OMP_NUM_THREADS=2 ./prog
```

In the code, `omp_get_max_threads()` gives the number that a parallel region will use, `omp_get_thread_num()` the number of the calling thread, from 0, and `omp_get_wtime()` the wall-clock time in seconds, a convenient stopwatch.

## Scheduling

By default, the **static** schedule cuts the iterations into equal blocks, one per thread. That is ideal when every iteration costs the same. When they don't, one thread gets the expensive block and the others finish early and wait.

Counting the primes below 5 million by trial division is such a case: testing a large number takes longer than testing a small one. Measured on four cores:

```
serial    primes 348513   2.16 s
static    primes 348513   0.72 s      speed-up 3.0
dynamic   primes 348513   0.54 s      speed-up 4.0
```

`schedule(dynamic, 1000)` hands out the iterations in chunks of 1000, and a thread that finishes its chunk fetches the next. Nobody waits. The chunk size is a trade-off: handing out a chunk costs a little, so chunks should be big enough to make that cost invisible and small enough to balance the load. `schedule(guided)` starts with big chunks and shrinks them.

## Histograms: reducing an array

A reduction also works on a whole array. Each thread gets a private copy of it, and the copies are added element by element at the end:

```
long counts[10] = {};
#pragma omp parallel for reduction(+:counts[:10])
for (long i = 0; i < n; ++i) {
    counts[bin_of(i)] += 1;
}
```

`counts[:10]` means the first ten elements of `counts`.

For objects of your own, such as your `Histogram` class, split the pragma in two. `parallel` starts the threads, everything declared inside the block is private to each thread, `for` shares out the loop, and `critical` marks a block that only one thread at a time may enter:

```
#pragma omp parallel
{
    Histogram mine(120, 60.0, 120.0);          // one per thread
    #pragma omp for schedule(dynamic)
    for (std::size_t k = 0; k < n_chunks; ++k) {
        process_chunk(k, mine);
    }
    #pragma omp critical
    total.add(mine);                           // one thread at a time
}
```

This is the same design as your hand-written thread pool: private histograms, one merge each at the end. The critical section is entered once per thread, so it costs nothing.

## Speed-up, efficiency and where it stops

**Speed-up** is the time on one thread divided by the time on `n` threads. **Efficiency** is the speed-up divided by `n`. Four threads with a speed-up of 3.7 have an efficiency of 92%.

Efficiency falls for three reasons, and you can now name all of them.

- **Amdahl's law.** Whatever stays serial, such as reading input and merging results, limits the speed-up.
- **Memory.** All cores share the path to RAM. A memory-bound loop stops scaling when that path is full, often at 2 to 4 threads.
- **More threads than cores.** The reference pipeline went from 0.92 s on 4 threads to 0.87 s on 8, on a machine with 4 cores. Many processors report two logical cores for each physical one (hyper-threading). The second one shares the arithmetic units of the first and adds perhaps 20%, not 100%.

A scaling plot, speed-up against the number of threads with the ideal diagonal drawn in, shows all of this at a glance, and you will make one for the project.

## A caveat on ThreadSanitizer

`g++`'s OpenMP library is not built for ThreadSanitizer, and the two together report races that don't exist. Check your logic for races in the `std::thread` version of the code, or build the OpenMP version with clang, whose OpenMP library cooperates.
--- practice
@predict
A loop takes 12.0 s on one thread and 3.75 s on four. What are the speed-up and the efficiency? Type the two numbers, the efficiency in percent.
= 3.2 80
=| 3.2, 80
=| 3.2 80%
=| 3.2 and 80%
=| 3.2, 80%
! 12.0 / 3.75 = 3.2, and 3.2 / 4 = 0.80. A fifth of the four cores' time is lost to serial parts, waiting or memory.

@choice
What does `reduction(+:sum)` do?
- It locks `sum` with a mutex on every addition
* Each thread gets a private copy of `sum` starting at 0, and the copies are added to the original at the end of the loop
- It makes `sum` an atomic variable
- It runs the loop on one thread
! It is the partial-sums pattern, written by the compiler. There is no locking inside the loop, which is why it scales.

@local
Write `primes.cpp`. The function `bool is_prime(long n)` returns false for `n < 2` and otherwise tests the divisors `d = 2, 3, 4, ...` while `d * d <= n`. `main` counts the primes below 5,000,000 three times: in a plain loop, with `#pragma omp parallel for reduction(+:count) schedule(static)` and with `schedule(dynamic, 1000)`. Time each with `omp_get_wtime()` and print a line with the count and the seconds. Compile with `g++ -std=c++17 -O2 -fopenmp primes.cpp -o primes` and paste the three lines.
min: 3
= 348513
```solution
#include <iostream>
#include <omp.h>

bool is_prime(long n) {
    if (n < 2) return false;
    for (long d = 2; d * d <= n; ++d) {
        if (n % d == 0) return false;
    }
    return true;
}

int main() {
    const long limit = 5'000'000;

    long count = 0;
    double t0 = omp_get_wtime();
    for (long n = 0; n < limit; ++n) count += is_prime(n);
    std::cout << "serial   primes " << count << "  " << omp_get_wtime() - t0 << " s\n";

    count = 0;
    t0 = omp_get_wtime();
    #pragma omp parallel for reduction(+:count) schedule(static)
    for (long n = 0; n < limit; ++n) count += is_prime(n);
    std::cout << "static   primes " << count << "  " << omp_get_wtime() - t0 << " s\n";

    count = 0;
    t0 = omp_get_wtime();
    #pragma omp parallel for reduction(+:count) schedule(dynamic, 1000)
    for (long n = 0; n < limit; ++n) count += is_prime(n);
    std::cout << "dynamic  primes " << count << "  " << omp_get_wtime() - t0 << " s\n";
}
```
! All three must print 348513. Adding a `bool` to a `long` adds 1 or 0. The static schedule gives the thread with the largest numbers the most work, so the dynamic one is usually clearly faster.

@choice
In the prime count, why does the static schedule give a speed-up of only 3.0 on four cores?
- The reduction is slow
- Prime numbers can't be parallelised
* The last quarter of the range holds the largest numbers, which take longest to test, so one thread is still working when the others have finished
- Static schedules use only three threads
! Equal numbers of iterations are not equal amounts of work. A dynamic schedule lets the idle threads take over part of the heavy end.

@predict
You compile a program that contains `#pragma omp parallel for` but forget the flag `-fopenmp`. The code calls no function from `omp.h`. On how many threads does the loop run?
= 1
=| one
! An unknown pragma is ignored, so the program is the serial one. With `-Wall` the compiler warns about it. If the code calls `omp_get_wtime()` or its relatives, the link step fails with an undefined reference.

@choice
A memory-bound loop over 640 MB of data reaches a speed-up of 2.1 on 8 cores. What is the most likely reason?
- A data race
- OpenMP is misconfigured
* All cores share the connection to main memory, and it is already saturated by two or three of them
- The loop has too few iterations
! More threads can't pull data out of RAM faster than the memory bus delivers it. Working in cache-sized batches, or shrinking the data, helps where more threads don't.

@write
From memory: a loop that fills `long counts[120]` from `n` values `m[i]` with `bin = static_cast<int>((m[i] - 60.0) * 2.0)`, parallelised with OpenMP so that there is no data race. Assume every value lies between 60 and 120.
min: 4
```solution
long counts[120] = {};
#pragma omp parallel for reduction(+:counts[:120])
for (long i = 0; i < n; ++i) {
    const int bin = static_cast<int>((m[i] - 60.0) * 2.0);
    counts[bin] += 1;
}
```
! The array reduction gives each thread its own 120 counters and adds them up at the end. `bin` is declared inside the loop and is therefore private.
--- recall
Q: Which pragma parallelises a loop that adds into a variable sum?
A: #pragma omp parallel for reduction(+:sum), compiled with -fopenmp.
Q: In OpenMP, which variables are shared and which are private?
A: Variables declared outside the parallel region are shared. Those declared inside it, and the loop variable, are private to each thread.
Q: When do you use schedule(dynamic)?
A: When iterations differ in cost. Threads fetch chunks of iterations as they finish, so none sits idle while another is overloaded.
Q: How do you set the number of OpenMP threads without recompiling?
A: With the environment variable OMP_NUM_THREADS, for example OMP_NUM_THREADS=2 ./prog.
Q: Define speed-up and efficiency.
A: Speed-up is the time on one thread divided by the time on n threads. Efficiency is the speed-up divided by n.
Q: Name three reasons why a program doesn't get n times faster on n cores.
A: Serial parts (Amdahl's law), a saturated memory connection, and logical cores that are not real ones.

=== pf5 | cpp | 14 | GPUs and portability layers: CUDA, alpaka and SYCL | 
## Why you need to know this

From 2030 the upgraded LHC will deliver several times more collisions per second than today, and the computing budget will not grow with it. All four big experiments have turned to graphics processors for part of the answer. LHCb runs the whole first stage of its software trigger, a program called Allen, on GPUs, examining every one of the 30 million bunch crossings per second. CMS has run part of its high-level trigger on GPUs since 2022. ALICE reconstructs the data of its main tracking detector on GPUs. A large share of openlab projects are about exactly this. You don't need a GPU for this lesson, and you should be able to talk about them.

## What a GPU is

A processor has a handful of powerful cores, each able to run any program quickly. A **GPU** has thousands of simple cores that are good at one thing: doing the same arithmetic on a very large number of values at once. It was built to compute millions of pixels per frame, and physics has plenty of work of the same shape: a million hits, a million track candidates, a million calorimeter cells.

Two properties decide whether a GPU helps.

It has **its own memory**. Data must be copied from the computer's memory to the card and the results copied back, over a connection that is slow compared with either memory. A small job can spend more time on the transfers than the card saves.

It is built for **throughput and not for quick reactions**. Starting a computation on it has a fixed cost. One event at a time is a poor fit, and a batch of a thousand events a good one.

## The CUDA model

**CUDA** is the programming system of NVIDIA, the largest GPU maker. Its vocabulary is used everywhere, including by its competitors. The CPU side is the **host** and the GPU the **device**. A function that runs on the device is a **kernel**. You launch a kernel on many threads at once, and each thread works out from its own index which element it is responsible for:

```
__global__ void saxpy(int n, float a, const float* x, float* y) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) y[i] = a * x[i] + y[i];
}

// on the host, with x and y already copied to the device:
saxpy<<<(n + 255) / 256, 256>>>(n, 2.0f, d_x, d_y);
```

`__global__` marks a kernel. There is no loop. The loop is replaced by the launch: `<<<blocks, threads_per_block>>>` starts that many blocks of 256 threads each, and each thread computes its global index `i` from the built-in variables `blockIdx`, `blockDim` and `threadIdx`. The check `i < n` is needed because the number of threads is rounded up to a whole number of blocks. `(n + 255) / 256` is the usual way to divide and round up with integers.

Around this sit the calls that allocate memory on the device and copy data to it and back. They are usually the bulk of the code, and getting them wrong is the usual performance problem.

## Why portability layers

CUDA runs only on NVIDIA hardware. AMD has its own system, HIP, and Intel builds on the open standard **SYCL**. An experiment that will run for another twenty years can't tie two million lines of code to one vendor, and it also wants the same algorithm to run on a plain CPU, for the Grid sites that have no GPUs and for debugging.

A **portability layer** is a C++ library in which you write a kernel once and compile it for several back ends: CPU threads, NVIDIA, AMD or Intel GPUs. CMS chose **alpaka**, developed in Germany, for its reconstruction. Others use **Kokkos** from the US national laboratories or SYCL directly. In alpaka a kernel is a class with a templated function call operator:

```
struct SaxpyKernel {
    template <typename TAcc>
    ALPAKA_FN_ACC void operator()(const TAcc& acc, float a, const float* x, float* y, std::size_t n) const {
        // body written once, compiled for whatever accelerator TAcc is
    }
};
```

`TAcc` is the accelerator type, chosen at compile time. You don't need to write alpaka yet. You should recognise the shape and know why the template parameter is there.

## What makes code ready for a GPU

This is the practical part, and you have practised all of it.

- **Structure of arrays.** A GPU works on columns. The layout you built in week 11 is the one CMS uses for its GPU data formats.
- **No pointer chasing and no virtual calls.** Kernels work on plain arrays of numbers.
- **No allocation inside a kernel.** All memory is reserved beforehand, with sizes known in advance.
- **Few branches.** Thousands of threads take the same path most efficiently. Write `if (i < n)` and little more.
- **Single precision where physics allows it.** Many GPUs are far faster with `float` than with `double`.
- **Batches.** Collect work and send it at once.

Code that follows these rules is also fast on a CPU, because the same properties are what vectorisation and caches want. That is why "make it run on a GPU" projects usually begin with months of restructuring data, and why that work pays off even if the GPU never comes.

## When a GPU doesn't help

Amdahl's law applies here too. If the part you move to the GPU is 30% of the run, the best possible gain is a factor of 1.4. Small problems are eaten by the transfer cost. Algorithms where each step depends on the previous one, or that follow different paths for every element, don't fit the model. And a GPU node costs more and uses more power than a CPU node, so the comparison that matters at a computing centre is events per second per franc or per watt.

## Trying one

Google Colab offers a free GPU in the browser (Runtime, Change runtime type, T4 GPU). The Python library **CuPy** has the same interface as NumPy and runs on the GPU:

```
import numpy as np, cupy as cp, time

x = np.random.rand(20_000_000).astype(np.float32)

t0 = time.perf_counter(); y = np.sqrt(x * x + 1.0); t_cpu = time.perf_counter() - t0

t0 = time.perf_counter(); gx = cp.asarray(x); cp.cuda.Stream.null.synchronize(); t_to = time.perf_counter() - t0
t0 = time.perf_counter(); gy = cp.sqrt(gx * gx + 1.0); cp.cuda.Stream.null.synchronize(); t_gpu = time.perf_counter() - t0
t0 = time.perf_counter(); back = cp.asnumpy(gy); t_back = time.perf_counter() - t0

print(t_cpu, t_to, t_gpu, t_back)
```

`cp.asarray` copies an array to the device and `cp.asnumpy` copies one back. GPU calls return before the work is finished, so `synchronize()` waits for it, and without that the stopwatch would stop too early. Run the timed part twice, because the first use of the GPU includes a one-time start-up. Typically the computation itself is many times faster than NumPy, and the two transfers together take longer than the computation. Both halves of this lesson are in that one line of output.
--- practice
@choice
Which kind of work suits a GPU best?
- Parsing a text file line by line
- A recursive search through a tree of pointers
* The same arithmetic applied to millions of independent values
- One small calculation that must answer within a microsecond
! A GPU is thousands of simple cores doing the same thing to different data. Branchy, sequential or tiny work belongs on the CPU.

@predict
A CUDA kernel is launched with blocks of 256 threads for `n = 1000` elements. How many blocks does `(n + 255) / 256` give with integer division, and how many threads start in total? Type the two numbers.
= 4 1024
=| 4, 1024
=| 4 and 1024
! 1255 / 256 is 4 with the remainder dropped, and 4 × 256 = 1024. The 24 surplus threads are the reason for the check `if (i < n)` in the kernel.

@choice
A reconstruction step takes 30% of the run time. Moved to a GPU, it becomes 20 times faster. By how much does the whole program speed up?
- 20 times
- 6 times
* About 1.4 times
- About 3 times
! Amdahl: 1 / (0.7 + 0.3 / 20) = 1.40. To gain more, more of the program has to move, which is why the experiments port whole chains of algorithms and not single functions.

@choice
Why did CMS write its GPU code with alpaka and not directly in CUDA?
- alpaka is faster than CUDA on NVIDIA cards
- CUDA can't be used from C++
* The same source can be compiled for NVIDIA, AMD and Intel GPUs and for plain CPUs, so the experiment is not tied to one vendor and needs no second implementation for machines without a GPU
- alpaka needs no compiler
! One implementation to maintain and to validate, on every kind of hardware the experiment will meet over decades.

@choice
You copy 10,000 numbers to a GPU, take their square roots there and copy them back. It is slower than NumPy on the CPU. Why?
- GPUs can't compute square roots
* For so little work, the transfers and the fixed cost of launching the computation outweigh the time saved
- The numbers were sorted
- The GPU was too hot
! The CPU finishes 10,000 square roots in a few microseconds. A GPU pays off when the work per transfer is large.

@write
A supervisor asks: "We want to move our clustering algorithm to GPUs. From what you know, what would you look at in the existing code first?" Answer in your own words.
min: 60
```solution
First I would profile to see what share of the total run time the clustering takes, because Amdahl's law limits the gain to that share. Then I would look at how its data is stored. A GPU wants plain arrays in a structure-of-arrays layout, so objects linked by pointers, containers of containers and virtual function calls would have to be replaced. I would check whether memory is allocated inside the algorithm, whether the work on one element is independent of the others or has a loop where each step needs the previous result, and how much branching there is. I would also ask how many elements arrive per event, since small inputs are dominated by the transfer cost and may need several events batched together. And I would want a CPU version of the restructured code first, with a test that it reproduces the old results.
```
! A strong answer mentions the share of run time, the data layout, independence of the elements, allocation and branching, the size of the input, and a way to validate the result.
--- recall
Q: What kind of work is a GPU good at?
A: The same arithmetic on a very large number of independent values. It has thousands of simple cores and is built for throughput.
Q: In CUDA's vocabulary, what are host, device and kernel?
A: The host is the CPU side, the device is the GPU, and a kernel is a function that runs on the device on many threads at once.
Q: Why do transfers matter for GPU performance?
A: The GPU has its own memory. Data must be copied to it and results copied back, and for small jobs that costs more than the computation saves.
Q: What is a portability layer, and name two.
A: A C++ library that lets one source run on CPUs and on GPUs of several vendors. alpaka (used by CMS), Kokkos, and the SYCL standard.
Q: Name four properties of GPU-friendly code.
A: Structure-of-arrays data, no pointer chasing or virtual calls, no allocation inside kernels, few branches. Also single precision and work in batches.
Q: Which LHC experiment runs its entire first-level software trigger on GPUs?
A: LHCb, with the Allen project, on all 30 million bunch crossings per second.

=== rt1 | py | 14 | RDataFrame: say what you want, and let ROOT run the loop | p36
## The idea

In weeks 12 and 13 you wrote an event loop by hand, split it into chunks, gave every thread its own histogram and merged them. That is the right way to learn it. In daily work at CERN you rarely write it, because ROOT's **RDataFrame** does it for you. You state what you want: these events, this new quantity, that histogram. ROOT writes the loop, runs it on all cores and merges the results. This style is called **declarative**, and it is the recommended way to analyse data in ROOT today.

## Installing ROOT

- Linux and WSL: `pip install root` installs an official but still experimental package. The alternative is conda: `conda create -n root -c conda-forge root`, then `conda activate root`.
- macOS: the conda command above, or `brew install root`.

Check it with `python -c "import ROOT; print(ROOT.gROOT.GetVersion())"`. The examples here were run with version 6.40.

## A first data frame

```
import ROOT

df = ROOT.RDF.FromCSV("Dimuon_DoubleMu.csv")
print(df.GetColumnType("E1"), df.GetColumnType("Q1"))        # double Long64_t
```

`FromCSV` builds a data frame from a text file and works out the type of each column. For a ROOT file you write `ROOT.RDataFrame("treename", "file.root")`, and a list of files works too. `Long64_t` is ROOT's name for a 64-bit integer.

Three operations cover most of an analysis.

```
df2 = (df.Define("m", "sqrt(max(0.0, (E1+E2)*(E1+E2) - (px1+px2)*(px1+px2) - (py1+py2)*(py1+py2) - (pz1+pz2)*(pz1+pz2)))")
         .Filter("Q1 * Q2 < 0", "opposite charge"))

h = df2.Histo1D(("m", "Dimuon mass;m (GeV);Events / 0.5 GeV", 240, 0.0, 120.0), "m")
n_z = df2.Filter("m > 80 && m < 100", "Z window").Count()
```

`Define(name, expression)` adds a column. `Filter(expression, label)` keeps the events for which the expression is true, and the label names the cut for the report. `Histo1D`, `Count`, `Mean`, `Sum`, `Min` and `Max` are **actions**: they produce results. The tuple given to `Histo1D` is the histogram's name, its title with the axis labels separated by semicolons, and the binning.

The expressions are strings of **C++**, not Python, so `&&` and not `and`. ROOT compiles them to machine code when the loop starts.

## Nothing has happened yet

None of the lines above has read a single event. Each one only adds a node to a graph of work to be done. This is **lazy evaluation**. The loop runs once, at the moment you first ask for a result:

```
print(n_z.GetValue())          # the event loop runs here, for h and n_z together
print(h.GetEntries())          # already filled: no second loop
```

Because everything is booked before the loop runs, all histograms and counts are filled in a single pass over the data. `df.GetNRuns()` tells you how many loops have run. If it is more than one, you asked for a result too early, before booking the rest. On the CMS file the lines above give 100,000 events and 5,174 in the Z window.

## The price of the first second

Compiling the expression strings takes two to three seconds, however small the data. For the 100,000 events of the CSV file, RDataFrame is therefore much slower than your NumPy script or your C++ program. For a billion events on 32 cores the few seconds don't matter and the compiled, parallel loop does. Know which regime you are in.

## Columns that hold arrays

In real LHC data an event holds a varying number of leptons, so a column such as `lep_pt` is an array per event. RDataFrame hands such columns to your expressions as `RVec` objects, which support arithmetic and helper functions element by element:

```
df = ROOT.RDataFrame("mini", files)

sel = (df.Filter("lep_n == 4", "exactly four leptons")
         .Filter("Sum(lep_charge) == 0", "total charge zero")
         .Define("lead_pt", "Max(lep_pt) / 1000.0"))
```

`Sum`, `Max`, `Min`, `Mean` and `Sort` act on one event's array. A comparison such as `lep_pt > 25000` gives an array of true and false, and `lep_pt[lep_pt > 25000]` selects elements exactly as a NumPy mask does.

When an expression gets too long for a string, declare a C++ function once and call it by name:

```
ROOT.gInterpreter.Declare("""
#include "Math/Vector4D.h"
#include "ROOT/RVec.hxx"
float mass_of_all(const ROOT::RVec<float>& pt, const ROOT::RVec<float>& eta,
                  const ROOT::RVec<float>& phi, const ROOT::RVec<float>& e) {
    ROOT::Math::PtEtaPhiEVector total;
    for (std::size_t i = 0; i < pt.size(); ++i)
        total += ROOT::Math::PtEtaPhiEVector(pt[i], eta[i], phi[i], e[i]);
    return total.M() / 1000.0;
}
""")

sel = sel.Define("m4l", "mass_of_all(lep_pt, lep_eta, lep_phi, lep_E)")
```

`gInterpreter.Declare` compiles the C++ text on the spot. `PtEtaPhiEVector` is ROOT's four-vector that is built from pT, η, φ and E, so you don't convert by hand, and `M()` is its invariant mass. On the four ATLAS files from the sprint this gives the numbers you found with uproot: 832 events, 644 after the two cuts, 49 between 120 and 130 GeV.

## All cores, and a cut flow for free

```
ROOT.EnableImplicitMT()            # before the data frame is created
```

With this one line the loop runs on all cores. ROOT splits the data into chunks, gives every thread its own copy of each histogram and merges them at the end, which is what you built by hand. The price is that events are no longer processed in file order.

```
sel.Report().Print()
```

```
exactly four leptons: pass=827   all=832   -- eff=99.40 % cumulative eff=99.40 %
total charge zero   : pass=644   all=827   -- eff=77.87 % cumulative eff=77.40 %
```

`Report` lists every labelled filter with the number of events that reached it and that passed it. Physicists call this table a **cut flow**, and every analysis note has one.

## Out to NumPy

`sel.AsNumpy(["m4l"])` runs the loop and returns a dictionary of NumPy arrays, one per column, ready for matplotlib or for your fit. `Snapshot("tree", "out.root", ["m4l"])` writes the selected events and columns to a new, smaller ROOT file, which is how analyses reduce terabytes to something that fits on a laptop.
--- practice
@choice
What happens when Python executes `h = df.Filter("m > 80").Histo1D("m")`?
- The file is read and the histogram is filled
- The filter runs, and the histogram waits
* Nothing is read. The filter and the histogram are booked, and the loop runs when a result is first requested
- An error, because no loop was started
! Lazy evaluation. It is what lets ROOT fill every booked result in one pass.

@predict
You book three histograms and two counts on the same data frame, and then print all five results. How many times does ROOT loop over the data?
= 1
=| once
=| one
! All five were booked before the first result was requested, so one loop fills them all. `GetNRuns()` confirms it.

@local
Run this on the CMS file from Project 1 and paste the output.
```
import ROOT

df = ROOT.RDF.FromCSV("Dimuon_DoubleMu.csv")
df2 = (df.Define("m", "sqrt(max(0.0, (E1+E2)*(E1+E2) - (px1+px2)*(px1+px2) - (py1+py2)*(py1+py2) - (pz1+pz2)*(pz1+pz2)))")
         .Filter("Q1 * Q2 < 0", "opposite charge"))
h = df2.Histo1D(("m", "Dimuon mass;m (GeV);Events / 0.5 GeV", 240, 0.0, 120.0), "m")
z = df2.Filter("m > 80 && m < 100", "Z window")
n_z = z.Count()
mean_z = z.Mean("m")

print("events", df.Count().GetValue())
print("Z window", n_z.GetValue(), "mean", round(mean_z.GetValue(), 3))
print("loops", df.GetNRuns())
z.Report().Print()
```
min: 4
= events 100000
= Z window 5174
= loops 1
! The script prints `loops 1`. The first `GetValue()` came after the histogram, the Z count and the mean had all been booked, so one pass over the file filled everything. The report shows that every event of this file has two muons of opposite charge, and that 5.17% of them fall into the Z window.

@choice
Inside a `Filter` or `Define` string, how do you write "pt above 20 and absolute eta below 2.4"?
- `pt > 20 and abs(eta) < 2.4`
* `pt > 20 && abs(eta) < 2.4`
- `(pt > 20) & (np.abs(eta) < 2.4)`
- `pt > 20, abs(eta) < 2.4`
! The strings are C++. The first is Python and the third is NumPy. Both fail with a compiler error from ROOT's interpreter.

@local
Run the four-lepton selection on the four ATLAS files `data_A.4lep.root` to `data_D.4lep.root` from the sprint. Use the code from the lesson: `ROOT.EnableImplicitMT()`, the two filters, the declared function `mass_of_all`, the column `m4l`, and a count of events with `m4l >= 120 && m4l < 130`. Print the number of selected events and that count, then print the report. Paste the output.
min: 4
= 644
= 49
= total charge zero
```solution
import ROOT
ROOT.EnableImplicitMT()

ROOT.gInterpreter.Declare("""
#include "Math/Vector4D.h"
#include "ROOT/RVec.hxx"
float mass_of_all(const ROOT::RVec<float>& pt, const ROOT::RVec<float>& eta,
                  const ROOT::RVec<float>& phi, const ROOT::RVec<float>& e) {
    ROOT::Math::PtEtaPhiEVector total;
    for (std::size_t i = 0; i < pt.size(); ++i)
        total += ROOT::Math::PtEtaPhiEVector(pt[i], eta[i], phi[i], e[i]);
    return total.M() / 1000.0;
}
""")

files = ["data_A.4lep.root", "data_B.4lep.root", "data_C.4lep.root", "data_D.4lep.root"]
df = ROOT.RDataFrame("mini", files)
sel = (df.Filter("lep_n == 4", "exactly four leptons")
         .Filter("Sum(lep_charge) == 0", "total charge zero")
         .Define("m4l", "mass_of_all(lep_pt, lep_eta, lep_phi, lep_E)"))
n_sel = sel.Count()
n_higgs = sel.Filter("m4l >= 120 && m4l < 130").Count()
print("selected", n_sel.GetValue(), "in 120 to 130:", n_higgs.GetValue())
sel.Report().Print()
```
! The same 644 and 49 as with uproot in week 10, from a different tool. Two independent implementations that agree are the strongest check an analysis has.

@choice
A colleague's RDataFrame script on 100,000 events takes four seconds, and your NumPy script takes 0.2. What is the most likely explanation?
- RDataFrame is slow
- NumPy skips events
* ROOT spends a few seconds compiling the expression strings before the loop starts. For so few events that fixed cost dominates
- The colleague forgot `EnableImplicitMT()`
! The fixed cost is paid once. At a hundred million events it is invisible, and the compiled multi-threaded loop wins.

@write
From memory: open the tree `mini` in `data.root`, keep events with exactly two leptons, define `lead_pt` as the largest lepton pT in GeV (the file stores MeV), book a histogram of it with 50 bins from 0 to 200, and print the mean of `lead_pt`.
min: 5
```solution
import ROOT

df = ROOT.RDataFrame("mini", "data.root")
sel = (df.Filter("lep_n == 2", "two leptons")
         .Define("lead_pt", "Max(lep_pt) / 1000.0"))
h = sel.Histo1D(("lead_pt", ";leading p_{T} (GeV);Events", 50, 0.0, 200.0), "lead_pt")
mean = sel.Mean("lead_pt")
print(mean.GetValue())
```
! Book everything first, ask for values last. The one `GetValue()` runs the loop and fills the histogram too.
--- recall
Q: What are the three basic RDataFrame operations?
A: Filter(expression, label) selects events, Define(name, expression) adds a column, and actions such as Histo1D, Count and Mean produce results.
Q: What does lazy evaluation mean in RDataFrame?
A: Filters, definitions and actions are only booked. The event loop runs once, when the first result is requested, and fills everything booked so far.
Q: In which language are the expression strings of Filter and Define written?
A: C++. ROOT compiles them just before the loop, which costs a few seconds.
Q: How do you make RDataFrame use all cores?
A: Call ROOT.EnableImplicitMT() before creating the data frame.
Q: What is a cut flow, and how do you get one from RDataFrame?
A: A table of how many events pass each selection step. Label the filters and call Report().Print().
Q: How do you get a column out of RDataFrame as a NumPy array?
A: df.AsNumpy(["column"]) returns a dictionary of arrays.

=== x3 | exam | 14 | Checkpoint 3: fast C++ from memory | 100,11
This checkpoint covers weeks 11 to 14: move semantics, memory layout, modern C++, profiling, vectorisation, threads and OpenMP. There are fifteen tasks.

Four are complete programs. You write each from an empty file on your own machine, compile it, run it and paste what it prints. Plan about fifteen minutes for each. The other eleven are questions with one answer, and you get one attempt at each.

Before you start the clock: open a terminal in an empty folder and an editor with AI autocompletion switched off. Check that `g++ --version` works and that a file with `#include <omp.h>` compiles with `-fopenmp`. Then close everything else. No notes, no search, no AI.

--- practice
@local
Write `buffer.cpp`. The class `Buffer` owns an array of doubles made with `new double[n]()` and has a member function `size()`. Give it all five special functions: destructor, copy constructor, copy assignment, move constructor and move assignment. A moved-from buffer has size 0. Use this `main`, compile with `g++ -std=c++17 -Wall -Wextra -g -fsanitize=address,undefined buffer.cpp -o buffer`, and paste the output. The sanitizers must stay silent.
```
int main() {
    Buffer a(5);
    Buffer b = a;
    Buffer c = std::move(a);
    b = c;
    Buffer d(2);
    d = std::move(b);
    std::cout << a.size() << ' ' << b.size() << ' ' << c.size() << ' ' << d.size() << '\n';
}
```
min: 1
= 0 0 5 5
```solution
#include <algorithm>
#include <cstddef>
#include <iostream>
#include <utility>

class Buffer {
public:
    explicit Buffer(std::size_t n) : n_(n), data_(new double[n]()) {}
    ~Buffer() { delete[] data_; }

    Buffer(const Buffer& other) : n_(other.n_), data_(new double[other.n_]) {
        std::copy(other.data_, other.data_ + n_, data_);
    }
    Buffer& operator=(const Buffer& other) {
        if (this == &other) return *this;
        double* fresh = new double[other.n_];
        std::copy(other.data_, other.data_ + other.n_, fresh);
        delete[] data_;
        data_ = fresh;
        n_ = other.n_;
        return *this;
    }

    Buffer(Buffer&& other) noexcept : n_(other.n_), data_(other.data_) {
        other.n_ = 0;
        other.data_ = nullptr;
    }
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data_;
            data_ = other.data_;
            n_ = other.n_;
            other.data_ = nullptr;
            other.n_ = 0;
        }
        return *this;
    }

    std::size_t size() const { return n_; }

private:
    std::size_t n_;
    double* data_;
};
```
! `a` and `b` were moved from, so both report 0. `c` took the five elements of `a`, and `d` took the copy that `b` had made of `c`. Any double delete or leak would have made the sanitizers speak.

@predict
`Hit` prints `copy ` in its copy constructor and `move ` in its move constructor, which is marked `noexcept`. Its default constructor prints nothing. What does this print?
```
std::vector<Hit> v;
v.reserve(4);
Hit h;
v.push_back(h);
v.push_back(std::move(h));
v.emplace_back();
v.push_back(Hit{});
std::cout << "end\n";
```
= copy move move end
! `push_back(h)` copies a named object. With `std::move` it moves. `emplace_back()` builds the element in place, so nothing is printed. `Hit{}` is a temporary, which is moved in. The `reserve` prevents any reallocation.

@predict
On 64-bit Linux, what are the two sizes? Type two numbers.
```
struct S { char a; double b; char c; };
struct R { double b; char a; char c; };
std::cout << sizeof(S) << ' ' << sizeof(R) << '\n';
```
= 24 16
=| 24, 16
! In `S` each char is followed by seven bytes of padding. In `R` the two chars share the eight bytes after the double.

@choice
Summing ten million integers takes several times longer in a `std::list` than in a `std::vector`. What is the main reason?
- The list has a worse complexity
* The list's elements are scattered heap blocks reached through pointers, so most steps miss the cache
- The list is not optimised at `-O2`
- The vector uses several threads
! Both are linear. A vector's elements share cache lines and can be prefetched.

@local
Write `fields.cpp`. It takes a file name on the command line. Each line of the file holds fields separated by commas. For every line, the program adds up the fields that are numbers and counts the fields that are not, and prints `sum S bad B`. Split the line with `std::string_view` and parse with `std::from_chars`, without creating a `std::string` per field. If the file can't be opened, print a message to `std::cerr` and return 1. Compile with `-std=c++20`, run these commands and paste the output.
```
printf '1.5,2.5,x,4\n10,,0.25\n7\n' > rows.txt
./fields rows.txt
./fields nothere.txt; echo "exit $?"
```
min: 4
= sum 8 bad 1
= sum 10.25 bad 1
= sum 7 bad 0
= exit 1
```solution
#include <charconv>
#include <fstream>
#include <iostream>
#include <string>
#include <string_view>

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "usage: fields FILE\n";
        return 1;
    }
    std::ifstream in(argv[1]);
    if (!in) {
        std::cerr << "cannot open " << argv[1] << '\n';
        return 1;
    }
    std::string text;
    while (std::getline(in, text)) {
        std::string_view line = text;
        double sum = 0.0;
        int bad = 0;
        while (true) {
            const std::size_t end = line.find(',');
            const std::string_view field = line.substr(0, end);
            double value = 0.0;
            const auto [ptr, ec] = std::from_chars(field.data(), field.data() + field.size(), value);
            if (ec == std::errc{} && ptr == field.data() + field.size()) sum += value;
            else ++bad;
            if (end == std::string_view::npos) break;
            line.remove_prefix(end + 1);
        }
        std::cout << "sum " << sum << " bad " << bad << '\n';
    }
    return 0;
}
```
! The empty field between the two commas of the second line is not a number, so it counts as bad.

@choice
What does the report line `missed: not vectorized: control flow in loop` usually mean for a loop that only calls `std::sqrt`?
- The loop has too many iterations
* `sqrt` must set `errno` for negative input, which needs a hidden branch. `-fno-math-errno` removes it
- The array is not aligned
- `-march=native` is missing
! Without `-march=native` the loop would still vectorise, with narrower registers.

@predict
An event is stored as eight floats. How many megabytes are five million events? Use 1 MB = 1,000,000 bytes.
= 160
=| 160 MB
=| 160MB
! 8 × 4 = 32 bytes per event, times 5,000,000.

@local
Write `sevens.cpp`. Four threads made with `std::thread` count the multiples of 7 among the whole numbers from 0 to 99,999,999, each in its own quarter of the range. Use no mutex and no atomic. The program prints `multiples` followed by the total. Compile with `g++ -std=c++17 -O2 -pthread sevens.cpp -o sevens` and paste the output.
min: 1
= multiples 14285715
```solution
#include <iostream>
#include <numeric>
#include <thread>
#include <vector>

int main() {
    const long n = 100'000'000;
    const unsigned threads = 4;
    std::vector<long> partial(threads, 0);
    std::vector<std::thread> pool;
    for (unsigned t = 0; t < threads; ++t) {
        pool.emplace_back([&partial, t, n, threads] {
            const long begin = n * t / threads;
            const long end = n * (t + 1) / threads;
            long local = 0;
            for (long i = begin; i < end; ++i) {
                if (i % 7 == 0) ++local;
            }
            partial[t] = local;
        });
    }
    for (std::thread& th : pool) th.join();
    std::cout << "multiples " << std::accumulate(partial.begin(), partial.end(), 0L) << '\n';
}
```
! Each thread counts in a local variable and writes one result into its own slot. Zero counts as a multiple of 7, which is where the final 5 comes from.

@choice
Which situation is a data race?
- Four threads read the same `const std::vector<double>`
- Four threads each fill their own histogram
* Four threads call `fill` on the same histogram with no lock
- Four threads add to the same `std::atomic<long>`
! A shared object, writers, and nothing that coordinates them. Reading together is safe, private data is safe, and an atomic coordinates by itself.

@predict
80% of a program's run time can be spread over cores, and 20% can't. What is its speed-up on 4 cores, by Amdahl's law? Give one decimal.
= 2.5
! 1 / (0.2 + 0.8 / 4) = 1 / 0.4.

@local
Write `squares.cpp`. For every whole number `i` from 0 to 9,999,999 it computes `(i * i) % 7` and counts how often each of the seven possible results occurs, in an array `long counts[7]`. Parallelise the loop with OpenMP so that there is no data race, and print the seven counts on one line. Compile with `g++ -std=c++17 -O2 -fopenmp squares.cpp -o squares` and paste the output.
min: 1
= 1428572 2857143 2857142 0 2857143 0 0
```solution
#include <iostream>
#include <omp.h>

int main() {
    const long n = 10'000'000;
    long counts[7] = {};
    #pragma omp parallel for reduction(+:counts[:7])
    for (long i = 0; i < n; ++i) {
        counts[(i * i) % 7] += 1;
    }
    for (long c : counts) std::cout << c << ' ';
    std::cout << '\n';
}
```
! The array reduction gives each thread its own seven counters. Squares only ever leave the remainders 0, 1, 2 and 4 when divided by 7, which is why three counts are zero.

@choice
Four threads each increment their own `std::atomic<long>` in a small array, and the program is ten times slower than expected. What is the cause and the cure?
- A data race. Add a mutex
* False sharing: the counters lie on one cache line. Pad them with `alignas(64)` or count in local variables
- Too many threads. Use two
- Atomics are slow. Use `volatile`
! The variables are different, but the cache line is shared, and every write takes it away from the other cores.

@predict
A job takes 20 s on one thread and 4 s on eight. Type the speed-up and the efficiency in percent.
= 5 62.5
=| 5, 62.5
=| 5 62.5%
=| 5, 62.5%
=| 5 and 62.5%
! 20 / 4 = 5, and 5 / 8 = 0.625.

@choice
Four threads fill histograms from 20 million events. Which design is correct and scales best?
- One shared histogram, no protection
- One shared histogram, a mutex around every `fill`
* One histogram per thread, added together after the threads have joined
- One shared histogram of `volatile long`
! Private data needs no locking, and the merge happens once per thread.

@choice
In ROOT's RDataFrame, when does the event loop run?
- When `Filter` is called
- When `Histo1D` is called
* When the first result is requested, for example with `GetValue()`. It then fills everything booked so far
- When the script ends
! Filters, definitions and actions are only booked. This is lazy evaluation.

=== dl1 | ml | 15 | A neural network from the inside: forward pass, loss and backpropagation | p37,p38,p39
## Why build one by hand

In the sprint you trained boosted trees with one call to scikit-learn. For the next three weeks the subject is neural networks, which are behind most new machine learning at CERN: tagging jets, finding tracks, simulating calorimeters, choosing events in the trigger. Frameworks such as PyTorch hide the mechanics. This lesson shows them first, in about forty lines of NumPy, so that the framework is never a black box to you.

## One neuron

A **neuron** takes several numbers in and gives one number out:

```
z = w1*x1 + w2*x2 + ... + b
out = max(z, 0)
```

The `w` are the **weights**, one per input, and `b` is the **bias**. They are the numbers the network learns. The second line is the **activation function**. This one, which replaces negative values by zero, is called **ReLU** and is the standard choice.

Without an activation, a neuron is a straight-line function of its inputs, and any stack of straight-line functions is still a straight-line function. The activation is what lets a network bend, and so represent curved boundaries between classes.

## A layer is a matrix

A **layer** is a row of neurons that all see the same inputs. With 2 inputs and 16 neurons there are 16 × 2 weights and 16 biases. Store the weights as a matrix `W1` with one column per neuron, and the whole layer becomes one line of NumPy for a whole batch of events at once:

```
z1 = X @ W1 + b1          # X: (N, 2)   W1: (2, 16)   z1: (N, 16)
h  = np.maximum(z1, 0)    # ReLU
```

`@` is matrix multiplication. Each row of `X` is one event, and each row of `z1` holds that event's 16 neuron values. Adding `b1`, which has 16 elements, adds it to every row. A second layer takes `h` as its input:

```
z2 = h @ W2 + b2          # W2: (16, 2)   z2: (N, 2), one column per class
```

The values in the last layer are called **logits**: one raw score per class, of any size and sign. A layer between input and output is a **hidden layer**. This network has one.

## From scores to probabilities: softmax

To turn the logits of one event into probabilities, exponentiate them and divide by the sum:

```
p_k = exp(z_k) / (exp(z_1) + exp(z_2) + ...)
```

This is the **softmax**. The results are positive and add up to 1, and the largest logit gets the largest probability. Logits of 2, 1 and 0 become 0.665, 0.245 and 0.090. In code, subtract the largest logit first. The result is the same and `exp` can't overflow:

```
e = np.exp(z2 - z2.max(axis=1, keepdims=True))
p = e / e.sum(axis=1, keepdims=True)
```

`axis=1` works along each row, and `keepdims=True` keeps the result as a column so that it lines up with the rows.

## The loss

Training needs one number that says how wrong the network is. For classification it is the **cross-entropy**: for each event, take the probability the network gave to the correct class, and average minus its logarithm.

```
loss = -np.log(p[np.arange(N), y]).mean()
```

`p[np.arange(N), y]` picks from row 0 the column `y[0]`, from row 1 the column `y[1]`, and so on. If the network gives the right class a probability of 1, the loss is 0. At 0.5 it is 0.69. As the probability approaches 0 the loss grows without limit, so being confident and wrong is punished hard.

## Gradient descent

The loss is a function of all the weights. Its **gradient** says, for each weight, how much the loss changes when that weight is nudged up. To reduce the loss, move every weight a small step against its gradient:

```
W -= lr * dW
```

`lr` is the **learning rate**, the size of the step. Too small and training crawls. Too large and the loss jumps around or explodes. Repeat a few thousand times: that is training.

## Backpropagation

What remains is computing the gradients, and the method is the chain rule, applied layer by layer from the loss back to the input. It is called **backpropagation**. For this network the result is five lines of code, each the mirror image of a line of the forward pass:

```
# how the loss changes with each logit
dz2 = p.copy(); dz2[np.arange(N), y] -= 1; dz2 /= N
dW2 = h.T @ dz2;   db2 = dz2.sum(axis=0)
dh  = dz2 @ W2.T
# ReLU: pass the gradient on where the neuron was switched on
dz1 = dh * (z1 > 0)
dW1 = X.T @ dz1;   db1 = dz1.sum(axis=0)
```

The first line is a small miracle of the softmax and cross-entropy pair: the gradient with respect to the logits is the predicted probabilities minus 1 at the correct class. If the network says 0.7 for the right class, the gradient there is −0.3, and the push is proportional to the error.

After that, every layer does the same three things. A layer computed `out = in @ W + b`. Given the gradient of the loss with respect to `out`:

- the gradient for the weights is `in.T @ d_out`,
- the gradient for the bias is the sum of `d_out` over the events,
- the gradient passed on to the layer before is `d_out @ W.T`.

`.T` is the transpose. The ReLU in between lets the gradient through where its input was positive and blocks it elsewhere, because that is exactly where a small change of the input changes the output.

## Checking a gradient

How do you know a gradient formula is right? Use the definition. Nudge one weight up by a tiny amount, then down, and see how the loss moves:

```
numeric = (loss(w + eps) - loss(w - eps)) / (2 * eps)
```

For a correct formula, the two agree to many digits. In the reference solution the largest difference over all weights was 1.3e-10. This **gradient check** is the unit test of machine learning code, and you will write one this week.

## The whole thing

On a toy problem with two classes shaped like interleaved half circles, which no straight line can separate, the network in the exercise below goes from a loss of 0.60 and 67% accuracy to a loss of 0.007 and 99.8% accuracy in 2,000 steps.

That is all a neural network is: matrix products with a bend in between, one number that measures the error, and the chain rule to work out which way to move. PyTorch computes the backward pass for you. It doesn't change what is computed.
--- practice
@run
Write `relu(xs)` and `dense(x, W, b)`. `relu` replaces every negative number in a list by 0. `dense` computes one layer for one event: `x` is the list of inputs, `W` is a list with one list of weights per neuron, and `b` holds one bias per neuron. It returns one value per neuron, without activation.
```starter
def relu(xs):
    pass

def dense(x, W, b):
    # for each neuron: the sum of weight times input, plus the bias
    pass
```
```test
print([float(v) for v in relu([-1.5, 0.0, 2.0])])
z = dense([1.0, 2.0], [[0.5, -1.0], [2.0, 0.25]], [0.1, -0.5])
print([round(float(v), 4) for v in z])
print([round(float(v), 4) for v in relu(z)])
```
= [0.0, 0.0, 2.0]
= [-1.4, 2.0]
= [0.0, 2.0]
```solution
def relu(xs):
    return [x if x > 0 else 0.0 for x in xs]

def dense(x, W, b):
    return [sum(w * xi for w, xi in zip(row, x)) + bias for row, bias in zip(W, b)]
```
! The first neuron computes 0.5 × 1 − 1 × 2 + 0.1 = −1.4, and ReLU switches it off. The second computes 2 × 1 + 0.25 × 2 − 0.5 = 2.0 and passes it on.

@run
Write `softmax(z)` for a list of logits. Subtract the largest logit before exponentiating, so that large inputs don't overflow.
```starter
import math

def softmax(z):
    pass
```
```test
p = softmax([2.0, 1.0, 0.0])
print([round(v, 4) for v in p], round(sum(p), 6))
print([round(v, 4) for v in softmax([1000.0, 1000.0])])
```
= [0.6652, 0.2447, 0.09] 1.0
= [0.5, 0.5]
```solution
import math

def softmax(z):
    m = max(z)
    e = [math.exp(v - m) for v in z]
    s = sum(e)
    return [v / s for v in e]
```
! Without the subtraction, `math.exp(1000.0)` raises an overflow error. Shifting all logits by the same amount doesn't change the probabilities, because the shift cancels in the ratio.

@predict
A network gives the correct class a probability of 0.5. What is the cross-entropy loss for that event? Three decimals.
= 0.693
=| 0.69
=| .693
! −ln(0.5) = 0.693. With five classes and a network that knows nothing, each class gets 0.2 and the loss is −ln(0.2) = 1.609. That is the value to expect at the very start of training a five-class tagger.

@run
One neuron without activation predicts `pred = w·x + b`, and its error on one example is the squared difference `(pred − y)²`. Write `grad_step(w, b, x, y, lr)`: it returns the new weights and the new bias after one step of gradient descent. The gradient of the error with respect to weight `i` is `2 (pred − y) x[i]`, and with respect to the bias it is `2 (pred − y)`.
```starter
def grad_step(w, b, x, y, lr):
    pred = sum(wi * xi for wi, xi in zip(w, x)) + b
    # err, then new weights and new bias
    pass
```
```test
w, b = grad_step([0.0, 0.0], 0.0, [1.0, 2.0], 5.0, 0.1)
print([round(v, 4) for v in w], round(b, 4))
for _ in range(50):
    w, b = grad_step(w, b, [1.0, 2.0], 5.0, 0.1)
print(round(sum(wi * xi for wi, xi in zip(w, [1.0, 2.0])) + b, 4))
```
= [1.0, 2.0] 1.0
= 5.0
```solution
def grad_step(w, b, x, y, lr):
    pred = sum(wi * xi for wi, xi in zip(w, x)) + b
    err = pred - y
    new_w = [wi - lr * 2 * err * xi for wi, xi in zip(w, x)]
    new_b = b - lr * 2 * err
    return new_w, new_b
```
! The first prediction is 0, so the error is −5 and every parameter moves up, the weight of the larger input most. After fifty more steps the neuron predicts 5.0 for this example.

@local
Save this as `nn_numpy.py`, run it and paste the output. It is the complete network of the lesson.
```
import numpy as np

rng = np.random.default_rng(0)

# two classes shaped like interleaved half circles
n = 500
t = rng.uniform(0, np.pi, n)
upper = np.column_stack([np.cos(t), np.sin(t)])                # class 0
lower = np.column_stack([1 - np.cos(t), 0.5 - np.sin(t)])      # class 1
X = np.vstack([upper, lower]) + rng.normal(0, 0.1, (2 * n, 2))
y = np.array([0] * n + [1] * n)

# 2 inputs -> 16 hidden neurons -> 2 classes
W1 = rng.normal(0, 0.5, (2, 16)); b1 = np.zeros(16)
W2 = rng.normal(0, 0.5, (16, 2)); b2 = np.zeros(2)

def forward(X):
    z1 = X @ W1 + b1
    h = np.maximum(z1, 0)
    z2 = h @ W2 + b2
    e = np.exp(z2 - z2.max(axis=1, keepdims=True))
    return z1, h, e / e.sum(axis=1, keepdims=True)

lr = 0.5
for step in range(2001):
    z1, h, p = forward(X)
    N = len(y)
    loss = -np.log(p[np.arange(N), y]).mean()

    dz2 = p.copy(); dz2[np.arange(N), y] -= 1; dz2 /= N
    dW2 = h.T @ dz2;  db2 = dz2.sum(axis=0)
    dh = dz2 @ W2.T
    dz1 = dh * (z1 > 0)
    dW1 = X.T @ dz1;  db1 = dz1.sum(axis=0)

    W1 -= lr * dW1; b1 -= lr * db1
    W2 -= lr * dW2; b2 -= lr * db2

    if step % 400 == 0:
        acc = (p.argmax(axis=1) == y).mean()
        print(f"step {step:4d}  loss {loss:.4f}  accuracy {acc:.3f}")

acc = (forward(X)[2].argmax(axis=1) == y).mean()
print("final accuracy", round(float(acc), 3), " good", bool(acc > 0.95))
```
min: 7
= good True
! The loss falls from about 0.6 to below 0.01. `np.column_stack` puts 1-D arrays side by side as columns, `np.vstack` stacks arrays on top of each other, and `p.argmax(axis=1)` is the class with the highest probability in each row. Then experiment. With `lr = 0.005` the network crawls and reaches only 0.89 in 2,000 steps. With `lr = 50` the loss jumps above 5 and the accuracy falls to 0.5, which is guessing. Without the ReLU (use `h = z1` and `dz1 = dh`) the accuracy stops at 0.893.

@choice
You remove the ReLU from the network, so that `h = z1`. The accuracy on the half-circle data stops at 89% however long you train. Why?
- The learning rate is now wrong
- Without ReLU the gradients are zero
* Two matrix products in a row are one matrix product, so the network can only draw a straight boundary
- The softmax needs positive inputs
! `(X @ W1) @ W2` equals `X @ (W1 @ W2)`. However many layers you stack, a network without activations is a straight-line model.

@choice
You have written the backward pass for a new kind of layer. How do you test it?
- Train the network and see whether the loss goes down
- Compare the gradient with the weights
* Compare it with a numerical gradient: nudge one weight by a tiny amount up and down, and divide the change of the loss by the size of the nudge
- Run it twice and check that the results agree
! A falling loss proves little. Networks train, badly, even with slightly wrong gradients. The numerical check tests the formula against the definition.
--- recall
Q: What does one layer of a neural network compute?
A: A matrix product of its inputs with its weights, plus a bias, followed by an activation function such as ReLU: h = max(X @ W + b, 0).
Q: Why does a network need activation functions?
A: Without them, any stack of layers collapses into one straight-line function. The activation lets the network represent curved boundaries.
Q: What does softmax do?
A: It turns a row of logits into probabilities: exponentiate each and divide by the sum. They are positive and add up to 1.
Q: What is the cross-entropy loss for one event?
A: Minus the logarithm of the probability that the network gave to the correct class.
Q: What is the update rule of gradient descent?
A: Each weight moves against its gradient: W -= lr * dW, where lr is the learning rate.
Q: How do you check a gradient formula?
A: Against the numerical gradient: (loss(w + eps) − loss(w − eps)) / (2 eps) for single weights.

=== dl2 | ml | 15 | PyTorch: tensors, autograd and the training loop | p40
## What PyTorch adds

PyTorch is the framework most of particle physics uses for deep learning. Next to your NumPy network it adds three things: it computes every gradient for you, it runs the same code on a GPU, and it supplies the standard building blocks. Install it into your virtual environment with `pip install torch --index-url https://download.pytorch.org/whl/cpu`. The extra argument selects the build without GPU support, which is a download of about 200 MB. On Linux the plain `pip install torch` fetches the GPU build, which is several gigabytes that you don't need for this phase.

## Tensors

A **tensor** is PyTorch's array. It behaves like a NumPy array:

```
import torch

a = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
a.shape            # torch.Size([2, 2])
a @ a              # matrix product
a.sum(dim=0)       # tensor([4., 6.]): dim plays the role of NumPy's axis
```

Two differences matter. The default floating-point type is 32-bit `float32`, not NumPy's 64-bit, because that is what GPUs are fast at. And class labels must be 64-bit integers, `torch.long`. Convert with `torch.tensor(array, dtype=torch.float32)` and back with `tensor.numpy()`. A tensor with one element becomes a Python number with `.item()`.

## Autograd

Mark a tensor with `requires_grad=True`, and PyTorch records every operation done with it. Calling `.backward()` on a result then walks back through that record and applies the chain rule:

```
x = torch.tensor(2.0, requires_grad=True)
y = x ** 3 + 2 * x
y.backward()
print(y.item(), x.grad.item())      # 12.0 14.0
```

The derivative of x³ + 2x is 3x² + 2, which is 14 at x = 2. This is **automatic differentiation**, or autograd, and it is the same backpropagation that you wrote by hand. The gradient lands in the `.grad` attribute of each tensor that asked for one.

One trap: gradients **add up**. Calling `backward()` twice without clearing gives the sum of both. That is why every training loop starts by setting them to zero.

## A model

`torch.nn` has the building blocks. `nn.Linear(2, 16)` is a layer with 2 inputs and 16 neurons, with its weights and bias already created, randomly initialised and marked as requiring gradients. `nn.Sequential` chains layers:

```
from torch import nn

model = nn.Sequential(
    nn.Linear(2, 16),
    nn.ReLU(),
    nn.Linear(16, 2),
)
```

This is your NumPy network. It has 82 parameters: 2 × 16 weights and 16 biases, then 16 × 2 weights and 2 biases. `model(X)` runs the forward pass and returns the logits. There is no softmax in the model, for the reason given below.

`model.parameters()` yields all weights and biases. PyTorch stores the weight of `nn.Linear(2, 16)` with shape (16, 2), outputs first, the transpose of what you used in NumPy.

## Loss and optimiser

```
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.5)
```

`nn.CrossEntropyLoss` takes the **logits** and the integer labels. It applies the softmax and the logarithm itself, in a numerically safe way. Putting your own softmax in front of it is a classic mistake: the network still trains, only worse.

The **optimiser** holds the parameters and updates them. `SGD` is plain gradient descent, `W -= lr * W.grad`. The name stands for stochastic gradient descent, and the next lesson explains the word stochastic. The other optimiser you will use is `Adam`, which adapts the step size for each weight and is the usual default.

## The training loop

Every PyTorch program has these five lines at its heart, in this order:

```
for step in range(2001):
    optimizer.zero_grad()            # 1. forget the old gradients
    logits = model(X_t)              # 2. forward pass
    loss = loss_fn(logits, y_t)      # 3. how wrong?
    loss.backward()                  # 4. backward pass: all gradients
    optimizer.step()                 # 5. move the weights
```

Learn them by heart. On the half-circle data this loop reaches the same 99.8% accuracy as your NumPy code, because it does the same arithmetic.

## Evaluating

When you only want predictions, tell PyTorch not to record operations. It saves time and memory:

```
model.eval()
with torch.no_grad():
    pred = model(X_t).argmax(dim=1)
accuracy = (pred == y_t).float().mean().item()
```

`model.eval()` switches layers such as dropout, which you meet in the next lesson, to their evaluation behaviour, and `model.train()` switches back. `argmax(dim=1)` gives the class with the largest logit in each row. Taking the softmax first would not change which one is largest.

## Saving and loading

```
torch.save(model.state_dict(), "model.pt")

# build the same architecture first, then fill in the numbers
model = nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 2))
model.load_state_dict(torch.load("model.pt"))
```

The **state dict** is a dictionary from parameter names, such as `0.weight`, to tensors. It holds the numbers and not the architecture, so the loading code must first create a model of the same shape.

## GPUs, in one line each

```
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
X_t = X_t.to(device)
```

A model and its data must be on the same device. Everything else stays as it is. For the small networks of this phase a CPU is enough.
--- practice
@predict
What does this print?
```
x = torch.tensor(3.0, requires_grad=True)
y = x ** 2 + 4 * x
y.backward()
print(y.item(), x.grad.item())
```
= 21.0 10.0
=| 21 10
=| 21.0, 10.0
! y = 9 + 12 = 21. The derivative 2x + 4 is 10 at x = 3.

@predict
How many parameters does `nn.Sequential(nn.Linear(16, 64), nn.ReLU(), nn.Linear(64, 5))` have?
= 1413
=| 1,413
! 16 × 64 weights + 64 biases = 1,088, plus 64 × 5 weights + 5 biases = 325. The ReLU has none.

@choice
Put the five lines of the training loop in the right order.
- forward, loss, zero_grad, step, backward
- zero_grad, forward, step, loss, backward
* zero_grad, forward, loss, backward, step
- forward, backward, loss, step, zero_grad
! Clear the gradients, compute the output, measure the error, compute the gradients, update. `backward` needs the loss, and `step` needs the gradients.

@choice
A model ends with `nn.Softmax(dim=1)` and is trained with `nn.CrossEntropyLoss`. What is wrong?
- Nothing
- The model will not compile
* `CrossEntropyLoss` applies the softmax itself, so it is applied twice. The network still learns, but more slowly and to a worse result
- The loss will be negative
! Feed logits to `CrossEntropyLoss`. Apply a softmax only at the very end, when you need probabilities to show or to export.

@local
Write `nn_torch.py`: the same data as in `nn_numpy.py`, converted to tensors, the model `nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 2))`, `nn.CrossEntropyLoss`, `torch.optim.SGD` with `lr=0.5`, and 2001 steps of the five-line loop on the whole data set. Call `torch.manual_seed(0)` before creating the model. Every 400 steps print the step, the loss and the accuracy. At the end print the final accuracy and the number of parameters, in the form `final accuracy 0.99 parameters 82`. Paste the output.
min: 7
= parameters 82
```solution
import numpy as np
import torch
from torch import nn

rng = np.random.default_rng(0)
n = 500
t = rng.uniform(0, np.pi, n)
upper = np.column_stack([np.cos(t), np.sin(t)])
lower = np.column_stack([1 - np.cos(t), 0.5 - np.sin(t)])
X = np.vstack([upper, lower]) + rng.normal(0, 0.1, (2 * n, 2))
y = np.array([0] * n + [1] * n)

torch.manual_seed(0)
X_t = torch.tensor(X, dtype=torch.float32)
y_t = torch.tensor(y, dtype=torch.long)

model = nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 2))
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.5)

for step in range(2001):
    optimizer.zero_grad()
    logits = model(X_t)
    loss = loss_fn(logits, y_t)
    loss.backward()
    optimizer.step()
    if step % 400 == 0:
        acc = (logits.argmax(dim=1) == y_t).float().mean().item()
        print(f"step {step:4d}  loss {loss.item():.4f}  accuracy {acc:.3f}")

model.eval()
with torch.no_grad():
    acc = (model(X_t).argmax(dim=1) == y_t).float().mean().item()
n_parameters = sum(p.numel() for p in model.parameters())
print("final accuracy", round(acc, 3), "parameters", n_parameters)
```
! `p.numel()` is the number of elements of a tensor. The accuracy should end above 0.99, as with NumPy. The first loss differs from your NumPy run because PyTorch initialises the weights differently.

@choice
You call `loss.backward()` in a loop but forget `optimizer.zero_grad()`. What happens?
- PyTorch raises an error
- Nothing, gradients are overwritten
* The gradients of all steps add up, so each update uses the sum of all past gradients and training goes wrong
- The weights stop changing
! `backward()` adds to `.grad`. It is deliberate, because some techniques use the accumulation, and it is the most common bug in a first training loop.

@write
From memory: the lines that compute the accuracy of `model` on the tensors `X_test` and `y_test`, without recording gradients.
min: 4
```solution
model.eval()
with torch.no_grad():
    pred = model(X_test).argmax(dim=1)
accuracy = (pred == y_test).float().mean().item()
```
! `eval()` for layers that behave differently in training, `no_grad()` to skip the bookkeeping, `argmax` over the classes, then the mean of right and wrong as 1 and 0.
--- recall
Q: Write the five lines of the PyTorch training loop.
A: optimizer.zero_grad(); logits = model(X); loss = loss_fn(logits, y); loss.backward(); optimizer.step().
Q: What does requires_grad=True do, and where does the gradient end up?
A: PyTorch records the operations on that tensor. After result.backward(), the gradient is in the tensor's .grad attribute.
Q: What does nn.CrossEntropyLoss expect as its inputs?
A: The logits, without softmax, and the class labels as 64-bit integers.
Q: Why must you call optimizer.zero_grad() in every step?
A: backward() adds to the stored gradients. Without clearing, the gradients of all earlier steps pile up.
Q: How do you evaluate a model without recording gradients?
A: model.eval(), then with torch.no_grad(): compute model(X).
Q: What does a state dict contain?
A: The model's parameter tensors by name. It holds no architecture, so you build the same model first and then call load_state_dict.

=== dl3 | ml | 16 | Training properly: batches, validation, early stopping and regularisation | p41,p44,p45
## From a toy to a real training

The toy network saw all 1,000 points at every step and was judged on the data it trained on. Neither survives contact with a real problem. This lesson adds what every serious training has: mini-batches, a split into three data sets, normalised inputs, a stopping rule and a defence against overfitting. The running example is the data of your next project, 830,000 simulated jets with 16 features each.

## Mini-batches and epochs

Computing the gradient on all 664,000 training jets for one small step is wasteful. Use a random handful instead: a **mini-batch**, here 1,024 jets. The gradient from a batch is a noisy estimate of the true one, and it is good enough, at a tiny fraction of the cost. This is the "stochastic" in stochastic gradient descent.

One pass through the whole training set, in batches, is an **epoch**. With 664,000 jets and batches of 1,024 that is 649 steps.

PyTorch's `DataLoader` does the shuffling and batching:

```
from torch.utils.data import DataLoader, TensorDataset

loader = DataLoader(TensorDataset(X_train, y_train), batch_size=1024, shuffle=True)

for epoch in range(1, 41):
    model.train()
    for xb, yb in loader:
        optimizer.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        optimizer.step()
```

`TensorDataset` pairs each row of features with its label. The loader reshuffles at the start of every epoch, so the batches are never the same twice.

## Three data sets

You know from the sprint that a model must be tested on data it has not seen. With neural networks you make decisions during training: when to stop, how many layers, which learning rate. Each decision that is based on a data set leaks a little information from it. So there are three sets:

- **training** (here 80%): the gradients come from it
- **validation** (10%): watched during training to make decisions
- **test** (10%): used once, at the end, for the number you report

Shuffle once with a fixed seed before you split, so that the split is the same on every run.

## Normalising the inputs

The 16 features have wildly different sizes. The jet mass runs up to several hundred GeV, and other features stay below 0.1. A network sees only numbers. A feature a thousand times larger produces gradients a thousand times larger, and training crawls or diverges. The cure is to **standardise**: subtract each feature's mean and divide by its standard deviation, so that every feature has mean 0 and spread 1.

```
mean = X[train].mean(axis=0)
std = X[train].std(axis=0)
X_train = (X[train] - mean) / std
X_val = (X[val] - mean) / std          # the same numbers, from the training set
```

The mean and the standard deviation come **from the training set only** and are then applied to all three sets. Computing them on everything would let the test data influence the training. Save them with the model. Whoever uses the model later must apply exactly the same numbers.

## Watching two losses

After every epoch, compute the loss on the validation set. In the reference run:

```
epoch  1  train loss 0.8875  val loss 0.7554  val accuracy 0.7360
epoch  5  train loss 0.6696  val loss 0.6673  val accuracy 0.7622
epoch 19  train loss 0.6483  val loss 0.6461  val accuracy 0.7680
epoch 22  train loss 0.6467  val loss 0.6471  val accuracy 0.7678
```

The training loss always keeps falling, because the network can keep fitting details. The validation loss tells the truth. While it falls, the network is learning something general. When it stops falling while the training loss continues, the network has begun to memorise: **overfitting**.

## Early stopping

So stop when the validation loss stops improving. Keep a copy of the weights from the best epoch, and give up after a few epochs without improvement. That number of epochs is called the **patience**:

```
if val_loss < best - 1e-4:
    best, waited = val_loss, 0
    best_state = {k: v.clone() for k, v in model.state_dict().items()}
else:
    waited += 1
    if waited == 3:
        break
...
model.load_state_dict(best_state)
```

`v.clone()` makes a real copy of each tensor. Without it you would store references to weights that keep changing. The reference run stopped after 22 epochs and 97 seconds on four CPU cores, with a test accuracy of 0.766. The training accuracy was 0.767, so this small network on this much data hardly overfits at all.

## Regularisation

When a network does overfit, with a large gap between training and validation, there are standard brakes.

- **More data**, when you can get it. Nothing else works as well.
- **A smaller network.**
- **Weight decay** pulls every weight slightly towards zero at each step, which discourages extreme values: `torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)`.
- **Dropout** sets a random fraction of a layer's outputs to zero during training, so the network can't rely on any single neuron: `nn.Dropout(0.2)` after an activation. This is why `model.train()` and `model.eval()` exist. In evaluation mode dropout does nothing.

## Adam and the learning rate

`torch.optim.Adam(model.parameters(), lr=1e-3)` is the default choice. Adam keeps a running average of each weight's gradient and of its square, and scales each weight's step accordingly, so it copes with features and layers of different sizes. The learning rate still matters more than any other setting. If the loss is not falling, or is NaN, change the learning rate by a factor of ten before you change anything else.

## Reproducibility

Call `torch.manual_seed(0)` before creating the model, seed NumPy's generator for the split, and write down the versions of your libraries. Even then, results can differ in the fourth digit between machines. Report what you ran and what you got, and be suspicious of any improvement smaller than the difference between two seeds.

## A checklist for every training

1. Split into training, validation and test with a fixed seed.
2. Standardise with training statistics, and save them.
3. Start with a small model and Adam at `1e-3`.
4. Print the training and the validation loss after every epoch.
5. Stop early, and keep the best weights.
6. Touch the test set once.
7. Compare with a simple baseline. For the jets, logistic regression reaches 0.69, and always answering with the commonest class gives 0.20.
--- practice
@predict
A training set has 664,000 jets and the batch size is 1,024. How many optimiser steps make one epoch? Count the last, partly filled batch as a step.
= 649
! 664,000 / 1,024 = 648.4, so 648 full batches and one with the remaining 448 jets.

@choice
On which data do you compute the mean and standard deviation used to standardise the features?
- On all the data, before splitting
* On the training set only, and then apply the same numbers to validation and test
- On each of the three sets separately
- On the test set, because that is what counts
! Statistics from all the data let the test set influence the training. Separate statistics per set would give the same jet different inputs depending on which set it is in.

@run
Write `fit_scaler(rows)` and `transform(rows, mean, std)`. `rows` is a list of events, each a list of features. `fit_scaler` returns the mean and the standard deviation of every feature, as two lists. Use the standard deviation that divides by the number of rows. `transform` standardises rows with given means and standard deviations.
```starter
import math

def fit_scaler(rows):
    n = len(rows)
    k = len(rows[0])
    pass

def transform(rows, mean, std):
    pass
```
```test
train = [[1.0, 10.0], [3.0, 30.0], [5.0, 20.0]]
mean, std = fit_scaler(train)
print("mean", " ".join("%.3f" % v for v in mean))
print("std", " ".join("%.3f" % v for v in std))
for row in transform([[3.0, 20.0], [7.0, 0.0]], mean, std):
    print(" ".join("%.3f" % v for v in row))
```
= mean 3.000 20.000
= std 1.633 8.165
= 0.000 0.000
= 2.449 -2.449
```solution
import math

def fit_scaler(rows):
    n = len(rows)
    k = len(rows[0])
    mean = [sum(r[j] for r in rows) / n for j in range(k)]
    std = [math.sqrt(sum((r[j] - mean[j]) ** 2 for r in rows) / n) for j in range(k)]
    return mean, std

def transform(rows, mean, std):
    return [[(r[j] - mean[j]) / std[j] for j in range(len(r))] for r in rows]
```
! The scaler is fitted on the training rows and then applied to new rows. An event at the training mean becomes all zeros, and the second test event lies 2.4 standard deviations out in both features.

@choice
After epoch 12 the training loss is still falling, and the validation loss has been rising for four epochs. What is happening, and what do you do?
- The learning rate is too small. Raise it
* The network is overfitting. Go back to the weights of the epoch with the best validation loss
- The validation set is broken. Use the test set instead
- Nothing. Keep training until the training loss is zero
! The gap between the two losses is the signature of memorising. Early stopping with a saved best state handles it automatically.

@choice
Why keep a test set, when the validation set was never used for gradients?
- The validation set is too small
* You chose when to stop, and perhaps the architecture, by looking at the validation set, so its score is slightly too good. The test set was used for nothing
- PyTorch requires three sets
- The test set is used to compute the normalisation
! Every decision made by looking at a data set fits that data set a little. Only an untouched set gives an honest number.

@predict
A network has 4,389 parameters stored as 32-bit floats. How many bytes do its weights take?
= 17556
=| 17,556
=| 17556 bytes
! 4,389 × 4. That is the jet tagger of the next project: 17.5 kilobytes, small enough to fit into the logic of an FPGA, which is why this architecture was chosen for trigger studies.

@write
From memory: the code for early stopping with a patience of 3, inside a loop over epochs. `val_loss` is this epoch's validation loss, and the best weights must be restored after the loop.
min: 8
```solution
best, waited, best_state = float("inf"), 0, None
for epoch in range(1, 41):
    # ... train one epoch, compute val_loss ...
    if val_loss < best:
        best, waited = val_loss, 0
        best_state = {k: v.clone() for k, v in model.state_dict().items()}
    else:
        waited += 1
        if waited == 3:
            break
model.load_state_dict(best_state)
```
! Three parts: remember the best loss and a copy of its weights, count the epochs without improvement, restore at the end. Without `clone()` the saved state would follow the live weights.
--- recall
Q: What are a mini-batch and an epoch?
A: A mini-batch is a random handful of training examples used for one gradient step. An epoch is one pass through the whole training set.
Q: What are the three data sets of a training, and what is each for?
A: Training for the gradients, validation for decisions during training such as when to stop, and test for the one final number.
Q: How do you standardise features correctly?
A: Subtract the mean and divide by the standard deviation of each feature, both computed on the training set only, and apply the same numbers to all data. Save them with the model.
Q: What is early stopping?
A: Stop when the validation loss has not improved for a set number of epochs, the patience, and restore the weights of the best epoch.
Q: Name two regularisation techniques and what they do.
A: Weight decay pulls weights towards zero. Dropout zeroes random outputs during training so that the network can't rely on single neurons.
Q: The loss is NaN or not falling. What do you change first?
A: The learning rate, by a factor of ten.

=== pj5 | proj | 16 | Project 3, part 2: a jet tagger | p46
## What a jet is, and why it needs tagging

When a quark or a gluon is knocked out of a proton, it can't travel alone. Within a distance smaller than a proton it turns into a spray of dozens of particles flying in roughly the same direction. This spray is a **jet**, and jets are the commonest objects at the LHC.

The detector sees the spray, and physics wants to know what started it. A light quark, a gluon, a W boson, a Z boson and a top quark all produce jets. At high momentum, the decay products of a W, a Z or a top are squeezed so close together that they merge into one fat jet. Deciding which particle a jet came from is **jet tagging**. It is one of the most active uses of machine learning at CERN, and it has to work in two very different places: offline, where accuracy is everything, and in the trigger, where the answer must come within microseconds.

Your project is a tagger for the second case: small enough for a trigger, and compressed further in week 17.

## The data

The data set is `hls4ml_lhc_jets_hlf` on OpenML, a public catalogue of data sets for machine learning. Physicists from CERN, Fermilab and other institutes created it for the [paper that introduced hls4ml](https://arxiv.org/abs/1804.06913), a tool that puts neural networks onto the chips used in the trigger. Week 17 comes back to it. The data set holds 830,000 simulated jets with a transverse momentum around 1 TeV, in five classes of about 166,000 each: gluon `g`, light quark `q`, W boson `w`, Z boson `z` and top quark `t`.

```
from sklearn.datasets import fetch_openml
data = fetch_openml("hls4ml_lhc_jets_hlf", version=1, as_frame=True)
X, y = data["data"], data["target"]
# X is a pandas table with 16 columns, and y holds the class letters
```

The first call downloads about 110 MB, which took 30 seconds in the reference run, and keeps a copy on disk. Convert once to a NumPy file with the features as `float32` and the labels as integers 0 to 4, and let all other scripts read that. The file is about 60 MB.

Each jet is described by 16 numbers computed from its particles, called high-level features, which gives the `hlf` in the name. You don't need the formulas. You do need to know what they measure.

- `mass_mmdt` is the mass of the jet after **grooming**, which removes soft particles at wide angles that don't belong to the original decay. The means in the data set are 31 GeV for quark jets, 63 for gluons, 67 for W, 76 for Z and 138 for top. A W weighs 80 GeV and a top 173. The means are lower because part of the decay sometimes falls outside the jet or is groomed away.
- `multiplicity` is the number of particles in the jet. Gluons radiate more than quarks: 70 particles on average against 41.
- `zlogz` measures how evenly the momentum is shared among the particles.
- The remaining thirteen, with names starting with `c1`, `c2`, `d2`, `m2` and `n2`, are ratios of **energy correlation functions**. They measure whether the energy of the jet sits in one clump, two or three. A quark or gluon jet has one **prong**. A W or Z decays to two quarks and gives two. A top decays to three quarks and gives three.

So the physics is already visible. The top is heavy and three-pronged, which makes it the easiest class. W and Z differ only by 11 GeV in mass, so they are confused with each other. Quarks and gluons are both one-pronged and differ mainly in multiplicity.

## The model

Use the architecture of the paper that introduced this data set (Duarte and others, 2018), so that your numbers can be compared with it:

```
model = nn.Sequential(
    nn.Linear(16, 64), nn.ReLU(),
    nn.Linear(64, 32), nn.ReLU(),
    nn.Linear(32, 32), nn.ReLU(),
    nn.Linear(32, 5),
)
```

It has 4,389 parameters. Train it as the last lesson describes: an 80/10/10 split with a fixed seed, standardised inputs, Adam with a learning rate of 0.001, batches of 1,024, early stopping with a patience of 3.

## What the reference run found

Measured on the 83,000 test jets:

- accuracy 0.766
- AUC, each class against the rest: gluon 0.940, quark 0.907, W 0.955, Z 0.951, top 0.963

The **confusion matrix** gives, for each true class in a row, the percentage of its jets assigned to each predicted class:

```
       g     q     w     z     t
g   76.1  12.5   1.5   1.6   8.2
q   15.3  72.5   3.5   2.3   6.3
w    4.2  15.5  76.3   2.6   1.4
z    4.4  14.2   5.5  74.5   1.4
t    6.5   3.1   4.3   2.6  83.6
```

Read it against the physics. The top row says that 8% of gluon jets are taken for tops: a gluon jet with many particles and a large mass can look like one. Quarks and gluons are mistaken for each other in 12 to 15% of cases. W and Z jets are mistaken for quark jets about 15% of the time, when one of their two prongs is soft or lost and the jet looks one-pronged.

An accuracy of 77% sounds modest. It is an average over all jets, including the hopeless ones. A tagger is used at a working point: when this network's highest probability is above 0.95, which happens for 30% of the jets, it is right 98% of the time.

## What to build

In the repository `jet-tagger` that you started in week 15, add a script for each step:

- `prepare.py` downloads the data and writes `jets.npz`.
- `train.py` splits, standardises, trains with early stopping, and saves the weights together with the mean and standard deviation. It prints both losses after every epoch.
- `evaluate.py` loads the model, and prints the accuracy, the AUC per class and the confusion matrix. It draws the five ROC curves in one figure with a logarithmic vertical axis, as the papers do, and saves it.
- `baseline.py` trains a logistic regression on the same split, for comparison.
- `tests/` holds at least a gradient check of a hand-written layer from week 15, a test that `prepare.py`'s output has the right shapes and types, and a test that a model with random weights has an accuracy near 0.2.
- A README with the results table, the ROC plot, the confusion matrix and three sentences on what the confusions mean physically.

For scikit-learn's AUC, compare one class with the rest: `roc_auc_score(y == i, p[:, i])`, where `p` holds the softmax probabilities and `i` is the class number.

## Rules that make it a result

- The test set is touched once, by `evaluate.py`.
- Every number in the README can be reproduced by running the scripts in order, and the README says so.
- State the seed, the library versions and the training time.
- Don't tune by hand until the test score looks good. If you try several architectures, choose by validation loss and say how many you tried.
--- practice
@choice
Why are W and Z jets confused with each other more than either is with top jets?
- They have different numbers of particles
* Both are two-pronged, and their masses differ by only 11 GeV, less than the resolution of the jet mass. A top is heavier and three-pronged
- The simulation mixes them up
- W and Z are the same particle
! The tagger can only use what the features carry. Two classes that differ in one feature by less than its resolution will overlap.

@predict
A model with random weights is asked to classify jets from five equally common classes. What accuracy do you expect, as a decimal?
= 0.2
=| 0.20
=| .2
=| 20%
! One in five by chance. A test that a freshly created model scores near 0.2 catches a surprising number of bugs, for example labels leaking into the features.

@choice
In the confusion matrix of the lesson, the row for true quark jets reads 15.3, 72.5, 3.5, 2.3 and 6.3. What does the 15.3 mean?
- 15.3% of jets predicted as gluons are quarks
* 15.3% of true quark jets were classified as gluon jets
- The quark AUC is 0.153
- 15.3% of all jets are quarks
! Each row is one true class and adds up to 100%. The entry in the row of the true class and the column of the predicted class is the share of those jets that got that label.

@local
Download the data set, convert it, and paste the output of a script that prints the shape of the feature array, the number of jets in each class, and the mean of `mass_mmdt` for each class.
min: 3
= 830000
= 16
! The class counts are between 161,000 and 168,000. The mean masses should match the lesson: about 31 for q, 63 for g, 67 for w, 76 for z and 138 for t. If yours differ, check the order of your class labels.

@choice
The reference tagger has an accuracy of 0.766 overall, and 0.98 on the jets where its highest probability is above 0.95. What does that tell you?
- The accuracy of 0.766 is wrong
- The tagger overfits
* Its probabilities are informative: demanding confidence selects a smaller, much purer sample, which is how taggers are used in practice
- 0.95 is the best threshold
! An analysis chooses a working point on the ROC curve, trading efficiency against purity. The overall accuracy mixes easy and hopeless jets.

@write
Before you train anything: in your own words, which of the five classes do you expect to be easiest to identify and which pair the hardest to separate, and from which features? Refer to mass, prongs and multiplicity.
min: 60
```solution
The top should be the easiest. Its jet mass is far above the others, on average 138 GeV, and its decay to three quarks gives three prongs, which the energy correlation ratios pick up. The hardest pairs are W against Z and quark against gluon. W and Z both give two prongs and differ only by 11 GeV in mass, which is less than the width of the measured mass peaks. Quark and gluon jets are both one-pronged and light, and differ mainly in the number of particles, about 41 against 70, with wide overlapping distributions. I also expect W and Z jets to leak into the quark class when one prong is lost, because they then look like a single-pronged light jet.
```
! Writing the expectation down first turns the confusion matrix from a table of numbers into a test of your understanding.

@choice
You try eight architectures and report the one with the best test accuracy. What is wrong with that?
- Eight is too few
- Nothing, as long as the seed is fixed
* The test set was used to choose, so the reported number is biased upwards. Choose by validation loss and evaluate the chosen model on the test set once
- The architectures must be chosen at random
! The best of eight on any fixed data set is partly luck. An untouched test set measures that luck away.
--- recall
Q: What is a jet, and what is jet tagging?
A: A jet is the spray of particles that a quark or gluon turns into. Tagging is deciding which particle started it: a light quark, a gluon, a W, a Z or a top.
Q: What do the features mass_mmdt, multiplicity and the energy correlation ratios measure?
A: The groomed mass of the jet, the number of particles in it, and whether its energy sits in one, two or three prongs.
Q: How many prongs do quark or gluon, W or Z, and top jets have?
A: One, two and three.
Q: How do you read a confusion matrix normalised by rows?
A: Each row is a true class. Its entries are the percentages of that class's jets assigned to each predicted class, and they add up to 100.
Q: Which architecture does the reference jet tagger use, and how well does it do?
A: 16 inputs, hidden layers of 64, 32 and 32 neurons with ReLU, and 5 outputs: 4,389 parameters, and an accuracy of about 0.77.
Q: Why report an accuracy at a confidence threshold as well as the overall accuracy?
A: Taggers are used at a working point. Demanding high confidence keeps fewer jets and gets a much purer sample.

=== dl4 | ml | 17 | Small models: fixed-point numbers, quantisation and pruning | p42
## Why anyone wants a worse network

Your tagger has 4,389 parameters and answers in microseconds on a laptop. For the high-level trigger and for analysis that is plenty. The Level-1 trigger is a different world. It decides within a few millionths of a second, forty million times a second, and it is built from **FPGAs**: chips whose logic can be rewired, which you met in the lesson on the trigger.

On an FPGA a network is not a program that runs. It is a circuit. Every multiplication of a weight by an input is a piece of hardware on the chip, and the size of that piece grows with the number of bits of the two numbers. A chip has a fixed amount of logic, so two things decide whether a network fits and how fast it is: **how many weights** it has, and **how many bits** each number takes.

This lesson shrinks both, and measures what it costs. The same techniques are used wherever memory, energy or speed are short: phones, sensors, and large services where every millisecond is multiplied by millions of requests.

## Fixed-point numbers

A `float32` spends its 32 bits on a sign, an exponent and 24 significant binary digits. That covers everything from a billionth to a billion, and it is expensive to build in hardware. A weight of a network doesn't need that range. The largest of the 4,389 parameters of the reference tagger is 1.965 in absolute value.

A **fixed-point** number is an integer with an agreed position of the binary point. The usual notation comes from the tools that program FPGAs:

```
ap_fixed<W, I>
```

`W` is the total number of bits. `I` of them, the sign included, stand before the point. The other `W - I` stand after it. That fixes two things:

- the **step** between neighbouring values, `2 ** -(W - I)`
- the **range**, from `-2 ** (I - 1)` up to `2 ** (I - 1)` minus one step

`**` is Python's power operator. Take `ap_fixed<8, 3>`. Five bits stand after the point, so the step is 1/32 = 0.03125. The range is −4 to 3.96875. There are 256 possible values, and every number is replaced by the nearest of them.

Rounding to such a grid is called **quantisation**. In PyTorch:

```
def quantise(w, bits, int_bits=3):
    step = 2.0 ** -(bits - int_bits)
    lo = -(2.0 ** (int_bits - 1))
    hi = 2.0 ** (int_bits - 1) - step
    return torch.clamp(torch.round(w / step) * step, lo, hi)
```

`w / step` says how many steps the value is from zero, `torch.round` moves it to a whole number of steps, and multiplying by `step` brings it back. `torch.clamp` cuts off whatever lies outside the range. A value that is too large is **saturated** to the largest value the format can hold.

## How few bits does the tagger need?

First look at the weights, because they decide the integer bits. The largest is 1.965, so three integer bits, which reach from −4 to almost 4, are enough. Then round every weight and bias of the trained network and measure the accuracy on the test set, for fewer and fewer bits:

```
bits  step     accuracy
 16   0.00012  0.7663
 12   0.00195  0.7661
 10   0.00781  0.7665
  8   0.03125  0.7640
  7   0.06250  0.7507
  6   0.12500  0.7380
  5   0.25000  0.5266
  4   0.50000  0.2598
  3   1.00000  0.2046
```

Three things to read from the table.

- Down to 10 bits nothing changes. The network never needed the precision of a float.
- At 8 bits, a quarter of the size of a float, the cost is a quarter of a percentage point.
- Below 7 bits it falls off a cliff. At 4 bits the network is guessing.

This is **post-training quantisation**: train normally and round afterwards. It is free, and it works down to a point.

One caveat keeps this honest. The table rounds only the weights and biases. In real firmware the inputs, the sums inside each neuron and the outputs are fixed-point numbers too, and each needs its own choice of bits. The tools named at the end handle that. The principle and the shape of the curve stay the same.

## Training with the rounding switched on

The network above was never told that it would be rounded. The alternative is **quantisation-aware training**: round the weights in the forward pass during training, so that the network learns values that still work after rounding.

There is an obstacle. Rounding is a staircase. Nudge a weight slightly and its rounded value doesn't change, so the gradient through the rounding is zero and nothing can learn. The standard trick is the **straight-through estimator**: use the rounded value on the way forward, and on the way back pretend that the rounding wasn't there.

```
class QLinear(nn.Linear):
    bits = 6
    def forward(self, x):
        w = self.weight + (quantise(self.weight, self.bits) - self.weight).detach()
        b = self.bias + (quantise(self.bias, self.bits) - self.bias).detach()
        return nn.functional.linear(x, w, b)
```

`class QLinear(nn.Linear)` makes a new kind of layer that inherits everything from `nn.Linear` and replaces only its `forward`. The line for `w` is the whole trick. Its value is `weight + rounded - weight`, which is the rounded weight. `.detach()` cuts the bracket out of the gradient calculation, so for the backward pass the line reads `w = self.weight`. The layer keeps full-precision weights, which collect the small updates, and computes with their rounded versions.

Starting from the trained tagger and training for three more epochs this way, in the reference run:

```
bits   rounded only   after 3 epochs with rounding in the loop
  6      0.7380          0.7613
  5      0.5266          0.7496
  4      0.2598          0.7359
  3      0.2046          0.2046
```

At 4 bits each weight has only 16 possible values, and the network still reaches 0.736, three points below the original. At 3 bits nothing helps: with three integer bits the step is 1, so every weight would have to be a whole number.

## Pruning

Quantisation makes each weight cheaper. **Pruning** removes weights. A weight that is exactly zero needs no multiplier at all.

The simplest rule is **magnitude pruning**: set the weights with the smallest absolute values to zero, on the idea that they matter least. Without retraining, that hurts quickly:

```
pruned    weights left   accuracy
   0%        4256         0.7663
  30%        2979         0.7398
  50%        2128         0.6098
  70%        1277         0.4837
  90%         426         0.0715
```

Only the 4,256 weights are pruned, not the 133 biases. The remedy is again to train afterwards, with the pruned weights held at zero. A **mask**, a tensor of ones and zeros with the shape of the weights, records which ones survive, and after every optimiser step the weights are multiplied by it:

```
layers = [m for m in model if isinstance(m, nn.Linear)]
all_weights = torch.cat([m.weight.abs().flatten() for m in layers])
# 70% of the weights are smaller than this value
threshold = all_weights.quantile(0.7).item()
masks = [(m.weight.abs() > threshold).float() for m in layers]

def apply_masks():
    with torch.no_grad():
        for m, mask in zip(layers, masks):
            m.weight.mul_(mask)

# in the training loop, after optimizer.step():
apply_masks()
```

`isinstance(m, nn.Linear)` picks the linear layers out of the model and skips the ReLUs. `flatten()` turns a matrix into one long row, and `torch.cat` joins the rows of all layers. `quantile(0.7)` is the value below which 70% of the numbers lie. `mul_` with the underscore multiplies in place.

After three epochs of retraining under the mask:

```
pruned    weights left   accuracy
  50%        2128         0.7657
  70%        1277         0.7627
  90%         426         0.7457
```

A tenth of the weights keeps 97% of the accuracy. The remaining weights have taken over the work of the removed ones. That is the general lesson about neural networks behind both techniques: they are trained with far more capacity than they end up needing.

## Both together

Pruning 70% of the weights and training with 6-bit rounding at the same time gave 0.759 in the reference run. Compare the sizes: 4,256 weights of 32 bits are 136,192 bits. 1,277 weights of 6 bits are 7,662 bits, 18 times less, for under one point of accuracy.

## The real tools

You have now done by hand what specialised libraries do with more care.

- **QKeras** for Keras and **Brevitas** for PyTorch provide layers that are trained with fixed-point weights and activations.
- **hls4ml** takes a trained model and writes the description of a circuit for an FPGA, with an `ap_fixed` type for every layer. Its default type is `ap_fixed<16, 6>`.
- **Knowledge distillation** is a third way to a small model: train a small network to imitate the outputs of a large one.

The paper that introduced your data set did exactly this study, pruning and quantising the same architecture, and found that it fits on an FPGA with a latency on the scale of 100 nanoseconds.

## Trying the real tool

hls4ml can do more than write a circuit. It can also build a simulation that computes, bit for bit, what the circuit would compute, and run it on your own machine. It needs `pip install hls4ml` and a C++ compiler, and no FPGA software.

```
import hls4ml

config = hls4ml.utils.config_from_pytorch_model(
    net, input_shape=(16,), granularity="name",
    default_precision="ap_fixed<16,6>", backend="Vitis")
hls_model = hls4ml.converters.convert_from_pytorch_model(
    net, hls_config=config, output_dir="hls_tagger",
    backend="Vitis", io_type="io_parallel")
hls_model.compile()
predicted = hls_model.predict(np.ascontiguousarray(X)).argmax(axis=1)
```

`net` is the trained `nn.Sequential` and `X` holds standardised test features. `config_from_pytorch_model` returns a dictionary of settings with one entry per layer. `convert_from_pytorch_model` writes a folder of C++ that describes the circuit. `compile` builds the simulation, and `predict` runs it. `np.ascontiguousarray` makes sure that the array lies in memory as one block, which the simulation expects.

To give the weights their own type, change the dictionary before converting:

```
for layer in config["LayerName"].values():
    precision = layer["Precision"]
    if "weight" in precision:
        precision["weight"] = "ap_fixed<8,3>"
        precision["bias"] = "ap_fixed<8,3>"
```

In the reference run, on the first 20,000 test jets, where PyTorch scores 0.767:

```
types                                 accuracy   same class as PyTorch
default ap_fixed<16,6>                  0.766      99.6% of the jets
weights ap_fixed<8,3>                   0.740      90.2%
weights ap_fixed<8,3,AP_RND,AP_SAT>     0.763      96.8%
```

The first line says that the circuit would do what the network does. The other two show a detail that the hand-made scan hid. By default an `ap_fixed` number does not round. It cuts the extra bits off, which moves every weight down by half a step on average, and a value outside the range wraps around to the other end. `AP_RND` asks for rounding and `AP_SAT` for saturation. They cost a little logic, and they bring the 8-bit result back to what your own scan found.

One more number from the same run shows the caveat from above. Forcing every value in the design into `ap_fixed<10,4>`, the inputs and the sums inside the neurons included, gave 0.446. A sum over 64 inputs needs more room than a single weight.

## How to report compression

Never report a single number. Report the curve: accuracy against bits, or against the fraction pruned, measured on the test set, with the uncompressed model as the first point. The interesting result is where the curve bends, because that is where an engineer will choose to stand.
--- practice
@predict
A weight is stored as `ap_fixed<8, 3>`. Type the step between neighbouring values and the largest value it can hold, separated by a space.
= 0.03125 3.96875
=| 0.03125, 3.96875
=| 1/32 3.96875
! Five bits stand after the point, so the step is 2 to the power −5, which is 1/32. Three integer bits with a sign reach from −4 up to 4 minus one step.

@run
Write `quantise(w, bits, int_bits)` for a single Python number: round `w` to the nearest multiple of the step, then clamp it into the range of the format. This is the function of the lesson without PyTorch.
```starter
def quantise(w, bits, int_bits):
    step = 2.0 ** -(bits - int_bits)
    # lo, hi, round to the grid, clamp
    pass
```
```test
print([float(quantise(w, 4, 2)) for w in (0.3, -0.3, 0.74, 1.9, -5.0, 0.1)])
print(float(quantise(0.3, 8, 3)))
print([float(quantise(w, 3, 3)) for w in (0.3, 0.6, -1.4)])
```
= [0.25, -0.25, 0.75, 1.75, -2.0, 0.0]
= 0.3125
= [0.0, 1.0, -1.0]
```solution
def quantise(w, bits, int_bits):
    step = 2.0 ** -(bits - int_bits)
    lo = -(2.0 ** (int_bits - 1))
    hi = 2.0 ** (int_bits - 1) - step
    q = round(w / step) * step
    return min(max(q, lo), hi)
```
! With 4 bits, 2 of them integer, the step is 0.25 and the range is −2 to 1.75. So 1.9 saturates at 1.75, −5 at −2, and 0.1 is closer to 0 than to 0.25. With 3 bits and 3 integer bits the step is 1, and only whole numbers are left.

@predict
A weight has 6 bits. How many different values can it take?
= 64
! 2 to the power 6. A float32 has about four billion.

@choice
Why does quantisation-aware training need the straight-through estimator?
- Rounding is too slow to compute during training
* Rounding is a staircase, so its gradient is zero almost everywhere, and no weight would learn
- PyTorch can't round tensors
- The rounded weights are too small
! A tiny change of a weight leaves its rounded value unchanged, so the loss doesn't react to it. The estimator passes the gradient through as if the rounding were not there.

@predict
In this line, what is the value of `w` in the forward pass, and which tensor receives the gradient? Answer with two words from: rounded, weight.
```
w = self.weight + (quantise(self.weight, self.bits) - self.weight).detach()
```
= rounded weight
=| rounded, weight
=| rounded and weight
! The value is weight + rounded − weight, the rounded weight. The detached bracket is a constant for the backward pass, so the gradient goes to `self.weight` unchanged.

@local
Write `quantise_scan.py`. Load your trained tagger and the test set, and for 16, 12, 10, 8, 7, 6, 5 and 4 bits with 3 integer bits, round all weights and biases of a copy of the model and measure the test accuracy. Print the line `float32 accuracy A` first and then one line per width in the form `bits B accuracy A`. Use `copy.deepcopy(model)` for each copy, so that the original stays intact. Paste the output.
min: 9
= float32 accuracy
= bits 16 accuracy
= bits 4 accuracy
```solution
import copy
import numpy as np
import torch
from torch import nn

def quantise(w, bits, int_bits=3):
    step = 2.0 ** -(bits - int_bits)
    lo = -(2.0 ** (int_bits - 1))
    hi = 2.0 ** (int_bits - 1) - step
    return torch.clamp(torch.round(w / step) * step, lo, hi)

saved = torch.load("jet_tagger.pt", weights_only=False)
model = nn.Sequential(nn.Linear(16, 64), nn.ReLU(), nn.Linear(64, 32), nn.ReLU(),
                      nn.Linear(32, 32), nn.ReLU(), nn.Linear(32, 5))
model.load_state_dict(saved["state"])
model.eval()
test = np.load("jets_test.npz")
X, y = torch.tensor(test["X"]), torch.tensor(test["y"])

def accuracy(m):
    with torch.no_grad():
        return (m(X).argmax(dim=1) == y).float().mean().item()

print("float32 accuracy", round(accuracy(model), 4))
for bits in (16, 12, 10, 8, 7, 6, 5, 4):
    q = copy.deepcopy(model)
    with torch.no_grad():
        for p in q.parameters():
            p.copy_(quantise(p, bits))
    print("bits", bits, "accuracy", round(accuracy(q), 4))
```
! Your numbers will differ a little from the lesson's, and the shape should be the same: flat down to about 8 bits, then a cliff. `p.copy_(...)` overwrites a parameter in place, which is only allowed inside `torch.no_grad()`. The solution assumes that your training script saved a dictionary with the weights under `state` and the test set as `jets_test.npz`. Adapt the names to yours.

@choice
Magnitude pruning at 90% without retraining gave an accuracy of 0.07, and after three epochs of retraining 0.746. What does the retraining do?
- It brings the pruned weights back
* The surviving weights adjust to do the work of the removed ones, while the mask keeps the others at zero
- It lowers the learning rate
- It rounds the weights
! The mask is applied after every optimiser step, so the pruned weights stay at zero. Everything else is free to move.

@local
Extend your work with pruning. Take the trained tagger, prune 70% of its weights by magnitude, measure the accuracy, retrain for three epochs with the masks applied after every optimiser step, and measure again. Print one line in the form `pruned 70%: N weights left, accuracy A before and B after retraining`. Paste the output.
min: 1
= pruned 70%
= 1277 weights left
! The network has 4,256 weights, and 30% of them are 1,277. In the reference run the accuracy was 0.48 before retraining and 0.76 after. If yours stays low after retraining, check that the masks are applied after `optimizer.step()` and not before.

@choice
You must fit the tagger into a quarter of the chip area. Which plan is soundest?
- Round the trained weights to 4 bits and ship it
- Prune 90% without retraining
* Prune and quantise with retraining, measure the accuracy on the test set for several settings, and choose a point on that curve
- Train a larger network, since larger networks are more accurate
! Compression without retraining falls off a cliff. With retraining there is a curve of size against accuracy, and the choice along it is an engineering decision that needs the measured numbers.

@write
From memory: the PyTorch function `quantise(w, bits, int_bits)` that rounds a tensor to a signed fixed-point grid and saturates values outside the range.
min: 4
```solution
def quantise(w, bits, int_bits=3):
    step = 2.0 ** -(bits - int_bits)
    lo = -(2.0 ** (int_bits - 1))
    hi = 2.0 ** (int_bits - 1) - step
    return torch.clamp(torch.round(w / step) * step, lo, hi)
```
! Step from the bits after the point, range from the bits before it, round to the grid, clamp.
--- recall
Q: What do W and I mean in ap_fixed<W, I>, and what are the step and the range?
A: W is the total number of bits and I the bits before the point, sign included. The step is 2 to the power −(W − I), and the range is −2^(I−1) to 2^(I−1) minus one step.
Q: What is post-training quantisation, and how far did it work for the jet tagger?
A: Rounding the weights of a finished network. It cost nothing down to about 8 bits and collapsed below 6.
Q: What is quantisation-aware training?
A: Training with the weights rounded in the forward pass, so that the network learns values that work after rounding.
Q: What does the straight-through estimator do?
A: It uses the rounded value in the forward pass and passes the gradient through the rounding unchanged in the backward pass.
Q: What is magnitude pruning, and what must follow it?
A: Setting the weights with the smallest absolute values to zero. Retraining with a mask must follow, so that the surviving weights take over.
Q: Why do bits and weights matter on an FPGA?
A: The network is a circuit there. Each weight is a multiplier, and its size grows with the number of bits, while the chip has a fixed amount of logic.

=== dl5 | ml | 17 | From training to use: ONNX, ONNX Runtime and honest latency numbers | p43
## A trained model is not yet a usable one

Training happens in Python with PyTorch. Using the model, which is called **inference**, happens somewhere else: inside the C++ reconstruction software of an experiment, inside a web service, on a GPU server. Those places don't want a Python script and a 200 MB framework. They want a file that describes the network, and a small, fast engine to run it.

**ONNX**, the Open Neural Network Exchange, is the standard file format for that. A file holds a graph of standard operations (matrix product, ReLU, softmax and about two hundred others) and the weights. **ONNX Runtime** is an open-source engine that runs such files. It is written in C++ and can be called from C++, Python and other languages. The software frameworks of ATLAS and CMS can both run ONNX models this way, so a network trained by a student in PyTorch can end up in reconstruction.

Install the three packages with `pip install onnx onnxscript onnxruntime`.

## Put the preprocessing inside the model

The commonest way for a deployed model to give wrong answers is that the inputs are prepared differently from the training: another mean, another order of features, a forgotten standardisation. Remove the possibility. Wrap the network in a module that takes the **raw** features and does the standardisation itself, and that returns probabilities instead of logits:

```
class Tagger(nn.Module):
    def __init__(self, net, mean, std):
        super().__init__()
        self.net = net
        self.register_buffer("mean", torch.tensor(mean))
        self.register_buffer("std", torch.tensor(std))

    def forward(self, x):
        return torch.softmax(self.net((x - self.mean) / self.std), dim=1)
```

This is the general way of writing a model in PyTorch when `nn.Sequential` is not enough. You derive a class from `nn.Module`, create the parts in `__init__` and say in `forward` how an input becomes an output. `super().__init__()` runs the set-up code of `nn.Module` and must come first. `register_buffer` attaches a tensor to the module that is saved and exported with it and is not trained. The mean and the standard deviation are exactly that kind of number.

## Exporting

```
model = Tagger(net, saved["mean"], saved["std"]).eval()
example = torch.zeros(1, 16)

torch.onnx.export(model, (example,), "jet_tagger.onnx",
                  input_names=["features"], output_names=["probabilities"],
                  dynamic_shapes=({0: "batch"},), external_data=False)
```

Argument by argument:

- `(example,)` is a tuple with one example input. The exporter runs the model on it once and records every operation. Only its shape and type matter, so zeros are fine.
- `input_names` and `output_names` give the input and the output the names that every later user will see.
- `dynamic_shapes=({0: "batch"},)` says that dimension 0 of the input, the number of jets, may vary. Without it the file accepts exactly the shape of the example, one jet at a time, and a batch of two is refused with `Got invalid dimensions for input`.
- `external_data=False` keeps the weights inside the one file.

The file of the reference tagger has 31,737 bytes: 4,389 parameters of 4 bytes, the mean and the standard deviation, and the description of the graph. You can look inside:

```
import onnx
m = onnx.load("jet_tagger.onnx")
onnx.checker.check_model(m)
print(" ".join(node.op_type for node in m.graph.node))
```

```
Sub Div Gemm Relu Gemm Relu Gemm Relu Gemm Softmax
```

That is your model, readable without PyTorch: subtract the mean, divide by the standard deviation, then four linear layers with three ReLUs between them, and the softmax. `Gemm` stands for general matrix multiplication, ONNX's name for a linear layer. The website netron.app draws the same graph as a picture if you drop the file onto it.

## Running it

```
import onnxruntime as ort

session = ort.InferenceSession("jet_tagger.onnx",
                               providers=["CPUExecutionProvider"])
probabilities = session.run(None, {"features": X})[0]
```

An `InferenceSession` loads the file and prepares it for the chosen **provider**, here the CPU. Others exist for GPUs. `run` takes the list of outputs you want, where `None` means all of them, and a dictionary from input names to NumPy arrays. It returns a list with one array per output, which is why the `[0]` is there.

`X` must be a `float32` array of shape (N, 16). NumPy's default type is `float64`, and ONNX Runtime refuses it with the message `Unexpected input data type. Actual: (tensor(double)) , expected: (tensor(float))`. The cure is `X.astype(np.float32)`.

## Always check the export

An exported model is a translation, and translations can be wrong. Run the same inputs through PyTorch and through ONNX Runtime and compare:

```
with torch.no_grad():
    p_torch = model(torch.tensor(X)).numpy()
p_onnx = session.run(None, {"features": X})[0]
print(np.abs(p_onnx - p_torch).max())
```

In the reference run the largest difference over 83,000 jets was 2.4e-7, which is rounding in the seventh digit, and the accuracy was the same 0.7663. Differences of that size are normal, because the two engines add numbers in a different order. A difference of 0.01 means that something was translated wrongly.

## Latency and throughput

Two numbers describe the speed of inference.

- **Latency** is the time one request takes from input to answer.
- **Throughput** is the number of answers per second.

They are not simply each other's inverse, as you will see. Measuring them honestly has rules:

- **Warm up.** The first calls are slow, because memory is allocated and caches are cold. Throw them away.
- **Repeat thousands of times**, with `time.perf_counter()`, the clock made for measuring intervals.
- **Report percentiles and not the mean.** The **p50**, or median, is the time that half of the calls stay below. The **p99** is the time that 99% stay below. Latencies have a long tail, because every so often the operating system interrupts. The mean mixes the typical case and the tail into a number that describes neither.
- **Fix the number of threads**, and say on which machine you measured.

```
def latency(fn, runs):
    times = []
    for _ in range(runs):
        t0 = time.perf_counter()
        fn()
        times.append(time.perf_counter() - t0)
    # drop the first tenth as warm-up, and convert to microseconds
    times = np.array(times[runs // 10:]) * 1e6
    return np.percentile(times, 50), np.percentile(times, 99)

options = ort.SessionOptions()
options.intra_op_num_threads = 1
session = ort.InferenceSession("jet_tagger.onnx", options,
                               providers=["CPUExecutionProvider"])
one = X[:1]
p50, p99 = latency(lambda: session.run(None, {"features": one}), 5000)
```

`lambda:` makes a small function without a name, here one that runs the model on one jet. `runs // 10` is whole-number division. For PyTorch, `torch.set_num_threads(1)` fixes the threads.

## What the reference run measured

On one core of a 2.3 GHz server processor:

```
                 one jet                  1,024 jets at once
                 p50        p99           p50         per jet
PyTorch          31 us      84 us         266 us      0.26 us
ONNX Runtime     6.8 us     17 us         151 us      0.15 us
```

`us` stands for microseconds, millionths of a second. Read the table in three steps.

For one jet, ONNX Runtime is four to five times faster than PyTorch. The arithmetic is the same 4,256 multiplications in both. The difference is overhead: PyTorch passes through Python and a lot of general machinery on every call.

In a batch of 1,024, a jet costs 0.15 microseconds, about 46 times less than alone. The fixed cost of a call is shared among 1,024 jets, and the matrix products run in the vectorised loops that you met in week 12.

So batching buys throughput: about 147,000 jets per second one at a time against 6.8 million in batches. It costs latency, because a jet has to wait until its batch is full and then for the whole batch to be computed. Every inference system makes that trade, and the right point depends on who is waiting.

Finally, compare with the trigger. 6.8 microseconds on a processor is fine for the high-level trigger and for analysis. The Level-1 trigger has a few microseconds for all of its work. That is why the same network there becomes a circuit with an answer in about 100 nanoseconds, and why last lesson's bits and weights matter.

## Handing a model over

A model file on its own is not a deliverable. Hand over, together:

- the `.onnx` file,
- a description of the input: the names of the features, their order and their units,
- a few test inputs with the expected outputs, so that the receiver can check the installation,
- the accuracy on the test set, and the latency with the machine it was measured on,
- the commit of the code that trained it.
--- practice
@run
Write `percentile(values, p)` by the nearest-rank rule: sort the values, and return the one at position `ceil(p * n / 100)`, counting from 1, where `n` is the number of values.
```starter
import math

def percentile(values, p):
    ordered = sorted(values)
    pass
```
```test
lat = [12, 15, 11, 14, 13, 250, 12, 13, 16, 12]
print(percentile(lat, 50), percentile(lat, 90), percentile(lat, 99))
print(round(sum(lat) / len(lat), 1))
print(percentile([5], 99), percentile(list(range(1, 101)), 99))
```
= 13 16 250
= 36.8
= 5 99
```solution
import math

def percentile(values, p):
    ordered = sorted(values)
    rank = max(1, int(math.ceil(p * len(ordered) / 100)))
    return ordered[rank - 1]
```
! Ten latencies with one slow call. The median is 13 and the p99 is 250. The mean, 36.8, is a value that not a single call had: nine were far faster and one far slower. That is why latency is reported in percentiles.

@predict
A model answers one request in 8 microseconds on one core. How many requests per second can that core serve, one at a time?
= 125000
=| 125,000
=| 125 000
! One second is 1,000,000 microseconds, and 1,000,000 / 8 = 125,000.

@predict
A batch of 1,024 jets takes 151 microseconds. A single jet alone takes 6.8. How many times cheaper is a jet in the batch? Round to a whole number.
= 46
=| 45
=| 46 times
=| 45 times
! 151 / 1,024 = 0.147 microseconds per jet, and 6.8 / 0.147 is about 46. With the rounded 0.15 you get 45. Both count.

@choice
Why wrap the standardisation and the softmax into the exported model?
- The file gets smaller
- ONNX can't store models without them
* Whoever uses the file can't then apply a different or forgotten preprocessing: raw features go in and probabilities come out
- It makes training faster
! Mismatched preprocessing between training and use is the commonest deployment bug, and it gives no error message, only worse answers.

@local
Export your tagger to `jet_tagger.onnx` with the `Tagger` wrapper, run the raw test features through PyTorch and through ONNX Runtime, and print three lines: `nodes` followed by the operations of the graph, `largest difference` followed by the number, and `agree` followed by the result of `np.allclose(p_onnx, p_torch, atol=1e-5)`. Paste the output.
min: 3
= Gemm
= Softmax
= agree True
! The raw test features are the ones before standardisation, so recreate the split from `jets.npz` with the same seed. If the difference is large, the usual cause is standardising twice: once by hand and once inside the wrapper.

@local
Measure the latency of your exported model with ONNX Runtime on one thread: for one jet with 5,000 runs and for a batch of 1,024 with 500 runs. Do the same for the PyTorch model. Print one line for each of the four cases with the p50 and the p99 in microseconds, labelled `p50` and `p99`. Paste the output with a line that names your processor.
min: 5
= p50
= p99
! Expect the same pattern as in the lesson, with other numbers: ONNX Runtime several times faster for one jet, and a batch far cheaper per jet than single calls. Run it twice. If the p99 jumps around between runs, that is the tail doing what tails do.

@choice
A service must answer within 10 milliseconds, and you may report one number for your model. Which one?
- The mean latency
- The fastest run
* The p99 latency
- The throughput in a batch of 1,024
! A deadline is about the slow cases. The mean and the best run hide them, and throughput says nothing about a single request.

@choice
What does `dynamic_shapes=({0: "batch"},)` do in the export?
- It makes the model faster
- It lets the weights change after export
* It marks the first dimension of the input as variable, so that the file accepts any number of jets at once
- It splits the model into several files
! Without it the exporter fixes the shape of the example input, here one jet.

@write
From memory: load `jet_tagger.onnx` with ONNX Runtime on the CPU and compute the predicted class for every row of the float32 array `X`. The input is called `features`.
min: 4
```solution
import onnxruntime as ort

session = ort.InferenceSession("jet_tagger.onnx",
                               providers=["CPUExecutionProvider"])
probabilities = session.run(None, {"features": X})[0]
predicted = probabilities.argmax(axis=1)
```
! Session, then `run` with `None` for all outputs and a dictionary of inputs, then `[0]` for the first output. `argmax(axis=1)` picks the most probable class in each row.
--- recall
Q: What are ONNX and ONNX Runtime?
A: ONNX is a file format for neural networks: a graph of standard operations plus the weights. ONNX Runtime is an engine that runs such files from C++, Python and other languages.
Q: Why put the standardisation and the softmax inside the exported model?
A: So that raw features go in and probabilities come out, and nobody can apply a different preprocessing than the training used.
Q: How do you check an exported model?
A: Run the same inputs through the original and the exported model and compare the outputs. Differences around 1e-7 are rounding.
Q: What are p50 and p99?
A: The latencies that 50% and 99% of the calls stay below. The p50 is the typical case and the p99 describes the tail.
Q: What are the rules for measuring latency?
A: Warm up and discard the first calls, repeat thousands of times with perf_counter, report percentiles, fix the number of threads and name the machine.
Q: What does batching trade?
A: Throughput against latency. A batch shares the fixed cost of a call, so each item is far cheaper, but every item waits for the whole batch.

=== ph9 | phys | 17 | Machine learning at the LHC: where the networks run | 
## A map, not a survey

You have now trained a network, shrunk it and exported it. This lesson puts that work on the map of the experiments, so that a project description such as "GNN-based tracking for the HL-LHC" or "fast inference with hls4ml" tells you where it sits, what its constraint is and which of your skills it would use. The map follows the chain from the earlier lesson on the trigger, reconstruction, simulation and the Grid.

## In the Level-1 trigger: networks as circuits

The Level-1 trigger of ATLAS and CMS keeps about one bunch crossing in 400, and it decides on FPGAs within a few millionths of a second. One clock tick of the LHC is 25 nanoseconds, the time between two bunch crossings, and an algorithm there is granted a handful of ticks.

The tool that brought neural networks into this world is **hls4ml**. It was started around 2017 by physicists from Fermilab, CERN, MIT and other institutes. You give it a trained model from Keras, PyTorch or ONNX, and it writes C++ in the dialect that the chip makers' tools turn into a circuit. That step is called high-level synthesis, which is the HLS in the name. For every layer you choose the `ap_fixed` type, and you choose how often each multiplier is reused, which trades speed against chip area. Your jet tagger is the worked example of its first paper.

The most striking use so far is **anomaly detection**. Classic triggers look for something specific: a muon above a threshold, two jets, missing energy. New physics that looks like none of these would be thrown away unseen. An **autoencoder** is a network trained to squeeze its input through a narrow layer and rebuild it. Trained on ordinary collisions, it rebuilds ordinary collisions well and unusual ones badly, so the size of its error is a measure of how strange an event is. CMS built such a trigger, called AXOL1TL, with quantisation-aware training and hls4ml, and took data with it in 2024. A second one, CICADA, reads the calorimeter as a small image.

## In the high-level trigger and in reconstruction

Here the network runs on processors and GPUs, with milliseconds available and no hard limit on size.

**Jet tagging** is the oldest success. The most important case is finding jets from b quarks. A particle containing a b quark flies a few millimetres before it decays, so its jet contains tracks that don't point back to the collision. Networks have identified such jets for years. The current tagger of ATLAS, GN2, is a transformer, and CMS uses networks called DeepJet and ParticleNet.

The inputs of taggers have changed more than once. First came a few high-level features into a small dense network, which is your project. Then the jet was drawn as an image for the convolutional networks of computer vision. Today a jet is given as what it is, a set of particles without order and of varying size.

- A **graph neural network** treats the particles as points and connects each to its neighbours. In every layer, each point updates its own description from those of its neighbours. ParticleNet (2019) works this way.
- A **transformer** lets every particle look at every other one and decide how much attention each deserves. This is the architecture behind language models, and the Particle Transformer (2022) applied it to jets.

**Tracking** is the most expensive part of reconstruction: joining the hits in the tracker into the paths of particles. Today about 60 collisions overlap in one bunch crossing. At the upgraded LHC it will be up to 200, and the classic algorithms slow down faster than the number of hits grows. In graph-based tracking the hits are the points, candidate connections between hits in neighbouring layers are the edges, and a network decides which edges are real track segments. The Exa.TrkX project and the ATLAS group for its new tracker have shown such pipelines on simulated HL-LHC events.

Networks inside C++ reconstruction usually run through ONNX Runtime, as in your last lesson. A second pattern is **inference as a service**: the reconstruction job sends its inputs over the network to a server with GPUs that runs the model for many jobs at once. CMS calls its version SONIC, and it is built on an open-source server from NVIDIA called Triton. You will build a small inference service yourself next week.

## In simulation

Geant4 follows every particle through the detector, and most of its time goes into the showers of thousands of particles in the calorimeters. **Fast simulation** replaces that step with a model that directly generates a plausible shower for a given particle and energy.

This is the home of **generative models**, which learn to produce new examples that look like their training data: GANs, in which a generator learns to fool a second network that tries to tell real from generated, and more recently diffusion models and normalising flows. ATLAS uses GANs in production for part of its calorimeter simulation, in a tool called AtlFast3. The hard part is not producing something shower-like. It is getting the details right well enough that physics results don't change, and proving it.

## In analysis

Separating signal from background with a classifier, as in your Higgs project, is routine, and boosted decision trees remain common because they are fast to train and hard to get wrong on tabular data. Networks are also used for regression, for example to correct the measured energy of a jet, and increasingly for the statistical part of an analysis.

## What is hard about machine learning in physics

These points come up in interviews, because they separate people who have trained a model from people who have thought about using one.

- **Simulation is not data.** Almost every model is trained on simulated events, where the truth is known, and applied to real ones. Where the two differ, the model behaves differently. Its efficiency is therefore measured again in data, on processes that are well understood, and the difference becomes a correction with an uncertainty.
- **A classifier can sculpt the background.** A tagger that has learned the jet mass will make the surviving background pile up near the signal mass, which ruins a search for a peak. Taggers are therefore often trained to be independent of the mass.
- **Accuracy is one constraint among several.** Latency, memory and chip area are fixed by the place the model runs in.
- **Every model needs validation that a physicist believes.** A better score on a test set is where the work starts.

## Three questions for any project description

1. Where on the chain does it sit: Level-1, high-level trigger, reconstruction, simulation or analysis?
2. What is the binding constraint: nanoseconds, throughput, memory, or physics accuracy?
3. What is the input: a fixed list of features, an image, or a set of particles or hits?

Answer these and you know which architectures are in play and which of your projects is the closest experience to mention.
--- practice
@predict
Bunches cross 40 million times a second. How many nanoseconds lie between two crossings?
= 25
=| 25 ns
=| 25ns
! One second is a billion nanoseconds, and 1,000,000,000 / 40,000,000 = 25. This is the clock tick that all trigger electronics counts in.

@predict
An algorithm in the Level-1 trigger is granted 4 ticks of that clock. Your tagger takes 6.8 microseconds on a processor. How many times too slow is it? Type a whole number.
= 68
=| 68 times
! Four ticks are 100 nanoseconds, and 6.8 microseconds are 6,800 nanoseconds. That factor is why the network becomes a circuit there.

@choice
Why can an autoencoder trigger on new physics that nobody has predicted?
- It has been trained on simulated new physics
* It is trained to rebuild ordinary collisions, so any event it rebuilds badly is unusual, whatever the reason
- It keeps a random sample of all events
- It measures the total energy of the event
! It needs no model of the signal. The price is that "unusual" also includes detector glitches, which have to be understood afterwards.

@choice
A jet arrives as 37 particles in no particular order, and the next jet has 52. Which kind of network takes such an input directly?
- A dense network with 16 inputs
- A convolutional network on a fixed image
* A graph neural network or a transformer
- A boosted decision tree
! Both work on sets of any size and give the same answer whatever the order of the particles. The other three need a fixed number of inputs in a fixed order.

@choice
Why is tracking a target for new methods at the upgraded LHC?
- Tracks will no longer be curved
* The number of overlapping collisions rises from about 60 to as many as 200, and the cost of the classic algorithms grows faster than the number of hits
- The tracker will be removed
- Processors are getting slower
! More hits mean many more combinations to try. Methods whose cost grows gently with the number of hits, and that run well on GPUs, become attractive.

@choice
A tagger was trained on simulation. Before it is used in a measurement, what must happen?
- Nothing, if the test accuracy is high
- It must be retrained on data
* Its efficiency is measured in real data on well-understood processes, and the difference from simulation is applied as a correction with an uncertainty
- It must be converted to ONNX
! The test accuracy was measured on simulation too. Only data can say how the model behaves on data.

@write
Explain to a fellow student why a network in the Level-1 trigger has to be tiny, and name the techniques that get it there. Use the terms FPGA, bits and latency.
min: 70
```solution
The Level-1 trigger has to decide for every bunch crossing, 40 million times a second, within a few microseconds in total, so a single algorithm gets a latency budget of the order of 100 nanoseconds. No processor can run a network that fast, so the network is built as a circuit on an FPGA. There every weight is a multiplier that takes up chip area, and the area of a multiplier grows with the number of bits of its numbers. A network therefore needs few weights and few bits. Three techniques get it there. Quantisation replaces 32-bit floats by fixed-point numbers of 6 or 8 bits, and quantisation-aware training lets the network adapt to the rounding. Pruning sets the smallest weights to zero and retrains, so that most multipliers disappear. Choosing a small architecture, or distilling a large network into a small one, does the rest. For my jet tagger, 30% of the weights at 6 bits kept 99% of the accuracy.
```
! A good answer connects the three terms: the latency forces the FPGA, the FPGA makes bits and weights the cost, and compression with retraining pays that cost.

@write
Choose one: anomaly detection in the trigger, jet tagging, tracking or fast simulation. Answer the three questions of the lesson for it, and say which piece of your own work from this plan is the closest experience and why.
min: 70
```solution
Fast simulation of calorimeter showers. It sits in the simulation step of the chain, after the event generator and in place of the detailed Geant4 shower. The binding constraint is physics accuracy at high throughput: the generated showers must be close enough to Geant4 that analysis results do not change, and they must be produced many times faster. The input is a particle type, an energy and a direction, and the output is the energy in each calorimeter cell, so the model is generative and not a classifier. My closest experience is the toy Monte Carlo of project 2, where I generated events from random numbers and then validated the generator with a closure test against the known mass and width. The validation habit transfers directly: for a generative model, comparing distributions with the reference is most of the work. My inference measurements from the jet tagger transfer too, because a fast simulation is only useful if its speed is measured honestly.
```
! There is no single right answer. What counts is that you can place a topic on the chain, name its constraint, and connect it to something you have built.
--- recall
Q: What does hls4ml do?
A: It turns a trained neural network into the description of a circuit for an FPGA, with a fixed-point type for every layer, so that the network can run in the Level-1 trigger.
Q: How does an autoencoder detect anomalies?
A: It is trained to rebuild ordinary events. An event that it rebuilds badly is unusual, so the reconstruction error is the anomaly score.
Q: How is a jet given to a modern tagger, and which architectures take that input?
A: As a set of particles without order and of varying size. Graph neural networks and transformers take it directly.
Q: What is graph-based tracking?
A: Hits are the points, candidate connections between hits are the edges, and a network decides which edges are real track segments.
Q: What is fast simulation, and which kind of model does it use?
A: Replacing the detailed simulation of calorimeter showers by a generative model, such as a GAN, that produces plausible showers directly.
Q: Name two things that make machine learning in physics harder than on a benchmark.
A: Models are trained on simulation and applied to data, so their behaviour must be measured in data. And a classifier can sculpt the background, for example by learning the mass.

=== sv1 | py | 18 | HTTP services with FastAPI: requests, validation and tests | p47,p48,p49
## From a file to a service

At the end of week 17 your tagger is a file, `jet_tagger.onnx`, and ten lines of Python that load it. Anyone who wants a prediction needs the file, Python, ONNX Runtime in a version that fits, and your ten lines. That is fine for you. It is not fine for a trigger farm, a colleague who writes C++, or a web page.

A **service** turns the model into something any program can use. A service is a program that keeps running, waits for **requests** that arrive over the network, and sends back a **response** to each. The caller needs to know two things only: the address of the service, and what a request and a response look like. That description is called the **API**, the application programming interface.

Much of the software at CERN talks to other software in this way: analysis jobs ask a service for the calibration constants of a run, a website asks a service which jobs are running, and the experiments have started to run neural networks behind services so that many reconstruction jobs can share one GPU, which the lesson on machine learning at the LHC described.

This week you build such a service around your tagger. Next week you put it under load and run three copies of it on a Kubernetes cluster, and the week after you monitor it.

## HTTP in one exchange

Nearly all services speak **HTTP**, the protocol of the web. A protocol is an agreement on what the two sides send and in which order. HTTP is plain text, and you can watch it with `curl`, a command-line program that sends one request and prints the response. The option `-i` makes it print the first lines of the response, which are normally hidden:

```
curl -i http://localhost:8000/healthz
```

```
HTTP/1.1 200 OK
date: Mon, 23 Nov 2026 15:35:56 GMT
server: uvicorn
content-length: 15
content-type: application/json

{"status":"ok"}
```

That is the answer of the service you are about to write. Take the address apart first. `http://` names the protocol. `localhost` is the name every computer has for itself, so this request never leaves your machine. `8000` is the **port**: a number between 1 and 65535 that says which of the programs on that machine should get the request. `/healthz` is the **path**, which says what you want from that program.

What `curl` sent is a **request**. It has four parts:

- a **method**, which is a verb. `GET` asks for something and changes nothing. `POST` sends data to be processed. `curl` uses GET unless you say otherwise.
- the path, here `/healthz`
- **headers**, which are lines of the form `name: value` with information about the request
- a **body**, the data itself. A GET has none.

What came back is a **response**:

- The first line holds the **status code**, a three-digit number that says how it went, followed by the same thing in words. `200 OK` means success.
- Then the headers. `content-type: application/json` says that the body is JSON, and `content-length: 15` that it is 15 bytes long.
- An empty line, and then the body.

The status codes come in families, and the first digit tells you who has to act:

- `2xx`: it worked. `200` is the usual one.
- `4xx`: the caller made a mistake. `404 Not Found` means there is nothing at this path. `405 Method Not Allowed` means the path exists, but not for this method. `422 Unprocessable Content` means the body was understood and its content is not acceptable.
- `5xx`: the service failed. `500 Internal Server Error` usually means an exception in the code of the service. `503 Service Unavailable` means it can't answer right now.

That split matters in practice. A caller who gets a 4xx should fix the request, and repeating it is pointless. A caller who gets a 5xx may try again later.

The body is **JSON**, a text format for structured data that every language can read. It looks almost like Python: an **object** in braces is a Python dictionary, a list in square brackets is a list, and there are numbers, strings in double quotes, `true`, `false` and `null`. Python's `json` module converts in both directions, and the frameworks below do it for you.

## The smallest service

**FastAPI** is a Python library for writing services. You write ordinary functions, and FastAPI takes care of reading requests and writing responses. Install it together with a server and the test tools:

```
pip install fastapi uvicorn httpx pytest
```

NumPy and ONNX Runtime are needed too, and you have them from week 17.

Create a new repository, `jet-service`, and in it a folder `app` with an empty file `__init__.py`, which makes the folder a Python package, and a file `main.py`:

```
from fastapi import FastAPI

app = FastAPI(title="Jet tagger")


@app.get("/healthz")
def healthz():
    return {"status": "ok"}
```

`app` is the service. The line that starts with `@` is a **decorator**, which you met in the lesson on decorators: it hands the function below it to `app.get`, and that records "when a GET request for `/healthz` arrives, call this function". Such a function is called a **handler**, and a path together with its method is called an **endpoint**. The handler returns a dictionary, and FastAPI turns it into JSON.

The name `healthz` is a convention that came from Google and is used all over Kubernetes: an endpoint that does no work and only says "I am alive".

FastAPI does not listen on the network itself. A **server** does that: a program that owns the port, reads the bytes of each request and hands the parsed request to your app. The usual one is **uvicorn**. Start it from the top folder of the repository:

```
uvicorn app.main:app --port 8000
```

`app.main:app` reads "in the module `app.main`, which is the file `app/main.py`, the variable `app`". If your shell can't find the command, `python -m uvicorn app.main:app --port 8000` does the same. Uvicorn prints:

```
INFO:     Started server process [18181]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

`127.0.0.1` is the numeric address behind the name `localhost`. The server now waits. Open a second terminal and send the `curl` command from above. In the first terminal, a line appears for every request:

```
INFO:     127.0.0.1:42740 - "GET /healthz HTTP/1.1" 200 OK
```

While you develop, add `--reload` to the uvicorn command, and it restarts whenever you save a file.

## Describing the input

A prediction needs input, so the request must carry data. The caller will send JSON of this form, with one or more jets of 16 numbers each:

```
{"jets": [[-3.4907, 0.4801, 0.0405, 0.0075, 0.0761, 0.0081, 1.8797, 1.0888,
           1.8797, 0.1928, 0.0917, 0.0224, 0.3204, 0.1071, 89.9697, 57.0]]}
```

Save exactly that as `jet.json`. It is a real jet from the test set. Its fifteenth number is the groomed mass, 90 GeV, and its sixteenth the number of particles, 57.

In FastAPI you describe the shape of a body as a class, using **pydantic**, a library that FastAPI installs with it:

```
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    jets: list[list[float]] = Field(min_length=1, max_length=1024)


class Prediction(BaseModel):
    label: str
    probabilities: dict[str, float]


class PredictResponse(BaseModel):
    predictions: list[Prediction]
```

A class that derives from `BaseModel` lists its fields with their types. `list[list[float]]` reads "a list of lists of floats". `dict[str, float]` is a dictionary from strings to floats. `Field(...)` adds rules that a type alone can't express: at least one jet and at most 1,024.

The upper limit is there to protect the service. Without it, one caller could send a million jets in one request and occupy the service and its memory for everybody else. Every input that comes from outside gets a limit.

## Loading the model once

Creating an ONNX Runtime session reads the file and prepares the network. On the reference machine that took 1.4 milliseconds, against 7 microseconds for one prediction, so a service that loaded the model for every request would spend 200 times longer loading than computing. For large models the loading takes seconds. The rule is general: do expensive preparation once, when the service starts.

FastAPI's place for that is the **lifespan** function:

```
import os
from contextlib import asynccontextmanager

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException

CLASSES = ["g", "q", "w", "z", "t"]
MODEL_PATH = os.environ.get("MODEL_PATH", "model/jet_tagger.onnx")
N_FEATURES = 16
VERSION = "0.1"

state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    options = ort.SessionOptions()
    options.intra_op_num_threads = 1
    state["session"] = ort.InferenceSession(
        MODEL_PATH, options, providers=["CPUExecutionProvider"])
    yield
    state.clear()


app = FastAPI(title="Jet tagger", lifespan=lifespan)
```

Everything before the `yield` runs once before the first request, and everything after it runs once when the service shuts down. This is the same pattern as the context managers you wrote with `@contextmanager`. The word `async` in front of `def` belongs to a way of writing concurrent code that the lesson on concurrency explains. Here it is just the form FastAPI asks for.

The session is kept in the dictionary `state`, which every handler can read. `os.environ.get("MODEL_PATH", "model/jet_tagger.onnx")` reads the path from an **environment variable**, a named setting that the surrounding system hands to a program, and falls back to a default. In that way the same code runs on your laptop and in a container without edits. Copy `jet_tagger.onnx` from your tagger project into a folder `model`.

`options.intra_op_num_threads = 1` tells ONNX Runtime to use one thread per prediction. For a model this small, more threads would only add overhead, and next week Kubernetes will decide how many copies of the service run.

## The endpoint that does the work

```
@app.get("/healthz")
def healthz():
    return {"status": "ok", "version": VERSION}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    if any(len(jet) != N_FEATURES for jet in request.jets):
        raise HTTPException(
            status_code=422,
            detail=f"every jet needs {N_FEATURES} features")
    x = np.asarray(request.jets, dtype=np.float32)
    p = state["session"].run(None, {"features": x})[0]
    predictions = []
    for row in p:
        label = CLASSES[int(row.argmax())]
        probabilities = {c: round(float(v), 4)
                         for c, v in zip(CLASSES, row)}
        predictions.append(
            Prediction(label=label, probabilities=probabilities))
    return PredictResponse(predictions=predictions)
```

`app/main.py` now has three parts, in this order: the imports with the lifespan function and the line that creates `app`, then the three pydantic classes, then these two handlers. They replace the smallest service from above, so the file has one line that creates `app` and one `healthz`.

Go through it once slowly, because most services have exactly this shape.

- `@app.post("/predict", ...)` registers the function for POST requests. A prediction sends data, so POST is the fitting method.
- The parameter `request: PredictRequest` is where FastAPI does its work. Because the type is a pydantic model, FastAPI reads the body, parses the JSON, checks it against the model and creates the object. Your function only runs if all of that succeeded. Inside the function, `request.jets` is guaranteed to be a list of between 1 and 1,024 lists of floats.
- One rule is left to check by hand: each jet needs exactly 16 numbers. `raise HTTPException(status_code=422, detail=...)` ends the request with that status code and a JSON body that carries the message.
- `np.asarray(request.jets, dtype=np.float32)` builds the array that ONNX Runtime expects. The model was exported with float32 inputs, and Python's floats are float64.
- The loop turns each row of probabilities into a `Prediction`. `float(v)` converts NumPy's number type into a plain Python float that JSON can carry, and `round(..., 4)` keeps the response short.
- `response_model=PredictResponse` documents the shape of the answer and makes FastAPI check it.

## Trying it

Restart uvicorn and send the jet. `-X POST` chooses the method, `-H` adds a header that declares the body as JSON, and `-d @jet.json` sends the content of the file as the body:

```
curl -i -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" -d @jet.json
```

```
HTTP/1.1 200 OK
date: Mon, 23 Nov 2026 15:35:56 GMT
server: uvicorn
content-length: 103
content-type: application/json

{"predictions":[{"label":"z","probabilities":{"g":0.0031,"q":0.0072,
"w":0.0007,"z":0.9881,"t":0.001}}]}
```

The body is shown on two lines here and arrives as one. The model is 98.8% sure that this is a Z boson, which fits a jet of 90 GeV: the Z weighs 91.

Now break it on purpose. Each of these is worth running once, so that you recognise the answers when a real caller gets them.

A jet with 15 numbers reaches your own check:

```
HTTP/1.1 422 Unprocessable Content

{"detail":"every jet needs 16 features"}
```

Python versions before 3.13 print `422 Unprocessable Entity`, the older wording for the same code.

A body in which `jets` is a string never reaches your function. Pydantic refuses it and says where and why:

```
{"detail":[{"type":"list_type","loc":["body","jets"],
"msg":"Input should be a valid list","input":"hello"}]}
```

`loc` is the location of the problem: in the body, at the key `jets`. A GET on `/predict` gives `405 Method Not Allowed`, with a header `allow: POST` that names the method that would work. A path that doesn't exist gives `404 Not Found`.

You wrote none of that error handling. Declaring the types was enough.

## def or async def

FastAPI accepts handlers written with `def` and handlers written with `async def`, and it treats them differently. A handler with `def` is run in a pool of worker threads, so a slow one does not stop the server from accepting other requests. A handler with `async def` runs inside the server's main loop, and must never block it with slow work. The rule for now: write `def`, as above. The lesson on concurrency explains the difference, and after it you will know when `async def` pays.

## Testing without a network

A service is code, and code needs tests. FastAPI comes with a **test client** that calls your app directly, inside the test process, without a server or a port. Create `tests/test_api.py`:

```
import pytest
from fastapi.testclient import TestClient

from app.main import app

JET = [0.0] * 16


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_predict_one(client):
    r = client.post("/predict", json={"jets": [JET]})
    assert r.status_code == 200
    body = r.json()
    assert len(body["predictions"]) == 1
    probs = body["predictions"][0]["probabilities"]
    assert set(probs) == {"g", "q", "w", "z", "t"}
    assert abs(sum(probs.values()) - 1.0) < 1e-3
    assert body["predictions"][0]["label"] == max(probs, key=probs.get)


def test_wrong_length_is_rejected(client):
    r = client.post("/predict", json={"jets": [[1.0, 2.0]]})
    assert r.status_code == 422
```

A **fixture**, from the lesson on pytest, is a function that prepares something for tests, and a test asks for it by naming it as a parameter. This one creates the client. Two details matter:

- `with TestClient(app) as c:` runs the lifespan function, so the model is loaded. Without the `with`, the lifespan never runs, `state` stays empty, and every prediction fails with a `KeyError`.
- `scope="module"` creates the client once for the whole file. The default would create it again for every test, and load the model each time.

`client.post("/predict", json={...})` sends the dictionary as a JSON body. `r.status_code` and `r.json()` give you what `curl` printed. The three assertions about the probabilities check properties that hold for any input: five classes, a sum of 1 within rounding, and a label that is the most probable class. Sixteen zeros are not a real jet, and they exercise the same code.

Run the tests from the top folder with `python -m pytest -q`. The form with `python -m` puts the top folder on Python's search path, so that `from app.main import app` works. The reference project has eight tests:

```
........                                                         [100%]
8 passed in 0.43s
```

## The documentation you get for free

Open `http://localhost:8000/docs` in a browser while the service runs. FastAPI has generated a page that lists every endpoint with the exact shape of its request and its response, taken from your type hints, and with a button to try each one. The machine-readable description behind the page follows a standard called **OpenAPI**, and tools exist that generate client code from it in many languages. Your types now do three jobs: validation, documentation and conversion.

## What a request costs

One prediction takes the model 7 microseconds. When you measure the whole service next week, one copy of it will answer about 1,100 requests per second on the reference machine, which is 0.9 milliseconds per request. The model accounts for less than one percent of that. The rest is reading the request, parsing JSON, validating, converting and writing the response, all in Python.

That has a direct consequence for the design. A request that carries 100 jets costs little more than a request that carries one, and the reference service tagged 22,000 jets per second with batches of 100 against 1,100 one by one. This is why the API takes a list of jets from the start.

--- practice
@predict
A caller sends a POST to `/predict` with a jet of 15 numbers. Which status code comes back?
= 422
! The JSON is well-formed and a list of lists of floats, so pydantic accepts it, and your own check then raises `HTTPException(status_code=422)`. The first digit 4 says that the caller has to fix the request.

@predict
A caller types the address of `/predict` into a browser, which sends a GET. Which status code comes back?
= 405
! The path exists, but only for POST. The answer `405 Method Not Allowed` carries the header `allow: POST`. A path that doesn't exist at all gives 404.

@run
Before FastAPI calls your handler, the body is checked. Write that check by hand once. `status_for(body)` gets the parsed JSON body as a Python object and returns 200 if it is a dictionary with a key `jets` whose value is a non-empty list in which every jet is a list of exactly 16 items, and 422 otherwise.
```starter
def status_for(body):
    pass
```
```test
good = [0.5] * 16
print(status_for({"jets": [good]}), status_for({"jets": [good, good]}))
print(status_for({"jets": []}), status_for({"jet": [good]}))
print(status_for({"jets": [good, [1.0, 2.0]]}), status_for([good]))
print(status_for({"jets": "hello"}), status_for({"jets": [3.0]}))
```
= 200 200
= 422 422
= 422 422
= 422 422
```solution
def status_for(body):
    if not isinstance(body, dict) or "jets" not in body:
        return 422
    jets = body["jets"]
    if not isinstance(jets, list) or len(jets) == 0:
        return 422
    for jet in jets:
        if not isinstance(jet, list) or len(jet) != 16:
            return 422
    return 200
```
! `isinstance(x, list)` asks whether a value is a list. The order of the checks matters: asking for `body["jets"]` before knowing that `body` is a dictionary would raise an exception, and an exception in a service becomes a 500, which blames the service for the caller's mistake.

@run
Write `to_prediction(row)`. `row` is a list of five probabilities in the order of `CLASSES`. Return a dictionary with the key `label`, the class with the highest probability, and the key `probabilities`, a dictionary from each class to its probability rounded to four digits.
```starter
CLASSES = ["g", "q", "w", "z", "t"]

def to_prediction(row):
    pass
```
```test
p = to_prediction([0.00312, 0.00718, 0.00071, 0.98807, 0.00092])
print(p["label"], sorted(p))
print(" ".join("%s=%.4f" % (c, p["probabilities"][c]) for c in CLASSES))
print(to_prediction([0.5, 0.2, 0.1, 0.1, 0.1])["label"])
```
= z ['label', 'probabilities']
= g=0.0031 q=0.0072 w=0.0007 z=0.9881 t=0.0009
= g
```solution
CLASSES = ["g", "q", "w", "z", "t"]

def to_prediction(row):
    best = 0
    for i in range(len(row)):
        if row[i] > row[best]:
            best = i
    probabilities = {}
    for c, v in zip(CLASSES, row):
        probabilities[c] = round(v, 4)
    return {"label": CLASSES[best], "probabilities": probabilities}
```
! This is the loop at the end of the handler, without NumPy. `zip` walks through the class names and the probabilities together.

@local
Create the repository `jet-service` with `app/__init__.py` and the smallest service from the lesson in `app/main.py`. Start it with uvicorn and paste the complete output of the command below.
```
curl -i http://localhost:8000/healthz
```
min: 5
= 200 OK
= application/json
= "status"
! If `curl` says that the connection was refused, the server is not running or listens on another port. If uvicorn can't import `app.main`, you started it from the wrong folder: it must be the folder that contains `app`.

@local
Add the pydantic models, the lifespan function and the `/predict` endpoint. Save the jet from the lesson as `jet.json`, send it with `curl`, and paste the response. Then send a jet with 15 numbers and paste that response below the first.
min: 2
= "label"
= "probabilities"
= every jet needs 16 features
! With your own model the probabilities will differ a little from the lesson's. The label of this jet should still be `z`.

@local
Write `tests/test_api.py` with at least six tests: health, one jet, a batch of 50 jets, a jet of the wrong length, an empty list of jets, and a jet that contains a string. Run them with the command below and paste the output.
```
python -m pytest -q
```
min: 1
= passed
! An empty list and a string inside a jet are both refused by pydantic with a 422 before your function runs. Testing them is still worth it: the tests pin down the behaviour that callers rely on, and they fail if somebody loosens the model later.

@choice
Why does the test fixture use `with TestClient(app) as c:` instead of `c = TestClient(app)`?
- The `with` form is faster
- Without it the tests would need a running server
* The `with` block runs the lifespan function, which loads the model. Without it `state` is empty and every prediction fails
- It closes the port at the end
! The test client never opens a port. What the `with` adds is the start-up and shut-down of the app.

@choice
A caller gets the status code 503 from a service. What is the sensible reaction?
- Fix the request body, because 5xx means that it was malformed
* Wait a moment and try again, because 5xx means that the service failed and the request may be fine
- Switch from POST to GET
- Give up for good, because 503 is permanent
! The first digit says who has to act. With 4 it is the caller, and with 5 it is the service. A 503 in particular says "not right now".

@write
From memory: the pydantic model for the request body, and the first three lines of the handler, up to and including the check that every jet has 16 numbers.
min: 7
```solution
class PredictRequest(BaseModel):
    jets: list[list[float]] = Field(min_length=1, max_length=1024)


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    if any(len(jet) != N_FEATURES for jet in request.jets):
        raise HTTPException(
            status_code=422,
            detail=f"every jet needs {N_FEATURES} features")
```
! The type of the parameter is what makes FastAPI parse and validate the body. `any(...)` is true as soon as one jet has the wrong length.
--- recall
Q: What are the four parts of an HTTP request, and what does a response start with?
A: Method, path, headers and body. A response starts with the status code, followed by headers and a body.
Q: What do the status code families 2xx, 4xx and 5xx mean?
A: 2xx: it worked. 4xx: the caller made a mistake and must fix the request. 5xx: the service failed, and trying again later may work.
Q: Which status codes mean "no such path", "wrong method" and "content not acceptable"?
A: 404 Not Found, 405 Method Not Allowed and 422 Unprocessable Content.
Q: In FastAPI, what makes the framework parse and validate a JSON body?
A: A handler parameter whose type is a pydantic model. FastAPI reads the body, checks it against the model, and answers 422 by itself if it doesn't fit.
Q: Where does a FastAPI service load a model, and why there?
A: In the lifespan function, before the yield. It runs once at start-up, so the cost of loading is not paid for every request.
Q: What does uvicorn do, as opposed to FastAPI?
A: Uvicorn is the server: it owns the port and reads and writes the HTTP messages. FastAPI is the framework that routes each request to your function and validates it.
Q: How do you test a FastAPI app without a server?
A: With TestClient from fastapi.testclient, inside a with block so that the lifespan runs, and calls such as client.post("/predict", json=...).
Q: Why does the API accept a list of jets instead of one jet?
A: The fixed cost of a request, about a millisecond of HTTP and JSON work, dwarfs the 7 microseconds of the model. A batch shares that cost.

=== pj6 | proj | 18 | Project 4: a model service, from one process to a monitored cluster | p60
## What you are building

Project 3 ended with a file. Project 4 turns that file into a system that runs, survives failures, can be updated without anybody noticing, and tells you how it is doing. It takes three weeks and has three milestones:

- Week 18: the tagger as an HTTP service, with tests, packed into a container image.
- Week 19: a load generator of your own, then three copies of the service on a Kubernetes cluster on your laptop, updated to a new version under load without a single failed request, and deliberately broken in three ways to see what the cluster does.
- Week 20: metrics and an alert with Prometheus, and a latency report of the finished system.

Each of the three is a skill in its own right, and openlab projects ask for all of them: its summer projects are about computing infrastructure far more often than about physics analysis. What makes this project worth showing is that every claim in it is measured. "Zero failed requests during a rolling update" is a number from a run that anyone can repeat.

## The repository

Everything lives in one repository, `jet-service`:

```
jet-service/
  app/__init__.py
  app/main.py              the service
  model/jet_tagger.onnx    the exported model from Project 3
  tests/test_api.py
  requirements.txt         what the service needs to run
  requirements-dev.txt     what the tests need on top of that
  Dockerfile
  .dockerignore
  k8s/deployment.yaml      week 19
  k8s/service.yaml         week 19
  k8s/monitoring.yaml      week 20
  loadtest.py              week 19
  README.md
```

The model file has 32 kilobytes, so it can simply be committed. A model of several gigabytes would be stored elsewhere and fetched when the image is built.

## Milestone 1, step 1: the service

Build the service of the lesson on HTTP services, with one addition. `/healthz` should also say which copy of the service answered, because from next week there will be three:

```
POD = os.environ.get("HOSTNAME", "local")


@app.get("/healthz")
def healthz():
    return {"status": "ok", "pod": POD, "version": VERSION}
```

`HOSTNAME` is an environment variable that holds the name of the machine. Docker sets it to the identifier of the container, and Kubernetes to the name of the pod. On your laptop it may be missing, and then the value is `local`.

Add a second endpoint, `/readyz`, that answers 200 only when the model is loaded:

```
@app.get("/readyz")
def readyz():
    if "session" not in state:
        raise HTTPException(status_code=503, detail="model not loaded")
    return {"status": "ready"}
```

The two endpoints answer two different questions. `/healthz` says "the process is alive". `/readyz` says "send me requests". Next week Kubernetes asks both, and acts differently on each answer.

## Milestone 1, step 2: pinned requirements

`requirements.txt` lists what the service imports, each with an exact version:

```
fastapi==0.165.0
uvicorn==0.54.0
onnxruntime==1.29.0
numpy==2.5.3
prometheus_client==0.26.0
```

Those are the versions of the reference project. Use the ones you have installed: `pip freeze` prints every installed package with its version. Fixing the versions is called **pinning**, and it has one purpose: the image you build next month contains the same code as the image you tested today. Without it, `pip install fastapi` installs whatever is newest on the day of the build.

`prometheus_client` is for week 20, and it does no harm to install it now.

The test tools don't belong in the image. Put them into a second file, `requirements-dev.txt`, whose first line pulls in the first file:

```
-r requirements.txt
pytest
httpx
```

The CI workflow of Project 1 then works with one changed line, `pip install -r requirements-dev.txt`, followed by `python -m pytest -q`.

## Milestone 1, step 3: the image

```
FROM python:3.12-slim

WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/
COPY model/ model/

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

You know `FROM`, `WORKDIR`, `COPY`, `RUN` and `CMD` from the lesson on containers, and the order is the one you learned there: the packages, which rarely change, are installed before the code, which changes all the time, so that a rebuild after a code change takes a second. Four things are new.

- `--no-cache-dir` stops pip from keeping the downloaded packages. Inside an image they would only take up space.
- `RUN useradd --create-home appuser` creates an ordinary user, and `USER appuser` makes everything after it, including the running service, use that user. By default a container runs as `root`, the administrator. If an attacker finds a hole in the service, an ordinary user limits what they can do. Many shared clusters refuse containers that run as root. OpenShift, the flavour of Kubernetes that CERN uses to host web applications, does so by default.
- `EXPOSE 8000` is documentation: this image serves on port 8000. It opens nothing by itself.
- `--host 0.0.0.0` matters more than it looks. By default uvicorn listens on `127.0.0.1`, which means "only connections from this same machine". Inside a container, "this machine" is the container, so the service would be unreachable from outside. `0.0.0.0` means "listen on every network interface".

Next to the Dockerfile, a file `.dockerignore` lists what `COPY` should leave out, in the style of `.gitignore`:

```
__pycache__/
*.pyc
.git/
.venv/
tests/
*.log
```

Build the image and start a container:

```
docker build -t jet-service:0.1 .
docker run --rm -p 8000:8000 jet-service:0.1
```

`-t jet-service:0.1` names the image and gives it the tag `0.1`. `-p 8000:8000` connects port 8000 of your machine to port 8000 of the container. In a second terminal:

```
curl http://localhost:8000/healthz
```

```
{"status":"ok","pod":"8d4c3228afa2","version":"0.1"}
```

The pod name is now the identifier of the container. `docker run --rm jet-service:0.1 whoami` prints `appuser`, which confirms the user.

Always give an image a version tag, and build a new tag for every change. If you leave the tag out, Docker uses `latest`, and then nobody can say which code a running container holds. Next week's rolling update depends on two different tags.

## What the image contains

`docker history jet-service:0.1` lists the layers with their sizes. In the reference build:

- the base image `python:3.12-slim`: 134 MB
- the layer of `pip install`: 174 MB, most of it ONNX Runtime and NumPy
- your code and the model together: 0.1 MB

That adds up to 308 MB of files. Depending on its version, `docker images` reports that number or about 400 MB, because newer versions also count the compressed copy that they keep.

Your own work is a three-thousandth of the image. That is normal, and it is the reason why the choice of base image and of dependencies decides the size. The same service with PyTorch in place of ONNX Runtime would add more than 200 MB for the CPU version alone, which is one more reason for exporting the model.

## Milestone 2: on a cluster

The lessons on load testing and on Kubernetes in practice take you through it. What the repository must show at the end of week 19:

- `loadtest.py`, your own load generator, with the evidence of where it stops being a trustworthy instrument
- `k8s/deployment.yaml` with three replicas, a readiness and a liveness probe, resource requests and limits, a rolling-update strategy and a `preStop` hook, and `k8s/service.yaml`
- a rolling update from version 0.1 to 0.2 under load, with the number of failed requests, once with all safeguards and once without them
- three failure drills, each with what you did, what you saw and how many requests failed: a deleted pod, a killed process, and a release that can't start, rolled back with `kubectl rollout undo`
- the throughput with one replica and with three

## Milestone 3: observed and measured

The lesson on metrics takes you through it. At the end of week 20:

- the service exports a request counter, a counter of jets by predicted class and a latency histogram on `/metrics`
- Prometheus runs in the cluster and scrapes all three pods, and an alert fires when more than 5% of the requests are rejected
- a latency table of the finished system: requests per second, p50 and p99 at 1, 4, 16 and 64 connections, with the conditions it was measured under
- a comparison of the latency that the client sees with the latency that the service reports about itself, and an explanation of the difference

## Reference numbers

So that you can judge your own, here is what the reference project measured on one machine with four cores, with the load generator on the same machine. Yours will differ, and the pattern should not.

- one process, one connection at a time: 888 requests per second
- one process, 16 connections: about 1,100 requests per second, p50 14 ms
- four processes, 16 connections: 4,225 requests per second
- 100 jets in each request: 22,000 jets per second with one process
- on the cluster: 748 requests per second with one replica and 1,275 with three, at 16 connections
- rolling update under load: 9 seconds, and 0 failed requests in 25,830 with all safeguards and one retry in the client
- the same rollout without the probes and the `preStop` hook: 36 failed requests next to 18,806 successful ones

## The README

A stranger should be able to read the README in three minutes and know what the system does and how well. Give it these parts:

- one paragraph on what the service is, with an example request and response
- how to run it: locally, as a container, and on a kind cluster, each as a few commands that work when copied
- the results: the latency table, the rolling-update result, the failure drills, and the comparison of client-side and server-side latency
- the machine all of this was measured on
- what you would do next: three honest sentences

## Rules that make it a result

- Every number in the README comes from a run that the README tells the reader how to repeat.
- A failed request is reported as a failed request. If a run had three failures, write three and explain them.
- Name the machine, the number of cores and where the load generator ran.
- Tag the commit of each milestone: `v0.1` for the service in a container, `v0.2` for the cluster, `v1.0` for the finished project.

--- practice
@choice
Inside a container, uvicorn is started without `--host` and listens on `127.0.0.1:8000`. The container runs with `-p 8000:8000`. What does `curl http://localhost:8000/healthz` on your laptop get?
- The normal answer
* No answer: `curl` reports that the connection was reset, because the service only accepts connections from inside its own container
- A 404
- A 503
! `127.0.0.1` inside a container is the container itself. The port mapping delivers your request to the container's network interface, where nothing listens. `--host 0.0.0.0` makes the server listen on every interface.

@choice
Why does the Dockerfile create a user and switch to it?
- Python refuses to run as root
- It makes the image smaller
* A service that runs as an ordinary user gives an attacker who breaks into it far less power, and many shared clusters refuse containers that run as root
- So that the logs show a readable name
! Root inside a container is not root on the host by default, but it is a much shorter step. Least privilege is a habit: run with the rights you need and no more.

@choice
Why are the versions in `requirements.txt` pinned with `==`?
- pip requires it
* So that every build of the image installs the same code that was tested, whenever the build happens
- Pinned packages install faster
- To save disk space
! An unpinned build picks up whatever was released last night. A bug that appears "without any change" is very often an unpinned dependency.

@predict
The base image has 134 MB and the layer of `pip install` 174 MB. Your code and the model add 0.1 MB. You change one line in `app/main.py` and rebuild. How many megabytes does Docker have to build again, to one decimal place?
= 0.1
=| .1
=| 0,1
! Only the layers from `COPY app/ app/` onwards are rebuilt. The base image and the packages come from the cache, because nothing they depend on has changed. That is why the requirements are copied and installed first.

@local
Add `/readyz` and the pod name to your service, write the two requirements files, the Dockerfile and the `.dockerignore`, and build the image as `jet-service:0.1`. Start a container, and paste the output of the three commands below.
```
curl http://localhost:8000/healthz
docker run --rm jet-service:0.1 whoami
docker images jet-service
```
min: 4
= "pod"
= appuser
= jet-service
! If `curl` gets no answer although the container runs, check `--host 0.0.0.0` in the `CMD`. If the build can't find `requirements.txt`, you are running `docker build` from the wrong folder: the dot at the end is the folder whose files `COPY` can see.

@local
Send the jet of the lesson on HTTP services to the container and paste the response. Then stop the container with Ctrl+C and paste the last eight lines that it printed.
min: 3
= "label"
= POST /predict
! The log lines come from uvicorn inside the container. The last four show an orderly shutdown: on Ctrl+C the server stops accepting connections, finishes the requests in flight and runs the part of the lifespan function after the `yield`. Docker shows whatever the main process of a container prints, and `docker logs` shows it again later for a container that runs in the background.

@write
From memory: the Dockerfile for this service. It must install pinned requirements before copying the code, run as an ordinary user, and start uvicorn so that it is reachable from outside the container.
min: 9
```solution
FROM python:3.12-slim

WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/
COPY model/ model/

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
! Three things carry the meaning: requirements before code for the cache, `USER` for least privilege, and `--host 0.0.0.0` so that the port mapping has something to connect to.
--- recall
Q: What are the three milestones of Project 4?
A: An HTTP service in a container, three replicas on Kubernetes with a rolling update and failure drills, and monitoring with a load-test report.
Q: What is the difference between /healthz and /readyz?
A: /healthz says that the process is alive. /readyz says that it can take requests, for example that the model is loaded.
Q: Why must a server in a container listen on 0.0.0.0?
A: 127.0.0.1 accepts connections only from the same machine, and inside a container that is the container itself. 0.0.0.0 listens on every interface, so the port mapping can reach it.
Q: Why does the image run the service as an ordinary user?
A: Least privilege: a break-in gains far less than with root, and many clusters refuse root containers.
Q: What is pinning, and why do it?
A: Fixing every dependency to an exact version with ==, so that each build installs the code that was tested.
Q: Why give every image a version tag?
A: So that it is always clear which code a container runs. Rolling updates and rollbacks work by switching between tags.

=== sv2 | py | 18 | SQL with SQLite: asking a table questions | p50,p51
## Why a database, and why SQL

So far your data lived in files that a script reads from top to bottom. That works while one program owns the data. It stops working when several programs need the same data at once, when a crash in the middle of a write must not leave half a file, or when the question changes every day and nobody wants to write a new loop for each one.

A **database** is a program that stores data and answers questions about it. In a **relational** database the data sits in **tables** with named **columns**, and every **row** is one record. **SQL**, the Structured Query Language, is the language for asking. It is fifty years old and everywhere: behind most websites, in the bookkeeping of every experiment, in the systems that record which run was taken with which detector settings and which jobs processed which files.

SQL is **declarative**, like the RDataFrame of week 14 and the Kubernetes of next week. You describe the result you want, and the database works out how to get it. That is the idea to hold on to through this lesson: you never write a loop.

## A database in one file

Big databases such as PostgreSQL, MySQL and Oracle run as servers. **SQLite** is a complete SQL database that lives in a single file and needs no server, and it is built into Python as the module `sqlite3`. Nothing has to be installed. The SQL you learn with it carries over to the big ones, apart from small differences in spelling.

The data for this lesson is the file of 100,000 dimuon events from Project 1, so you already know what the answers should be.

## Create a table and fill it

```
import csv
import sqlite3
import sys

con = sqlite3.connect("dimuon.db")
con.execute("DROP TABLE IF EXISTS events")
con.execute("""
    CREATE TABLE events (
        run    INTEGER NOT NULL,
        event  INTEGER NOT NULL,
        pt1    REAL,
        eta1   REAL,
        q1     INTEGER,
        pt2    REAL,
        eta2   REAL,
        q2     INTEGER,
        mass   REAL
    )""")

rows = []
skipped = 0
with open(sys.argv[1], newline="") as f:
    for r in csv.DictReader(f):
        try:
            rows.append((int(r["Run"]), int(r["Event"]),
                         float(r["pt1"]), float(r["eta1"]), int(r["Q1"]),
                         float(r["pt2"]), float(r["eta2"]), int(r["Q2"]),
                         float(r["M"])))
        except ValueError:
            skipped += 1

with con:
    con.executemany(
        "INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", rows)

print("inserted", len(rows), "skipped", skipped)
con.close()
```

Run it as `python load.py Dimuon_DoubleMu.csv`. It prints `inserted 100000 skipped 0` and leaves a file `dimuon.db` of 6.5 MB.

Piece by piece:

- `sqlite3.connect("dimuon.db")` opens the file, creating it if needed, and returns a **connection**. Every statement goes through it with `con.execute(...)`.
- `CREATE TABLE` defines a table: its name, and for each column a name and a type. `INTEGER` is a whole number, `REAL` a floating-point number and `TEXT` a string. `NOT NULL` is a **constraint**, a rule that the database enforces: this column must always have a value. A missing value is called `NULL` in SQL.
- `DROP TABLE IF EXISTS` deletes the table if it is there, so that the script can be run again.
- SQL keywords are not case-sensitive. Writing them in capitals is a convention that makes queries easier to read.
- `INSERT INTO events VALUES (?, ?, ...)` adds one row. Each `?` is a **placeholder**, and `executemany` runs the statement once for every tuple in `rows`, putting the values of the tuple in the place of the question marks.
- `with con:` opens a **transaction**, which a section below explains. For now: either all 100,000 rows are stored or none.

For the rest of the lesson, a three-line helper runs a query and prints the rows of the result:

```
import sqlite3

con = sqlite3.connect("dimuon.db")

def show(sql, args=()):
    for row in con.execute(sql, args):
        print(row)
```

Every row comes back as a tuple. From here on the lesson shows the SQL on its own. Run each query as `show("...")`, with triple quotes if it spans several lines.

## SELECT: choosing columns and rows

Every question starts with `SELECT`. The simplest form names the columns you want and the table they come from:

```
SELECT run, event, mass FROM events LIMIT 3
```

```
(165617, 74601703, 17.4922)
(165617, 75100943, 11.5534)
(165617, 75587682, 9.1636)
```

`LIMIT 3` stops after three rows. Always add a limit while you explore, or you will print a hundred thousand lines. `SELECT *` means all columns.

`WHERE` keeps only the rows for which a condition is true, and `ORDER BY` sorts the result. The three heaviest pairs in the file:

```
SELECT run, event, mass FROM events
WHERE mass > 100
ORDER BY mass DESC
LIMIT 3
```

```
(166784, 31156771, 299.202)
(166784, 52070229, 270.535)
(166784, 8848370, 222.806)
```

`DESC` means descending, largest first. Without it the order is ascending. Conditions use `=`, `<>` for "not equal", `<`, `<=`, `>` and `>=`, and they combine with `AND`, `OR` and `NOT`. Note the single `=` for comparison, where Python has two. Three more forms come up all the time:

- `mass BETWEEN 80 AND 100` is true from 80 to 100, with both ends included.
- `run IN (165617, 166895)` is true if the run is one of the listed values.
- `mass IS NULL` finds missing values. Comparing with `= NULL` never matches anything, which surprises everybody once.

## Aggregates: one number from many rows

An **aggregate function** takes many rows and returns one value. `COUNT(*)` counts rows:

```
SELECT COUNT(*) FROM events WHERE mass BETWEEN 80 AND 100
```

```
(5174,)
```

That is the Z peak of Project 1: 5,174 pairs between 80 and 100 GeV. The other aggregates are `SUM`, `AVG` for the mean, `MIN` and `MAX`, and several can stand in one query. `ROUND(x, 3)` rounds to three digits:

```
SELECT COUNT(*), ROUND(AVG(mass), 3), ROUND(MIN(mass), 3),
       ROUND(MAX(mass), 3)
FROM events
WHERE mass BETWEEN 80 AND 100
```

```
(5174, 90.379, 80.033, 99.963)
```

`COUNT(DISTINCT run)` counts different values instead of rows. The file holds events from 15 runs.

## GROUP BY: one row for each group

The most useful clause of SQL is `GROUP BY`. It sorts the rows into groups that share a value, and the aggregates are then computed for each group separately. The number of events in each run, largest first:

```
SELECT run, COUNT(*) AS n
FROM events
GROUP BY run
ORDER BY n DESC
LIMIT 5
```

```
(160957, 16867)
(166895, 14512)
(163589, 11078)
(165617, 9415)
(167807, 9274)
```

`AS n` gives the count a name, called an **alias**, that the `ORDER BY` can use. This one query is the dictionary-counting loop from your first weeks of Python.

You can group by a computed value too. Dividing the mass by 10, cutting off the decimals with `CAST(... AS INTEGER)` and multiplying by 10 again gives the lower edge of a bin that is 10 GeV wide, so this is a histogram:

```
SELECT CAST(mass / 10 AS INTEGER) * 10 AS bin, COUNT(*)
FROM events
WHERE mass < 120
GROUP BY bin
ORDER BY bin
```

```
(0, 37243)
(10, 38967)
(20, 11772)
(30, 3815)
(40, 1388)
(50, 608)
(60, 364)
(70, 398)
(80, 2040)
(90, 3134)
(100, 144)
(110, 44)
```

The counts fall steadily and then jump at 80 and 90: the Z boson, found with one query. The two bins add up to the 5,174 from before.

`WHERE` filters rows before they are grouped. To filter the groups themselves, by a value that only exists after the grouping, SQL has `HAVING`. The runs with at least 400 Z candidates, and the mean mass in each:

```
SELECT run, COUNT(*) AS n, ROUND(AVG(mass), 2)
FROM events
WHERE mass BETWEEN 80 AND 100
GROUP BY run
HAVING COUNT(*) >= 400
ORDER BY n DESC
```

```
(173692, 829, 90.42)
(166895, 790, 90.53)
(167807, 757, 90.44)
(166784, 470, 90.38)
(166033, 437, 90.34)
(165617, 419, 90.51)
```

The mean mass agrees between the runs within 0.2 GeV. A check like this, a physical quantity that must not depend on the run, is exactly how a drifting calibration is found.

## The order in which a query is evaluated

A query is written in one order and evaluated in another, and knowing the second explains most error messages:

- `FROM` picks the table.
- `WHERE` throws away rows.
- `GROUP BY` forms the groups.
- `HAVING` throws away groups.
- `SELECT` computes the columns of the result.
- `ORDER BY` sorts, and `LIMIT` cuts.

That is why an aggregate can't appear in a `WHERE`: when the `WHERE` runs, no groups exist yet.

## Two tables: JOIN

Real databases have many tables, and questions often need two of them together. Make a second table with one row for each run. `CREATE TABLE ... AS SELECT` stores the result of a query as a new table:

```
CREATE TABLE runs AS
SELECT run, COUNT(*) AS n_events FROM events GROUP BY run
```

Now ask: which fraction of the events of each run are Z candidates? The count of Z candidates comes from `events`, and the total of the run from `runs`. A **join** puts the two tables side by side, matching each row of one with the rows of the other that fulfil a condition:

```
SELECT r.run, r.n_events, COUNT(*) AS n_z,
       ROUND(100.0 * COUNT(*) / r.n_events, 2) AS percent
FROM events AS e JOIN runs AS r ON e.run = r.run
WHERE e.mass BETWEEN 80 AND 100
GROUP BY r.run
ORDER BY percent DESC
LIMIT 4
```

```
(173692, 7122, 829, 11.64)
(173430, 2335, 264, 11.31)
(172952, 2087, 211, 10.11)
(167807, 9274, 757, 8.16)
```

`events AS e` and `runs AS r` give the tables short names, and `e.run` means "the column `run` of `e`". `ON e.run = r.run` is the matching condition: every event is paired with the one row of `runs` that has the same run number. After the join each row carries the columns of both tables, and the rest of the query works as before. The `100.0` with a decimal point is deliberate: dividing two integers in SQL gives an integer.

The result is a small discovery. In the latest runs, more than 11% of the pairs are Z candidates. Without the `LIMIT` you see the other end as well: in the earliest run, 160957, it is 2%. The Z boson did not change during 2011. A likely reason is the trigger: as the LHC delivered more collisions per second, the momentum thresholds for recording a muon pair were raised, and that removes far more low-mass pairs than Z bosons. The table can't prove that, and it tells you where to look. Conditions change from run to run, which is why experiments keep databases of them.

A join as above, also written `INNER JOIN`, keeps only rows that find a partner. A `LEFT JOIN` keeps every row of the left table and fills the columns of a missing partner with `NULL`.

## Parameters, never string formatting

The values in a query usually come from a variable. The safe way is the placeholder you saw in the `INSERT`:

```
low, high = 3.0, 3.2
show("SELECT COUNT(*) FROM events WHERE mass BETWEEN ? AND ?",
     (low, high))
```

```
(7283,)
```

That is the J/ψ peak. The tempting way is to build the query text yourself, with an f-string. Don't. Suppose the run number comes from a web form, and somebody types `0 OR 1=1` into it:

```
run_text = "0 OR 1=1"
show(f"SELECT COUNT(*) FROM events WHERE run = {run_text}")
show("SELECT COUNT(*) FROM events WHERE run = ?", (run_text,))
```

```
(100000,)
(0,)
```

In the first query the text became part of the SQL: `WHERE run = 0 OR 1=1` is true for every row. The visitor has rewritten your query. This is **SQL injection**, for decades one of the commonest ways of breaking into websites, and with a `DELETE` instead of a `SELECT` it destroys data. In the second query the database treats the value as a value and nothing else, and no run has that number. Use placeholders for every value, always.

## Transactions: all or nothing

A **transaction** is a group of changes that the database applies completely or not at all. In Python, `with con:` starts one. If the block ends normally the changes are stored for good, which is called a **commit**. If an exception leaves the block, everything the block did is undone, which is called a **rollback**.

```
con.execute(
    "CREATE TABLE notes (run INTEGER NOT NULL, text TEXT NOT NULL)")
try:
    with con:
        con.execute("INSERT INTO notes VALUES (?, ?)",
                    (165617, "good run"))
        con.execute("INSERT INTO notes VALUES (?, ?)",
                    (166895, None))
except sqlite3.IntegrityError as e:
    print("error:", e)
show("SELECT COUNT(*) FROM notes")
```

```
error: NOT NULL constraint failed: notes.text
(0,)
```

The second insert breaks the `NOT NULL` rule, because Python's `None` becomes `NULL`. The first insert was fine, and it is gone too: the table has zero rows. Imagine the same with a bank transfer, or with marking a job as finished and recording its output file. Half of such a pair is worse than none, and a transaction guarantees that half never happens, even if the power fails in the middle.

## Indexes: how the database finds rows

How does the database find the events of one run? Without help it reads every row and checks, which is called a **scan**. `EXPLAIN QUERY PLAN` in front of a query shows what the database intends to do:

```
EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events WHERE run = 165617
```

```
(3, 0, 216, 'SCAN events')
```

Only the text at the end matters. An **index** is a second structure that the database keeps beside the table: the values of one column in sorted order, each with a pointer to its row. In sorted data a value is found by repeated halving, the binary search of week 5, in about 17 steps for 100,000 rows.

```
CREATE INDEX idx_events_run ON events(run)
```

After that the plan reads:

```
(3, 0, 53, 'SEARCH events USING COVERING INDEX idx_events_run (run=?)')
```

`SEARCH` in place of `SCAN`. Running the query 200 times took 874 milliseconds before and 72 after in the reference run, twelve times faster, and on tables with billions of rows the same change is the difference between a millisecond and an hour. **Covering** means that the index alone holds everything this query needs, so that the table itself isn't touched.

An index is not free. It takes space, here about a megabyte, and every insert must update it. The rule: create indexes for the columns that your frequent queries filter or join on, and no others. When a query is slow, look at its plan before anything else.

## Where you will meet SQL

A summer project rarely starts with designing a database. It very often includes reading from one: a table of runs, of files, of jobs, of measurements. With `SELECT`, `WHERE`, `GROUP BY`, a join and the habit of looking at the plan, you can answer most questions on your first day. SQL comes back once more in this project: an optional task in week 20 keeps the results of your load tests in a table instead of in a text file.

--- practice
@predict
A table `hits` has four rows, with the values 80, 90, 100 and 110 in the column `mass`. How many rows does `SELECT COUNT(*) FROM hits WHERE mass BETWEEN 80 AND 100` count?
= 3
! `BETWEEN` includes both ends, so 80, 90 and 100 qualify. In Python you would write `80 <= mass <= 100`.

@predict
The table `events` has 100,000 rows from 15 runs, and the table `runs` has one row for each of the 15 runs. How many rows does `SELECT COUNT(*) FROM events AS e JOIN runs AS r ON e.run = r.run` count?
= 100000
=| 100,000
=| 100 000
! Every event finds exactly one partner in `runs`, so the join has one row for each event. If `runs` listed a run twice, every event of that run would appear twice, which is the usual reason for counts that are too high after a join.

@run
Write in Python what the database does for `SELECT run, COUNT(*) AS n FROM events GROUP BY run HAVING COUNT(*) >= minimum ORDER BY n DESC, run`. `runs` is a list with the run number of every event. Return a list of `(run, n)` tuples: only runs with at least `minimum` events, sorted by `n` from large to small, and by run number where the counts are equal.
```starter
def group_having(runs, minimum):
    pass
```
```test
data = [7, 3, 7, 5, 3, 7, 9, 5, 3, 1]
print(group_having(data, 1))
print(group_having(data, 2))
print(group_having(data, 4), group_having([], 1))
```
= [(3, 3), (7, 3), (5, 2), (1, 1), (9, 1)]
= [(3, 3), (7, 3), (5, 2)]
= [] []
```solution
def group_having(runs, minimum):
    counts = {}
    for r in runs:
        counts[r] = counts.get(r, 0) + 1
    kept = [(r, n) for r, n in counts.items() if n >= minimum]
    kept.sort(key=lambda pair: (-pair[1], pair[0]))
    return kept
```
! Counting into a dictionary is the `GROUP BY`, the condition in the list comprehension is the `HAVING`, and the sort is the `ORDER BY`. The key `(-n, run)` sorts by count from large to small and then by run number. Six lines of Python against one line of SQL, and the database also knows how to do it for a table that doesn't fit into memory.

@local
Write `load.py` from the lesson and load the dimuon file of Project 1 into `dimuon.db`. Then run the query that counts the pairs in the Z window and gives their mean, smallest and largest mass, each rounded to three digits. Paste the output of both.
min: 2
= 100000
= 5174
= 90.379
! If the count is right and the mean is not, check that the window is `BETWEEN 80 AND 100` and that you rounded with `ROUND(AVG(mass), 3)`.

@local
Write the query that lists, for the Z window, every run with at least 400 candidates together with its count and its mean mass, largest count first. Paste the query and its output.
min: 5
= GROUP BY
= HAVING
= 173692
= 829
! The filter on the mass belongs in `WHERE`, because it concerns single rows. The filter on the count belongs in `HAVING`, because the count exists only after the grouping.

@local
Print the query plan of `SELECT COUNT(*) FROM events WHERE run = 165617`, create the index on `run`, and print the plan again. Measure 200 executions of the query before and after with `time.perf_counter()`. Paste the two plans and the two times.
min: 4
= SCAN
= USING COVERING INDEX
! Older versions of SQLite print `SCAN TABLE events`. The times depend on your machine, and the ratio should be around ten or more.

@choice
What is the difference between `WHERE` and `HAVING`?
- `HAVING` is the older spelling of `WHERE`
- `WHERE` works on numbers and `HAVING` on text
* `WHERE` filters rows before they are grouped, and `HAVING` filters groups after the aggregates are computed
- `HAVING` is faster because it uses the index
! A condition on a single row, such as a mass window, goes into `WHERE`. A condition on an aggregate, such as a count of at least 400, can only go into `HAVING`.

@choice
A script builds its query with `f"SELECT * FROM users WHERE name = '{name}'"`, where `name` comes from a web form. What is wrong?
- f-strings are slower than placeholders
- The query can't use an index
* Whatever the visitor types becomes part of the SQL, so the visitor can change what the query does. Values belong in placeholders
- Nothing, as long as the name is short
! That is SQL injection. With a placeholder, `WHERE name = ?`, the database never interprets the value as SQL.

@write
From memory: the query that lists the five runs with the most events, with the number of events in each, largest first.
min: 4
```solution
SELECT run, COUNT(*) AS n
FROM events
GROUP BY run
ORDER BY n DESC
LIMIT 5
```
! `GROUP BY run` makes one row for each run, `COUNT(*)` counts the events in each group, and the alias `n` lets the `ORDER BY` refer to the count.

@choice
Inside `with con:`, the first of two inserts succeeds and the second raises an exception. What is in the table afterwards?
- The first row, because it was inserted before the error
* Neither row. The transaction is rolled back as a whole
- Both rows, with NULL in place of the bad value
- The table is deleted
! A transaction is all or nothing. The `with` block commits when it ends normally and rolls back when an exception leaves it.
--- recall
Q: What do WHERE, GROUP BY, HAVING and ORDER BY each do in a query?
A: WHERE keeps the rows that fulfil a condition. GROUP BY sorts rows into groups, with one result row each. HAVING keeps the groups that fulfil a condition on an aggregate. ORDER BY sorts the result.
Q: In which order is a query evaluated?
A: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.
Q: Name the five aggregate functions and what COUNT(DISTINCT x) does.
A: COUNT, SUM, AVG, MIN and MAX. COUNT(DISTINCT x) counts the different values of x instead of the rows.
Q: What does a JOIN do, and what is the ON for?
A: It puts two tables side by side. ON gives the matching condition, usually that a column of one equals a column of the other.
Q: How do you put a Python value into a query, and why that way?
A: With a ? placeholder and a tuple of values. Building the text with an f-string lets the value be interpreted as SQL, which is SQL injection.
Q: What is a transaction?
A: A group of changes that is applied completely, with a commit, or not at all, with a rollback. In Python's sqlite3, a with block on the connection is one.
Q: What is an index, and what does it cost?
A: The sorted values of a column with pointers to the rows, so that a value is found by binary search instead of a scan. It costs disk space and makes every insert a little slower.
Q: How do you see whether a query uses an index?
A: Put EXPLAIN QUERY PLAN in front of it. SCAN means every row is read, and SEARCH ... USING INDEX means the index is used.

=== sv3 | py | 18 | Concurrency in Python: threads, processes, asyncio and the GIL | p52,p53
## Several things at once

A service has to answer many callers at the same time, and the program that tests it has to send many requests at the same time. Both need **concurrency**: making progress on several tasks during the same stretch of time.

In week 13 you used threads in C++ to make a computation faster, and four threads on four cores gave you nearly four times the speed. Python has threads too, plus two more tools, and they behave differently from what C++ taught you. Which one helps depends on a single question: what is the program waiting for?

## Two kinds of slow

- A task is **CPU-bound** when the processor is busy the whole time: counting primes, looping over events, multiplying matrices. It gets faster only if more cores work on it.
- A task is **I/O-bound** when it spends its time waiting for something outside the program: an answer from the network, a disk, a database. I/O stands for input and output. During the wait the processor has nothing to do, and the task gets faster if other work, or other waits, can go on in the meantime.

A service that calls a database is I/O-bound. A load generator is I/O-bound: it sends a request and waits. Your tagger is CPU-bound for seven microseconds at a time.

## Experiment 1: computing in threads

Count the primes below 200,000 four times: one after another, in four threads, and in four processes.

```
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def is_prime(n):
    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            return False
    return True


def count_primes(limit):
    return sum(1 for n in range(2, limit) if is_prime(n))


if __name__ == "__main__":
    jobs = [200_000] * 4

    start = time.perf_counter()
    results = [count_primes(n) for n in jobs]
    serial = time.perf_counter() - start
    print(f"one after another  {serial:.2f} s  {results[0]} primes")

    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(count_primes, jobs))
    threads = time.perf_counter() - start
    print(f"4 threads          {threads:.2f} s"
          f"  speed-up {serial / threads:.2f}")

    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(count_primes, jobs))
    processes = time.perf_counter() - start
    print(f"4 processes        {processes:.2f} s"
          f"  speed-up {serial / processes:.2f}")
```

A **pool** is a group of workers that wait for jobs. `ThreadPoolExecutor(max_workers=4)` creates four threads, and `pool.map(count_primes, jobs)` hands each job to a free worker and returns the results in the order of the jobs. The `with` block waits until all of them are done. `ProcessPoolExecutor` has the same interface and starts four separate Python processes in place of threads.

On the reference machine, with four cores and Python 3.13:

```
one after another  0.99 s  17984 primes
4 threads          1.11 s  speed-up 0.89
4 processes        0.32 s  speed-up 3.10
```

Four threads were slower than no threads at all.

## The GIL

The standard Python interpreter, called CPython, has a **global interpreter lock**, the GIL. It is a mutex, like the ones of week 13, and a thread must hold it to execute Python code. So at any moment exactly one thread runs Python, however many cores the machine has. The four threads of the experiment took turns on one core, and the switching cost a little extra.

The lock exists because it keeps the interpreter simple and fast for programs with one thread, and it protects the interpreter's own bookkeeping. Since version 3.13 there is an optional build of Python without it, called free-threaded. The standard build, which is the one you almost certainly have, still has the GIL.

**Processes** get around it. Each process is a separate copy of the interpreter with its own memory and its own GIL, so four processes really run on four cores: 3.1 times faster here. The price is that processes share nothing. The arguments of every job and its result are converted to bytes, sent to the other process and rebuilt there, and starting a process takes some hundredths of a second. Processes pay off for large pieces of work and not for millions of tiny ones.

The line `if __name__ == "__main__":` is required with process pools. On Windows and macOS every worker process starts by importing your script, and without that guard each worker would create a pool of its own, without end.

## Experiment 2: waiting in threads

Now a task that waits. `time.sleep(0.2)` stands for a request that takes 0.2 seconds to be answered.

```
import time
from concurrent.futures import ThreadPoolExecutor


def fetch(i):
    time.sleep(0.2)
    return i * i


start = time.perf_counter()
results = [fetch(i) for i in range(20)]
print(f"one after another  {time.perf_counter() - start:.2f} s")

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=20) as pool:
    results = list(pool.map(fetch, range(20)))
print(f"20 threads         {time.perf_counter() - start:.2f} s")
```

```
one after another  4.00 s
20 threads         0.21 s
```

Twenty waits of 0.2 seconds take 4 seconds in a row and 0.2 seconds side by side. A thread that waits gives up the GIL, so the other nineteen can start their own waits. For I/O-bound work, threads in Python work very well.

## Experiment 3: C code releases the GIL

There is a second case in which threads help. Libraries such as NumPy and ONNX Runtime do their heavy work in C and C++, and they release the GIL while they do it. Running the tagger on eight chunks of 200,000 jets:

```
one after another  0.49 s  1600000 jets
4 threads          0.19 s  speed-up 2.52
```

The Python code only hands the arrays over. The arithmetic happens outside the interpreter, in parallel. This is the reason a `def` handler in FastAPI's thread pool is the right choice for your `/predict`: several predictions can run at the same moment.

## asyncio: many waits in one thread

The third tool does concurrency without threads. A function defined with `async def` is a **coroutine**: a function that can pause in the middle and continue later. The places where it may pause are marked with `await`.

```
import asyncio
import time


async def fetch(i):
    await asyncio.sleep(0.2)
    return i * i


async def main():
    return await asyncio.gather(*[fetch(i) for i in range(20)])


start = time.perf_counter()
results = asyncio.run(main())
print(f"asyncio            {time.perf_counter() - start:.2f} s", results[:4])
```

```
asyncio            0.20 s [0, 1, 4, 9]
```

What happens here needs four sentences.

- Calling `fetch(3)` does not run the function. It creates a coroutine object, a task that is ready to be run.
- `asyncio.run(main())` starts the **event loop**, a scheduler that runs coroutines in a single thread, and runs `main` in it.
- `asyncio.gather(...)` takes several coroutines, runs them concurrently and returns their results as a list in the same order. The star in front of the list unpacks it into separate arguments.
- `await` means: "this will take a while, so pause me here and run somebody else". The loop runs the first `fetch` until its `await`, then the second, and so on. After 0.2 seconds all twenty waits are over and each coroutine continues.

There is only one thread, and exactly one coroutine runs at any moment. They take turns at the `await` points and nowhere else.

Why have this in addition to threads? Every thread needs memory of its own and the operating system has to switch between threads. A coroutine is a small Python object. A program with ten thousand open connections is ordinary with asyncio and painful with ten thousand threads. Servers are exactly such programs, and uvicorn is built on asyncio.

## The trap: blocking the loop

The single thread is also the weakness. If a coroutine does something slow without `await`, nobody else can run during that time:

```
async def bad(i):
    time.sleep(0.2)
    return i * i
```

Twenty of these under `gather` take 4.00 seconds, exactly as if they ran in a row, because `time.sleep` never gives control back to the loop. The same happens with a long computation and with any library call that waits without being awaited. In a server, one such call freezes every other request.

There are two cures. Use the version of the library that is written for asyncio: `asyncio.sleep` for `time.sleep`, and for HTTP requests a client such as `httpx.AsyncClient`. Or hand the blocking function to a thread and await the thread:

```
async def in_thread(i):
    return await asyncio.to_thread(fetch, i)
```

Here `fetch` is the ordinary function from experiment 2. Twenty of these took 0.60 seconds on the reference machine and not 0.20, because the pool behind `to_thread` has a limited number of threads: the number of cores plus 4, and never more than 32. On four cores that is 8, so twenty waits go through in three rounds.

## Limiting concurrency

Twenty requests at once are polite. Twenty thousand at once can knock a service over. A **semaphore** is a counter that lets only a fixed number of tasks through at a time:

```
async def limited(i, gate):
    async with gate:
        await asyncio.sleep(0.2)
        return i * i


async def main():
    gate = asyncio.Semaphore(4)
    return await asyncio.gather(*[limited(i, gate) for i in range(20)])
```

`async with gate:` waits until fewer than four tasks are inside the block, and then enters. Twenty waits with at most four at a time take five rounds: 1.00 seconds, as measured. The "concurrency" setting of a load generator is exactly this number.

## Shared data

Threads share memory in Python as in C++. The GIL protects the interpreter, and it does not protect your data: an update that takes several steps, such as reading a value, changing it and writing it back, can be interrupted between the steps by another thread. The tools are the ones you know: `lock = threading.Lock()` and `with lock:` around the update.

Better still, avoid sharing. Give every task its input as arguments and take its output as the return value, as `pool.map` does. Nothing is shared and nothing needs a lock.

With asyncio the question is simpler. A coroutine can only be interrupted at an `await`, so the code between two awaits always runs as one piece. Processes share nothing to begin with.

## Choosing

- Waiting for the network or the disk, with a handful of tasks: threads. Existing blocking code works unchanged.
- Waiting, with hundreds or thousands of connections: asyncio.
- Computing in pure Python: processes, or better, move the loop into NumPy or C++.
- Computing inside a C library that releases the GIL: threads are fine.

## Back to your service

All three tools meet in the service of this week.

- Uvicorn runs an asyncio event loop that accepts connections and reads requests.
- A handler written with `def` is handed to a pool of 40 threads, so a slow handler does not block the loop. A handler written with `async def` runs on the loop itself, and is correct only if everything slow inside it is awaited.
- For more computing power than one process can give, start more processes. `uvicorn app.main:app --workers 4` starts four, and the reference service went from about 1,100 to 4,225 requests per second with 16 connections. On Kubernetes you leave it at one process and start more copies of the container, which is next week.

--- practice
@predict
Twenty downloads wait 0.2 seconds each for their answer. How many seconds do they take one after another?
= 4
=| 4.0
=| 4.00
! Twenty times 0.2. Nothing overlaps.

@predict
The same twenty downloads run under `asyncio.gather`, with a semaphore that lets four through at a time. How many seconds do they take?
= 1
=| 1.0
=| 1.00
! Four at a time means five rounds of 0.2 seconds.

@predict
The same twenty waits are sent to threads with `asyncio.to_thread`, on a machine whose pool has 8 threads. How many seconds do they take?
= 0.6
=| 0.60
=| .6
! Eight, eight and four: three rounds of 0.2 seconds. The reference run measured 0.60.

@run
Write `rounds_time(n, wait_ms, limit)`: the time in milliseconds that `n` waits of `wait_ms` each need when at most `limit` of them run at the same time.
```starter
def rounds_time(n, wait_ms, limit):
    pass
```
```test
print(rounds_time(20, 200, 1), rounds_time(20, 200, 20))
print(rounds_time(20, 200, 4), rounds_time(20, 200, 8))
print(rounds_time(1, 200, 4), rounds_time(0, 200, 4))
```
= 4000 200
= 1000 600
= 200 0
```solution
def rounds_time(n, wait_ms, limit):
    rounds = (n + limit - 1) // limit
    return rounds * wait_ms
```
! `(n + limit - 1) // limit` is the number of rounds, rounded up, without floating-point numbers. The three lines of output are the experiments of the lesson: in a row and all at once, the semaphore of 4, and the thread pool of 8.

@choice
A pure-Python loop that takes 1 second is run in four threads on four cores, once in each thread. How long does it take, roughly?
- 0.25 seconds
- 1 second
* 4 seconds, or a little more
- It depends on the operating system
! Only the thread that holds the GIL runs Python code, so the four loops share one core and take as long as four in a row. The lesson measured 1.11 seconds for four jobs that took 0.99 in a row.

@choice
A coroutine calls `time.sleep(2)` in a server built on asyncio. What happens?
- Only that request is delayed by 2 seconds
* Every request is frozen for 2 seconds, because the single thread of the event loop is blocked
- The server starts a new thread for it by itself
- An exception is raised
! The loop can only switch at an `await`. A blocking call holds the one thread, and every other coroutine waits.

@local
Run experiment 1 on your machine. Paste the three lines of output, and add a line with your Python version and the number of cores.
min: 4
= speed-up
= primes
! Expect a speed-up near 1 or below for the threads, and for the processes a speed-up somewhat below your number of cores. If the threads give you a real speed-up, you are running a free-threaded build of Python, and that is worth a note.

@local
Write the asyncio version with twenty waits of 0.2 seconds. Run it three ways and print one line each, starting with the words `gather`, `blocking` and `semaphore`: all at once with `asyncio.sleep`, all at once with `time.sleep` inside the coroutine, and with `asyncio.sleep` under a semaphore of 4. Paste the output.
min: 3
= gather
= blocking
= semaphore
! The three times should be near 0.2, 4.0 and 1.0 seconds. If the blocking version is fast, you have probably awaited `asyncio.sleep` in it.

@choice
You must fetch 5,000 small files from a web server as fast as the server allows. Which tool fits best?
- A process pool with 5,000 processes
- A plain loop, because the GIL forbids anything else
* asyncio with an async HTTP client and a semaphore that limits the open connections
- A thread pool with 5,000 threads
! The work is waiting, and there is a lot of it. asyncio handles thousands of waits in one thread, and the semaphore keeps you from overloading the server. A thread pool of a sensible size, such as 32, would also work.

@write
A colleague has a slow loop in pure Python and proposes to speed it up with four threads. Explain in your own words why that won't work, and name two things that would.
min: 40
```solution
In standard Python a thread has to hold the global interpreter lock to run Python code, so only one thread runs at any moment and four threads share a single core. The loop would take just as long, or a little longer because of the switching.

Two things work. A process pool gives every worker its own interpreter and its own lock, so four processes use four cores, as long as the pieces of work are large enough to justify copying the data between processes. Or the loop is moved out of Python into NumPy or C++, which run compiled code and can release the lock.
```
! The key facts: one thread at a time runs Python, processes have separate locks, and compiled libraries work outside the interpreter.
--- recall
Q: What is the difference between CPU-bound and I/O-bound work?
A: CPU-bound work keeps the processor busy and gets faster only with more cores. I/O-bound work waits for the network, a disk or a database, and gets faster when the waits overlap.
Q: What is the GIL, and what follows from it?
A: The global interpreter lock of CPython. A thread must hold it to run Python code, so only one thread runs Python at a time and threads don't speed up pure-Python computation.
Q: When do threads help in Python?
A: For waiting, because a waiting thread releases the GIL, and for work inside C libraries such as NumPy and ONNX Runtime, which release it too.
Q: What do processes cost?
A: They share nothing, so arguments and results are copied between them, and starting them takes time. They pay off for large pieces of work.
Q: What do async def, await and asyncio.gather do?
A: async def defines a coroutine, a function that can pause. await marks a pause point where the event loop may run other coroutines. gather runs several coroutines concurrently and returns their results in order.
Q: What must never happen inside a coroutine?
A: A blocking call without await, such as time.sleep or a long computation. It freezes the event loop and every other task with it.
Q: How do you call a blocking function from asyncio code?
A: With await asyncio.to_thread(function, arguments), which runs it in a thread pool, or by using an async version of the library.
Q: How does FastAPI run def handlers and async def handlers?
A: A def handler runs in a pool of threads, so it may block. An async def handler runs on the event loop and must await everything slow.

=== sy6 | sys | 19 | Load testing: throughput, latency and trusting your instrument | p59
## Two numbers

A service is judged by two numbers, and they answer different questions.

- **Throughput** is how much work the service gets done: requests per second. It answers "how many callers can it serve?".
- **Latency** is how long one request takes, measured where the caller sits: from sending the request to holding the response. It answers "how long does each caller wait?".

In week 17 you measured the latency of the model alone, in microseconds, and reported it as percentiles: the p50 for the typical case and the p99 for the tail. The same rules hold here. What is new is that the two numbers now depend on a third: how many callers arrive at the same time. A service can be quick for one caller and unusable for a hundred, and the only way to know is to send a hundred.

A **load test** does that. It needs a tool, the **load generator**, and this lesson has you write one, because a tool you wrote is a tool you understand. Then it shows you how your tool lies, which is the most useful thing in the lesson.

## How a load generator works

The simplest design is the **closed loop**. The generator plays a fixed number of users. Each user sends a request, waits for the response, and immediately sends the next. The number of users is the **concurrency**: how many requests are under way at any moment.

Each user needs a **connection**, an open channel between two programs over the network. Opening one costs a round trip before the first byte of the request can be sent, so clients keep a connection open and send many requests through it, one after another. HTTP calls this **keep-alive**, and it is the default for every serious client.

## Your own generator

It has four parts: read the arguments, prepare the requests, run the users, report. You need the test jets as a file first. In your tagger project, save a thousand raw jets of the test set with `np.save("jets1000.npy", X_test[:1000])`, and copy the file into `jet-service`.

```
"""A closed-loop load generator.

python loadtest.py URL CONNECTIONS SECONDS [JETS_PER_REQUEST] [RETRIES]
"""
import asyncio
import collections
import json
import sys
import time

import httpx
import numpy as np

url = sys.argv[1]
connections = int(sys.argv[2])
seconds = float(sys.argv[3])
batch = int(sys.argv[4]) if len(sys.argv) > 4 else 1
retries = int(sys.argv[5]) if len(sys.argv) > 5 else 0

jets = np.load("jets1000.npy")
payloads = [json.dumps({"jets": jets[i:i + batch].tolist()})
            for i in range(0, 200, batch)]
headers = {"Content-Type": "application/json"}


async def send(client, payload):
    for attempt in range(retries + 1):
        try:
            return await client.post(url, content=payload, headers=headers)
        except httpx.TransportError:
            if attempt == retries:
                raise


async def user(client, deadline, latencies, errors):
    i = 0
    while time.perf_counter() < deadline:
        start = time.perf_counter()
        try:
            r = await send(client, payloads[i % len(payloads)])
            if r.status_code == 200:
                latencies.append(time.perf_counter() - start)
            else:
                errors[f"status {r.status_code}"] += 1
        except httpx.HTTPError as e:
            errors[type(e).__name__] += 1
        i += 1


async def main():
    latencies, errors = [], collections.Counter()
    limits = httpx.Limits(max_connections=connections)
    async with httpx.AsyncClient(limits=limits, timeout=10.0) as client:
        start = time.perf_counter()
        deadline = start + seconds
        await asyncio.gather(*[user(client, deadline, latencies, errors)
                               for _ in range(connections)])
        elapsed = time.perf_counter() - start
    ms = np.array(latencies) * 1000
    print(f"conn {connections:3d}  ok {len(ms):6d}"
          f"  err {sum(errors.values()):3d}"
          f"  {len(ms) / elapsed:5.0f} req/s"
          f"  p50 {np.percentile(ms, 50):7.2f} ms"
          f"  p99 {np.percentile(ms, 99):7.2f} ms")
    if errors:
        print("errors:", dict(errors))


asyncio.run(main())
```

It is the asyncio of last week put to work.

- **Arguments.** `sys.argv` is the list of words on the command line. The last two are optional, and `x if condition else y` picks a default when they are missing.
- **Payloads.** The request bodies are built once, before the clock starts, from the first 200 jets, so that building JSON does not count as latency. With `batch` set to 1 that gives 200 different bodies with one jet each.
- **`user`** is one simulated user: until the deadline it sends, waits and measures, over and over. Only successful requests enter the list of latencies. Everything else is counted in `errors` by its kind. `collections.Counter` is a dictionary that starts every count at zero.
- **`send`** sends one request and repeats it up to `retries` times if the connection breaks. `httpx.TransportError` covers the failures in which no response arrived at all. With the default of zero retries, the first failure is passed on with `raise`. The next lesson shows what the retry is for.
- **`main`** creates one HTTP client for everybody, limited to as many connections as there are users, starts the users with `gather`, and reports. The timeout of 10 seconds makes a request that hangs count as an error.
- **The report.** `np.percentile(ms, 99)` is the p99. NumPy interpolates between neighbouring values where the nearest-rank rule of week 17 picks one of them, and with thousands of values the two agree.

`httpx` is an HTTP client library with an asyncio interface, which the blocking `requests` library doesn't have. You installed it for the tests.

## First measurements

Start the service as one process with `uvicorn app.main:app --port 8000`, and in a second terminal run the generator for ten seconds at four levels of concurrency:

```
python loadtest.py http://localhost:8000/predict 1 10
```

On the reference machine, with service and generator sharing four cores:

```
conn   1  ok   5842  err   0    584 req/s  p50    1.64 ms  p99    2.98 ms
conn   4  ok   9247  err   0    924 req/s  p50    4.21 ms  p99    7.76 ms
conn  16  ok   7520  err   0    751 req/s  p50   12.16 ms  p99  112.81 ms
conn  64  ok   2946  err   0    291 req/s  p50  142.91 ms  p99 1094.78 ms
```

From 1 to 4 connections the throughput rises. Then it falls, and at 64 connections the service handles a third of what it managed at 4, with a p99 above one second. It looks as if the service collapses under load.

It doesn't. Before you believe a surprising measurement, check the instrument.

## Check your instrument

**ab**, the Apache benchmark tool, is a load generator written in C that has shipped with the Apache web server for decades. On Ubuntu it is in the package `apache2-utils`, and macOS has it installed. Run it against the same service:

```
ab -n 20000 -c 16 -p jet.json -T application/json \
   http://localhost:8000/predict
```

`-n` is the total number of requests, `-c` the concurrency, `-p` the file with the body of a POST and `-T` its content type. The part of the output that matters:

```
Concurrency Level:      16
Time taken for tests:   17.920 seconds
Complete requests:      20000
Failed requests:        0
Requests per second:    1116.06 [#/sec] (mean)
Time per request:       14.336 [ms] (mean)

Percentage of the requests served within a certain time (ms)
  50%     14
  90%     17
  99%     21
 100%     48 (longest request)
```

In a series over the four levels, `ab` measured this on the same machine in the same minutes:

- 1 connection: 888 requests per second, p50 1 ms, p99 2 ms
- 4 connections: 919 requests per second, p50 4 ms, p99 7 ms
- 16 connections: 1,125 requests per second, p50 14 ms, p99 21 ms
- 64 connections: 1,203 requests per second, p50 52 ms, p99 78 ms

The run with 16 connections gave 1,125 here and 1,116 in the output above. Repeat a measurement and the last digits move, which is a reason to quote two digits and not six.

At 64 connections the Python generator reported 291 requests per second and `ab` reported 1,203, against the very same service. The service never collapsed. The generator did.

The evidence is one command away. The shell's `time` prints how much processor time a program used: `real` is the time on the wall clock, and `user` plus `sys` is the time the processor worked for the program.

```
time python loadtest.py http://localhost:8000/predict 64 10
```

```
real    0m10.410s
user    0m10.114s
sys     0m0.477s
```

Ten seconds of processor time in ten seconds: the generator's single thread was busy without a pause. At 1 connection it used 5.6 seconds out of 10, and at 4 connections 7.7. From 16 connections on it had no time left, and what it measured from there on was itself: the time its own coroutines waited for their turn. The work it does for each request, in Python, is larger than the work of sending the bytes, and it grows with the number of connections it juggles.

Take four rules from this, because they hold for every measurement you will ever make.

- A measuring tool has limits of its own. Find them before you trust it.
- Check a surprising result with a second, independent tool.
- Watch the generator's processor time. When it reaches the wall-clock time, you are measuring the generator.
- Say in every report where the generator ran. On the same machine as the service, the two also compete for the same cores.

Your generator is still worth having. It counts every error exactly and by kind, it can retry, and you can change it, none of which `ab` offers. You only have to read its numbers with its limits in mind:

- At 1 connection its own work, about half a millisecond for each request, is part of every latency it reports: 1.64 ms where `ab` sees 1.1 ms, and therefore 584 requests per second where `ab` sees 888.
- At 4 connections the two tools agree, with 924 and 919 requests per second. The service is the bottleneck there, and the generator has time to spare.
- From 16 connections on, the generator is the bottleneck.

Use it at moderate concurrency, where it counts exactly what happened to every request, and use `ab` to find the capacity of the service.

## What the curve says

Now read the numbers from `ab`, which are about the service.

The throughput barely moves: 888, 919, 1,125, 1,203 requests per second while the concurrency grows 64 times. One process can do about 1,100 requests per second and no more. This ceiling is the **capacity**, and a service at its capacity is **saturated**.

The latency does the opposite. The p50 goes from 1 to 4 to 14 to 52 milliseconds, in step with the concurrency. Nothing got slower inside the service: each request still takes it under a millisecond of work. The requests are **queueing**. With 64 users and a service that finishes 1,200 requests per second, each user gets a turn every 64/1,200 of a second, which is 53 milliseconds.

The relation behind this is one of the few exact laws in the field, **Little's law**:

```
requests under way = throughput × latency
```

In a closed loop the number of requests under way is the concurrency. Check it: 1,125 per second times 0.014 seconds is 15.8, for 16 connections. And 1,203 times 0.052 is 62.6, for 64. Given two of the three numbers, you can compute the third, and when a report's numbers don't fit the law, something in the measurement is wrong.

The practical reading: below saturation, the latency is the time the work takes. Above it, the latency is the length of the queue, and it grows without limit as callers are added. The capacity is therefore the number to know, and the remedy for a saturated service is more capacity.

## More capacity

One Python process uses one core. Uvicorn can start several processes that share the port:

```
uvicorn app.main:app --port 8000 --workers 4
```

With four processes `ab` measured 962 requests per second at 1 connection, 4,225 at 16 with a p50 of 3 ms and a p99 of 10 ms, and 5,034 at 64 with a p50 of 12 ms. One user alone gains nothing, because one user's requests come one at a time. Sixteen users get almost four times the throughput and a p99 that is half as long as before.

On Kubernetes the same thing is done with more pods in place of more processes, and next lesson measures that.

## The cheapest capacity: batching

There is a way to tag twenty times more jets without any more hardware. A request with 100 jets in it:

```
python loadtest.py http://localhost:8000/predict 16 10 100
```

```
conn  16  ok   2205  err   0    220 req/s  p50   71.77 ms  p99  113.91 ms
```

220 requests per second with 100 jets each is 22,000 jets per second, against 1,100 with one jet per request, from the same single process. `ab` measured 222 requests per second for the same case, so here the instruments agree: with so few requests the generator has time to spare. The fixed cost of a request is paid once for a hundred jets. The price is the one you know from week 17: every jet waits for its whole batch, and the p50 is now 72 ms.

## Errors and retries

A load test counts failures as carefully as successes. The generator separates two kinds. A response with a status other than 200 is counted under that status. A request without any response is counted under the name of the exception: `ConnectError` if no connection could be opened, `ReadTimeout` if the answer took longer than the timeout, `RemoteProtocolError` if the server closed the connection in the middle.

A **retry** sends a failed request again. It is the right reaction to a broken connection and the wrong one to most other things:

- Retry when no response arrived. The connection broke, and a second attempt will probably travel over a healthy one.
- Don't retry a 4xx. The request is wrong, and it will be wrong the second time.
- Retry only what is safe to repeat. Asking for a prediction twice does no harm. "Transfer 100 francs" does. A request that can be repeated without changing the outcome is called **idempotent**.
- Retry once or twice, never in an endless loop. A service that is struggling gets worse when every client doubles its requests.

## What a closed loop can't see

One weakness is built into the design, and you should be able to name it. Suppose the service freezes for one second. A closed-loop user who is waiting for a response sends nothing during that second, so the test records one slow request for each connection. Real users don't wait for each other. In that second hundreds of them would have arrived and waited. The closed loop politely stopped sending when the service was at its worst, and its percentiles look better than what real users would have seen. This effect is called **coordinated omission**.

The alternative is an **open loop**: requests are sent at a fixed rate, whether or not earlier ones have been answered. Tools such as `wrk2` and `k6` can do that. For this project the closed loop is enough, as long as the report says that the generator was one.

## Reporting a load test

A latency table without its conditions is worthless. State all of this:

- the machine and its number of cores, and where the generator ran
- how the service ran: processes or replicas, and which version
- the tool, the duration of each run and the kind of loop
- for each level of concurrency: requests per second, p50, p99 and the number of errors
- the size of the requests: one jet or a batch

--- practice
@predict
A service is saturated at 1,000 requests per second. A closed-loop test runs 50 connections against it. What p50 latency do you expect, in milliseconds?
= 50
=| 50 ms
=| 50ms
! Little's law: 50 requests under way = 1,000 per second × latency, so the latency is 0.05 seconds. It measures the queue. The work for one request still takes about a millisecond.

@predict
With one connection, a test measures a p50 of 2 milliseconds. Roughly how many requests per second does it complete?
= 500
! One user sends the next request when the last one is answered, so 1 / 0.002 seconds gives 500 per second. Little's law again, with one request under way.

@run
Model the closed loop. A service has a `capacity` in requests per second, and a single request alone takes it `service_ms` milliseconds. Write `latency_ms(connections, capacity, service_ms)`: the larger of `service_ms` and the queueing time `connections / capacity`, converted to milliseconds. Then write `throughput(connections, capacity, service_ms)`, which follows from Little's law.
```starter
def latency_ms(connections, capacity, service_ms):
    pass

def throughput(connections, capacity, service_ms):
    pass
```
```test
for c in [1, 4, 16, 64]:
    print("%.1f %.0f" % (latency_ms(c, 1100, 1.1), throughput(c, 1100, 1.1)))
```
= 1.1 909
= 3.6 1100
= 14.5 1100
= 58.2 1100
```solution
def latency_ms(connections, capacity, service_ms):
    queueing = connections / capacity * 1000
    return max(service_ms, queueing)

def throughput(connections, capacity, service_ms):
    return connections / (latency_ms(connections, capacity, service_ms) / 1000)
```
! Two lines of arithmetic reproduce the measurement: `ab` saw a p50 of 1, 4, 14 and 52 milliseconds and 888 to 1,203 requests per second. Below saturation the latency is the service time, and above it the queue. A model this simple that fits this well is worth keeping in your head.

@local
Write `loadtest.py` and run it against your service, started as one process, for 10 seconds each at 1, 4 and 16 connections. Paste the three lines and a line that names your processor and its number of cores.
min: 4
= req/s
= p50
= p99
! Your numbers will differ from the lesson's. Look for the pattern: the throughput stops growing, and the p50 keeps growing with the number of connections.

@local
Run the generator at 64 connections under `time`, and run `ab` with `-c 64` against the same service. Paste the generator's line with the three lines of `time`, and from the output of `ab` the lines that start with `Requests per second` and `Failed requests`.
```
time python loadtest.py http://localhost:8000/predict 64 10
ab -n 20000 -c 64 -p jet.json -T application/json http://localhost:8000/predict
```
min: 6
= real
= user
= Requests per second
! Compare `user` plus `sys` with `real`. If they are about equal, your generator was the bottleneck at this concurrency, and the number from `ab` is the one that describes the service. On Windows, run both inside WSL.

@choice
Your generator uses 10 seconds of processor time in a 10-second run and reports that the throughput of the service falls as you add connections. What do you conclude?
- The service collapses under load
* Nothing about the service yet. The generator is saturated, so the measurement must be repeated with a faster tool or from more than one generator process
- The network is too slow
- The percentiles are computed wrongly
! A single-threaded generator that is busy all the time measures its own queue. The lesson's generator reported 291 requests per second where `ab` measured 1,203.

@choice
Which failed request should a client send again?
- One that was answered with 422
- One that was answered with 404
* One for which the connection broke before any response arrived, if repeating it does no harm
- Every failed request, until it succeeds
! A 4xx will fail again in the same way. A broken connection says nothing about the request, and a second attempt usually goes through. Endless retries turn a small problem into an overload.

@choice
A service saturates at 1,100 requests per second with one process. Callers complain about a p99 of 80 ms at peak times, when 64 of them are active. What helps most?
- A faster JSON library, to shave 10% off each request
- A longer timeout in the clients
* More capacity: more processes or replicas, so that the same callers no longer queue
- Measuring with a different tool
! At 64 connections nearly all of the 80 ms is queueing. With four processes the lesson measured a p50 of 12 ms at the same concurrency. A 10% faster handler would give 10% more capacity and leave the queue almost as long.

@write
In your own words: why does the latency grow in step with the number of connections once a service is saturated, although the service takes no longer for each request? Use Little's law.
min: 40
```solution
A saturated service completes a fixed number of requests per second, its capacity, however many callers there are. In a closed loop every connection always has one request under way, so the number of requests under way equals the number of connections. Little's law says that requests under way equal throughput times latency. With the throughput stuck at the capacity, the latency must be the number of connections divided by the capacity, so it doubles when the connections double. The extra time is spent waiting in a queue for a turn, and the work for each request is as short as before.
```
! The essential steps: the throughput is capped, the concurrency is fixed by the loop, and the law leaves the latency as the only number that can grow.
--- recall
Q: What are throughput and latency?
A: Throughput is the work done, in requests per second. Latency is the time one request takes as the caller sees it, reported as p50 and p99.
Q: What is a closed-loop load generator?
A: A fixed number of simulated users, each of which sends a request, waits for the response and sends the next. The number of users is the concurrency.
Q: State Little's law.
A: Requests under way = throughput × latency. In a closed loop the requests under way are the concurrency.
Q: What happens to throughput and latency when a service saturates?
A: The throughput stays at the capacity, and the latency grows in step with the concurrency, because requests wait in a queue.
Q: How do you find out whether the load generator is the bottleneck?
A: Compare its processor time with the wall-clock time, for example with the shell's time, and check the result with a second tool such as ab.
Q: Which failed requests may a client retry?
A: Those where the connection broke without a response, if the request is idempotent, and only once or twice. Never a 4xx.
Q: What is coordinated omission?
A: A closed-loop generator stops sending while the service is stalled, so it records far fewer slow requests than real, independent users would experience, and its percentiles look too good.
Q: What must a load-test report state besides the numbers?
A: The machine and cores, where the generator ran, how the service was run, the tool and duration, the size of the requests, and the errors at each level.

=== sy4 | sys | 19 | Kubernetes in practice: probes, rolling updates and failure on a real cluster | p54,p55
## From the map to the territory

In week 9 you learned Kubernetes on one page: pods, deployments, services, labels and `kubectl`. That was the map. This week you operate a cluster, and you answer three questions by measurement, with your own service and your own load generator:

- Can I replace version 0.1 by version 0.2 while requests are coming in, without one of them failing?
- What happens when a pod is deleted, when a process crashes, and when a release is broken?
- What do three replicas give me that one doesn't?

Reread the lesson of week 9 first if the words pod, deployment and service are not firm.

## A cluster on your laptop

**kind**, short for "Kubernetes in Docker", runs a complete cluster on one machine. Each node of the cluster is a Docker container, and your pods run inside it. Install `kind` and `kubectl` from the links of this week's task. Then describe the cluster in a file `kind.yaml`:

```
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30080
    hostPort: 8080
```

One node is enough. The port mapping does for the node what `-p` did for a container in week 18: port 30080 of the node becomes reachable as port 8080 of your machine. You will see below why 30080.

```
kind create cluster --name lab --config kind.yaml
```

After a minute or two it ends with `Set kubectl context to "kind-lab"`. A **context** is kubectl's note of which cluster it talks to, and `kubectl config current-context` prints it. Check the node:

```
kubectl get nodes
```

```
NAME                STATUS   ROLES           AGE   VERSION
lab-control-plane   Ready    control-plane   26m   v1.37.0
```

One more step is specific to kind. A real cluster downloads images from a **registry**, a server that stores images. Your image exists only in the Docker of your laptop, and the node can't see it there. Copy it in:

```
kind load docker-image jet-service:0.1 --name lab
```

## The deployment

Create `k8s/deployment.yaml`. The first half is the deployment of week 9. The second half is what turns a demo into something you can operate.

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jet-tagger
  labels:
    app: jet-tagger
spec:
  replicas: 3
  selector:
    matchLabels:
      app: jet-tagger
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  template:
    metadata:
      labels:
        app: jet-tagger
    spec:
      containers:
      - name: tagger
        image: jet-service:0.1
        ports:
        - name: http
          containerPort: 8000
        readinessProbe:
          httpGet:
            path: /readyz
            port: http
          periodSeconds: 2
        livenessProbe:
          httpGet:
            path: /healthz
            port: http
          periodSeconds: 10
        resources:
          requests:
            cpu: 250m
            memory: 128Mi
          limits:
            cpu: "1"
            memory: 256Mi
        lifecycle:
          preStop:
            exec:
              command: ["sleep", "5"]
```

Five parts are new, and the sections below take them one at a time: the `strategy`, the two probes, the `resources` and the `lifecycle`. A small one first: `name: http` gives port 8000 a name, so that the probes and the service can say `http` and nobody has to repeat the number.

## The service

Create `k8s/service.yaml`:

```
apiVersion: v1
kind: Service
metadata:
  name: jet-tagger
spec:
  type: NodePort
  selector:
    app: jet-tagger
  ports:
  - name: http
    port: 80
    targetPort: http
    nodePort: 30080
```

The selector says which pods belong to the service: all that carry the label `app: jet-tagger`. Three port numbers appear, and each has a different job.

- `port: 80` is where the service listens inside the cluster. Other pods would reach it as `http://jet-tagger`, because the cluster's own DNS turns the name of a service into its address.
- `targetPort: http` is the port of the pods that requests are passed on to, by its name.
- `nodePort: 30080` opens that port on every node of the cluster and connects it to the service. Node ports must lie between 30000 and 32767.

The `type` decides who can reach a service. The default, `ClusterIP`, is reachable from inside the cluster only. `NodePort` adds the port on the nodes. In a cloud there is a third, `LoadBalancer`, which orders a public address from the provider. With the port mapping of `kind.yaml`, the chain is complete: port 8080 of your laptop, port 30080 of the node, port 80 of the service, port 8000 of one of the pods.

## Apply and look around

`kubectl apply -f` takes a file or a whole folder:

```
kubectl apply -f k8s/
kubectl rollout status deployment/jet-tagger
```

```
deployment.apps/jet-tagger created
service/jet-tagger created
Waiting for deployment "jet-tagger" rollout to finish: 0 of 3 updated
replicas are available...
deployment "jet-tagger" successfully rolled out
```

`kubectl rollout status` waits until the deployment has reached the state you asked for, which took three seconds here. The option `-o wide` adds the address of each pod to the listing:

```
kubectl get pods -o wide
```

```
NAME                          READY   STATUS    RESTARTS   AGE   IP
jet-tagger-5f9b76bf9b-s74fb   1/1     Running   0          13s   10.244.0.73
jet-tagger-5f9b76bf9b-wb6tn   1/1     Running   0          16s   10.244.0.72
jet-tagger-5f9b76bf9b-zqq8n   1/1     Running   0          10s   10.244.0.74
```

A pod's name has three parts: the name of the deployment, a code for the version of the pod template, here `5f9b76bf9b`, and five random characters. The middle part belongs to a **ReplicaSet**, an object between the deployment and its pods that keeps a fixed number of identical pods running. A deployment creates one ReplicaSet for every version of its template, and that is how it can move between versions.

Now ask the service who is there, six times:

```
curl localhost:8080/healthz
```

```
{"status":"ok","pod":"jet-tagger-5f9b76bf9b-zqq8n","version":"0.1"}
{"status":"ok","pod":"jet-tagger-5f9b76bf9b-s74fb","version":"0.1"}
{"status":"ok","pod":"jet-tagger-5f9b76bf9b-wb6tn","version":"0.1"}
{"status":"ok","pod":"jet-tagger-5f9b76bf9b-wb6tn","version":"0.1"}
{"status":"ok","pod":"jet-tagger-5f9b76bf9b-wb6tn","version":"0.1"}
{"status":"ok","pod":"jet-tagger-5f9b76bf9b-zqq8n","version":"0.1"}
```

One address, three pods behind it. The service picks a pod at random for every new connection, and each `curl` opens a new one. That is the `pod` field of `/healthz` earning its keep.

## Readiness and liveness

A **probe** is a question that Kubernetes asks a container again and again. For both probes here the question is an HTTP GET, and any status from 200 to 399 counts as yes.

The **readiness probe** asks "may I send you requests?". While the answer is no, the pod is taken out of the service: it keeps running and receives nothing. A new pod starts as not ready, and it gets its first request only after `/readyz` has answered once, which here means after the model is loaded. Without a readiness probe a pod counts as ready the moment its container starts, a moment before uvicorn listens, and the requests of that moment fail.

The **liveness probe** asks "are you still working?". If it fails three times in a row, Kubernetes kills the container and starts a new one. It exists for processes that hang without exiting. With a period of 10 seconds, a hung service is restarted after about half a minute.

The two answers lead to different actions, which is why the service has two endpoints. A pod that is busy loading should be left alone and not restarted. A pod that is stuck should be restarted and not left alone. Keep `/healthz` trivial. If it called a database and the database were down, Kubernetes would restart every pod again and again, and make the outage worse.

## Requests and limits

Under `resources` you tell the cluster how much processor and memory a pod needs.

- `cpu: 250m` means 250 millicores, a quarter of a core. `cpu: "1"` is one whole core.
- `memory: 128Mi` means 128 mebibytes. A mebibyte is 1,024 times 1,024 bytes.

The **request** is what the scheduler reserves. It places a pod only on a node that still has that much free, so the requests of all pods on a node never add up to more than the node has. The **limit** is the ceiling. A container that wants more processor than its limit is slowed down. A container that takes more memory than its limit is killed and restarted, and `kubectl describe pod` shows the reason `OOMKilled`, for "out of memory".

Without requests the scheduler packs pods blindly, and without limits one runaway pod takes the node from everybody else. On a shared cluster you will not be allowed to leave them out.

## A rolling update, watched

Make a second version. Change `VERSION` to `"0.2"` in `app/main.py`, then build and load it:

```
docker build -t jet-service:0.2 .
kind load docker-image jet-service:0.2 --name lab
```

In a second terminal, start a loop that asks the service five times a second who answers:

```
while true; do curl -s -m 1 localhost:8080/healthz; echo; sleep 0.2; done
```

Then change the image of the container `tagger` and follow the rollout:

```
kubectl set image deployment/jet-tagger tagger=jet-service:0.2
kubectl rollout status deployment/jet-tagger
```

```
deployment.apps/jet-tagger image updated
Waiting for deployment "jet-tagger" rollout to finish: 1 out of 3 new
replicas have been updated...
Waiting for deployment "jet-tagger" rollout to finish: 2 out of 3 new
replicas have been updated...
Waiting for deployment "jet-tagger" rollout to finish: 1 old replicas
are pending termination...
deployment "jet-tagger" successfully rolled out
```

It took seven seconds. In the other terminal the answers went from all `0.1`, through six seconds in which both versions answered in turn, to all `0.2`, and no request was left without an answer.

The `strategy` block is what made it orderly. `maxSurge: 1` allows one pod more than the three you asked for, and `maxUnavailable: 0` forbids ever having fewer than three ready. So the deployment starts one new pod, which makes four, waits until its readiness probe passes, stops one old pod, and repeats that twice more. Behind the scenes, the ReplicaSet of the new version grows from 0 to 3 while the old one shrinks from 3 to 0. The old ReplicaSet is kept, empty, as the way back.

In real work you would change the image tag in the YAML file, commit it and run `kubectl apply` again, so that the repository always says what is running. `kubectl set image` is the same change typed by hand.

## Does anybody notice? Measure it

"It looked fine" is not a result. The reference project ran the load generator of last lesson with 8 connections for 25 seconds, started the rollout after 4 seconds, and counted. The same was done with parts of the deployment removed:

- probes and `preStop` removed: 36 requests failed, next to 18,806 that succeeded
- only the `preStop` removed: 11 failed, next to 22,697
- only the readiness probe removed: 2 failed, next to 21,527
- the full deployment: 3 failed, next to 23,751, and in a second run 1, next to 24,411
- the full deployment, and one retry in the client: 0 failed in 25,830

Each line teaches something.

**The readiness probe** covers the start of a pod. Without it, traffic reaches a new pod before its server listens. The model loads in milliseconds here, so only 2 requests were lost. A service that needs ten seconds to start would lose ten seconds of traffic.

**The `preStop` hook** covers the end of a pod, and it is the least obvious line in the file. When Kubernetes stops a pod, two things happen at the same moment and independently. The container is told to shut down. And the pod's address starts to be removed from the service, a change that needs a moment to reach every part of the cluster. In that moment, requests are still being sent to a pod that has already closed its door. A **hook** is a command that Kubernetes runs at a fixed point in the life of a container, and `preStop` runs before the stop signal is sent. `sleep 5` lets the pod serve for five more seconds while the news spreads. After the hook, uvicorn gets the signal, finishes the requests it is working on and exits. A pod has 30 seconds for all of this before it is killed by force.

**The last few failures** are the interesting ones. All of them had the same error in the generator: `RemoteProtocolError`, "server disconnected without sending a response". The cause is keep-alive. A client holds an open connection to a pod. The pod shuts down and closes its idle connections. At the same instant the client sends its next request into that connection, and the request falls into the gap. No setting on the server can close this gap completely, because the server can't know that a request is on its way.

**The retry** closes it from the other side. With `retries` set to 1, the generator sends such a request once more, over a fresh connection that leads to a living pod: 0 failures in 25,830 requests.

The conclusion is worth more than the YAML. A zero-downtime update is a property of the whole system, the client included. The server does everything it can, and a well-behaved client retries a broken connection once.

## Three ways to break it

Run each of these with the load generator going, and count.

**Delete a pod.** `kubectl delete pod` with the name of one of your pods. The deployment sees two pods where three are wanted, and starts a replacement, which was ready within three seconds. The deleted pod went through its `preStop` pause like any pod that is stopped. Result: 0 failures in 34,639 requests.

**Crash a process.** A deletion is polite. A crash isn't. The node is a Docker container, so you can reach into it and kill one uvicorn process the hard way:

```
docker exec lab-control-plane sh -c 'kill -9 $(pgrep -o -f uvicorn)'
```

`pgrep -o -f uvicorn` prints the process number of the oldest process whose command line contains "uvicorn", and `kill -9` ends it at once, without any chance to finish its work. Result: 5 failures in 39,378 requests, the ones that were in that process or on their way to it. Nothing else happened to the callers, because Kubernetes restarted the container within a second. `kubectl get pods` tells the story in the `RESTARTS` column:

```
jet-tagger-866bbf8c55-vmhqs   1/1     Running   1 (31s ago)   14m
```

**Ship a broken release.** Give the pods a model path that doesn't exist:

```
kubectl set env deployment/jet-tagger MODEL_PATH=model/missing.onnx
kubectl rollout status deployment/jet-tagger --timeout=25s
```

```
deployment.apps/jet-tagger env updated
Waiting for deployment "jet-tagger" rollout to finish: 1 out of 3 new
replicas have been updated...
error: timed out waiting for the condition
```

The rollout is stuck, and `kubectl get pods` shows where:

```
NAME                          READY   STATUS             RESTARTS
jet-tagger-75f8cdf6f9-8cf5m   0/1     CrashLoopBackOff   2 (9s ago)
jet-tagger-866bbf8c55-j55tb   1/1     Running            1 (111s ago)
jet-tagger-866bbf8c55-ph4sj   1/1     Running            0
jet-tagger-866bbf8c55-vmhqs   1/1     Running            1 (69s ago)
```

`CrashLoopBackOff` means: the container starts, dies, is restarted, dies again, and Kubernetes waits longer before each new attempt. The reason is in the pod's output, which `kubectl logs` followed by the pod's name prints. Its last lines, shortened:

```
onnxruntime.capi.onnxruntime_pybind11_state.NoSuchFile: [ONNXRuntimeError]
: 3 : NO_SUCHFILE : Load model from model/missing.onnx failed
ERROR:    Application startup failed. Exiting.
```

Look again at the list of pods: the three old ones are all running. `maxUnavailable: 0` forbids stopping an old pod before a new one is ready, and the new one never became ready. The broken release took nothing down: 0 failures in 59,856 requests. Go back with one command:

```
kubectl rollout undo deployment/jet-tagger
```

```
deployment.apps/jet-tagger rolled back
```

The undo makes the previous ReplicaSet the current one again. This is the pay-off of everything above: a mistake in a release costs you a minute of reading logs, and it costs your callers nothing.

## What three replicas buy

`kubectl scale deployment/jet-tagger --replicas=1` changes the number of pods. Measured with `ab` through the cluster, on the reference machine:

- one replica: 508 requests per second at 1 connection, 748 at 16, and 740 at 64 with a p50 of 84 ms
- three replicas: 555 at 1 connection, 1,275 at 16, and 1,605 at 64 with a p50 of 39 ms

Three things to read from that.

- One caller alone gains nothing from replicas. Its requests arrive one at a time.
- Under load, three replicas give 2.2 times the throughput of one, and not three times. The machine has four cores, and three pods, the load generator and the cluster's own programs share them. On a real cluster the pods would sit on different machines.
- The way through the cluster costs something. Outside the cluster, one process answered 888 requests per second for a single caller, and inside it 508. Every request passes the port mapping and the service's routing, which added about 0.8 ms here.

More replicas are also what makes the rolling update and the failure drills painless. With one replica, every one of those events is an outage.

## The commands of this lesson

- `kubectl apply -f k8s/` creates or updates what the files describe
- `kubectl get pods -o wide`, and `kubectl get deployments`, `services` or `replicasets`
- `kubectl describe pod` with a name: everything about one pod, with its events at the end
- `kubectl logs` with a pod's name: what the container printed. Add `--previous` for the run before the last restart
- `kubectl rollout status`, `kubectl rollout history` and `kubectl rollout undo`, each followed by `deployment/jet-tagger`
- `kubectl set image` and `kubectl set env` change a deployment by hand
- `kubectl scale deployment/jet-tagger --replicas=1`
- `kubectl delete pod` with a name
- `kubectl exec -it` with a pod's name, then `-- sh`: a shell inside the container

When you are done for the day, `kind delete cluster --name lab` removes the cluster. Everything is in your YAML files, and `kind create cluster` followed by `kubectl apply` brings it back.

--- practice
@predict
A deployment has 3 replicas, `maxSurge: 1` and `maxUnavailable: 0`. During a rolling update, what is the largest number of its pods that exist at the same time?
= 4
! One more than the wanted three is allowed, and no fewer than three may be ready. So a new pod is started first, and an old one is stopped only when the new one is ready.

@predict
Each of the three pods requests `cpu: 250m`. How many cores do the three requests reserve on the node together, as a decimal number?
= 0.75
=| .75
=| 0,75
! 250 millicores are a quarter of a core, and three quarters make 0.75. The scheduler adds up requests, and never limits.

@run
Small scripts around `kubectl` are everyday work. Write `count_status(text)`, which gets the output of `kubectl get pods` as one string and returns a dictionary from each status to the number of pods that have it. The first line is the header. The status is the third column.
```starter
def count_status(text):
    pass
```
```test
out = """NAME                          READY   STATUS             RESTARTS   AGE
jet-tagger-75f8cdf6f9-8cf5m   0/1     CrashLoopBackOff   2          25s
jet-tagger-866bbf8c55-j55tb   1/1     Running            1          15m
jet-tagger-866bbf8c55-ph4sj   1/1     Running            0          3m
jet-tagger-866bbf8c55-vmhqs   1/1     Running            1          15m
"""
c = count_status(out)
print(sorted(c.items()))
print(count_status("NAME READY STATUS RESTARTS AGE\n"))
```
= [('CrashLoopBackOff', 1), ('Running', 3)]
= {}
```solution
def count_status(text):
    counts = {}
    lines = text.strip().split("\n")
    for line in lines[1:]:
        parts = line.split()
        if len(parts) >= 3:
            status = parts[2]
            counts[status] = counts.get(status, 0) + 1
    return counts
```
! `split()` without an argument splits at any run of spaces, which is exactly what aligned columns need. `lines[1:]` skips the header. In real scripts, `kubectl get pods -o json` gives the same data in a form that doesn't depend on column positions.

@choice
What is the difference between the readiness probe and the liveness probe?
- Readiness is checked once at start-up, and liveness for ever
- They are two names for the same check
* A failing readiness probe takes the pod out of the service and leaves it running. A failing liveness probe gets the container restarted
- Readiness is for HTTP and liveness for other protocols
! "Don't send me requests now" and "I am broken, restart me" are different messages. A pod that is loading a model wants the first and must not get the second.

@choice
Why does the deployment run `sleep 5` in a `preStop` hook?
- To give the model time to save its state
- Kubernetes requires every container to have a hook
* Removing a stopping pod from the service takes a moment to reach the whole cluster. The pause keeps the pod serving until no new requests are routed to it
- To slow rollouts down so that they can be watched
! Stopping the container and removing its address happen in parallel. Without the pause, requests arrive at a server that has already closed. The lesson measured 11 failed requests without the hook.

@choice
After a new release, one pod shows `CrashLoopBackOff`. What do you run first?
- `kubectl delete deployment jet-tagger`
- `kubectl scale deployment/jet-tagger --replicas=0`
* `kubectl logs` for that pod, to read why the container dies
- `kind delete cluster --name lab`
! The container starts and dies, so its output holds the reason. If it is your release that is broken, `kubectl rollout undo` brings the previous version back, and with `maxUnavailable: 0` the old pods were serving all along.

@local
Create the cluster, load your image and apply the deployment and the service. Paste the output of `kubectl get pods -o wide` and of six calls of the `curl` command below.
```
curl localhost:8080/healthz
```
min: 8
= Running
= "pod"
= jet-tagger
! If the pods show `ErrImagePull` or `ImagePullBackOff`, the image was not loaded into the cluster under the exact name and tag that the YAML asks for. If `curl` can't connect, check the `extraPortMappings` of `kind.yaml` and the `nodePort` of the service.

@local
Build and load version 0.2, start the loop that asks `/healthz` five times a second, and roll the deployment to the new image. Paste the output of the rollout commands, and from the loop about ten lines around the moment when the version changes.
min: 8
= successfully rolled out
= "version":"0.2"
= "version":"0.1"
! Both versions answer for a few seconds, because old and new pods are in the service together. If the loop prints empty lines, those are requests without an answer, and you should find out which safeguard is missing.

@local
Ship the broken release from the lesson while your load generator runs. Paste the list of pods that shows the failing pod, the last lines of its log, the output of the undo, and the line of your load generator.
min: 6
= CrashLoopBackOff
= rolled back
= req/s
! The line of the load generator should show no errors: the old pods keep serving the whole time. If it shows some, check that `maxUnavailable` is 0 and that the readiness probe is in place.

@write
Describe, step by step, what happens between `kubectl set image` and the end of the rollout with the deployment of this lesson, and say for each of the safeguards which failure it prevents.
min: 70
```solution
The deployment creates a new ReplicaSet for the new image and starts one pod from it, so that four pods exist. That is what maxSurge 1 allows. The new pod receives no requests until its readiness probe has passed, which prevents traffic from reaching a server that is still starting. Only then is one old pod stopped, because maxUnavailable 0 forbids having fewer than three ready pods. The stopping pod first runs its preStop hook and keeps serving for five seconds while its address is removed from the service everywhere, which prevents requests from arriving at a closed server. Then uvicorn gets the stop signal and finishes the requests it is working on. This repeats until three new pods run. A request that a client sends into a keep-alive connection at the instant the pod closes it can still be lost, and the client's single retry covers that last case.
```
! Four mechanisms, four failures: the surge and the unavailable limit keep the capacity, readiness guards the start of a pod, the preStop pause guards its end, and the retry guards the keep-alive gap.
--- recall
Q: What do maxSurge 1 and maxUnavailable 0 mean for a deployment with 3 replicas?
A: At most 4 pods exist during an update and never fewer than 3 are ready. A new pod is started and must be ready before an old one is stopped.
Q: What does a readiness probe do, and what does a liveness probe do?
A: While readiness fails, the pod gets no requests from the service but keeps running. When liveness fails repeatedly, the container is killed and restarted.
Q: Why does a pod need a preStop pause?
A: Its address is removed from the service in parallel with the stop signal, and that takes a moment to spread. The pause keeps it serving until no new requests arrive.
Q: After all server-side safeguards, which requests can still fail during a rollout, and what fixes it?
A: Requests sent into a keep-alive connection at the instant the stopping pod closes it. One retry in the client fixes it.
Q: What is the difference between a resource request and a limit?
A: The request is what the scheduler reserves when placing the pod. The limit is the ceiling: more processor is throttled, and more memory gets the container killed with OOMKilled.
Q: What does CrashLoopBackOff mean, and what do you do?
A: The container starts and dies repeatedly, and Kubernetes waits longer between restarts. Read kubectl logs for the reason, and roll back with kubectl rollout undo if a release caused it.
Q: What is a ReplicaSet?
A: The object between a deployment and its pods that keeps a number of identical pods running. A deployment has one for each version of its template, which is what makes rolling updates and undo possible.
Q: What are the three port numbers of a NodePort service?
A: port, where the service listens inside the cluster. targetPort, the port of the pods. nodePort, the port opened on every node, between 30000 and 32767.

=== sy5 | sys | 20 | Metrics with Prometheus: counters, histograms, PromQL and an alert | p56,p57,p58
## Why a running system needs numbers

Your service runs in three pods. Right now you learn how it is doing by sending requests yourself and reading `kubectl logs`. That stops working the moment you look away, and real systems run for months while nobody looks.

**Monitoring** means that the system reports on itself, all the time, in numbers that can be stored, drawn and checked by a machine. Two kinds of record do most of the work:

- A **log** is a line of text about one event: this request arrived, this error happened. Logs answer "what exactly happened to this one request?".
- A **metric** is a number that describes the system as a whole and is sampled again and again: requests so far, memory in use. Metrics answer "how is it going, and since when has it been going differently?".

This lesson is about metrics, with **Prometheus**, the standard tool for them in the Kubernetes world. You make the service count, let Prometheus collect the counts, ask questions in its query language, and end with an alert that fires by itself when something is wrong.

## Three kinds of metric

- A **counter** only ever goes up: requests served, jets tagged, errors. Its value means little by itself. What matters is how fast it rises.
- A **gauge** goes up and down: memory in use, requests under way, the temperature of a magnet.
- A **histogram** records how values are distributed: how many requests took at most 1 ms, at most 5 ms, and so on. It is how latency is measured.

## Making the service count

The library `prometheus_client` is already in your requirements. Three metrics describe the tagger:

```
import time

from fastapi import Response
from prometheus_client import (CONTENT_TYPE_LATEST, Counter, Histogram,
                               generate_latest)

REQUESTS = Counter("tagger_requests_total", "Requests to /predict",
                   ["status"])
JETS = Counter("tagger_jets_total", "Jets tagged", ["label"])
LATENCY = Histogram(
    "tagger_request_seconds", "Time spent handling /predict",
    buckets=[0.0005, 0.001, 0.0025, 0.005, 0.01,
             0.025, 0.05, 0.1, 0.25, 1.0])
```

Each metric has a name, a sentence of help, and optionally a list of **labels**. A label splits one metric into several series: `tagger_requests_total` exists once with `status="ok"` and once with `status="rejected"`. The names follow conventions that every Prometheus user expects: counters end in `_total`, and times are in seconds, never in milliseconds.

The histogram needs its **buckets** up front: the upper edges, in seconds, of the classes it counts into. Choose them around the values you expect, here from half a millisecond to one second.

In the handler, four lines do the counting:

```
@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    start = time.perf_counter()
    if any(len(jet) != N_FEATURES for jet in request.jets):
        REQUESTS.labels(status="rejected").inc()
        raise HTTPException(
            status_code=422,
            detail=f"every jet needs {N_FEATURES} features")
    x = np.asarray(request.jets, dtype=np.float32)
    p = state["session"].run(None, {"features": x})[0]
    predictions = []
    for row in p:
        label = CLASSES[int(row.argmax())]
        JETS.labels(label=label).inc()
        probabilities = {c: round(float(v), 4)
                         for c, v in zip(CLASSES, row)}
        predictions.append(
            Prediction(label=label, probabilities=probabilities))
    REQUESTS.labels(status="ok").inc()
    LATENCY.observe(time.perf_counter() - start)
    return PredictResponse(predictions=predictions)
```

`.labels(status="ok")` picks the series, `.inc()` adds one to a counter, and `.observe(seconds)` puts one value into the histogram. One more endpoint hands the numbers out:

```
@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
```

Start the service, send the jet of week 18 once, and look at `curl localhost:8000/metrics`. Among other lines:

```
# HELP tagger_requests_total Requests to /predict
# TYPE tagger_requests_total counter
tagger_requests_total{status="ok"} 1.0
# HELP tagger_jets_total Jets tagged
# TYPE tagger_jets_total counter
tagger_jets_total{label="z"} 1.0
# HELP tagger_request_seconds Time spent handling /predict
# TYPE tagger_request_seconds histogram
tagger_request_seconds_bucket{le="0.0005"} 0.0
tagger_request_seconds_bucket{le="0.001"} 1.0
tagger_request_seconds_bucket{le="0.0025"} 1.0
tagger_request_seconds_bucket{le="+Inf"} 1.0
tagger_request_seconds_count 1.0
tagger_request_seconds_sum 0.000653375000183587
```

This plain text is the whole interface. One line is one **time series**: a name, labels in braces, and the current value. The library adds series about the process itself without being asked, such as `process_cpu_seconds_total` and `process_resident_memory_bytes`.

Read the histogram closely. `le` stands for "less than or equal", and the buckets are **cumulative**: each one counts all observations up to its edge. The one request took 0.65 ms, so it is absent from the bucket up to 0.0005 and present in every bucket from 0.001 on. `+Inf` holds everything, `_count` is the number of observations and `_sum` is their total.

Two limits of this instrumentation are worth knowing. A body that pydantic refuses never reaches the handler, so it is not counted here. And the counters live in the memory of one process, which is one more reason to run one process in each pod: with `--workers 4`, every scrape would reach a different process with different counts.

## How Prometheus collects

Prometheus is a server with a simple routine. Every few seconds it sends a GET to the `/metrics` endpoint of every program it knows, which is called a **scrape**, and stores each number with the time. Your service doesn't send anything anywhere, and it doesn't know that Prometheus exists.

A program that Prometheus scrapes is a **target**. To every series it collects, Prometheus adds two labels: `job`, the name of the group of targets from its configuration, and `instance`, the address of the one target. That is how the counts of three pods stay apart.

## Prometheus in your cluster

Everything goes into one file, `k8s/monitoring.yaml`, with four objects separated by lines of three dashes. The first is a second service for your pods:

```
apiVersion: v1
kind: Service
metadata:
  name: jet-tagger-pods
spec:
  clusterIP: None
  selector:
    app: jet-tagger
  ports:
  - name: http
    port: 8000
```

`clusterIP: None` makes it a **headless** service. An ordinary service has one address and hides its pods behind it. A headless one has no address of its own, and its name resolves to the addresses of all its pods. Prometheus needs exactly that, because it must scrape each pod separately. Through the ordinary service it would get a random pod each time.

The second object holds the configuration:

```
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 5s
    scrape_configs:
    - job_name: jet-tagger
      dns_sd_configs:
      - names: ["jet-tagger-pods.default.svc.cluster.local"]
        type: A
        port: 8000
```

A **ConfigMap** stores small files in the cluster, so that a configuration doesn't have to be baked into an image. The `|` after a key starts a block of text that is kept exactly as written. This ConfigMap holds one file, `prometheus.yml`, which says: scrape every 5 seconds, and find the targets of the job `jet-tagger` by looking up a name in the cluster's DNS. `jet-tagger-pods.default.svc.cluster.local` is the full name of the headless service: its name, the namespace `default`, and a fixed ending. `type: A` asks for addresses, and `port: 8000` is added to each. Prometheus repeats the lookup every 30 seconds, so new pods are found without anybody telling it.

The third and fourth objects run Prometheus and give it a service:

```
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: quay.io/prometheus/prometheus:v3.16.0
        args: ["--config.file=/etc/prometheus/prometheus.yml"]
        ports:
        - name: web
          containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
spec:
  selector:
    app: prometheus
  ports:
  - name: web
    port: 9090
    targetPort: web
```

The image comes from quay.io, a public registry, and the cluster downloads it by itself. The `volumes` block turns the ConfigMap into a folder, and `volumeMounts` makes that folder appear inside the container at `/etc/prometheus`, with the file in it.

Apply the file, wait for the rollout, and open a tunnel to the Prometheus service:

```
kubectl apply -f k8s/monitoring.yaml
kubectl rollout status deployment/prometheus
kubectl port-forward service/prometheus 9090:9090
```

`kubectl port-forward` connects a port of your laptop to a port inside the cluster for as long as the command runs. It is the tool for looking at something that has no node port. Open `http://localhost:9090/targets` in a browser: three targets, one for each pod, all with the state `UP`.

## PromQL, step by step

At `http://localhost:9090/query` you type queries in **PromQL**, Prometheus's query language. Start the load generator with 8 connections for a few minutes, so that there is something to see. The answers below are from the reference run.

**A name returns its series.**

```
up{job="jet-tagger"}
```

```
up{instance="10.244.0.65:8000", job="jet-tagger"}  1
up{instance="10.244.0.66:8000", job="jet-tagger"}  1
up{instance="10.244.0.64:8000", job="jet-tagger"}  1
```

`up` is a series that Prometheus creates for every target: 1 if the last scrape worked, and 0 if not. The braces filter by label. One series for each pod, each with the value 1.

**Counters need `rate`.** `tagger_requests_total` returns three large numbers that grow, which is of no use. The question is how fast they grow:

```
rate(tagger_requests_total{status="ok"}[1m])
```

```
{instance="10.244.0.65:8000", ...}  419.4
{instance="10.244.0.66:8000", ...}  184.0
{instance="10.244.0.64:8000", ...}  401.7
```

`[1m]` takes the samples of the last minute, and `rate` computes how much the counter rose in that window, per second. A counter that restarts at zero, because its pod was restarted, is handled correctly: `rate` notices the drop and carries on counting. This is why you always store counters and compute rates when asking, and never the other way round.

**Aggregate with `sum`.**

```
sum(rate(tagger_requests_total{status="ok"}[1m]))
```

```
{}  1005.1
```

The service as a whole answers 1,005 requests per second, and the load generator reported 975 over its whole run. Two independent instruments agree within 3%. `sum by (instance) (...)` would keep one number for each pod, and `sum by (status) (...)` one for each status.

**Look at the three pods again.** They got 419, 184 and 402 requests per second: one pod does less than half the work of the others. Nothing is broken. The service balances **connections**, and each connection is assigned to a pod once, at random, when it is opened. The load generator holds 8 connections open for minutes, and with 8 random choices among 3 pods an uneven split is the normal case. With thousands of short-lived connections it evens out. This is a real property of Kubernetes services that surprises people in production, and you found it with one query.

**Latency from the histogram.**

```
histogram_quantile(0.99,
  sum by (le) (rate(tagger_request_seconds_bucket[1m])))
```

```
{}  0.00227
```

Read it from the inside. `rate(..._bucket[1m])` turns every bucket counter into observations per second. `sum by (le)` adds the three pods together, bucket by bucket. `histogram_quantile(0.99, ...)` estimates the value below which 99% of the observations lie: 2.27 milliseconds. With 0.5 in place of 0.99 the answer is 0.28 ms.

It is an estimate, and you can redo it by hand. The summed buckets were:

```
le=0.0005    882.7 per second
le=0.001     963.3
le=0.0025   1000.9
le=0.005    1004.6
le=+Inf     1005.1
```

99% of 1,005.1 is 995.1. That rank lies between the bucket up to 0.001, which holds 963.3, and the bucket up to 0.0025, which holds 1,000.9. Prometheus assumes that the observations are spread evenly inside a bucket, and draws a straight line: 995.1 is 31.8 above 963.3, the bucket holds 37.6, and 31.8 / 37.6 is 0.845 of the way from 0.001 to 0.0025. That gives 0.001 + 0.845 × 0.0015 = 0.00227. The consequence: a quantile from a histogram is only as fine as its buckets. If the p99 falls into a bucket from 0.1 to 1.0, all you really know is "between 100 ms and 1 s".

The mean needs no estimate. It is the rate of the sum divided by the rate of the count:

```
sum(rate(tagger_request_seconds_sum[1m]))
  / sum(rate(tagger_request_seconds_count[1m]))
```

That gave 0.00026 seconds: the handler takes a quarter of a millisecond on average.

**The mix of predictions.**

```
sum by (label) (rate(tagger_jets_total[1m]))
```

```
{label="q"}  266.3
{label="g"}  226.2
{label="w"}  171.0
{label="z"}  170.9
{label="t"}  170.7
```

The service tags 266 quark jets and 171 top jets per second. This series is monitoring of the model, as opposed to the machinery. If the share of one class jumps from one day to the next, the data that reaches the service has changed, or something upstream is broken, and no error message will tell you.

## What the service doesn't know about itself

Put two measurements of the same minutes next to each other:

- the load generator: p50 6.8 ms, p99 29.9 ms
- the service's histogram: p50 0.28 ms, p99 2.3 ms

Both are correct. The histogram starts its clock on the first line of the handler and stops it on the last. Everything outside is invisible to it: the way through the port mapping and the service, the wait until a worker thread is free, reading and validating the JSON, writing the response, the way back, and the queue inside the load generator itself. The handler is 4% of what the caller experiences.

A third series shows where the pod's effort goes:

```
rate(process_cpu_seconds_total[1m])
```

The busiest pod used 0.54 cores while answering 419 requests per second. That is 1.3 ms of processor time for each request, of which the handler accounts for 0.26 ms. Four fifths of the work of a request happen around your function, in the server and the framework.

Two rules follow. Measure latency where the caller is, because that is the number that matters. And use the service's own metrics to find out where the time goes, knowing what they leave out.

## An alert

Nobody watches a dashboard at night. An **alert** is a query with a threshold that Prometheus evaluates all the time. The rules live in a second file. Change the `data` part of the ConfigMap to this:

```
  prometheus.yml: |
    global:
      scrape_interval: 5s
      evaluation_interval: 5s
    rule_files:
    - /etc/prometheus/rules.yml
    scrape_configs:
    - job_name: jet-tagger
      dns_sd_configs:
      - names: ["jet-tagger-pods.default.svc.cluster.local"]
        type: A
        port: 8000
  rules.yml: |
    groups:
    - name: jet-tagger
      rules:
      - alert: TaggerRejectsTooMany
        expr: |
          sum(rate(tagger_requests_total{status="rejected"}[1m]))
            / sum(rate(tagger_requests_total[1m])) > 0.05
        for: 30s
        annotations:
          summary: More than 5% of the requests are being rejected
      - alert: TaggerPodsMissing
        expr: count(up{job="jet-tagger"} == 1) < 3
        for: 30s
        annotations:
          summary: Fewer than three tagger pods answer the scrape
```

`rule_files` tells Prometheus where the rules are, and `evaluation_interval` how often to check them. The `expr` of the first rule is the fraction of rejected requests, compared with 0.05. `for: 30s` demands that the condition holds for 30 seconds without a break, so that a single bad moment wakes nobody up. An alert is therefore in one of three states: **inactive**, **pending** while the condition holds and the 30 seconds have not passed, and **firing** after that.

Apply the file again. Prometheus reads its configuration when it starts, so restart it, and start the port-forward again, because the old one pointed at the pod that is gone:

```
kubectl apply -f k8s/monitoring.yaml
kubectl rollout restart deployment/prometheus
```

The restart also wipes the collected data, because this Prometheus keeps it inside its container. A real installation gives it a disk that survives restarts.

Now cause the problem. While the load generator sends its 950 good requests per second, send bad ones with `ab`. Make a file `bad.json` with a jet of 15 numbers, and run:

```
ab -c 1 -t 70 -p bad.json -T application/json \
   http://localhost:8080/predict
```

`-t 70` makes `ab` run for 70 seconds, and with one connection it sent about 260 requests per second. The page `http://localhost:9090/alerts` showed this in the reference run:

- after 11 seconds, the fraction over the last minute passed 5%
- after 16 seconds, the alert was **pending**
- after 46 seconds, 30 seconds later, it was **firing**
- the fraction levelled off at 22%, which is 260 out of 1,210

The second rule can be tested with `kubectl scale deployment/jet-tagger --replicas=2`. It was pending after 19 seconds and firing 30 seconds after that.

In a real installation a second program, the **Alertmanager**, takes the firing alerts and sends them on as e-mail or chat messages, and decides who is told. Here the alerts page is enough.

One trap is waiting in the first rule. Before the first rejected request ever happens, the series with `status="rejected"` doesn't exist, and a query on a series that doesn't exist returns nothing at all, not zero. Dividing nothing by something gives nothing, so the rule is silent, which is the right outcome here by luck. If you want to draw the ratio, write `(sum(rate(...)) or vector(0))` around the upper part, which replaces an empty result by zero.

## What to watch

For a service that answers requests, three signals cover most problems, and you now have all three. They are known as **RED**:

- **Rate**: requests per second
- **Errors**: the fraction that fail
- **Duration**: the latency, as percentiles

Alert on what callers notice, such as errors and latency, and not on causes such as a busy processor. A pod at 90% that answers quickly is doing its job.

A warning about labels. Every combination of label values is a separate series that Prometheus stores for ever. `status` with two values and `label` with five are fine. A label holding a user name or a request number would create millions of series and bring Prometheus down. Labels are for a small, fixed set of values.

Prometheus draws simple graphs on its query page. Dashboards with many panels are usually built with **Grafana**, a separate program that reads from Prometheus. CERN's IT department runs its monitoring on the same ideas at a much larger scale, and Prometheus and Grafana are everyday tools in its computing teams.

--- practice
@predict
A counter reads 12,000 at the start of a minute and 72,000 at the end of it. What does `rate` over that minute return?
= 1000
=| 1,000
=| 1000.0
! The counter rose by 60,000 in 60 seconds, so 1,000 per second. `rate` always answers per second, whatever the window.

@run
Write `increase(samples)`, the amount by which a counter rose over a list of samples, the way Prometheus counts it. If a value is lower than the one before it, the counter was reset to zero in between, and the whole new value counts as increase. Then write `rate(samples, seconds)`, the increase divided by the length of the window in seconds.
```starter
def increase(samples):
    pass

def rate(samples, seconds):
    pass
```
```test
print(increase([100, 150, 230, 300]), rate([100, 150, 230, 300], 20))
print(increase([100, 150, 20, 60]), rate([100, 150, 20, 60], 20))
print(increase([7]), increase([5, 5, 5]))
```
= 200 10.0
= 110 5.5
= 0 0
```solution
def increase(samples):
    total = 0
    for before, now in zip(samples, samples[1:]):
        if now >= before:
            total += now - before
        else:
            total += now
    return total

def rate(samples, seconds):
    return increase(samples) / seconds
```
! In the second case the counter fell from 150 to 20: the pod restarted. The rise is 50, then 20 after the reset, then 40, which makes 110. `zip(samples, samples[1:])` walks through neighbouring pairs. A gauge can fall without a reset, which is why `rate` must only be used on counters.

@run
Write `bucket_quantile(q, edges, counts)`, the estimate that `histogram_quantile` makes. `edges` are the upper edges of the buckets in rising order, and `counts` the cumulative counts up to each edge. The last count is the total. Find the first bucket whose count reaches the rank `q` times the total, and interpolate in a straight line between the lower edge of that bucket and its upper edge. The lower edge of the first bucket is 0.
```starter
def bucket_quantile(q, edges, counts):
    pass
```
```test
edges = [0.0005, 0.001, 0.0025, 0.005, 0.01]
counts = [882.7, 963.3, 1000.9, 1004.6, 1005.1]
print("%.5f" % bucket_quantile(0.99, edges, counts))
print("%.5f" % bucket_quantile(0.5, edges, counts))
print("%.2f" % bucket_quantile(0.5, [1, 2, 4], [10, 10, 20]))
```
= 0.00227
= 0.00028
= 1.00
```solution
def bucket_quantile(q, edges, counts):
    rank = q * counts[-1]
    lower_edge = 0.0
    lower_count = 0.0
    for edge, count in zip(edges, counts):
        if count >= rank:
            inside = count - lower_count
            fraction = (rank - lower_count) / inside
            return lower_edge + fraction * (edge - lower_edge)
        lower_edge = edge
        lower_count = count
    return edges[-1]
```
! The first two lines reproduce the answers of Prometheus in the lesson: 2.27 ms and 0.28 ms. The estimate assumes that values are spread evenly inside a bucket, so it can never be more exact than the bucket is wide.

@choice
Why does Prometheus need a headless service to scrape the three pods?
- Headless services are faster
- An ordinary service doesn't allow GET requests
* An ordinary service hides the pods behind one address and passes each connection to a random pod. The name of a headless service resolves to the address of every pod, so each can be scraped separately
- Prometheus can't talk to services at all
! Every pod has its own counters. Scraping through the load balancer would read a different pod's numbers each time and mix them into one meaningless series.

@choice
The handler's histogram says p99 = 2.3 ms, and the load generator says p99 = 29.9 ms for the same minutes. Which is right?
- The histogram, because it is measured inside the service
- The load generator, and the histogram must be broken
* Both. The histogram times the handler only. The generator's number also holds the network path, the wait for a worker, parsing, validation and the response
- Neither, because percentiles can't be compared
! They measure different stretches of the same journey. The caller's experience is the outer number, and the inner one tells you how much of it your own code causes.

@choice
Which of these would be a dangerous label for a metric?
- `status`, with the values ok and rejected
- `label`, with the five jet classes
* `request_id`, with a different value for every request
- `version`, with the release of the service
! Every label value creates a new time series. A label with endless values creates endless series, and Prometheus runs out of memory.

@local
Add the three metrics and the `/metrics` endpoint to the service. Start it, send one good jet and one jet with 15 numbers, and paste the lines of `/metrics` that start with `tagger_requests_total` or `tagger_request_seconds`.
min: 6
= tagger_requests_total{status="ok"}
= tagger_requests_total{status="rejected"}
= tagger_request_seconds_count
! Add a test as well: read `/metrics`, send a request, read it again, and assert that the count for `ok` rose by exactly one.

@local
Build the image with the metrics as version 0.3, roll it out, apply `k8s/monitoring.yaml`, and run the load generator with 8 connections for three minutes. Type the queries of the lesson into Prometheus and write down, each on a line that starts with the given word: `targets` and the number of targets that are up, `rate` and the total requests per second, `pods` and the rate of each of the three pods, `p99` and the 99th percentile of the handler in milliseconds.
min: 4
= targets
= rate
= pods
= p99
! Compare the total rate with what the load generator printed. They should agree within a few percent. If Prometheus shows no targets, look at its targets page: the error message there usually names the cause, such as a wrong service name.

@local
Add the two alert rules, restart Prometheus, and make `TaggerRejectsTooMany` fire by sending bad requests next to the normal load. Paste the command you used for the bad requests, and note the time from the first bad request until the alert was pending and until it was firing. Start those two lines with `pending` and `firing`.
min: 3
= pending
= firing
! The alert needs the fraction over a full minute to pass 5% and then 30 more seconds, so expect it to fire after 40 to 60 seconds. If it never turns pending, check the indentation of `rules.yml` and look for an error on the alerts page.

@write
The three pods of the service show 419, 184 and 402 requests per second under the load generator. Explain in your own words why the load is uneven although the service balances it, and when it would even out.
min: 40
```solution
A Kubernetes service does not balance requests. It balances connections: each new connection is assigned to one pod at random and stays there for as long as it is open. The load generator opens only 8 connections and keeps them for the whole run, so the split is the result of 8 random choices among 3 pods, and something like 3, 3 and 2, or 4, 3 and 1, is to be expected. Every connection then carries a steady stream of requests to its pod. With many callers that open connections often, or with connections that are closed and reopened from time to time, the random choices average out and the pods get nearly equal load.
```
! The key distinction is between a connection and a request. Keep-alive makes clients fast and makes this kind of balancing coarse.
--- recall
Q: What are a counter, a gauge and a histogram?
A: A counter only rises and is read through its rate. A gauge goes up and down. A histogram counts observations into cumulative buckets and is used for latencies.
Q: How does Prometheus get its data?
A: It scrapes: every few seconds it sends a GET to the /metrics endpoint of each target and stores the numbers with a timestamp. The services don't push anything.
Q: What does rate(counter[1m]) compute?
A: The increase of the counter over the last minute, per second, with resets to zero handled.
Q: Write the query for the p99 latency from a histogram, summed over all pods.
A: histogram_quantile(0.99, sum by (le) (rate(tagger_request_seconds_bucket[1m])))
Q: How exact is a quantile from a histogram?
A: Only as exact as its buckets are wide. Prometheus finds the bucket that holds the rank and interpolates in a straight line inside it.
Q: What are the three states of an alert, and what is "for" in a rule?
A: Inactive, pending and firing. "for" is how long the condition must hold without a break before the alert goes from pending to firing.
Q: Why does a handler's histogram show far lower latencies than a load generator?
A: It only times the handler. The network path, the waiting, the parsing and validation, and the response lie outside it.
Q: What does RED stand for?
A: Rate, errors and duration: requests per second, the fraction that fail, and the latency percentiles. They are the three signals to watch for a service.
Q: Why must labels have few possible values?
A: Each combination of label values is a separate time series. Labels such as user names or request numbers create millions of series.

=== sy7 | sys | 20 | How CERN computes: batch, the Grid, storage and the cloud | 
## A map for your first week

Whatever project a summer student gets, it sits somewhere in CERN's computing landscape, and the first days are full of names: lxplus, HTCondor, EOS, CVMFS, the Grid. This lesson is the map. For each system it says what problem it solves and how it relates to what you have built in this programme.

Most of these systems sit behind a CERN account, so you can't practise them at home, and the lesson is shorter on exercises than the others. The numbers in it are CERN's own, from its public web pages and training material. They change every year, and the proportions don't.

## The size of the problem

The experiments record collisions around the clock for most of the year. During the LHC's second run, CERN's data centre processed on average one petabyte of data per day. A petabyte is a million gigabytes. Every recorded event has to be stored, reconstructed, often reprocessed with better calibrations, and matched by simulated events. No single computing centre can do that, and no physicist could wait for one that tried. The answer has three layers: batch computing at CERN, a worldwide federation of computing centres, and storage systems built for the purpose.

## Interactive work and batch work

There are two ways to use a computing centre.

**Interactive** work is what you do on your laptop: type a command and see the answer. CERN's service for it is **lxplus**, a group of Linux machines that every CERN user can log in to with `ssh`. It is for editing, compiling and small tests. Thousands of people share it, so a program that runs for hours on all cores does not belong there.

**Batch** work is the opposite style. You describe a **job**: which program to run, with which arguments, and where its output should go. You hand the description to a **scheduler**, which keeps a queue of everybody's jobs, and runs each one on some machine as soon as one is free. You are not there when it runs, and you collect the output files afterwards.

CERN's batch service is built on **HTCondor**, an open-source batch system. In 2025 it had about 400,000 processor cores in about 5,000 machines and completed more than a million jobs every day. A job is described in a small text file:

```
executable = run.sh
arguments  = $(ProcId)
output     = out/job.$(ProcId).out
error      = out/job.$(ProcId).err
log        = out/jobs.log
+JobFlavour = "microcentury"
queue 100
```

- `executable` is the program to run, here a shell script.
- `queue 100` at the end asks for one hundred jobs from this one description.
- `$(ProcId)` is replaced by the number of each job, from 0 to 99. As an argument it tells each job which piece of the work is its own, for example which input file to read.
- `output` and `error` name the files that receive what the job prints, and `log` the file in which HTCondor notes what happened to the jobs.
- `+JobFlavour` sets the longest time a job may run. The flavours have names that people at CERN use daily: `espresso` is 20 minutes, `microcentury` 1 hour, `longlunch` 2 hours, `workday` 8 hours, `tomorrow` 1 day, `testmatch` 3 days and `nextweek` 1 week. A job that runs longer than its flavour is removed. If you name none, you get `espresso`.

`condor_submit job.sub` hands the file to the scheduler, and `condor_q` shows your jobs in the queue. Unless you ask for more, a job gets one core, 3 GiB of memory and 20 GiB of disk.

Why does physics fit this style so well? Because collisions are independent of each other. A hundred jobs that each process one file never need to talk to one another, and the work can be cut into as many pieces as there are machines. Your event processor of Project 2 is exactly the kind of program that runs inside such a job, a million times a day.

## High throughput and high performance

Batch systems of this kind do **high-throughput computing**, HTC: a very large number of independent jobs, and what counts is how many get done per day.

**High-performance computing**, HPC, is a different problem: one single computation that is too big for one machine and is spread over many, which exchange data all the time while they run. Simulating the air flow in a cooling system or the fields in an accelerator cavity works like that. Such programs are usually written with **MPI**, a standard for sending messages between the processes of one computation, and they need machines with a very fast network between them. The threads and OpenMP of week 13 are parallelism inside one machine. MPI is parallelism across machines.

CERN has an HPC service too, run with the scheduler **Slurm**. In the words of its documentation it is more specialised and has fewer resources than the batch system, because most of CERN's work is of the first kind. Supercomputing centres around the world are almost entirely of the second kind, and the experiments increasingly run parts of their work there.

## The Grid

The **Worldwide LHC Computing Grid**, the WLCG, ties the computing centres of the institutes that take part in the LHC into one system. CERN describes it as about 1.4 million processor cores and 1.5 exabytes of storage at over 170 sites in 42 countries, running over two million tasks a day. An exabyte is a thousand petabytes. CERN itself provides about a fifth of the whole.

The sites are organised in **tiers**:

- **Tier-0** is the CERN data centre. It keeps the first copy of the raw data and does the first reconstruction.
- **Tier-1** are fifteen large centres with round-the-clock support. They keep copies of the data and reprocess it.
- **Tier-2** are universities and institutes. They run simulation and analysis.
- **Tier-3** are local clusters and single machines that physicists use, without formal commitments.

Three ideas hold it together.

**Jobs go to the data.** A job description is a few kilobytes and a data set can be many terabytes. So an analysis job is sent to a site that already holds a copy of the files it needs.

**A catalogue knows where everything is.** **Rucio** is the system that records which file has copies at which sites, creates and deletes copies according to rules, and moves data between sites. The transfers are large: at the end of the last long shutdown, the global rate passed 260 gigabytes per second.

**The software is everywhere.** A job that lands on a machine in another country needs the experiment's software in exactly the right version. **CVMFS**, the CernVM File System, makes software appear as an ordinary read-only folder, `/cvmfs`, on every machine of the Grid. Files are fetched over HTTP the first time they are opened and kept in a local cache. Together with containers, it is the answer to "it works on my machine" at the scale of 170 sites.

## Storage

**Disk.** CERN's disk storage system is **EOS**, developed at CERN and open source. In September 2023 its capacity passed one exabyte, on 111,000 devices, most of them hard disks. Users see it as a folder tree under `/eos`, and programs read from it over the network with the **XRootD** protocol, whose addresses start with `root://`. ROOT opens such addresses directly, and uproot does with one extra package.

**Tape.** The main medium for long-term storage is magnetic tape, managed by the CERN Tape Archive, **CTA**. That sounds old-fashioned and is sound engineering: tape costs the least per byte, needs no electricity while it sits on a shelf, and lasts for decades. The price is access time. A robot has to fetch the cartridge and wind it to the right place, so tape is for data that is written once and read rarely. Raw data goes to tape, and the copies that analyses read every day stay on disk.

**Object storage.** A third kind of storage has no folders at all. An **object store** keeps whole objects, each under a name called a key, inside containers called **buckets**, and you read or write an object in one piece over HTTP. The interface that Amazon defined for its S3 service has become the common language, and many systems speak it. Object stores hold things like container images, backups and the data sets of machine-learning projects.

**Databases.** Everything that needs questions like those of week 18, such as which run had which conditions, sits in relational databases.

## Cloud and Kubernetes

CERN's IT department runs a private cloud: its own data centres, operated in the way public clouds are, on the open-source software **OpenStack**. A user asks for a virtual machine and has one a few minutes later. On top of that cloud, IT offers Kubernetes clusters as a service, and a platform for web applications based on OpenShift.

This is where week 19 pays off. A cluster at CERN is far bigger than your kind cluster and has rules that yours didn't need, such as quotas, a registry for images and limits on what a container may do. The objects and the commands are the same. Somebody who has written a deployment with probes, done a rolling update and read the logs of a crashing pod can start working on such a cluster on the first day.

A related service that students meet early is **SWAN**: Jupyter notebooks in the browser, with EOS and CVMFS already attached.

## Messaging

One more building block appears in many IT projects. When one program has to hand data to another, the direct way is a request, as in your service. The other way is a **message queue**: the sender writes messages into a named stream, called a **topic**, and one or more receivers read from it when they are ready. The best-known system of this kind is **Apache Kafka**.

A queue decouples the two sides. The sender doesn't wait for the receiver, a burst of messages piles up in the topic without overloading anybody, and a receiver that restarts continues where it stopped, because Kafka remembers its position. CERN's central monitoring, which collects metrics and logs from the machines of the data centre, moves its data through Kafka.

## Where your projects sit on this map

- Project 2, the fast event loop in C++, is the kind of code that runs inside batch and Grid jobs. Its speed is multiplied by a million jobs a day.
- Project 3, the small tagger, belongs to the trigger and to the machine-learning services of the experiments.
- Project 4, the service on Kubernetes with monitoring, is how the IT department runs its own services.
- The measurement habits of all three, such as benchmarks with their conditions and latency in percentiles, are what an openlab project that evaluates new hardware consists of.

## What you can try without an account

Most of this needs a CERN account, and three things don't. The CERN Open Data portal, which you have used since Project 1, serves real files over XRootD. HTCondor can be installed on one machine for learning, and its manual has a quick start. And the best preparation is the one you have done: a batch job is a script that runs without you, reads its input from arguments, writes its output to files and exits with a meaningful status. Every project of this programme has been built that way.

--- practice
@choice
You have to process 500 files, and each takes 40 minutes on one core. Where does that work belong?
- On lxplus, started in 500 terminal windows
- On your laptop, overnight
* On the batch system, as 500 jobs from one description
- On the HPC cluster, as one MPI program
! The files are independent, so this is high-throughput work: one description with `queue 500`, each job taking its file number from `$(ProcId)`. lxplus is shared and meant for interactive work, and nothing here needs processes that talk to each other.

@predict
A submit file ends with `queue 100` and passes `$(ProcId)` as the argument. What is the largest argument that any of the jobs receives?
= 99
! The jobs are numbered from 0, like the indices of a Python list, so the hundred jobs get 0 to 99.

@run
Write `pick_flavour(minutes)`, which returns the name of the shortest job flavour that allows a job of that many minutes: espresso 20 minutes, microcentury 1 hour, longlunch 2 hours, workday 8 hours, tomorrow 1 day, testmatch 3 days, nextweek 1 week. Return `None` if nothing is long enough.
```starter
def pick_flavour(minutes):
    pass
```
```test
print(pick_flavour(5), pick_flavour(20), pick_flavour(21))
print(pick_flavour(90), pick_flavour(480), pick_flavour(481))
print(pick_flavour(4000), pick_flavour(10080), pick_flavour(20000))
```
= espresso espresso microcentury
= longlunch workday tomorrow
= testmatch nextweek None
```solution
FLAVOURS = [("espresso", 20), ("microcentury", 60), ("longlunch", 120),
            ("workday", 480), ("tomorrow", 1440), ("testmatch", 4320),
            ("nextweek", 10080)]

def pick_flavour(minutes):
    for name, limit in FLAVOURS:
        if minutes <= limit:
            return name
    return None
```
! A list of pairs in rising order and the first one that fits. In practice you would add a safety margin, because a job that passes its limit is removed and its work is lost. If a job needs more than a week, it should be cut into smaller jobs.

@choice
Which of these is a high-performance computing problem and not a high-throughput one?
- Reconstructing ten million collision events
- Training a thousand small networks with different settings
* Simulating the air flow through a detector hall, where every region of the air affects its neighbours at every step
- Converting 20,000 files from one format to another
! In the three other cases the pieces of work are independent and can run as separate jobs. The air flow is one computation whose parts must exchange data constantly, which is what MPI and a fast network are for.

@choice
Why are analysis jobs on the Grid sent to the site that holds the data, and the data not sent to the job?
- Sites refuse to share data
* A job description is tiny and a data set is huge, so moving the job is far cheaper and faster than moving the data
- Jobs can only run at Tier-1 sites
- It makes the catalogue simpler
! Moving terabytes takes hours even on fast links, and a job description arrives in an instant. Rucio's catalogue is what tells the system where the copies are.

@choice
Raw data from the detector is written once and then read a few times over many years. Which storage fits?
- An object store
- The disks of lxplus
* Tape: the cheapest medium per byte, with no power used at rest, at the price of slow access
- A relational database
! Tape is for data that is kept for a long time and read rarely. The copies that analyses read every day are kept on disk, in EOS.

@write
A friend asks what happens between typing `condor_submit job.sub` and finding the results. Explain it in your own words, including what a job flavour is for.
min: 50
```solution
The command hands the description of my jobs to a scheduler. The description names the program, its arguments, the files for its output and how many copies I want. The scheduler puts the jobs into a queue with everybody else's. Whenever one of the thousands of machines of the batch system has a free core, the scheduler starts one of the waiting jobs there. I am not connected while it runs. What the job prints goes into the output and error files that I named, and its results into whatever files the program writes. The job flavour tells the scheduler the longest time my job may take, which helps it plan, and a job that exceeds it is removed. With condor_q I can watch my jobs move from waiting to running to done.
```
! The points that matter: a description and not a session, a queue shared by all, any free machine, output in files, and a time limit you choose.
--- recall
Q: What is the difference between interactive and batch work?
A: Interactive: you type and wait for the answer, as on lxplus. Batch: you describe a job, a scheduler runs it on a free machine when it can, and you collect the output files later.
Q: Which batch system does CERN use, and which two commands submit and list jobs?
A: HTCondor. condor_submit with a submit file, and condor_q.
Q: What is a job flavour? Name three.
A: The longest time a job may run. espresso is 20 minutes, microcentury 1 hour, longlunch 2 hours, workday 8 hours, tomorrow 1 day, testmatch 3 days, nextweek 1 week.
Q: What is the difference between HTC and HPC?
A: High-throughput computing runs very many independent jobs. High-performance computing runs one large computation across many machines that exchange data constantly, usually with MPI.
Q: What are the tiers of the WLCG?
A: Tier-0 is CERN, with the first copy of the raw data and the first reconstruction. Fifteen Tier-1 centres keep copies and reprocess. Tier-2 sites at universities run simulation and analysis. Tier-3 are local resources.
Q: What do Rucio and CVMFS do?
A: Rucio is the catalogue that knows which file is at which site and moves copies. CVMFS delivers the experiments' software to every machine as a read-only folder that is fetched on demand.
Q: What are EOS and CTA, and when is each used?
A: EOS is CERN's disk storage, for data that is read often. CTA is the tape archive, for long-term storage of data that is read rarely.
Q: What does a message queue such as Kafka give you compared with a direct request?
A: It decouples sender and receiver: the sender doesn't wait, bursts are buffered in the topic, and a receiver can restart and continue from its position.

=== os1 | linux | 21 | Reading a large codebase | p61,p62,p63,p64
## The first week of every project

Whatever project you get as a summer student, it starts the same way: somebody sends you a link to a repository. It has tens of thousands of lines, several years of history and dozens of authors, and your task is somewhere inside it. Every program in this plan so far was one you wrote yourself. This week that changes, and it is the largest step in the whole plan, because this is what the work at CERN looks like.

Nobody reads such a codebase from top to bottom, and nobody expects you to. What a supervisor hopes to see in your first week is something else: that you can take one concrete question about the code and come back with the answer and the evidence for it, without somebody sitting next to you. That is a method, and it can be learned. This lesson teaches it in seven steps and carries out every step on a real codebase from CERN, with the real output.

You need Git, `grep` and an editor. Nothing has to be installed, and that is deliberate: most of what you need to know about a codebase can be found without running it.

## The codebase: Salt

**Salt** is a framework from the flavour-tagging group of the ATLAS experiment. **Flavour tagging** means deciding which kind of quark a jet came from: a b quark, a c quark or a lighter one. It is the same kind of problem as your jet tagger of weeks 15 to 17, where a network gets a jet and says what started it. Yours reads sixteen numbers per jet. The networks trained with Salt read the individual tracks inside the jet. Salt's README describes it as a framework for training multi-modal and multi-task models in the style of GN2, which is one of ATLAS's tagging networks.

Salt is public under the MIT licence and described in an article in the Journal of Open Source Software. Its documentation is at [ftag-salt.docs.cern.ch](https://ftag-salt.docs.cern.ch/). Get the code:

```
git clone https://gitlab.cern.ch/aft/algorithms/salt.git
cd salt
git switch --detach 0.15.0
```

```
HEAD is now at 8b460af Bump version
```

The third command needs an explanation. A **tag** is a fixed name for one commit. Projects tag their releases, and `0.15.0` is the release that this lesson was written with. `git switch --detach 0.15.0` makes your working folder show exactly that commit. You are then on no branch at all: `HEAD`, Git's name for the place where you are, points straight at a commit. Git calls this a **detached HEAD**. It is the right state for reading an old version, and the wrong one for committing. The project has moved on since, so on its `main` branch the line numbers differ. On the tag, every number below is the one you will see.

The clone took 4 seconds in the reference run and its `.git` folder has 16 MB.

## Step 1: measure before you read

Before you open a single file, find out how big the thing is and where its weight lies. It takes a quarter of an hour and saves days of reading in the wrong place.

```
git ls-files | wc -l
git ls-files '*.py' | wc -l
git ls-files '*.py' | xargs cat | wc -l
```

```
195
99
23474
```

- `git ls-files` lists every file that Git tracks, one per line. With a pattern such as `'*.py'` it lists only the files that match. The quotes matter: without them the shell would replace `*.py` by the Python files of the current folder before Git ever saw the pattern.
- `wc -l` counts the lines that it receives. You know it from week 3.
- `xargs` is new. It reads lines and puts them as arguments behind the command that follows it. So `xargs cat` runs `cat` with all 99 file names, `cat` prints their contents one after the other, and `wc -l` counts.

So Salt has 195 files, 99 of them Python, with 23,474 lines of Python. Where are they?

```
git ls-files '*.py' | cut -d/ -f1-2 | sort | uniq -c | sort -rn
```

```
     27 salt/tests
     23 salt/utils
     20 salt/models
     11 salt/callbacks
      5 salt/data
      4 salt/submit
      3 salt/onnx
      2 salt/optim
      1 salt/stypes.py
      1 salt/modelwrapper.py
      1 salt/main.py
      1 salt/__init__.py
```

`cut -d/ -f1-2` cuts every path at the slashes and keeps the first two pieces, so `salt/models/task.py` becomes `salt/models`. The rest is the counting pipeline of week 3: `sort` puts equal lines next to each other, `uniq -c` collapses them with a count, and `sort -rn` puts the largest count first.

Three things can be read from this list without opening a file. 27 of the 99 files are in the test folder, so this is a tested codebase, and the tests will be worth reading. The models have a folder of their own with 20 files, which is probably the heart. And one file lies alone at the top with the name `main.py`.

Now the largest files and the size of the history:

```
git ls-files '*.py' | xargs wc -l | sort -rn | head -6
git rev-list --count HEAD
git shortlog -sn HEAD | wc -l
```

```
 23474 total
  1114 salt/onnx/to_onnx.py
  1099 salt/data/datasets.py
  1070 salt/tests/test_datasets.py
  1039 salt/models/task.py
  1001 salt/tests/test_to_onnx.py
922
55
```

- `git rev-list --count HEAD` counts the commits that lead up to the one you are on: 922.
- `git shortlog -sn` prints one line per author with the number of their commits, so counting its lines counts the authors: 55.

The last measurement is the most useful one. Which files change most often?

```
git log --format= --name-only | grep -v '^$' | sort | uniq -c | sort -rn | head -5
```

```
     74 salt/data/datasets.py
     72 salt/utils/cli.py
     69 salt/models/task.py
     68 salt/callbacks/predictionwriter.py
     57 salt/tests/test_pipeline.py
```

`git log --name-only` lists, for every commit, the files that it changed. `--format=` with nothing behind the equals sign suppresses everything else about the commit. `grep -v '^$'` removes the empty lines in between: `^` stands for the start of a line and `$` for its end, so `^$` is a line with nothing in it, and `-v` keeps the lines that do not match.

Files that were changed 70 times are where the work happens. A new feature will very likely touch one of them, and so will your project. Note the first of them, `salt/data/datasets.py`: it is both one of the largest files and the one that changes most. If you had to guess where the bugs are, start there.

## Step 2: read what the authors wrote for you

Three things were written for a reader like you, and they come before any source file: the `README.md`, the documentation, which here is the `docs` folder with 19 files, and `pyproject.toml`.

`pyproject.toml` is the file that describes a Python package: its name, its version, the packages it depends on and the commands it installs. The last part is a table of contents for the whole codebase:

```
grep -n -A7 "project.scripts" pyproject.toml
```

```
83:[project.scripts]
84-salt = "salt.main:main"
85-to_onnx = "salt.onnx.to_onnx:main"
86-get_onnx_metadata = "salt.utils.get_onnx_metadata:main"
87-compare_models = "salt.utils.compare_models:main"
88-repair_ckpt = "salt.utils.repair_ckpt:main"
89-setup_mup = "salt.utils.mup_utils.main_mup:main"
90-download_S3 = "salt.utils.file_utils:download_from_S3"
```

`-A7` tells `grep` to print the 7 lines after each match as well. The matching line is marked with a colon behind its number, and the lines that follow with a dash.

Each line reads: installing the package creates a command with the name on the left, and running that command calls the function on the right. `salt.main:main` is the function `main` in the module `salt.main`, which is the file `salt/main.py`. Such a line is called an **entry point**. Salt has seven of them, and each is a door into the code. Whatever a user does with Salt begins at one of these seven functions.

The dependencies in the same file give you the vocabulary. Among them are `torch`, `lightning`, `onnx`, `onnxruntime`, `h5py` and `jsonargparse`. You know the first, third and fourth from weeks 15 and 17. **Lightning** is a library on top of PyTorch that takes the training loop out of your hands, and it will matter in a minute.

## Step 3: ask one question

You can't understand "the code". You can answer a question. The whole method depends on choosing one that follows a single path from a door to a result. This is the one for this lesson:

**When I run `salt fit`, where is the loss computed, and which loss is it?**

`salt fit --config configs/GN2/GN2.yaml` is the command that starts a training, according to `docs/training.md`. Write the question at the top of a file called `NOTES.md` outside the repository. Every answer that you find goes below it with the file and the line where you found it. In two weeks you won't remember any of it, and your notes will.

## Step 4: follow the path with git grep

`git grep` is `grep` for a repository: it searches only the tracked files, it is fast, and with `-n` it prints the file, the line number and the line. It will be the command that you type most often in your first weeks.

The door is `salt/main.py`. It has 38 lines, and its body is one call:

```
    SaltCLI(
        model_class=ModelWrapper,
        datamodule_class=SaltDataModule,
        save_config_callback=SaveConfigCallback,
        args=args,
```

No loop, no loss. There are two names to follow. Find where they are defined:

```
git grep -n "class SaltCLI"
git grep -n "class ModelWrapper"
```

```
salt/utils/cli.py:104:class SaltCLI(LightningCLI):
salt/modelwrapper.py:47:class ModelWrapper(lightning.LightningModule):
```

Both inherit from a class of Lightning. A `LightningCLI` reads the command line and the configuration files, builds the model, the data and a `Trainer` from them, and runs the subcommand, here `fit`. The loop over epochs and batches that you wrote by hand in week 15 is inside Lightning.

That is the most important thing to understand about code that is built on a framework: **you don't call the framework, the framework calls you.** You write a class with methods whose names the framework prescribes, and it calls them at the right moments. Lightning's contract says that a method named `training_step` gets one batch and returns the loss for it, alone or inside a dictionary. So search for it:

```
git grep -n "def training_step"
git grep -n "training_step("
```

Both commands print the same single line:

```
salt/modelwrapper.py:425:    def training_step(self, batch: tuple) -> dict[str, Any]:
```

Defined once, and called nowhere in the whole repository. When you search for the caller of a function and find none, the caller is in a framework. Such a method is called a **hook**, and the principle has a name, **inversion of control**. Without it in mind you would search for a call that does not exist.

From here on it is ordinary reading. `training_step` calls `self.shared_step(batch)`, and `shared_step` contains these lines:

```
        inputs, pad_masks, labels = batch
        preds, loss = self(inputs, pad_masks, labels)
        ...
        loss["loss"] = self.total_loss(loss)
```

`self(...)` on a PyTorch module runs its `forward` method, as you saw in week 15. The `forward` of `ModelWrapper` ends with `return self.model(x, pad_masks, labels)`, and so on. Every link is found the same way: read the function, pick the one call that leads towards your question, and look up its definition with `git grep -n "def name"`. After twenty minutes the notes hold a map:

```
salt fit --config configs/GN2/GN2.yaml
  pyproject.toml:84             salt = "salt.main:main"
  salt/main.py:14               main() creates a SaltCLI
  salt/utils/cli.py:104         class SaltCLI(LightningCLI)
      Lightning builds model and trainer, runs the loop,
      and calls for every batch:
  salt/modelwrapper.py:425      training_step(batch)
  salt/modelwrapper.py:373      shared_step(batch)
  salt/modelwrapper.py:247      forward(): normalise, call self.model
  salt/models/saltmodel.py:95   SaltModel.forward()
  salt/models/saltmodel.py:186  run_tasks(): loop over the tasks
  salt/models/task.py:172       ClassificationTask.forward()
  salt/models/task.py:234       loss = self.loss(preds, labels)
  salt/modelwrapper.py:209      total_loss(): add up the losses
```

This is what an answer looks like: a chain of places, each with a file and a line that anybody can check. It has eleven entries, in a codebase of 23,474 lines. Most of those lines you never opened, and you did not need to.

Two things in the map came from reading the middle of the chain. `SaltModel.forward` embeds the inputs, runs them through an encoder, pools the tracks of a jet into one vector and then calls `run_tasks`. And `run_tasks` loops over a list of **tasks**, each of which computes its own predictions and its own loss. That is the "multi-task" of the README: one network with several things to learn at once.

## Step 5: when the code doesn't say, the configuration does

The map ends at `self.loss(preds, labels)`, and the second half of the question is still open: which loss? Search for the one you would expect:

```
git grep -l "CrossEntropyLoss" -- '*.py'
git grep -l "CrossEntropyLoss" -- '*.yaml' | wc -l
```

```
salt/tests/test_callbacks_writers.py
salt/tests/test_tasks.py
salt/tests/test_to_onnx.py
39
```

`-l` prints only the names of the files that contain a match. The two dashes separate the search text from the files to search in, and `'*.py'` restricts the search to Python files.

So the only Python files that name the loss are tests, and 39 YAML files name it. The package's own code never says which loss it uses. Look into one of the 39, the configuration that the training command was given:

```
            - class_path: salt.models.ClassificationTask
              init_args:
                name: jets_classification
                input_name: jets
                label: flavour_label
                use_class_dict: True
                loss:
                  class_path: torch.nn.CrossEntropyLoss
```

Those are lines 45 to 52 of `salt/configs/GN2/GN2.yaml`. `class_path` names a class by its import path, and `init_args` holds the arguments for its constructor. When the program starts, the command-line layer reads this file, imports every class that is named in it and creates the objects. `ClassificationTask` gets a finished loss object handed in as its argument `loss`, and line 234 of `task.py` calls whatever it was given.

So the answer to "which loss" is: the one that the configuration names. For `GN2.yaml` the file lists three tasks. The flavour of the jet is learned with cross-entropy, the loss of your own tagger. The origin of each track is learned with cross-entropy as well and counts with a weight of 0.5. Which tracks come from the same vertex is learned with `BCEWithLogitsLoss` and a weight of 1.5. Each task multiplies its loss by its weight, and `total_loss` adds the three up.

This is how most large scientific codes are built: **the Python defines the parts, and the configuration assembles them.** The consequence for reading is simple and easy to forget. Search the configuration files as well as the code:

```
git grep -l "ClassificationTask" -- '*.py' | wc -l
git grep -l "ClassificationTask" -- '*.yaml' | wc -l
```

```
7
39
```

## Step 6: from an error message to the code

Half of the questions in a first week don't start from a command. They start from a message on the screen. Suppose a training stops with `RuntimeError: Loss is NaN`. An error message is an entry point too, because its text is somewhere in the code:

```
git grep -n "Loss is NaN"
```

```
salt/modelwrapper.py:446:                "Loss is NaN - check dataset for NaNs or infs. "
```

Line 446 is inside `training_step`, which you already know:

```
        preds, labels, pad_masks, loss = self.shared_step(batch)
        if loss["loss"].isnan():
            raise RuntimeError(
                "Loss is NaN - check dataset for NaNs or infs. "
                "See 'docs/training.md - NaNs' for more info."
            )
```

Within a minute you know which condition raised the error, that it is checked after every batch, and that the authors wrote a section of documentation for exactly this case. Search for the fixed words of a message and leave out the parts that change, such as numbers and file names, because those are filled in while the program runs.

## Step 7: tests show how the code is meant to be used

Salt has 26 test files with 310 test functions. For a reader they are the best documentation there is: a test shows how a function is called, with inputs small enough to understand, and it states what the authors promise. And unlike a comment, a test can't go out of date without somebody noticing, because it runs.

Take something that you have done yourself. In week 17 you exported your tagger to ONNX and checked that PyTorch and ONNX Runtime give the same numbers. Does a framework that is used for real physics do the same?

```
git grep -n "compare_outputs("
```

```
salt/onnx/check.py:174:def compare_outputs(
salt/onnx/to_onnx.py:993:    compare_outputs(
salt/tests/test_to_onnx.py:619:    compare_outputs(
salt/tests/test_to_onnx.py:855:    def fake_compare_outputs(*args, **kwargs):
```

It does. The function is defined once, called by the export command itself, so that every export is checked, and called by a test. Its documentation string says that it validates that the PyTorch and ONNX models match across many synthetic cases. The code below runs both models on inputs with 0 to 39 tracks, ten times each, and compares the outputs with `np.testing.assert_allclose` and tolerances of 1e-4. Your check of week 17 was the same idea with one input file.

The fourth line is a different function whose name happens to contain the search text. `grep` matches text, and it knows nothing about meaning. Read the results before you count them.

## The history is documentation too

Every line of a repository was written by somebody for a reason, and Git remembers both. Three commands dig it out.

`git blame` shows for every line of a file the commit that last changed it. `-L 1054,1056` limits the output to those lines, and `-s` leaves out the names and dates:

```
git blame -s -L 1054,1056 salt/onnx/to_onnx.py
```

```
623cf6fc salt/onnx/to_onnx.py 1054)     # Load and validate the ONNX graph
07185dc8 salt/onnx/to_onnx.py 1055)     onnx_model = decompose_softmax(onnx.load(onnx_path))
3ebaedcc salt/to_onnx.py      1056)     onnx.checker.check_model(onnx_model)
```

Three neighbouring lines come from three different commits. Line 1055 looks odd: why would an export take the softmax apart? Ask the history when that function first appeared. `git log -S"text"` lists the commits that changed how often the text occurs, which means the commits that added or removed it:

```
git log --oneline -S"decompose_softmax"
git show --stat --format="%h %ad %s" --date=short 07185dc
```

```
07185dc Decompose Softmax in the ONNX export so outputs do not depend on the CPU
07185dc 2026-10-22 Decompose Softmax in the ONNX export so outputs do not depend on the CPU

 docs/export.md             |  1 +
 salt/onnx/softmax.py       | 43 +++++++++++++++++++++++++++++++++++++++++++
 salt/onnx/to_onnx.py       |  5 ++++-
 salt/tests/test_to_onnx.py | 25 +++++++++++++++++++++++++
 4 files changed, 73 insertions(+), 1 deletion(-)
```

`git show` prints one commit. `--stat` replaces the full changes by a summary per file, and the format asks for the short ID (`%h`), the date (`%ad`) and the subject line (`%s`).

One commit, 73 lines, and it tells a complete story. The subject says what and why. The new file `salt/onnx/softmax.py` holds the function, and its documentation string gives the reason: according to the authors, ONNX Runtime's softmax adds its numbers in a different order on processors with and without AVX-512, so the same model gave slightly different outputs on different machines. You met both halves of that sentence in this plan. AVX-512 is one of the SIMD instruction sets of week 12, and that the order of additions changes a floating-point result is what you saw in week 17, when PyTorch and ONNX Runtime differed in the seventh digit. The commit also adds a line of documentation and 25 lines of tests. That is what a complete change looks like, and it is the model for your own pull request this week.

The third command is for files that have moved. Look again at the `git blame` output: line 1056 names the file as `salt/to_onnx.py`, a path that no longer exists. The file was moved, and `git log` on a path stops at the move unless you tell it otherwise:

```
git log --oneline -- salt/onnx/to_onnx.py | wc -l
git log --oneline --follow -- salt/onnx/to_onnx.py | wc -l
```

```
25
67
```

`--follow` continues through renames. Without it you would have seen 25 of 67 commits and believed that the file was young.

## When reading is not enough: the debugger

Some questions are about what happens while the program runs: which values a variable has, and who called this function. For those you stop the program in the middle and look around. Python has a debugger built in, called `pdb`, and one line starts it: `breakpoint()`.

Installing Salt needs PyTorch and a machine with some power, so this part uses a program that is already running on your computer: the service of Project 4. Put `breakpoint()` as the first line of your `predict` function and run one test. The `-s` tells pytest not to capture input and output, which the debugger needs:

```
python -m pytest -q -s tests/test_api.py::test_predict_one
```

The program stops at your line and shows a prompt, `(Pdb)`. The first command to type is `where`:

```
(Pdb) where
  .../python3.13/threading.py(1015)_bootstrap()
-> self._bootstrap_inner()
  .../python3.13/threading.py(1044)_bootstrap_inner()
-> self.run()
  .../site-packages/anyio/_backends/_asyncio.py(1100)run()
-> result = context.run(func, *args)
  .../site-packages/fastapi/telemetry/_api.py(244)_run_sync_endpoint()
-> return function(**arguments)
> app/main.py(52)predict()
-> breakpoint()
```

This is the **call stack**: the chain of function calls that are active at this moment, the outermost first. Each entry is called a **frame** and takes two lines: the file, the line number and the function, and below it the line that is being executed. Read it from the bottom. You are in `predict`. It was called by a function of FastAPI, which was called by `run` in a library named anyio, which runs inside a thread. In week 18 you were told that a handler written with `def` is handed to a thread. Here you see it. The paths are shortened in this listing, and the file names inside the libraries depend on the versions that you have installed.

The commands that you need are few:

- `p expression` prints the value of any expression.
- `n` runs the next line and stops again. `s` does the same but steps into a function that the line calls.
- `up` and `down` move along the stack to the caller and back, so that you can look at the caller's variables.
- `l` lists the source around the current line.
- `c` continues until the next breakpoint or the end, and `q` quits.

The session of the reference project, with the long lines left out:

```
(Pdb) p len(request.jets)
1
(Pdb) n
> app/main.py(53)predict()
(Pdb) n
> app/main.py(57)predict()
(Pdb) n
> app/main.py(58)predict()
(Pdb) p x.shape
(1, 16)
(Pdb) n
> app/main.py(59)predict()
(Pdb) p p.round(3)
array([[0.008, 0.838, 0.069, 0.082, 0.003]], dtype=float32)
(Pdb) up
> .../site-packages/fastapi/telemetry/_api.py(244)_run_sync_endpoint()
-> return function(**arguments)
(Pdb) p function
<function predict at 0x7f27137c6ca0>
(Pdb) c
1 passed in 0.31s
```

The second `p p.round(3)` reads oddly because the variable is called `p` like the command. The first `p` is the command and the second the variable. After `up` you are inside FastAPI, and `function` is your own `predict`, seen from the side of its caller. Remove the `breakpoint()` line when you are done, because a service that waits for a debugger answers nobody.

In a codebase that you don't know, `where` is the fastest map there is. It gives you in one second the chain that took twenty minutes with `git grep`, including the part inside the framework. Its limit is that it shows one path through the program, the one that this run happened to take.

## The libraries are on your disk too

The stack named files inside FastAPI and anyio. Those are ordinary Python files in a folder called `site-packages`, and everything in this lesson works on them. Go there and follow the call with `grep`:

```
cd $(python -c "import fastapi, os; print(os.path.dirname(fastapi.__file__))")
cd ..
grep -n -B4 -A3 "return await run_in_threadpool" fastapi/routing.py
```

`$( ... )` runs the command between the brackets and puts its output in its place, so the first line changes into the folder of the installed `fastapi` package. `-B4` and `-A3` print 4 lines before and 3 lines after each match. Among the output are these lines, from version 0.165.0:

```
379-    if is_coroutine:
380-        with _operation(name="endpoint", function=dependant.call):
381-            return await dependant.call(**values)
382-    else:
383:        return await run_in_threadpool(
384-            _run_sync_endpoint, function=dependant.call, arguments=values
385-        )
```

Seven lines hold the rule that took a whole section of week 18: a handler that is a coroutine, written with `async def`, is awaited on the event loop, and any other handler is sent to a pool of threads. Follow the pool two libraries down:

```
grep -n -A2 "async def run_in_threadpool" starlette/concurrency.py
grep -rn "CapacityLimiter(40)" anyio/
```

```
32:async def run_in_threadpool(func: Callable[P, T], *args: P.args, **kwargs: P.kwargs) -> T:
33-    func = functools.partial(func, *args, **kwargs)
34-    return await anyio.to_thread.run_sync(func)
anyio/_backends/_asyncio.py:3162:            limiter = CapacityLimiter(40)
```

There is the 40 of week 18. The lesson told you that the pool has 40 threads, and now you have found the line that says so. From now on you don't have to believe statements about libraries, in this plan or anywhere else. FastAPI in this version has 54 files with 23,803 lines, Starlette 36 files with 6,947 and anyio 46 with 16,390. Together they are twice the size of Salt, and it took three commands to find the one line that mattered.

## What reading finds

Careful reading finds things that the authors missed, and that is how most first contributions begin. Look once more at the entry points of step 2. Line 89 says:

```
setup_mup = "salt.utils.mup_utils.main_mup:main"
```

Check whether that module exists:

```
git ls-files | grep -i "mup_utils/main"
git grep -n "muP_utils.main_muP"
```

```
salt/utils/muP_utils/main_muP.py
salt/tests/test_pipeline.py:61:        from salt.utils.muP_utils.main_muP import main as main_mup
```

`-i` makes `grep` ignore the difference between capital and small letters. The folder and the file are spelled with a capital P, and so is the import in the test. The entry point spells both with a small p. On Linux, file names with different capitals are different names. So the reading suggests that the command `setup_mup` can't find its module and fails as soon as it is started.

That is a **hypothesis**, and it must be called one. I have not run the command, and there may be something that I have not seen. What can be done in a minute is to build the same situation in a few lines of your own and see what Python does:

```
mkdir -p demo/utils/muP_utils
printf 'def main():\n    print("ok")\n' > demo/utils/muP_utils/main_muP.py
python -c "from demo.utils.muP_utils.main_muP import main; main()"
python -c "from demo.utils.mup_utils.main_mup import main; main()"
```

```
ok
Traceback (most recent call last):
  File "<string>", line 1, in <module>
    from demo.utils.mup_utils.main_mup import main; main()
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ModuleNotFoundError: No module named 'demo.utils.mup_utils'
```

`mkdir -p` creates a folder together with the folders above it. `printf` writes the two lines of a tiny module. With the right capitals the import works, and with the wrong ones Python reports that the module does not exist.

Such a small program that shows a problem in isolation is called a **minimal reproduction**. It is the most valuable thing that you can attach to a bug report, because a maintainer can run it in ten seconds. The honest report here would say three things: what the reading found, with file and line. What the reproduction shows. And what has not been checked, namely the real command in a real installation. The next lesson is about how to bring such a finding to a project.

## The method on one page

- **Measure first.** Files, lines, folders, largest files, commits, authors, most-changed files.
- **Read what was written for you.** README, documentation, and the entry points in `pyproject.toml`.
- **Ask one question** that follows one path, and write it down.
- **Follow the path** with `git grep -n`, one definition at a time. If nobody calls a function, a framework does.
- **Search the configuration** when the code leaves a choice open.
- **Start from messages.** The text of an error is in the source.
- **Read the tests** to see how a function is meant to be used, and **the history** to see why a line is there: `git blame`, `git log -S`, `git show --stat`, `git log --follow`.
- **Stop the program** with `breakpoint()` and `where` when you need what only a run can show.
- **Keep notes with file and line.** A claim about code without a place is an opinion.

--- practice
@predict
The entry points of Salt contain the line `to_onnx = "salt.onnx.to_onnx:main"`. In which file is the function that runs when a user types `to_onnx`? Give the path from the top of the repository.
= salt/onnx/to_onnx.py
! The part before the colon is a module, and the dots in a module name are the slashes of the path: `salt.onnx.to_onnx` is `salt/onnx/to_onnx.py`. The part after the colon is the function in it.

@predict
What does this pipeline print?
```
printf 'a/x/1.py\na/y/2.py\na/x/3.py\nb/z/4.py\n' | cut -d/ -f1-2 | sort | uniq -c | sort -rn | head -1
```
= 2 a/x
! `cut` keeps the first two pieces of each path: `a/x`, `a/y`, `a/x`, `b/z`. After sorting, `uniq -c` counts `a/x` twice and the others once, and `sort -rn` puts the 2 first.

@choice
You search a repository for calls of `training_step` and find its definition and no call at all. What is the most likely explanation?
- The method is dead code and can be deleted
- `git grep` does not search inside classes
* A framework calls it: the class inherits from a framework class whose contract prescribes that method name
- The call is in a file that Git ignores
! This is inversion of control. Lightning owns the training loop and calls `training_step` for every batch. Look at what the class inherits from, and read that framework's documentation for the methods it expects.

@choice
`git grep -l "CrossEntropyLoss" -- '*.py'` finds only test files, although the training clearly uses that loss. Where do you look next?
- In the compiled files, because the name was optimised away
- In the history, because the loss must have been deleted
* In the configuration files, which name the classes that the program is assembled from
- In the documentation of PyTorch
! Salt's Python defines the parts, and YAML files with `class_path` entries assemble them. 39 YAML files name the loss. In configuration-driven code, always search the configuration as well.

@choice
A line in a file looks strange, and you want to know when the function it calls first appeared in the repository and why. Which command do you start with?
- `git status`
- `git log --oneline | head`
* `git log -S"name_of_the_function"`, which lists the commits that added or removed that text
- `git diff HEAD`
! `git log -S` searches the changes, not the current files. The oldest commit in its output is the one that introduced the text, and `git show --stat` on it shows what else changed with it.

@choice
`git log --oneline -- salt/onnx/to_onnx.py` shows 25 commits and the same command with `--follow` shows 67. Why?
- `--follow` also counts merge commits
- `--follow` includes the commits of other branches
* The file was moved from another path, and without `--follow` the history stops at the move
- `--follow` counts every changed line as a commit
! The file used to be `salt/to_onnx.py`. Git stores no renames. It detects them by comparing contents, and `git log` on a path does that only when asked.

@run
The output of `git grep -n` is the raw material of your notes. Write `parse_grep(line)`, which gets one output line and returns three values: the path, the line number as an integer, and the text without the spaces around it. Be careful: the text itself may contain colons.
```starter
def parse_grep(line):
    pass
```
```test
a = parse_grep("salt/models/task.py:234:        loss = self.loss(preds, labels)")
print(a[0])
print(a[1] + 1)
print(a[2])
b = parse_grep('pyproject.toml:84:salt = "salt.main:main"')
print(b[2])
```
= salt/models/task.py
= 235
= loss = self.loss(preds, labels)
= salt = "salt.main:main"
```solution
def parse_grep(line):
    path, number, text = line.split(":", 2)
    return path, int(number), text.strip()
```
! The second argument of `split` limits the number of cuts. With `split(":", 2)` only the first two colons separate, and everything after them stays in one piece, including the colon in `salt.main:main`.

@local
Clone Salt, switch to the tag `0.15.0` and take the measurements of step 1. Paste the output of the three counting commands and of the pipeline that counts the Python files per folder.
min: 8
= 195
= 23474
= salt/tests
! If your numbers are larger, you are probably on `main` instead of the tag. `git status` says `HEAD detached at 0.15.0` when you are in the right place.

@local
Lightning needs an optimiser, and it gets one through a second hook. Find the method of `ModelWrapper` that creates the optimiser, show that nothing in Salt calls it, and find the lines in it that read the configuration entry `lrs_config`. Paste your `git grep` commands with their output.
min: 5
= salt/modelwrapper.py:495
= configure_optimizers
= lrs_config
! `configure_optimizers` is defined at line 495 and called nowhere in Salt, exactly like `training_step`. It reads `initial`, `max`, `end` and `pct_start` from `lrs_config`, which the YAML file sets in its first lines, and builds a `OneCycleLR` schedule from them.

@local
Find the commit that introduced the error text `Loss is NaN`. Paste the command and its output, and below it the output of `git show --stat` for that commit.
min: 4
= accbb5d
= Raise error if nan encountered during training
! `git log --oneline -S"Loss is NaN"` prints one commit. The statistics show which files it touched. Reading the commit that introduced a check is the fastest way to learn why the check exists.

@local
Put `breakpoint()` into the `predict` function of your own service, run one test with `-s` and paste the output of `where`. Then remove the line again.
min: 6
= predict()
= threading.py
= anyio
! The frames from `threading.py` and anyio show that your handler runs in a worker thread. If pytest hangs without a prompt, the `-s` is missing. If your handler is written with `async def`, the thread frames are missing, because it then runs on the event loop.

@local
Find the limit of the thread pool in the anyio that is installed on your computer. Paste the commands and the line that you found.
min: 2
= CapacityLimiter
= anyio
! `python -c "import anyio; print(anyio.__file__)"` prints where the package is, and `grep -rn "CapacityLimiter(" anyio/` in the folder above finds the line. If your version shows another number than 40, your version has changed, and you have just found that out yourself.

@local
Build the minimal reproduction from the lesson: a folder `demo/utils/muP_utils` with a module `main_muP.py`, one import with the right capitals and one with the wrong ones. Paste both outputs.
min: 3
= ok
= ModuleNotFoundError
! On Linux the second import fails because `mup_utils` and `muP_utils` are different names. Four lines are enough to show the behaviour without installing anything, which is the point of a minimal reproduction.

@write
From memory: the commands that answer these four questions about a file `src/core.py`. Who last changed lines 10 to 20? Which commits added or removed the text `old_name`? What did commit `abc1234` change, as a summary per file? What is the whole history of the file, including the time before it was renamed?
min: 4
```solution
git blame -L 10,20 src/core.py
git log --oneline -S"old_name"
git show --stat abc1234
git log --oneline --follow -- src/core.py
```
! `blame` is about lines, `log -S` about text that appears or disappears, `show --stat` about one commit, and `--follow` about a file across renames.
--- recall
Q: What do you measure in a codebase before reading any file?
A: The number of files and lines, the folders they are in, the largest files, the number of commits and authors, and the files that change most often.
Q: What does the line `salt = "salt.main:main"` under [project.scripts] in pyproject.toml mean?
A: Installing the package creates a command salt that calls the function main in the module salt.main, the file salt/main.py. It is an entry point, a door into the code.
Q: You find the definition of a method and no call of it anywhere in the repository. What does that tell you?
A: A framework calls it. The class inherits from a framework class, and the method is a hook with a prescribed name. This is inversion of control.
Q: The Python code calls self.loss(...) but never says which loss. Where is the answer?
A: In the configuration files. They name classes with class_path and their arguments with init_args, and the program is assembled from them at start-up.
Q: How do you get from an error message to the code that raised it?
A: Search the repository for the fixed words of the message with git grep -n, and leave out the parts that are filled in at run time.
Q: What do git blame, git log -S and git log --follow each tell you?
A: blame: which commit last changed each line. log -S"text": which commits added or removed that text. --follow: the history of a file across renames.
Q: Why read the tests of a codebase you don't know?
A: A test shows how a function is called with small inputs and what the authors promise, and it can't go out of date unnoticed because it runs.
Q: How do you stop a Python program and see who called the current function?
A: Put breakpoint() at the place and run it. At the (Pdb) prompt, where prints the call stack. p prints values, n runs the next line, up moves to the caller, c continues.
Q: What is a minimal reproduction, and why attach one to a bug report?
A: The smallest program that shows the problem in isolation. A maintainer can run it in seconds, and it separates the bug from everything else in the project.
Q: What separates a hypothesis from a finding when you read code?
A: A finding names the file and line and has been checked. A hypothesis is what the reading suggests but has not been run, and it must be reported as that.

=== os2 | linux | 21 | From issue to merged pull request | p65,p66,p67
## Somebody else's repository

In week 2 you opened pull requests in your own repository, where you may push whatever you like. In a project that belongs to other people you may not push at all. Every change passes through a pull request that a maintainer reads, questions and merges, or does not merge. This lesson takes one bug through that whole path: from the first look at the project to the merged change and the clean-up afterwards. Every command is run on your own disk, in a lab that behaves like GitHub, so that you make your mistakes there and not in front of the maintainers of a real project.

Three places are involved, and their names are fixed by convention:

```
upstream     the project's repository       you can read it
   |
   |  fork: a button on GitHub
   v
origin       your copy on GitHub            you can push to it
   |
   |  git clone
   v
your computer
```

A **fork** is a copy of a repository under your own account. Your work travels upwards: from your computer to your fork with `git push`, and from your fork to the project with a pull request. News from the project travels downwards: from **upstream** to your computer with `git fetch`, and on to your fork with `git push`.

## The lab

The lab is a small Python package named `kinematics` with one function that matters, `delta_r`, and one bug in it. Two folders play the role of GitHub: `upstream.git` is the project and `fork.git` is your fork. Both are **bare repositories**, which means repositories without working files, the form in which a server keeps them. A third folder, `maintainer`, is the working copy of the project's maintainer. You will step into it twice to play that part.

Save the following as `make_lab.sh` in an empty folder and run it with `bash make_lab.sh`. The lines of the form `cat > file <<'EOF'` write everything up to the next line that consists of `EOF` into the file. This construction is called a here-document.

```
set -e
mkdir pr-lab
cd pr-lab
git init -q --bare -b main upstream.git
git init -q -b main maintainer
cd maintainer
mkdir -p src/kinematics tests

cat > src/kinematics/__init__.py <<'EOF'
"""Small helpers for collider kinematics."""
import math

__all__ = ["delta_eta", "delta_r"]


def delta_eta(eta1, eta2):
    """Difference in pseudorapidity."""
    return eta1 - eta2


def delta_r(eta1, phi1, eta2, phi2):
    """Angular distance between two directions."""
    return math.hypot(eta1 - eta2, phi1 - phi2)
EOF

cat > tests/test_kinematics.py <<'EOF'
import math

from kinematics import delta_eta, delta_r


def test_delta_eta():
    assert delta_eta(1.5, 0.5) == 1.0


def test_delta_r_same_direction():
    assert delta_r(0.4, 1.0, 0.4, 1.0) == 0.0


def test_delta_r_right_angle():
    assert math.isclose(delta_r(0.0, 0.0, 3.0, 4.0), 5.0)
EOF

cat > pyproject.toml <<'EOF'
[build-system]
requires = ["setuptools>=62"]
build-backend = "setuptools.build_meta"

[project]
name = "kinematics"
version = "0.3.0"
description = "Small helpers for collider kinematics"
requires-python = ">=3.10"

[project.optional-dependencies]
dev = ["pytest", "ruff", "pre-commit"]

[tool.setuptools.packages.find]
where = ["src"]
EOF

cat > CONTRIBUTING.md <<'EOF'
# Contributing

1. Open an issue before you start on anything larger than a typo.
2. Fork the repository and work on a branch, never on main.
3. Install for development: pip install -e ".[dev]"
4. Switch on the commit checks: pre-commit install
5. Run the tests: python -m pytest -q
6. Every bug fix comes with a test that fails without the fix.
7. Keep a pull request to one topic.
EOF

cat > .pre-commit-config.yaml <<'EOF'
repos:
  - repo: local
    hooks:
      - id: ruff
        name: ruff check
        entry: ruff check
        language: system
        types: [python]
EOF

printf '__pycache__/\n.venv/\n*.egg-info/\n' > .gitignore
printf '# kinematics\n\nSmall helpers for collider kinematics.\n' > README.md

git add .
git commit -q -m "Add delta_eta and delta_r with tests"
git remote add origin ../upstream.git
git push -q -u origin main
cd ..
git clone -q --bare upstream.git fork.git
echo "The lab is ready in $(pwd)"
```

`set -e` at the top stops the script at the first command that fails, so that a mistake does not go unnoticed. The commit IDs in this lesson are those of the reference run. Yours will be different, because a commit ID depends on the author and the time.

## Step 1: clone your fork and add upstream

On GitHub the first step is the Fork button on the page of the project. After that you clone your fork, never the project itself, because your fork is where you can push:

```
cd pr-lab
git clone fork.git kinematics
cd kinematics
git remote add upstream ../upstream.git
git remote -v
```

```
Cloning into 'kinematics'...
done.
origin	/home/you/pr-lab/fork.git (fetch)
origin	/home/you/pr-lab/fork.git (push)
upstream	../upstream.git (fetch)
upstream	../upstream.git (push)
```

`git clone` names the place it cloned from `origin`. The second remote you add by hand, and everybody calls it `upstream`. On GitHub the two lines would show `https://github.com/your-name/kinematics.git` and `https://github.com/hep-tools/kinematics.git`. From now on `origin` means "mine" and `upstream` means "theirs".

## Step 2: read the rules and build the environment

Before any code, read the file `CONTRIBUTING.md`. Almost every project has one, and it tells you what the maintainers will ask for anyway. The one of the lab has seven rules, and the rest of this lesson follows them. Rules 3 and 4 need three tools that this plan has not used yet.

**A virtual environment.** Until now `pip install` put packages into one shared place on your computer. A project that you contribute to pins its own versions of its tools, and those must not fight with the versions of your other projects. A **virtual environment** is a folder with its own `python` and its own packages:

```
python3 -m venv .venv
source .venv/bin/activate
```

The first line creates the environment in the folder `.venv`. The second switches it on for this terminal: from then on `python` and `pip` mean the ones inside the folder, and the prompt shows `(.venv)`. `deactivate` switches it off. In Windows PowerShell the second line is `.venv\Scripts\Activate.ps1`. Use one environment per project from now on.

**An editable install.** Rule 3 says `pip install -e ".[dev]"`. The dot means the project in the current folder. `[dev]` adds the group of optional dependencies with that name from `pyproject.toml`, here pytest, ruff and pre-commit. And `-e` stands for **editable**: instead of copying the package into the environment, pip stores a pointer to your folder, so that every edit is active at once without installing again. The last line of the installation and the proof:

```
pip install -e ".[dev]"
pip list | grep kinematics
```

```
Successfully installed cfgv-3.5.0 distlib-0.4.4 ... kinematics-0.3.0 ...
kinematics       0.3.0    /home/you/pr-lab/kinematics
```

The third column is the pointer: the installed package is your working folder.

**The tests, before you change anything.** This is the step that beginners skip.

```
python -m pytest -q
```

```
...                                                                      [100%]
3 passed in 0.01s
```

If a test fails now, it fails without you, and you must know that before you touch a line. Otherwise you will spend an evening searching your own change for a fault that was there before.

**Commit checks.** Rule 4:

```
pre-commit install
```

```
pre-commit installed at .git/hooks/pre-commit
```

Git can run a program at certain moments, and such a program is called a **hook**. The one named `pre-commit` runs before every commit, and if it fails, the commit is not made. The tool **pre-commit** manages such hooks from the file `.pre-commit-config.yaml`. In the lab that file lists one check, `ruff check`. **Ruff** is a **linter**: a program that reads code without running it and reports mistakes and bad habits, such as a variable that is never used. Real projects list more. Salt, from the last lesson, lists five in its `.pre-commit-config.yaml`: ruff, a formatter, a type checker, a checker for YAML files and one for documentation strings. Its CI runs the same five, so whatever the hook lets through on your computer will pass there too. A project downloads those checks from other repositories at the first run. The lab uses one that is already installed, so that it works offline.

## Step 3: the issue comes first

The bug. In week 3 you learned that the azimuthal angle φ runs from -π to π and that the difference of two angles must be wrapped into that range before it is used. You wrote `delta_r` with the wrap as a drill. This package forgot it:

```
python -c "from kinematics import delta_r; print(delta_r(0.0, 3.1, 0.0, -3.1))"
```

```
6.2
```

The directions φ = 3.1 and φ = -3.1 lie on both sides of π and are 2π - 6.2 = 0.083 apart. The function says 6.2. An analysis that collects the particles within ΔR of 0.4 around a jet near the boundary would miss every particle on the other side of it.

Rule 1 of the lab says to open an issue first. There are two reasons for that rule, and both protect you. Somebody may already be working on it, and the maintainers may want it solved differently than you would. An issue costs ten minutes, and a rejected pull request costs a week. Before you write one, search the existing issues, the open and the closed ones, for the same problem.

A good bug report has a fixed shape. The issue template in the Salt repository that you cloned, in `.gitlab/issue_templates/bug_report.md`, asks among other things for a summary, the expected behaviour, the actual behaviour, the steps to reproduce, an optional proposed solution, and the version and environment. Here is the report for the lab in that shape:

```
delta_r is wrong across the phi boundary

Version: kinematics 0.3.0, Python 3.13

Steps to reproduce:
    >>> from kinematics import delta_r
    >>> delta_r(0.0, 3.1, 0.0, -3.1)
    6.2

Expected: 0.083, which is 2 pi - 6.2. The directions phi = 3.1 and
phi = -3.1 are neighbours on both sides of pi.

Cause, as far as I can see: delta_r in src/kinematics/__init__.py uses
phi1 - phi2 without wrapping it into the range from -pi to pi.

I would like to fix this and add a test. Is that welcome?
```

The three lines under "Steps to reproduce" are the minimal reproduction of the last lesson. The last line matters as much. You offer the work and you ask, and then you wait for an answer before you spend days on it. For a fix as small and as clear as this one, many projects are happy if the pull request follows at once. For anything larger, wait. Suppose the issue gets the number 12.

## Step 4: a branch, a failing test, a fix

Rule 2: never work on `main`. Your `main` should always be a clean copy of the project's `main`, and every piece of work gets a branch with a name that says what it is:

```
git switch -c fix-delta-r-wrap
```

Rule 6: every bug fix comes with a test that fails without the fix. So write the test first. Add this to `tests/test_kinematics.py`:

```
def test_delta_r_across_the_phi_boundary():
    # 3.1 and -3.1 lie on both sides of pi, 0.083 apart
    assert math.isclose(delta_r(0.0, 3.1, 0.0, -3.1), 2 * math.pi - 6.2)
```

Run the tests. These are the lines of the output that matter:

```
>       assert math.isclose(delta_r(0.0, 3.1, 0.0, -3.1), 2 * math.pi - 6.2)
E       assert False
E        +    and   6.2 = delta_r(0.0, 3.1, 0.0, -3.1)

FAILED tests/test_kinematics.py::test_delta_r_across_the_phi_boundary - asser...
1 failed, 3 passed in 0.03s
```

The test fails for the right reason: it shows the 6.2 of the issue. A test that you have never seen fail proves nothing, because it might pass for a reason that has nothing to do with your fix. Now the fix. Replace the last line of `delta_r`:

```
    dphi = phi1 - phi2
    if dphi > math.pi:
        dphi -= 2 * math.pi
    elif dphi < -math.pi:
        dphi += 2 * math.pi
    return math.hypot(eta1 - eta2, dphi)
```

And the tests again, with their last two lines:

```
FAILED tests/test_kinematics.py::test_delta_r_right_angle - assert False
1 failed, 3 passed in 0.02s
```

The new test passes, and now an old one fails. This moment decides whether a contribution is good, so slow down. There are two possibilities: the fix broke something, or the old test was wrong. Read the test:

```
def test_delta_r_right_angle():
    assert math.isclose(delta_r(0.0, 0.0, 3.0, 4.0), 5.0)
```

It asks for the distance between φ = 0 and φ = 4 and expects the famous triangle with sides 3, 4 and 5. But a difference of 4 radians is larger than π. The short way round the circle is 2π - 4 = 2.28, and the correct ΔR is 3.77, which is what the fixed function returns. The old test passed only because of the bug. The right thing is to change the test so that it checks what its name says, with a φ difference below π, and to say so openly in the pull request:

```
    assert math.isclose(delta_r(0.0, 0.0, 4.0, 3.0), 5.0)
```

```
....                                                                     [100%]
4 passed in 0.01s
```

Never change an existing test just to make it pass. Change it when you can explain why it was wrong, and write that explanation down.

## Step 5: the commit that was refused

```
git status --short
git add src tests
git commit -m "Wrap the phi difference in delta_r"
```

```
 M src/kinematics/__init__.py
 M tests/test_kinematics.py
ruff check...............................................................Failed
- hook id: ruff
- exit code: 1

F401 `sys` imported but unused
 --> src/kinematics/__init__.py:3:8
  |
1 | """Small helpers for collider kinematics."""
2 | import math
3 | import sys
  |        ^^^
4 |
5 | __all__ = ["delta_eta", "delta_r"]
  |
help: Remove unused import: `sys`

Found 1 error.
```

The hook refused the commit. While hunting the bug, the reference run had added `import sys` for a debugging line and removed the line, but not the import. The tests pass with it, and no reviewer wants to see it. `F401` is the name of ruff's rule, and the message says exactly what to do. `git add src tests` instead of `git add .` is a habit worth having: you name what belongs to the change, and stray files stay out.

Remove the import, check, and commit again. This time without `-m`, so that Git opens your editor for a full message:

```
ruff check .
git add src
git commit
```

```
All checks passed!
ruff check...............................................................Passed
[fix-delta-r-wrap 0a61b2b] Wrap the phi difference in delta_r
 2 files changed, 12 insertions(+), 2 deletions(-)
```

The message of the reference run:

```
Wrap the phi difference in delta_r

delta_r used the raw difference of the two phi values. For directions
on both sides of the boundary at pi it returned a distance near 2 pi,
for example 6.2 for phi = 3.1 and phi = -3.1, which are 0.083 apart.

The difference is now wrapped into the range from -pi to pi.

test_delta_r_right_angle used a phi difference of 4, which is larger
than pi, and passed only because of the bug. It now uses 3.

Fixes #12
```

It follows the rules of week 2: a subject in the imperative, a blank line, and a body that says why. The last line is new. GitHub reads the words close, closes, closed, fix, fixes, fixed, resolve, resolves and resolved in front of an issue number, in a commit message or in the description of a pull request. When such a pull request is merged into the default branch, the issue is closed automatically and the two are linked for ever. Whoever runs `git blame` on your line in three years gets from the line to the commit, from the commit to the issue, and from the issue to the reason. You followed that same trail in Salt.

## Step 6: push and open the pull request

```
git push -u origin fix-delta-r-wrap
```

```
To /home/you/pr-lab/fork.git
 * [new branch]      fix-delta-r-wrap -> fix-delta-r-wrap
branch 'fix-delta-r-wrap' set up to track 'origin/fix-delta-r-wrap'.
```

The branch is now on your fork. On GitHub you would now open the pull request: from the branch `fix-delta-r-wrap` of your fork into the branch `main` of the project. The description is written for a busy person who has never seen your work. Salt's template for merge requests asks for a summary of the changes, the related issues, and three boxes to tick: documentation updated, development guidelines followed, pipeline passes. The description for the lab:

```
Wrap the phi difference in delta_r

Fixes #12.

delta_r used the raw difference of the two phi values, so directions
on both sides of the boundary at pi came out almost 2 pi apart.

Changes
- wrap the difference into the range from -pi to pi
- new test across the boundary, which fails without the fix
- test_delta_r_right_angle used a phi difference of 4, larger than pi,
  and passed only because of the bug. It now uses 3.

How I tested it
- python -m pytest -q: 4 passed
- ruff check .: All checks passed!
```

Four things make a pull request easy to merge, and the description shows all of them. It does one thing. It says why. It names what a reviewer might stumble over, here the changed test, before the reviewer finds it. And it says how it was tested.

After you open it, the project's CI runs, as yours did in week 6. A red cross there is yours to fix before anybody is asked to read the code. If you want the CI to run while the work is not finished, open the pull request as a **draft**: GitHub's documentation says that a draft cannot be merged and that the owners of the code are not asked for a review automatically. You mark it as ready when it is.

## Step 7: the review

A day later a maintainer writes: "Thanks. What happens when the angles are not normalised, for example φ = 0.1 + 4π? Then the difference is more than one full turn."

A review comment is neither an attack nor an order. It is a question from somebody who knows the code better than you, and it deserves an answer that is checked:

```
python -c "from kinematics import delta_r; import math; print(delta_r(0.0, 0.1 + 4 * math.pi, 0.0, 0.0))"
```

```
6.383185307179586
```

The reviewer is right: the fix subtracts 2π once, and here it would have to be subtracted twice. The standard library has the right tool. `math.remainder(x, y)` returns x minus the multiple of y that is nearest to x, so for y = 2π the result always lies between -π and π:

```
python -c "import math; print(math.remainder(6.2, 2 * math.pi))"
python -c "import math; print(math.remainder(0.1 + 4 * math.pi, 2 * math.pi))"
```

```
-0.08318530717958605
0.09999999999999964
```

The five lines of the fix become one, `dphi = math.remainder(phi1 - phi2, 2 * math.pi)`, and the case gets a test of its own:

```
def test_delta_r_with_unnormalised_phi():
    # two full turns apart is the same direction
    assert math.isclose(delta_r(0.0, 0.1 + 4 * math.pi, 0.0, 0.0), 0.1)
```

```
python -m pytest -q
git add src tests
git commit -m "Use math.remainder so that any phi difference is wrapped"
git push
```

```
5 passed in 0.01s
ruff check...............................................................Passed
[fix-delta-r-wrap 4b67608] Use math.remainder so that any phi difference is wrapped
 2 files changed, 6 insertions(+), 5 deletions(-)
To /home/you/pr-lab/fork.git
   0a61b2b..4b67608  fix-delta-r-wrap -> fix-delta-r-wrap
```

The subject of this commit has 56 characters. The 50 of week 2 is an aim and not a law, and real histories show that: of the 510 commits in Salt that are not merges, 416 have a subject of at most 50 characters and 491 one of at most 72.

A pull request follows its branch. The push adds the second commit to the open pull request, and the CI runs again. During a review, add commits like this one and do not rewrite the ones that the reviewer has already read, so that they can see what changed since their last look. Then answer the comment in words: what you changed, and in which commit. Answer every comment, with a change or with a reason. A review that ends in a better fix than the one you came with is the normal case, and here it turned five lines into one.

## Step 8: the project moves on

While your pull request waits, other people's work is merged. Play the maintainer for a moment:

```
cd ../maintainer
printf '\nInstall it with\n\n    pip install kinematics\n' >> README.md
git commit -q -am "Describe the installation in the README"
git push -q origin main
cd ../kinematics
```

Your branch now starts from an old `main`. Look at it:

```
git fetch upstream
git log --oneline --graph --all
```

```
From ../upstream
 * [new branch]      main       -> upstream/main
* 18907c0 Describe the installation in the README
| * 4b67608 Use math.remainder so that any phi difference is wrapped
| * 0a61b2b Wrap the phi difference in delta_r
|/
* 7a4f140 Add delta_eta and delta_r with tests
```

`git fetch upstream` downloads the news and changes nothing in your files. The graph shows two lines that part after the first commit. Week 2 mentioned `git rebase` in one paragraph. Here it does its work: it takes your commits off the old starting point and applies them again, one by one, on top of the new one.

```
git rebase upstream/main
git log --oneline --graph --all
```

```
Successfully rebased and updated refs/heads/fix-delta-r-wrap.
* 0c449c7 Use math.remainder so that any phi difference is wrapped
* 3ddb89d Wrap the phi difference in delta_r
* 18907c0 Describe the installation in the README
| * 4b67608 Use math.remainder so that any phi difference is wrapped
| * 0a61b2b Wrap the phi difference in delta_r
|/
* 7a4f140 Add delta_eta and delta_r with tests
```

Read the IDs. Your two commits exist twice: the new ones, `3ddb89d` and `0c449c7`, sit on top of the README commit, and the old ones are still on the fork. A rebase does not move commits. It writes new ones with the same changes and a different parent, and a different parent means a different ID. Run the tests again, because your code now sits on code that you have never run it with, and then push:

```
python -m pytest -q
git status -sb
git push
```

```
5 passed in 0.01s
## fix-delta-r-wrap...origin/fix-delta-r-wrap [ahead 3, behind 2]
To /home/you/pr-lab/fork.git
 ! [rejected]        fix-delta-r-wrap -> fix-delta-r-wrap (non-fast-forward)
error: failed to push some refs to '/home/you/pr-lab/fork.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

`ahead 3, behind 2` says it exactly: your branch has three commits that the fork lacks, and the fork has two that your branch lacks, the two old copies. A normal push may only add commits and never drop any, so it is rejected. The hint is wrong for this situation: `git pull` would merge the old copies back in, and every change would be in the history twice. What you want is to replace the branch on the fork:

```
git push --force-with-lease
```

```
To /home/you/pr-lab/fork.git
 + 4b67608...0c449c7 fix-delta-r-wrap -> fix-delta-r-wrap (forced update)
```

`--force` overwrites the remote branch with yours, whatever is there. `--force-with-lease` does the same only if the remote branch is still where your last fetch saw it. If somebody has pushed to it in the meantime, for example a maintainer who added a small fix to your branch, it refuses, and their work is not destroyed. Use the second form always. And the rule of week 2 still holds: rewrite only what is yours alone. The branch of your own pull request is yours. `main` is not, and neither is any branch that other people build on.

Projects differ in how they want a branch brought up to date. Some ask for a rebase, others are content if you merge `upstream/main` into your branch, and many don't care because they squash everything at the end. The contributing guide says which, and if it doesn't, look at what recent pull requests did.

## When the rebase stops

The rebase above went through because the README and your two files have nothing to do with each other. When upstream has changed the same lines as you, the rebase stops in the middle. The reference run produced that case in a second copy of the lab, in which the maintainer had changed the last line of `delta_r`. The main lines of what Git printed:

```
Auto-merging src/kinematics/__init__.py
CONFLICT (content): Merge conflict in src/kinematics/__init__.py
error: could not apply 4939af9... Wrap the phi difference in delta_r
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
```

The file then holds the markers that you know from week 2:

```
<<<<<<< HEAD
    return math.hypot(delta_eta(eta1, eta2), phi1 - phi2)
=======
    dphi = math.remainder(phi1 - phi2, 2 * math.pi)
    return math.hypot(eta1 - eta2, dphi)
>>>>>>> 4939af9 (Wrap the phi difference in delta_r)
```

One thing is the other way round than in a merge. During a rebase, `HEAD` is the upstream commit that your work is being put on top of, so the upper part is theirs and the lower part is yours. The solution keeps both intentions, their call of `delta_eta` and your wrap:

```
    dphi = math.remainder(phi1 - phi2, 2 * math.pi)
    return math.hypot(delta_eta(eta1, eta2), dphi)
```

```
git add src/kinematics/__init__.py
git rebase --continue
```

```
[detached HEAD f21e509] Wrap the phi difference in delta_r
 1 file changed, 2 insertions(+), 1 deletion(-)
Successfully rebased and updated refs/heads/fix-delta-r-wrap.
```

If you get lost in the middle, `git rebase --abort` puts everything back to where it was before the rebase. Nothing is lost by trying.

## Step 9: merged, and the clean-up

The maintainer approves. Many projects merge with a **squash**: all commits of the pull request are pressed into one commit on `main`, with the number of the pull request in its subject. The history of the project then has one commit per change, whatever happened during the review. Play the maintainer once more:

```
cd ../maintainer
git fetch -q ../fork.git fix-delta-r-wrap
git merge -q --squash FETCH_HEAD
git commit -q -m "Wrap the phi difference in delta_r (#13)"
git push -q origin main
cd ../kinematics
```

The second command answers `Squash commit -- not updating HEAD`, which is as it should be. Your change is in the project. Three things remain on your side: bring your `main` up to date, bring your fork's `main` up to date, and remove the branch in both places.

```
git switch main
git pull upstream main
git push origin main
git branch -d fix-delta-r-wrap
git push origin --delete fix-delta-r-wrap
```

```
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
From ../upstream
 * branch            main       -> FETCH_HEAD
   18907c0..75586b0  main       -> upstream/main
Updating 7a4f140..75586b0
Fast-forward
 README.md                  |  4 ++++
 src/kinematics/__init__.py |  3 ++-
 tests/test_kinematics.py   | 12 +++++++++++-
 3 files changed, 17 insertions(+), 2 deletions(-)
To /home/you/pr-lab/fork.git
   7a4f140..75586b0  main -> main
warning: deleting branch 'fix-delta-r-wrap' that has been merged to
         'refs/remotes/origin/fix-delta-r-wrap', but not yet merged to HEAD
Deleted branch fix-delta-r-wrap (was 0c449c7).
To /home/you/pr-lab/fork.git
 - [deleted]         fix-delta-r-wrap
```

The second line is a trap. "Up to date with `origin/main`" compares your `main` with the `main` of your fork, and the fork is as old as your clone. It says nothing about the project. Only the pull from `upstream` brings the news, here as a fast-forward over two commits.

The warning deserves a second look as well. `git branch -d` refuses to delete a branch whose commits exist nowhere else. Yours were on the fork, so it deletes, and it tells you that `main` does not contain them. After a squash that is expected: `main` contains your changes inside the one commit `75586b0`, and your own two commits are no longer needed. `git log --oneline` on `main` shows the result:

```
75586b0 Wrap the phi difference in delta_r (#13)
18907c0 Describe the installation in the README
7a4f140 Add delta_eta and delta_r with tests
```

Your `main` and the project's `main` are the same again, and the next piece of work starts from there with a new branch.

## Choosing where to contribute

Project 5 of this plan is one real pull request to a real project. Which project? Start from the tools that you have used in this plan, because you know what they are for and you have opinions about them. From the Python side of high-energy physics, the [Scikit-HEP](https://scikit-hep.org/) family is the natural place: uproot and awkward, which you used in week 9, and vector, hist, mplhep and pyhf. From software that was built at CERN: [REANA](https://docs.reana.io/) for reproducible analyses, [Rucio](https://rucio.cern.ch/) for data management and [Indico](https://getindico.io/), with which CERN organises its meetings and conferences. From this plan's own weeks: [hls4ml](https://fastmachinelearning.org/hls4ml/), which puts neural networks onto trigger hardware, and [ROOT](https://root.cern/contribute/). All of them are developed on GitHub and have a contributing guide.

Judge a project before you invest in it, with the measurements of the last lesson. For Salt at its tag, the year before the release had 161 commits by 18 authors:

```
git log --oneline --since=2025-11-13 --until=2026-11-13 | wc -l
git shortlog -sn --since=2025-11-13 --until=2026-11-13 HEAD | wc -l
```

A project is a good place for a first contribution when it has commits in the last month, a contributing guide, a CI that runs on pull requests, and recent pull requests from newcomers that got an answer. Read three merged pull requests from people who were not maintainers. They show you the tone, the speed and what was asked for.

Then the issue. GitHub's documentation describes the label `good first issue`, which maintainers put on issues that are suitable for newcomers and which can be searched for. Good first contributions are smaller than you think:

- a mistake in the documentation that you stumbled over yourself
- an error message that told you nothing, made to say what is wrong
- a test for a function that has none
- a small bug with a reproduction and a fix, like the one of this lesson

Avoid three things. Don't reformat files that you did not otherwise change, because it buries your change in noise. Don't send a large pull request as your first, because nobody has time to review it. And don't submit anything that you can't explain line by line. Some projects have written rules about contributions made with AI tools, and you should read them. Whatever tool helped you, the reviewer will ask you, and "I don't know why that line is there" ends the conversation.

Whether and when a pull request is merged is not in your hands. Maintainers of scientific software are mostly physicists and engineers with other duties, and a week of silence is normal. One friendly reminder after a week is fine. What is in your hands is that the pull request is small, tested, green and explained, and that you answer every comment within a day or two. A pull request in that state counts for your application whether it is merged or still open.

## The whole path on one page

```
fork on GitHub, then:
git clone <your fork>            git remote add upstream <project>
python3 -m venv .venv            source .venv/bin/activate
pip install -e ".[dev]"          pre-commit install
python -m pytest -q              (before any change)
git switch -c fix-something
   failing test, fix, all tests pass, linter passes
git add <files>                  git commit      (message ends: Fixes #12)
git push -u origin fix-something         open the pull request
   review: new commits, git push
git fetch upstream               git rebase upstream/main
python -m pytest -q              git push --force-with-lease
   merged:
git switch main                  git pull upstream main
git push origin main             git branch -d fix-something
git push origin --delete fix-something
```

--- practice
@choice
You have forked a project and cloned your fork. What do `origin` and `upstream` refer to?
- `origin` is the project, and `upstream` is your fork
* `origin` is your fork, where you can push, and `upstream` is the project, which you can only read
- Both are names for your fork
- `origin` is your computer, and `upstream` is GitHub
! `git clone` names the place it cloned from `origin`, and you cloned your fork. `upstream` is the name that everybody gives to the project's own repository when adding it by hand.

@choice
You are about to fix a bug in a project that is new to you. You have installed it for development. What do you do before you change a line?
- Reformat the file so that it is easier to read
- Delete the tests that look outdated
* Run the test suite, to know whether everything passes without your change
- Push an empty branch to reserve the issue
! If a test fails before you start, it is not your fault, and you need to know that. It is also the moment when you learn how the tests are run, which the CI will do with your change anyway.

@choice
Your fix makes the new test pass, and an old test that used to pass now fails. What is the right reaction?
- Delete the old test, because the new one covers the function
- Change the expected value of the old test to whatever the function now returns
* Read the old test and decide which is wrong, the test or the fix. If it is the test, change it and explain in the pull request why it was wrong
- Add a special case to the fix so that the old test passes again
! In the lesson the old test asked for a φ difference of 4, which is larger than π, and passed only because of the bug. Sometimes it is the other way round and the old test has caught a mistake in your fix. Only reading tells you which.

@choice
After `git rebase upstream/main` your `git push` is rejected with `non-fast-forward`, and Git suggests `git pull`. What do you do on the branch of your own pull request?
- `git pull`, as the hint says
- Delete the fork and start again
* `git push --force-with-lease`, because the rebase has written new commits that must replace the old ones on your fork
- `git push --force origin main`
! `git pull` would merge the old copies of your commits into the new ones. The lease form replaces the branch only if nobody else has pushed to it since your last fetch. Never force-push `main`.

@choice
During a rebase, Git stops with a conflict. In the file, which side is between `<<<<<<< HEAD` and `=======`?
- Your commit that is being applied
* The upstream version that your commits are being put on top of
- The common ancestor of both
- The version of your fork
! It is the reverse of a merge. A rebase first moves to the upstream commit and then applies your commits one by one, so `HEAD` is theirs and the lower part is your commit.

@predict
`math.remainder(x, y)` returns x minus the multiple of y that is nearest to x. What does `math.remainder(5.0, 4.0)` return, and what does `math.remainder(7.0, 4.0)` return? Give both numbers, separated by a space.
= 1.0 -1.0
=| 1 -1
! The multiple of 4 nearest to 5 is 4, which leaves 1.0. The multiple nearest to 7 is 8, which leaves -1.0. The result can be negative, and it is never further from zero than half of y. With y = 2π it therefore lies between -π and π, which is exactly the wrap that Δφ needs.

@predict
Your branch has two commits. You fetch, and upstream has one new commit. You rebase onto `upstream/main` without pushing. What does `git status -sb` show in the square brackets?
= [ahead 3, behind 2]
=| ahead 3, behind 2
! Compared with the copy on your fork, the rebased branch has three commits that the fork lacks: the upstream commit and the two new copies of yours. The fork has two that the branch lacks: the two old copies.

@run
GitHub closes an issue when a merged pull request names it behind one of nine keywords. Write `closing_issues(text)`, which returns the list of issue numbers that a description would close, in the order in which they appear. A reference looks like `#12` and may be followed by a full stop, a comma or a semicolon. Capital letters in the keyword don't matter.
```starter
KEYWORDS = ["close", "closes", "closed", "fix", "fixes", "fixed",
            "resolve", "resolves", "resolved"]

def closing_issues(text):
    pass
```
```test
print(closing_issues("Fixes #12"))
print(closing_issues("This closes #7, and resolves #19."))
print(closing_issues("See #5. Related to #6"))
print(closing_issues("FIXED #3 and fixes a typo"))
```
= [12]
= [7, 19]
= []
= [3]
```solution
KEYWORDS = ["close", "closes", "closed", "fix", "fixes", "fixed",
            "resolve", "resolves", "resolved"]

def closing_issues(text):
    words = text.split()
    found = []
    for i in range(len(words) - 1):
        ref = words[i + 1].rstrip(".,;")
        if (words[i].lower() in KEYWORDS and ref[:1] == "#"
                and ref[1:].isdigit()):
            found.append(int(ref[1:]))
    return found
```
! The keyword and the reference are two neighbouring words, so the loop looks at each word together with the one behind it. `rstrip(".,;")` removes punctuation at the end, and `ref[1:].isdigit()` makes sure that `#` is followed by a number. "See #5" closes nothing, because "see" is not a keyword.

@local
Run `make_lab.sh`, clone your fork and add the upstream remote. Paste the output of `git remote -v`.
min: 4
= origin
= upstream
= fork.git
! Four lines: fetch and push for each of the two remotes. If `upstream` is missing, the `git remote add` was run in the wrong folder.

@local
Create the virtual environment, install the package for development, run the tests and switch on the commit checks. Paste the output of `pip list | grep kinematics`, of `python -m pytest -q` and of `pre-commit install`.
min: 3
= kinematics
= 3 passed
= pre-commit installed
! The line of `pip list` shows the path of your working folder, which is what an editable install means. If `pip` installs into the wrong place, the environment is not active: the prompt must show `(.venv)`.

@local
Write the failing test, fix `delta_r` and repair the old test. Then add the line `import sys` at the top of the package on purpose and try to commit. Paste the output of the refused commit, and after you have removed the import, the output of `python -m pytest -q`.
min: 6
= F401
= Failed
= 4 passed
! The hook runs `ruff check` on the files of the commit and refuses when it finds something. In a real project the CI would have found the same line a few minutes later, in front of everybody.

@local
Commit with a full message that ends with `Fixes #12`, and push the branch to your fork. Paste the output of `git log -1` and of the push.
min: 6
= Fixes #12
= [new branch]
= fix-delta-r-wrap
! `git log -1` shows the last commit with its whole message. The push output names the fork and the new branch.

@local
Make the second commit of the review, play the maintainer who changes the README, and bring your branch up to date: fetch, rebase, test, push. Paste the output from `git rebase upstream/main` to the forced push.
min: 8
= Successfully rebased
= (non-fast-forward)
= (forced update)
! The rejected push in the middle is part of the exercise: it shows why a rebased branch needs `--force-with-lease`. If the rebase reports a conflict, you changed the README yourself. Resolve it as in the section on conflicts.

@local
Play the maintainer who squashes and merges, then clean up: update your `main` from upstream, push it to your fork and delete the branch in both places. Paste the output of the five commands and of `python -m pytest -q` at the end.
min: 8
= Fast-forward
= Deleted branch
= [deleted]
= 5 passed
! Your `main`, your fork's `main` and the project's `main` are now the same commit, and it contains both of your tests.

@write
From memory: you have cloned your fork of a project. Write the commands that add the project as a second remote, create a branch `fix-typo`, commit the changed file `README.md` with a message, and publish the branch on your fork.
min: 5
```solution
git remote add upstream https://github.com/project/repo.git
git switch -c fix-typo
git add README.md
git commit -m "Fix a typo in the installation section"
git push -u origin fix-typo
```
! The branch goes to `origin`, your fork. Nothing is ever pushed to `upstream`. The pull request is then opened on GitHub, from your branch into the project's `main`.

@write
From memory: your pull request branch `fix-typo` is behind the project. Write the commands that bring it up to date with a rebase and update the pull request, and then the commands for the clean-up after the squash merge.
min: 8
```solution
git fetch upstream
git rebase upstream/main
python -m pytest -q
git push --force-with-lease
git switch main
git pull upstream main
git push origin main
git branch -d fix-typo
git push origin --delete fix-typo
```
! Test between the rebase and the push, because the rebased code has never run before. The clean-up updates your `main` and your fork's `main` and removes the branch in both places.
--- recall
Q: What are origin and upstream after you have forked and cloned a project?
A: origin is your fork, where you can push. upstream is the project's repository, added by hand with git remote add upstream, from which you only fetch.
Q: What do python3 -m venv .venv and pip install -e ".[dev]" do?
A: The first creates a virtual environment, a folder with its own python and packages. The second installs the project in editable mode, as a pointer to your folder, together with the optional dependency group dev.
Q: Why run the tests before you change anything in a project?
A: To know that they pass without your change. A test that already fails is not your fault, and you learn how the tests are run.
Q: What is a pre-commit hook, and what is a linter?
A: A hook is a program that Git runs before a commit and that can refuse it. A linter such as ruff reads code without running it and reports mistakes such as unused imports.
Q: What must a bug report contain?
A: The version and environment, the steps to reproduce as a minimal example, what you expected, what happened, and if you can, the suspected cause and an offer to fix it.
Q: What does a line such as Fixes #12 in a pull request do on GitHub?
A: It links the pull request to issue 12, and the issue is closed automatically when the pull request is merged into the default branch.
Q: An old test fails after your fix. What do you do?
A: Read it and decide whether the test or the fix is wrong. Change a test only when you can explain why it was wrong, and say so in the pull request.
Q: What does git rebase upstream/main do to your commits, and why is the next push rejected?
A: It writes new copies of them on top of upstream's main, with new IDs. The fork still has the old copies, and a normal push may not drop commits.
Q: What is the difference between git push --force and --force-with-lease?
A: --force overwrites the remote branch whatever is there. --force-with-lease only if the remote branch is where your last fetch saw it, so nobody else's commits are destroyed.
Q: What is a squash merge, and what do you do after one?
A: All commits of the pull request become one commit on main. Afterwards: git switch main, git pull upstream main, git push origin main, and delete the branch locally and on the fork.
Q: Which first contributions do maintainers welcome?
A: Small ones that do one thing: a documentation fix, a clearer error message, a missing test, or a small bug with a reproduction and a fix, each tested and explained.

=== ap6 | app | 22 | The five-minute talk | 
## How an openlab summer ends

Every CERN openlab summer student ends the summer in front of an audience. The announcement of the 2025 sessions, which is [public on CERN's Indico](https://indico.cern.ch/event/1543700/), says it in one sentence: in a 5-minute presentation, each student will introduce the audience to their project, explain the technical challenges they have faced and describe the results of what they have been working on for the past two months.

In 2025 there were two sessions, on 11 and 12 August, with 18 places on the first day and 19 on the second. They were held in the IT Amphitheatre at CERN and sent out as a webcast. The agenda gave every talk a slot of seven minutes for a talk of five, so about two minutes remained for a question and for the next speaker to come up. The agenda is public, and the slides of the talks are attached to it as PDF files. Open three of them before you make your own.

Read the titles of the first session and you will recognise this plan. Among them are "Optimising Multi-Cluster Kubernetes for Active-Active Deployments Across Public and On-Premise Data Centers", "Implementing and benchmarking support for Xilinx AI engines in hls4ml", "Consolidation and automation of CERN's Cloud monitoring dashboards" and "Integrating novel GPU-accelerated Monte-Carlo event generators into the High-Energy Physics toolchain". Kubernetes was your week 19, hls4ml your week 17, monitoring your week 20, and Monte Carlo and GPUs your weeks 12 and 14.

This week you give such a talk about one of your own five projects. There are three reasons to do it now and not in August. It is a skill, and skills need repetitions. The same five minutes are the long form of the pitch that you wrote in week 9 for the interview question "Tell me about a project". And preparing a talk forces a decision that you have probably avoided so far: what exactly is the result of your project?

## One message

Five minutes carry one message. Everything in the talk either leads to it or is cut. Write the message as a single sentence with three parts: the problem, what you did, and the number that shows it worked.

For the event processor of Project 2, with the numbers of the reference solution, such a sentence could be: "My program for finding muon pairs spent 99% of its time reading a text file, so I changed how the data is stored and used every core, and it now processes about 22 million events a second."

If the sentence has no number, the project has no result yet, or you have not found it. Go back to your own summaries of the projects: each of them ends with a measurement.

A listener who remembers this one sentence a week later has got everything you wanted. A listener who was shown six results remembers none of them.

## Count the words

The commonest failure of a short talk is that it does not fit. The speaker has material for ten minutes, notices at minute four, and races through the result, which is the only part that mattered. In a session with eighteen talks in a row, the chair stops you when the time is over.

The cure is arithmetic. Measure how fast you speak. Read the following passage aloud, at the pace and with the pauses that you would use in front of people, and stop the time. It has 150 words:

```
This summer I worked on a program that reads recorded collisions and
finds pairs of muons. For every pair it computes the invariant mass
and fills a histogram, in which the known particles appear as peaks.
The first version was correct, and it was slow. When I measured it,
almost all of the time went into reading a text file, and almost
none into the physics. So I changed the format of the input first,
and only then the calculation itself. After that I laid the data out
in columns, so that the compiler could process several events with
one instruction, and I used all the cores of the machine. Every step
was checked against the step before it, bin for bin. In the end the
program handled millions of events a second, and I had learned
something I will not forget: measure first, and change the code
after that.
```

Your pace in words per minute is 150 times 60, divided by the seconds you needed. If the passage took 75 seconds, the pace is 9000 / 75 = 120 words per minute.

Plan to speak for four and a half of the five minutes. The remaining half minute goes to breathing, to changing slides and to the moment when the picture takes a while to appear. Your script may therefore have 4.5 times your pace in words. At 120 words per minute that is 540 words, a little more than one printed page. That is all the room there is, and knowing the number changes how you write.

## The structure

The announcement names three parts: the project, the challenges and the results. With an opening and an ending they make five blocks. This division of the 300 seconds has room to breathe:

```
0:00 - 0:30   the problem, and why anybody should care
0:30 - 1:15   what you built, in one picture
1:15 - 2:45   the one difficulty that taught you most, and how you solved it
2:45 - 4:15   the result: one plot or one table, and the number
4:15 - 4:45   what it means, and what you would do next
4:45 - 5:00   reserve
```

Three decisions hide in this plan.

**One difficulty.** Your project had ten. Choose the one from which a listener learns something, and tell it as a small story: what you expected, what you measured instead, and what you did about it. "I expected the physics to be slow, and it was the file reading" is a story. A list of everything you fixed is not.

**The result gets the most time.** Ninety seconds on a single plot feels long when you plan it and is short when you give it. The audience needs time to read the axes before the curve means anything.

**The first thirty seconds are not about you.** Start with the problem. Your name is on the first slide and the chair has just read it out.

## Slides that work from the last row

Five minutes need five or six slides plus a title. More than that and you are flipping instead of talking.

- **Give every slide a title that is a sentence.** "Results" tells the audience nothing. "Reading the file took 99% of the run" tells them what to see, even if they look up late.
- **One idea per slide.** If a slide makes two points, it is two slides, or one point too many.
- **A plot needs axis labels with units and letters that can be read from the back.** Make it again for the talk with larger fonts. The version from your notebook is too small. A rule of thumb: nothing on a slide smaller than 20 points.
- **Few numbers, with units, rounded.** "22 million events per second" can be heard and remembered. The same result with every digit that the program printed can't.
- **Almost no code.** If a line of code is the point, show that line, large. Nobody reads a screen of code in thirty seconds.
- **Explain every abbreviation, or don't use it.** The audience of a lightning session comes from all corners of computing and physics.
- **End on the result.** The last slide stays on the wall during the questions, so it should show your message, the number and the address of your repository, and not the words "Thank you".

Export the slides as PDF. A PDF looks the same on every computer, and it is the format in which the 2025 talks are attached to the agenda.

## Rehearse against the clock

A talk that has never been spoken aloud does not exist yet. Reading it silently takes half the time and hides every sentence that is hard to say. Three rehearsals are the minimum, and each has its own purpose.

- **Alone, aloud, with a stopwatch.** You find out how long it is. It will be too long.
- **Recorded.** A phone is enough. Listen to it once, which is unpleasant and worth it. You hear the filler words, the sentences that go nowhere, and the place where you rush.
- **In front of one person who does not program.** Ask them afterwards what the talk was about. If their answer is your one sentence, the talk works. If it isn't, the talk is not clear yet, however good the slides are.

When the clock says five and a half minutes, the answer is never to speak faster. Remove something: a slide, a difficulty, a side remark. What you remove was not the message.

Learn the first two sentences and the last one by heart. The start is when nerves are worst, and a known sentence carries you through it. The end is what people keep, and it should not be "so, yes, that's it".

## Questions

Two minutes for questions is one question, perhaps two. You can prepare for them, because they are nearly always the same kinds: how do you know that the result is right, what is the limit of your approach, why did you not use a certain other tool, and what would you do with more time.

Write down the three questions that you would least like to get, and answer each in two or three sentences. If an answer needs a plot, put it on a spare slide behind the last one.

When a question comes that you can't answer, say so, and say how you would find out: "I have not measured that. I would check it by running the same test with a larger file." It is the answer of somebody who can be trusted with a project. A confident guess that turns out wrong is remembered much longer.

## A model outline

For Project 2, with the numbers of the reference solution, the plan of the talk could look like this:

```
title   A dimuon processor at 22 million events a second
0:00    Analyses read far more events than they keep, so the
        speed of the event loop decides how often you can try an idea.
0:30    What it does: read events, compute the mass of each muon
        pair, fill a histogram. One diagram with three boxes.
1:15    The surprise: the first version needed 0.157 s to read
        100,000 events and 0.0012 s for the physics. So the work
        started at the file, not at the formula.
        Parsing without allocating memory: 157 ms became 34 ms.
2:45    The result: one bar chart, events per second after each
        step. Columns, vectorisation, threads. The histogram is
        identical after every step, bin for bin.
4:15    What I take from it: measure first. Next step: a GPU.
last    The message, the number, the address of the repository.
```

Compare it with the structure above. There is one difficulty, told as a surprise. The result is one chart. And the sentence that the audience should remember appears three times: in the title, in the middle and on the last slide.

--- practice
@predict
You read the 150-word passage aloud in 75 seconds. You plan to speak for four and a half minutes. How many words may your script have?
= 540
! The pace is 150 times 60 / 75 = 120 words per minute, and 120 times 4.5 is 540. Half a minute of the five is kept for pauses and slide changes.

@predict
Your script has 700 words, and you speak 140 words per minute. By how many seconds does it exceed a speaking time of four and a half minutes?
= 30
=| 30 s
=| 30 seconds
! 700 / 140 = 5 minutes, which is 300 seconds, against a budget of 270. Thirty seconds too long means 70 words too many, about one slide's worth.

@choice
Your second rehearsal takes six minutes for a five-minute slot. What do you do?
- Speak faster and leave out the pauses
- Make the fonts smaller so that more fits on fewer slides
* Remove a part: a slide, a second difficulty or a side remark
- Shorten the part about the result, because the audience can read the plot
! Speaking faster costs the audience's understanding, and the result is the one part that must not shrink. A talk gets shorter by saying less.

@choice
Which title is best for a slide that shows a profile of your first program?
- Profiling
- Results (1)
* Reading the file took 99% of the run
- Some observations on performance
! A title that is a sentence states the point of the slide. A listener who looks up late still knows what the picture is meant to show.

@choice
What belongs on the last slide of a lightning talk?
- "Thank you for your attention" in large letters
- A list of all the tools that you used
* Your message with its number, and where the work can be found
- An outline of the talk
! The last slide stays visible during the questions, often longer than any other. It should repeat the one thing that the audience is meant to keep.

@choice
After your talk somebody asks whether your speed-up also holds on a machine with 64 cores. You never tested that. What is the best answer?
- "Yes, it scales linearly."
- "That is outside the scope of this project."
* "I have not measured that. On my four cores it scaled as shown. I would test it by running the same benchmark there and comparing against the one-thread run."
- Change the subject to something that you did test
! You say what you know, what you don't, and how you would find out. That is how a careful engineer answers, and the audience notices it.

@choice
Your project had many difficulties. How many of them do you present in five minutes?
- All of them, briefly, to show how much work it was
- None, because difficulties look bad
* One, the one from which a listener learns something, told as expectation, measurement and solution
- Three, so that the talk has a clear structure
! One difficulty with its story can be remembered. A list of ten is forgotten before the next speaker starts.

@write
Write the one message of your talk as a single sentence with three parts: the problem, what you did, and the number that shows it worked. Use one of your own five projects and your own number.
min: 25
```solution
A jet tagger for the trigger must fit on a chip, so I pruned 70% of the weights of mine and trained it with 6-bit numbers, and it kept an accuracy of 0.759 against 0.766 while needing 18 times fewer bits.
```
! Check your sentence against three questions. Does it name a problem that somebody else would care about? Does it say what you did, and not what the tools did? Is there a number in it? The example uses the numbers of the reference run of week 17. Use the ones from your own summary.

@write
Write the outline of your talk in blocks with their start times, from 0:00 to 5:00. Say for each block in a few words what you tell and what is on the slide.
min: 70
```solution
0:00 Problem: a model that serves predictions must stay available while it is updated. Slide: one sentence and a sketch of users calling a service.
0:30 What I built: a FastAPI service around my ONNX model, three replicas on Kubernetes. Slide: one diagram.
1:15 The difficulty: during a rolling update without safeguards, 36 of about 18,800 requests failed. I had expected Kubernetes to handle that by itself. Slide: the failed requests for each missing safeguard, then the safeguards, one line each.
2:45 Result: the same update with all safeguards and one retry in the client, 0 failed out of 25,830. Slide: both runs side by side, with the latency table.
4:15 What it means and what is next: alerts on the error rate.
4:45 Reserve. Last slide: message, number, repository.
```
! The times must add up to five minutes, the result must get the largest block, and only one difficulty may appear. If your outline has more than seven blocks, it is a ten-minute talk. The example uses the numbers of the reference run of week 19.

@write
Write down the three questions that you would least like to be asked about your project, and answer each in two or three sentences.
min: 80
```solution
How do you know the fast version is still correct? After every optimisation I compared the histogram with the one of the first version, bin for bin, and a test in the repository does that automatically.
Why not use ROOT's RDataFrame from the start? I did the same analysis with it at the end as a cross-check. Writing the loop by hand first was the point of the project: I wanted to see where the time goes.
Does it scale beyond four cores? I could only measure up to four. The work is independent per event, so I expect it to scale further, but I have not measured it and would not claim it.
```
! Good answers are short, say what was measured, and separate it from what is only expected. The third example shows how to admit a limit without weakening the result.
--- recall
Q: What does the announcement of the openlab lightning talks ask every student to do in five minutes?
A: To introduce the audience to the project, explain the technical challenges, and describe the results of the two months of work.
Q: What are the three parts of the one-sentence message of a talk?
A: The problem, what you did, and the number that shows it worked.
Q: How do you find out how many words your five-minute script may have?
A: Measure your pace by reading a passage of known length aloud with a stopwatch. Plan four and a half minutes of speaking: words = 4.5 times your words per minute.
Q: Which block of a five-minute talk gets the most time?
A: The result: about ninety seconds on one plot or table with the number.
Q: What makes a good slide title?
A: A full sentence that states the point of the slide, such as "Reading the file took 99% of the run".
Q: Your rehearsal runs a minute over. What do you change?
A: Remove content: a slide, a second difficulty or a side remark. Never speak faster, and never shorten the result.
Q: What are the three rehearsals, and what is each for?
A: Alone with a stopwatch, for the length. Recorded, to hear filler words and rushing. In front of somebody who does not program, to test whether the message arrives.
Q: How do you answer a question that you can't answer?
A: Say that you have not measured it, say what you do know, and say how you would find out.

=== x4 | exam | 22 | Checkpoint 4: networks, services and contributions from memory | 110,12
This is the last checkpoint. It covers weeks 15 to 21: neural networks and PyTorch, quantisation and ONNX, web services, SQL, asyncio, Kubernetes, metrics, reading code and the pull request workflow. There are sixteen tasks.

Five are complete programs or files. You write each from an empty file on your own machine, run it and paste what it prints. Plan about fifteen minutes for each. The other eleven are questions with one answer, and you get one attempt at each.

Before you start the clock: open a terminal in an empty folder and an editor with AI autocompletion switched off. Check that `python -c "import torch, fastapi, httpx"` prints nothing, and that `kubectl get nodes` shows the node of your kind cluster as `Ready`. Create the cluster first if it is gone. Then close everything else. No notes, no search, no AI.

--- practice
@local
Write `fit.py`. Make 100 points with `x` evenly spaced from -1 to 1 and `y = 2 * x + 1`, as tensors of shape (100, 1). Fit them with one `nn.Linear(1, 1)`, the mean squared error and SGD with a learning rate of 0.1, for 500 steps on all points at once. Print the weight and the bias with two decimals, separated by a space. Paste the output.
min: 1
= 2.00 1.00
```solution
import torch
from torch import nn

x = torch.linspace(-1, 1, 100).reshape(-1, 1)
y = 2 * x + 1

model = nn.Linear(1, 1)
loss_fn = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

for step in range(500):
    optimizer.zero_grad()
    loss = loss_fn(model(x), y)
    loss.backward()
    optimizer.step()

print(f"{model.weight.item():.2f} {model.bias.item():.2f}")
```
! The four lines inside the loop are the whole of training: clear the old gradients, compute the loss, compute the gradients, take the step. The data has no noise, so the fit recovers the slope 2 and the offset 1 exactly, whatever the random start was.

@predict
A network with two classes gives the logits 0 and 0 for an event. What is the cross-entropy loss for that event? Give three decimals.
= 0.693
=| 0,693
=| .693
! The softmax of two equal logits is 0.5 for each class, and the loss is the negative logarithm of the probability of the true class: -ln 0.5 = 0.693. It is the loss of a network that knows nothing about two classes, and a useful number to recognise at the start of a training.

@choice
In which order do the four steps of one training iteration in PyTorch come?
- `optimizer.step()`, `loss.backward()`, `optimizer.zero_grad()`, compute the loss
* `optimizer.zero_grad()`, compute the loss, `loss.backward()`, `optimizer.step()`
- compute the loss, `optimizer.step()`, `loss.backward()`, `optimizer.zero_grad()`
- `loss.backward()`, `optimizer.zero_grad()`, compute the loss, `optimizer.step()`
! The gradients must be cleared before `backward` adds the new ones, `backward` needs a loss, and `step` needs the gradients.

@predict
What is the step between two neighbouring values of the fixed-point type `ap_fixed<8, 3>`? Give a decimal number.
= 0.03125
=| 1/32
=| 0,03125
=| .03125
! Of the 8 bits, 3 stand before the point, the sign included, and 5 after it. The step is 2 to the power -5, which is 1/32.

@choice
You export a model to ONNX. On the same inputs, the outputs of PyTorch and of ONNX Runtime differ by 2e-7 at most. What do you conclude?
- The export is broken, because the outputs must be identical
- ONNX Runtime uses 16-bit numbers
* The export is fine. The two engines add the same numbers in a different order, and float32 arithmetic then differs in the seventh digit
- The model was quantised during the export
! A float32 has about seven significant digits, and the order of additions changes the rounding. A difference of 1e-2 would be a bug, usually a preprocessing step that was applied twice or not at all.

@local
Write `service.py`: a FastAPI application with `GET /healthz`, which returns the JSON object with the key `status` and the value `ok`, and `POST /square`, which takes a JSON body with a number under the key `x` and returns the square under the key `y`. Put the lines below at the end of the file, run it with `python service.py` and paste the output.
```
if __name__ == "__main__":
    from fastapi.testclient import TestClient
    client = TestClient(app)
    r = client.get("/healthz")
    print(r.status_code, r.json())
    r = client.post("/square", json={"x": 3})
    print(r.status_code, r.json())
    print(client.post("/square", json={"x": "three"}).status_code)
    print(client.get("/square").status_code)
    print(client.get("/nothing").status_code)
```
min: 5
= 200 {'status': 'ok'}
= 200 {'y': 9.0}
= 422
= 405
= 404
```solution
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Number(BaseModel):
    x: float


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.post("/square")
def square(number: Number):
    return {"y": number.x * number.x}
```
! The last three status codes come without a line of your own code. The pydantic model rejects a body whose `x` is not a number with 422, a path that exists only for POST answers a GET with 405, and an unknown path gives 404.

@choice
`EXPLAIN QUERY PLAN` prints `SCAN events` for a query that filters on the column `run`. What does that mean, and what is the usual cure?
- The query is wrong and returns no rows. Rewrite the `WHERE` clause
* Every row of the table is read. Create an index on `run`, after which the plan says `SEARCH ... USING INDEX`
- The table is locked by another connection. Wait and try again
- The database file is damaged. Restore it from a backup
! Without an index the database has no choice but to look at every row. With one it goes straight to the matching rows, and the cost grows with the logarithm of the table size.

@local
Write `failed.py`. It creates an SQLite database in memory with a table `jobs (site TEXT, status TEXT, seconds REAL)`, inserts the rows below with placeholders, and prints one line for every site that has at least two failed jobs: the site, the number of its failed jobs and their mean duration rounded to one decimal. The site with the most failed jobs comes first. Let the database do the counting, with one query. Paste the output.
```
rows = [
    ("CERN", "done", 310.0), ("CERN", "failed", 12.0),
    ("CERN", "done", 290.0), ("FNAL", "failed", 8.0),
    ("FNAL", "failed", 15.0), ("FNAL", "done", 400.0),
    ("KIT", "done", 350.0), ("KIT", "failed", 20.0),
    ("KIT", "failed", 30.0), ("KIT", "failed", 10.0),
]
```
min: 2
= KIT 3 20.0
= FNAL 2 11.5
```solution
import sqlite3

rows = [
    ("CERN", "done", 310.0), ("CERN", "failed", 12.0),
    ("CERN", "done", 290.0), ("FNAL", "failed", 8.0),
    ("FNAL", "failed", 15.0), ("FNAL", "done", 400.0),
    ("KIT", "done", 350.0), ("KIT", "failed", 20.0),
    ("KIT", "failed", 30.0), ("KIT", "failed", 10.0),
]

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE jobs (site TEXT, status TEXT, seconds REAL)")
db.executemany("INSERT INTO jobs VALUES (?, ?, ?)", rows)

query = """
    SELECT site, COUNT(*) AS n, AVG(seconds)
    FROM jobs
    WHERE status = 'failed'
    GROUP BY site
    HAVING COUNT(*) >= 2
    ORDER BY n DESC
"""
for site, n, mean in db.execute(query):
    print(site, n, round(mean, 1))
```
! `WHERE` chooses the rows before the grouping and `HAVING` chooses the groups after it. CERN has one failed job and drops out at `HAVING`. The question marks are placeholders, which keep the values apart from the text of the query.

@choice
A handler is written with `async def` and calls `time.sleep(1)` inside. What happens to the other requests during that second?
- Nothing. Each request has its own thread
- They are answered with status 503
* They all wait, because the handler blocks the event loop on which every coroutine runs
- They are moved to another process
! An `async def` handler runs on the event loop itself and must await everything slow. `time.sleep` does not give the loop back. Either use `await asyncio.sleep(1)`, or write the handler with `def`, so that it runs in a worker thread.

@local
Write `limit.py`. Ten coroutines `work(i)` each wait 0.05 seconds with `asyncio.sleep` and return `i * i`. At most three of them may be in the waiting part at the same time. Count how many are in it, remember the largest count that ever occurs, run all ten together and print that largest count and the sum of the ten results. Paste the output.
min: 1
= 3 285
```solution
import asyncio

inside = 0
most = 0


async def work(i, gate):
    global inside, most
    async with gate:
        inside += 1
        most = max(most, inside)
        await asyncio.sleep(0.05)
        inside -= 1
    return i * i


async def main():
    gate = asyncio.Semaphore(3)
    results = await asyncio.gather(*(work(i, gate) for i in range(10)))
    print(most, sum(results))


asyncio.run(main())
```
! The semaphore lets three coroutines in and makes the others wait at `async with`. The counters need no lock: only one coroutine runs at a time, and it can be interrupted only at an `await`.

@predict
A client sends a GET request to a path that the service offers only for POST. Which status code does it get?
= 405
! 405 Method Not Allowed: the path exists, but not for this method. A path that does not exist at all gives 404.

@predict
A deployment has 5 replicas, `maxSurge: 2` and `maxUnavailable: 1`. During a rolling update, what is the largest number of its pods that can exist at the same time, and what is the smallest number that must be ready? Type two numbers.
= 7 4
=| 7, 4
=| 7 and 4
! The surge allows two pods more than the five that are wanted, and at most one of the five may be missing.

@local
Write `deploy.yaml`: a Deployment with the name `x4-echo` and 3 replicas of the image `jet-service:0.2`. The pods carry the label `app: x4-echo`, and the container listens on port 8000. Add a readiness probe that sends a GET to `/readyz` on that port, a CPU request of a quarter of a core, and a rolling update that never has fewer than three ready pods and at most one more than three. Run the commands below and paste the output of both.
```
kubectl apply --dry-run=server -f deploy.yaml
C='.spec.template.spec.containers[0]'
kubectl apply --dry-run=server -f deploy.yaml -o jsonpath="{.spec.replicas} \
{.spec.strategy.rollingUpdate.maxUnavailable} \
{$C.readinessProbe.httpGet.path} {$C.resources.requests.cpu}"
```
min: 2
= deployment.apps/x4-echo created (server dry run)
= 3 0 /readyz 250m
```solution
apiVersion: apps/v1
kind: Deployment
metadata:
  name: x4-echo
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: x4-echo
  template:
    metadata:
      labels:
        app: x4-echo
    spec:
      containers:
        - name: x4-echo
          image: jet-service:0.2
          ports:
            - containerPort: 8000
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8000
          resources:
            requests:
              cpu: 250m
```
! A server dry run sends the file to the cluster, which checks it completely and creates nothing. A misspelt field is refused with `unknown field`. The second command prints four of the values that you wrote. The selector must match the labels of the pod template, or the server rejects the Deployment.

@predict
The counter `requests_total` of a service reads 1200. One minute later it reads 1500. What does `rate(requests_total[1m])` show for that minute?
= 5
=| 5.0
=| 5 per second
=| 5/s
! `rate` gives the increase per second: 300 requests in 60 seconds. A counter only ever grows, so its raw value says little. Its rate is what you plot and alert on.

@choice
You are reading a codebase that is built on a framework. A method `configure_optimizers` is defined in a class, and `git grep` finds no call of it anywhere in the repository. What does that tell you?
- The method is dead code
- The search is broken, because every method has a caller
* The framework calls it. The class inherits from a framework class whose contract prescribes that method name
- It is called from a configuration file
! This is inversion of control: you write the method, and the framework calls it at the right moment. To learn when, read the framework's documentation for the base class.

@choice
You rebased the branch of your own pull request onto `upstream/main`. A plain `git push` is rejected as non-fast-forward. What is the right command?
- `git pull`, as the hint of Git suggests
- `git push --force origin main`
* `git push --force-with-lease`
- `git reset --hard origin/main`
! The rebase wrote new commits, and they must replace the old ones on your fork. The lease form does that only if nobody else has pushed to the branch since your last fetch. `git pull` would merge the old copies back in, and `main` is never force-pushed.
