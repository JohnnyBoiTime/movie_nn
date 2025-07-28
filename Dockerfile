# Pull image which includes python
FROM python:3.12.10-slim

# apt-get update: Refresh packages (advanced packaging tool, debian)
# build-essential: C compiler
RUN apt-get update \ 
    && apt-get install -y --no-install-recommends \
        build-essential \ 
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Any commands such as RUN or COPY will happen within the app folder 
WORKDIR /app

# Copy python modules from requirements.txt
# and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else from the project 
# First dot -> Source (Host)
# Second dot -> Destination (Container's /app)
COPY . .

# Put static assets into folder
RUN python manage.py collectstatic --noinput

# Tell the project where to listen for incoming
# requests
EXPOSE 8000

# Start django app and bind interface to 8000, will change to something
# else later
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "movieRecproj.wsgi:application"]
