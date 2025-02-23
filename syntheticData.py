from faker import Faker
import random
import pandas as pd

fake = Faker()

def generate_synthetic_calls(num_calls=3000, filename="synthetic_calls.csv"):
    data = []

    for _ in range(num_calls):
        name = fake.name()
        phone_number = fake.numerify("(###) ###-####")

        # Skewed Response Description
        response_weights = [0.5, 0.2, 0.1, 0.15, 0.05]
        response_description = random.choices([
            "Hung up immediately",
            "Asked questions but didn't share info",
            "Shared sensitive information",
            "Was skeptical but continued conversation",
            "Ignored the call"
        ], weights=response_weights, k=1)[0]

        gave_information = response_description == "Shared sensitive information"

        # Skewed Call Length (Gaussian distribution)
        call_length = round(random.gauss(30, 10), 2)
        call_length = max(call_length, 5)  # Ensure it's at least 5 seconds
        call_length = min(call_length, 300)  # Ensure it's not more than 300 seconds

        # Skewed Phishing Scenario Frequency
        phishing_scenario_weights = [0.5, 0.3, 0.15, 0.05]
        phishing_scenario = random.choices([
            "Bank Fraud",
            "Tech Support Scam",
            "IRS/Tax Scam",
            "Prize Scam"
        ], weights=phishing_scenario_weights, k=1)[0]

        data.append({
            "Name": name,
            "Phone Number": phone_number,
            "Response Description": response_description,
            "Gave Information": gave_information,
            "Call Length (s)": call_length,
            "Phishing Scenario": phishing_scenario
        })

    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)
    print(f"Dataset saved as {filename}")

    return df

df = generate_synthetic_calls(3000, "synthetic_calls_scenarios.csv")
print(df.head())