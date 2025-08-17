import numpy as np
import matplotlib.pyplot as plt

# Use seaborn style for better looking plots
plt.style.use('seaborn-v0_8')

# Training data (size in 1000 sqft, price in 1000s of dollars)
x_train = np.array([1.0, 2.0])
y_train = np.array([300.0, 500.0])

# Print training data
print(f"x_train = {x_train}")
print(f"y_train = {y_train}")

# Number of training examples
m = len(x_train)
print(f"Number of training examples is: {m}")

# Show first training example
i = 0
x_i = x_train[i]
y_i = y_train[i]
print(f"(x^({i}), y^({i})) = ({x_i}, {y_i})")

# Plot the training data
plt.scatter(x_train, y_train, marker='x', c='r')
plt.title("Housing Prices")
plt.ylabel('Price (in 1000s of dollars)')
plt.xlabel('Size (1000 sqft)')
plt.show()

# Model parameters (initial guess)
w = 100
b = 100
print(f"w: {w}")
print(f"b: {b}")

# Function to compute model output
def compute_model_output(x, w, b):
    """
    Computes the prediction of a linear model
    Args:
      x (ndarray (m,)): Data, m examples 
      w, b (scalar): model parameters  
    Returns:
      f_wb (ndarray (m,)): model prediction
    """
    m = x.shape[0]
    f_wb = np.zeros(m)
    for i in range(m):
        f_wb[i] = w * x[i] + b
    return f_wb

# Compute predictions
tmp_f_wb = compute_model_output(x_train, w, b)

# Plot model predictions and actual data
plt.plot(x_train, tmp_f_wb, c='b', label='Our Prediction')
plt.scatter(x_train, y_train, marker='x', c='r', label='Actual Values')
plt.title("Housing Prices")
plt.ylabel('Price (in 1000s of dollars)')
plt.xlabel('Size (1000 sqft)')
plt.legend()
plt.show()


