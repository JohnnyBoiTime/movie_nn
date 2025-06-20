FROM python:3.12.10-slim

# apt-get update: Refresh packages
# build-essential: gives python packages what they need
RUN apt-get update \ 
    && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Any commands such as RUN or COPY will happen within the app folder in the
# container
WORKDIR /app

# Copy python modules from requirements.txt
# and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else from the project 
COPY . .

# Start up the project
RUN python manage.py collectstatic --noinput

# Tell the project where to listen for incoming
# requests
EXPOSE 8000

# Start django app and bind interface to 8000, will change to something
# else later
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
