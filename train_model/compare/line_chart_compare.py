import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
#actual 
actual = pd.read_csv('./actual_prices.csv')
#predicted linear regression
predicted_linear_regression = pd.read_csv('../linear_regression/linear_regression_predicted_prices.csv')
#predicted decision tree
predicted_decision_tree= pd.read_csv('../decision_tree/decision_tree_predicted_prices.csv')
#predicted linear lasso 
predicted_linear_lasso = pd.read_csv('../linear_lasso/linear_lasso_predicted_prices.csv')

#line y_test
x1 = np.arange(1, 684, 1).tolist()
y1 = actual.Actual
# plotting the line 1 points 
plt.plot(x1, y1, label = "actual prices")

# line y_pred_lr
x2 = np.arange(1, 684, 1).tolist()
y2 = predicted_linear_regression.Predicted
# plotting the line 2 points 
plt.plot(x2, y2, label = "predicted prices by Linear Regression")

# line y_pred_dt
x2 = np.arange(1, 684, 1).tolist()
y2 = predicted_decision_tree.Predicted
# plotting the line 2 points 
plt.plot(x2, y2, label = "predicted prices by Decision Tree")

# line y_pred_ls
x2 = np.arange(1, 684, 1).tolist()
y2 = predicted_linear_lasso.Predicted
# plotting the line 2 points 
plt.plot(x2, y2, label = "predicted prices by Linear Lasso")

plt.xlabel('house no.')
# Set the y axis label of the current axis.
plt.ylabel('prices')

plt.title('Compare actual and predicted price')

plt.legend()

plt.show()