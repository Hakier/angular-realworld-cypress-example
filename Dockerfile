FROM cypress/base:14.17.6

RUN mkdir /app
WORKDIR /app

copy . /app

RUN npm install
RUN $(npm bin)/cypress verify
RUN ["npm", "run", "cypress:e2e"]
