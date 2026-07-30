import { FastifyInstance } from "fastify";

export function localities(app: FastifyInstance) {
  app.get("/localities", async (req, res) => {
    try {
      const response = await fetch(
        "http://189.126.105.9:5990/api/localities",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      return res.status(response.status).send(data);
    } catch (error) {
      req.log.error(error, "Erro ao acessar o serviço de localidades");

      return res.status(502).send({
        message: "Não foi possível acessar o serviço de localidades",
      });
    }
  });
}
