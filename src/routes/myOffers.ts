import { FastifyInstance } from "fastify";

export function myOffers(app: FastifyInstance) {
  app.get("/my/offers", async (req, res) => {
    console.log(req.headers.authorization?.split(" ")[1]);

    const response = await fetch("http://189.126.105.9:5990/api/my/offers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.headers.authorization?.split(" ")[1]}`,
      },
    });

    if (!response.ok) {
      return res.status(401).send({
        message: "Alguma coisa deu errado",
      });
    }

    const data = await response.json();

    return {
      data,
    };
  });
}
