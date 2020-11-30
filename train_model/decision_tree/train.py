import numpy as np 
import pandas as pd 

#get train data from csv
dataset_train = pd.read_csv('../clean_NaN_category_price_utilities_train.csv')
#get test data from csv 
dataset_test = pd.read_csv('../clean_NaN_category_price_utilities_test.csv')
dataset_test.sort_values(by=['price'], inplace=True)
#fields used in dataset_train and dataset_test
used_fields = ["area", "num_bed", "num_bath", "price", "hospital", "university", "medical_supply", "pharmacy", "school", "college", "cafe", "bus_station", "police", "bank", "marketplace"]
#fields used to train and test
decision_fields = ["area", "num_bed", "num_bath", "hospital", "university", "medical_supply", "pharmacy", "school", "college", "cafe", "bus_station", "police", "bank", "marketplace"]

#dataset_train with used_fields
used_fields_dataset_train = dataset_train[used_fields].dropna()
#dataset_test with used_fields
used_fields_dataset_test = dataset_test[used_fields].dropna()
#input train
X_train = used_fields_dataset_train[decision_fields]
#output train
y_train = used_fields_dataset_train.price
#input test
X_test = used_fields_dataset_test[decision_fields]
#output test
y_test = used_fields_dataset_test.price

from sklearn.tree import DecisionTreeRegressor
decision_tree_regressor = DecisionTreeRegressor()
decision_tree_regressor.fit(X_train, y_train)


y_pred = decision_tree_regressor.predict(X_test)
from sklearn.metrics import mean_squared_error
mse = mean_squared_error(y_test,y_pred)
print('Mean squared error',mse)
rmse = np.sqrt(mse)
print('Root mean squared error',rmse)

predicted_df = pd.DataFrame({ "Predicted": y_pred })
predicted_df.to_csv("decision_tree_predicted_prices.csv", index=False)




