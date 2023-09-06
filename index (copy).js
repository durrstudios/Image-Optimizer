const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;





const Imagequality = 100; // 0 - 100 image quality

const folder = 'images' //image output folder



app.use(express.static('public'));



const imagesDirectory = path.join(__dirname, 'images');

app.get('/images', (req, res) => {
  fs.readdir(imagesDirectory, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const webpFiles = files.filter(file => path.extname(file).toLowerCase() === '.webp');
    const imageList = webpFiles.map(file => `<li><a href="/images/${file}">${file}</a></li>`).join('');
    const html = `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebP Images Directory</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body>
  <div class="container">
    <h1 class="mt-4">WebP Images Directory <a href="https://chrome.google.com/webstore/detail/simple-mass-downloader/abdkkegmcbiomijcbdaodaflgehfffed/related" target="_blank">Image Downloader</a></h1>
    <ul class="list-group mt-4">
      ${imageList}
    </ul>
  </div>
</body>
</html>

    `;
    
    res.send(html);
  });
});

app.use('/images', express.static(imagesDirectory));





const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload/single', upload.single('image'), handleImageConversion);
app.post('/upload/folder', upload.array('images'), handleFolderConversion);

function handleImageConversion(req, res) {
    const inputImageBuffer = req.file.buffer;
    const originalFileName = req.file.originalname;
    const outputFileName = `${path.parse(originalFileName).name}.webp`;
    const outputImagePath = path.join(__dirname, folder, outputFileName);

    convertAndSaveImage(inputImageBuffer, outputImagePath, originalFileName, res);
}

function handleFolderConversion(req, res) {
    const images = req.files;

    images.forEach((image, index) => {
        const inputImageBuffer = image.buffer;
        const originalFileName = image.originalname;
        const outputFileName = `${path.parse(originalFileName).name}.webp`;
        const outputImagePath = path.join(__dirname, folder, outputFileName);

        convertAndSaveImage(inputImageBuffer, outputImagePath, originalFileName, res, index === images.length - 1);
    });
}

function convertAndSaveImage(inputImageBuffer, outputImagePath, originalFileName, res, isLast = true) {
    sharp(inputImageBuffer)
        .webp({ 
			
			
			
			quality: 80    //out of 100
			  
			  
			  })
        .toFile(outputImagePath, (err, info) => {
            if (err) {
                console.error(`Error converting image ${originalFileName}:`, err);
            } else {
                console.log(`Image ${originalFileName} converted to WebP:`, info);
            }

            if (isLast) {
				console.log('Finished Converting Images!');
                res.redirect('/');
				
            }
        });
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
