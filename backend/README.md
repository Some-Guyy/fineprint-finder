# fineprint-finder backend
Contains the backend API server that connects to other services.
## Setup
### Pre-requisites:
- [Python 3.12](https://www.python.org/downloads/release/python-3120/)
- [Pipenv](https://pipenv.pypa.io/en/latest/) *(optional)*
### Installation:
In the `backend` folder, run `pip install -r requirements.txt` in your desired python environment. *(Or run `pipenv install` if you are using pipenv)*.
### Services:
This prototype utilizes multiple cloud services, significantly helping in handover transition processes for the project by centralizing data. Here are the list of services used and what you'll need to prepare before running the app:
- [MongoDB](https://www.mongodb.com/) account, with collections that need to be created:
    - "regulations"
    - "users"
    - "notifications"
- [AWS](https://console.aws.amazon.com/console/home/) console account, with an S3 bucket set up
- [Langsmith](https://smith.langchain.com/) account
- [OpenAI Platform](https://platform.openai.com/login) account
- Any SMTP service, the one used in the initial build was [Gmail](https://developers.google.com/workspace/gmail/imap/imap-smtp).
### Environment:
A `.env` file is required in this `backend` folder for the app to utilize the cloud services set up earlier. Here are some explanations for some of these variables:
- AWS_DEFAULT_REGION: Example: `ap-southeast-1`. Ensure your region contains your set up services (S3)
- LANGSMITH_TRACING: Accepts `true` or `false`
- SMTP_PASSWORD: If you use Gmail for SMTP, you can create/access your passwords [here](https://myaccount.google.com/apppasswords).

Replace everything in the {{}} including the brackets itself with the appropriate keys/names from your services set up earlier, for example: `DB_USER=some_username`
```
DB_USER={{your_db_username}}
DB_PASS={{your_db_password}}
DB_ENV={{your_db_environment_name}}

AWS_ACCESS_KEY_ID={{your_AWS_access_key}}
AWS_SECRET_ACCESS_KEY={{your_AWS_secret_access_key}}
AWS_DEFAULT_REGION={{your_AWS_default_region_for_services}}

LANGSMITH_TRACING={{true_or_false}}
LANGSMITH_API_KEY={{your_langsmith_api_key}}
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_PROJECT={{your_langsmith_project_name}}

OPENAI_API_KEY={{your_openai_api_key}}

SMTP_USER={{your_smtp_user}}
SMTP_PASSWORD={{your_smtp_password}}
SMTP_SERVER={{your_smtp_server_domain}}
SMTP_PORT={{your_smtp_port}}
```
## Running the app
- For windows 10 (or above): Run the `startup.ps1` script
- For MacOS or gnome-based linux distros (e.g. Ubuntu, Fedora): Run the `startup.sh` script
- For the rest, you will need to run the main and llm servers separately:
    1. Run the main server. Replace \<PORT> with your desired port, default is 9000.

        `uvicorn main:app --host 0.0.0.0 --port <PORT> --reload`
    1. Run the llm server. Replace \<PORT> with your desired port, default is 9001. Ensure it is different from the main server's port.

        `uvicorn analysis:app --host 0.0.0.0 --port <PORT> --reload`
