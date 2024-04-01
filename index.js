const express = require('express');
const cors = require('cors');
const path = require('path');
const jimp = require('jimp');
const fetch = require('node-fetch');
const axios = require('axios');
const { Prodia } = require("prodia.js");
const prodiakey = "cdffa14f-c399-42b6-af90-ad25be1f8ba6"// API KEY HERE
const googlekey = "AIzaSyAY8DjFZHICDZ-TeHNN6lnEFoB-qczmXxE"
global.creator = 'Mr.one | github/onepunya'
const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware untuk CORS
app.use(cors());
//fungsi buffer 
async function bufferlah(hm) {
const imageUrl = hm;
const imagePath = 'gambar.jpg';

const response= await axios({
  method: 'get',
  url: imageUrl,
  responseType: 'arraybuffer'
})
  const buffer = Buffer.from(response.data, 'binary');
  return buffer;   
}

async function Resize(buffer) {
    var oyy = await jimp.read(buffer);
    var kiyomasa = await oyy.resize(512, 512).getBufferAsync(jimp.MIME_JPEG)
    return kiyomasa
}

//fungsi VOICEVOX
async function vox(text, speaker) {
const key = 'U282o-0-04r-x_O'
const urlnya = `https://deprecatedapis.tts.quest/v2/voicevox/audio/?key=${key}&speaker=${speaker}&pitch=0&intonationScale=1&speed=1&text=${encodeURIComponent(text)}`
let buf = bufferlah(urlnya)
return buf;
}
//fungsi Speaker VOICEVOX
async function spe() {
const urlnya = await axios.get(`https://deprecatedapis.tts.quest/v2/voicevox/speakers/?key=R_m8Q8e8s2r808k`) 

return urlnya.data;
} 
//fungsi gemini
async function ask(inputText) {
  // For text-only input, use the gemini-pro model
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + googlekey;
const headers = {
    'Content-Type': 'application/json'
};
const data = {
    contents: [{
        parts: [{
            text: inputText
        }]
    }]
};

const response = await axios.post(url, data, { headers })
        console.log(response.data.candidates[0].content.parts[0].text);
    return response.data.candidates[0].content.parts[0].text;
    }
    
// image input gemini vision
async function askImage(inputTextt, inputImage) {
const bufer = await bufferlah(inputImage)
const bup = await Resize(bufer)
    const requestBody = {
        "contents": [
            {
                "parts": [
                    {"text": inputTextt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": bup.toString('base64')
                        }
                    }
                ]
            }
        ]
    };
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${googlekey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    console.log(data);
    return data.candidates[0].content.parts[0].text;
}

//fungsi untuk prodia
async function pprodia(message) {
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
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/end', (req, res) => {
  res.sendFile(path.join(__dirname, 'endpoint.html'));
});

// Endpoint untuk prodia
app.get('/api/prodia', async (req, res) => {
  try {
    const message = req.query.prompt;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "prompt" tidak ditemukan' });
    }
    const image = await pprodia(message);
    res.status(200).json({
      status: 200,
      creator: global.creator,
      data: { image, 
      info: "untuk mengambil hasil gambar mohon tunggu dulu selama 5/10detik, kalau tidak hasil akan eror!"}, 

    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//endpoint gemini
app.get('/api/gemini', async (req, res) => {
  try {
    const message = req.query.text;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const data = await ask(message);
    res.status(200).json({
      status: 200,
      creator: global.creator,
      result: { 
         data
              }, 

    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// endpoint gemini-image
app.get('/api/gemini-vision', async (req, res) => {
  try {
    const gambar = req.query.url
    const message = req.query.text;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    if (!gambar) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan pastikan url gambar ada pada endpoint' });
 }
    const data = await askImage(message, gambar);
    res.status(200).json({
      status: 200,
      creator: global.creator,
      result: {
           data 
              }, 

    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//endpoint VOIXEVOX 
app.get('/api/voicevox-synthesis', async (req, res) => {
  try {
    const speakerr = req.query.speaker
    const message = req.query.text;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    if (!speakerr) {
      return res.status(400).json({ error: 'Parameter "speaker" tidak ditemukan pastikan susunan endpoint nya sudah benar' });
 }
    const data = await vox(message, speakerr);
        res.set('Content-Type', "audio/mpeg");
        res.send(data);
      } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/voicevox-speaker', async (req, res) => {
try {
    const data = await spe();
      res.status(200).json({
      status: 200,
      creator: global.creator,
      info: "gunakan id nya! contoh {speaker=30} di endpoint voicevox-synthesis", 
      result: {
           data 
              }, 
    });

      } catch (error) {
    res.status(500).json({ error: "server eror" });
  }
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
