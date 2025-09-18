import boto3
import os

s3_client = boto3.client("s3")
s3_bucket = os.getenv("S3_BUCKET", "fypwhere")
