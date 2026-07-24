// src/server.ts

import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import websocket from "@fastify/websocket";

import { createUser } from "./routes/createUser";
import { login } from "./routes/login";
import { profile } from "./routes/profile";
import { loginAcai } from "./routes/loginAcai";
import { myOffers } from "./routes/myOffers";
import { offers } from "./routes/offers";
import { register } from "./routes/register";

const app = fastify({
  logger: true,
});

app.register(fastifyCors, {
  origin: "*",
});

app.register(fastifyJwt, {
  secret: "secret",
});

app.register(websocket);

app.register(createUser);
app.register(login);
app.register(loginAcai);
app.register(profile);
app.register(myOffers);
app.register(offers);
app.register(register);

const clients = new Set<any>();

app.register(async function chatRoutes(app) {
  app.get("/chat", { websocket: true }, (socket) => {
    app.log.info("Cliente conectado no chat");

    clients.add(socket);

    socket.send(
      JSON.stringify({
        type: "connected",
        message: "Conectado ao chat",
      }),
    );

    socket.on("message", (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        const payload = {
          type: "message",
          text: data.text,
          from: data.from ?? "Usuário",
          createdAt: new Date().toISOString(),
        };

        for (const client of clients) {
          if (client.readyState === 1) {
            client.send(JSON.stringify(payload));
          }
        }
      } catch (error) {
        app.log.error(error);
      }
    });

    socket.on("close", () => {
      clients.delete(socket);
      app.log.info("Cliente saiu do chat");
    });
  });
});

app.get("/", () => {
  return "Ok";
});

app.get("/acai", async () => {
  const response = await fetch("http://189.126.105.9", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return {
      message: "Algo deu errado",
    };
  }

  return "Ok";
});

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then((address) => {
    console.log("🚀 HTTP Server Running!", address);
  })
  .catch((error) => {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  });
