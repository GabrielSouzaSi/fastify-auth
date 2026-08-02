import { FastifyInstance } from "fastify";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "O nome é obrigatório"),
    email: z.string().trim().email("E-mail inválido"),
    phone: z.string().trim().min(1, "O telefone é obrigatório"),
    gender: z.string().trim().min(1, "O gênero é obrigatório"),
    profile_type: z.string(),
    municipality_id: z.number().int().positive(),
    locality_id: z.number().int().positive(),
    community: z.string().trim().min(1, "A comunidade é obrigatória"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    id_device: z.string().trim().min(1, "O identificador do dispositivo é obrigatório"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "As senhas não coincidem",
    path: ["password_confirmation"],
  });

export function register(app: FastifyInstance) {
  app.post("/register", async (req, res) => {
    const parsedBody = registerSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).send({
        message: "Dados de cadastro inválidos",
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    try {
      const response = await fetch("http://189.126.105.9:5990/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(parsedBody.data),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      return res.status(response.status).send(data);
    } catch (error) {
      req.log.error(error, "Erro ao acessar o serviço de cadastro");

      return res.status(502).send({
        message: "Não foi possível acessar o serviço de cadastro",
      });
    }
  });
}
