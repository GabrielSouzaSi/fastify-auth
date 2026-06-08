import fastify from "fastify";
import fastifyJwt from "fastify-jwt";
import fastifyCors from "@fastify/cors";

import { createUser } from "./routes/createUser";
import { login } from "./routes/login";
import { profile } from "./routes/profile";
import { loginAcai } from "./routes/loginAcai";

const app = fastify();

app.register(fastifyCors);

app.register(createUser);
app.register(login);
app.register(loginAcai);
app.register(profile);
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
  const data = await response.json();
  return data;
});

app.register(fastifyJwt, {
  secret: "secret",
});

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log("🚀 HTTP Server Running!");
  });
