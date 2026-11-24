=== dataviz | data | 8 | Data visualisation with matplotlib and seaborn |
@@ About 25 min reading · Handbook chapter 15 · Homework 13, and the plots in every homework
## Why this matters

Almost every Sigmoid homework ends in a plot: accuracy against a hyperparameter, a decision boundary, a silhouette plot, missing values per column. A plot is often the fastest way to spot a skewed feature, an outlier, a leaking column or an overfitting curve, and it is how your conclusions are read by others. This lesson covers how matplotlib is organised, which chart answers which question, the seaborn shortcuts from the handbook, and the habits that make a plot readable.

## How matplotlib is organised

A **Figure** is the whole image (the canvas). It contains one or more **Axes**: each Axes is one plot area with its own x-axis, y-axis, title and data. (Axes is not the plural of axis; an Axes has two axis objects.) Everything you draw goes onto an Axes.

matplotlib has two interfaces, and the handbook shows both:

- **pyplot / MATLAB style**: `plt.plot(...)`, `plt.title(...)` act on the "current" Axes, which pyplot tracks for you. `plt.subplot(2, 1, 1)` means "a grid of 2 rows and 1 column, make panel 1 current".
- **Object-oriented style**: create the objects and call methods on them.

```
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)                 # 100 evenly spaced points from 0 to 10
fig, ax = plt.subplots(2, 1, figsize=(6, 5))   # a Figure and an array of 2 Axes
ax[0].plot(x, np.sin(x), color="red", label="sin(x)")
ax[1].plot(x, np.cos(x), linestyle="dotted", label="cos(x)")
ax[0].set_title("Sine")                     # object style: set_title, set_xlabel, set_xlim
ax[1].set_xlabel("x")
for a in ax:
    a.legend()
fig.tight_layout()                          # stop labels overlapping
fig.savefig("waves.png", dpi=150, bbox_inches="tight")
```

Prefer the object style for anything with more than one panel: it is explicit about which Axes you are drawing on. Note the naming difference: `plt.title` and `plt.xlim` versus `ax.set_title` and `ax.set_xlim`. `plt.subplots(2, 2)` returns a 2 × 2 array, so you index it as `ax[0, 1]`; `ax.flat` loops over all panels.

## Which chart for which question

| Question | Chart | matplotlib | seaborn |
|---|---|---|---|
| How does y change with x (ordered x)? | line | `ax.plot` | `sns.lineplot` |
| How are two numeric variables related? | scatter | `ax.scatter` | `sns.scatterplot`, `sns.jointplot` |
| What is the distribution of one variable? | histogram, KDE | `ax.hist` | `sns.histplot`, `sns.kdeplot` |
| How do distributions compare across groups? | box, violin | `ax.boxplot` | `sns.boxplot`, `sns.violinplot` |
| How large is each category? | bar | `ax.bar`, `ax.barh` | `sns.barplot`, `sns.countplot` |
| How do many variables correlate? | heatmap | `ax.imshow` | `sns.heatmap(df.corr(), annot=True)` |
| How does a function of two variables look? | contour | `ax.contour`, `ax.contourf` | |
| How uncertain is each measurement? | error bars | `ax.errorbar` | built into `barplot`, `lineplot` |

### Line and scatter

`ax.plot(x, y)` connects points in order, so use it when x is ordered (time, a hyperparameter). `ax.scatter(x, y, c=values, s=sizes, alpha=0.3, cmap="viridis")` can give every point its own colour (`c`) and size (`s`, in points squared), which encodes extra variables; `alpha` (0 to 1) sets transparency so dense regions show. Add `fig.colorbar(...)` to explain a colour scale. For many thousands of identical-looking points, `ax.plot(x, y, "o")` is faster than `scatter`, because scatter styles each point individually.

### Histograms

A histogram divides the range from the minimum to the maximum into equal-width **bins** and counts the values in each. Each bin includes its left edge and excludes its right edge, except the last bin, which includes both. For the values 1, 2, 2, 3, 3, 3, 4, 4, 5, 10 with `bins=3`, the edges are 1, 4, 7, 10 and the counts 6, 3, 1. The number of bins changes the story: too few hide structure (two peaks merge), too many show noise. `ax.hist` returns `(counts, edges, patches)`, so you can check the numbers behind the picture. `density=True` rescales the bars so their total area is 1, which lets you compare groups of different sizes. `ax.hist2d(x, y, bins=30)` counts points in a grid of 2-D bins.

### KDE

A **kernel density estimate** places a small smooth bump (usually a normal curve) on every observation and adds them up, giving a smooth version of a histogram. The bump width (`bw_adjust` in seaborn) plays the role of the bin width. The handbook's KDE example compares the age distributions of heart patients with and without disease. It uses `shade=True`, which seaborn has deprecated; write `fill=True`.

### Box plots and violin plots

A **box plot** summarises a distribution with five numbers: the box runs from the first quartile Q1 (25th percentile) to the third quartile Q3 (75th), with a line at the median. The whiskers reach the most extreme data points within 1.5 × IQR of the box, where IQR = Q3 − Q1 is the interquartile range, and points beyond the whiskers are drawn individually as potential outliers. (Week 9 turns this rule into an outlier detector.) A **violin plot** draws a mirrored KDE around a slim box plot, so it also shows shape, for example two peaks, which a box hides.

```
import seaborn as sns
sns.boxplot(data=df, x="target", y="age")       # one box per class
sns.violinplot(data=df, x="target", y="age")
sns.jointplot(data=df, x="age", y="trestbps", kind="hex")   # scatter/hexbin with marginal histograms
sns.lmplot(data=df, x="age", y="chol", hue="target")        # scatter + a regression line per class
```

seaborn functions take a DataFrame and column names, map a categorical column to colour with `hue=`, and draw on matplotlib Axes. Axes-level functions (`boxplot`, `histplot`, `kdeplot`, `scatterplot`) accept `ax=` so they fit in your subplot grid; figure-level functions (`jointplot`, `lmplot`, `pairplot`, `relplot`) create their own Figure and take `height=` instead.

### Error bars and contours

`ax.errorbar(x, y, yerr=dy, fmt=".k")` draws each point with a vertical bar of ± dy; `fmt` uses the same shorthand as `plot` (`.` marker, `k` black). Use it for the mean ± standard deviation of cross-validation scores at each hyperparameter value: it shows whether a difference is bigger than the noise.

`ax.contourf(X, Y, Z)` colours regions of a 2-D grid by the value Z. Decision boundary plots are made this way: build a grid with `np.meshgrid`, predict on every grid point, and draw the predictions with `contourf` (sklearn's `DecisionBoundaryDisplay` does it for you).

## Habits of a readable plot

- Every axis has a label with units; every plot has a title that says what it shows.
- One message per plot. If the reader must compare panels, share axes (`plt.subplots(..., sharey=True)`).
- Use a legend only when there is more than one series, and put the key fact in the title ("Test accuracy peaks at max_depth = 4").
- Use colour to encode a variable, not to decorate. Sequential maps (`viridis`) for ordered values, a diverging map (`coolwarm`) for correlations centred at 0, distinct hues for categories. Avoid red-green as the only distinction.
- Start bar charts at zero; line plots may zoom.
- Avoid 3-D effects and pie charts with many slices.
- Show uncertainty (error bars, shaded bands) when comparing models.

## Version notes for the handbook's code

- `plt.style.use("seaborn-whitegrid")` fails on matplotlib 3.6 and later; the style is now called `"seaborn-v0_8-whitegrid"`, or use `sns.set_theme(style="whitegrid")`.
- `sns.kdeplot(..., shade=True)`: use `fill=True`.
- `%matplotlib inline` is only needed in old Jupyter versions; plots show automatically now. In a script, call `plt.show()`.

## Common mistakes

> **Mixing the two interfaces** (`plt.title` after creating `ax` objects can title the wrong panel). Use `ax.set_title`.

> **Reading a histogram without checking bins.** Try two or three bin counts before drawing conclusions.

> **Plots without labels.** A curve called "Figure 1" with unlabelled axes cannot be graded or understood.

## Summary

A Figure holds Axes; draw on Axes with methods (`ax.plot`, `ax.set_title`). Pick the chart from the question: line for ordered x, scatter for relationships, histogram or KDE for one distribution, box or violin to compare groups, heatmap for correlations, error bars for uncertainty. Histograms use equal-width bins from min to max. A box shows Q1, median, Q3 and whiskers to 1.5 × IQR. seaborn draws statistical plots from DataFrames with `x=`, `y=`, `hue=`.

--- practice
@choice
`fig, ax = plt.subplots(2, 3)`. What is `ax`?
- One Axes with 6 lines
* A 2 × 3 array of Axes objects, indexed like `ax[1, 2]`
- A list of 2 Figures
- A tuple (2, 3)
! subplots returns the Figure and an array of Axes with the grid's shape.

@predict
Using numpy's rules (equal-width bins from min to max, last bin closed), what are the counts for the values 1, 2, 2, 3, 3, 3, 4, 4, 5, 10 with 4 bins? Type them as a list.
```python
import numpy as np
counts, edges = np.histogram([1, 2, 2, 3, 3, 3, 4, 4, 5, 10], bins=4)
print(counts.tolist())
```
= [6, 3, 0, 1]
! The edges are 1, 3.25, 5.5, 7.75, 10. The empty third bin shows how one far value (10) stretches the range.

@choice
You want to compare the distribution of cholesterol between patients with and without heart disease, including whether either group has two peaks. Which plot fits best?
- A pie chart
- A line plot of cholesterol by row number
* A violin plot (or overlaid KDEs) by target class
- A bar chart of mean cholesterol per class
! A violin shows each group's full distribution shape. A bar of means hides spread and shape; a box hides multiple peaks.

@choice
In a box plot, which points are drawn individually beyond the whiskers?
- The 5% largest and smallest values
* Points more than 1.5 × IQR below Q1 or above Q3
- Points more than 3 standard deviations from the mean
- All points outside the box
! The whiskers stop at the furthest data point within 1.5 × IQR of the box; anything further is plotted as a potential outlier.

@run
Write `hist_counts(xs, bins)` that reproduces `np.histogram`'s counts: edges equally spaced from min(xs) to max(xs); a value belongs to bin i if edge[i] ≤ x < edge[i+1], except that the maximum goes in the last bin. Return the list of counts. Then `five_numbers(xs)` returning (min, Q1, median, Q3, max) using the same linear interpolation as `np.percentile` (position p·(n − 1) in the sorted list).
```starter
def hist_counts(xs, bins):
    pass

def five_numbers(xs):
    pass
```
```test
xs = [1, 2, 2, 3, 3, 3, 4, 4, 5, 10]
print(hist_counts(xs, 3), hist_counts(xs, 4))
print(hist_counts([0, 0.5, 1], 2))
print(five_numbers(xs))
```
= [6, 3, 1] [6, 3, 0, 1]
= [1, 2]
= (1, 2.25, 3.0, 4.0, 10)
```solution
def hist_counts(xs, bins):
    lo, hi = min(xs), max(xs)
    width = (hi - lo) / bins
    counts = [0] * bins
    for x in xs:
        i = int((x - lo) / width)
        if i >= bins:
            i = bins - 1
        counts[i] += 1
    return counts

def _pct(s, p):
    pos = p * (len(s) - 1)
    lo = int(pos)
    if lo + 1 >= len(s):
        return float(s[lo])
    return s[lo] + (pos - lo) * (s[lo + 1] - s[lo])

def five_numbers(xs):
    s = sorted(xs)
    return (s[0], _pct(s, 0.25), _pct(s, 0.5), _pct(s, 0.75), s[-1])
```
! Q1 = 2.25 sits a quarter of the way between the 3rd and 4th sorted values (2 and 3): position 0.25 × 9 = 2.25. With IQR = 1.75, the upper whisker limit is 4 + 2.625 = 6.625, so 10 would be drawn as an outlier.

@local
On your own machine, run this and paste the output (it checks your matplotlib setup and the object interface):
```python
import matplotlib
matplotlib.use("Agg")                 # draw without opening a window
import matplotlib.pyplot as plt
fig, ax = plt.subplots(2, 2, figsize=(8, 6))
print(type(fig).__name__, ax.shape)
counts, edges, _ = ax[0, 0].hist([1, 2, 2, 3, 3, 3, 4, 4, 5, 10], bins=3)
print(counts.tolist(), edges.tolist())
print(matplotlib.__version__)
```
min: 3
= Figure (2, 2)
= [6.0, 3.0, 1.0] [1.0, 4.0, 7.0, 10.0]
! `ax.hist` returns float counts and the bin edges; checking them is how you make sure a histogram says what you think.

@write
From memory, describe how you would visually compare a single hyperparameter's effect on train and validation accuracy, including how you would show the noise, and which labels and title the plot needs.
min: 50
```solution
I would put the hyperparameter values on the x-axis (log scale for values like C) and plot two lines with ax.plot: mean training accuracy and mean cross-validation accuracy at each value. To show noise I would use ax.errorbar or ax.fill_between with the mean plus and minus the standard deviation of the fold scores. Labels: the hyperparameter's name on x, "accuracy" on y, a legend for train and validation, and a title stating the finding, such as "Validation accuracy peaks at max_depth = 4". The gap between the lines shows overfitting.
```
! Check that you included uncertainty and a title that states the conclusion.

--- recall
Q: What is the difference between a Figure and an Axes?
A: A Figure is the whole image; an Axes is one plot area inside it with its own x and y axis.
Q: What does a box plot show?
A: Q1, median and Q3 as the box; whiskers to the furthest points within 1.5 × IQR; points beyond as possible outliers.
Q: Which plot for the distribution of one numeric variable, and which to compare it across groups?
A: Histogram or KDE; box or violin plot (or overlaid KDEs) by group.
Q: How do you set a title in the object interface?
A: ax.set_title("..."), likewise ax.set_xlabel, ax.set_xlim.
