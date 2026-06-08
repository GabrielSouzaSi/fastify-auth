import { FastifyInstance } from "fastify";

export function myOffers(app: FastifyInstance) {
  app.post("/my/offers", async (req, res) => {
    const response = await fetch("http://189.126.105.9:5990/api/my/offers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 25|FiVpHwkkwx4MhSrS5zSQ1XFVUMoFg66klXV8ZhkE8dcc5949`,
      },
    });

    if (!response.ok) {
      return res.status(401).send({
        message: "Algo deu errado",
      });
    }

    const data = await response.json();

    return {
      data,
    };
  });
}
