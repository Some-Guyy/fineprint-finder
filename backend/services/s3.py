import boto3
import os

s3 = boto3.client("s3")
bucket = os.getenv("S3_BUCKET", "fypwhere")
