import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { verifyPassword } from "../utils/hash";

export function loginAcai(app: FastifyInstance) {
  const loginUserSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  app.post("/login/acai", async (req, res) => {
    const { email, password } = loginUserSchema.parse(req.body);

    const response = await fetch("http://189.126.105.9:5990/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      return res.status(401).send({
        message: "Credenciais inválidas",
      });
    }

    const data = await response.json();

    return data;
  });
}
