=== clsmetrics | sup | 4 | Judging classifiers: confusion matrix, precision, recall, F1 | d-confusion
@@ About 25 min reading · Handbook chapters 6.1 and 20 · Homework 4, 6, 10 and 18
## Why this matters

Homework 4, 6, 7, 8 and 10 report accuracy; homework 18 asks for accuracy, precision, recall and F1 for every classifier, and you will need them to judge class balancing in week 9. Accuracy alone hides the most important question for medical and churn data: *which* mistakes does the model make? This lesson gives you the vocabulary to answer it.

## The confusion matrix

For a binary problem, call class 1 the **positive** class (the thing you are looking for: disease, churn, fraud) and class 0 the **negative** class. Each prediction falls into one of four cells:

| | Predicted 0 | Predicted 1 |
|---|---|---|
| **Actually 0** | TN: true negative | FP: false positive |
| **Actually 1** | FN: false negative | TP: true positive |

The word "true" or "false" says whether the prediction was right; "positive" or "negative" says what was predicted. A **false positive** is a false alarm (a healthy patient flagged as sick); a **false negative** is a miss (a sick patient sent home). Statistics books call them type I and type II errors.

This is the layout sklearn uses: `confusion_matrix(y_true, y_pred)` returns rows for the true class and columns for the predicted class, in sorted label order, so for 0/1 labels it is `[[TN, FP], [FN, TP]]`. Other sources put the positive class first; always check the labels.

Worked example, 10 patients:

```
y_true = [1, 1, 0, 0, 1, 0, 1, 0, 0, 0]
y_pred = [1, 0, 0, 1, 1, 0, 1, 0, 0, 0]
```

Go row by row: (1,1) TP, (1,0) FN, (0,0) TN, (0,1) FP, (1,1) TP, (0,0) TN, (1,1) TP, then three (0,0) TN. Totals: TP = 3, FN = 1, FP = 1, TN = 5. `confusion_matrix` prints `[[5 1] [1 3]]`.

## The four metrics

$$
accuracy  = (TP + TN) / (TP + TN + FP + FN)
precision = TP / (TP + FP)
recall    = TP / (TP + FN)
F1        = 2 · precision · recall / (precision + recall)
$$

For the example: accuracy = 8/10 = 0.8; precision = 3/4 = 0.75; recall = 3/4 = 0.75; F1 = 0.75.

What each one answers:

- **Accuracy**: what share of all predictions are right?
- **Precision**: when the model says "positive", how often is it right? Low precision means many false alarms.
- **Recall** (also called **sensitivity** or the true positive rate): of all actual positives, how many did the model find? Low recall means many misses.
- **F1**: the **harmonic mean** of precision and recall. Unlike the ordinary average, it is dragged down by whichever is smaller: precision 1.0 with recall 0.1 averages to 0.55 but gives F1 ≈ 0.18. A high F1 needs both to be decent.

A fifth number appears in medicine: **specificity** = TN / (TN + FP), the share of actual negatives correctly cleared.

A memory aid: **pre**cision is about the **pre**dicted positives (the column), **re**call about the **re**al positives (the row).

## Why accuracy can lie

Suppose 95% of customers do not churn. A "model" that always predicts "no churn" scores 95% accuracy, catches zero churners, and is useless. Its recall is 0 and its precision undefined (it never predicts positive; sklearn reports 0 with a warning). On **imbalanced** data, always look at recall, precision and F1 for the minority class, and compare accuracy with the **baseline** of always predicting the majority class: `y_test.value_counts(normalize=True).max()`. Telco churn is about 73% "No", so a churn model with 76% accuracy is barely better than guessing "No". Week 9's class balancing exists because of this.

## Precision and recall trade off through the threshold

Logistic regression gives probabilities; the threshold decides labels. Lowering the threshold predicts "positive" more often: more TP and more FP, fewer FN. So **recall goes up and precision usually goes down**. Raising it does the opposite.

Same 10 patients, with these predicted probabilities:

```
p = [0.9, 0.4, 0.2, 0.6, 0.8, 0.1, 0.55, 0.3, 0.05, 0.35]
```

At threshold 0.5 you get exactly the predictions above: precision 0.75, recall 0.75. At threshold 0.3 the predictions become `[1, 1, 0, 1, 1, 0, 1, 1, 0, 1]`: all four sick patients are found (recall 1.0) but 3 healthy ones are flagged too (precision 4/7 ≈ 0.571), and F1 drops slightly to 0.727.

Which to prefer is a business decision, not a statistical one:

- **Recall first** when misses are costly: disease screening, fraud detection, churn prevention when a retention offer is cheap.
- **Precision first** when false alarms are costly: spam filtering (a lost real email is bad), recommending an expensive intervention.
- **F1** when both matter and the classes are imbalanced.

Write which you chose and why in your homework conclusions; that is what "interpret the results" means.

## ROC curve and AUC, briefly

Sweep the threshold from 1 to 0 and plot the true positive rate (recall) against the false positive rate FP/(FP + TN) at each step: that is the **ROC curve**. The area under it, **AUC**, summarises ranking quality in one number: 0.5 is random guessing, 1.0 is perfect, and it does not depend on any single threshold. `roc_auc_score(y_true, proba[:, 1])` needs probabilities, not labels.

## In scikit-learn

```
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report)
y_pred = clf.predict(X_test)
accuracy_score(y_test, y_pred)
precision_score(y_test, y_pred)          # positive class = 1 by default
recall_score(y_test, y_pred)
f1_score(y_test, y_pred)
confusion_matrix(y_test, y_pred)
print(classification_report(y_test, y_pred))
```

`classification_report` prints precision, recall, F1 and **support** (the number of true samples) for each class, plus averages. For more than two classes, `precision_score` and friends need `average=`: `'macro'` averages the per-class scores equally (good for checking minority classes), `'weighted'` weights them by support, `'micro'` pools all counts (equal to accuracy for single-label problems).

Homework 18's table is easiest as a list of dicts:

```
rows = []
for name, model in models.items():
    p = model.fit(X_train, y_train).predict(X_test)
    rows.append({'Estimator': name, 'Accuracy': accuracy_score(y_test, p),
                 'Precision': precision_score(y_test, p), 'Recall': recall_score(y_test, p),
                 'F1-Score': f1_score(y_test, p)})
pd.DataFrame(rows)
```

## Choosing the metric from the cost of mistakes

Before training, decide which mistake hurts more, because that decides the metric. When a missed positive is expensive (a sick patient sent home, a fraud let through), optimise **recall** and accept more false alarms. When acting on a positive is expensive (a costly retention offer, a manual investigation), optimise **precision**. When both matter, use **F1**, or **average precision** when you want to judge the ranking independently of any threshold. Write the choice down in your notebook's first cell; homework conclusions are graded partly on whether the metric fits the problem.

One trap with the functions themselves: every sklearn metric takes `(y_true, y_pred)` in that order. Swapping them leaves accuracy and F1 unchanged but silently exchanges precision and recall, since false positives and false negatives trade places.

## Common mistakes

> **Swapping arguments.** `precision_score(y_pred, y_test)` silently returns the recall. Always (true, predicted).

> **Text labels.** With labels 'Yes'/'No', pass `pos_label='Yes'`, or map to 1/0 first.

> **Reporting precision or recall without saying which class.** In a report, say "recall for churners".

## Summary

The confusion matrix counts TN, FP, FN, TP (sklearn layout `[[TN, FP], [FN, TP]]`). Accuracy = correct/all; precision = TP/(TP+FP), about predicted positives; recall = TP/(TP+FN), about real positives; F1 is their harmonic mean. Accuracy misleads on imbalanced data, so compare with the majority-class baseline. Lowering the threshold raises recall and lowers precision; choose based on which error costs more.

--- practice
@predict
y_true = [1, 1, 0, 0, 1, 0, 1, 0, 0, 0], y_pred = [1, 0, 0, 1, 1, 0, 1, 0, 0, 0]. How many false positives are there?
```python
yt = [1, 1, 0, 0, 1, 0, 1, 0, 0, 0]; yp = [1, 0, 0, 1, 1, 0, 1, 0, 0, 0]
print(sum(1 for t, p in zip(yt, yp) if t == 0 and p == 1))
```
= 1
! Only position 3 is a true 0 predicted as 1.

@predict
A model has TP = 30, FP = 10, FN = 20, TN = 140. What is its recall? Type a decimal.
```python
print(30 / (30 + 20))
```
= 0.6
! Recall = TP/(TP + FN) = 30/50. Its precision is 30/40 = 0.75, and accuracy 170/200 = 0.85.

@choice
95% of test customers do not churn. Model A always predicts "no churn". Model B has 90% accuracy and recall 0.7 for churners. Which statement is right?
- A is better because its accuracy is higher
* B is more useful: A finds no churners at all (recall 0), its 95% is just the majority-class baseline
- They are equally good
- Neither can be judged without the R² score
! On imbalanced data, accuracy should be compared with the majority baseline and backed by recall and precision for the minority class.

@choice
You lower a classifier's threshold from 0.5 to 0.3. What usually happens?
* Recall goes up and precision goes down
- Precision goes up and recall goes down
- Both go up
- Accuracy always goes up
! More samples are called positive: more true positives are caught (fewer misses) but more false alarms appear.

@run
Write `metrics_at(y_true, probs, t)` that applies threshold t (predict 1 when p ≥ t) and returns `(precision, recall, f1)` rounded to 3 decimals, using 0 when a denominator is 0.
```starter
def metrics_at(y_true, probs, t):
    pass
```
```test
y = [1, 1, 0, 0, 1, 0, 1, 0, 0, 0]
p = [0.9, 0.4, 0.2, 0.6, 0.8, 0.1, 0.55, 0.3, 0.05, 0.35]
print(metrics_at(y, p, 0.5))
print(metrics_at(y, p, 0.3))
print(metrics_at(y, p, 0.95))
```
= (0.75, 0.75, 0.75)
= (0.571, 1.0, 0.727)
= (0, 0.0, 0)
```solution
def metrics_at(y_true, probs, t):
    pred = [1 if p >= t else 0 for p in probs]
    tp = sum(1 for a, b in zip(y_true, pred) if a == 1 and b == 1)
    fp = sum(1 for a, b in zip(y_true, pred) if a == 0 and b == 1)
    fn = sum(1 for a, b in zip(y_true, pred) if a == 1 and b == 0)
    prec = tp / (tp + fp) if tp + fp else 0
    rec = tp / (tp + fn) if tp + fn else 0
    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0
    return round(prec, 3), round(rec, 3), round(f1, 3)
```
! At 0.95 the model predicts no positives, so precision is undefined (0 here) and recall is 0. That is the always-negative model again.

@predict
Precision 1.0 and recall 0.1. What is F1, rounded to 3 decimals?
```python
p, r = 1.0, 0.1
print(round(2 * p * r / (p + r), 3))
```
= 0.182
! The harmonic mean is pulled toward the smaller value. The ordinary average would be 0.55, hiding how bad the recall is.

@write
From memory, write the formulas for precision and recall, describe each in one sentence for a heart-disease model, and say which you would prioritise for that model and why.
min: 60
```solution
Precision = TP/(TP + FP): of the patients the model flags as having heart disease, the share who really have it. Recall = TP/(TP + FN): of the patients who really have heart disease, the share the model flags. For screening I would prioritise recall, because a false negative sends a sick patient home without treatment, while a false positive only leads to further tests; so I would lower the threshold to raise recall and accept lower precision, and report F1 alongside.
```
! Check that each sentence names the denominator correctly: predicted positives for precision, real positives for recall.

--- recall
Q: What is sklearn's confusion matrix layout for labels 0/1?
A: [[TN, FP], [FN, TP]]: rows = true class, columns = predicted class.
Q: Write precision, recall and F1.
A: P = TP/(TP+FP), R = TP/(TP+FN), F1 = 2PR/(P+R).
Q: How do you check whether 80% accuracy is any good on an imbalanced dataset?
A: Compare it with the majority-class baseline (share of the most common class) and look at recall/precision for the minority class.
Q: What does lowering the decision threshold do to precision and recall?
A: Recall rises, precision usually falls.
