import { FastifyInstance } from "fastify";
import { z } from "zod";

export function loginAcai(app: FastifyInstance) {
  const loginUserSchema = z
    .object({
      identifier: z.string().trim().optional(),
      email: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      password: z.string().min(1, "A senha é obrigatória"),
    })
    .transform((data, context) => {
      const identifier = data.identifier || data.email || data.phone;

      if (!identifier) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um e-mail ou telefone",
          path: ["identifier"],
        });
        return z.NEVER;
      }

      const isEmail = identifier.includes("@");
      const normalizedIdentifier = isEmail
        ? identifier.toLowerCase()
        : identifier.replace(/\D/g, "");

      if (!normalizedIdentifier) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "E-mail ou telefone inválido",
          path: ["identifier"],
        });
        return z.NEVER;
      }

      return {
        ...(isEmail
          ? { email: normalizedIdentifier }
          : { phone: normalizedIdentifier }),
        password: data.password,
      };
    });

  app.post("/login/acai", async (req, res) => {
    const parsedBody = loginUserSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).send({
        message: "Dados de login inválidos",
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const response = await fetch("http://189.126.105.9:5990/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedBody.data),
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
