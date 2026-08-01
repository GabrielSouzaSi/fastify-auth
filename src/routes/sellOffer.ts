import { FastifyInstance } from "fastify";
import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD");

const sellOfferSchema = z.object({
  municipality_id: z.number().int().positive(),
  property_id: z.number().int().positive(),
  production_area_id: z.number().int().positive(),
  price: z.number().positive(),
  volume: z.number().positive(),
  unit: z.string().trim().min(1, "A unidade é obrigatória"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  offer_date: dateSchema,
  expires_at: z.union([dateSchema, z.literal("")]),
});

export function sellOffer(app: FastifyInstance) {
  app.post("/offers/sell", async (req, res) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).send({
        message: "Token de autenticação não informado",
      });
    }

    const parsedBody = sellOfferSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).send({
        message: "Dados da oferta inválidos",
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    try {
      const response = await fetch(
        "http://189.126.105.9:5990/api/offers/sell",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization,
          },
          body: JSON.stringify(parsedBody.data),
        },
      );

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      return res.status(response.status).send(data);
    } catch (error) {
      req.log.error(error, "Erro ao acessar o serviço de ofertas de venda");

      return res.status(502).send({
        message: "Não foi possível acessar o serviço de ofertas de venda",
      });
    }
  });
}
