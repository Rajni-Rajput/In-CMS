from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from datetime import datetime

# Initialize SparkSession
spark = SparkSession.builder \
    .appName("DataProcessingInCSV") \
    .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.12:3.0.1") \
    .getOrCreate()

# Set up MongoDB connection details
mongo_ip = "mongodb+srv://demo1:demo1@cluster0.0vgxldr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongo_database = "test"
policy_collection = "policies"
claim_collection = "claims"

# Set up MongoDB options
mongo_options = {
    "uri": mongo_ip,
    "database": mongo_database,
    "readPreference.name": "secondaryPreferred"
}

# Set up the last processed timestamp (You can persist this timestamp)
last_processed_timestamp = "2024-02-21 14:00:00"

# Query the policies collection to retrieve new or updated entries
policy_df = spark.read.format("com.mongodb.spark.sql.DefaultSource") \
    .options(collection=policy_collection, **mongo_options) \
    .load()

# Filter for policies created or updated after the last processed timestamp
updated_policy_df = policy_df.filter(col("createdAt") >= last_processed_timestamp)
updated_policy_df = updated_policy_df.drop("_id")

# Query the claims collection to retrieve new or updated entries
claim_df = spark.read.format("com.mongodb.spark.sql.DefaultSource") \
    .options(collection=claim_collection, **mongo_options) \
    .load()

# Filter for claims created or updated after the last processed timestamp
updated_claim_df = claim_df.filter(col("createdAt") >= last_processed_timestamp)
updated_claim_df = updated_claim_df.drop("_id")

# Update the last processed timestamp to the current time
last_processed_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print("Last Processed Timestamp:", last_processed_timestamp)

# Write the filtered policy DataFrame to a CSV file
updated_policy_df.write.csv("policies.csv", header=True)

# Write the filtered claim DataFrame to a CSV file
updated_claim_df.write.csv("claims.csv", header=True)

# Stop SparkSession
spark.stop()
