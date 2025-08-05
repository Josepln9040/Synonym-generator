import bodyParser from "body-parser";
import express from "express";
import axios from "axios";

var app = express();
var port = 3000;
const config ={
    headers: {
        "x-rapidapi-key": "1cb6323ed1msh4596d65c5392d8ep16a48djsn61db5d3dc8f8",
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
    },
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req,res)=>{
    res.render("index.ejs")
});

app.post("/get-word", async (req, res) => {
  const word = req.body.word;
  try {
    const response = await axios.get(
      `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(word)}/synonyms`,
      config
    );
    const currentSynonyms = response.data.synonyms || [];

    const synonyms = await Promise.all(
      currentSynonyms.map(async (w) => {
        try {
          const descRes = await axios.get(
            `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(w)}/definitions`,
            config
          );
          const definition =
            descRes.data.definitions?.[0]?.definition || "Sin definición disponible";
          return [w, definition];
        } catch (err) {
          console.warn(`Error al obtener definición de "${w}":`, err.message);
          return [w, "Error obteniendo definición"];
        }
      })
    );

    res.render("index.ejs", { synonyms });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.status(500).render("index.ejs", { synonyms: [], error: "No se pudo obtener sinónimos" });
  }
});

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});