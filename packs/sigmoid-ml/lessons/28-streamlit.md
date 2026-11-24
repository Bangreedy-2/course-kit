=== streamlit | ship | 10 | Streamlit: turning a model into an app | d-streamlit
@@ About 25 min reading · Handbook chapter 21 · Homework 19
## Why this matters

A model in a notebook helps nobody outside it. Streamlit turns a plain Python script into a web app with sliders, buttons, tables and charts, without HTML, JavaScript or a web framework. Homework 19 asks for exactly that: a home page describing the dataset, sidebar navigation, a page of parameter widgets with a Train button, the data's head, a summary of the chosen parameters, at least three charts and every text element type. The one idea that makes Streamlit easy, and the one that causes most bugs, is its execution model; that is where this lesson starts.

## Running an app

```
pip install streamlit
streamlit hello                    # demo app: checks the installation
streamlit run app.py               # runs your script and opens http://localhost:8501
```

`streamlit run` starts a small web server. Edit and save `app.py` and the page offers to rerun with the new code.

## The execution model: the whole script reruns

Streamlit runs your script **from top to bottom**, and every `st.` call adds an element to the page. Whenever the user touches a widget (moves a slider, clicks a button, picks an option), Streamlit **reruns the entire script** from the top, and this time the widget function returns the new value.

That is why widgets read like ordinary variables (no callbacks needed, as the handbook says):

```
import streamlit as st

depth = st.slider("max_depth", 1, 20, 5)       # label, min, max, default; returns the current value
st.write("You chose depth", depth)
if st.button("Train"):                         # True only on the rerun caused by the click
    st.write("Training with depth", depth)
```

Three consequences follow:

1. **`st.button` is True for one rerun only.** Anything shown inside `if st.button(...)` disappears on the next interaction. To remember that training happened, store the result in `st.session_state`.
2. **Everything is recomputed on every rerun**, including loading a CSV and training a model, unless you cache it.
3. **Variables do not survive between reruns**, except in `st.session_state`.

### session_state

`st.session_state` is a dictionary-like object that persists across reruns for one browser session:

```
if "model" not in st.session_state:
    st.session_state.model = None
if st.button("Train"):
    st.session_state.model = DecisionTreeClassifier(max_depth=depth).fit(X_train, y_train)
if st.session_state.model is not None:
    st.metric("Test accuracy", round(st.session_state.model.score(X_test, y_test), 3))
```

Now the metric stays on screen after the user moves another widget.

### Caching

Decorate expensive functions so their results are reused when called again with the same arguments:

- `@st.cache_data` for functions that **return data** (DataFrames, arrays, lists): loading a CSV, preprocessing. Each caller gets a copy, so mutating it is safe.
- `@st.cache_resource` for **shared objects** that should exist once: a loaded model, a database connection.

```
@st.cache_data
def load(path):
    return pd.read_csv(path)       # runs once per distinct path; later calls return the cached result

df = load("heart.csv")
```

The older `@st.cache` that appears in many tutorials is deprecated; use these two. A cache is keyed by the function's code and its arguments, so changing either recomputes.

## The elements you need for homework 19

**Text**: `st.title`, `st.header`, `st.subheader`, `st.markdown("**bold** and *italic*")`, `st.code("a = 42", language="python")`, `st.latex(r"\hat{y} = \sigma(w^T x + b)")` (use a raw string, `r"..."`, so backslashes reach LaTeX intact; the handbook's `st.latex("\int ...")` only works because `\i` happens not to be an escape sequence), `st.caption`, and `st.write`, which displays almost anything: text, numbers, DataFrames, figures.

**Data**: `st.dataframe(df.head())` (interactive, sortable), `st.table` (static), `st.metric("Accuracy", 0.91, delta=0.03)` (a big number with a change arrow; the handbook's `st.metric("Some metrics", 42, 10)` passes the delta positionally), `st.json`.

**Charts**: `st.line_chart(df)`, `st.bar_chart`, `st.scatter_chart`, `st.map` (needs `lat`/`lon` columns) for quick charts; `st.pyplot(fig)` for any matplotlib figure (pass the Figure object); `st.plotly_chart` and `st.altair_chart` for interactive libraries.

**Input widgets**: `st.button`, `st.checkbox`, `st.radio`, `st.selectbox`, `st.multiselect`, `st.slider`, `st.number_input`, `st.text_input`, `st.file_uploader` (returns a file-like object you can pass to `pd.read_csv`, or `None` before upload; 200 MB limit by default), `st.download_button("Download", data=csv_bytes, file_name="preds.csv")`, `st.camera_input`. Each widget needs a unique label or `key=`.

**Layout**: `st.sidebar.<element>` (or `with st.sidebar:`) pins elements to the left panel; `col1, col2 = st.columns(2)` places elements side by side; `st.tabs(["Data", "Model"])` gives tabs; `with st.expander("Details"):` gives a collapsible box; `st.container()` groups elements, for example the box listing chosen parameters. `st.set_page_config(page_title=..., page_icon=..., layout="wide")` must be the **first** Streamlit command.

**Forms**: widgets inside `with st.form("params"):` do not trigger reruns until `st.form_submit_button("Train")` is pressed, so changing five sliders causes one rerun, not five.

## A complete small app

```
import streamlit as st
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

st.set_page_config(page_title="Iris model", layout="wide")

@st.cache_data
def load():
    data = load_iris(as_frame=True)
    return data.frame

df = load()
page = st.sidebar.radio("Page", ["Home", "Model"])

if page == "Home":
    st.title("Iris species")
    st.markdown("150 flowers, **4 measurements**, 3 species.")
    st.dataframe(df.head())
    st.bar_chart(df["target"].value_counts())
else:
    with st.form("params"):
        n = st.slider("n_estimators", 10, 300, 100, step=10)
        depth = st.slider("max_depth", 1, 10, 3)
        go = st.form_submit_button("Train")
    with st.container(border=True):
        st.write({"n_estimators": n, "max_depth": depth})
    if go:
        X, y = df.drop(columns="target"), df["target"]
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
        model = RandomForestClassifier(n_estimators=n, max_depth=depth, random_state=0).fit(X_tr, y_tr)
        st.session_state.acc = model.score(X_te, y_te)
    if "acc" in st.session_state:
        st.metric("Test accuracy", f"{st.session_state.acc:.3f}")
```

Sidebar navigation with a radio or selectbox, as here, is what homework 19 describes. For larger apps, Streamlit also supports real multipage apps: a `pages/` folder next to the main script, or `st.navigation` with `st.Page` objects.

## Sharing the app

Push the script and a `requirements.txt` (listing streamlit, pandas, scikit-learn and the rest) to a public GitHub repository, then deploy it free on Streamlit Community Cloud by pointing it at the repository and the script. Homework 19 accepts either the repository link or the deployed app link. Keep secrets such as API keys out of the repository; Community Cloud has a separate secrets setting.

## Common mistakes

> **Showing results only inside `if st.button(...)`.** They vanish on the next interaction; keep them in session_state.

> **Loading data or training on every rerun.** Cache data loading with `st.cache_data`, and train only when asked.

> **Calling `st.set_page_config` after another `st.` command.** It must come first.

## Summary

`streamlit run app.py` serves your script as a web app. The script reruns top to bottom on every interaction; widgets return their current values; a button is True for one rerun only. Persist values in `st.session_state`; cache data with `@st.cache_data` and shared objects with `@st.cache_resource`. Use the sidebar, columns, tabs, expanders and forms for layout, `st.metric`, `st.dataframe` and the chart functions for results, and `st.pyplot(fig)` for matplotlib figures.

--- practice
@choice
A user moves a slider in a Streamlit app. What happens?
- Only the slider's line of code runs again
* The whole script reruns from the top, and the slider returns its new value
- Nothing until the page is refreshed
- A callback function registered for the slider runs
! This rerun model is why widgets can be used like variables, and why caching matters.

@choice
Your app shows the accuracy inside `if st.button("Train"):`. After clicking Train, the user changes a checkbox and the accuracy disappears. Why?
- The model was deleted by the garbage collector
* st.button returns True only on the rerun caused by the click; the next rerun sees False
- Checkboxes clear the page
- The cache expired
! Store the result in st.session_state and display it outside the if.

@choice
Which decorator should wrap a function that reads a 200 MB CSV into a DataFrame?
* @st.cache_data
- @st.cache_resource
- @st.session_state
- No decorator; Streamlit caches automatically
! cache_data is for functions returning data (copied per caller); cache_resource is for shared objects like a loaded model or a connection.

@predict
A form contains three sliders and a submit button. The user moves all three sliders, then presses the button. How many times does the script rerun?
```python
print(1)
```
= 1
! Widgets inside st.form do not trigger reruns; only the submit button does. Without the form, it would be 4 reruns.

@run
Streamlit's `st.cache_data` remembers results by argument. Write a decorator `memo(fn)` that caches results in a dict keyed by the arguments tuple and keeps a count of real calls in `wrapper.calls`. Then show it works on a slow loader.
```starter
def memo(fn):
    pass
```
```test
@memo
def load(path, sep=","):
    return path.upper() + sep

print(load("a.csv"), load("a.csv"), load("b.csv"), load("a.csv", ";"))
print(load.calls)
print(load("b.csv"), load.calls)
```
= A.CSV, A.CSV, B.CSV, A.CSV;
= 3
= B.CSV, 3
```solution
def memo(fn):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            wrapper.calls += 1
            cache[args] = fn(*args)
        return cache[args]
    wrapper.calls = 0
    return wrapper
```
! Three distinct argument combinations cause three real calls; repeats are served from the cache. Streamlit's version also hashes the function's code, so editing the function invalidates the cache.

@local
Install Streamlit on your machine (`pip install streamlit`), then run the command below and paste its output.
```bash
streamlit --version
```
min: 1
= Streamlit, version
! If the command is not found, the install went into a different Python environment than your terminal uses; try `python -m streamlit --version`.

@write
From memory, explain Streamlit's rerun model and how session_state and caching each solve a problem it creates.
min: 50
```solution
Every time the user interacts with a widget, Streamlit reruns the whole script from top to bottom, and each widget call returns its current value. This makes code simple, but it means expensive work such as loading data or training would repeat on every interaction, and ordinary variables are lost between reruns. Caching with st.cache_data (or st.cache_resource for shared objects) stores a function's result for given arguments, so reruns reuse it instead of recomputing. st.session_state is a per-session dictionary that survives reruns, so values such as a trained model or a result shown after a button click stay available.
```
! Check that you explained why a button's result disappears without session_state.

--- recall
Q: What happens when a user interacts with a Streamlit widget?
A: The whole script reruns from the top; the widget returns its new value.
Q: cache_data versus cache_resource?
A: cache_data for returned data (copied per caller); cache_resource for shared objects like models or connections.
Q: How do you keep a value across reruns?
A: Store it in st.session_state.
Q: Which Streamlit command must come first in a script, if used?
A: st.set_page_config.
