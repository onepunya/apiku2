const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { Prodia } = require("prodia.js");
const prodiakey = "cdffa14f-c399-42b6-af90-ad25be1f8ba6"// API KEY HERE
global.creator = 'Mr.one | github/onepunya'
const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware untuk CORS
app.use(cors());

//fungsi untuk imagine
async function imagine(message) {
const prodia = new Prodia(prodiakey);
        const generate = await prodia.generateImage({
            prompt: message,
            model: "majicmixRealistic_v4.safetensors [29d0de58]",
            negative_prompt: "BadDream, (UnrealisticDream:1.3)",
            sampler: "DPM++ SDE Karras",
            cfg_scale: 9,
            steps: 30,
            aspect_ratio: "portrait"
        });
        
        let toy = `https://images.prodia.xyz/${generate.job}.png`;
        
       return toy;
          };

// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'interface.html'));
});
app.get('/doc', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk imagine
app.get('/api/imagine', async (req, res) => {
  try {
    const message = req.query.prompt;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "prompt" tidak ditemukan' });
    }
    const response = await imagine(message);
    res.status(200).json({
      status: 200,
      creator: global.creator,
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
