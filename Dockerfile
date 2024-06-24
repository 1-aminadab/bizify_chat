FROM node:alpine3.18

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm install

ENV pulsar="pulsar://196.188.120.21:30900" \
    mongoDB="mongodb+srv://Natnael:e840qPAaOMYxgeSC@cluster0.vs0kmkg.mongodb.net/chat-admin?retryWrites=true&w=majority&appName=Cluster0" \
    serverUrl="https://chat-admin.addispay.et/" \ 
    secretJWT="secret_key"

EXPOSE 4002

CMD [ "node", "app.js" ]