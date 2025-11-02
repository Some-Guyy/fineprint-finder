# fineprint-finder backend
Contains the backend API server that connects to other services.
## Setup
### Pre-requisites:
- Python 3.12
- Pipenv *(optional)*
### Installation:
In the `backend` folder, run `pip install -r requirements.txt` in your desired python environment. *(Or run `pipenv install` if you are using pipenv)*.
### Environment:
This is where i will add more shit about env stuff
### Running the app:
- For windows 10 (or above): Run the `startup.ps1` script
- For MacOS or gnome-based linux distros (e.g. Ubuntu, Fedora): Run the `startup.sh` script
- For the rest, you will need to run the main and llm servers separately:
    1. Run the main server. Replace \<PORT> with your desired port, default is 9000.

        `uvicorn main:app --host 0.0.0.0 --port <PORT> --reload`
    1. Run the llm server. Replace \<PORT> with your desired port, default is 9001. Ensure it is different from the main server's port.

        `uvicorn analysis:app --host 0.0.0.0 --port <PORT> --reload`
